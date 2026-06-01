"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, ShieldCheck, Store, Info, Zap, Target, Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
        onClick={() => setMobileOpen(false)}
      >
        <Store className="w-3.5 h-3.5" />
        Marketplace
      </Link>
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
        onClick={() => setMobileOpen(false)}
      >
        <Target className="w-3.5 h-3.5" />
        Requests
      </Link>
      <Link
        href="/how-it-works"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
        onClick={() => setMobileOpen(false)}
      >
        <Info className="w-3.5 h-3.5" />
        How It Works
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-white">
            <Zap className="w-4 h-4" />
          </span>
          Spark<span className="text-emerald-500">Deal</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks}

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

              <div className="flex items-center ml-2 pl-3 border-l border-slate-200">
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

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-md px-4 py-3 space-y-1">
          {navLinks}

          {!session ? (
            <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
              <Link
                href="/auth/signin"
                className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="block text-center bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
              {session.user.role === "contributor" && (
                <Link
                  href="/contributor"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
              {session.user.role === "company" && (
                <Link
                  href="/company"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
                    {session.user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="text-xs leading-tight">
                    <p className="font-medium text-slate-700">{session.user.name}</p>
                    <p className="text-slate-400 capitalize">{session.user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
