# Personal Finance Safe Build Plan

This is being built across the dashboard repo at `/Users/shika/business-agents/dashboard` and the backend repo at `/Users/shika/business-agents`.

## Safety Position

- Use a bank-linking provider such as Plaid first; keep MX or Mastercard Open Banking / Finicity swappable behind a provider interface.
- Never collect or store bank usernames, passwords, MFA codes, account numbers, or routing numbers directly.
- Start read-only: accounts, balances, transactions, credit liabilities, and investments later.
- Do not add payments, transfers, bill pay, or money movement.
- Keep provider access tokens backend-only and encrypted at rest.
- Validate provider webhooks before syncing anything.
- Avoid logging provider tokens, raw webhook payloads, account identifiers, or sensitive transaction detail.
- Ship disconnect, pause sync, delete data, account exclusion, and audit history before using real accounts.

## Frontend Repo

Path: `/Users/shika/business-agents/dashboard`

Built dashboard work:

- Wealth page now shows the finance cockpit as a safe account-linking plan instead of static month cards.
- The visible state is `0 connected` with a manual net-worth estimate until real linked balances exist.
- The UI separates the phases: transaction sync, budgeting, net-worth tracking, and money-per-hour.
- Plaid Link launch button calls backend-only Link token creation.
- Connected institution list, sync, disconnect, and refresh controls are wired to server endpoints.
- Status shows configured credentials, active connections, linked accounts, synced transactions, and last sync.
- Live finance panels render linked accounts, recent transactions, current-month budget targets, manual assets/liabilities, and privacy controls.
- Manual asset/liability entries and monthly budget targets can be saved through backend routes once Supabase credentials are configured.
- Linked accounts can be included or excluded from budget and net-worth calculations.
- Delete-finance-data is exposed behind an explicit confirmation prompt.

Remaining frontend work after real data exists:

- Add transaction category override controls.
- Add net-worth history chart.
- Add richer budget analysis once categories have real synced transaction volume.

## Backend Repo

Path: `/Users/shika/business-agents`

Built backend work:

- `POST /api/finance/link-token`: creates short-lived Plaid Link tokens.
- `POST /api/finance/exchange-public-token`: exchanges the browser-returned public token for a backend-only provider access token.
- `POST /api/finance/sync`: syncs accounts, balances, and transactions through Plaid Transactions Sync cursors.
- `POST /api/finance/disconnect`: removes the Plaid Item and clears the stored token.
- `POST /api/finance/delete-data`: clears local finance rows after explicit confirmation.
- `POST /api/finance/manual-entry`: saves manual assets and liabilities.
- `DELETE /api/finance/manual-entry?id=...`: deletes a manual asset or liability.
- `POST /api/finance/budget`: creates or updates a monthly budget target.
- `PATCH /api/finance/account-settings`: updates budget/net-worth inclusion flags on linked accounts.
- `python scripts/finance_cli.py ...`: local CLI mirrors status, link-token, exchange, sync, disconnect, and delete-data.
- `python scripts/finance_cli.py snapshot`: creates or refreshes the current monthly net-worth snapshot.

Built tables:

- `financial_providers`
- `financial_connections`
- `financial_accounts`
- `financial_transactions`
- `financial_transaction_categories`
- `monthly_budgets`
- `net_worth_snapshots`
- `manual_financial_entries`
- `financial_sync_jobs`
- `financial_audit_events`

## Build Order

1. Backend schema and encrypted token storage. Done.
2. Plaid sandbox Link token and token exchange. Done, pending credentials.
3. Sync sandbox accounts and transactions. Done, pending credentials.
4. Render connected status in the Wealth page. Done.
5. Add transaction categories and overrides. Schema is ready; UI is next after data exists.
6. Add monthly budgets. Done for category-level targets.
7. Add net-worth snapshots and manual assets/liabilities. Done; sync also refreshes the current monthly snapshot.
8. Add production safety checklist before real bank linking. Sandbox test must pass first.

## Production Checklist

- Provider tokens encrypted at rest.
- Provider secrets stored only in server runtime secrets.
- Backend access checks on every finance route.
- Webhook signature validation.
- No sensitive finance data in logs.
- Rate limiting on finance routes.
- Audit trail for connect, sync, disconnect, pause, delete, and export actions.
- Real provider environment separated from sandbox/dev.
- Clear delete-data flow tested before linking real accounts.
