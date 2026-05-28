"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold text-white">Create account</h1>
      <p className="mt-2 text-sm text-zinc-400">Start pinning your photos on the map.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm text-zinc-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-sky-500"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-sky-500"
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sky-600 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
