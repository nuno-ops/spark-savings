"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for monitoring (replace with your error service)
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-slate-500 mb-8 max-w-md">
        An unexpected error occurred. You can try again or head back to the
        homepage. If the problem persists, please contact support.
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-lg font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>

      {/* Error digest for support */}
      {error.digest && (
        <p className="text-xs text-slate-400 mt-8">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
