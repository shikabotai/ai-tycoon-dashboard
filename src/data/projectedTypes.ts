export type ProjectedCard = {
  label: string
  value: string
  note: string
  stale?: boolean
}

export type ProjectedSignalPriority = 'good' | 'watch' | 'stale'

export type ProjectedDashboardMetric = {
  label: string
  sourceCardIndex: number
  priority: ProjectedSignalPriority
}

export type ProjectedDashboardRow = {
  title: string
  body: string
  sourceCardIndex?: number
}

export type ProjectedDashboard = {
  headline: string
  metrics: ProjectedDashboardMetric[]
  operatingRows: ProjectedDashboardRow[]
  evidenceRows: ProjectedDashboardRow[]
  actionRows: ProjectedDashboardRow[]
}

export type ProjectedContextItem = {
  label: string
  value: string
  detail: string
  severity?: ProjectedSignalPriority
}

export type ProjectedTimelineItem = {
  label: string
  detail: string
  recency: string
  severity?: ProjectedSignalPriority
}

export type ProjectedSection = {
  heroSummary: string
  summaryCards: ProjectedCard[]
  highlights: string[]
  dashboard?: ProjectedDashboard
  blockers?: ProjectedContextItem[]
  missingData?: ProjectedContextItem[]
  timeline?: ProjectedTimelineItem[]
  freshness?: {
    label: string
    ageDays: number | null
    stale: boolean
  }
}
