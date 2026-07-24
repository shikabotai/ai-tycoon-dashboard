import { csv, json, plaidPost, requireConfigured } from './_shared'

export const onRequestPost: PagesFunction = async ({ env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload: Record<string, unknown> = {
    client_name: 'OpenClaw Finance',
    country_codes: csv(env.PLAID_COUNTRY_CODES || 'US'),
    language: 'en',
    products: csv(env.PLAID_PRODUCTS || 'transactions,liabilities'),
    user: { client_user_id: env.FINANCE_OWNER_USER_ID },
  }
  if (env.PLAID_WEBHOOK_URL) payload.webhook = env.PLAID_WEBHOOK_URL

  const plaid = await plaidPost(env, '/link/token/create', payload)
  if (!plaid.ok) return json({ status: 'provider_error', detail: plaid.data }, { status: 502 })

  return json({
    status: 'ready',
    link_token: plaid.data.link_token,
    expiration: plaid.data.expiration,
  })
}

