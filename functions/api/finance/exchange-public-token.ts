import { encryptToken, json, plaidPost, readJson, requireConfigured, supabaseRequest } from './_shared'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload = await readJson(request) as { publicToken?: string; metadata?: { institution?: { institution_id?: string; name?: string } } }
  if (!payload.publicToken) return json({ status: 'invalid_request', message: 'Missing publicToken' }, { status: 400 })

  const exchange = await plaidPost(env, '/item/public_token/exchange', { public_token: payload.publicToken })
  if (!exchange.ok) return json({ status: 'provider_error', detail: exchange.data }, { status: 502 })

  const item = await plaidPost(env, '/item/get', { access_token: exchange.data.access_token })
  if (!item.ok) return json({ status: 'provider_error', detail: item.data }, { status: 502 })

  const connection = await supabaseRequest(
    env,
    'POST',
    '/financial_connections?on_conflict=provider_id,provider_item_id',
    {
      owner_user_id: env.FINANCE_OWNER_USER_ID,
      provider_id: 'plaid',
      provider_item_id: exchange.data.item_id,
      institution_id: item.data.item?.institution_id || payload.metadata?.institution?.institution_id,
      institution_name: payload.metadata?.institution?.name || null,
      access_token_ciphertext: await encryptToken(env.FINANCE_TOKEN_ENCRYPTION_SECRET || '', exchange.data.access_token),
      access_token_key_version: 'v1',
      status: 'active',
      products: item.data.item?.products || [],
      available_products: item.data.item?.available_products || [],
      metadata: { consent_expiration_time: item.data.item?.consent_expiration_time || null },
    },
    'resolution=merge-duplicates,return=representation',
  )
  if (!connection.ok) return json({ status: 'storage_error', detail: connection.data }, { status: 502 })

  const row = Array.isArray(connection.data) ? connection.data[0] : connection.data
  await supabaseRequest(env, 'POST', '/financial_audit_events', {
    owner_user_id: env.FINANCE_OWNER_USER_ID,
    connection_id: row.id,
    event_type: 'connection.linked',
    actor: 'owner',
    summary: 'Linked Plaid institution in read-only mode.',
    metadata: { provider_item_id: exchange.data.item_id },
  })

  return json({ status: 'linked', connection_id: row.id, item_id: exchange.data.item_id })
}

