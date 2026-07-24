type FinanceEnv = {
  PLAID_CLIENT_ID?: string
  PLAID_SECRET?: string
  PLAID_ENV?: string
  PLAID_PRODUCTS?: string
  PLAID_COUNTRY_CODES?: string
  PLAID_WEBHOOK_URL?: string
  FINANCE_OWNER_USER_ID?: string
  FINANCE_TOKEN_ENCRYPTION_SECRET?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

type SupabaseResult<T = unknown> = { ok: true; data: T } | { ok: false; status: number; data: unknown }
type FinanceAccountRow = {
  id: string
  account_source: string
  name: string
  official_name: string | null
  mask: string | null
  type: string
  subtype: string | null
  iso_currency_code: string | null
  current_balance: number | string | null
  available_balance: number | string | null
  limit_amount: number | string | null
  include_in_budget: boolean
  include_in_net_worth: boolean
  status: string
}
type FinanceTransactionRow = {
  id: string
  account_id: string
  transaction_date: string
  authorized_date: string | null
  name: string
  merchant_name: string | null
  amount: number | string
  iso_currency_code: string | null
  pending: boolean
  provider_category: string[] | null
  payment_channel: string | null
  exclude_from_budget: boolean
  financial_accounts?: { name: string; type: string; mask: string | null } | null
}
type ManualEntryRow = {
  id: string
  entry_type: 'asset' | 'liability'
  name: string
  category: string
  value_amount: number | string
  iso_currency_code: string
  include_in_net_worth: boolean
  valuation_date: string
  notes: string | null
}
type BudgetRow = {
  id: string
  month: string
  planned_amount: number | string
  notes: string | null
  financial_transaction_categories?: { id: string; name: string; budget_group: string | null; color: string | null } | null
}

const PLAID_BASE_URLS = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com',
} as const

const REQUIRED_ENV = [
  'PLAID_CLIENT_ID',
  'PLAID_SECRET',
  'FINANCE_OWNER_USER_ID',
  'FINANCE_TOKEN_ENCRYPTION_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...init?.headers,
    },
  })
}

export function financeStatus(env: FinanceEnv) {
  const missing = REQUIRED_ENV.filter((key) => {
    const value = env[key]?.trim()
    if (key === 'FINANCE_TOKEN_ENCRYPTION_SECRET') return !value || value.length < 32
    return !value
  })
  const rawPlaidEnv = env.PLAID_ENV?.trim().toLowerCase()
  const plaidEnv = rawPlaidEnv === 'production' || rawPlaidEnv === 'development' ? rawPlaidEnv : 'sandbox'

  return {
    configured: missing.length === 0,
    provider: 'plaid',
    environment: plaidEnv,
    products: csv(env.PLAID_PRODUCTS || 'transactions,liabilities'),
    safety: 'read_only',
    missing,
    connections: {
      connected: 0,
      active: 0,
      paused: 0,
      needsRelink: 0,
      items: [] as Array<{ id: string; institutionName: string | null; status: string; lastSuccessfulSyncAt: string | null }>,
    },
    accounts: {
      linked: 0,
      manual: 0,
      items: [] as Array<{
        id: string
        source: string
        name: string
        mask: string | null
        type: string
        subtype: string | null
        currentBalance: number
        availableBalance: number | null
        limitAmount: number | null
        includeInBudget: boolean
        includeInNetWorth: boolean
      }>,
    },
    transactions: {
      synced: 0,
      recent: [] as Array<{
        id: string
        date: string
        name: string
        merchantName: string | null
        accountName: string
        amount: number
        pending: boolean
        category: string
      }>,
    },
    netWorth: {
      assets: 0,
      liabilities: 0,
      total: 0,
      manualAssets: 0,
      manualLiabilities: 0,
    },
    budget: {
      month: new Date().toISOString().slice(0, 7),
      planned: 0,
      spent: 0,
      remaining: 0,
      categories: [] as Array<{ id: string; name: string; planned: number; spent: number; remaining: number }>,
    },
    manualEntries: {
      items: [] as Array<{
        id: string
        type: 'asset' | 'liability'
        name: string
        category: string
        value: number
        includeInNetWorth: boolean
        valuationDate: string
        notes: string | null
      }>,
    },
    lastSuccessfulSyncAt: null as string | null,
  }
}

export function requireConfigured(env: FinanceEnv) {
  const status = financeStatus(env)
  if (!status.configured) return status
  return null
}

export function plaidBaseUrl(env: FinanceEnv) {
  return PLAID_BASE_URLS[financeStatus(env).environment]
}

export function csv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export async function plaidPost(env: FinanceEnv, path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${plaidBaseUrl(env)}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: env.PLAID_CLIENT_ID,
      secret: env.PLAID_SECRET,
      ...payload,
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { ok: false as const, status: response.status, data }
  }
  return { ok: true as const, data }
}

export async function supabaseRequest<T = unknown>(env: FinanceEnv, method: string, path: string, body?: unknown, prefer = 'return=representation'): Promise<SupabaseResult<T>> {
  const response = await fetch(`${env.SUPABASE_URL?.replace(/\/$/, '')}/rest/v1${path}`, {
    method,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY || '',
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
      'content-type': 'application/json',
      prefer,
    },
    body: body == null ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return { ok: false as const, status: response.status, data }
  }
  return { ok: true as const, data: data as T }
}

export async function financeStatusWithData(env: FinanceEnv) {
  const base = financeStatus(env)
  if (!base.configured) return base

  const monthStart = `${new Date().toISOString().slice(0, 7)}-01`
  const nextMonthStart = nextMonth(monthStart)

  const [connections, accounts, transactions, recentTransactions, monthTransactions, manualEntries, budgets] = await Promise.all([
    supabaseRequest<Array<{ id: string; institution_name: string | null; status: string; last_successful_sync_at: string | null }>>(
      env,
      'GET',
      `/financial_connections?owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}&select=id,institution_name,status,last_successful_sync_at`,
    ),
    supabaseRequest<Array<FinanceAccountRow>>(
      env,
      'GET',
      `/financial_accounts?owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}&status=eq.active&select=id,account_source,name,official_name,mask,type,subtype,iso_currency_code,current_balance,available_balance,limit_amount,include_in_budget,include_in_net_worth,status&order=name.asc`,
    ),
    supabaseRequest<Array<{ id: string }>>(
      env,
      'GET',
      `/financial_transactions?owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}&select=id`,
      undefined,
      'count=exact',
    ),
    supabaseRequest<Array<FinanceTransactionRow>>(
      env,
      'GET',
      `/financial_transactions?owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}&select=id,account_id,transaction_date,authorized_date,name,merchant_name,amount,iso_currency_code,pending,provider_category,payment_channel,exclude_from_budget,financial_accounts(name,type,mask)&order=transaction_date.desc&limit=12`,
    ),
    supabaseRequest<Array<FinanceTransactionRow>>(
      env,
      'GET',
      `/financial_transactions?owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}&transaction_date=gte.${monthStart}&transaction_date=lt.${nextMonthStart}&select=id,account_id,transaction_date,authorized_date,name,merchant_name,amount,iso_currency_code,pending,provider_category,payment_channel,exclude_from_budget`,
    ),
    supabaseRequest<Array<ManualEntryRow>>(
      env,
      'GET',
      `/manual_financial_entries?owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}&select=id,entry_type,name,category,value_amount,iso_currency_code,include_in_net_worth,valuation_date,notes&order=valuation_date.desc`,
    ),
    supabaseRequest<Array<BudgetRow>>(
      env,
      'GET',
      `/monthly_budgets?owner_user_id=eq.${encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')}&month=eq.${monthStart}&select=id,month,planned_amount,notes,financial_transaction_categories(id,name,budget_group,color)&order=planned_amount.desc`,
    ),
  ])

  if (!connections.ok || !accounts.ok || !transactions.ok || !recentTransactions.ok || !monthTransactions.ok || !manualEntries.ok || !budgets.ok) return base

  const connectionRows = Array.isArray(connections.data) ? connections.data : []
  const accountRows = Array.isArray(accounts.data) ? accounts.data : []
  const transactionRows = Array.isArray(transactions.data) ? transactions.data : []
  const recentTransactionRows = Array.isArray(recentTransactions.data) ? recentTransactions.data : []
  const monthTransactionRows = Array.isArray(monthTransactions.data) ? monthTransactions.data : []
  const manualEntryRows = Array.isArray(manualEntries.data) ? manualEntries.data : []
  const budgetRows = Array.isArray(budgets.data) ? budgets.data : []
  const activeConnections = connectionRows.filter((row) => row.status === 'active')
  const lastSuccessfulSyncAt = activeConnections
    .map((row) => row.last_successful_sync_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) || null

  let assets = 0
  let liabilities = 0
  for (const account of accountRows) {
    if (!account.include_in_net_worth) continue
    const currentBalance = numberValue(account.current_balance)
    if (account.type === 'credit' || account.type === 'loan') {
      liabilities += Math.abs(currentBalance)
    } else {
      assets += currentBalance
    }
  }
  let manualAssets = 0
  let manualLiabilities = 0
  for (const entry of manualEntryRows) {
    if (!entry.include_in_net_worth) continue
    if (entry.entry_type === 'asset') manualAssets += numberValue(entry.value_amount)
    else manualLiabilities += Math.abs(numberValue(entry.value_amount))
  }

  const spentByCategory = new Map<string, number>()
  for (const transaction of monthTransactionRows) {
    if (transaction.exclude_from_budget || transaction.pending) continue
    const providerCategory = transaction.provider_category?.[0] || 'Uncategorized'
    const current = spentByCategory.get(providerCategory) || 0
    spentByCategory.set(providerCategory, current + Math.max(0, numberValue(transaction.amount)))
  }

  const budgetCategories = budgetRows.map((row) => {
    const name = row.financial_transaction_categories?.name || 'Uncategorized'
    const planned = numberValue(row.planned_amount)
    const spent = spentByCategory.get(name) || 0
    return { id: row.id, name, planned, spent, remaining: planned - spent }
  })
  const planned = budgetCategories.reduce((sum, row) => sum + row.planned, 0)
  const spent = budgetCategories.reduce((sum, row) => sum + row.spent, 0)

  return {
    ...base,
    connections: {
      connected: connectionRows.filter((row) => row.status !== 'disconnected').length,
      active: activeConnections.length,
      paused: connectionRows.filter((row) => row.status === 'paused').length,
      needsRelink: connectionRows.filter((row) => row.status === 'relink_required' || row.status === 'error').length,
      items: connectionRows
        .filter((row) => row.status !== 'disconnected')
        .map((row) => ({
          id: row.id,
          institutionName: row.institution_name,
          status: row.status,
          lastSuccessfulSyncAt: row.last_successful_sync_at,
        })),
    },
    accounts: {
      linked: accountRows.filter((row) => row.account_source === 'linked').length,
      manual: accountRows.filter((row) => row.account_source === 'manual').length,
      items: accountRows.map((row) => ({
        id: row.id,
        source: row.account_source,
        name: row.name,
        mask: row.mask,
        type: row.type,
        subtype: row.subtype,
        currentBalance: numberValue(row.current_balance),
        availableBalance: row.available_balance == null ? null : numberValue(row.available_balance),
        limitAmount: row.limit_amount == null ? null : numberValue(row.limit_amount),
        includeInBudget: row.include_in_budget,
        includeInNetWorth: row.include_in_net_worth,
      })),
    },
    transactions: {
      synced: transactionRows.length,
      recent: recentTransactionRows.map((row) => ({
        id: row.id,
        date: row.transaction_date,
        name: row.merchant_name || row.name,
        merchantName: row.merchant_name,
        accountName: row.financial_accounts?.name || 'Linked account',
        amount: numberValue(row.amount),
        pending: row.pending,
        category: row.provider_category?.[0] || 'Uncategorized',
      })),
    },
    netWorth: {
      assets: assets + manualAssets,
      liabilities: liabilities + manualLiabilities,
      total: assets + manualAssets - liabilities - manualLiabilities,
      manualAssets,
      manualLiabilities,
    },
    budget: {
      month: monthStart.slice(0, 7),
      planned,
      spent,
      remaining: planned - spent,
      categories: budgetCategories,
    },
    manualEntries: {
      items: manualEntryRows.map((row) => ({
        id: row.id,
        type: row.entry_type,
        name: row.name,
        category: row.category,
        value: numberValue(row.value_amount),
        includeInNetWorth: row.include_in_net_worth,
        valuationDate: row.valuation_date,
        notes: row.notes,
      })),
    },
    lastSuccessfulSyncAt,
  }
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function aesKey(secret: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptToken(secret: string, token: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await aesKey(secret)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token))
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`
}

export async function decryptToken(secret: string, encrypted: string) {
  const [, ivPart, cipherPart] = encrypted.split('.')
  if (!ivPart || !cipherPart) throw new Error('Invalid encrypted token format')
  const key = await aesKey(secret)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(ivPart) }, key, base64ToBytes(cipherPart))
  return new TextDecoder().decode(plaintext)
}

export async function readJson(request: Request) {
  return request.json().catch(() => ({}))
}

export function numberValue(value: number | string | null | undefined) {
  if (value == null) return 0
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function isoDate(value?: string | null) {
  if (!value) return null
  return value.slice(0, 10)
}

export async function createNetWorthSnapshot(env: FinanceEnv) {
  const owner = encodeURIComponent(env.FINANCE_OWNER_USER_ID || '')
  const [accounts, manualEntries] = await Promise.all([
    supabaseRequest<Array<{ type: string; current_balance: number | string | null }>>(
      env,
      'GET',
      `/financial_accounts?owner_user_id=eq.${owner}&status=eq.active&include_in_net_worth=eq.true&select=type,current_balance`,
    ),
    supabaseRequest<Array<{ entry_type: 'asset' | 'liability'; value_amount: number | string }>>(
      env,
      'GET',
      `/manual_financial_entries?owner_user_id=eq.${owner}&include_in_net_worth=eq.true&select=entry_type,value_amount`,
    ),
  ])
  if (!accounts.ok || !manualEntries.ok) return null

  let assets = 0
  let liabilities = 0
  for (const account of accounts.data) {
    const balance = numberValue(account.current_balance)
    if (account.type === 'credit' || account.type === 'loan') liabilities += Math.abs(balance)
    else assets += balance
  }
  for (const entry of manualEntries.data) {
    const value = Math.abs(numberValue(entry.value_amount))
    if (entry.entry_type === 'liability') liabilities += value
    else assets += value
  }

  const snapshotMonth = new Date().toISOString().slice(0, 7) + '-01'
  const snapshot = await supabaseRequest<Array<{ id: string }>>(
    env,
    'POST',
    '/net_worth_snapshots?on_conflict=owner_user_id,snapshot_month',
    {
      owner_user_id: env.FINANCE_OWNER_USER_ID,
      snapshot_month: snapshotMonth,
      assets_total: assets,
      liabilities_total: liabilities,
      source: 'system',
      metadata: { created_by: 'finance_sync' },
    },
    'resolution=merge-duplicates,return=representation',
  )
  if (!snapshot.ok) return null

  await supabaseRequest(env, 'POST', '/financial_audit_events', {
    owner_user_id: env.FINANCE_OWNER_USER_ID,
    event_type: 'net_worth.snapshotted',
    actor: 'system',
    summary: `Snapshotted net worth at ${assets - liabilities}.`,
    metadata: { snapshot_month: snapshotMonth },
  })

  const row = Array.isArray(snapshot.data) ? snapshot.data[0] : null
  return { id: row?.id || null, assets, liabilities, netWorth: assets - liabilities, snapshotMonth }
}

function nextMonth(monthStart: string) {
  const date = new Date(`${monthStart}T00:00:00.000Z`)
  date.setUTCMonth(date.getUTCMonth() + 1)
  return date.toISOString().slice(0, 10)
}
