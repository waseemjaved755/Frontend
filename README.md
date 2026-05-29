# HyLight Demo — Frontend (Next.js)

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase + API values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

### 1. Import project

- **Root Directory:** `Frontend` (not the repo root)
- **Framework:** Next.js (auto-detected)
- **Build command:** `npm run build` (default)
- **Install command:** `npm install` (default)

### 2. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for **Production** (and Preview if you use preview deployments):

| Variable | Example | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Yes |
| `NEXT_PUBLIC_API_URL` | `https://your-api.example.com` | Yes — **not** `localhost` |
| `NEXT_PUBLIC_STORAGE_BUCKET` | `Photos` | Yes — must match Supabase bucket name |

`NEXT_PUBLIC_*` variables are embedded at **build time**. Redeploy after changing them.

### 3. Supabase Auth (login, signup, password reset)

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add (wildcard covers callback + reset flow)  
  `https://your-app.vercel.app/**`  
  `http://localhost:3000/**` (for local dev)

Password reset flow: user requests link at `/forgot-password` → email → `/auth/callback?next=/auth/reset-password` → set new password at `/auth/reset-password`.

### 4. Backend CORS

Your FastAPI backend must allow the Vercel origin:

```env
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

Redeploy or restart the API after updating.

### 5. Verify before going live

```bash
cd Frontend
npm run build
npm run start
```

Build must pass with no TypeScript errors. Smoke-test: sign in, map loads (satellite), upload, open a photo marker.

### 6. Optional checks

- **Storage image transforms:** faster lightbox previews; falls back to full-size if unavailable.
- **Nominatim geocoding:** place names load from the browser; respect [usage policy](https://operations.osmfoundation.org/policies/nominatim/) (fine for demos, not high traffic).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build (same as Vercel) |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
