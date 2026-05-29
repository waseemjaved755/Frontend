"use client";

import Link from "next/link";
import { useState } from "react";

import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthInput,
  AuthSuccess,
} from "@/components/auth/auth-form-ui";
import { AuthShell } from "@/components/ui/auth-shell";
import { passwordResetRedirectUrl } from "@/lib/auth/redirect-url";
import { useAuthForm } from "@/hooks/use-auth-form";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { error, success, loading, setError, setSuccess, run } = useAuthForm();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    await run(async () => {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: passwordResetRedirectUrl(),
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
      setSuccess(
        "If an account exists for that email, we sent a link to reset your password. Check your inbox.",
      );
    });
  }

  return (
    <AuthShell
      badge="Account"
      title="Forgot password"
      subtitle="Enter your email and we will send you a secure link to choose a new password."
      alternateAuth={{ label: "Sign in", href: "/login" }}
    >
      {sent ? (
        <div className="space-y-4">
          {success ? <AuthSuccess message={success} /> : null}
          <Link href="/login" className="btn-primary inline-block text-center no-underline">
            Back to sign in
          </Link>
        </div>
      ) : (
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
          {error ? <AuthError message={error} /> : null}
          <button type="submit" disabled={loading} className="btn-primary !mt-5">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <AuthFooterLink text="Remember your password?" linkText="Sign in" href="/login" />
    </AuthShell>
  );
}
