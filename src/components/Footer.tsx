import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-base font-bold text-slate-900">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500 text-white">
                <Zap className="w-3.5 h-3.5" />
              </span>
              Spark Deal
            </Link>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              The marketplace for cost-saving strategies. Submit ideas, unlock savings.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="text-slate-600 hover:text-slate-900">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-slate-600 hover:text-slate-900">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-slate-600 hover:text-slate-900">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-slate-600 hover:text-slate-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-slate-600 hover:text-slate-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@sparkdeal.app" className="text-slate-600 hover:text-slate-900">
                  support@sparkdeal.app
                </a>
              </li>
              <li>
                <a href="mailto:legal@sparkdeal.app" className="text-slate-600 hover:text-slate-900">
                  legal@sparkdeal.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Spark Deal. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/legal/terms" className="hover:text-slate-600">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-slate-600">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
