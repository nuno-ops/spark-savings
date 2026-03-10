import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidUUID, isValidString, sanitizeText, MAX_LENGTHS } from "@/lib/validation";

// GET /api/messages?opportunityId=xxx
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`messages-list:${ip}`, RATE_LIMITS.read);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunityId = new URL(req.url).searchParams.get("opportunityId");
  if (!opportunityId || !isValidUUID(opportunityId)) {
    return NextResponse.json(
      { error: "A valid opportunityId is required" },
      { status: 400 }
    );
  }

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
    take: 200,
    include: { sender: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`messages-post:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { opportunityId, content } = await req.json();

  if (!opportunityId || !isValidUUID(opportunityId)) {
    return NextResponse.json(
      { error: "A valid opportunityId is required" },
      { status: 400 }
    );
  }

  if (!content || !isValidString(content, { min: 1, max: MAX_LENGTHS.message })) {
    return NextResponse.json(
      { error: `Message must be 1-${MAX_LENGTHS.message} characters` },
      { status: 400 }
    );
  }

  const sanitizedContent = sanitizeText(content);

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
      content: sanitizedContent,
    },
    include: { sender: { select: { name: true, role: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
