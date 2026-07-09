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
  runtimeAction: {
    id: string
    label: string
    target: 'dashboard-runtime' | 'assistant-runtime'
    status: 'executed' | 'ready' | 'requires_approval'
    effect: string
    safety: string
    provenance: string[]
    executedAt: string
  }
}

export function buildBusinessCommandResponse(payload: BusinessCommandPayload): BusinessCommandResponse {
  const route = payload.route || {}
  const summary = payload.summary ?? EMPTY_SUMMARY
  const routeName = route.route || 'unknown'
  const intent = route.intent || 'general_command'
  const suggestedPanel = route.suggestedPanel
  const runtimeAction = buildRuntimeAction(routeName, intent, suggestedPanel)

  return {
    ok: true,
    route: routeName,
    intent,
    message: `Routed to ${routeName} with ${summary.approvalsPending ?? 0} pending approvals and ${summary.publishedToday ?? 0} publications today.`,
    nextAction: route.nextAction || 'Hand off to the assistant/runtime backend.',
    suggestedPanel,
    runtimeAction,
  }
}

function buildRuntimeAction(route: string, intent: string, suggestedPanel?: 'overview' | 'agents' | 'review'): BusinessCommandResponse['runtimeAction'] {
  const executedAt = new Date().toISOString()
  const provenance = [
    `route:${route}`,
    `intent:${intent}`,
    suggestedPanel ? `panel:${suggestedPanel}` : 'panel:current',
  ]

  if (intent === 'review_action') {
    return {
      id: 'focus-review-dock',
      label: 'Focus review dock',
      target: 'dashboard-runtime',
      status: 'executed',
      effect: 'Business Command moved the dashboard into the live review dock so pending approval context is visible before any decision.',
      safety: 'Navigation-only action. Approval or denial still requires an explicit button press and denial notes.',
      provenance,
      executedAt,
    }
  }

  if (route === 'business-command') {
    return {
      id: suggestedPanel === 'agents' ? 'focus-agent-load' : 'focus-business-overview',
      label: suggestedPanel === 'agents' ? 'Focus agent workload' : 'Focus business overview',
      target: 'dashboard-runtime',
      status: 'executed',
      effect: `Business Command focused the ${suggestedPanel || 'overview'} panel against the current live business data.`,
      safety: 'Read-only dashboard navigation. No external workflow is triggered without a later explicit action.',
      provenance,
      executedAt,
    }
  }

  return {
    id: 'prepare-assistant-hand-off',
    label: 'Prepare assistant handoff',
    target: 'assistant-runtime',
    status: 'ready',
    effect: 'The request has a bounded command route and can be handed to an assistant runtime once a safe execution bridge is enabled.',
    safety: 'Prepared only. No message, approval, or external action is sent from this route.',
    provenance,
    executedAt,
  }
}
