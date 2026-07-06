import type { PersonalProjectionKey } from '../data/personalProjectionClient'
import type { ProjectedSection } from '../data/projectedTypes'

export const generatedProjectedSections: Partial<Record<PersonalProjectionKey, ProjectedSection>> = {
  "identity": {
    "heroSummary": "Identity is currently grounded in the Execution (ship + prep) year theme, with ship the software as the immediate mission and the ideal self acting as the compass.",
    "summaryCards": [
      {
        "label": "Current identity statement",
        "value": "Execution-era self",
        "note": "Calm, disciplined, focused, and happy every day."
      },
      {
        "label": "Ideal self alignment",
        "value": "Gap-aware",
        "note": "The ideal self is treated as a grounded compass, not fantasy."
      },
      {
        "label": "Current mission / year theme",
        "value": "Execution (ship + prep)",
        "note": "Current top mission: Ship the software."
      },
      {
        "label": "Top active goals",
        "value": "Ship the software",
        "note": "Pulled from 90-day focus and annual goals."
      },
      {
        "label": "Current dilemmas / blockers",
        "value": "Environment + consistency",
        "note": ""
      },
      {
        "label": "Recent lessons / growth",
        "value": "Bridge current self to ideal self",
        "note": ""
      }
    ],
    "highlights": [
      "Year theme: Execution (ship + prep)",
      "Top mission: Ship the software",
      "Ideal Self, Goals Overview, and Annual Goals are the main identity anchors."
    ],
    "freshness": {
      "label": "Identity planning docs",
      "ageDays": 0,
      "stale": false
    }
  }
} as Partial<Record<PersonalProjectionKey, ProjectedSection>>

export function getGeneratedProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  return generatedProjectedSections[key] ?? null
}
