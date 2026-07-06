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

import { personalApiPath } from '../lib/apiBase'

const PERSONAL_ENDPOINTS = {
  vessel: personalApiPath('/api/personal/vessel'),
  identity: personalApiPath('/api/personal/identity'),
  systems: personalApiPath('/api/personal/systems'),
  ventures: personalApiPath('/api/personal/ventures'),
  career: personalApiPath('/api/personal/career'),
  knowledge: personalApiPath('/api/personal/knowledge'),
  wealth: personalApiPath('/api/personal/wealth'),
  education: personalApiPath('/api/personal/education'),
  relationships: personalApiPath('/api/personal/relationships'),
} as const

export type PersonalProjectionKey = keyof typeof PERSONAL_ENDPOINTS

export async function loadProjectedSection(key: PersonalProjectionKey): Promise<ProjectedSection | null> {
  const response = await fetch(PERSONAL_ENDPOINTS[key])
  if (!response.ok) return null
  return response.json() as Promise<ProjectedSection>
}
