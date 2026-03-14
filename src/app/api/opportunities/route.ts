import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { triageOpportunity } from "@/lib/triage";
import { companyMatchScore, MATCH_THRESHOLD } from "@/lib/company-match";
import { STAGE1_PRICES, CATEGORIES } from "@/lib/constants";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import {
  isValidString,
  isValidInt,
  sanitizeText,
  MAX_LENGTHS,
} from "@/lib/validation";

// GET /api/opportunities — list published opportunities (public)
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`opp-list:${ip}`, RATE_LIMITS.read);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const priceTier = searchParams.get("priceTier");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "published" };

  if (category && category !== "all") {
    if (CATEGORIES.includes(category as typeof CATEGORIES[number])) {
      where.category = category;
    }
  }

  if (priceTier) {
    const price = parseInt(priceTier);
    if (STAGE1_PRICES.includes(price as typeof STAGE1_PRICES[number])) {
      where.stage1Price = price;
    }
  }

  // Text search — limit length to prevent abuse
  if (search && search.trim()) {
    const term = search.trim().slice(0, MAX_LENGTHS.search);
    where.OR = [
      { title: { contains: term } },
      { brief: { contains: term } },
      { company: { contains: term } },
    ];
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    take: 100, // Pagination limit
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

  // Check if caller is a company user with a companyName for matching
  const session = await getServerSession(authOptions);
  const userCompanyName =
    session?.user?.role === "company" ? session.user.companyName : undefined;

  const result = opportunities.map((opp) => {
    const ratings = opp.reviews.map((r) => r.rating);
    const reviewCount = ratings.length;
    const avgRating =
      reviewCount > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / reviewCount) * 10) / 10
        : 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reviews, contributor, ...rest } = opp;
    // Anonymize contributor in public listings — identity revealed after Stage 2
    return {
      ...rest,
      contributor: { name: "Expert Contributor" },
      avgRating,
      reviewCount,
      matchesCompany: userCompanyName
        ? companyMatchScore(opp.company, userCompanyName) >= MATCH_THRESHOLD
        : false,
    };
  });

  // Sort matched opportunities first, preserve createdAt order within groups
  if (userCompanyName) {
    result.sort((a, b) => {
      if (a.matchesCompany && !b.matchesCompany) return -1;
      if (!a.matchesCompany && b.matchesCompany) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return NextResponse.json(result);
}

// POST /api/opportunities — create a new opportunity (contributor only)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`opp-create:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

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
    title, brief, company, category, stage1Price,
    validationChecklist, requirements, highLevelApproach,
    fullPlaybook, templates, stage2Price,
    savingsEstimateLow, savingsEstimateHigh,
  } = body;

  // Required field checks
  if (!title || !brief || !company || !validationChecklist ||
      !requirements || !highLevelApproach || !fullPlaybook ||
      !templates || !savingsEstimateLow || !savingsEstimateHigh || !stage2Price) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Length and format validation
  if (!isValidString(title, { min: 1, max: MAX_LENGTHS.title }))
    return NextResponse.json({ error: `Title must be 1-${MAX_LENGTHS.title} chars` }, { status: 400 });
  if (!isValidString(brief, { min: 1, max: MAX_LENGTHS.brief }))
    return NextResponse.json({ error: `Brief must be 1-${MAX_LENGTHS.brief} chars` }, { status: 400 });
  if (!isValidString(company, { min: 1, max: MAX_LENGTHS.company }))
    return NextResponse.json({ error: `Company must be 1-${MAX_LENGTHS.company} chars` }, { status: 400 });

  for (const [name, val] of Object.entries({ validationChecklist, requirements, highLevelApproach, fullPlaybook, templates })) {
    if (!isValidString(val, { min: 1, max: MAX_LENGTHS.markdown }))
      return NextResponse.json({ error: `${name} exceeds max length` }, { status: 400 });
  }

  if (!isValidInt(stage2Price, { min: 1, max: 10000000 }))
    return NextResponse.json({ error: "Invalid stage 2 price" }, { status: 400 });
  if (!isValidInt(savingsEstimateLow, { min: 0, max: 10000000 }))
    return NextResponse.json({ error: "Invalid savings estimate" }, { status: 400 });
  if (!isValidInt(savingsEstimateHigh, { min: 0, max: 10000000 }))
    return NextResponse.json({ error: "Invalid savings estimate" }, { status: 400 });

  if (stage1Price && !STAGE1_PRICES.includes(stage1Price)) {
    return NextResponse.json({ error: "Stage 1 price must be €250 or €500" }, { status: 400 });
  }

  if (category && !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Sanitize text fields
  const sanitized = {
    title: sanitizeText(title),
    brief: sanitizeText(brief),
    company: sanitizeText(company),
    validationChecklist: sanitizeText(validationChecklist),
    requirements: sanitizeText(requirements),
    highLevelApproach: sanitizeText(highLevelApproach),
    fullPlaybook: sanitizeText(fullPlaybook),
    templates: sanitizeText(templates),
  };

  // Run AI triage
  const allText = Object.values(sanitized).filter(Boolean).join(" ");
  const triage = await triageOpportunity(sanitized.title, sanitized.brief, allText);
  const status = triage.flagReason ? "flagged" : "draft";

  const opportunity = await prisma.opportunity.create({
    data: {
      contributorId: session.user.id,
      ...sanitized,
      category: category || "general",
      stage1Price: stage1Price || 250,
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
