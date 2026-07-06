import { buildCareerData, buildEducationData, buildIdentityData, buildKnowledgeData, buildRelationshipsData, buildSystemsData, buildVesselData, buildVenturesData, buildWealthData } from '../data/punkProjection'
import type { PersonalProjectionKey, ProjectedSection } from '../data/personalProjectionClient'

const PERSONAL_BUILDERS: Record<PersonalProjectionKey, () => ProjectedSection> = {
  vessel: buildVesselData,
  identity: buildIdentityData,
  systems: buildSystemsData,
  ventures: buildVenturesData,
  career: buildCareerData,
  knowledge: buildKnowledgeData,
  wealth: buildWealthData,
  education: buildEducationData,
  relationships: buildRelationshipsData,
}

export function getProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  const builder = PERSONAL_BUILDERS[key]
  return builder ? builder() : null
}
