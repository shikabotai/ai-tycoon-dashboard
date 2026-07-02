import type { DashboardSummary } from '../types'
import type { CommandContext, CommandRouteResult } from './commandRouter'
import { routeCommand } from './commandRouter'

type BusinessCommandPayload = {
  route: CommandRouteResult
  context: CommandContext
  summary?: DashboardSummary
}

export type BusinessCommandResponse = {
  ok: true
  route: string
  intent: string
  message: string
  nextAction: string
  suggestedPanel?: 'overview' | 'agents' | 'review'
}

export async function sendBusinessCommand(raw: string, context: CommandContext, summary?: DashboardSummary): Promise<BusinessCommandResponse> {
  const route = routeCommand(raw, context)
  const response = await fetch('/api/command/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, context, summary } satisfies BusinessCommandPayload),
  })

  if (!response.ok) {
    throw new Error(`Command route failed with status ${response.status}`)
  }

  return response.json() as Promise<BusinessCommandResponse>
}
