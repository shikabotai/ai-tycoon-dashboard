export type FinanceStatus = {
  configured: boolean
  provider: 'plaid'
  environment: 'sandbox' | 'development' | 'production'
  products: string[]
  safety: 'read_only'
  missing: string[]
  connections: {
    connected: number
    active: number
    paused: number
    needsRelink: number
    items: Array<{
      id: string
      institutionName: string | null
      status: string
      lastSuccessfulSyncAt: string | null
    }>
  }
  accounts: {
    linked: number
    manual: number
    items: Array<{
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
    }>
  }
  transactions: {
    synced: number
    recent: Array<{
      id: string
      date: string
      name: string
      merchantName: string | null
      accountName: string
      amount: number
      pending: boolean
      category: string
    }>
  }
  netWorth: {
    assets: number
    liabilities: number
    total: number
    manualAssets: number
    manualLiabilities: number
  }
  budget: {
    month: string
    planned: number
    spent: number
    remaining: number
    categories: Array<{ id: string; name: string; planned: number; spent: number; remaining: number }>
  }
  manualEntries: {
    items: Array<{
      id: string
      type: 'asset' | 'liability'
      name: string
      category: string
      value: number
      includeInNetWorth: boolean
      valuationDate: string
      notes: string | null
    }>
  }
  lastSuccessfulSyncAt: string | null
}

export type FinanceLinkTokenResponse =
  | { status: 'ready'; link_token: string; expiration?: string }
  | { status: 'needs_credentials'; missing: string[] }

export type FinanceExchangeResponse =
  | { status: 'linked'; connection_id: string; item_id?: string }
  | { status: 'needs_credentials'; missing: string[] }
  | { status: 'invalid_request'; message: string }

export type FinanceActionResponse =
  | { status: 'queued' | 'synced' | 'disconnected'; connection_id?: string; accounts?: number; transactions?: number; removed?: number }
  | { status: 'deleted' | 'saved'; id?: string; account_id?: string }
  | { status: 'needs_credentials'; missing: string[] }
  | { status: 'not_found' | 'invalid_request'; message?: string }

const REQUIRED_FINANCE_ENV = [
  'PLAID_CLIENT_ID',
  'PLAID_SECRET',
  'FINANCE_OWNER_USER_ID',
  'FINANCE_TOKEN_ENCRYPTION_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

type FinanceEnv = Partial<Record<(typeof REQUIRED_FINANCE_ENV)[number] | 'PLAID_ENV' | 'PLAID_PRODUCTS', string>>

function getFinanceEnv(): FinanceEnv {
  if (typeof process === 'undefined') return {}
  return process.env as FinanceEnv
}

export function buildFinanceStatus(env = getFinanceEnv()): FinanceStatus {
  const missing = REQUIRED_FINANCE_ENV.filter((key) => {
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
    products: (env.PLAID_PRODUCTS || 'transactions,liabilities').split(',').map((item) => item.trim()).filter(Boolean),
    safety: 'read_only',
    missing,
    connections: {
      connected: 0,
      active: 0,
      paused: 0,
      needsRelink: 0,
      items: [],
    },
    accounts: {
      linked: 0,
      manual: 0,
      items: [],
    },
    transactions: {
      synced: 0,
      recent: [],
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
      categories: [],
    },
    manualEntries: {
      items: [],
    },
    lastSuccessfulSyncAt: null,
  }
}

export function buildFinanceLinkTokenResponse(env = getFinanceEnv()): FinanceLinkTokenResponse {
  const status = buildFinanceStatus(env)
  if (!status.configured) {
    return { status: 'needs_credentials', missing: status.missing }
  }

  return {
    status: 'needs_credentials',
    missing: ['Plaid production function is required for real link token creation'],
  }
}
