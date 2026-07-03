"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Key, Star, ArrowUpDown, TrendingUp, Eye, ShoppingCart, Percent, ChevronRight, Package, Pencil } from "lucide-react";

/* ── Types ──────────────────────────────────────────── */
interface OpportunityStat {
  opportunityId: string; title: string; status: string; category: string;
  stage1Price: number; createdAt: string; viewCount: number; purchaseCount: number;
  totalEarnings: number; refundCount: number; avgRating: number;
  reviewCount: number; conversionRate: number;
}
interface EarningsMonth { month: string; label: string; earnings: number; }
interface PayoutRow {
  id: string; date: string; opportunityTitle: string; stage: number;
  companyName: string; grossAmount: number; platformFee: number;
  netPayout: number; status: string;
}
interface AnalyticsData {
  summary: { totalEarnings: number; totalViews: number; totalPurchases: number; avgConversion: number; };
  opportunityStats: OpportunityStat[];
  earningsTimeline: EarningsMonth[];
  payoutHistory: PayoutRow[];
  payoutSummary: { totalGross: number; totalFees: number; totalNet: number; };
}

type Tab = "overview" | "performance" | "payouts";
type SortKey = keyof OpportunityStat;
type SortDir = "asc" | "desc";

/* ── Helpers ────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "published" ? "text-emerald-700 bg-emerald-50" :
    status === "flagged" ? "text-red-700 bg-red-50" :
    status === "suspended" ? "text-amber-700 bg-amber-50" :
    "text-slate-500 bg-slate-100";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status}</span>;
}

/* ── Main Component ─────────────────────────────────── */
export default function ContributorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [sortKey, setSortKey] = useState<SortKey>("totalEarnings");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status !== "authenticated") return;
    fetch("/api/contributor/analytics")
      .then((r) => r.json())
      .then((data) => { setAnalytics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, router]);

  const sortedStats = useMemo(() => {
    if (!analytics) return [];
    return [...analytics.opportunityStats].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [analytics, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  if (status === "loading" || loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-48 mb-2" />
        <div className="h-4 bg-slate-100 rounded w-32 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const s = analytics?.summary;
  const maxEarnings = analytics ? Math.max(...analytics.earningsTimeline.map((m) => m.earnings), 1) : 1;
  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "performance", label: "Performance" },
    { key: "payouts", label: "Payout History" },
  ];

  return (
    <div>
      {/* ── Header ──────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contributor Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contributor/api-keys" className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 font-medium">
            <Key className="w-3.5 h-3.5" /> API Keys
          </Link>
          <Link href="/contributor/new" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600">
            <Plus className="w-3.5 h-3.5" /> New Opportunity
          </Link>
        </div>
      </div>

      {/* ── Tabs ────────────────────────── */}
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium -mb-px ${
              tab === t.key
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW ═══════════ */}
      {tab === "overview" && s && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Earnings" value={`\u20AC${s.totalEarnings.toLocaleString()}`} icon={TrendingUp} />
            <StatCard label="Total Views" value={s.totalViews.toLocaleString()} icon={Eye} />
            <StatCard label="Total Purchases" value={s.totalPurchases.toLocaleString()} icon={ShoppingCart} />
            <StatCard label="Conversion Rate" value={`${s.avgConversion}%`} sub="views \u2192 purchases" icon={Percent} />
          </div>

          {/* Earnings chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Earnings — Last 12 Months</h3>
            <div className="flex items-end gap-1.5 h-44">
              {analytics.earningsTimeline.map((m) => {
                const pct = (m.earnings / maxEarnings) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                    {m.earnings > 0 && (
                      <span className="text-[10px] text-slate-400 mb-1">&euro;{m.earnings}</span>
                    )}
                    <div
                      className="w-full bg-slate-900 rounded-t"
                      style={{ height: `${Math.max(pct, m.earnings > 0 ? 4 : 0)}%` }}
                    />
                    <span className="text-[10px] text-slate-400 mt-1.5">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent sales */}
          {analytics.payoutHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Recent Sales</h3>
              <div className="space-y-2">
                {analytics.payoutHistory.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">Stage {p.stage}: {p.opportunityTitle}</span>
                    <span className="font-medium text-slate-900">&euro;{p.netPayout} <span className="text-slate-400 font-normal">from {p.companyName}</span></span>
                  </div>
                ))}
              </div>
              {analytics.payoutHistory.length > 5 && (
                <button onClick={() => setTab("payouts")} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mt-3">
                  View all payouts <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ PERFORMANCE ═══════════ */}
      {tab === "performance" && analytics && (
        <div>
          {sortedStats.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No opportunities yet.</p>
              <Link href="/contributor/new" className="text-sm text-slate-700 underline underline-offset-2 mt-1.5 inline-block">
                Create your first one
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    {[
                      { key: "title" as SortKey, label: "Opportunity" },
                      { key: "status" as SortKey, label: "Status" },
                      { key: "viewCount" as SortKey, label: "Views" },
                      { key: "purchaseCount" as SortKey, label: "Sales" },
                      { key: "conversionRate" as SortKey, label: "Conv %" },
                      { key: "totalEarnings" as SortKey, label: "Earnings" },
                      { key: "avgRating" as SortKey, label: "Rating" },
                    ].map((col) => (
                      <th key={col.key} className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort(col.key)}>
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {sortKey === col.key && <ArrowUpDown className="w-3 h-3" />}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedStats.map((opp) => {
                    const convColor = opp.conversionRate > 5 ? "text-emerald-700 bg-emerald-50" : opp.conversionRate >= 1 ? "text-amber-700 bg-amber-50" : "text-slate-500 bg-slate-50";
                    return (
                      <tr key={opp.opportunityId} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{opp.title}</td>
                        <td className="px-4 py-3"><StatusBadge status={opp.status} /></td>
                        <td className="px-4 py-3 text-slate-600">{opp.viewCount}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {opp.purchaseCount}
                          {opp.refundCount > 0 && <span className="text-red-500 text-xs ml-1">({opp.refundCount} ref)</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${convColor}`}>{opp.conversionRate}%</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">&euro;{opp.totalEarnings.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {opp.reviewCount > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              {opp.avgRating} <span className="text-slate-400">({opp.reviewCount})</span>
                            </span>
                          ) : <span className="text-slate-300">&mdash;</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/contributor/${opp.opportunityId}/edit`} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg inline-flex" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ PAYOUT HISTORY ═══════════ */}
      {tab === "payouts" && analytics && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Gross Revenue</p>
              <p className="text-xl font-bold text-slate-900 mt-1">&euro;{analytics.payoutSummary.totalGross.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
              <p className="text-xs text-red-400 uppercase tracking-wider font-medium">Platform Fees (15%)</p>
              <p className="text-xl font-bold text-red-600 mt-1">&minus;&euro;{analytics.payoutSummary.totalFees.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
              <p className="text-xs text-emerald-500 uppercase tracking-wider font-medium">Net Payout</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">&euro;{analytics.payoutSummary.totalNet.toLocaleString()}</p>
            </div>
          </div>

          {analytics.payoutHistory.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No payouts yet. Sales will appear here once companies unlock your opportunities.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    {["Date", "Opportunity", "Stage", "Company", "Gross", "Fee", "Net"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider ${i >= 4 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analytics.payoutHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{p.opportunityTitle}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Stage {p.stage}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.companyName}</td>
                      <td className="px-4 py-3 text-right text-slate-600">&euro;{p.grossAmount}</td>
                      <td className="px-4 py-3 text-right text-red-500">&minus;&euro;{p.platformFee}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">&euro;{p.netPayout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
