"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CATEGORIES, STAGE1_PRICES } from "@/lib/constants";

export default function NewOpportunityPage() {
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
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!session) return <p>Please sign in.</p>;

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(publish: boolean) {
    setSaving(true);
    setError("");

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    if (publish) {
      // Publish it
      await fetch(`/api/opportunities/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
    }

    router.push("/contributor");
  }

  // Suggest a Stage 2 price range
  const suggestedMin = Math.round(form.savingsEstimateLow * 0.05) || 500;
  const suggestedMax = Math.round(form.savingsEstimateHigh * 0.15) || 5000;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Opportunity
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-6">
        {/* PUBLIC TEASER */}
        <div className="border-b pb-4">
          <h2 className="font-semibold text-gray-800 mb-3">
            Public Teaser (always visible)
          </h2>
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
                placeholder="e.g. Reduce cloud hosting costs by 40%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brief Description
              </label>
              <textarea
                value={form.brief}
                onChange={(e) => updateField("brief", e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="A short teaser that makes companies curious..."
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
          </div>
        </div>

        {/* STAGE 1 CONTENT */}
        <div className="border-b pb-4">
          <h2 className="font-semibold text-gray-800 mb-3">
            Stage 1 Content (unlocked after €{form.stage1Price} purchase)
          </h2>
          <div className="space-y-3">
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
                placeholder="- Check if you spend >€10k/mo on cloud&#10;- Verify you use auto-scaling&#10;- ..."
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
                placeholder="What the company needs to have in place..."
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
                placeholder="The general strategy without step-by-step details..."
              />
            </div>
          </div>
        </div>

        {/* STAGE 2 CONTENT */}
        <div className="border-b pb-4">
          <h2 className="font-semibold text-gray-800 mb-3">
            Stage 2 Content (full playbook)
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Savings Low (€)
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
                  Estimated Savings High (€)
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
            </div>

            {form.savingsEstimateLow > 0 && (
              <p className="text-xs text-gray-500">
                Suggested Stage 2 price: €{suggestedMin} — €{suggestedMax}
              </p>
            )}

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
                placeholder="Leave 0 to skip Stage 2"
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
                placeholder="Detailed step-by-step instructions..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Templates / Resources
              </label>
              <textarea
                value={form.templates}
                onChange={(e) => updateField("templates", e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Links, templates, tools..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(true)}
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
