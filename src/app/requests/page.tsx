"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Target, Package } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

interface CompanyRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetLow: number | null;
  budgetHigh: number | null;
  status: string;
  createdAt: string;
  company: { name: string };
  _count: { proposals: number };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

    fetch(`/api/requests?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, debouncedSearch]);

  function formatBudget(low: number | null, high: number | null) {
    if (!low && !high) return null;
    if (low && high) return `${low.toLocaleString()} — ${high.toLocaleString()}`;
    if (low) return `${low.toLocaleString()}+`;
    return `Up to ${high!.toLocaleString()}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Company Requests</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Companies looking for cost-saving strategies. Browse and submit your proposals.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-full mb-1" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {debouncedSearch ? "No requests match your search." : "No open requests yet."}
          </p>
          {debouncedSearch && (
            <button onClick={() => setSearch("")} className="mt-2 text-sm text-emerald-600 hover:text-emerald-700">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => {
            const budget = formatBudget(req.budgetLow, req.budgetHigh);
            return (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="group bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600 capitalize">
                    {req.category}
                  </span>
                  {budget && (
                    <span className="text-xs font-semibold text-emerald-600">
                      {budget}
                    </span>
                  )}
                  {!budget && (
                    <span className="text-xs text-slate-400">Open budget</span>
                  )}
                </div>

                <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-emerald-700">
                  {req.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {req.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{req.company.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {req._count.proposals} proposal{req._count.proposals !== 1 ? "s" : ""}
                    </span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
