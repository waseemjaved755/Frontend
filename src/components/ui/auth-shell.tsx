import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  badge?: string;
  title: string;
  subtitle: string;
  alternateAuth?: { label: string; href: string };
};

export function AuthShell({ children, badge, title, subtitle, alternateAuth }: AuthShellProps) {
  return (
    <div className="auth-page">
      <div className="auth-page__glow auth-page__glow--left" aria-hidden />
      <div className="auth-page__glow auth-page__glow--right" aria-hidden />

      <div className="auth-page__inner">
        <header className="auth-page__bar">
          <Link href="/login" className="auth-page__brand">
            <span className="auth-page__logo" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21c-4-4-8-7.5-8-11a8 8 0 1116 0c0 3.5-4 7-8 11z"
                />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <span>HyLight Demo</span>
          </Link>

          {alternateAuth ? (
            <Link href={alternateAuth.href} className="auth-page__nav-link">
              {alternateAuth.label}
            </Link>
          ) : null}
        </header>

        <div className="auth-page__center">
          <div className="glass-panel auth-card">
            {badge ? <span className="auth-card__badge">{badge}</span> : null}
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__subtitle">{subtitle}</p>
            <div className="auth-card__body">{children}</div>
          </div>

          <p className="auth-page__footer">Geotagged photos · Satellite map · AI descriptions</p>
        </div>
      </div>
    </div>
  );
}
