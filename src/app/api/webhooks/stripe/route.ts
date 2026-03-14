import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

// Lazy-init to avoid build-time crash when env vars aren't set
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion,
  });
};

// POST /api/webhooks/stripe — Stripe event handler
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler error";
    console.error(`Webhook handler error for ${event.type}: ${message}`);
    return NextResponse.json(
      { error: `Handler error: ${message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ─── checkout.session.completed ────────────────────────────
// Creates the purchase record when payment succeeds.
// Idempotent: skips if purchase already exists (verify-session may have created it).
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return; // Ignore unpaid sessions (e.g. async payment methods)
  }

  const meta = session.metadata;
  if (!meta?.companyId || !meta?.opportunityId || !meta?.stage) {
    console.error("Checkout session missing metadata:", session.id);
    return;
  }

  const stage = parseInt(meta.stage);

  // Idempotent check — verify-session endpoint may have already recorded this
  const existing = await prisma.purchase.findFirst({
    where: {
      companyId: meta.companyId,
      opportunityId: meta.opportunityId,
      stage,
      status: "completed",
    },
  });

  if (existing) {
    return; // Already recorded
  }

  await prisma.purchase.create({
    data: {
      companyId: meta.companyId,
      opportunityId: meta.opportunityId,
      stage,
      amountEuros: parseInt(meta.amountEuros || "0"),
      platformFeeEuros: parseInt(meta.platformFeeEuros || "0"),
      contributorPayoutEuros: parseInt(meta.contributorPayoutEuros || "0"),
      stripePaymentId: (session.payment_intent as string) || "",
      status: "completed",
    },
  });

  console.log(
    `Purchase created via webhook: ${meta.opportunityId} stage ${stage} for company ${meta.companyId}`
  );
}

// ─── charge.refunded ──────────────────────────────────────
// Updates purchase status when Stripe confirms a refund.
// Handles refunds initiated from Stripe dashboard or via our admin endpoint.
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) {
    return;
  }

  // Find the purchase by Stripe payment intent ID
  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (!purchase) {
    console.error(
      `No purchase found for payment intent: ${paymentIntentId}`
    );
    return;
  }

  // Only update if not already refunded (idempotent)
  if (purchase.status === "refunded") {
    return;
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      status: "refunded",
      refundedAt: new Date(),
    },
  });

  console.log(
    `Purchase ${purchase.id} marked as refunded via webhook (payment intent: ${paymentIntentId})`
  );
}
