"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/ui/auth-shell";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
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
    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      badge="Get started"
      title="Create account"
      subtitle="Upload photos with GPS and see them on your personal world map."
      alternateAuth={{ label: "Sign in", href: "/login" }}
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-glass mt-1.5"
            placeholder="At least 8 characters"
          />
        </label>
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={loading} className="btn-primary !mt-5">
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
