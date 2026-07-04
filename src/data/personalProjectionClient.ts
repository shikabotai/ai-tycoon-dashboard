export type ProjectedCard = {
  label: string
  value: string
  note: string
  stale?: boolean
}

export type ProjectedSection = {
  heroSummary: string
  summaryCards: ProjectedCard[]
  highlights: string[]
  freshness?: {
    label: string
    ageDays: number | null
    stale: boolean
  }
}

const PERSONAL_ENDPOINTS = {
  vessel: '/api/personal/vessel',
  identity: '/api/personal/identity',
  systems: '/api/personal/systems',
  ventures: '/api/personal/ventures',
  career: '/api/personal/career',
  knowledge: '/api/personal/knowledge',
  wealth: '/api/personal/wealth',
  education: '/api/personal/education',
  relationships: '/api/personal/relationships',
} as const

export type PersonalProjectionKey = keyof typeof PERSONAL_ENDPOINTS

export async function loadProjectedSection(key: PersonalProjectionKey): Promise<ProjectedSection | null> {
  const response = await fetch(PERSONAL_ENDPOINTS[key])
  if (!response.ok) return null
  return response.json() as Promise<ProjectedSection>
}
