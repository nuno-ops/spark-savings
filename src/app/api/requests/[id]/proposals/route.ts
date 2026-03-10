import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidUUID, isValidString, isValidInt, sanitizeText, MAX_LENGTHS } from "@/lib/validation";

// GET /api/requests/:id/proposals — list proposals
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  if (isOwner || isAdmin) {
    // Company owner and admin see all proposals
    const proposals = await prisma.requestProposal.findMany({
      where: { requestId: id },
      include: { contributor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(proposals);
  }

  // Contributors see only their own
  if (session.user.role === "contributor") {
    const proposals = await prisma.requestProposal.findMany({
      where: { requestId: id, contributorId: session.user.id },
      include: { contributor: { select: { id: true, name: true } } },
    });
    return NextResponse.json(proposals);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST /api/requests/:id/proposals — submit or update a proposal (contributor only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getClientIp(req);
  const limited = rateLimit(`proposal-create:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "contributor") {
    return NextResponse.json({ error: "Only contributors can submit proposals" }, { status: 403 });
  }
  if (user.suspended) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  const request = await prisma.companyRequest.findUnique({ where: { id } });
  if (!request || request.status !== "open") {
    return NextResponse.json({ error: "Request not found or not open" }, { status: 404 });
  }

  const body = await req.json();
  const { summary, approach, estimatedSavings, proposedPrice } = body;

  if (!summary || !isValidString(summary, { min: 1, max: MAX_LENGTHS.proposalSummary })) {
    return NextResponse.json({ error: `Summary must be 1-${MAX_LENGTHS.proposalSummary} characters` }, { status: 400 });
  }
  if (!approach || !isValidString(approach, { min: 1, max: MAX_LENGTHS.proposalApproach })) {
    return NextResponse.json({ error: `Approach must be 1-${MAX_LENGTHS.proposalApproach} characters` }, { status: 400 });
  }
  if (!isValidInt(estimatedSavings, { min: 0, max: 10000000 })) {
    return NextResponse.json({ error: "Invalid estimated savings" }, { status: 400 });
  }
  if (!isValidInt(proposedPrice, { min: 0, max: 10000000 })) {
    return NextResponse.json({ error: "Invalid proposed price" }, { status: 400 });
  }

  // Upsert: one proposal per contributor per request
  const proposal = await prisma.requestProposal.upsert({
    where: {
      requestId_contributorId: {
        requestId: id,
        contributorId: session.user.id,
      },
    },
    create: {
      requestId: id,
      contributorId: session.user.id,
      summary: sanitizeText(summary),
      approach: sanitizeText(approach),
      estimatedSavings,
      proposedPrice,
      status: "pending",
    },
    update: {
      summary: sanitizeText(summary),
      approach: sanitizeText(approach),
      estimatedSavings,
      proposedPrice,
      // Don't update status — only the company can change it
    },
    include: { contributor: { select: { id: true, name: true } } },
  });

  return NextResponse.json(proposal, { status: 201 });
}
