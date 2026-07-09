import type { ProjectedSection } from './projectedTypes'
import { personalApiPath } from '../lib/apiBase'
import { generatedProjectedSections } from '../generated/projectedSections'
import { attachProjectedDashboard } from './projectedDashboardModel'

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

function fallbackSection(key: PersonalProjectionKey): ProjectedSection | null {
  const section = generatedProjectedSections[key]
  return section ? attachProjectedDashboard(key, section) : null
}

export async function loadProjectedSection(key: PersonalProjectionKey): Promise<ProjectedSection | null> {
  try {
    const response = await fetch(PERSONAL_ENDPOINTS[key])
    if (!response.ok) return fallbackSection(key)

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) return fallbackSection(key)

    const section = await response.json() as ProjectedSection
    return attachProjectedDashboard(key, section)
  } catch {
    return fallbackSection(key)
  }
}
