import type { PersonalProjectionKey } from '../data/personalProjectionClient'
import { attachProjectedDashboard } from '../data/projectedDashboardModel'
import type { ProjectedSection } from '../data/projectedTypes'

export const generatedProjectedSections: Partial<Record<PersonalProjectionKey, ProjectedSection>> = {
  "identity": {
    "heroSummary": "",
    "summaryCards": [
      {
        "label": "Current identity statement",
        "value": "Ideal Self source",
        "note": "Calm, disciplined, focused, and happy every day."
      },
      {
        "label": "Ideal self alignment",
        "value": "Gap-aware",
        "note": "The page compares source standards against current gaps."
      },
      {
        "label": "Current focus",
        "value": "Execution (ship + prep)",
        "note": "Top active goal: Ship the software."
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
      "Current focus: Execution (ship + prep)",
      "Top active goal: Ship the software",
      "Ideal Self and Goals Overview are the main identity anchors."
    ],
    "freshness": {
      "label": "Identity planning docs",
      "ageDays": 0,
      "stale": false
    },
    "identity": {
      "statement": "Calm, disciplined, focused, and happy every day.",
      "statementSource": "Personal Decision Engine / Ideal Self / Character & Habits",
      "qualities": [
        {
          "id": "physical-presence-energy",
          "name": "Physical presence / energy",
          "score": 6.4,
          "tenMeans": "Fit, high energy, confident",
          "nextAction": "Vessel — lean bulk, training consistency",
          "source": "Personal Decision Engine / Ideal Self"
        },
        {
          "id": "social-confidence",
          "name": "Social confidence",
          "score": 5.9,
          "tenMeans": "Magnetic, present, connecting",
          "nextAction": "Environment change + deliberate social investment",
          "source": "Personal Decision Engine / Ideal Self"
        },
        {
          "id": "phone-habits",
          "name": "Phone habits",
          "score": 5.5,
          "tenMeans": "Present, intentional use",
          "nextAction": "Habits Overview — phone elimination protocol",
          "source": "Personal Decision Engine / Ideal Self"
        },
        {
          "id": "financial-situation",
          "name": "Financial situation",
          "score": 5,
          "tenMeans": "Freedom, multiple income streams",
          "nextAction": "Finance MOC + Ventures MOC — active work",
          "source": "Personal Decision Engine / Ideal Self"
        },
        {
          "id": "relationship",
          "name": "Relationship",
          "score": 4.6,
          "tenMeans": "Partner by 30",
          "nextAction": "Intentional dating when life is in the right city",
          "source": "Personal Decision Engine / Ideal Self"
        },
        {
          "id": "location",
          "name": "Location",
          "score": 4.1,
          "tenMeans": "Energetic city, near family eventually",
          "nextAction": "NYC or return to South FL — evaluate timeline",
          "source": "Personal Decision Engine / Ideal Self"
        }
      ],
      "scoreHistory": [
        {
          "label": "Jul 22",
          "score": 5.3
        }
      ],
      "nightlyChanges": [
        {
          "qualityId": "physical-presence-energy",
          "delta": 0,
          "reason": "Personal Decision Engine / Ideal Self refreshed; current gap: Vessel — lean bulk, training consistency"
        },
        {
          "qualityId": "social-confidence",
          "delta": 0,
          "reason": "Personal Decision Engine / Ideal Self refreshed; current gap: Environment change + deliberate social investment"
        },
        {
          "qualityId": "phone-habits",
          "delta": 0,
          "reason": "Personal Decision Engine / Ideal Self refreshed; current gap: Habits Overview — phone elimination protocol"
        }
      ],
      "lastUpdatedLabel": "Nightly source refresh: Jul 22"
    }
  },
  "vessel": {
    "heroSummary": "A simple daily dashboard for the four Vessel levers: lift consistently, hit the food log, reset attention, and keep presentation sharp.",
    "summaryCards": [
      {
        "label": "Weight / body metrics",
        "value": "154 lb",
        "note": "Target 145–148 lb by September from Fitness Overview."
      },
      {
        "label": "Workout consistency",
        "value": "Last logged 2026-07-21",
        "note": "1 days since latest lift. Next: chest-focused work or light pull/rear delts, depending on shoulder and biceps recovery.",
        "stale": false
      },
      {
        "label": "Nutrition consistency",
        "value": "91g protein",
        "note": "860 kcal logged. 0 days since latest nutrition evidence.",
        "stale": false
      },
      {
        "label": "Meditation consistency",
        "value": "No logged sessions yet",
        "note": "5-minute sessions; 0 sessions logged."
      },
      {
        "label": "Current physique goal",
        "value": "145–148 lb",
        "note": "Lean, defined, and preserving muscle rather than swingy crash dieting."
      }
    ],
    "highlights": [
      "Latest workout evidence: 2026-07-21",
      "Latest nutrition evidence: 2026-07-22",
      "Cut / recomp, not lean bulk",
      "Mental priority: focus, attention span, meditation, and phone friction",
      "Looks priority: grooming, skin, hair, style, and event readiness"
    ],
    "freshness": {
      "label": "Vessel evidence",
      "ageDays": 0,
      "stale": false
    },
    "vessel": {
      "muscleGroups": [
        {
          "id": "back",
          "label": "Back",
          "priority": "V-taper priority",
          "recentSets": 33,
          "lastHit": "2026-07-21",
          "lastHitLabel": "1 day ago",
          "heat": "hot",
          "recommendation": "Keep one vertical pull and one row pattern active each week."
        },
        {
          "id": "shoulders",
          "label": "Shoulders",
          "priority": "Width priority",
          "recentSets": 13,
          "lastHit": "2026-07-21",
          "lastHitLabel": "1 day ago",
          "heat": "hot",
          "recommendation": "Keep lateral delts and rear delts visible for the shoulder-width goal."
        },
        {
          "id": "chest",
          "label": "Chest",
          "priority": "Upper-chest priority",
          "recentSets": 8,
          "lastHit": "2026-07-17",
          "lastHitLabel": "5 days ago",
          "heat": "hot",
          "recommendation": "Add pressing or fly work if chest has not shown up recently."
        },
        {
          "id": "biceps",
          "label": "Biceps",
          "priority": "Arm detail",
          "recentSets": 14,
          "lastHit": "2026-07-21",
          "lastHitLabel": "1 day ago",
          "heat": "hot",
          "recommendation": "Keep curls in the rotation, but do not let arms crowd out chest or legs."
        },
        {
          "id": "triceps",
          "label": "Triceps",
          "priority": "Arm mass",
          "recentSets": 14,
          "lastHit": "2026-07-20",
          "lastHitLabel": "2 days ago",
          "heat": "hot",
          "recommendation": "Use pushdowns or overhead work to keep arms full while cutting."
        },
        {
          "id": "abs",
          "label": "Abs",
          "priority": "Lean-look priority",
          "recentSets": 14,
          "lastHit": "2026-07-21",
          "lastHitLabel": "1 day ago",
          "heat": "hot",
          "recommendation": "Keep direct core work frequent while the cut reveals definition."
        },
        {
          "id": "legs",
          "label": "Legs",
          "priority": "Balance priority",
          "recentSets": 6,
          "lastHit": "2026-07-21",
          "lastHitLabel": "1 day ago",
          "heat": "solid",
          "recommendation": "Do not let the aesthetics push turn into skipping legs."
        },
        {
          "id": "cardio",
          "label": "Cardio",
          "priority": "Cut support",
          "recentSets": 0,
          "lastHit": null,
          "lastHitLabel": "No recent log",
          "heat": "missing",
          "recommendation": "Add Zone 2 when fat-loss support is missing from the week."
        }
      ],
      "muscleWindowLabel": "Recent workout logs, weighted toward the last 7 days",
      "musclePriorityNote": "Aesthetic priorities emphasize V-taper, shoulder width, upper chest, arms, visible abs, balanced legs, and enough cardio to support the cut.",
      "meditation": {
        "latestSessionDate": null,
        "sessionCount": 0,
        "baseline": "5-minute sessions",
        "nextRep": "5 min focused breathing after the morning brain dump",
        "fallbackRep": "Walking meditation or box breathing on unfocused days",
        "reminderWindows": [
          "10:00 AM ET",
          "7:30 PM ET"
        ]
      },
      "looks": {
        "daily": [
          "Wash face with Vanicream Gentle Facial Cleanser",
          "Apply Timeless 20% Vitamin C + E Ferulic Serum",
          "Apply Belif The True Cream Aqua Bomb",
          "Apply Beauty of Joseon Relief Sun SPF 50+"
        ],
        "goingOut": [
          "Apply Too Faced Lip Injection Extreme if wanted",
          "After moisturizer, press 2–3 drops of Josie Maran 100% Pure Argan Oil into the face",
          "Wait about 5 minutes before going out",
          "Apply Dolce & Gabbana The One"
        ]
      }
    }
  },
  "systems": {
    "heroSummary": "Systems is grounded in the Operations Task Board with 0 open checklist items visible and 0 completed ones captured in the source note.",
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
        "note": "The systems layer blends human judgment with AI support."
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
    "heroSummary": "Ventures presents a portfolio view with 13 venture bullets visible in the Ventures MOC and 4 explicit in-progress markers across annual goals.",
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
        "note": "The control center is moving toward ROI-ranked moves rather than simple inventory."
      },
      {
        "label": "Biggest operating need",
        "value": "Priority compression",
        "note": "Reduce surface area and make the next best move obvious."
      },
      {
        "label": "Current blocker visibility",
        "value": "Improving",
        "note": "Business Command keeps live operational blockers separate from the personal strategy layer."
      }
    ],
    "highlights": [
      "Ventures MOC remains the personal strategy-side anchor.",
      "Annual goals provide the immediate venture pressure.",
      "Personal strategy stays distinct from Business Command live operations."
    ],
    "freshness": {
      "label": "Ventures planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "career": {
    "heroSummary": "Career is in a leverage-building phase, with job-search preparation and long-arc ML credentials both visible in the source planning system.",
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
        "note": "The next layer is direct portfolio, resume, and cadence evidence."
      }
    ],
    "highlights": [
      "Career blends income leverage with long-term ML positioning.",
      "Annual goals and 5-year goals are the main current sources.",
      "The next layer is direct evidence from portfolio, resume, and interview cadence."
    ],
    "freshness": {
      "label": "Career planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "knowledge": {
    "heroSummary": "Knowledge is execution-supportive rather than archival, with learning tied to decision quality, identity formation, and active goals.",
    "summaryCards": [
      {
        "label": "Current learning domains",
        "value": "Career, ventures, self-mastery",
        "note": "The current note set points toward practical domains rather than broad browsing."
      },
      {
        "label": "Most valuable mental models",
        "value": "1 explicit mentions",
        "note": "Source notes show frameworks as part of the decision system."
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
      "The strategy layer is established and ready for deeper source traversal.",
      "This section is ready for richer source traversal as the control center deepens."
    ],
    "freshness": {
      "label": "Knowledge planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "wealth": {
    "heroSummary": "Wealth is framed as leverage-building rather than passive tracking, with compensation growth and venture upside both acting as the main financial drivers.",
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
        "note": "These are the clearest financial multipliers in the current plan."
      },
      {
        "label": "Current blind spot",
        "value": "Live net-worth visibility",
        "note": "This section is waiting on stronger direct financial source integration.",
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
      "The current plan is income- and venture-centric.",
      "This section will benefit from deeper structured source integration later."
    ],
    "freshness": {
      "label": "Wealth planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "education": {
    "heroSummary": "Education is a supporting but serious track, centered on completing the Georgia Tech MSML path while balancing career and execution priorities.",
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
        "note": "The next layer is concrete timelines, deliverables, and pacing."
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
      "The next layer is deeper milestone extraction."
    ],
    "freshness": {
      "label": "Education planning docs",
      "ageDays": 0,
      "stale": false
    }
  },
  "relationships": {
    "heroSummary": "Relationships are more directional than fully instrumented, with family grounding and serious long-term partnership visible in the planning layer.",
    "summaryCards": [
      {
        "label": "Current relationship posture",
        "value": "Long-term oriented",
        "note": "Long-term partnership direction is kept as a private operating signal without exposing intimate planning detail."
      },
      {
        "label": "Important people / focus",
        "value": "Family + future partner path",
        "note": "Family grounding and future partnership both remain active themes."
      },
      {
        "label": "Social growth edge",
        "value": "Confidence + environment",
        "note": "Identity notes keep social confidence and environment in focus."
      },
      {
        "label": "Main blocker",
        "value": "Context mismatch",
        "note": "The right environment and consistent exposure matter more than abstract intention."
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
      "Relationships is a strategy-heavy section today.",
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
  const section = generatedProjectedSections[key]
  return section ? attachProjectedDashboard(key, section) : null
}
