import fs from 'node:fs'

export type AutopilotStatus = {
  activeTaskId: string
  title: string
  status: string
  startedAt: string
  lastHeartbeatAt: string
  lastWorkActionAt: string
  lastCommitAt: string | null
  currentStep: string
  lastCompletedStep: string
  nextStep: string
  percentEstimate: number
  blocker: string | null
  repo: string
  notes: string[]
}

const AUTOPILOT_STATUS_PATH = '/Users/shika/business-agents/.openclaw/.openclaw/workspace/state/autopilot-status.json'

export function readAutopilotStatus(): AutopilotStatus | null {
  try {
    return JSON.parse(fs.readFileSync(AUTOPILOT_STATUS_PATH, 'utf8')) as AutopilotStatus
  } catch {
    return null
  }
}
