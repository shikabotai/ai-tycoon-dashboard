import { json, readJson, requireConfigured, supabaseRequest } from './_shared'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload = await readJson(request) as {
    type?: 'asset' | 'liability'
    name?: string
    category?: string
    value?: number
    notes?: string
  }
  const value = Number(payload.value)
  if ((payload.type !== 'asset' && payload.type !== 'liability') || !payload.name?.trim() || !payload.category?.trim() || !Number.isFinite(value)) {
    return json({ status: 'invalid_request', message: 'Manual entry needs type, name, category, and numeric value.' }, { status: 400 })
  }

  const result = await supabaseRequest<Array<{ id: string }>>(env, 'POST', '/manual_financial_entries', {
    owner_user_id: env.FINANCE_OWNER_USER_ID,
    entry_type: payload.type,
    name: payload.name.trim(),
    category: payload.category.trim(),
    value_amount: Math.abs(value),
    iso_currency_code: 'USD',
    include_in_net_worth: true,
    valuation_date: new Date().toISOString().slice(0, 10),
    notes: payload.notes?.trim() || null,
  })
  if (!result.ok) return json({ status: 'storage_error', detail: result.data }, { status: 502 })

  const row = Array.isArray(result.data) ? result.data[0] : null
  return json({ status: 'saved', id: row?.id })
}

export const onRequestDelete: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ status: 'invalid_request', message: 'Missing id' }, { status: 400 })

  const result = await supabaseRequest(
    env,
    'DELETE',
    `/manual_financial_entries?id=eq.${encodeURIComponent(id)}&owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}`,
    undefined,
    'return=minimal',
  )
  if (!result.ok) return json({ status: 'storage_error', detail: result.data }, { status: 502 })

  return json({ status: 'deleted', id })
}
