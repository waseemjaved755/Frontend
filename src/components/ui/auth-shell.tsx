import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import heroImage from "@/assets/images/hylight-hero.jpg";

type AuthShellProps = {
  children: ReactNode;
  badge?: string;
  title: string;
  subtitle: string;
  alternateAuth?: { label: string; href: string };
  /** Show brand airship panel on large screens (default true). */
  showHero?: boolean;
};

export function AuthShell({
  children,
  badge,
  title,
  subtitle,
  alternateAuth,
  showHero = true,
}: AuthShellProps) {
  return (
    <div className={`auth-page ${showHero ? "auth-page--split" : ""}`}>
      {showHero ? (
        <aside className="auth-split__visual" aria-hidden={false}>
          <Image
            src={heroImage}
            alt="HyLight airship in flight"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="auth-split__visual-img"
          />
          <div className="auth-split__visual-overlay" aria-hidden />
          <div className="auth-split__visual-content">
            <h2 className="auth-split__visual-title">Demo Project</h2>
            <p className="auth-split__visual-text">Crafted by Waseem Javed</p>
          </div>
        </aside>
      ) : null}

      <section className="auth-split__form">
        {alternateAuth ? (
          <header className="auth-split__header auth-split__header--end">
            <Link href={alternateAuth.href} className="auth-page__nav-link">
              {alternateAuth.label}
            </Link>
          </header>
        ) : null}

        <div className="auth-split__form-center">
          <div className="glass-panel auth-card">
            {badge ? <span className="auth-card__badge">{badge}</span> : null}
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__subtitle">{subtitle}</p>
            <div className="auth-card__body">{children}</div>
          </div>

          <p className="auth-page__footer">Crafted by Waseem Javed</p>
        </div>
      </section>
    </div>
  );
}
