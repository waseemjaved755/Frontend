import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__inner">
        <header className="auth-page__bar">
          <span className="auth-page__brand">
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
          </span>
        </header>

        <div className="auth-page__center">
          <div className="glass-panel auth-card">
            <h1 className="auth-card__title">Configure Supabase</h1>
            <p className="auth-card__subtitle">
              Add credentials to <code className="text-zinc-300">Frontend/.env.local</code> before
              sign-in works.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-zinc-400">
              {`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STORAGE_BUCKET=Photos`}
            </pre>
            <Link href="/login" className="btn-primary mt-5 inline-block text-center no-underline">
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
