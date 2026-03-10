import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { triageOpportunity } from "@/lib/triage";
import { isValidUUID, isValidString, sanitizeText, MAX_LENGTHS } from "@/lib/validation";
import { STAGE1_PRICES, CATEGORIES } from "@/lib/constants";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Fields a contributor is allowed to update
const CONTRIBUTOR_FIELDS = new Set([
  "title", "brief", "company", "category", "stage1Price",
  "validationChecklist", "requirements", "highLevelApproach",
  "fullPlaybook", "templates", "stage2Price",
  "savingsEstimateLow", "savingsEstimateHigh", "status",
]);

// Admin can additionally change these
const ADMIN_EXTRA_FIELDS = ["confidenceScore", "flagReason"];

// GET /api/opportunities/:id — get opportunity detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

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
      reviews: {
        include: { company: { select: { name: true } } },
        orderBy: { createdAt: "desc" as const },
      },
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = session?.user?.id === opportunity.contributorId;
  const isAdmin = session?.user?.role === "admin";
  const purchases = Array.isArray(opportunity.purchases)
    ? opportunity.purchases
    : [];
  const hasStage1 = purchases.some((p: { stage: number }) => p.stage === 1);
  const hasStage2 = purchases.some((p: { stage: number }) => p.stage === 2);

  const ratings = opportunity.reviews.map((r) => r.rating);
  const reviewCount = ratings.length;
  const avgRating =
    reviewCount > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / reviewCount) * 10) / 10
      : 0;

  // Contributor identity is only revealed after Stage 2 purchase, to the owner, or to admins
  const showContributorIdentity = hasStage2 || isOwner || isAdmin;
  const contributor = showContributorIdentity
    ? opportunity.contributor
    : { id: null, name: "Expert Contributor" };

  const result: Record<string, unknown> = {
    id: opportunity.id,
    title: opportunity.title,
    brief: opportunity.brief,
    company: opportunity.company,
    category: opportunity.category,
    stage1Price: opportunity.stage1Price,
    stage2Price: opportunity.stage2Price,
    savingsEstimateLow: opportunity.savingsEstimateLow,
    savingsEstimateHigh: opportunity.savingsEstimateHigh,
    confidenceScore: opportunity.confidenceScore,
    status: opportunity.status,
    createdAt: opportunity.createdAt,
    contributor,
    hasStage1,
    hasStage2,
    avgRating,
    reviewCount,
    reviews: opportunity.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      company: r.company,
    })),
  };

  if (hasStage1 || isOwner || isAdmin) {
    result.validationChecklist = opportunity.validationChecklist;
    result.requirements = opportunity.requirements;
    result.highLevelApproach = opportunity.highLevelApproach;
    if (hasStage1 && !isOwner) {
      const company = await prisma.user.findUnique({
        where: { id: session!.user.id },
        select: { name: true },
      });
      const purchase = purchases.find((p: { stage: number }) => p.stage === 1);
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
      const purchase = purchases.find((p: { stage: number }) => p.stage === 2);
      result.watermark2 = `Unlocked by ${company?.name} on ${new Date(purchase!.createdAt).toLocaleDateString()} • Order #${purchase!.id}`;
    }
  }

  const viewerRole = session?.user?.role || "anonymous";
  prisma.opportunityView
    .create({ data: { opportunityId: id, viewerRole } })
    .catch(() => {});

  return NextResponse.json(result);
}

// PUT /api/opportunities/:id — update opportunity (field-whitelisted)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getClientIp(req);
  const limited = rateLimit(`opp-update:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

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

  // ── Field whitelisting ────────────────────────────────────
  const allowedFields = new Set(CONTRIBUTOR_FIELDS);
  if (isAdmin) {
    for (const f of ADMIN_EXTRA_FIELDS) allowedFields.add(f);
  }

  const data: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (allowedFields.has(key)) {
      data[key] = body[key];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // ── Status transition validation ──────────────────────────
  if (data.status !== undefined) {
    const validStatuses = ["draft", "published", "suspended", "flagged"];
    if (!validStatuses.includes(data.status as string)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Contributors can only toggle draft ↔ published
    if (!isAdmin) {
      const cur = opportunity.status;
      const next = data.status as string;
      const allowed =
        (cur === "draft" && next === "published") ||
        (cur === "published" && next === "draft");
      if (!allowed) {
        return NextResponse.json(
          { error: `Cannot change status from '${cur}' to '${next}'` },
          { status: 403 }
        );
      }
    }
  }

  // ── Field value validation & sanitization ─────────────────
  if (data.title !== undefined) {
    if (!isValidString(data.title, { min: 1, max: MAX_LENGTHS.title }))
      return NextResponse.json({ error: `Title must be 1-${MAX_LENGTHS.title} chars` }, { status: 400 });
    data.title = sanitizeText(data.title as string);
  }
  if (data.brief !== undefined) {
    if (!isValidString(data.brief, { min: 1, max: MAX_LENGTHS.brief }))
      return NextResponse.json({ error: `Brief must be 1-${MAX_LENGTHS.brief} chars` }, { status: 400 });
    data.brief = sanitizeText(data.brief as string);
  }
  if (data.company !== undefined) {
    if (!isValidString(data.company, { max: MAX_LENGTHS.company }))
      return NextResponse.json({ error: `Company name too long` }, { status: 400 });
    data.company = sanitizeText(data.company as string);
  }
  if (data.category !== undefined) {
    if (!CATEGORIES.includes(data.category as typeof CATEGORIES[number]))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (data.stage1Price !== undefined) {
    if (!STAGE1_PRICES.includes(data.stage1Price as typeof STAGE1_PRICES[number]))
      return NextResponse.json({ error: "Stage 1 price must be €250 or €500" }, { status: 400 });
  }

  for (const field of ["validationChecklist", "requirements", "highLevelApproach", "fullPlaybook", "templates"]) {
    if (data[field] !== undefined) {
      if (!isValidString(data[field], { max: MAX_LENGTHS.markdown }))
        return NextResponse.json({ error: `${field} exceeds max length` }, { status: 400 });
      data[field] = sanitizeText(data[field] as string);
    }
  }

  for (const field of ["stage2Price", "savingsEstimateLow", "savingsEstimateHigh"]) {
    if (data[field] !== undefined) {
      const val = data[field];
      if (typeof val !== "number" || !Number.isInteger(val) || val < 0 || val > 10000000)
        return NextResponse.json({ error: `${field} must be a valid positive integer` }, { status: 400 });
    }
  }

  // ── Triage on publish ─────────────────────────────────────
  let triageUpdates = {};
  if (data.status === "published") {
    const allText = [
      (data.title as string) || opportunity.title,
      (data.brief as string) || opportunity.brief,
      (data.validationChecklist as string) || opportunity.validationChecklist,
      (data.requirements as string) || opportunity.requirements,
      (data.highLevelApproach as string) || opportunity.highLevelApproach,
      (data.fullPlaybook as string) || opportunity.fullPlaybook,
      (data.templates as string) || opportunity.templates,
    ].filter(Boolean).join(" ");

    const triage = await triageOpportunity(
      (data.title as string) || opportunity.title,
      (data.brief as string) || opportunity.brief,
      allText
    );

    if (triage.flagReason) data.status = "flagged";

    triageUpdates = {
      confidenceScore: triage.confidenceScore,
      duplicateOfId: triage.duplicateOfId,
      piiDetected: triage.piiDetected,
      flagReason: triage.flagReason,
    };
  }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: { ...data, ...triageUpdates },
  });

  return NextResponse.json(updated);
}
