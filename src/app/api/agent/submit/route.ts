import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { triageOpportunity } from "@/lib/triage";
import bcrypt from "bcryptjs";

// POST /api/agent/submit — AI agent submits opportunity on behalf of a contributor
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "API key required in Authorization header" },
      { status: 401 }
    );
  }

  const rawKey = authHeader.substring(7);

  // Find matching API key by checking prefix first, then verifying hash
  const prefix = rawKey.substring(0, 12);
  const candidates = await prisma.apiKey.findMany({
    where: { keyPrefix: prefix, revoked: false },
    include: { user: true },
  });

  let matchedUser = null;
  for (const candidate of candidates) {
    if (await bcrypt.compare(rawKey, candidate.keyHash)) {
      matchedUser = candidate.user;
      break;
    }
  }

  if (!matchedUser) {
    return NextResponse.json(
      { error: "Invalid or revoked API key" },
      { status: 401 }
    );
  }

  if (matchedUser.role !== "contributor") {
    return NextResponse.json(
      { error: "API key owner must be a contributor" },
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
      { error: "title and brief are required" },
      { status: 400 }
    );
  }

  // Run triage
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
      contributorId: matchedUser.id,
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
      submittedViaApi: true,
    },
  });

  return NextResponse.json(
    {
      id: opportunity.id,
      status: opportunity.status,
      confidenceScore: opportunity.confidenceScore,
      flagReason: opportunity.flagReason,
    },
    { status: 201 }
  );
}
