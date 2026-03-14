"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, ShieldCheck, Store, Info, Zap, Target } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900">
          <Zap className="w-5 h-5 text-emerald-500" />
          Spark Deal
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/marketplace"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <Store className="w-3.5 h-3.5" />
            Marketplace
          </Link>
          <Link
            href="/requests"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <Target className="w-3.5 h-3.5" />
            Requests
          </Link>
          <Link
            href="/how-it-works"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <Info className="w-3.5 h-3.5" />
            How It Works
          </Link>

          {!session ? (
            <>
              <Link
                href="/auth/signin"
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="ml-1 bg-slate-900 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {session.user.role === "contributor" && (
                <Link
                  href="/contributor"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
              {session.user.role === "company" && (
                <Link
                  href="/company"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              <div className="hidden sm:flex items-center ml-2 pl-3 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
                  {session.user.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="ml-2 text-xs leading-tight">
                  <p className="font-medium text-slate-700 truncate max-w-[120px]">
                    {session.user.name}
                  </p>
                  <p className="text-slate-400 capitalize">{session.user.role}</p>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
