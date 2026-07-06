# AI Tycoon Dashboard

React + Phaser dashboard for visualizing agent activity, queue health, pipeline state, and watchdog alerts.

## Local setup

1. Copy `.env.example` to `.env`
2. Set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - optional API routing envs if you want the dashboard to hit non-default backend paths:
     - `VITE_APP_API_BASE`
     - `VITE_PERSONAL_API_BASE`
     - `VITE_COMMAND_API_BASE`
3. Install deps:
   - `npm install`
4. Run locally:
   - `npm run dev`

## Data sources

The app currently reads from these Supabase views:
- `v_queue_health`
- `v_pipeline_now`
- `v_task_watchdog`

## Deploy

Recommended: Cloudflare Pages or Vercel

### Netlify

- Base directory: `dashboard`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

A `netlify.toml` file is already included.

Optional CLI path once Netlify CLI is installed and logged in:
- `npm run deploy:netlify`

### Vercel

- Framework preset: Vite
- Root directory: `dashboard`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Optional CLI path once `vercel` is installed and logged in:
- `npm run deploy:vercel`

### Cloudflare Pages

- Framework preset: Vite
- Production branch: `main`
- Root directory: `dashboard`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - optional backend path envs for production hardening:
    - `VITE_APP_API_BASE`
    - `VITE_PERSONAL_API_BASE`
    - `VITE_COMMAND_API_BASE`
- Node.js version: `20`

Connect the GitHub repo `shikabotai/ai-tycoon-dashboard` and deploy the `main` branch.

### Production API routing notes

The dashboard currently supports three client-side API base envs:
- `VITE_APP_API_BASE` for a shared default backend base
- `VITE_PERSONAL_API_BASE` for personal projection endpoints
- `VITE_COMMAND_API_BASE` for Business Command routing endpoints

If these are unset, the UI falls back to same-origin `/api/*` paths, which currently map to local Vite middleware during development. For production hardening, the intended next step is to point these envs at real backend routes instead of relying on Vite-only transport.

A dedicated backend landing zone now exists at `functions/README.md` for the future Cloudflare Pages Functions replacement path.

## Important security note

Do not use `SUPABASE_SERVICE_ROLE_KEY` in the frontend.
If the dashboard runs directly in the browser, only expose browser-safe views and policies behind the anon key.
