import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-white">Configure Supabase</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        The app needs Supabase credentials before sign-in and the map will work. Create a file
        named <code className="text-zinc-200">Frontend/.env.local</code> with:
      </p>

      <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-300">
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# or NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STORAGE_BUCKET=Photos`}
      </pre>

      <p className="mt-6 text-sm text-zinc-400">
        Find URL and publishable (or anon) key in Supabase →{" "}
        <strong className="text-zinc-200">Settings → API</strong>.
        Restart the dev server after saving the file (<code className="text-zinc-200">npm run dev</code>).
      </p>

      <p className="mt-4 text-sm text-zinc-500">
        See the root <code className="text-zinc-400">README.md</code> for database migration and the{" "}
        <code className="text-zinc-400">Photos</code> storage bucket (case-sensitive).
      </p>

      <Link
        href="/login"
        className="mt-8 inline-block text-sm text-sky-400 hover:text-sky-300"
      >
        Already configured? Go to sign in →
      </Link>
    </div>
  );
}
