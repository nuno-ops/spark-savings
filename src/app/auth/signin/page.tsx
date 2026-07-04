"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Zap } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl mb-4">
          <Zap className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Sign in to Spark Deal</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back. Enter your credentials to continue.</p>
      </div>

      {resetSuccess && (
        <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg mb-4 text-sm border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Password reset successfully. Sign in with your new password.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent placeholder:text-slate-400"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-sm text-slate-500 hover:text-slate-900">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-slate-900 font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<p className="text-slate-500 mt-16 text-center">Loading...</p>}>
      <SignInForm />
    </Suspense>
  );
}
