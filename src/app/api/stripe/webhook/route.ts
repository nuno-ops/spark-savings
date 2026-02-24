import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;

    if (meta?.companyId && meta?.opportunityId && meta?.stage) {
      await prisma.purchase.create({
        data: {
          companyId: meta.companyId,
          opportunityId: meta.opportunityId,
          stage: parseInt(meta.stage),
          amountEuros: parseInt(meta.amountEuros || "0"),
          platformFeeEuros: parseInt(meta.platformFeeEuros || "0"),
          contributorPayoutEuros: parseInt(
            meta.contributorPayoutEuros || "0"
          ),
          stripePaymentId: session.payment_intent as string || "",
          status: "completed",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
