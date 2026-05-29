"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthInput,
  AuthSuccess,
} from "@/components/auth/auth-form-ui";
import { AuthShell } from "@/components/ui/auth-shell";
import { useAuthForm } from "@/hooks/use-auth-form";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { error, success, loading, setError, setSuccess, run } = useAuthForm();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    await run(async () => {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess("Password updated. Redirecting to the map…");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    });
  }

  if (checkingSession) {
    return (
      <AuthShell
        badge="Account"
        title="Reset password"
        subtitle="Verifying your reset link…"
      >
        <p className="text-sm text-zinc-400">Please wait a moment.</p>
      </AuthShell>
    );
  }

  if (!sessionReady) {
    return (
      <AuthShell
        badge="Account"
        title="Link expired"
        subtitle="This reset link is invalid or has expired. Request a new one below."
      >
        <div className="space-y-4">
          <Link
            href="/forgot-password"
            className="btn-primary inline-block w-full text-center no-underline"
          >
            Request new reset link
          </Link>
          <AuthFooterLink text="Back to" linkText="Sign in" href="/login" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Account"
      title="Choose new password"
      subtitle="Enter a new password for your account."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField label="New password">
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
        <AuthField label="Confirm password">
          <AuthInput
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
          />
        </AuthField>
        {error ? <AuthError message={error} /> : null}
        {success ? <AuthSuccess message={success} /> : null}
        <button type="submit" disabled={loading} className="btn-primary !mt-5">
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
      <AuthFooterLink text="Back to" linkText="Sign in" href="/login" />
    </AuthShell>
  );
}
