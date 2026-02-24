"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { CATEGORIES, STAGE1_PRICES } from "@/lib/constants";

export default function EditOpportunityPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    brief: "",
    category: "general",
    stage1Price: 250,
    validationChecklist: "",
    requirements: "",
    highLevelApproach: "",
    fullPlaybook: "",
    templates: "",
    stage2Price: 0,
    savingsEstimateLow: 0,
    savingsEstimateHigh: 0,
    status: "draft",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/opportunities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          brief: data.brief || "",
          category: data.category || "general",
          stage1Price: data.stage1Price || 250,
          validationChecklist: data.validationChecklist || "",
          requirements: data.requirements || "",
          highLevelApproach: data.highLevelApproach || "",
          fullPlaybook: data.fullPlaybook || "",
          templates: data.templates || "",
          stage2Price: data.stage2Price || 0,
          savingsEstimateLow: data.savingsEstimateLow || 0,
          savingsEstimateHigh: data.savingsEstimateHigh || 0,
          status: data.status || "draft",
        });
        setLoading(false);
      });
  }, [id, session]);

  if (!session) return <p>Please sign in.</p>;
  if (loading) return <p className="text-gray-500">Loading...</p>;

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(newStatus?: string) {
    setSaving(true);
    setError("");

    const body = { ...form };
    if (newStatus) body.status = newStatus;

    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    router.push("/contributor");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Opportunity
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-6">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brief
            </label>
            <textarea
              value={form.brief}
              onChange={(e) => updateField("brief", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage 1 Price
              </label>
              <select
                value={form.stage1Price}
                onChange={(e) =>
                  updateField("stage1Price", parseInt(e.target.value))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {STAGE1_PRICES.map((p) => (
                  <option key={p} value={p}>
                    €{p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validation Checklist
            </label>
            <textarea
              value={form.validationChecklist}
              onChange={(e) =>
                updateField("validationChecklist", e.target.value)
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              value={form.requirements}
              onChange={(e) => updateField("requirements", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              High-Level Approach
            </label>
            <textarea
              value={form.highLevelApproach}
              onChange={(e) =>
                updateField("highLevelApproach", e.target.value)
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Playbook
            </label>
            <textarea
              value={form.fullPlaybook}
              onChange={(e) => updateField("fullPlaybook", e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Templates
            </label>
            <textarea
              value={form.templates}
              onChange={(e) => updateField("templates", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savings Low (€)
              </label>
              <input
                type="number"
                value={form.savingsEstimateLow || ""}
                onChange={(e) =>
                  updateField(
                    "savingsEstimateLow",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savings High (€)
              </label>
              <input
                type="number"
                value={form.savingsEstimateHigh || ""}
                onChange={(e) =>
                  updateField(
                    "savingsEstimateHigh",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage 2 Price (€)
              </label>
              <input
                type="number"
                value={form.stage2Price || ""}
                onChange={(e) =>
                  updateField("stage2Price", parseInt(e.target.value) || 0)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
