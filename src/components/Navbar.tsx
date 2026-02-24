"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Spark Savings
        </Link>

        <div className="flex items-center gap-4">
          {!session ? (
            <>
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {session.user.role === "contributor" && (
                <Link
                  href="/contributor"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              )}
              {session.user.role === "company" && (
                <Link
                  href="/company"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              )}
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-gray-500">
                {session.user.name}{" "}
                <span className="bg-gray-100 text-xs px-2 py-1 rounded">
                  {session.user.role}
                </span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
