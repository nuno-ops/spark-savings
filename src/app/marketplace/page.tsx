"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { Search, Package, SlidersHorizontal, UserRound, Building2, Sparkles } from "lucide-react";
import { StarRating, EmptyState, CardSkeleton } from "@/components/ui";

interface Opportunity {
  id: string;
  title: string;
  brief: string;
  company: string;
  category: string;
  stage1Price: number;
  stage2Price: number;
  confidenceScore: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  contributor: { name: string };
  matchesCompany: boolean;
}

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [category, setCategory] = useState("all");
  const [priceTier, setPriceTier] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (priceTier) params.set("priceTier", priceTier);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

    fetch(`/api/opportunities?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      });
  }, [category, priceTier, debouncedSearch]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Savings Opportunities
        </h1>
        <p className="text-slate-500 text-sm">
          Browse money-saving ideas from expert contributors. Unlock details when you&apos;re ready.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or company..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabel(cat)}
              </option>
            ))}
          </select>
          <select
            value={priceTier}
            onChange={(e) => setPriceTier(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">Any Price</option>
            <option value="250">Stage 1: &euro;250</option>
            <option value="500">Stage 1: &euro;500</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <CardSkeleton />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={Package}
          title={debouncedSearch ? "No opportunities match your search." : "No opportunities yet."}
        >
          {debouncedSearch ? (
            <button onClick={() => setSearch("")} className="text-slate-700 underline underline-offset-2">
              Clear search
            </button>
          ) : (
            <>
              Check back soon, or{" "}
              <Link href="/auth/signup" className="text-slate-700 underline underline-offset-2">
                sign up as a contributor
              </Link>{" "}
              to post one.
            </>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              href={`/opportunity/${opp.id}`}
              className={`group bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md ${
                opp.matchesCompany
                  ? "border-emerald-200 border-l-4 border-l-emerald-400 hover:border-emerald-300"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                    {categoryLabel(opp.category)}
                  </span>
                  {opp.matchesCompany && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <Sparkles className="w-3 h-3" />
                      Relevant to you
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  &euro;{opp.stage1Price}
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-slate-700 line-clamp-2">
                {opp.title}
              </h2>
              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{opp.brief}</p>
              <div className="mt-3">
                <StarRating rating={opp.avgRating} count={opp.reviewCount} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="w-3 h-3" />
                    Expert Contributor
                  </span>
                  {opp.company && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {opp.company}
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  {Math.round(opp.confidenceScore)}/100
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
