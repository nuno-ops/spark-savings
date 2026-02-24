"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Purchase {
  id: string;
  stage: number;
  amountEuros: number;
  status: string;
  createdAt: string;
  opportunity: { id: string; title: string; category: string };
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status !== "authenticated") return;

    fetch("/api/purchases")
      .then((r) => r.json())
      .then((data) => {
        setPurchases(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [status, router]);

  async function requestRefund(purchaseId: string) {
    const res = await fetch(`/api/purchases/${purchaseId}/refund`, {
      method: "POST",
    });
    if (res.ok) {
      setPurchases(
        purchases.map((p) =>
          p.id === purchaseId ? { ...p, status: "refund_requested" } : p
        )
      );
    } else {
      const data = await res.json();
      alert(data.error || "Refund request failed");
    }
  }

  if (status === "loading" || loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const totalSpent = purchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amountEuros, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium text-blue-800 mb-1">Total Spent</h2>
        <p className="text-3xl font-bold text-blue-900">
          €{totalSpent.toLocaleString()}
        </p>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Unlocked Opportunities
      </h2>

      {purchases.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No purchases yet.</p>
          <Link href="/" className="text-indigo-600 underline text-sm">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <Link
                  href={`/company/${p.opportunity.id}`}
                  className="font-medium text-gray-900 hover:text-indigo-600"
                >
                  {p.opportunity.title}
                </Link>
                <div className="text-xs text-gray-500 flex gap-3 mt-1">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                    Stage {p.stage}
                  </span>
                  <span>€{p.amountEuros}</span>
                  <span
                    className={
                      p.status === "completed"
                        ? "text-green-600"
                        : p.status === "refund_requested"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/company/${p.opportunity.id}`}
                  className="text-indigo-600 text-sm hover:underline"
                >
                  View
                </Link>
                {p.status === "completed" && (
                  <button
                    onClick={() => requestRefund(p.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Request Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
