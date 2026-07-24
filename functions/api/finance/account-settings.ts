import { json, readJson, requireConfigured, supabaseRequest } from './_shared'

export const onRequestPatch: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload = await readJson(request) as {
    accountId?: string
    includeInBudget?: boolean
    includeInNetWorth?: boolean
  }
  if (!payload.accountId) return json({ status: 'invalid_request', message: 'Missing accountId' }, { status: 400 })

  const patch: Record<string, boolean> = {}
  if (typeof payload.includeInBudget === 'boolean') patch.include_in_budget = payload.includeInBudget
  if (typeof payload.includeInNetWorth === 'boolean') patch.include_in_net_worth = payload.includeInNetWorth
  if (!Object.keys(patch).length) return json({ status: 'invalid_request', message: 'No account setting was provided.' }, { status: 400 })

  const result = await supabaseRequest(
    env,
    'PATCH',
    `/financial_accounts?id=eq.${encodeURIComponent(payload.accountId)}&owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}`,
    patch,
  )
  if (!result.ok) return json({ status: 'storage_error', detail: result.data }, { status: 502 })

  return json({ status: 'saved', account_id: payload.accountId })
}
