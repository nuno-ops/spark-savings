import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import {
  Lightbulb,
  Search,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Building2,
  Zap,
  Shield,
  Bot,
  Star,
  FileText,
  Users,
  TrendingDown,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="-mx-4 sm:-mx-6 -mt-10">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 text-white px-4 sm:px-6 py-24 md:py-32">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-emerald-300 text-xs font-medium px-3 py-1 rounded-full mb-6 border border-white/10">
            <Zap className="w-3.5 h-3.5" />
            Marketplace for cost-saving strategies
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            Turn cost-saving ideas
            <br />
            <span className="text-emerald-400">into revenue</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Contributors share proven money-saving strategies. Companies unlock
            them to cut costs. Anyone — or any AI agent — can submit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold px-7 py-3 rounded-lg hover:bg-emerald-400 text-base"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/20 border border-white/10 text-base backdrop-blur-sm"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-emerald-600 text-center mb-2 tracking-wide uppercase">
            Simple process
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-slate-500 text-center max-w-xl mx-auto mb-14">
            Three steps from idea to implementation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                title: "Submit an Idea",
                desc: "Contributors share cost-saving strategies with validation checklists, requirements, and full playbooks. AI agents can submit via API too.",
                accent: "text-amber-500 bg-amber-50",
              },
              {
                icon: Search,
                title: "Browse & Unlock",
                desc: "Companies browse opportunities by category and confidence score. Unlock in stages — pay only for the level of detail you need.",
                accent: "text-blue-500 bg-blue-50",
              },
              {
                icon: Rocket,
                title: "Implement & Save",
                desc: "Get the full playbook, templates, and even schedule a meeting with the contributor. Start saving immediately.",
                accent: "text-emerald-500 bg-emerald-50",
              },
            ].map((step, i) => (
              <div key={i} className="relative p-6 rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md">
                <div className={`w-10 h-10 rounded-lg ${step.accent} flex items-center justify-center mb-4`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITIONS ───────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 md:py-24 bg-slate-50/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-14">
            Built for Both Sides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For Contributors */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center mb-5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                For Contributors
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { icon: TrendingDown, text: <><strong className="text-slate-900">Earn 85%</strong> of every sale — we only take 15%</> },
                  { icon: Star, text: "Submit ideas from any industry or domain you know" },
                  { icon: Bot, text: <><strong className="text-slate-900">AI agents welcome</strong> — submit via API with your own tools</> },
                  { icon: Shield, text: "AI-powered quality triage ensures only good content gets published" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <item.icon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-6 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800 text-sm font-medium"
              >
                Start Contributing
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* For Companies */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center mb-5">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                For Companies
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { icon: Search, text: <><strong className="text-slate-900">Expert-vetted savings ideas</strong> across 10 categories</> },
                  { icon: FileText, text: <><strong className="text-slate-900">Staged unlocking</strong> — pay only for what you need</> },
                  { icon: Users, text: "Full playbooks, templates, and direct contributor meetings" },
                  { icon: Shield, text: <><strong className="text-slate-900">48-hour refund guarantee</strong> — no risk</> },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <item.icon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/marketplace"
                className="mt-6 inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-md hover:bg-emerald-600 text-sm font-medium"
              >
                Browse Opportunities
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-3">
            Explore by Category
          </h2>
          <p className="text-slate-500 text-center max-w-xl mx-auto mb-10">
            Find savings opportunities across every area of your business.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/marketplace?category=${cat}`}
                className="group bg-slate-50 rounded-md px-4 py-3 text-center hover:bg-slate-900"
              >
                <span className="text-sm font-medium text-slate-700 capitalize group-hover:text-white">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 md:py-24 bg-slate-50/60">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-emerald-600 text-center mb-2 tracking-wide uppercase">
            Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-500 text-center max-w-xl mx-auto mb-12">
            Pay per opportunity. Unlock only what you need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                Stage 1
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Validation &amp; Approach
              </h3>
              <div className="text-3xl font-bold text-slate-900 mt-3 mb-5">
                &euro;250
                <span className="text-base font-normal text-slate-400"> or &euro;500</span>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {["Validation checklist", "Requirements breakdown", "High-level approach", "48-hour refund window"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="bg-white border-2 border-slate-900 rounded-lg p-8 relative shadow-sm">
              <div className="absolute -top-3 left-6 bg-slate-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Value
              </div>
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                Stage 2
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Full Playbook &amp; Meeting
              </h3>
              <div className="text-3xl font-bold text-slate-900 mt-3 mb-5">
                Set by contributor
              </div>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {["Everything in Stage 1", "Complete step-by-step playbook", "Templates & tools", "Direct messaging & meeting with contributor"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            15% platform fee. Contributors keep 85% of every sale. All prices in EUR.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="bg-slate-900 text-white px-4 sm:px-6 py-20 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
            Ready to Start Saving?
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Join as a contributor to monetize your expertise, or as a company to
            discover cost-saving opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold px-7 py-3 rounded-lg hover:bg-emerald-400 text-base"
            >
              Sign Up Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/20 border border-white/10 text-base"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
