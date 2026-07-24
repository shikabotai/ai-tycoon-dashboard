import { json, readJson, requireConfigured, supabaseRequest } from './_shared'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload = await readJson(request) as { confirmation?: string }
  if (payload.confirmation !== 'DELETE_FINANCE_DATA') {
    return json({ status: 'invalid_request', message: 'Missing confirmation' }, { status: 400 })
  }

  const owner = encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')
  const deletes = [
    `/financial_audit_events?owner_user_id=eq.${owner}`,
    `/financial_sync_jobs?owner_user_id=eq.${owner}`,
    `/net_worth_snapshots?owner_user_id=eq.${owner}`,
    `/monthly_budgets?owner_user_id=eq.${owner}`,
    `/manual_financial_entries?owner_user_id=eq.${owner}`,
    `/financial_transactions?owner_user_id=eq.${owner}`,
    `/financial_transaction_categories?owner_user_id=eq.${owner}&is_system=eq.false`,
    `/financial_accounts?owner_user_id=eq.${owner}`,
    `/financial_connections?owner_user_id=eq.${owner}`,
  ]

  for (const path of deletes) {
    const result = await supabaseRequest(env, 'DELETE', path, undefined, 'return=minimal')
    if (!result.ok) return json({ status: 'storage_error', detail: result.data }, { status: 502 })
  }

  return json({ status: 'deleted' })
}
