"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { Search, Star, Package, SlidersHorizontal, UserRound } from "lucide-react";

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
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200"
          }`}
        />
      ))}
      {count > 0 && (
        <span className="text-xs text-slate-500 ml-1">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
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
            className="w-full border border-slate-200 rounded-md pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={priceTier}
            onChange={(e) => setPriceTier(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Any Price</option>
            <option value="250">Stage 1: &euro;250</option>
            <option value="500">Stage 1: &euro;500</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-20 mb-4" />
              <div className="h-5 bg-slate-100 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {debouncedSearch ? "No opportunities match your search." : "No opportunities yet."}
          </p>
          <p className="text-sm mt-1.5 text-slate-400">
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
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              href={`/opportunity/${opp.id}`}
              className="group bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                  {opp.category}
                </span>
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
                <span className="inline-flex items-center gap-1">
                  <UserRound className="w-3 h-3" />
                  Expert Contributor
                </span>
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
