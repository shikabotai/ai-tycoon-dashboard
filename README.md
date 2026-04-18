# AI Tycoon Dashboard

React + Phaser dashboard for visualizing agent activity, queue health, pipeline state, and watchdog alerts.

## Local setup

1. Copy `.env.example` to `.env`
2. Set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
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

Recommended: Netlify or Vercel

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

## Important security note

Do not use `SUPABASE_SERVICE_ROLE_KEY` in the frontend.
If the dashboard runs directly in the browser, only expose browser-safe views and policies behind the anon key.
