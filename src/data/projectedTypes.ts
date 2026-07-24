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

export type EducationDeadlineProjection = {
  id: string
  courseCode: string
  courseName: string
  title: string
  dueAt: string
  internalTarget: string
  kind: 'report' | 'quiz' | 'discussion' | 'exam' | 'extra-credit' | 'assignment'
  status: 'urgent' | 'soon' | 'later'
}

export type EducationCourseProjection = {
  code: string
  name: string
  term: string
  status: 'taken' | 'active' | 'planned'
  role: 'core' | 'ml-elective' | 'free-elective'
  difficulty: number
  why: string
}

export type EducationAlternativeProjection = {
  code: string
  name: string
  difficulty: number
  bestFor: string
}

export type EducationProjection = {
  activeProgram: string
  activeTerm: string
  activeCourses: string[]
  coursePlan: EducationCourseProjection[]
  alternatives: EducationAlternativeProjection[]
  urgentDeadlines: EducationDeadlineProjection[]
  planNote: string
}

export type CareerSectionStatus = 'done' | 'active' | 'planned' | 'blocked' | 'missing'

export type CareerSectionProjection = {
  id: string
  label: string
  status: CareerSectionStatus
  value: string
  detail: string
  nextAction: string
  source: string
}

export type CareerStarStoryProjection = {
  id: string
  title: string
  tags: string[]
  bestFor: string[]
  situation: string
  task: string
  action: string
  result: string
}

export type CareerCategoryProjection = {
  id: 'current-job' | 'job-search' | 'portfolio'
  title: string
  sections: CareerSectionProjection[]
}

export type CareerProjection = {
  headline: string
  categories: CareerCategoryProjection[]
  starStories: CareerStarStoryProjection[]
  prompts: ProjectedContextItem[]
}

export type WealthAccountProjection = {
  label: string
  value: string
  note: string
}

export type WealthHourlyProjection = {
  monthlyNetIncome: string
  monthlyExpenses: string
  monthlySurplus: string
  jobHours: string
  freelanceHours: string
  formula: string
  threshold: string
  status: string
}

export type WealthPanelProjection = {
  id: 'net-worth' | 'real-hourly-value' | 'cashflow'
  title: string
  kicker: string
  summary: string
  metrics: WealthAccountProjection[]
  nextAction: string
}

export type WealthProjection = {
  headline: string
  asOf: string
  accounts: WealthAccountProjection[]
  hourly: WealthHourlyProjection
  panels: WealthPanelProjection[]
  prompts: ProjectedContextItem[]
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
  education?: EducationProjection
  career?: CareerProjection
  wealth?: WealthProjection
}
