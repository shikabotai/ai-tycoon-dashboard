import { decryptToken, json, plaidPost, readJson, requireConfigured, supabaseRequest } from './_shared'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload = await readJson(request) as { connectionId?: string }
  if (!payload.connectionId) return json({ status: 'invalid_request', message: 'Missing connectionId' }, { status: 400 })

  const connectionResult = await supabaseRequest(env, 'GET', `/financial_connections?id=eq.${encodeURIComponent(payload.connectionId)}&limit=1`)
  if (!connectionResult.ok) return json({ status: 'storage_error', detail: connectionResult.data }, { status: 502 })
  const connection = Array.isArray(connectionResult.data) ? connectionResult.data[0] : null
  if (!connection) return json({ status: 'not_found', message: 'Connection not found' }, { status: 404 })

  if (connection.access_token_ciphertext) {
    const accessToken = await decryptToken(env.FINANCE_TOKEN_ENCRYPTION_SECRET || '', connection.access_token_ciphertext)
    await plaidPost(env, '/item/remove', { access_token: accessToken })
  }

  await supabaseRequest(env, 'PATCH', `/financial_connections?id=eq.${encodeURIComponent(payload.connectionId)}`, {
    status: 'disconnected',
    access_token_ciphertext: null,
    disconnected_at: new Date().toISOString(),
  })
  await supabaseRequest(env, 'POST', '/financial_audit_events', {
    owner_user_id: env.FINANCE_OWNER_USER_ID,
    connection_id: payload.connectionId,
    event_type: 'connection.disconnected',
    actor: 'owner',
    summary: 'Disconnected financial institution and removed stored access token.',
  })

  return json({ status: 'disconnected', connection_id: payload.connectionId })
}
