import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CATEGORIES, REQUEST_STATUSES } from "@/lib/constants";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidUUID, isValidString, sanitizeText, MAX_LENGTHS } from "@/lib/validation";

// GET /api/requests/:id — request detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  const request = await prisma.companyRequest.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      proposals: {
        include: {
          contributor: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Non-open requests are only visible to the owner and admins
  if (request.status !== "open" && session?.user?.id !== request.companyId && session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = session?.user?.id === request.companyId;
  const isAdmin = session?.user?.role === "admin";
  const isContributor = session?.user?.role === "contributor";

  // Build response — filter proposals based on viewer role
  let filteredProposals = request.proposals;
  if (!isOwner && !isAdmin) {
    if (isContributor && session?.user?.id) {
      // Contributor sees only their own proposal
      filteredProposals = request.proposals.filter(
        (p) => p.contributorId === session.user.id
      );
    } else {
      // Public: no proposal details, just count
      filteredProposals = [];
    }
  }

  return NextResponse.json({
    id: request.id,
    title: request.title,
    description: request.description,
    category: request.category,
    budgetLow: request.budgetLow,
    budgetHigh: request.budgetHigh,
    status: request.status,
    createdAt: request.createdAt,
    company: request.company,
    proposalCount: request.proposals.length,
    proposals: filteredProposals.map((p) => ({
      id: p.id,
      summary: p.summary,
      approach: isOwner || isAdmin || p.contributorId === session?.user?.id ? p.approach : undefined,
      estimatedSavings: p.estimatedSavings,
      proposedPrice: p.proposedPrice,
      status: p.status,
      opportunityId: p.opportunityId,
      createdAt: p.createdAt,
      contributor: p.contributor,
    })),
  });
}

// PUT /api/requests/:id — update request (owner or admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getClientIp(req);
  const limited = rateLimit(`requests-update:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const request = await prisma.companyRequest.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = session.user.id === request.companyId;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  // Title
  if (body.title !== undefined) {
    if (!isValidString(body.title, { min: 1, max: MAX_LENGTHS.title }))
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    data.title = sanitizeText(body.title);
  }

  // Description
  if (body.description !== undefined) {
    if (!isValidString(body.description, { min: 1, max: MAX_LENGTHS.description }))
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    data.description = sanitizeText(body.description);
  }

  // Category
  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category as typeof CATEGORIES[number]))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    data.category = body.category;
  }

  // Budget
  if (body.budgetLow !== undefined) data.budgetLow = body.budgetLow || null;
  if (body.budgetHigh !== undefined) data.budgetHigh = body.budgetHigh || null;

  // Status transition
  if (body.status !== undefined) {
    if (!REQUEST_STATUSES.includes(body.status as typeof REQUEST_STATUSES[number])) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    // Company can only close their own open request
    if (!isAdmin) {
      if (!(request.status === "open" && body.status === "closed")) {
        return NextResponse.json({ error: "You can only close an open request" }, { status: 403 });
      }
    }
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.companyRequest.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
