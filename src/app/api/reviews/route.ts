import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidUUID, isValidString, sanitizeText, MAX_LENGTHS } from "@/lib/validation";

// GET /api/reviews?opportunityId=xxx — list reviews for an opportunity (public)
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`reviews-list:${ip}`, RATE_LIMITS.read);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const opportunityId = searchParams.get("opportunityId");

  if (!opportunityId || !isValidUUID(opportunityId)) {
    return NextResponse.json(
      { error: "A valid opportunityId is required" },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { opportunityId },
    take: 100,
    include: {
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

// POST /api/reviews — create or update a review (company only, must have purchased)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`reviews-post:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "company") {
    return NextResponse.json(
      { error: "Only companies can leave reviews" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { opportunityId, rating, comment } = body;

  if (!opportunityId || !isValidUUID(opportunityId)) {
    return NextResponse.json(
      { error: "A valid opportunityId is required" },
      { status: 400 }
    );
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  // Validate and sanitize comment
  const sanitizedComment = comment
    ? sanitizeText(
        isValidString(comment, { max: MAX_LENGTHS.comment })
          ? comment
          : (comment as string).slice(0, MAX_LENGTHS.comment)
      )
    : "";

  // Check that the company has a completed purchase for this opportunity
  const purchase = await prisma.purchase.findFirst({
    where: {
      companyId: session.user.id,
      opportunityId,
      status: "completed",
    },
  });

  if (!purchase) {
    return NextResponse.json(
      { error: "You must purchase this opportunity before leaving a review" },
      { status: 403 }
    );
  }

  const review = await prisma.review.upsert({
    where: {
      companyId_opportunityId: {
        companyId: session.user.id,
        opportunityId,
      },
    },
    create: {
      companyId: session.user.id,
      opportunityId,
      rating,
      comment: sanitizedComment,
    },
    update: {
      rating,
      comment: sanitizedComment,
    },
    include: {
      company: { select: { name: true } },
    },
  });

  return NextResponse.json(review, { status: 201 });
}
