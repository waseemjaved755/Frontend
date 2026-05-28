"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  email?: string | null;
};

export function SiteHeader({ email }: SiteHeaderProps) {
  const router = useRouter();
  const isLoggedIn = Boolean(email);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "glass-toolbar z-50 w-full",
        isLoggedIn && "fixed left-0 right-0 top-0",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={isLoggedIn ? "/" : "/login"}
          className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)] transition group-hover:border-sky-400/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21c-4-4-8-7.5-8-11a8 8 0 1116 0c0 3.5-4 7-8 11z"
              />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span>HyLight Demo</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/upload"
                className="hidden rounded-lg px-3 py-1.5 text-zinc-300 transition hover:bg-white/5 hover:text-white sm:inline"
              >
                Upload
              </Link>
              <Link
                href="/upload"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white sm:hidden"
                aria-label="Upload"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </Link>
              <span className="hidden max-w-[180px] truncate text-zinc-500 lg:inline">
                {email}
              </span>
              <button type="button" onClick={signOut} className="btn-ghost">
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
