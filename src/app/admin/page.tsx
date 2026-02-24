"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FlaggedOpp {
  id: string;
  title: string;
  brief: string;
  status: string;
  flagReason: string;
  piiDetected: boolean;
  confidenceScore: number;
  contributor: { name: string; email: string };
}

interface RefundRequest {
  id: string;
  stage: number;
  amountEuros: number;
  status: string;
  refundRequestedAt: string;
  company: { name: string; email: string };
  opportunity: { title: string };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [flagged, setFlagged] = useState<FlaggedOpp[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [tab, setTab] = useState<"flagged" | "refunds">("flagged");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status !== "authenticated") return;
    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }

    Promise.all([
      fetch("/api/admin/flagged").then((r) => r.json()),
      fetch("/api/admin/refunds").then((r) => r.json()),
    ]).then(([flaggedData, refundsData]) => {
      setFlagged(Array.isArray(flaggedData) ? flaggedData : []);
      setRefunds(Array.isArray(refundsData) ? refundsData : []);
      setLoading(false);
    });
  }, [status, session, router]);

  async function approveOpportunity(id: string) {
    await fetch(`/api/opportunities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    setFlagged(flagged.filter((f) => f.id !== id));
  }

  async function suspendOpportunity(id: string) {
    await fetch("/api/admin/suspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "opportunity", id, suspend: true }),
    });
    setFlagged(flagged.filter((f) => f.id !== id));
  }

  async function handleRefund(purchaseId: string, action: "approve" | "deny") {
    await fetch("/api/admin/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId, action }),
    });
    setRefunds(refunds.filter((r) => r.id !== purchaseId));
  }

  if (status === "loading" || loading) {
    return <p className="text-gray-500">Loading admin panel...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("flagged")}
          className={`pb-2 text-sm font-medium ${
            tab === "flagged"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500"
          }`}
        >
          Flagged Submissions ({flagged.length})
        </button>
        <button
          onClick={() => setTab("refunds")}
          className={`pb-2 text-sm font-medium ${
            tab === "refunds"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500"
          }`}
        >
          Refund Requests ({refunds.length})
        </button>
      </div>

      {/* Flagged Submissions */}
      {tab === "flagged" && (
        <div className="space-y-4">
          {flagged.length === 0 ? (
            <p className="text-gray-500 text-sm">No flagged submissions.</p>
          ) : (
            flagged.map((opp) => (
              <div
                key={opp.id}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{opp.brief}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      by {opp.contributor.name} ({opp.contributor.email})
                    </p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    Score: {Math.round(opp.confidenceScore)}
                  </span>
                </div>

                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  <strong>Flag reason:</strong> {opp.flagReason}
                  {opp.piiDetected && (
                    <span className="ml-2 bg-red-200 text-red-900 px-2 py-0.5 rounded text-xs">
                      PII Detected
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => approveOpportunity(opp.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    Approve &amp; Publish
                  </button>
                  <button
                    onClick={() => suspendOpportunity(opp.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Refund Requests */}
      {tab === "refunds" && (
        <div className="space-y-4">
          {refunds.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending refund requests.</p>
          ) : (
            refunds.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {r.opportunity.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Stage {r.stage} — €{r.amountEuros}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Requested by {r.company.name} ({r.company.email}) on{" "}
                      {new Date(r.refundRequestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleRefund(r.id, "approve")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    Approve Refund
                  </button>
                  <button
                    onClick={() => handleRefund(r.id, "deny")}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
