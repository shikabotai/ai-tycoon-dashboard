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

import { apiPath } from '../lib/apiBase'

const PERSONAL_ENDPOINTS = {
  vessel: apiPath('/api/personal/vessel'),
  identity: apiPath('/api/personal/identity'),
  systems: apiPath('/api/personal/systems'),
  ventures: apiPath('/api/personal/ventures'),
  career: apiPath('/api/personal/career'),
  knowledge: apiPath('/api/personal/knowledge'),
  wealth: apiPath('/api/personal/wealth'),
  education: apiPath('/api/personal/education'),
  relationships: apiPath('/api/personal/relationships'),
} as const

export type PersonalProjectionKey = keyof typeof PERSONAL_ENDPOINTS

export async function loadProjectedSection(key: PersonalProjectionKey): Promise<ProjectedSection | null> {
  const response = await fetch(PERSONAL_ENDPOINTS[key])
  if (!response.ok) return null
  return response.json() as Promise<ProjectedSection>
}
