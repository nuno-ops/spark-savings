import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Large 404 */}
      <div className="text-8xl font-bold text-slate-200 select-none mb-2">
        404
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Page not found
      </h1>
      <p className="text-slate-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try checking the URL or head back to familiar ground.
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-lg font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Search className="w-4 h-4" />
          Browse Marketplace
        </Link>
      </div>
    </div>
  );
}
