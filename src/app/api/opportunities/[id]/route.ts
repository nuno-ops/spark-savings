import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { triageOpportunity } from "@/lib/triage";

// GET /api/opportunities/:id — get opportunity detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      contributor: { select: { id: true, name: true } },
      purchases: session?.user?.id
        ? {
            where: { companyId: session.user.id, status: "completed" },
            select: { id: true, stage: true, createdAt: true },
          }
        : false,
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Determine what the viewer can see
  const isOwner = session?.user?.id === opportunity.contributorId;
  const isAdmin = session?.user?.role === "admin";
  const purchases = Array.isArray(opportunity.purchases)
    ? opportunity.purchases
    : [];
  const hasStage1 = purchases.some(
    (p: { stage: number }) => p.stage === 1
  );
  const hasStage2 = purchases.some(
    (p: { stage: number }) => p.stage === 2
  );

  // Build response — hide sealed content unless authorized
  const result: Record<string, unknown> = {
    id: opportunity.id,
    title: opportunity.title,
    brief: opportunity.brief,
    category: opportunity.category,
    stage1Price: opportunity.stage1Price,
    stage2Price: opportunity.stage2Price,
    savingsEstimateLow: opportunity.savingsEstimateLow,
    savingsEstimateHigh: opportunity.savingsEstimateHigh,
    confidenceScore: opportunity.confidenceScore,
    status: opportunity.status,
    createdAt: opportunity.createdAt,
    contributor: opportunity.contributor,
    hasStage1,
    hasStage2,
  };

  if (hasStage1 || isOwner || isAdmin) {
    result.validationChecklist = opportunity.validationChecklist;
    result.requirements = opportunity.requirements;
    result.highLevelApproach = opportunity.highLevelApproach;
    if (hasStage1 && !isOwner) {
      // Add watermark info
      const company = await prisma.user.findUnique({
        where: { id: session!.user.id },
        select: { name: true },
      });
      const purchase = purchases.find(
        (p: { stage: number }) => p.stage === 1
      );
      result.watermark = `Unlocked by ${company?.name} on ${new Date(purchase!.createdAt).toLocaleDateString()} • Order #${purchase!.id}`;
    }
  }

  if (hasStage2 || isOwner || isAdmin) {
    result.fullPlaybook = opportunity.fullPlaybook;
    result.templates = opportunity.templates;
    if (hasStage2 && !isOwner) {
      const company = await prisma.user.findUnique({
        where: { id: session!.user.id },
        select: { name: true },
      });
      const purchase = purchases.find(
        (p: { stage: number }) => p.stage === 2
      );
      result.watermark2 = `Unlocked by ${company?.name} on ${new Date(purchase!.createdAt).toLocaleDateString()} • Order #${purchase!.id}`;
    }
  }

  return NextResponse.json(result);
}

// PUT /api/opportunities/:id — update opportunity
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = session.user.id === opportunity.contributorId;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // If publishing, run triage again
  let triageUpdates = {};
  if (body.status === "published") {
    const allText = [
      body.title || opportunity.title,
      body.brief || opportunity.brief,
      body.validationChecklist || opportunity.validationChecklist,
      body.requirements || opportunity.requirements,
      body.highLevelApproach || opportunity.highLevelApproach,
      body.fullPlaybook || opportunity.fullPlaybook,
      body.templates || opportunity.templates,
    ]
      .filter(Boolean)
      .join(" ");

    const triage = await triageOpportunity(
      body.title || opportunity.title,
      body.brief || opportunity.brief,
      allText
    );

    if (triage.flagReason) {
      body.status = "flagged";
    }

    triageUpdates = {
      confidenceScore: triage.confidenceScore,
      duplicateOfId: triage.duplicateOfId,
      piiDetected: triage.piiDetected,
      flagReason: triage.flagReason,
    };
  }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.brief !== undefined && { brief: body.brief }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.stage1Price !== undefined && { stage1Price: body.stage1Price }),
      ...(body.validationChecklist !== undefined && {
        validationChecklist: body.validationChecklist,
      }),
      ...(body.requirements !== undefined && {
        requirements: body.requirements,
      }),
      ...(body.highLevelApproach !== undefined && {
        highLevelApproach: body.highLevelApproach,
      }),
      ...(body.fullPlaybook !== undefined && {
        fullPlaybook: body.fullPlaybook,
      }),
      ...(body.templates !== undefined && { templates: body.templates }),
      ...(body.stage2Price !== undefined && { stage2Price: body.stage2Price }),
      ...(body.savingsEstimateLow !== undefined && {
        savingsEstimateLow: body.savingsEstimateLow,
      }),
      ...(body.savingsEstimateHigh !== undefined && {
        savingsEstimateHigh: body.savingsEstimateHigh,
      }),
      ...(body.status !== undefined && { status: body.status }),
      ...triageUpdates,
    },
  });

  return NextResponse.json(updated);
}
