import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidUUID } from "@/lib/validation";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion })
  : null;

// POST /api/purchases — buy Stage 1 or Stage 2
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`purchase:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "company") {
    return NextResponse.json(
      { error: "Only companies can purchase" },
      { status: 403 }
    );
  }

  const { opportunityId, stage } = await req.json();

  if (!opportunityId || !isValidUUID(opportunityId)) {
    return NextResponse.json(
      { error: "A valid opportunityId is required" },
      { status: 400 }
    );
  }

  if (![1, 2].includes(stage)) {
    return NextResponse.json(
      { error: "stage must be 1 or 2" },
      { status: 400 }
    );
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });
  if (!opportunity || opportunity.status !== "published") {
    return NextResponse.json(
      { error: "Opportunity not found or not published" },
      { status: 404 }
    );
  }

  // Check if already purchased this stage
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      companyId: session.user.id,
      opportunityId,
      stage,
      status: "completed",
    },
  });
  if (existingPurchase) {
    return NextResponse.json(
      { error: "You already purchased this stage" },
      { status: 409 }
    );
  }

  // For Stage 2, require Stage 1 first
  if (stage === 2) {
    const hasStage1 = await prisma.purchase.findFirst({
      where: {
        companyId: session.user.id,
        opportunityId,
        stage: 1,
        status: "completed",
      },
    });
    if (!hasStage1) {
      return NextResponse.json(
        { error: "You must purchase Stage 1 first" },
        { status: 400 }
      );
    }
  }

  const amountEuros =
    stage === 1 ? opportunity.stage1Price : opportunity.stage2Price;
  if (amountEuros <= 0) {
    return NextResponse.json(
      { error: "Price not set for this stage" },
      { status: 400 }
    );
  }

  const platformFeeEuros = Math.round(
    (amountEuros * PLATFORM_FEE_PERCENT) / 100
  );
  const contributorPayoutEuros = amountEuros - platformFeeEuros;

  // If Stripe is configured, create a checkout session
  if (stripe) {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${opportunity.title} — Stage ${stage} Unlock`,
            },
            unit_amount: amountEuros * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/opportunity/${opportunityId}`,
      metadata: {
        companyId: session.user.id,
        opportunityId,
        stage: stage.toString(),
        amountEuros: amountEuros.toString(),
        platformFeeEuros: platformFeeEuros.toString(),
        contributorPayoutEuros: contributorPayoutEuros.toString(),
      },
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  }

  // No Stripe: create purchase directly (dev mode)
  const purchase = await prisma.purchase.create({
    data: {
      companyId: session.user.id,
      opportunityId,
      stage,
      amountEuros,
      platformFeeEuros,
      contributorPayoutEuros,
      status: "completed",
    },
  });

  return NextResponse.json(purchase, { status: 201 });
}

// GET /api/purchases — get current user's purchases
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: { companyId: session.user.id },
    include: {
      opportunity: {
        select: { id: true, title: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(purchases);
}
