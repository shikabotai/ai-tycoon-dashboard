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
  },
  "career": {
    "heroSummary": "Career is currently in a leverage-building phase, with job-search preparation and long-arc ML credentials both visible in the source planning system.",
    "summaryCards": [
      {
        "label": "Current career trajectory",
        "value": "In progress",
        "note": "Land higher-paying SWE role or negotiate raise"
      },
      {
        "label": "Primary career goal",
        "value": "Higher-paying SWE role",
        "note": "Target is stronger leverage through a raise or better offer."
      },
      {
        "label": "Long-arc credential",
        "value": "Georgia Tech MSML",
        "note": "| Georgia Tech MSML completed | Career | 2027 | In progress |"
      },
      {
        "label": "Skill-building progress",
        "value": "MSML path active",
        "note": "| Georgia Tech MSML completed | Career | 2027 | In progress |"
      },
      {
        "label": "Current leverage opportunities",
        "value": "Comp increase focus",
        "note": "Target is a >$20k comp increase or stronger role leverage."
      },
      {
        "label": "Next career milestone",
        "value": "Interview-ready profile",
        "note": "This page should later gain direct portfolio/resume artifacts and cadence tracking."
      }
    ],
    "highlights": [
      "Career blends income leverage with long-term ML positioning.",
      "Annual goals and 5-year goals are the main current sources.",
      "This page should later expose evidence, not just strategy text."
    ],
    "freshness": {
      "label": "Career planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "education": {
    "heroSummary": "Education is currently a supporting but serious track, centered on completing the Georgia Tech MSML path while balancing career and execution priorities.",
    "summaryCards": [
      {
        "label": "Current program / course load",
        "value": "Georgia Tech MSML",
        "note": "| Georgia Tech MSML completed | Career | 2027 | In progress |"
      },
      {
        "label": "Why it matters",
        "value": "Long-term ML leverage",
        "note": "Education is tied to future career leverage, not abstract credential collection."
      },
      {
        "label": "Current tradeoff",
        "value": "Execution vs depth",
        "note": "The challenge is balancing shipping pressure with sustained study."
      },
      {
        "label": "Support system",
        "value": "Self-directed",
        "note": "This page should later surface concrete timelines, deliverables, and pacing."
      },
      {
        "label": "Biggest risk",
        "value": "Overload / dilution",
        "note": "Education can slip if too many business and career fronts are active at once."
      },
      {
        "label": "Next education milestone",
        "value": "Sustained completion path",
        "note": "Future versions should show direct program checkpoints."
      }
    ],
    "highlights": [
      "Education is strategic, not ornamental.",
      "MSML is the clearest current anchor.",
      "This section still needs deeper milestone extraction later."
    ],
    "freshness": {
      "label": "Education planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "wealth": {
    "heroSummary": "Wealth is currently framed as leverage-building rather than passive tracking, with compensation growth and venture upside both acting as the main financial drivers.",
    "summaryCards": [
      {
        "label": "Current financial priorities",
        "value": "Increase leverage",
        "note": "Comp growth and venture traction both matter on the current path."
      },
      {
        "label": "Cashflow strategy",
        "value": "Earn more first",
        "note": "The current system emphasizes higher income and upside before elaborate optimization."
      },
      {
        "label": "Wealth operating stance",
        "value": "Selective accumulation",
        "note": "Avoid distraction and focus on the highest-leverage growth paths."
      },
      {
        "label": "Main wealth engines",
        "value": "Career + ventures",
        "note": "Those are still the clearest financial multipliers in the current plan."
      },
      {
        "label": "Current blind spot",
        "value": "Live net-worth visibility",
        "note": "This section still needs stronger direct financial source integration.",
        "stale": true
      },
      {
        "label": "Next wealth milestone",
        "value": "Stronger recurring surplus",
        "note": "Future versions should surface explicit financial scoreboard data."
      }
    ],
    "highlights": [
      "Wealth is being treated as leverage, not vanity tracking.",
      "Current plan is still income- and venture-centric.",
      "This section will benefit from deeper structured source integration later."
    ],
    "freshness": {
      "label": "Wealth planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "relationships": {
    "heroSummary": "Relationships is currently more directional than fully instrumented, with family grounding and serious long-term partnership still visible in the planning layer.",
    "summaryCards": [
      {
        "label": "Current relationship posture",
        "value": "Long-term oriented",
        "note": "- **Relationship:** Wife or fianc\u00e9e. The relationship is solid, loving, and both people are proud of each other. Not stressful, not uncertain."
      },
      {
        "label": "Important people / focus",
        "value": "Family + future partner path",
        "note": "Family grounding and future partnership both remain active themes."
      },
      {
        "label": "Social growth edge",
        "value": "Confidence + environment",
        "note": "Identity notes imply social confidence and environment are still part of the work."
      },
      {
        "label": "Main blocker",
        "value": "Context mismatch",
        "note": "The right environment and consistent exposure still matter more than abstract intention."
      },
      {
        "label": "Desired outcome",
        "value": "Serious aligned relationship",
        "note": "This is treated as a real life-direction goal, not a vague someday wish."
      },
      {
        "label": "Next relationship milestone",
        "value": "Better social positioning",
        "note": "Future versions should expose more direct relationship evidence and momentum."
      }
    ],
    "highlights": [
      "Relationships is still a strategy-heavy section today.",
      "Family and future partnership are both visible anchors.",
      "This page should gain stronger direct evidence over time."
    ],
    "freshness": {
      "label": "Relationship planning docs",
      "ageDays": 0,
      "stale": false
    }
  }
} as Partial<Record<PersonalProjectionKey, ProjectedSection>>

export function getGeneratedProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  return generatedProjectedSections[key] ?? null
}
