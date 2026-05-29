"use client";

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

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, loading, setError, run } = useAuthForm();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    await run(async () => {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <AuthShell
      badge="Get started"
      title="Create account"
      subtitle="Upload photos with GPS and see them on your personal world map."
      alternateAuth={{ label: "Sign in", href: "/login" }}
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </AuthField>
        {error ? <AuthError message={error} /> : null}
        <button type="submit" disabled={loading} className="btn-primary !mt-5">
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>

      <AuthFooterLink text="Already have an account?" linkText="Sign in" href="/login" />
    </AuthShell>
  );
}
