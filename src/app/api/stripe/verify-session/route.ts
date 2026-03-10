import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion,
    })
  : null;

// GET /api/stripe/verify-session?session_id=cs_xxx
// Verifies a Stripe checkout session and creates the purchase record if paid.
// This is the fallback for when webhooks aren't configured (local dev).
// Both the webhook and this endpoint check for existing purchase to avoid duplicates.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required" },
      { status: 400 }
    );
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const meta = checkoutSession.metadata;
    if (!meta?.companyId || !meta?.opportunityId || !meta?.stage) {
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 }
      );
    }

    // Verify the session belongs to the current user
    if (meta.companyId !== session.user.id) {
      return NextResponse.json(
        { error: "Session does not belong to you" },
        { status: 403 }
      );
    }

    // Check if purchase already exists (idempotent — webhook may have already created it)
    const existing = await prisma.purchase.findFirst({
      where: {
        companyId: meta.companyId,
        opportunityId: meta.opportunityId,
        stage: parseInt(meta.stage),
        status: "completed",
      },
    });

    if (existing) {
      return NextResponse.json({
        purchase: existing,
        opportunityId: meta.opportunityId,
        stage: parseInt(meta.stage),
        alreadyRecorded: true,
      });
    }

    // Create the purchase record
    const purchase = await prisma.purchase.create({
      data: {
        companyId: meta.companyId,
        opportunityId: meta.opportunityId,
        stage: parseInt(meta.stage),
        amountEuros: parseInt(meta.amountEuros || "0"),
        platformFeeEuros: parseInt(meta.platformFeeEuros || "0"),
        contributorPayoutEuros: parseInt(
          meta.contributorPayoutEuros || "0"
        ),
        stripePaymentId: (checkoutSession.payment_intent as string) || "",
        status: "completed",
      },
    });

    return NextResponse.json({
      purchase,
      opportunityId: meta.opportunityId,
      stage: parseInt(meta.stage),
      alreadyRecorded: false,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to verify session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
