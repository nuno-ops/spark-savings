import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidUUID } from "@/lib/validation";

// PUT /api/requests/:id/proposals/:proposalId — accept or reject proposal (company owner)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  const { id, proposalId } = await params;
  const ip = getClientIp(req);
  const limited = rateLimit(`proposal-action:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  if (!isValidUUID(id) || !isValidUUID(proposalId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const request = await prisma.companyRequest.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const isOwner = session.user.id === request.companyId;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const proposal = await prisma.requestProposal.findUnique({
    where: { id: proposalId },
  });
  if (!proposal || proposal.requestId !== id) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  if (proposal.status !== "pending") {
    return NextResponse.json({ error: "Proposal already processed" }, { status: 409 });
  }

  const body = await req.json();
  const { status } = body;

  if (!status || !PROPOSAL_STATUSES.includes(status as typeof PROPOSAL_STATUSES[number])) {
    return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'" }, { status: 400 });
  }
  if (status === "pending") {
    return NextResponse.json({ error: "Cannot revert to pending" }, { status: 400 });
  }

  if (status === "accepted") {
    // Accept this proposal, reject all others, close the request
    await prisma.$transaction([
      prisma.requestProposal.update({
        where: { id: proposalId },
        data: { status: "accepted" },
      }),
      prisma.requestProposal.updateMany({
        where: {
          requestId: id,
          id: { not: proposalId },
          status: "pending",
        },
        data: { status: "rejected" },
      }),
      prisma.companyRequest.update({
        where: { id },
        data: { status: "closed" },
      }),
    ]);

    return NextResponse.json({ status: "accepted", requestClosed: true });
  }

  // Reject single proposal
  await prisma.requestProposal.update({
    where: { id: proposalId },
    data: { status: "rejected" },
  });

  return NextResponse.json({ status: "rejected" });
}
