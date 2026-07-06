import type { PersonalProjectionKey } from '../data/personalProjectionClient'
import type { ProjectedSection } from '../data/projectedTypes'

export const generatedProjectedSections: Partial<Record<PersonalProjectionKey, ProjectedSection>> = {}

export function getGeneratedProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  return generatedProjectedSections[key] ?? null
}
