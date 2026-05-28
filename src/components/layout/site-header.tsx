"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type SiteHeaderProps = {
  email?: string | null;
};

export function SiteHeader({ email }: SiteHeaderProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-50">
          HyLight Demo
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/upload" className="hover:text-white">
            Upload
          </Link>
          {email ? (
            <>
              <span className="hidden text-zinc-500 sm:inline">{email}</span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md border border-zinc-700 px-3 py-1 hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-white">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
