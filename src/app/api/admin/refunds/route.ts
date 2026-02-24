import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/refunds — list refund requests
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const refunds = await prisma.purchase.findMany({
    where: { status: "refund_requested" },
    include: {
      company: { select: { name: true, email: true } },
      opportunity: { select: { title: true } },
    },
    orderBy: { refundRequestedAt: "desc" },
  });

  return NextResponse.json(refunds);
}

// POST /api/admin/refunds — approve or deny refund
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { purchaseId, action } = await req.json(); // action: "approve" | "deny"

  if (!purchaseId || !["approve", "deny"].includes(action)) {
    return NextResponse.json(
      { error: "purchaseId and action (approve|deny) required" },
      { status: 400 }
    );
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase || purchase.status !== "refund_requested") {
    return NextResponse.json(
      { error: "No pending refund for this purchase" },
      { status: 404 }
    );
  }

  if (action === "approve") {
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { status: "refunded", refundedAt: new Date() },
    });
    return NextResponse.json({ status: "refunded" });
  } else {
    // Deny: revert to completed
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { status: "completed", refundRequestedAt: null },
    });
    return NextResponse.json({ status: "completed" });
  }
}
