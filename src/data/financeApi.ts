import { apiPath } from '../lib/apiBase'
import type { FinanceActionResponse, FinanceExchangeResponse, FinanceLinkTokenResponse, FinanceStatus } from '../server/financeRouteApi'

export async function loadFinanceStatus(): Promise<FinanceStatus> {
  const response = await fetch(apiPath('/api/finance/status'), { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Finance status failed with status ${response.status}`)
  return response.json() as Promise<FinanceStatus>
}

export async function createFinanceLinkToken(): Promise<FinanceLinkTokenResponse> {
  const response = await fetch(apiPath('/api/finance/link-token'), {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Finance link token failed with status ${response.status}`)
  return response.json() as Promise<FinanceLinkTokenResponse>
}

export async function exchangeFinancePublicToken(publicToken: string, metadata?: unknown): Promise<FinanceExchangeResponse> {
  const response = await fetch(apiPath('/api/finance/exchange-public-token'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ publicToken, metadata }),
  })
  if (!response.ok) throw new Error(`Finance token exchange failed with status ${response.status}`)
  return response.json() as Promise<FinanceExchangeResponse>
}

export async function syncFinanceConnection(connectionId: string): Promise<FinanceActionResponse> {
  const response = await fetch(apiPath('/api/finance/sync'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ connectionId }),
  })
  if (!response.ok) throw new Error(`Finance sync failed with status ${response.status}`)
  return response.json() as Promise<FinanceActionResponse>
}

export async function disconnectFinanceConnection(connectionId: string): Promise<FinanceActionResponse> {
  const response = await fetch(apiPath('/api/finance/disconnect'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ connectionId }),
  })
  if (!response.ok) throw new Error(`Finance disconnect failed with status ${response.status}`)
  return response.json() as Promise<FinanceActionResponse>
}

export async function deleteFinanceData(): Promise<FinanceActionResponse> {
  const response = await fetch(apiPath('/api/finance/delete-data'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ confirmation: 'DELETE_FINANCE_DATA' }),
  })
  if (!response.ok) throw new Error(`Finance data deletion failed with status ${response.status}`)
  return response.json() as Promise<FinanceActionResponse>
}

export async function saveManualFinanceEntry(payload: {
  type: 'asset' | 'liability'
  name: string
  category: string
  value: number
  notes?: string
}): Promise<FinanceActionResponse> {
  const response = await fetch(apiPath('/api/finance/manual-entry'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Manual finance entry failed with status ${response.status}`)
  return response.json() as Promise<FinanceActionResponse>
}

export async function removeManualFinanceEntry(id: string): Promise<FinanceActionResponse> {
  const response = await fetch(apiPath(`/api/finance/manual-entry?id=${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Manual finance entry deletion failed with status ${response.status}`)
  return response.json() as Promise<FinanceActionResponse>
}

export async function saveMonthlyBudget(payload: { category: string; plannedAmount: number; month?: string; notes?: string }): Promise<FinanceActionResponse> {
  const response = await fetch(apiPath('/api/finance/budget'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Monthly budget save failed with status ${response.status}`)
  return response.json() as Promise<FinanceActionResponse>
}

export async function updateFinanceAccountSettings(payload: { accountId: string; includeInBudget?: boolean; includeInNetWorth?: boolean }): Promise<FinanceActionResponse> {
  const response = await fetch(apiPath('/api/finance/account-settings'), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Account settings update failed with status ${response.status}`)
  return response.json() as Promise<FinanceActionResponse>
}
