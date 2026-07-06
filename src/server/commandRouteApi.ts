import type { DashboardSummary } from '../types'
import type { CommandContext, CommandRouteResult } from '../data/commandRouter'

const EMPTY_SUMMARY: Partial<DashboardSummary> = {}

export type BusinessCommandPayload = {
  route: CommandRouteResult
  context: CommandContext
  summary?: Partial<DashboardSummary>
}

export type BusinessCommandResponse = {
  ok: true
  route: string
  intent: string
  message: string
  nextAction: string
  suggestedPanel?: 'overview' | 'agents' | 'review'
}

export function buildBusinessCommandResponse(payload: BusinessCommandPayload): BusinessCommandResponse {
  const route = payload.route || {}
  const summary = payload.summary ?? EMPTY_SUMMARY

  return {
    ok: true,
    route: route.route || 'unknown',
    intent: route.intent || 'general_command',
    message: `Routed to ${route.route || 'unknown'} with ${summary.approvalsPending ?? 0} pending approvals and ${summary.publishedToday ?? 0} publications today.`,
    nextAction: route.nextAction || 'Hand off to the assistant/runtime backend.',
    suggestedPanel: route.suggestedPanel,
  }
}
