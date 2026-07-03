"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 text-red-500 rounded-full mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Link</h1>
        <p className="text-slate-500 text-sm mb-6">
          This password reset link is invalid. Please request a new one.
        </p>
        <Link href="/auth/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-3.5 h-3.5" />
          Request New Reset Link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/auth/signin?reset=success");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your new password below.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Min. 6 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-6 text-center">
        <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-slate-900 font-medium hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-slate-500 mt-16 text-center">Loading...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
