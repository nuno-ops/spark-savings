import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { triageOpportunity } from "@/lib/triage";
import { STAGE1_PRICES } from "@/lib/constants";

// GET /api/opportunities — list published opportunities (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const priceTier = searchParams.get("priceTier"); // "250" or "500"
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "published" };
  if (category && category !== "all") where.category = category;
  if (priceTier) where.stage1Price = parseInt(priceTier);

  // Text search across title, brief, and company
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term } },
      { brief: { contains: term } },
      { company: { contains: term } },
    ];
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    select: {
      id: true,
      title: true,
      brief: true,
      company: true,
      category: true,
      stage1Price: true,
      stage2Price: true,
      confidenceScore: true,
      createdAt: true,
      contributor: { select: { name: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute avgRating and reviewCount for each opportunity
  const result = opportunities.map((opp) => {
    const ratings = opp.reviews.map((r) => r.rating);
    const reviewCount = ratings.length;
    const avgRating =
      reviewCount > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / reviewCount) * 10) /
          10
        : 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reviews, ...rest } = opp;
    return { ...rest, avgRating, reviewCount };
  });

  return NextResponse.json(result);
}

// POST /api/opportunities — create a new opportunity (contributor only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "contributor") {
    return NextResponse.json(
      { error: "Only contributors can create opportunities" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const {
    title,
    brief,
    company,
    category,
    stage1Price,
    validationChecklist,
    requirements,
    highLevelApproach,
    fullPlaybook,
    templates,
    stage2Price,
    savingsEstimateLow,
    savingsEstimateHigh,
  } = body;

  if (
    !title ||
    !brief ||
    !company ||
    !validationChecklist ||
    !requirements ||
    !highLevelApproach ||
    !fullPlaybook ||
    !templates ||
    !savingsEstimateLow ||
    !savingsEstimateHigh ||
    !stage2Price
  ) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (stage1Price && !STAGE1_PRICES.includes(stage1Price)) {
    return NextResponse.json(
      { error: "Stage 1 price must be €250 or €500" },
      { status: 400 }
    );
  }

  // Run AI triage
  const allText = [
    title,
    brief,
    validationChecklist,
    requirements,
    highLevelApproach,
    fullPlaybook,
    templates,
  ]
    .filter(Boolean)
    .join(" ");

  const triage = await triageOpportunity(title, brief, allText);

  const status = triage.flagReason ? "flagged" : "draft";

  const opportunity = await prisma.opportunity.create({
    data: {
      contributorId: session.user.id,
      title,
      brief,
      company,
      category: category || "general",
      stage1Price: stage1Price || 250,
      validationChecklist,
      requirements,
      highLevelApproach,
      fullPlaybook,
      templates,
      stage2Price,
      savingsEstimateLow,
      savingsEstimateHigh,
      status,
      confidenceScore: triage.confidenceScore,
      duplicateOfId: triage.duplicateOfId,
      piiDetected: triage.piiDetected,
      flagReason: triage.flagReason,
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
