"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

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

function StarRating({
  rating,
  count,
}: {
  rating: number;
  count: number;
}) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <span key={i} className="text-yellow-400">
          &#9733;
        </span>
      );
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(
        <span key={i} className="text-yellow-400">
          &#9733;
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="text-gray-300">
          &#9733;
        </span>
      );
    }
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      {stars}
      {count > 0 && (
        <span className="text-xs text-gray-500 ml-1">
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Savings Opportunities
        </h1>
        <p className="text-gray-600">
          Browse money-saving ideas from expert contributors. Unlock details
          when you&apos;re ready.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search opportunities by title, description, or company..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
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
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Any Price</option>
          <option value="250">Stage 1: &euro;250</option>
          <option value="500">Stage 1: &euro;500</option>
        </select>
      </div>

      {/* Opportunity Cards */}
      {loading ? (
        <p className="text-gray-500">Loading opportunities...</p>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">
            {debouncedSearch
              ? "No opportunities match your search."
              : "No opportunities yet."}
          </p>
          <p className="text-sm mt-2">
            {debouncedSearch ? (
              <button
                onClick={() => setSearch("")}
                className="text-indigo-600 underline"
              >
                Clear search
              </button>
            ) : (
              <>
                Check back soon, or{" "}
                <Link
                  href="/auth/signup"
                  className="text-indigo-600 underline"
                >
                  sign up as a contributor
                </Link>{" "}
                to post one.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              href={`/opportunity/${opp.id}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
                  {opp.category}
                </span>
                <span className="text-sm font-semibold text-green-700">
                  &euro;{opp.stage1Price}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {opp.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-3">{opp.brief}</p>
              <div className="mt-3">
                <StarRating rating={opp.avgRating} count={opp.reviewCount} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>by {opp.contributor.name}</span>
                <span>Score: {Math.round(opp.confidenceScore)}/100</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
