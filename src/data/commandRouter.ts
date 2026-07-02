export type CommandContext = {
  appMode: 'personal' | 'business'
  personalSection: string
  businessPanel: string
}

export type CommandRouteResult = {
  route: string
  intent: string
  summary: string
  nextAction: string
  suggestedPanel?: 'overview' | 'agents' | 'review'
}

function includesAny(input: string, terms: string[]) {
  return terms.some((term) => input.includes(term))
}

export function routeCommand(raw: string, context: CommandContext): CommandRouteResult {
  const input = raw.trim().toLowerCase()

  if (includesAny(input, ['approve', 'approval', 'review', 'deny', 'reject'])) {
    return {
      route: 'business-review',
      intent: 'review_action',
      summary: 'This command belongs in the Business Command review flow.',
      nextAction: 'Focus the review dock and map the request to an approval or denial action.',
      suggestedPanel: 'review',
    }
  }

  if (includesAny(input, ['task', 'project', 'agent', 'pipeline', 'revenue', 'business'])) {
    return {
      route: 'business-command',
      intent: 'business_query',
      summary: 'This command should be handled against live business operational state.',
      nextAction: 'Use dashboard business data, then route to the assistant/runtime for deeper actions if needed.',
      suggestedPanel: includesAny(input, ['agent', 'agents', 'team', 'worker', 'manager']) ? 'agents' : 'overview',
    }
  }

  if (includesAny(input, ['workout', 'nutrition', 'weight', 'body', 'sleep', 'vessel'])) {
    return {
      route: 'personal-vessel',
      intent: 'personal_vessel',
      summary: 'This command belongs to the Vessel operating layer.',
      nextAction: 'Use PunkRecords Vessel projections and then route to the assistant/runtime if an action is needed.',
    }
  }

  if (includesAny(input, ['goal', 'identity', 'ideal self', 'mission', 'focus'])) {
    return {
      route: 'personal-identity',
      intent: 'personal_identity',
      summary: 'This command belongs to the Identity and decision layer.',
      nextAction: 'Use Identity/Goals projections and then route to the assistant/runtime if an action is needed.',
    }
  }

  return {
    route: context.appMode === 'business' ? 'business-command' : `personal-${context.personalSection}`,
    intent: 'general_command',
    summary: `This command currently routes by active UI context (${context.appMode}).`,
    nextAction: 'Capture the command, show routing intent, and hand off to the assistant/runtime in the next backend step.',
    suggestedPanel: context.appMode === 'business' ? context.businessPanel as 'overview' | 'agents' | 'review' : undefined,
  }
}
