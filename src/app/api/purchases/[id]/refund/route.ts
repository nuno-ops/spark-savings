import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { REFUND_WINDOW_HOURS } from "@/lib/constants";

// POST /api/purchases/:id/refund — request a refund
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  if (purchase.companyId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (purchase.status !== "completed") {
    return NextResponse.json(
      { error: "Can only refund completed purchases" },
      { status: 400 }
    );
  }

  // Check refund window (48 hours)
  const hoursSincePurchase =
    (Date.now() - new Date(purchase.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSincePurchase > REFUND_WINDOW_HOURS) {
    return NextResponse.json(
      { error: `Refund window (${REFUND_WINDOW_HOURS}h) has expired` },
      { status: 400 }
    );
  }

  const updated = await prisma.purchase.update({
    where: { id },
    data: {
      status: "refund_requested",
      refundRequestedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
