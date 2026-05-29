"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthInput,
} from "@/components/auth/auth-form-ui";
import { AuthShell } from "@/components/ui/auth-shell";
import { useAuthForm } from "@/hooks/use-auth-form";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, loading, setError, run } = useAuthForm();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    await run(async () => {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in"
      subtitle="Explore geotagged photos on a satellite map with AI-powered place descriptions."
      alternateAuth={{ label: "Sign up", href: "/signup" }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField label="Email">
          <AuthInput
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </AuthField>
        <AuthField label="Password">
          <AuthInput
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </AuthField>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            Forgot password?
          </Link>
        </div>
        {error ? <AuthError message={error} /> : null}
        <button type="submit" disabled={loading} className="btn-primary !mt-5">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <AuthFooterLink text="No account?" linkText="Create one" href="/signup" />
    </AuthShell>
  );
}
