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
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-end px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/upload" className="glass-nav-link hidden sm:inline">
                Upload
              </Link>
              <Link
                href="/upload"
                className="glass-inset inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:text-white sm:hidden"
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
            <Link href="/login" className="glass-nav-link">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
