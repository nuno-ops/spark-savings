import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/messages?opportunityId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunityId = new URL(req.url).searchParams.get("opportunityId");
  if (!opportunityId) {
    return NextResponse.json(
      { error: "opportunityId is required" },
      { status: 400 }
    );
  }

  // Verify user has access (is contributor or has Stage 2 purchase)
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isContributor = opportunity.contributorId === session.user.id;
  const hasStage2 = await prisma.purchase.findFirst({
    where: {
      companyId: session.user.id,
      opportunityId,
      stage: 2,
      status: "completed",
    },
  });

  if (!isContributor && !hasStage2 && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Stage 2 purchase required for messaging" },
      { status: 403 }
    );
  }

  const messages = await prisma.message.findMany({
    where: { opportunityId },
    include: { sender: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { opportunityId, content } = await req.json();
  if (!opportunityId || !content) {
    return NextResponse.json(
      { error: "opportunityId and content are required" },
      { status: 400 }
    );
  }

  // Verify access
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isContributor = opportunity.contributorId === session.user.id;
  const hasStage2 = await prisma.purchase.findFirst({
    where: {
      companyId: session.user.id,
      opportunityId,
      stage: 2,
      status: "completed",
    },
  });

  if (!isContributor && !hasStage2) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      opportunityId,
      senderId: session.user.id,
      content,
    },
    include: { sender: { select: { name: true, role: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
