import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/meetings — request a meeting (company only, requires Stage 2)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { opportunityId, proposedTimes } = await req.json();
  if (!opportunityId || !proposedTimes) {
    return NextResponse.json(
      { error: "opportunityId and proposedTimes are required" },
      { status: 400 }
    );
  }

  // Verify Stage 2 purchase
  const purchase = await prisma.purchase.findFirst({
    where: {
      companyId: session.user.id,
      opportunityId,
      stage: 2,
      status: "completed",
    },
  });
  if (!purchase) {
    return NextResponse.json(
      { error: "Stage 2 purchase required" },
      { status: 403 }
    );
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const meeting = await prisma.meeting.create({
    data: {
      opportunityId,
      companyId: session.user.id,
      contributorId: opportunity.contributorId,
      proposedTimes: JSON.stringify(proposedTimes),
      status: "proposed",
    },
  });

  return NextResponse.json(meeting, { status: 201 });
}

// GET /api/meetings — get meetings for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [
        { companyId: session.user.id },
        { contributorId: session.user.id },
      ],
    },
    include: {
      opportunity: { select: { id: true, title: true } },
      company: { select: { name: true } },
      contributor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(meetings);
}
