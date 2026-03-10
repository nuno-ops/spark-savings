"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export default function NewRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    budgetLow: "",
    budgetHigh: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          budgetLow: form.budgetLow ? parseInt(form.budgetLow) : null,
          budgetHigh: form.budgetHigh ? parseInt(form.budgetHigh) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create request");
      }

      router.push("/company");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 animate-pulse">
        <div className="h-7 bg-slate-100 rounded w-48 mb-8" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (session?.user?.role !== "company") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center py-16">
        <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Only company accounts can create requests.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Request</h1>
      <p className="text-sm text-slate-500 mb-6">
        Describe the area where you need cost-saving strategies. Contributors will submit proposals.
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Reduce cloud infrastructure costs"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
              maxLength={200}
            />
            <p className="text-xs text-slate-400 mt-1">{form.title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the problem area, your current setup, what you've tried, and what kind of savings you're hoping for..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
              maxLength={5000}
            />
            <p className="text-xs text-slate-400 mt-1">{form.description.length}/5000</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Budget range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Budget Range (€) <span className="text-slate-400 font-normal">— optional</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min="0"
                  value={form.budgetLow}
                  onChange={(e) => updateField("budgetLow", e.target.value)}
                  placeholder="Min (e.g. 250)"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  value={form.budgetHigh}
                  onChange={(e) => updateField("budgetHigh", e.target.value)}
                  placeholder="Max (e.g. 1000)"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Leave empty for an open budget. This helps contributors gauge their pricing.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push("/company")}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saving ? "Posting..." : "Post Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
