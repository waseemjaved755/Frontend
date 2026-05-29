import Link from "next/link";

import { AuthShell } from "@/components/ui/auth-shell";

export default function SetupPage() {
  return (
    <AuthShell
      showHero={false}
      badge="Setup"
      title="Configure Supabase"
      subtitle="Add credentials to Frontend/.env.local before sign-in works."
    >
      <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-zinc-400">
        {`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STORAGE_BUCKET=Photos`}
      </pre>
      <Link href="/login" className="btn-primary mt-5 inline-block w-full text-center no-underline">
        Go to sign in
      </Link>
    </AuthShell>
  );
}
