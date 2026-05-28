"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/ui/auth-shell";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in"
      subtitle="Explore geotagged photos on a satellite map with AI-powered place descriptions."
      alternateAuth={{ label: "Sign up", href: "/signup" }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-zinc-300">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass mt-1.5"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-300">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-glass mt-1.5"
            placeholder="••••••••"
          />
        </label>
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={loading} className="btn-primary !mt-5">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        No account?{" "}
        <Link href="/signup" className="font-medium text-sky-400 hover:text-sky-300">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
