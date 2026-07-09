import type { DashboardSummary } from '../types'
import { commandApiPath } from '../lib/apiBase'
import type { CommandContext } from './commandRouter'
import { routeCommand } from './commandRouter'
import type { CommandHandoffPayload, CommandHandoffResponse } from '../server/commandHandoffApi'
import type { BusinessCommandPayload, BusinessCommandResponse } from '../server/commandRouteApi'

export async function sendBusinessCommand(raw: string, context: CommandContext, summary?: DashboardSummary): Promise<BusinessCommandResponse> {
  const route = routeCommand(raw, context)
  const response = await fetch(commandApiPath('/api/command/route'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, context, summary } satisfies BusinessCommandPayload),
  })

  if (!response.ok) {
    throw new Error(`Command route failed with status ${response.status}`)
  }

  return response.json() as Promise<BusinessCommandResponse>
}

export async function sendCommandHandoff(command: string, contextLabel: string, runtimeAction: BusinessCommandResponse['runtimeAction']): Promise<CommandHandoffResponse> {
  const response = await fetch(commandApiPath('/api/command/handoff'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, contextLabel, runtimeAction } satisfies CommandHandoffPayload),
  })

  if (!response.ok) {
    throw new Error(`Command handoff failed with status ${response.status}`)
  }

  return response.json() as Promise<CommandHandoffResponse>
}
