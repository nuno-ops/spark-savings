"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, LayoutDashboard } from "lucide-react";

interface VerifyResult {
  purchase?: { id: string; stage: number; amountEuros: number };
  opportunityId?: string;
  stage?: number;
  alreadyRecorded?: boolean;
  error?: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setResult({ error: "No session ID provided" });
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => { setResult(data); setLoading(false); })
      .catch(() => { setResult({ error: "Failed to verify payment" }); setLoading(false); });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full mx-auto mb-4 animate-pulse" />
        <p className="text-slate-500 text-sm">Verifying your payment...</p>
      </div>
    );
  }

  if (result?.error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full mx-auto mb-4 flex items-center justify-center">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Issue</h1>
        <p className="text-slate-500 text-sm mb-6">{result.error}</p>
        <Link href="/marketplace" className="text-sm text-slate-700 hover:underline inline-flex items-center gap-1.5">
          Return to Marketplace
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="w-14 h-14 bg-emerald-50 rounded-full mx-auto mb-4 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
      <p className="text-slate-600 text-sm mb-1">
        You&apos;ve unlocked <strong>Stage {result?.stage}</strong> for{" "}
        <strong>&euro;{result?.purchase?.amountEuros}</strong>.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        The content is now available on the opportunity page.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href={`/opportunity/${result?.opportunityId}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          View Unlocked Content
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/company"
          className="inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-20 text-center"><p className="text-slate-500">Loading...</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
