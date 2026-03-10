import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/stats — aggregate dashboard statistics
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const [
    oppsByStatus,
    totalUsers,
    usersByRole,
    pendingRefunds,
    revenueAgg,
    feesAgg,
    flaggedCount,
    suspendedUsers,
    openRequests,
    totalProposals,
  ] = await Promise.all([
    prisma.opportunity.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.purchase.count({
      where: { status: "refund_requested" },
    }),
    prisma.purchase.aggregate({
      where: { status: "completed" },
      _sum: { amountEuros: true },
    }),
    prisma.purchase.aggregate({
      where: { status: "completed" },
      _sum: { platformFeeEuros: true },
    }),
    prisma.opportunity.count({
      where: { status: "flagged" },
    }),
    prisma.user.count({
      where: { suspended: true },
    }),
    prisma.companyRequest.count({
      where: { status: "open" },
    }),
    prisma.requestProposal.count(),
  ]);

  // Convert groupBy arrays to Record objects
  const opportunitiesByStatus: Record<string, number> = {};
  for (const item of oppsByStatus) {
    opportunitiesByStatus[item.status] = item._count.id;
  }

  const usersByRoleMap: Record<string, number> = {};
  for (const item of usersByRole) {
    usersByRoleMap[item.role] = item._count.id;
  }

  return NextResponse.json({
    opportunitiesByStatus,
    totalUsers,
    usersByRole: usersByRoleMap,
    pendingRefunds,
    totalRevenue: revenueAgg._sum.amountEuros || 0,
    platformFees: feesAgg._sum.platformFeeEuros || 0,
    flaggedCount,
    suspendedUsers,
    openRequests,
    totalProposals,
  });
}
