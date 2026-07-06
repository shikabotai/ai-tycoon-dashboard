import type { DashboardSummary } from '../types'
import { apiPath } from '../lib/apiBase'
import type { CommandContext } from './commandRouter'
import { routeCommand } from './commandRouter'
import type { BusinessCommandPayload, BusinessCommandResponse } from '../server/commandRouteApi'

export async function sendBusinessCommand(raw: string, context: CommandContext, summary?: DashboardSummary): Promise<BusinessCommandResponse> {
  const route = routeCommand(raw, context)
  const response = await fetch(apiPath('/api/command/route'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, context, summary } satisfies BusinessCommandPayload),
  })

  if (!response.ok) {
    throw new Error(`Command route failed with status ${response.status}`)
  }

  return response.json() as Promise<BusinessCommandResponse>
}
