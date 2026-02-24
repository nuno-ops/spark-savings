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

  const where: Record<string, unknown> = { status: "published" };
  if (category && category !== "all") where.category = category;
  if (priceTier) where.stage1Price = parseInt(priceTier);

  const opportunities = await prisma.opportunity.findMany({
    where,
    select: {
      id: true,
      title: true,
      brief: true,
      category: true,
      stage1Price: true,
      stage2Price: true,
      confidenceScore: true,
      createdAt: true,
      contributor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(opportunities);
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

  if (!title || !brief) {
    return NextResponse.json(
      { error: "Title and brief are required" },
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
      category: category || "general",
      stage1Price: stage1Price || 250,
      validationChecklist: validationChecklist || "",
      requirements: requirements || "",
      highLevelApproach: highLevelApproach || "",
      fullPlaybook: fullPlaybook || "",
      templates: templates || "",
      stage2Price: stage2Price || 0,
      savingsEstimateLow: savingsEstimateLow || 0,
      savingsEstimateHigh: savingsEstimateHigh || 0,
      status,
      confidenceScore: triage.confidenceScore,
      duplicateOfId: triage.duplicateOfId,
      piiDetected: triage.piiDetected,
      flagReason: triage.flagReason,
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
