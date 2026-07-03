"use client";

import { categoryLabel } from "@/lib/constants";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Target, Calendar, Building2, Tag, DollarSign,
  CheckCircle2, XCircle, Send, FileText, AlertTriangle,
} from "lucide-react";

interface Proposal {
  id: string;
  summary: string;
  approach?: string;
  estimatedSavings: number;
  proposedPrice: number;
  status: string;
  opportunityId: string | null;
  createdAt: string;
  contributor: { id: string; name: string };
}

interface RequestDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetLow: number | null;
  budgetHigh: number | null;
  status: string;
  createdAt: string;
  company: { id: string; name: string };
  proposalCount: number;
  proposals: Proposal[];
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Proposal form state (contributor)
  const [summary, setSummary] = useState("");
  const [approach, setApproach] = useState("");
  const [estimatedSavings, setEstimatedSavings] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [hasExistingProposal, setHasExistingProposal] = useState(false);

  // Accept/Reject action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/requests/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => {
          setRequest(data);
          // Pre-fill form if contributor already has a proposal
          if (data.proposals?.length > 0 && session?.user?.role === "contributor") {
            const myProposal = data.proposals.find(
              (p: Proposal) => p.contributor.id === session?.user?.id
            );
            if (myProposal) {
              setSummary(myProposal.summary);
              setApproach(myProposal.approach || "");
              setEstimatedSavings(String(myProposal.estimatedSavings));
              setProposedPrice(String(myProposal.proposedPrice));
              setHasExistingProposal(true);
            }
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Request not found.");
          setLoading(false);
        });
    });
  }, [params, session]);

  async function handleSubmitProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const res = await fetch(`/api/requests/${request.id}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: summary.trim(),
          approach: approach.trim(),
          estimatedSavings: parseInt(estimatedSavings) || 0,
          proposedPrice: parseInt(proposedPrice) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit proposal");
      }

      setFormSuccess(hasExistingProposal ? "Proposal updated successfully!" : "Proposal submitted successfully!");
      setHasExistingProposal(true);

      // Refresh request data
      const refreshed = await fetch(`/api/requests/${request.id}`).then((r) => r.json());
      setRequest(refreshed);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProposalAction(proposalId: string, action: "accepted" | "rejected") {
    if (!request) return;
    setActionLoading(proposalId);

    try {
      const res = await fetch(`/api/requests/${request.id}/proposals/${proposalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Action failed");
        return;
      }

      // Refresh request data
      const refreshed = await fetch(`/api/requests/${request.id}`).then((r) => r.json());
      setRequest(refreshed);
    } finally {
      setActionLoading(null);
    }
  }

  function formatBudget(low: number | null, high: number | null) {
    if (!low && !high) return "Open budget";
    if (low && high) return `€${low.toLocaleString()} — €${high.toLocaleString()}`;
    if (low) return `€${low.toLocaleString()}+`;
    return `Up to €${high!.toLocaleString()}`;
  }

  function proposalStatusBadge(status: string) {
    const m: Record<string, string> = {
      pending: "text-amber-700 bg-amber-50",
      accepted: "text-emerald-700 bg-emerald-50",
      rejected: "text-red-700 bg-red-50",
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-24 mb-6" />
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="h-5 bg-slate-100 rounded w-1/4 mb-3" />
          <div className="h-7 bg-slate-100 rounded w-3/4 mb-4" />
          <div className="h-4 bg-slate-100 rounded w-full mb-2" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-16">
        <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">{error || "Request not found"}</p>
        <Link href="/requests" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
          Back to requests
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === request.company.id;
  const isContributor = session?.user?.role === "contributor";
  const isAdmin = session?.user?.role === "admin";
  const myProposal = isContributor
    ? request.proposals.find((p) => p.contributor.id === session?.user?.id)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Back link */}
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All Requests
      </Link>

      {/* Request detail card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600 capitalize">
            <Tag className="w-3 h-3" />
            {categoryLabel(request.category)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${requestStatusBadge(request.status)}`}>
            {request.status}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">{request.title}</h1>

        {/* Budget banner */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 mb-4">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">
            Budget: {formatBudget(request.budgetLow, request.budgetHigh)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">
          {request.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-4 border-t border-slate-100">
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {request.company.name}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(request.createdAt).toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            {request.proposalCount} proposal{request.proposalCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ═══ COMPANY OWNER VIEW — Proposals List ═══ */}
      {(isOwner || isAdmin) && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Proposals ({request.proposals.length})
          </h2>

          {request.proposals.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No proposals yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {request.proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
                          {proposal.contributor.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-medium text-slate-900 text-sm">
                          {proposal.contributor.name}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${proposalStatusBadge(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">
                        €{proposal.proposedPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">proposed price</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Summary</p>
                    <p className="text-sm text-slate-600">{proposal.summary}</p>
                  </div>

                  {proposal.approach && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Approach</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{proposal.approach}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span>Est. savings: €{proposal.estimatedSavings.toLocaleString()}</span>
                    <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Accept/Reject buttons — only for pending proposals on open requests */}
                  {proposal.status === "pending" && request.status === "open" && isOwner && (
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleProposalAction(proposal.id, "accepted")}
                        disabled={actionLoading === proposal.id}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 font-medium disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleProposalAction(proposal.id, "rejected")}
                        disabled={actionLoading === proposal.id}
                        className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-500 font-medium disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Accepted — link to create opportunity */}
                  {proposal.status === "accepted" && !proposal.opportunityId && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-emerald-600 font-medium">
                        Proposal accepted! The contributor can now create a full opportunity.
                      </p>
                    </div>
                  )}

                  {proposal.status === "accepted" && proposal.opportunityId && (
                    <div className="pt-3 border-t border-slate-100">
                      <Link
                        href={`/company/${proposal.opportunityId}`}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                      >
                        View linked opportunity →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ CONTRIBUTOR VIEW — My Proposal Status ═══ */}
      {isContributor && myProposal && myProposal.status !== "pending" && (
        <div className={`mb-6 p-4 rounded-lg border ${
          myProposal.status === "accepted"
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            {myProposal.status === "accepted" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`text-sm font-medium ${
              myProposal.status === "accepted" ? "text-emerald-700" : "text-red-700"
            }`}>
              Your proposal was {myProposal.status}.
              {myProposal.status === "accepted" && (
                <>
                  {" "}
                  <Link href="/contributor/new" className="underline underline-offset-2">
                    Create an opportunity
                  </Link>{" "}
                  to deliver on this request.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ═══ CONTRIBUTOR VIEW — Proposal Form ═══ */}
      {isContributor && request.status === "open" && (!myProposal || myProposal.status === "pending") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            {hasExistingProposal ? "Edit Your Proposal" : "Submit a Proposal"}
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            Describe your approach and how you would help this company save costs.
          </p>

          {formSuccess && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {formSuccess}
            </div>
          )}

          {formError && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitProposal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Briefly describe your proposed solution..."
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-slate-400 mt-1">{summary.length}/2000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Detailed Approach <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={approach}
                onChange={(e) => setApproach(e.target.value)}
                placeholder="Explain your methodology, timeline, and how you plan to achieve savings..."
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-slate-400 mt-1">{approach.length}/10000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estimated Savings (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedSavings}
                  onChange={(e) => setEstimatedSavings(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proposed Price (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting
                ? "Submitting..."
                : hasExistingProposal
                ? "Update Proposal"
                : "Submit Proposal"}
            </button>
          </form>
        </div>
      )}

      {/* Not signed in prompt */}
      {!session && request.status === "open" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-3">
            Sign in as a contributor to submit a proposal for this request.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Close request button (owner only) */}
      {isOwner && request.status === "open" && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={async () => {
              if (!confirm("Close this request? It will no longer accept new proposals.")) return;
              await fetch(`/api/requests/${request.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "closed" }),
              });
              const refreshed = await fetch(`/api/requests/${request.id}`).then((r) => r.json());
              setRequest(refreshed);
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Close this request
          </button>
        </div>
      )}
    </div>
  );
}
