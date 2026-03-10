import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/contributor/analytics — per-opportunity stats + earnings timeline
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "contributor") {
    return NextResponse.json({ error: "Contributor only" }, { status: 403 });
  }

  const contributorId = session.user.id;

  // Fetch all contributor's opportunities with related counts
  const opportunities = await prisma.opportunity.findMany({
    where: { contributorId },
    include: {
      views: { select: { id: true } },
      purchases: {
        select: {
          id: true,
          stage: true,
          status: true,
          amountEuros: true,
          platformFeeEuros: true,
          contributorPayoutEuros: true,
          createdAt: true,
          company: { select: { name: true } },
        },
      },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build per-opportunity stats
  const opportunityStats = opportunities.map((opp) => {
    const viewCount = opp.views.length;
    const completedPurchases = opp.purchases.filter(
      (p) => p.status === "completed"
    );
    const refundedPurchases = opp.purchases.filter(
      (p) => p.status === "refunded"
    );
    const purchaseCount = completedPurchases.length;
    const refundCount = refundedPurchases.length;
    const totalEarnings = completedPurchases.reduce(
      (sum, p) => sum + p.contributorPayoutEuros,
      0
    );
    const ratings = opp.reviews.map((r) => r.rating);
    const reviewCount = ratings.length;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / reviewCount) * 10
          ) / 10
        : 0;
    const conversionRate =
      viewCount > 0 ? Math.round((purchaseCount / viewCount) * 1000) / 10 : 0;

    return {
      opportunityId: opp.id,
      title: opp.title,
      status: opp.status,
      category: opp.category,
      stage1Price: opp.stage1Price,
      createdAt: opp.createdAt,
      viewCount,
      purchaseCount,
      totalEarnings,
      refundCount,
      avgRating,
      reviewCount,
      conversionRate,
    };
  });

  // Aggregate totals
  const totalViews = opportunityStats.reduce((s, o) => s + o.viewCount, 0);
  const totalPurchases = opportunityStats.reduce(
    (s, o) => s + o.purchaseCount,
    0
  );
  const totalEarnings = opportunityStats.reduce(
    (s, o) => s + o.totalEarnings,
    0
  );
  const avgConversion =
    totalViews > 0
      ? Math.round((totalPurchases / totalViews) * 1000) / 10
      : 0;

  // Earnings timeline — last 12 months
  // Gather all completed purchases across all opportunities
  const allPurchases = opportunities.flatMap((opp) =>
    opp.purchases
      .filter((p) => p.status === "completed")
      .map((p) => ({
        ...p,
        opportunityTitle: opp.title,
      }))
  );

  // Group by month (YYYY-MM)
  const now = new Date();
  const months: { month: string; label: string; earnings: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    const monthEarnings = allPurchases
      .filter((p) => {
        const pd = new Date(p.createdAt);
        return (
          pd.getFullYear() === d.getFullYear() &&
          pd.getMonth() === d.getMonth()
        );
      })
      .reduce((sum, p) => sum + p.contributorPayoutEuros, 0);
    months.push({ month: key, label, earnings: monthEarnings });
  }

  // Full payout history (all purchases, sorted newest first)
  const payoutHistory = allPurchases
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((p) => ({
      id: p.id,
      date: p.createdAt,
      opportunityTitle: p.opportunityTitle,
      stage: p.stage,
      companyName: p.company.name,
      grossAmount: p.amountEuros,
      platformFee: p.platformFeeEuros,
      netPayout: p.contributorPayoutEuros,
      status: p.status,
    }));

  const totalGross = payoutHistory.reduce((s, p) => s + p.grossAmount, 0);
  const totalFees = payoutHistory.reduce((s, p) => s + p.platformFee, 0);
  const totalNet = payoutHistory.reduce((s, p) => s + p.netPayout, 0);

  return NextResponse.json({
    summary: {
      totalEarnings,
      totalViews,
      totalPurchases,
      avgConversion,
    },
    opportunityStats,
    earningsTimeline: months,
    payoutHistory,
    payoutSummary: { totalGross, totalFees, totalNet },
  });
}
