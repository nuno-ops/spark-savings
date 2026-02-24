import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/contributor/earnings — get contributor's earnings summary
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all purchases of this contributor's opportunities
  const purchases = await prisma.purchase.findMany({
    where: {
      opportunity: { contributorId: session.user.id },
      status: "completed",
    },
    include: {
      opportunity: { select: { title: true } },
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEarnings = purchases.reduce(
    (sum, p) => sum + p.contributorPayoutEuros,
    0
  );

  return NextResponse.json({ totalEarnings, purchases });
}
