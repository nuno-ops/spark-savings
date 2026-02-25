import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/reviews?opportunityId=xxx — list reviews for an opportunity (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const opportunityId = searchParams.get("opportunityId");

  if (!opportunityId) {
    return NextResponse.json(
      { error: "opportunityId is required" },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { opportunityId },
    include: {
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

// POST /api/reviews — create or update a review (company only, must have purchased)
export async function POST(req: NextRequest) {
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

  if (!opportunityId || !rating) {
    return NextResponse.json(
      { error: "opportunityId and rating are required" },
      { status: 400 }
    );
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

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

  // Upsert: create or update the review
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
      comment: comment || "",
    },
    update: {
      rating,
      comment: comment || "",
    },
    include: {
      company: { select: { name: true } },
    },
  });

  return NextResponse.json(review, { status: 201 });
}
