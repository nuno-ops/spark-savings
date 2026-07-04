"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Zap, Lightbulb, Building2 } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"contributor" | "company">("contributor");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, ...(role === "company" && companyName.trim() ? { companyName: companyName.trim() } : {}) }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email,
      password,
      callbackUrl: role === "contributor" ? "/contributor" : "/company",
    });
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl mb-4">
          <Zap className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Create an account</h1>
        <p className="text-sm text-slate-500 mt-1">Get started with Spark Deal for free.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent placeholder:text-slate-400"
            placeholder="John Smith"
          />
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="Min. 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("contributor")}
              className={`flex flex-col items-center gap-1.5 border rounded-lg p-4 text-center ${
                role === "contributor"
                  ? "border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <Lightbulb className={`w-5 h-5 ${role === "contributor" ? "text-slate-900" : "text-slate-400"}`} />
              <span className="font-medium text-sm">Contributor</span>
              <span className="text-xs text-slate-400">I share savings ideas</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("company")}
              className={`flex flex-col items-center gap-1.5 border rounded-lg p-4 text-center ${
                role === "company"
                  ? "border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <Building2 className={`w-5 h-5 ${role === "company" ? "text-slate-900" : "text-slate-400"}`} />
              <span className="font-medium text-sm">Company</span>
              <span className="text-xs text-slate-400">I unlock &amp; buy ideas</span>
            </button>
          </div>
        </div>

        {role === "company" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent placeholder:text-slate-400"
              placeholder="e.g. Acme Corporation"
            />
            <p className="text-xs text-slate-400 mt-1">We&apos;ll highlight savings opportunities relevant to your company.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-6 text-center">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-slate-900 font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
