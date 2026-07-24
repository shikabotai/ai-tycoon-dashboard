# PunkRecords Dashboard Refresh

## Phase 1 Decision

Use a build-time static projection from PunkRecords.

This is enough for the current personal category dashboards because the pages only need an overnight snapshot, not live collaborative writes or second-by-second state. A Supabase table would add auth, migrations, RLS, writes, and failure modes before the dashboard actually needs them.

## Refresh Commands

Local refresh and validation:

```bash
npm run refresh:punkrecords
```

Public/static deploy refresh:

```bash
npm run refresh:punkrecords:deploy
```

Both commands read `PUNK_RECORDS_ROOT`, defaulting to:

```bash
/Users/shika/.openclaw/workspace/PunkRecords
```

## Token Cost

The scheduled refresh should run as shell commands, not as an agent task. That means the overnight update spends normal compute only:

- read PunkRecords files
- regenerate `src/generated/projectedSections.ts`
- lint
- build
- optionally deploy

No model call is required unless Mitchell asks an agent to interpret, redesign, or rewrite the projection logic.

## When Supabase Becomes Worth It

Add a database-backed projection table later if the dashboard needs:

- edit history inside the site
- per-card manual overrides
- multiple users or devices writing state
- background sync status visible in the UI
- audit trails for changed records
- API refresh without rebuilding the frontend

Until then, the static generated file is the simpler and safer source of truth for the website.
