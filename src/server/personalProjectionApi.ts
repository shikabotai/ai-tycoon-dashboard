import { buildCareerData, buildEducationData, buildIdentityData, buildKnowledgeData, buildRelationshipsData, buildSystemsData, buildVesselData, buildVenturesData, buildWealthData } from '../data/punkProjection'
import { attachProjectedDashboard } from '../data/projectedDashboardModel'
import type { ProjectedSection } from '../data/projectedTypes'
import type { PersonalProjectionKey } from '../data/personalProjectionClient'

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
  return builder ? attachProjectedDashboard(key, builder()) : null
}
