import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import {
  Lightbulb,
  Search,
  Rocket,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Building2,
  Zap,
  Shield,
  Bot,
  Star,
  FileText,
  Users,
  TrendingDown,
  Bell,
  Cloud,
  Truck,
  Wallet,
  Megaphone,
  Settings,
  Scale,
  UserCog,
  Lightbulb as Idea,
  LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  general: Idea,
  energy: Zap,
  procurement: FileText,
  logistics: Truck,
  technology: Cloud,
  operations: Settings,
  finance: Wallet,
  hr: UserCog,
  marketing: Megaphone,
  compliance: Scale,
};

export default function LandingPage() {
  return (
    <div className="-mx-4 sm:-mx-6 -mt-10">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-4 sm:px-6 pt-14 pb-10 md:pt-20">
        <div className="relative max-w-6xl mx-auto grid items-center gap-10 lg:gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* Left column */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Zap className="w-3.5 h-3.5" />
              Earn from smart ideas
            </span>

            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-slate-900">
              Turn savings ideas
              <br />
              into <span className="text-emerald-500">income</span>
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-500">
              Spark Deal connects sharp problem-solvers with companies that pay
              to spend less. Share a cost-cutting playbook, get unlocked, and
              earn 85% of every sale.
            </p>

            {/* Search → marketplace (works without JS) */}
            <form
              action="/marketplace"
              method="get"
              className="mt-7 flex max-w-lg items-center gap-2 rounded-full border border-slate-200 bg-white p-2 pl-5 shadow-sm focus-within:ring-2 focus-within:ring-slate-900"
            >
              <Search className="w-4.5 h-4.5 shrink-0 text-slate-400" />
              <input
                name="search"
                placeholder="Search ideas, e.g. “AWS cost audit”"
                aria-label="Search savings opportunities"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400"
              >
                Search
              </button>
            </form>

            {/* Stat callout */}
            <div className="mt-9 flex items-center gap-5">
              <div className="flex shrink-0 flex-col rounded-2xl bg-emerald-50 px-5 py-4 leading-none">
                <span className="text-3xl font-bold tracking-tight text-emerald-700">
                  85%
                </span>
                <span className="mt-2 text-xs font-semibold text-emerald-600">
                  You keep
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Real money, real fast
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                  Set your own price — we take a flat 15%. Get paid when a
                  company unlocks your playbook.
                </p>
                <Link
                  href="/how-it-works"
                  className="mt-1.5 inline-flex items-center gap-1 border-b-2 border-emerald-200 pb-0.5 text-sm font-semibold text-emerald-600 hover:border-emerald-500"
                >
                  See how it works <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right column — visual with floating cards */}
          <div className="relative hidden min-h-[420px] lg:block">
            {/* organic blob */}
            <div
              className="absolute inset-y-[6%] left-[8%] right-[-4%] bg-emerald-500/95"
              style={{ borderRadius: "46% 54% 58% 42% / 54% 44% 56% 46%" }}
            />
            {/* photo placeholder */}
            <div className="absolute inset-y-[15%] left-[18%] right-[6%] z-10 overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "26px 26px",
                }}
              />
              <div className="flex h-full items-center justify-center">
                <span className="rounded-md border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-400">
                  contributor at work
                </span>
              </div>
            </div>

            {/* floating: submit-an-idea mini card */}
            <div className="absolute right-[-2%] top-[4%] z-20 w-52 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl">
              <p className="text-xs font-semibold text-slate-500">
                Category
              </p>
              <div className="mt-1 mb-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600">
                Cloud &amp; Infrastructure
              </div>
              <p className="text-xs font-semibold text-slate-500">Stage 1 price</p>
              <div className="mt-1 mb-3 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600">
                €250 – €500
              </div>
              <Link
                href="/contributor/new"
                className="block rounded-full bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-400"
              >
                Submit an idea
              </Link>
            </div>

            {/* floating: alert pill */}
            <div className="absolute left-[-6%] top-[40%] z-20 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm font-bold text-slate-900">
                Idea alerts on
              </span>
            </div>

            {/* floating: contributors */}
            <div className="absolute bottom-[4%] left-[2%] z-20 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
              <div className="flex">
                {["bg-violet-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"].map(
                  (c, i) => (
                    <span
                      key={i}
                      className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white text-xs font-bold text-white ${c} ${
                        i > 0 ? "-ml-2.5" : ""
                      }`}
                    >
                      {["M", "D", "A", "P"][i]}
                    </span>
                  )
                )}
                <span className="-ml-2.5 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-900 text-white">
                  <Zap className="w-3.5 h-3.5" />
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">5.2k+ contributors</p>
                <p className="text-[13px] text-slate-500">sharing playbooks</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="bg-slate-50/60 px-4 sm:px-6 py-20 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              How it works
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Get paid for spending less
            </h2>
            <p className="mt-3 text-slate-500">
              Three steps from idea to payout. No retainers, no gatekeepers —
              just outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                n: "01",
                title: "Submit an idea",
                desc: "Contributors share a cost-saving playbook with a validation checklist, requirements, and a clear approach. AI agents can submit via API too.",
                href: "/contributor/new",
                cta: "Start contributing",
              },
              {
                icon: Search,
                n: "02",
                title: "Browse & unlock",
                desc: "Companies browse opportunities by category and confidence score. Unlock in stages — pay only for the level of detail you need.",
                href: "/marketplace",
                cta: "Browse marketplace",
              },
              {
                icon: Rocket,
                n: "03",
                title: "Implement & save",
                desc: "Get the full playbook, templates, and a direct meeting with the contributor. Start saving immediately, fully protected.",
                href: "/how-it-works",
                cta: "See the details",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <span className="text-3xl font-bold tracking-tight text-slate-200">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {s.desc}
                </p>
                <Link
                  href={s.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  {s.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITIONS ───────────────────────────── */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Built for Both Sides
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* For Contributors */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                For Contributors
              </h3>
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
                    text: "AI-powered quality triage ensures only good content gets published",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Start Contributing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* For Companies */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                For Companies
              </h3>
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
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/marketplace"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Browse Opportunities
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="bg-slate-50/60 px-4 sm:px-6 py-20 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Categories
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Where the savings hide
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1 border-b-2 border-emerald-200 pb-0.5 text-sm font-semibold text-emerald-600 hover:border-emerald-500"
            >
              Browse all categories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Idea;
              return (
                <Link
                  key={cat}
                  href={`/marketplace?category=${cat}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-500 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 font-semibold capitalize text-slate-900">
                    {cat}
                  </span>
                  <ArrowUpRight className="h-4.5 w-4.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-500" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Pricing
          </p>
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-slate-500">
            Pay per opportunity. Unlock only what you need.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Stage 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="relative rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-sm">
              <div className="absolute -top-3 left-6 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                Most Value
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
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            15% platform fee. Contributors keep 85% of every sale. All prices in
            EUR.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA (accent band) ──────────────────────── */}
      <section className="px-4 sm:px-6 pb-20 md:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-emerald-500 px-8 py-16 md:px-14">
          <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-emerald-400/40" />
          <div className="absolute -bottom-24 right-32 h-64 w-64 rounded-full bg-white/10" />
          <div className="relative max-w-xl">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              Got an idea that
              <br />
              saves money? Cash it in.
            </h2>
            <p className="mt-4 text-lg text-emerald-50">
              Join 5,200+ contributors turning sharp thinking into steady income
              on Spark Deal.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-base font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3 text-base font-semibold text-white hover:bg-white/10"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
