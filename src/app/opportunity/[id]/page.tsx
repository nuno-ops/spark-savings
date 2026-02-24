"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  // Stage 1 content (only if unlocked)
  validationChecklist?: string;
  requirements?: string;
  highLevelApproach?: string;
  watermark?: string;
  // Stage 2 content (only if unlocked)
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
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id, stage }),
    });
    const data = await res.json();

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else if (res.ok) {
      // Dev mode — reload to show content
      window.location.reload();
    } else {
      alert(data.error || "Purchase failed");
      setPurchasing(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!opp) return <p className="text-red-600">Opportunity not found.</p>;

  const isCompany = session?.user?.role === "company";

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="text-indigo-600 text-sm hover:underline">
        &larr; Back to marketplace
      </Link>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
            {opp.category}
          </span>
          <span className="text-sm text-gray-400">
            Score: {Math.round(opp.confidenceScore)}/100
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{opp.title}</h1>
        <p className="text-gray-600 mb-6">{opp.brief}</p>

        <div className="text-sm text-gray-500 mb-6">
          by {opp.contributor.name} &bull;{" "}
          {new Date(opp.createdAt).toLocaleDateString()}
        </div>

        {opp.savingsEstimateLow > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm text-green-800">
            Estimated savings: €{opp.savingsEstimateLow.toLocaleString()} — €
            {opp.savingsEstimateHigh.toLocaleString()}
          </div>
        )}

        {/* ── STAGE 1 ─────────────────────────────────────── */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Stage 1 — Validation &amp; Approach
          </h2>

          {opp.hasStage1 || opp.validationChecklist ? (
            <div className="space-y-4">
              {opp.watermark && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded">
                  {opp.watermark}
                </div>
              )}
              {opp.validationChecklist && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm mb-1">
                    Validation Checklist
                  </h3>
                  <div className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {opp.validationChecklist}
                  </div>
                </div>
              )}
              {opp.requirements && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm mb-1">
                    Requirements
                  </h3>
                  <div className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {opp.requirements}
                  </div>
                </div>
              )}
              {opp.highLevelApproach && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm mb-1">
                    High-Level Approach
                  </h3>
                  <div className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {opp.highLevelApproach}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">
                This content is sealed. Purchase Stage 1 to unlock the
                validation checklist, requirements, and high-level approach.
              </p>
              {isCompany && (
                <button
                  onClick={() => handlePurchase(1)}
                  disabled={purchasing}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {purchasing
                    ? "Processing..."
                    : `Unlock Stage 1 — €${opp.stage1Price}`}
                </button>
              )}
              {!session && (
                <p className="text-sm text-gray-400 mt-2">
                  <Link
                    href="/auth/signin"
                    className="text-indigo-600 underline"
                  >
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
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Stage 2 — Full Playbook &amp; Meeting
            </h2>

            {opp.hasStage2 || opp.fullPlaybook ? (
              <div className="space-y-4">
                {opp.watermark2 && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded">
                    {opp.watermark2}
                  </div>
                )}
                {opp.fullPlaybook && (
                  <div>
                    <h3 className="font-medium text-gray-700 text-sm mb-1">
                      Full Playbook
                    </h3>
                    <div className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {opp.fullPlaybook}
                    </div>
                  </div>
                )}
                {opp.templates && (
                  <div>
                    <h3 className="font-medium text-gray-700 text-sm mb-1">
                      Templates
                    </h3>
                    <div className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {opp.templates}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/company/${opp.id}`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
                  >
                    Messages &amp; Meeting
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">
                  Get the full step-by-step playbook, templates, and request a
                  meeting with the contributor.
                </p>
                {isCompany && opp.hasStage1 && (
                  <button
                    onClick={() => handlePurchase(2)}
                    disabled={purchasing}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {purchasing
                      ? "Processing..."
                      : `Unlock Stage 2 — €${opp.stage2Price}`}
                  </button>
                )}
                {isCompany && !opp.hasStage1 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Unlock Stage 1 first.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
