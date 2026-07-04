"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "spark-savings-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 text-sm text-slate-600">
          <Cookie className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <p>
            We use essential cookies for authentication and optional analytics
            cookies to help contributors understand how their listings perform.
            No advertising or cross-site tracking.{" "}
            <Link href="/legal/privacy" className="text-slate-900 font-medium hover:underline">
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
