import { Star } from "lucide-react";

/* ── Design tokens ──────────────────────────────────────
   Shared class recipes so every page speaks one visual
   language: emerald pill = primary action, slate outline =
   secondary, rounded-lg inputs, rounded-2xl cards. */

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-50 disabled:pointer-events-none";

const BTN_VARIANTS = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-600",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  dark: "bg-slate-900 text-white hover:bg-slate-800",
} as const;

const BTN_SIZES = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
} as const;

export function btn(
  variant: keyof typeof BTN_VARIANTS = "primary",
  size: keyof typeof BTN_SIZES = "md"
) {
  return `${BTN_BASE} ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]}`;
}

export const CARD = "bg-white rounded-2xl border border-slate-200 shadow-sm";

export const INPUT =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400";

/* ── Stars ────────────────────────────────────────────── */

export function Stars({
  rating,
  className = "w-4 h-4",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200"
          }`}
        />
      ))}
    </span>
  );
}

/* Rating summary for cards. Zero reviews renders a "New"
   badge instead of a row of empty gray stars. */
export function StarRating({ rating, count }: { rating: number; count: number }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        New
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Stars rating={rating} className="w-3.5 h-3.5" />
      <span className="text-xs text-slate-500 ml-1">
        {rating.toFixed(1)} ({count})
      </span>
    </span>
  );
}

/* ── Empty & loading states ───────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center py-20">
      <Icon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 font-medium">{title}</p>
      {children && <div className="text-sm mt-1.5 text-slate-400">{children}</div>}
    </div>
  );
}

export function CardSkeleton({ n = 3 }: { n?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`${CARD} p-5 animate-pulse`}>
          <div className="h-4 bg-slate-100 rounded w-20 mb-4" />
          <div className="h-5 bg-slate-100 rounded w-full mb-2" />
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
