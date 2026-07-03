"use client";

import { categoryLabel } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign, ExternalLink, RotateCcw, ShoppingBag,
  Target, Plus, Calendar, Tag, Building2, Check, Info, AlertCircle,
} from "lucide-react";

type CompanyTab = "purchases" | "requests";

interface Purchase {
  id: string;
  stage: number;
  amountEuros: number;
  status: string;
  createdAt: string;
  opportunity: { id: string; title: string; category: string };
}

interface CompanyRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetLow: number | null;
  budgetHigh: number | null;
  status: string;
  createdAt: string;
  proposalCount: number;
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<CompanyTab>("purchases");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [savedCompanyName, setSavedCompanyName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [refundError, setRefundError] = useState("");

  // Load purchases on auth
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status !== "authenticated") return;

    fetch("/api/purchases")
      .then((r) => r.json())
      .then((data) => {
        setPurchases(Array.isArray(data) ? data : []);
        setLoading(false);
      });

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setCompanyName(data.companyName || "");
        setSavedCompanyName(data.companyName || "");
      });
  }, [status, router]);

  // Load requests lazily when tab switches
  useEffect(() => {
    if (tab !== "requests" || requestsLoaded) return;

    fetch("/api/requests?mine=true")
      .then((r) => r.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setRequestsLoaded(true);
      });
  }, [tab, requestsLoaded]);

  async function requestRefund(purchaseId: string) {
    setRefundError("");
    const res = await fetch(`/api/purchases/${purchaseId}/refund`, { method: "POST" });
    if (res.ok) {
      setPurchases(purchases.map((p) => p.id === purchaseId ? { ...p, status: "refund_requested" } : p));
    } else {
      const data = await res.json();
      setRefundError(data.error || "Refund request failed. Please try again.");
    }
  }

  async function saveCompanyName() {
    setSavingProfile(true);
    setProfileSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName: companyName.trim() }),
    });
    setSavingProfile(false);
    if (res.ok) {
      setSavedCompanyName(companyName.trim());
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 4000);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-48 mb-2" />
        <div className="h-4 bg-slate-100 rounded w-32 mb-8" />
        <div className="h-24 bg-slate-100 rounded-lg mb-8" />
        <div className="h-16 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  const totalSpent = purchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amountEuros, 0);

  const statusLabel = (s: string) => {
    const map: Record<string, { text: string; cls: string }> = {
      completed: { text: "Active", cls: "text-emerald-700 bg-emerald-50" },
      refund_requested: { text: "Refund Pending", cls: "text-amber-700 bg-amber-50" },
      refunded: { text: "Refunded", cls: "text-slate-500 bg-slate-100" },
    };
    return map[s] || { text: s, cls: "text-slate-500 bg-slate-100" };
  };

  const requestStatusBadge = (s: string) => {
    const map: Record<string, string> = {
      open: "text-emerald-700 bg-emerald-50",
      closed: "text-slate-500 bg-slate-100",
      suspended: "text-red-700 bg-red-50",
    };
    return map[s] || "text-slate-500 bg-slate-100";
  };

  function formatBudget(low: number | null, high: number | null) {
    if (!low && !high) return "Open budget";
    if (low && high) return `€${low.toLocaleString()} — €${high.toLocaleString()}`;
    if (low) return `€${low.toLocaleString()}+`;
    return `Up to €${high!.toLocaleString()}`;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {session?.user?.name}</p>
        </div>
        <Link
          href="/company/new-request"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* Stat card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Spent</p>
          <p className="text-2xl font-bold text-slate-900">&euro;{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Company Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Company Profile</h2>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={saveCompanyName}
            disabled={savingProfile || companyName.trim() === savedCompanyName}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
          >
            {savingProfile ? "Saving..." : "Save"}
          </button>
        </div>
        {profileSaved && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs mt-2">
            <Check className="w-3.5 h-3.5" />
            Saved! Sign out and back in to see updated marketplace recommendations.
          </div>
        )}
        {!savedCompanyName && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
            <Info className="w-3.5 h-3.5" />
            Set your company name to see relevant opportunities highlighted in the marketplace.
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {([
          ["purchases", `Purchases (${purchases.length})`],
          ["requests", `My Requests (${requestsLoaded ? requests.length : "…"})`],
        ] as [CompanyTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap -mb-px ${
              tab === key
                ? "text-slate-900 border-b-2 border-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══ PURCHASES TAB ═══ */}
      {tab === "purchases" && (
        <>
          {refundError && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {refundError}
            </div>
          )}
          {purchases.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No purchases yet.</p>
              <Link href="/marketplace" className="text-sm text-slate-700 underline underline-offset-2 mt-1.5 inline-block">
                Browse the marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {purchases.map((p) => {
                const sl = statusLabel(p.status);
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Link href={`/company/${p.opportunity.id}`} className="font-medium text-slate-900 hover:text-slate-600 text-sm">
                        {p.opportunity.title}
                      </Link>
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Stage {p.stage}
                        </span>
                        <span className="text-xs text-slate-400">&euro;{p.amountEuros}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${sl.cls}`}>
                          {sl.text}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/company/${p.opportunity.id}`} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="View">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {p.status === "completed" && (
                        <button
                          onClick={() => requestRefund(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Request Refund"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ MY REQUESTS TAB ═══ */}
      {tab === "requests" && (
        <>
          {!requestsLoaded ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No requests yet.</p>
              <Link href="/company/new-request" className="text-sm text-slate-700 underline underline-offset-2 mt-1.5 inline-block">
                Post your first request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Link key={req.id} href={`/requests/${req.id}`} className="block">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm">{req.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{req.description}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ml-3 shrink-0 ${requestStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span className="capitalize">{categoryLabel(req.category)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatBudget(req.budgetLow, req.budgetHigh)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {req.proposalCount} proposal{req.proposalCount !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
