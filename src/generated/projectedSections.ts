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
        "note": "Current sources still need richer blocker extraction."
      },
      {
        "label": "Recent lessons / growth",
        "value": "Bridge current self to ideal self",
        "note": "Identity plan is still serving as the main growth lens."
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
  },
  "vessel": {
    "heroSummary": "Current body system is in a cut / recomp, not lean bulk. phase with 155 lb as the latest working reference and a target range of 145\u2013148 lb by September.",
    "summaryCards": [
      {
        "label": "Weight / body metrics",
        "value": "155 lb",
        "note": "Target 145\u2013148 lb by September from Fitness Overview."
      },
      {
        "label": "Workout consistency",
        "value": "Last logged 2026-06-30",
        "note": "Workout evidence is pulled from latest markdown log."
      },
      {
        "label": "Nutrition consistency",
        "value": "Last logged 2026-07-03",
        "note": "Nutrition evidence is pulled from latest markdown log."
      },
      {
        "label": "Sleep / recovery",
        "value": "Best-effort projection",
        "note": "Direct sleep/recovery parsers are still pending.",
        "stale": true
      },
      {
        "label": "Mental state / discipline",
        "value": "Consistency > intensity",
        "note": "Current philosophy emphasizes sustainable rhythm first."
      },
      {
        "label": "Current physique goal",
        "value": "145\u2013148 lb",
        "note": "Lean, defined, and preserving muscle rather than swingy crash dieting."
      }
    ],
    "highlights": [
      "Latest workout evidence: 2026-06-30",
      "Latest nutrition evidence: 2026-07-03",
      "Cut / recomp, not lean bulk."
    ],
    "freshness": {
      "label": "Vessel evidence",
      "ageDays": 0,
      "stale": false
    }
  },
  "systems": {
    "heroSummary": "Systems is grounded in the Operations Task Board with 0 open checklist items currently visible and 0 completed ones captured in the source note.",
    "summaryCards": [
      {
        "label": "Operations board",
        "value": "0 open",
        "note": "Derived from checklist items in Operations Task Board."
      },
      {
        "label": "Closed loops",
        "value": "0 completed",
        "note": "Completed checklist count from the same operating board."
      },
      {
        "label": "Venture surface area",
        "value": "13 listed lines",
        "note": "Quick proxy for active venture inventory in Ventures MOC."
      },
      {
        "label": "Automation posture",
        "value": "Manual + AI-assisted",
        "note": "Current systems layer is still hybrid, not fully automated yet."
      },
      {
        "label": "Operating principle",
        "value": "Capture > clarify > execute",
        "note": "The goal is a practical operations layer, not a decorative dashboard."
      },
      {
        "label": "Current systems need",
        "value": "Better live rollups",
        "note": "This page is now ready for richer projection modules beyond simple counts.",
        "stale": true
      }
    ],
    "highlights": [
      "Operations Task Board is the main systems anchor.",
      "Ventures MOC helps expose cross-project surface area.",
      "This page should evolve into the daily operational command layer."
    ],
    "freshness": {
      "label": "Operations board evidence",
      "ageDays": 0,
      "stale": false
    }
  },
  "ventures": {
    "heroSummary": "Ventures is currently a portfolio view with 13 venture bullets visible in the Ventures MOC and 4 explicit in-progress markers across annual goals.",
    "summaryCards": [
      {
        "label": "Portfolio inventory",
        "value": "13 listed bullets",
        "note": "Fast proxy for how much venture surface area exists in the current note set."
      },
      {
        "label": "Current priority posture",
        "value": "Execution over ideation",
        "note": "Annual goals emphasize shipping and traction, not endless exploration."
      },
      {
        "label": "In-progress venture goals",
        "value": "4 in progress",
        "note": "Pulled from the annual goals source note."
      },
      {
        "label": "Capital deployment stance",
        "value": "Selective",
        "note": "This control center should eventually expose ROI-ranked moves, not just inventories."
      },
      {
        "label": "Biggest operating need",
        "value": "Priority compression",
        "note": "Reduce surface area and make the next best move obvious."
      },
      {
        "label": "Current blocker visibility",
        "value": "Improving",
        "note": "Business Command will complement this page with live operational blockers."
      }
    ],
    "highlights": [
      "Ventures MOC remains the personal strategy-side anchor.",
      "Annual goals provide the immediate venture pressure.",
      "This page should stay distinct from Business Command live ops."
    ],
    "freshness": {
      "label": "Ventures planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "knowledge": {
    "heroSummary": "Knowledge is currently more execution-supportive than archival, with learning tied to decision quality, identity formation, and active goals instead of passive accumulation.",
    "summaryCards": [
      {
        "label": "Current learning domains",
        "value": "Career, ventures, self-mastery",
        "note": "The current note set points toward practical domains rather than broad browsing."
      },
      {
        "label": "Most valuable mental models",
        "value": "1 explicit mentions",
        "note": "Current source notes imply frameworks matter, but this page still needs richer extraction."
      },
      {
        "label": "Recently added knowledge",
        "value": "Not yet projected",
        "note": "A future pass should surface recency from the knowledge-side repo structure.",
        "stale": true
      },
      {
        "label": "High-value references",
        "value": "Goals + Ideal Self",
        "note": "Right now the strongest references are strategic and identity-oriented notes."
      },
      {
        "label": "Current research / reading focus",
        "value": "Reading goal active",
        "note": "| Read 10 books | Learning | 10 by 12/31 | 1/10 completed |"
      },
      {
        "label": "Knowledge gaps to close",
        "value": "Stronger live knowledge rollups",
        "note": "This page needs deeper source mapping to become truly strong.",
        "stale": true
      }
    ],
    "highlights": [
      "Knowledge should help action, not become a hoarding layer.",
      "Current projections are still strategy-heavy and should deepen later.",
      "This section is ready for richer repo traversal when Phase 1 core is complete."
    ],
    "freshness": {
      "label": "Knowledge planning docs",
      "ageDays": 0,
      "stale": false
    }
  }
} as Partial<Record<PersonalProjectionKey, ProjectedSection>>

export function getGeneratedProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  return generatedProjectedSections[key] ?? null
}
