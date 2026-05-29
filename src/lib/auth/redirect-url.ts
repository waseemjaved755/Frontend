import { AUTH_RESET_PATH } from "@/lib/auth/constants";

/** OAuth / recovery links must land on the callback route first (PKCE). */
export function authCallbackUrl(nextPath: string = "/"): string {
  if (typeof window === "undefined") {
    return `/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }
  const next = encodeURIComponent(nextPath);
  return `${window.location.origin}/auth/callback?next=${next}`;
}

export function passwordResetRedirectUrl(): string {
  return authCallbackUrl(AUTH_RESET_PATH);
}
