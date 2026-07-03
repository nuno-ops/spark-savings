"use client";

import { categoryLabel } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DollarSign, Users, AlertTriangle, Ban, FileText, Clock,
  CheckCircle2, XCircle, Search, ArrowUpDown, Shield, Eye,
  Star as StarIcon, Target, Tag, Building2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
type AdminTab = "overview" | "opportunities" | "users" | "flagged" | "refunds" | "requests";

interface AdminStats {
  opportunitiesByStatus: Record<string, number>;
  totalUsers: number;
  usersByRole: Record<string, number>;
  pendingRefunds: number;
  totalRevenue: number;
  platformFees: number;
  flaggedCount: number;
  suspendedUsers: number;
}

interface AdminOpportunity {
  id: string; title: string; brief: string; company: string; category: string;
  status: string; confidenceScore: number; piiDetected: boolean;
  flagReason: string | null; duplicateOfId: string | null; createdAt: string;
  contributor: { id: string; name: string; email: string };
  _count: { purchases: number; reviews: number };
}

interface AdminUser {
  id: string; name: string; email: string; role: string; suspended: boolean;
  createdAt: string;
  _count: { opportunities: number; purchases: number; reviews: number };
}

interface FlaggedOpp {
  id: string; title: string; brief: string; status: string; flagReason: string;
  piiDetected: boolean; confidenceScore: number; duplicateOfId: string | null;
  contributor: { name: string; email: string };
}

interface RefundRequest {
  id: string; stage: number; amountEuros: number; status: string;
  refundRequestedAt: string;
  company: { name: string; email: string };
  opportunity: { title: string };
}

interface AdminRequest {
  id: string; title: string; description: string; category: string;
  budgetLow: number | null; budgetHigh: number | null; status: string;
  createdAt: string;
  company: { id: string; name: string; email: string };
  _count: { proposals: number };
}

// ─── Helpers ────────────────────────────────────────────
function statusBadge(status: string) {
  const m: Record<string, string> = {
    published: "text-emerald-700 bg-emerald-50",
    flagged: "text-red-700 bg-red-50",
    suspended: "text-amber-700 bg-amber-50",
    draft: "text-slate-500 bg-slate-100",
  };
  return m[status] || "text-slate-500 bg-slate-100";
}

function requestStatusBadge(status: string) {
  const m: Record<string, string> = {
    open: "text-emerald-700 bg-emerald-50",
    closed: "text-slate-500 bg-slate-100",
    suspended: "text-red-700 bg-red-50",
  };
  return m[status] || "text-slate-500 bg-slate-100";
}

function scoreBarColor(score: number) {
  if (score >= 60) return "bg-emerald-500";
  if (score >= 30) return "bg-amber-500";
  return "bg-red-500";
}

// ─── Component ──────────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [oppStatusFilter, setOppStatusFilter] = useState("all");
  const [oppSearch, setOppSearch] = useState("");
  const [oppDebouncedSearch, setOppDebouncedSearch] = useState("");
  const [oppSort, setOppSort] = useState("createdAt-desc");
  const [oppLoading, setOppLoading] = useState(false);
  const [oppLoaded, setOppLoaded] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userDebouncedSearch, setUserDebouncedSearch] = useState("");
  const [userSuspendedFilter, setUserSuspendedFilter] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [flagged, setFlagged] = useState<FlaggedOpp[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [reqSearch, setReqSearch] = useState("");
  const [reqDebouncedSearch, setReqDebouncedSearch] = useState("");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqLoaded, setReqLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status !== "authenticated") return;
    if (session?.user?.role !== "admin") { router.push("/"); return; }
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/flagged").then((r) => r.json()),
      fetch("/api/admin/refunds").then((r) => r.json()),
    ]).then(([statsData, flaggedData, refundsData]) => {
      setStats(statsData);
      setFlagged(Array.isArray(flaggedData) ? flaggedData : []);
      setRefunds(Array.isArray(refundsData) ? refundsData : []);
      setLoading(false);
    });
  }, [status, session, router]);

  useEffect(() => { const t = setTimeout(() => setOppDebouncedSearch(oppSearch), 300); return () => clearTimeout(t); }, [oppSearch]);
  useEffect(() => { const t = setTimeout(() => setUserDebouncedSearch(userSearch), 300); return () => clearTimeout(t); }, [userSearch]);
  useEffect(() => { const t = setTimeout(() => setReqDebouncedSearch(reqSearch), 300); return () => clearTimeout(t); }, [reqSearch]);

  useEffect(() => {
    if (tab !== "opportunities") return;
    setOppLoading(true);
    const [sortField, sortOrder] = oppSort.split("-");
    const params = new URLSearchParams();
    if (oppStatusFilter !== "all") params.set("status", oppStatusFilter);
    if (oppDebouncedSearch) params.set("search", oppDebouncedSearch);
    params.set("sort", sortField); params.set("order", sortOrder);
    fetch(`/api/admin/opportunities?${params}`).then((r) => r.json()).then((data) => {
      setOpportunities(Array.isArray(data) ? data : []);
      setOppLoading(false); setOppLoaded(true);
    });
  }, [tab, oppStatusFilter, oppDebouncedSearch, oppSort]);

  useEffect(() => {
    if (tab !== "users") return;
    setUsersLoading(true);
    const params = new URLSearchParams();
    if (userRoleFilter !== "all") params.set("role", userRoleFilter);
    if (userDebouncedSearch) params.set("search", userDebouncedSearch);
    if (userSuspendedFilter) params.set("suspended", userSuspendedFilter);
    fetch(`/api/admin/users?${params}`).then((r) => r.json()).then((data) => {
      setUsers(Array.isArray(data) ? data : []);
      setUsersLoading(false); setUsersLoaded(true);
    });
  }, [tab, userRoleFilter, userDebouncedSearch, userSuspendedFilter]);

  useEffect(() => {
    if (tab !== "requests") return;
    setReqLoading(true);
    const params = new URLSearchParams();
    if (reqStatusFilter !== "all") params.set("status", reqStatusFilter);
    if (reqDebouncedSearch) params.set("search", reqDebouncedSearch);
    fetch(`/api/admin/requests?${params}`).then((r) => r.json()).then((data) => {
      setAdminRequests(Array.isArray(data) ? data : []);
      setReqLoading(false); setReqLoaded(true);
    });
  }, [tab, reqStatusFilter, reqDebouncedSearch]);

  async function suspendRequest(id: string) { await fetch("/api/admin/suspend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "request", id, suspend: true }) }); setAdminRequests((p) => p.map((r) => (r.id === id ? { ...r, status: "suspended" } : r))); refreshStats(); }
  async function unsuspendRequest(id: string) { await fetch("/api/admin/suspend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "request", id, suspend: false }) }); setAdminRequests((p) => p.map((r) => (r.id === id ? { ...r, status: "open" } : r))); refreshStats(); }

  async function refreshStats() { const data = await fetch("/api/admin/stats").then((r) => r.json()); setStats(data); }
  async function approveOpportunity(id: string) { await fetch(`/api/opportunities/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "published" }) }); setFlagged((p) => p.filter((f) => f.id !== id)); setOpportunities((p) => p.map((o) => (o.id === id ? { ...o, status: "published" } : o))); refreshStats(); }
  async function publishOpportunity(id: string) { await fetch(`/api/opportunities/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "published" }) }); setOpportunities((p) => p.map((o) => (o.id === id ? { ...o, status: "published" } : o))); refreshStats(); }
  async function suspendOpportunity(id: string) { await fetch("/api/admin/suspend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "opportunity", id, suspend: true }) }); setFlagged((p) => p.filter((f) => f.id !== id)); setOpportunities((p) => p.map((o) => (o.id === id ? { ...o, status: "suspended" } : o))); refreshStats(); }
  async function unsuspendOpportunity(id: string) { await fetch("/api/admin/suspend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "opportunity", id, suspend: false }) }); setOpportunities((p) => p.map((o) => (o.id === id ? { ...o, status: "draft" } : o))); refreshStats(); }
  async function toggleUserSuspension(userId: string, currentlySuspended: boolean) { if (userId === session?.user?.id) return; await fetch("/api/admin/suspend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "user", id: userId, suspend: !currentlySuspended }) }); setUsers((p) => p.map((u) => (u.id === userId ? { ...u, suspended: !currentlySuspended } : u))); refreshStats(); }
  async function handleRefund(purchaseId: string, action: "approve" | "deny") { await fetch("/api/admin/refunds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId, action }) }); setRefunds((p) => p.filter((r) => r.id !== purchaseId)); refreshStats(); }

  if (status === "loading" || loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-48 mb-8" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const totalOpps = stats ? Object.values(stats.opportunitiesByStatus).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {([
          ["overview", "Overview"],
          ["opportunities", `Opportunities (${totalOpps})`],
          ["users", `Users (${stats?.totalUsers ?? 0})`],
          ["flagged", `Flagged (${flagged.length})`],
          ["refunds", `Refunds (${refunds.length})`],
          ["requests", `Requests (${reqLoaded ? adminRequests.length : "…"})`],
        ] as [AdminTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap -mb-px ${
              tab === key ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
            }`}
          >{label}</button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {tab === "overview" && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Revenue", value: `\u20AC${stats.totalRevenue.toLocaleString()}`, icon: DollarSign },
              { label: "Platform Fees", value: `\u20AC${stats.platformFees.toLocaleString()}`, icon: DollarSign },
              { label: "Total Users", value: String(stats.totalUsers), icon: Users },
              { label: "Pending Refunds", value: String(stats.pendingRefunds), icon: Clock },
              { label: "Published", value: String(stats.opportunitiesByStatus.published || 0), icon: FileText },
              { label: "Draft", value: String(stats.opportunitiesByStatus.draft || 0), icon: FileText },
              { label: "Flagged Items", value: String(stats.flaggedCount), icon: AlertTriangle },
              { label: "Suspended Users", value: String(stats.suspendedUsers), icon: Ban },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Users by Role</h3>
            <div className="flex gap-8">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-400 capitalize">{role}s</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ OPPORTUNITIES ═══ */}
      {tab === "opportunities" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={oppSearch} onChange={(e) => setOppSearch(e.target.value)} placeholder="Search..." className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400" />
            </div>
            <select value={oppStatusFilter} onChange={(e) => setOppStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="flagged">Flagged</option>
              <option value="suspended">Suspended</option>
            </select>
            <select value={oppSort} onChange={(e) => setOppSort(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="confidenceScore-desc">Highest Score</option>
              <option value="confidenceScore-asc">Lowest Score</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>
          {oppLoading && !oppLoaded ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : opportunities.length === 0 ? (
            <p className="text-slate-400 text-sm">No opportunities found.</p>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm">{opp.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{opp.brief}</p>
                      <div className="flex flex-wrap gap-2.5 mt-2 text-xs text-slate-400">
                        <span>by {opp.contributor.name}</span>
                        <span className="capitalize">{categoryLabel(opp.category)}</span>
                        <span>{opp._count.purchases} purchases</span>
                        <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 ml-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusBadge(opp.status)}`}>{opp.status}</span>
                      <span className="text-xs text-slate-400">{Math.round(opp.confidenceScore)}/100</span>
                    </div>
                  </div>
                  {(opp.piiDetected || opp.flagReason || opp.duplicateOfId) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {opp.piiDetected && <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded">PII Detected</span>}
                      {opp.flagReason && <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{opp.flagReason}</span>}
                      {opp.duplicateOfId && <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Possible Duplicate</span>}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    {opp.status === "draft" && <button onClick={() => publishOpportunity(opp.id)} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Publish</button>}
                    {opp.status === "flagged" && <button onClick={() => approveOpportunity(opp.id)} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Approve</button>}
                    {opp.status !== "suspended" ? (
                      <button onClick={() => suspendOpportunity(opp.id)} className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-500 font-medium"><Ban className="w-3.5 h-3.5" />Suspend</button>
                    ) : (
                      <button onClick={() => unsuspendOpportunity(opp.id)} className="inline-flex items-center gap-1.5 bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-slate-500 font-medium">Unsuspend</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ USERS ═══ */}
      {tab === "users" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search..." className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400" />
            </div>
            <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="all">All Roles</option>
              <option value="contributor">Contributor</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
            <select value={userSuspendedFilter} onChange={(e) => setUserSuspendedFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">All Users</option>
              <option value="true">Suspended Only</option>
              <option value="false">Active Only</option>
            </select>
          </div>
          {usersLoading && !usersLoaded ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-400 text-sm">No users found.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm">{user.name}</h3>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">{user.role}</span>
                      {user.suspended && <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded">Suspended</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 ml-9">{user.email}</p>
                    <div className="flex gap-3 mt-1 ml-9 text-xs text-slate-400">
                      <span>{user._count.opportunities} opps</span>
                      <span>{user._count.purchases} purchases</span>
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user.id !== session?.user?.id && (
                    <button onClick={() => toggleUserSuspension(user.id, user.suspended)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${user.suspended ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-red-600 text-white hover:bg-red-500"}`}
                    >{user.suspended ? "Unsuspend" : "Suspend"}</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ FLAGGED ═══ */}
      {tab === "flagged" && (
        <div className="space-y-3">
          {flagged.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No flagged submissions. All clear.</p>
            </div>
          ) : flagged.map((opp) => (
            <div key={opp.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm">{opp.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{opp.brief}</p>
              <p className="text-xs text-slate-400 mt-1.5">by {opp.contributor.name} ({opp.contributor.email})</p>

              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-700 mb-2">Triage Breakdown</p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Confidence Score</span>
                    <span className="font-medium">{Math.round(opp.confidenceScore)}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${scoreBarColor(opp.confidenceScore)}`} style={{ width: `${Math.max(opp.confidenceScore, 2)}%` }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${opp.piiDetected ? "bg-red-500" : "bg-emerald-500"}`} />
                    <span className="text-slate-600">PII: {opp.piiDetected ? <span className="text-red-600 font-medium">Found (-20 pts)</span> : <span className="text-emerald-600">Clean</span>}</span>
                  </div>
                  {opp.flagReason && opp.flagReason.toLowerCase().includes("confidential") && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-slate-600">Confidential Keywords <span className="text-red-600 font-medium">(-15 pts)</span></span>
                    </div>
                  )}
                  {opp.duplicateOfId && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-slate-600">Possible Duplicate <span className="text-amber-600 font-medium">(-10 pts)</span></span>
                    </div>
                  )}
                </div>
                {opp.flagReason && (
                  <div className="mt-2 bg-red-50 border border-red-100 rounded p-2 text-xs text-red-700">
                    <strong>Reason:</strong> {opp.flagReason}
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => approveOpportunity(opp.id)} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Approve &amp; Publish</button>
                <button onClick={() => suspendOpportunity(opp.id)} className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-500 font-medium"><Ban className="w-3.5 h-3.5" />Suspend</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ REFUNDS ═══ */}
      {tab === "refunds" && (
        <div>
          {refunds.length > 0 && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-sm text-amber-700">
              <Clock className="w-4 h-4 shrink-0" />
              <span><strong>{refunds.length} pending refund{refunds.length !== 1 ? "s" : ""}</strong> totalling &euro;{refunds.reduce((sum, r) => sum + r.amountEuros, 0).toLocaleString()}</span>
            </div>
          )}
          <div className="space-y-3">
            {refunds.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No pending refund requests.</p>
              </div>
            ) : refunds.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 text-sm">{r.opportunity.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Stage {r.stage} &mdash; &euro;{r.amountEuros}</p>
                <p className="text-xs text-slate-400 mt-1">Requested by {r.company.name} ({r.company.email}) on {new Date(r.refundRequestedAt).toLocaleString()}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleRefund(r.id, "approve")} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Approve Refund</button>
                  <button onClick={() => handleRefund(r.id, "deny")} className="inline-flex items-center gap-1.5 bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-slate-500 font-medium"><XCircle className="w-3.5 h-3.5" />Deny</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ REQUESTS ═══ */}
      {tab === "requests" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={reqSearch} onChange={(e) => setReqSearch(e.target.value)} placeholder="Search requests..." className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400" />
            </div>
            <select value={reqStatusFilter} onChange={(e) => setReqStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          {reqLoading && !reqLoaded ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : adminRequests.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No company requests found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm">{req.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{req.description}</p>
                      <div className="flex flex-wrap gap-2.5 mt-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {req.company.name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span className="capitalize">{categoryLabel(req.category)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {req._count.proposals} proposals
                        </span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        {(req.budgetLow || req.budgetHigh) && (
                          <span className="inline-flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {req.budgetLow && req.budgetHigh
                              ? `€${req.budgetLow.toLocaleString()} — €${req.budgetHigh.toLocaleString()}`
                              : req.budgetLow
                              ? `€${req.budgetLow.toLocaleString()}+`
                              : `Up to €${req.budgetHigh!.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ml-3 shrink-0 ${requestStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {req.status !== "suspended" ? (
                      <button onClick={() => suspendRequest(req.id)} className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-500 font-medium"><Ban className="w-3.5 h-3.5" />Suspend</button>
                    ) : (
                      <button onClick={() => unsuspendRequest(req.id)} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Unsuspend</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
