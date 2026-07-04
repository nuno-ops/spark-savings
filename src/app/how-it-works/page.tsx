import Link from "next/link";
import {
  Lightbulb,
  Search,
  Rocket,
  ArrowRight,
  Building2,
} from "lucide-react";

const CONTRIBUTOR_STEPS = [
  {
    title: "Sign up as a contributor",
    desc: "Create an account and select the contributor role.",
  },
  {
    title: "Submit a savings opportunity",
    desc: "Provide a teaser title and description, then add detailed Stage 1 and Stage 2 content that companies can unlock.",
  },
  {
    title: "Automated quality review",
    desc: "Submissions are automatically checked for PII, confidential content, and quality. Flagged items go to admin review.",
  },
  {
    title: "Earn from purchases",
    desc: "When a company buys your opportunity, you receive 85% of the sale price. Track your earnings from your dashboard.",
  },
];

const COMPANY_STEPS = [
  {
    title: "Sign up as a company",
    desc: "Create an account and select the company role.",
  },
  {
    title: "Browse opportunities",
    desc: "Filter by category and price tier. Read teaser descriptions to find relevant savings ideas.",
  },
  {
    title: "Unlock details in two stages",
    desc: "Stage 1 unlocks the detailed overview. Stage 2 unlocks the full implementation breakdown with messaging and meetings.",
  },
  {
    title: "Connect with the contributor",
    desc: "After a Stage 2 purchase, message the contributor directly or request a meeting to discuss implementation.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="text-center mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          How it works
        </span>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          From idea to savings
        </h1>
        <p className="mt-3 text-slate-500 max-w-xl mx-auto">
          Spark Deal connects expert contributors who identify savings
          opportunities with companies looking to cut costs.
        </p>
      </div>

      {/* ── At a glance ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {[
          {
            icon: Lightbulb,
            n: "01",
            title: "Contributors submit ideas",
            desc: "With a teaser and full breakdown",
          },
          {
            icon: Search,
            n: "02",
            title: "Companies browse & unlock",
            desc: "Pay in two stages, only for what you need",
          },
          {
            icon: Rocket,
            n: "03",
            title: "Connect & implement",
            desc: "Message contributors and book meetings",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="text-2xl font-bold tracking-tight text-slate-200">
                {s.n}
              </span>
            </div>
            <p className="font-semibold text-slate-900">{s.title}</p>
            <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Two sides ──────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        {/* Contributors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Share Your Expertise
            </h2>
          </div>

          <ol className="space-y-5 text-sm text-slate-700">
            {CONTRIBUTOR_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{step.title}</p>
                  <p className="text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Companies */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Find Savings
            </h2>
          </div>

          <ol className="space-y-5 text-sm text-slate-700">
            {COMPANY_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{step.title}</p>
                  <p className="text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Pricing & Policies ─────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-14">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          Pricing &amp; Policies
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              Stage 1 Pricing
            </h3>
            <p className="text-sm text-slate-500">
              Contributors set their Stage 1 price at either{" "}
              <span className="font-medium text-slate-900">&euro;250</span> or{" "}
              <span className="font-medium text-slate-900">&euro;500</span>.
              Stage 2 is priced at 2&times; the Stage 1 price.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              Platform Fee
            </h3>
            <p className="text-sm text-slate-500">
              A{" "}
              <span className="font-medium text-slate-900">15% platform fee</span>{" "}
              is deducted from each sale. Contributors keep 85% of every
              purchase.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              Refund Window
            </h3>
            <p className="text-sm text-slate-500">
              Companies can request a refund within{" "}
              <span className="font-medium text-slate-900">48 hours</span> of
              purchase. Refunds are reviewed by the Spark Deal team.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA band ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-12 md:px-12 mb-6">        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Ready to get started?
          </h2>
          <p className="mt-2 text-slate-300">
            Join as a contributor to monetize your expertise, or as a company
            to discover cost-saving opportunities.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
