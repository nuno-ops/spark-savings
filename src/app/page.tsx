import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Building2,
  Lightbulb,
  Shield,
  Bot,
  Star,
  FileText,
  Users,
  TrendingDown,
  SlidersHorizontal,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="-mx-4 sm:-mx-6 -mt-10">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-white px-4 sm:px-6 pt-16 pb-16 md:pt-24 border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid items-center gap-12 lg:gap-16 lg:grid-cols-[1.1fr_1fr]">
          {/* Left column */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-slate-900">
              Proven ways to cut
              <br />
              your company&apos;s costs
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">
              Spark Deal is a marketplace of cost-saving playbooks written by
              people who&apos;ve done it. Companies unlock them to spend less.
              Contributors earn 85% of every sale.
            </p>

            {/* Search → marketplace (works without JS) */}
            <form
              action="/marketplace"
              method="get"
              className="mt-8 flex max-w-lg items-center gap-2 rounded-lg border border-slate-300 bg-white p-1.5 pl-4 focus-within:border-slate-400"
            >
              <Search className="w-4 h-4 shrink-0 text-slate-400" />
              <input
                name="search"
                placeholder="Search playbooks, e.g. “AWS cost audit”"
                aria-label="Search savings opportunities"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Search
              </button>
            </form>

            {/* Plain facts, no stat theatrics */}
            <p className="mt-6 text-sm text-slate-500">
              85% contributor payout&ensp;&middot;&ensp;48-hour refund on every
              unlock&ensp;&middot;&ensp;Each playbook reviewed before it earns
            </p>
          </div>

          {/* Right column — example opportunity, presented plainly */}
          <div className="hidden lg:block">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-400">
              Example opportunity
            </p>
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Technology
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                  <SlidersHorizontal className="h-3 w-3" />
                  Confidence 91/100
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-900">
                Ditch Zendesk and save 50–70%
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Switch to Freshdesk without losing features — full migration
                playbook for support teams of 10–80 agents.
              </p>

              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-xs text-slate-500">4.9 (27)</span>
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Est. savings
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    €15k–€60k / yr
                  </p>
                </div>
                <span className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  Unlock — €250
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="bg-white px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Get paid for spending less
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                n: "01",
                title: "Submit an idea",
                desc: "Contributors share a cost-saving playbook with a validation checklist, requirements, and a clear approach. AI agents can submit via API too.",
                href: "/contributor/new",
                cta: "Start contributing",
              },
              {
                n: "02",
                title: "Browse & unlock",
                desc: "Companies browse opportunities by category and confidence score. Unlock in stages — pay only for the level of detail you need.",
                href: "/marketplace",
                cta: "Browse the marketplace",
              },
              {
                n: "03",
                title: "Implement & save",
                desc: "Get the full playbook, templates, and a direct meeting with the contributor. 48-hour refund if it doesn't apply to you.",
                href: "/how-it-works",
                cta: "See the details",
              },
            ].map((s) => (
              <div key={s.n} className="border-t-2 border-slate-900 pt-5">
                <p className="text-sm font-semibold text-slate-400">{s.n}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.desc}
                </p>
                <Link
                  href={s.href}
                  className="mt-3 inline-block text-sm font-medium text-slate-900 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-900"
                >
                  {s.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITIONS ───────────────────────────── */}
      <section className="bg-slate-50 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Built for both sides
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* For Contributors */}
            <div className="rounded-xl border border-slate-200 bg-white p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <Lightbulb className="h-4.5 w-4.5" />
                </span>
                <h3 className="text-lg font-semibold text-slate-900">
                  For Contributors
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  {
                    icon: TrendingDown,
                    text: (
                      <>
                        <strong className="text-slate-900">Earn 85%</strong> of
                        every sale — we only take 15%
                      </>
                    ),
                  },
                  {
                    icon: Star,
                    text: "Submit ideas from any industry or domain you know",
                  },
                  {
                    icon: Bot,
                    text: (
                      <>
                        <strong className="text-slate-900">
                          AI agents welcome
                        </strong>{" "}
                        — submit via API with your own tools
                      </>
                    ),
                  },
                  {
                    icon: Shield,
                    text: "Quality triage ensures only good content gets published",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Start Contributing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* For Companies */}
            <div className="rounded-xl border border-slate-200 bg-white p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <Building2 className="h-4.5 w-4.5" />
                </span>
                <h3 className="text-lg font-semibold text-slate-900">
                  For Companies
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  {
                    icon: Search,
                    text: (
                      <>
                        <strong className="text-slate-900">
                          Expert-vetted savings ideas
                        </strong>{" "}
                        across 10 categories
                      </>
                    ),
                  },
                  {
                    icon: FileText,
                    text: (
                      <>
                        <strong className="text-slate-900">
                          Staged unlocking
                        </strong>{" "}
                        — pay only for what you need
                      </>
                    ),
                  },
                  {
                    icon: Users,
                    text: "Full playbooks, templates, and direct contributor meetings",
                  },
                  {
                    icon: Shield,
                    text: (
                      <>
                        <strong className="text-slate-900">
                          48-hour refund guarantee
                        </strong>{" "}
                        — no risk
                      </>
                    ),
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/marketplace"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Browse Opportunities
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="bg-white px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Categories
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Where the savings hide
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/marketplace?category=${cat}`}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
              >
                {categoryLabel(cat)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Pricing
          </p>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Simple, transparent pricing
          </h2>
          <p className="mb-10 max-w-xl text-slate-600">
            Pay per opportunity. Unlock only what you need.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Stage 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Stage 1
              </p>
              <h3 className="mb-1 text-lg font-semibold text-slate-900">
                Validation &amp; Approach
              </h3>
              <div className="mb-5 mt-3 text-3xl font-bold text-slate-900">
                €250
                <span className="text-base font-normal text-slate-400">
                  {" "}
                  or €500
                </span>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {[
                  "Validation checklist",
                  "Requirements breakdown",
                  "High-level approach",
                  "48-hour refund window",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="relative rounded-xl border-2 border-slate-900 bg-white p-8">
              <div className="absolute -top-3 left-6 rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                Most value
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Stage 2
              </p>
              <h3 className="mb-1 text-lg font-semibold text-slate-900">
                Full Playbook &amp; Meeting
              </h3>
              <div className="mb-5 mt-3 text-3xl font-bold text-slate-900">
                Set by contributor
              </div>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {[
                  "Everything in Stage 1",
                  "Complete step-by-step playbook",
                  "Templates & tools",
                  "Direct messaging & meeting with contributor",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            15% platform fee. Contributors keep 85% of every sale. All prices in
            EUR.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="bg-slate-900 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Got an idea that saves money?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-300">
            Turn sharp thinking into income, or find your company&apos;s next
            cost cut.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-slate-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
