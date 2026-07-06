# Dashboard Functions Plan

This directory is reserved for Cloudflare Pages Functions that will replace development-only Vite middleware routes.

## Target routes

### Personal projections
- `/api/personal/vessel`
- `/api/personal/identity`
- `/api/personal/systems`
- `/api/personal/ventures`
- `/api/personal/career`
- `/api/personal/knowledge`
- `/api/personal/wealth`
- `/api/personal/education`
- `/api/personal/relationships`

### Command routing
- `/api/command/route`

## Phase 3 intent

The current dashboard can already point these surfaces at production-safe endpoints via:
- `VITE_APP_API_BASE`
- `VITE_PERSONAL_API_BASE`
- `VITE_COMMAND_API_BASE`

The next implementation step is to add Pages Functions or equivalent backend handlers here so production no longer depends on Vite middleware transport.

## Constraints

- Keep browser-safe boundaries, do not leak secrets to the client.
- Preserve the stable Cloudflare Pages deployment path.
- Reuse `src/server/*` logic where practical instead of duplicating route behavior.
- Keep the personal projection path file-backed unless a better durable source is intentionally chosen.
