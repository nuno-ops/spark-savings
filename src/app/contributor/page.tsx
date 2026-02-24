"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Opportunity {
  id: string;
  title: string;
  status: string;
  stage1Price: number;
  createdAt: string;
  confidenceScore: number;
}

interface EarningsData {
  totalEarnings: number;
  purchases: {
    id: string;
    stage: number;
    contributorPayoutEuros: number;
    createdAt: string;
    opportunity: { title: string };
    company: { name: string };
  }[];
}

export default function ContributorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/contributor/opportunities").then((r) => r.json()),
      fetch("/api/contributor/earnings").then((r) => r.json()),
    ]).then(([oppsData, earningsData]) => {
      setOpportunities(Array.isArray(oppsData) ? oppsData : []);
      setEarnings(earningsData);
      setLoading(false);
    });
  }, [status, router]);

  if (status === "loading" || loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contributor Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome back, {session?.user?.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/contributor/api-keys"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            API Keys
          </Link>
          <Link
            href="/contributor/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            + New Opportunity
          </Link>
        </div>
      </div>

      {/* Earnings Summary */}
      {earnings && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-medium text-green-800 mb-1">
            Total Earnings
          </h2>
          <p className="text-3xl font-bold text-green-900">
            €{earnings.totalEarnings.toLocaleString()}
          </p>
          {earnings.purchases.length > 0 && (
            <div className="mt-4 space-y-2">
              {earnings.purchases.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="text-sm text-green-700 flex justify-between"
                >
                  <span>
                    Stage {p.stage}: {p.opportunity.title}
                  </span>
                  <span>€{p.contributorPayoutEuros} from {p.company.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opportunities List */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Your Opportunities
      </h2>
      {opportunities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No opportunities yet.</p>
          <Link
            href="/contributor/new"
            className="text-indigo-600 underline text-sm"
          >
            Create your first one
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-gray-900">{opp.title}</h3>
                <div className="text-xs text-gray-500 flex gap-3 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      opp.status === "published"
                        ? "bg-green-100 text-green-700"
                        : opp.status === "flagged"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {opp.status}
                  </span>
                  <span>€{opp.stage1Price}</span>
                  <span>Score: {Math.round(opp.confidenceScore)}</span>
                </div>
              </div>
              <Link
                href={`/contributor/${opp.id}/edit`}
                className="text-indigo-600 text-sm hover:underline"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
