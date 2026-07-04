"use client";

import { categoryLabel } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Unlock, TrendingUp, MessageCircle, AlertTriangle, AlertCircle, ChevronRight } from "lucide-react";
import { Stars } from "@/components/ui";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  company: { name: string };
}

interface OpportunityDetail {
  id: string;
  title: string;
  brief: string;
  category: string;
  stage1Price: number;
  stage2Price: number;
  savingsEstimateLow: number;
  savingsEstimateHigh: number;
  confidenceScore: number;
  status: string;
  createdAt: string;
  contributor: { id: string; name: string };
  hasStage1: boolean;
  hasStage2: boolean;
  avgRating: number;
  reviewCount: number;
  reviews: ReviewItem[];
  validationChecklist?: string;
  requirements?: string;
  highLevelApproach?: string;
  watermark?: string;
  fullPlaybook?: string;
  templates?: string;
  watermark2?: string;
}

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [opp, setOpp] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOpp(data);
        setLoading(false);
      });
  }, [id]);

  async function handlePurchase(stage: number) {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setPurchasing(true);
    setPurchaseError("");
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: id, stage }),
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (res.ok) {
        const updated = await fetch(`/api/opportunities/${id}`).then((r) => r.json());
        setOpp(updated);
        setPurchasing(false);
      } else {
        setPurchaseError(data.error || "Purchase failed. Please try again.");
        setPurchasing(false);
      }
    } catch {
      setPurchaseError("Something went wrong. Check your connection and try again.");
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-32 mb-4" />
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="h-6 bg-slate-100 rounded w-3/4 mb-3" />
          <div className="h-4 bg-slate-100 rounded w-full mb-2" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    );
  }
  if (!opp) return <p className="text-red-600">Opportunity not found.</p>;

  const isCompany = session?.user?.role === "company";

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to marketplace
      </Link>

      {purchaseError && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {purchaseError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded capitalize">
            {categoryLabel(opp.category)}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Confidence {Math.round(opp.confidenceScore)}/100
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{opp.title}</h1>

        {opp.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Stars rating={opp.avgRating} />
            <span className="text-sm text-slate-500">
              {opp.avgRating.toFixed(1)} ({opp.reviewCount}{" "}
              {opp.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        <p className="text-slate-600 mb-4 leading-relaxed">{opp.brief}</p>

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <span>
            by {opp.contributor.name}
            {!opp.hasStage2 && opp.contributor.id === null && (
              <span className="ml-1.5 inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                <Lock className="w-3 h-3" />
                Identity revealed after Stage 2
              </span>
            )}
          </span>
          <span>&bull;</span>
          <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
        </div>

        {opp.savingsEstimateLow > 0 && (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6 text-sm text-emerald-700">
            <TrendingUp className="w-4 h-4 shrink-0" />
            Estimated savings: &euro;{opp.savingsEstimateLow.toLocaleString()} — &euro;{opp.savingsEstimateHigh.toLocaleString()}
          </div>
        )}

        {/* ── STAGE 1 ─────────────────────────────────────── */}
        <div className="border-t border-slate-100 pt-6 mt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
            {opp.hasStage1 || opp.validationChecklist ? (
              <Unlock className="w-4 h-4 text-emerald-500" />
            ) : (
              <Lock className="w-4 h-4 text-slate-400" />
            )}
            Stage 1 — Validation &amp; Approach
          </h2>

          {opp.hasStage1 || opp.validationChecklist ? (
            <div className="space-y-4">
              {opp.watermark && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {opp.watermark}
                </div>
              )}
              {opp.validationChecklist && (
                <div>
                  <h3 className="font-medium text-slate-700 text-sm mb-1.5">Validation Checklist</h3>
                  <div className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg leading-relaxed">
                    {opp.validationChecklist}
                  </div>
                </div>
              )}
              {opp.requirements && (
                <div>
                  <h3 className="font-medium text-slate-700 text-sm mb-1.5">Requirements</h3>
                  <div className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg leading-relaxed">
                    {opp.requirements}
                  </div>
                </div>
              )}
              {opp.highLevelApproach && (
                <div>
                  <h3 className="font-medium text-slate-700 text-sm mb-1.5">High-Level Approach</h3>
                  <div className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg leading-relaxed">
                    {opp.highLevelApproach}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-8 text-center">
              <Lock className="w-6 h-6 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">
                This content is sealed. Purchase Stage 1 to unlock the validation checklist, requirements, and high-level approach.
              </p>
              {isCompany && (
                <button
                  onClick={() => handlePurchase(1)}
                  disabled={purchasing}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {purchasing ? "Processing..." : `Unlock Stage 1 — \u20AC${opp.stage1Price}`}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {!session && (
                <p className="text-sm text-slate-400 mt-3">
                  <Link href="/auth/signin" className="text-slate-700 underline underline-offset-2">
                    Sign in
                  </Link>{" "}
                  as a company to purchase.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── STAGE 2 ─────────────────────────────────────── */}
        {opp.stage2Price > 0 && (
          <div className="border-t border-slate-100 pt-6 mt-6">
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              {opp.hasStage2 || opp.fullPlaybook ? (
                <Unlock className="w-4 h-4 text-emerald-500" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              Stage 2 — Full Playbook &amp; Meeting
            </h2>

            {opp.hasStage2 || opp.fullPlaybook ? (
              <div className="space-y-4">
                {opp.watermark2 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {opp.watermark2}
                  </div>
                )}
                {opp.fullPlaybook && (
                  <div>
                    <h3 className="font-medium text-slate-700 text-sm mb-1.5">Full Playbook</h3>
                    <div className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg leading-relaxed">
                      {opp.fullPlaybook}
                    </div>
                  </div>
                )}
                {opp.templates && (
                  <div>
                    <h3 className="font-medium text-slate-700 text-sm mb-1.5">Templates</h3>
                    <div className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg leading-relaxed">
                      {opp.templates}
                    </div>
                  </div>
                )}
                <Link
                  href={`/company/${opp.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages &amp; Meeting
                </Link>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-8 text-center">
                <Lock className="w-6 h-6 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">
                  Get the full step-by-step playbook, templates, and request a meeting with the contributor.
                </p>
                {isCompany && opp.hasStage1 && (
                  <button
                    onClick={() => handlePurchase(2)}
                    disabled={purchasing}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    {purchasing ? "Processing..." : `Unlock Stage 2 — \u20AC${opp.stage2Price}`}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {isCompany && !opp.hasStage1 && (
                  <p className="text-sm text-slate-400 mt-2">Unlock Stage 1 first.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ──────────────────────────────────────── */}
        <div className="border-t border-slate-100 pt-6 mt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Reviews
            {opp.reviewCount > 0 && (
              <span className="text-sm font-normal text-slate-400 ml-2">({opp.reviewCount})</span>
            )}
          </h2>

          {opp.reviews && opp.reviews.length > 0 ? (
            <div className="space-y-3">
              {opp.reviews.map((review) => (
                <div key={review.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-medium">
                        {review.company.name.charAt(0)}
                      </div>
                      <Stars rating={review.rating} />
                      <span className="text-sm font-medium text-slate-700">{review.company.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No reviews yet. Companies who purchase this opportunity can leave a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
