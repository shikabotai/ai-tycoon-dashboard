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

export type IdentityQualityProjection = {
  id: string
  name: string
  score: number
  tenMeans: string
  nextAction: string
  source: string
}

export type IdentityScoreHistoryPoint = {
  label: string
  score: number
}

export type IdentityNightlyChange = {
  qualityId: string
  delta: number
  reason: string
}

export type IdentityProjection = {
  statement: string
  statementSource: string
  qualities: IdentityQualityProjection[]
  scoreHistory: IdentityScoreHistoryPoint[]
  nightlyChanges: IdentityNightlyChange[]
  lastUpdatedLabel: string
}

export type VesselMuscleGroupProjection = {
  id: string
  label: string
  priority: string
  recentSets: number
  lastHit: string | null
  lastHitLabel: string
  heat: 'hot' | 'solid' | 'touched' | 'stale' | 'missing'
  recommendation: string
}

export type VesselProjection = {
  muscleGroups: VesselMuscleGroupProjection[]
  muscleWindowLabel: string
  musclePriorityNote: string
  meditation?: {
    latestSessionDate: string | null
    sessionCount: number
    baseline: string
    nextRep: string
    fallbackRep: string
    reminderWindows: string[]
  }
  looks?: {
    daily: string[]
    goingOut: string[]
  }
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
  identity?: IdentityProjection
  vessel?: VesselProjection
}
