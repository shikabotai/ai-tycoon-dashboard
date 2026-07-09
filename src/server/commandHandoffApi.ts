import type { BusinessCommandResponse } from './commandRouteApi'

export type CommandHandoffPayload = {
  command: string
  contextLabel: string
  runtimeAction: BusinessCommandResponse['runtimeAction']
}

export type CommandHandoffResponse = {
  ok: boolean
  auditId: string
  status: 'requires_approval' | 'ignored'
  message: string
  safety: string
  recordedAt: string
  provenance: string[]
}

export function buildCommandHandoffResponse(payload: CommandHandoffPayload): CommandHandoffResponse {
  const recordedAt = new Date().toISOString()
  const runtimeAction = payload.runtimeAction
  const provenance = [
    ...(runtimeAction?.provenance ?? []),
    `context:${payload.contextLabel || 'unknown'}`,
    `handoff-recorded:${recordedAt}`,
  ]
  const auditId = `handoff-${hashString([payload.command, runtimeAction?.id, recordedAt].join('|'))}`

  if (runtimeAction?.target !== 'assistant-runtime') {
    return {
      ok: true,
      auditId,
      status: 'ignored',
      message: 'No assistant handoff was needed for this dashboard-runtime action.',
      safety: 'Dashboard-runtime actions stay local to the control center unless a later command explicitly targets the assistant runtime.',
      recordedAt,
      provenance,
    }
  }

  return {
    ok: true,
    auditId,
    status: 'requires_approval',
    message: 'Assistant handoff recorded behind the approval boundary. No external action was dispatched.',
    safety: 'The backend accepts the handoff record only; sending, approval, or workflow execution still requires an explicit future bridge.',
    recordedAt,
    provenance,
  }
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36)
}
