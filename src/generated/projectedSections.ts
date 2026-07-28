import type { PersonalProjectionKey } from '../data/personalProjectionClient'
import { attachProjectedDashboard } from '../data/projectedDashboardModel'
import type { ProjectedSection, ProjectionSnapshot } from '../data/projectedTypes'

export const generatedProjectionSnapshot: ProjectionSnapshot = {
  "generatedAt": "2026-07-28T20:49:59.755Z",
  "generatedAtLabel": "Jul 28, 2026, 4:49 PM EDT",
  "source": "PunkRecords",
  "updateMode": "Nightly static projection"
} as ProjectionSnapshot

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
        },
        {
          "label": "Jul 23",
          "score": 5.3
        },
        {
          "label": "Jul 24",
          "score": 5.3
        },
        {
          "label": "Jul 25",
          "score": 5.3
        },
        {
          "label": "Jul 26",
          "score": 5.3
        },
        {
          "label": "Jul 27",
          "score": 5.3
        },
        {
          "label": "Jul 28",
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
      "lastUpdatedLabel": "Nightly source refresh: Jul 28"
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
        "label": "Workout log source",
        "value": "Workout log available",
        "note": "Latest workout file: 2026-07-27.",
        "stale": false
      },
      {
        "label": "Nutrition log source",
        "value": "92g protein",
        "note": "760 kcal logged. Latest nutrition file: 2026-07-28.",
        "stale": false
      },
      {
        "label": "Meditation log source",
        "value": "Needs source entries",
        "note": "0 meditation session files found."
      },
      {
        "label": "Current physique goal",
        "value": "145–148 lb",
        "note": "Lean, defined, and preserving muscle rather than swingy crash dieting."
      }
    ],
    "highlights": [
      "Latest workout evidence: 2026-07-27",
      "Latest nutrition evidence: 2026-07-28",
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
          "recentSets": 27,
          "lastHit": "2026-07-27",
          "lastHitLabel": "1 day ago",
          "heat": "hot",
          "recommendation": "Keep one vertical pull and one row pattern active each week."
        },
        {
          "id": "shoulders",
          "label": "Shoulders",
          "priority": "Width priority",
          "recentSets": 12,
          "lastHit": "2026-07-24",
          "lastHitLabel": "4 days ago",
          "heat": "hot",
          "recommendation": "Keep lateral delts and rear delts visible for the shoulder-width goal."
        },
        {
          "id": "chest",
          "label": "Chest",
          "priority": "Upper-chest priority",
          "recentSets": 17,
          "lastHit": "2026-07-27",
          "lastHitLabel": "1 day ago",
          "heat": "hot",
          "recommendation": "Add pressing or fly work if chest has not shown up recently."
        },
        {
          "id": "biceps",
          "label": "Biceps",
          "priority": "Arm detail",
          "recentSets": 10,
          "lastHit": "2026-07-21",
          "lastHitLabel": "7 days ago",
          "heat": "hot",
          "recommendation": "Keep curls in the rotation, but do not let arms crowd out chest or legs."
        },
        {
          "id": "triceps",
          "label": "Triceps",
          "priority": "Arm mass",
          "recentSets": 8,
          "lastHit": "2026-07-20",
          "lastHitLabel": "8 days ago",
          "heat": "hot",
          "recommendation": "Use pushdowns or overhead work to keep arms full while cutting."
        },
        {
          "id": "abs",
          "label": "Abs",
          "priority": "Lean-look priority",
          "recentSets": 10,
          "lastHit": "2026-07-21",
          "lastHitLabel": "7 days ago",
          "heat": "hot",
          "recommendation": "Keep direct core work frequent while the cut reveals definition."
        },
        {
          "id": "legs",
          "label": "Legs",
          "priority": "Balance priority",
          "recentSets": 5,
          "lastHit": "2026-07-21",
          "lastHitLabel": "7 days ago",
          "heat": "touched",
          "recommendation": "Do not let the aesthetics push turn into skipping legs."
        },
        {
          "id": "cardio",
          "label": "Cardio",
          "priority": "Cut support",
          "recentSets": 7,
          "lastHit": "2026-07-27",
          "lastHitLabel": "1 day ago",
          "heat": "hot",
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
    "heroSummary": "4 current / 5 cleanup / 23 later",
    "summaryCards": [
      {
        "label": "Current",
        "value": "4",
        "note": "Complete CS7641 Problem Set extra credit"
      },
      {
        "label": "Cleanup",
        "value": "5",
        "note": "HV-09 needs reschedule or close"
      },
      {
        "label": "Waiting",
        "value": "5",
        "note": "Schedule weekly 30-min career review block"
      },
      {
        "label": "Quick",
        "value": "E-11",
        "note": "Complete CS7641 Final Exam"
      },
      {
        "label": "Done",
        "value": "20",
        "note": "Closed source items"
      },
      {
        "label": "Ventures",
        "value": "13",
        "note": "Source rows"
      }
    ],
    "highlights": [
      "Show current work first.",
      "Keep stale rows as cleanup, not priority.",
      "Leave lower-lane tasks queued."
    ],
    "freshness": {
      "label": "Operations board evidence",
      "ageDays": 1,
      "stale": false
    },
    "blockers": [
      {
        "label": "HV-09",
        "value": "Update the Batter Up app",
        "detail": "High ROI Ventures / NEXT / Prep today 2026-07-27; weekly meeting 2026-07-28",
        "severity": "stale"
      },
      {
        "label": "HV-13",
        "value": "Build the photobooth competition web app before convention",
        "detail": "High ROI Ventures / NEXT / Send update today 2026-07-27; broader deadline before convention",
        "severity": "stale"
      },
      {
        "label": "V-08",
        "value": "Meal prep for the week",
        "detail": "Vessel / NOW / 2026-07-27",
        "severity": "stale"
      }
    ],
    "systems": {
      "headline": "Current work, then cleanup",
      "operatingMode": "Simple task triage",
      "pressureLabel": "Cleanup needed",
      "closureRate": 0,
      "staleAction": "HV-09",
      "automationPosture": {
        "label": "Read-only",
        "detail": "Source rows only.",
        "nextUpgrade": "Direct edits later."
      },
      "topFocus": [
        {
          "id": "E-10",
          "title": "Complete CS7641 Problem Set extra credit",
          "domain": "Education",
          "lane": "now",
          "status": "Not started",
          "dueReview": "2026-07-31 11:59 PM ET",
          "source": "[[CS7641 Machine Learning Overview]]",
          "notes": "Worth 1% extra credit. Every problem must be attempted with explanations.",
          "stale": false,
          "quick": false
        },
        {
          "id": "E-09",
          "title": "Complete CS7641 UL Report Discussion",
          "domain": "Education",
          "lane": "now",
          "status": "Not started",
          "dueReview": "2026-08-03 07:59 AM ET",
          "source": "[[CS7641 Machine Learning Overview]]",
          "notes": "Brief Canvas discussion after the UL report. Use the standard reflection pattern: proud figure/table, surprising finding, prior-goal status, and one concrete improvement.",
          "stale": false,
          "quick": false
        },
        {
          "id": "E-11",
          "title": "Complete CS7641 Final Exam",
          "domain": "Education",
          "lane": "now",
          "status": "Not started",
          "dueReview": "2026-08-06 11:59 PM ET",
          "source": "[[CS7641 Machine Learning Overview]]",
          "notes": "Cumulative closed-book digital exam via Canvas and Honorlock.",
          "stale": false,
          "quick": true
        },
        {
          "id": "V-02",
          "title": "Maintain 3x/week gym consistency during the cut / recomp phase",
          "domain": "Vessel",
          "lane": "now",
          "status": "In progress",
          "dueReview": "2026-09-01",
          "source": "[[Fitness Overview]], [[Training Program]], [[Goals Overview]]",
          "notes": "Workout today, 2026-07-27. Current durable target is the 145 to 148 lb by September cut / recomp goal. Keep logging workouts and make 3x/week training the baseline habit rather than anchoring this task to the already-passed brother's-proposal milestone.",
          "stale": false,
          "quick": false
        }
      ],
      "nextQueue": [
        {
          "id": "C-02",
          "title": "Set dated milestones for the dual-track plan",
          "domain": "Career",
          "lane": "next",
          "status": "Not started",
          "dueReview": "2026-05-25",
          "source": "[[Career Strategy Overview]]",
          "notes": "Assign concrete dates to resume, networking, applications, and broader career-option building.",
          "stale": true,
          "quick": false
        },
        {
          "id": "C-06",
          "title": "Create first entries in Application Log + cadence blocks",
          "domain": "Career",
          "lane": "next",
          "status": "Not started",
          "dueReview": "2026-05-25",
          "source": "[[Job Search Overview]], [[Application Log]]",
          "notes": "Add the first real entries and define a sustainable recurring cadence.",
          "stale": true,
          "quick": false
        },
        {
          "id": "C-03",
          "title": "Schedule weekly 30-min career review block",
          "domain": "Career",
          "lane": "next",
          "status": "Not scheduled",
          "dueReview": "Not set",
          "source": "[[Career Strategy Overview]]",
          "notes": "Calendar entry + recurring reminder.",
          "stale": false,
          "quick": true
        },
        {
          "id": "C-20",
          "title": "Add LifeArc (and safe assets) to portfolio/GitHub",
          "domain": "Career",
          "lane": "next",
          "status": "Planning",
          "dueReview": "Not set",
          "source": "[[LifeArc]], [[Portfolio Overview]]",
          "notes": "",
          "stale": false,
          "quick": false
        },
        {
          "id": "C-21",
          "title": "Practice each STAR story aloud (90–120s)",
          "domain": "Career",
          "lane": "next",
          "status": "Not started",
          "dueReview": "Not set",
          "source": "[[STAR Story Bank]]",
          "notes": "",
          "stale": false,
          "quick": false
        }
      ],
      "waitingOrBlocked": [
        {
          "id": "C-03",
          "title": "Schedule weekly 30-min career review block",
          "domain": "Career",
          "lane": "next",
          "status": "Not scheduled",
          "dueReview": "Not set",
          "source": "[[Career Strategy Overview]]",
          "notes": "Calendar entry + recurring reminder.",
          "stale": false,
          "quick": true
        },
        {
          "id": "C-20",
          "title": "Add LifeArc (and safe assets) to portfolio/GitHub",
          "domain": "Career",
          "lane": "next",
          "status": "Planning",
          "dueReview": "Not set",
          "source": "[[LifeArc]], [[Portfolio Overview]]",
          "notes": "",
          "stale": false,
          "quick": false
        },
        {
          "id": "C-27",
          "title": "Revisit SWOT and adjust every 6 months",
          "domain": "Career",
          "lane": "backlog",
          "status": "Scheduled check TBD",
          "dueReview": "Not set",
          "source": "[[SWOT Analysis]]",
          "notes": "",
          "stale": false,
          "quick": false
        },
        {
          "id": "C-29",
          "title": "Decide on public portfolio site long-term direction",
          "domain": "Career",
          "lane": "backlog",
          "status": "Pending after C-20",
          "dueReview": "Not set",
          "source": "[[Portfolio Overview]]",
          "notes": "",
          "stale": false,
          "quick": false
        },
        {
          "id": "F-25",
          "title": "Prepare to discuss S-Corp viability + crypto tax tooling with CPA",
          "domain": "Financial",
          "lane": "next",
          "status": "Pending",
          "dueReview": "Not set",
          "source": "[[Tax Strategy Overview]]",
          "notes": "",
          "stale": false,
          "quick": false
        }
      ],
      "quickWins": [
        {
          "id": "E-11",
          "title": "Complete CS7641 Final Exam",
          "domain": "Education",
          "lane": "now",
          "status": "Not started",
          "dueReview": "2026-08-06 11:59 PM ET",
          "source": "[[CS7641 Machine Learning Overview]]",
          "notes": "Cumulative closed-book digital exam via Canvas and Honorlock.",
          "stale": false,
          "quick": true
        },
        {
          "id": "O-28",
          "title": "Put batteries in car keys",
          "domain": "Operations",
          "lane": "now",
          "status": "Not started",
          "dueReview": "Quick admin",
          "source": "Personal logistics",
          "notes": "Replace car-key batteries before it becomes a friction point.",
          "stale": false,
          "quick": true
        },
        {
          "id": "C-03",
          "title": "Schedule weekly 30-min career review block",
          "domain": "Career",
          "lane": "next",
          "status": "Not scheduled",
          "dueReview": "Not set",
          "source": "[[Career Strategy Overview]]",
          "notes": "Calendar entry + recurring reminder.",
          "stale": false,
          "quick": true
        },
        {
          "id": "O-27",
          "title": "Schedule oil change",
          "domain": "Operations",
          "lane": "now",
          "status": "Not started",
          "dueReview": "Weekend of 2026-07-25",
          "source": "Personal logistics",
          "notes": "Set up the oil change appointment. Quick admin task; bundle with the Costco trimmer return if there is a nearby errand route.",
          "stale": true,
          "quick": true
        },
        {
          "id": "O-29",
          "title": "Return trimmer to Costco",
          "domain": "Operations",
          "lane": "now",
          "status": "Not started",
          "dueReview": "Weekend of 2026-07-25",
          "source": "Personal logistics / Costco return",
          "notes": "Return the trimmer to Costco during the next errand run. Bring the item, membership/card if needed, and any receipt/order info.",
          "stale": true,
          "quick": true
        }
      ],
      "staleItems": [
        {
          "id": "HV-09",
          "title": "Update the Batter Up app",
          "domain": "High ROI Ventures",
          "lane": "next",
          "status": "In progress",
          "dueReview": "Prep today 2026-07-27; weekly meeting 2026-07-28",
          "source": "[[Project Tracker]]",
          "notes": "Prep the weekly meeting: agenda, demo talking points, current blockers, and next asks. Add user emails, finalize the database schema, and show real frontend behavior connected to the backend.",
          "stale": true,
          "quick": false
        },
        {
          "id": "HV-13",
          "title": "Build the photobooth competition web app before convention",
          "domain": "High ROI Ventures",
          "lane": "next",
          "status": "In progress",
          "dueReview": "Send update today 2026-07-27; broader deadline before convention",
          "source": "Photobooth competition / collaboration with Nicole",
          "notes": "Send a Photo Booth update today before the Batter Up prep block. Nicole coordination started 2026-07-24. This is a high-visibility convention-facing product, not a tiny demo. It must support around 1,000 picture uploads and be good enough for the entire convention to see. Prioritize production-readiness: upload UX, storage/backups, performance under load, moderation or approval, failure recovery, clean display/gallery flow, mobile friendliness, and a polished visual identity.",
          "stale": true,
          "quick": false
        },
        {
          "id": "V-08",
          "title": "Meal prep for the week",
          "domain": "Vessel",
          "lane": "now",
          "status": "Not started",
          "dueReview": "2026-07-27",
          "source": "[[Meal Planning]], [[Nutrition Overview]]",
          "notes": "Minimum viable meal prep: cook enough protein + carb base for several meals so the cut does not drift after the school deadline push.",
          "stale": true,
          "quick": false
        },
        {
          "id": "O-27",
          "title": "Schedule oil change",
          "domain": "Operations",
          "lane": "now",
          "status": "Not started",
          "dueReview": "Weekend of 2026-07-25",
          "source": "Personal logistics",
          "notes": "Set up the oil change appointment. Quick admin task; bundle with the Costco trimmer return if there is a nearby errand route.",
          "stale": true,
          "quick": true
        },
        {
          "id": "O-29",
          "title": "Return trimmer to Costco",
          "domain": "Operations",
          "lane": "now",
          "status": "Not started",
          "dueReview": "Weekend of 2026-07-25",
          "source": "Personal logistics / Costco return",
          "notes": "Return the trimmer to Costco during the next errand run. Bring the item, membership/card if needed, and any receipt/order info.",
          "stale": true,
          "quick": true
        }
      ],
      "domainCounts": [
        {
          "domain": "Career",
          "now": 1,
          "next": 6,
          "backlog": 8
        },
        {
          "domain": "Education",
          "now": 4,
          "next": 0,
          "backlog": 0
        },
        {
          "domain": "Financial",
          "now": 0,
          "next": 7,
          "backlog": 4
        },
        {
          "domain": "Operations",
          "now": 7,
          "next": 5,
          "backlog": 0
        },
        {
          "domain": "High ROI Ventures",
          "now": 3,
          "next": 4,
          "backlog": 0
        },
        {
          "domain": "AI Personal Assistant",
          "now": 0,
          "next": 0,
          "backlog": 1
        },
        {
          "domain": "Agent Dashboard",
          "now": 0,
          "next": 0,
          "backlog": 1
        },
        {
          "domain": "Family",
          "now": 0,
          "next": 0,
          "backlog": 2
        },
        {
          "domain": "Vessel",
          "now": 2,
          "next": 1,
          "backlog": 4
        }
      ]
    }
  },
  "ventures": {
    "heroSummary": "Matchup is the current lead: App Store legal rejection. 7 ventures are tracked, ordered by priority and ROI.",
    "summaryCards": [
      {
        "label": "Lead venture",
        "value": "Matchup",
        "note": "App Store legal rejection"
      },
      {
        "label": "Active ventures",
        "value": "5",
        "note": "7 total lines tracked."
      },
      {
        "label": "2026 venture goals",
        "value": "4 in progress",
        "note": "Live and getting users / Pending"
      },
      {
        "label": "Capital posture",
        "value": "Protect base",
        "note": "$70k is life savings — treat it like precious fuel, not a startup fund."
      },
      {
        "label": "Bandwidth",
        "value": "~12–16 hrs",
        "note": "week / Fits within 3–4 hr/day budget"
      },
      {
        "label": "Next rule",
        "value": "Sequential focus",
        "note": "Fix the blocker on the highest-priority venture before spreading to the next."
      }
    ],
    "highlights": [
      "Fix the blocker on the highest-priority venture before spreading to the next.",
      "Sort by named venture priority instead of generic dashboard signals.",
      "Open each venture for stage, co-founder, blocker, score, and next action."
    ],
    "freshness": {
      "label": "Ventures planning docs",
      "ageDays": 103,
      "stale": true
    },
    "ventures": {
      "headline": "Ranked venture portfolio",
      "operatingRule": "Fix the blocker on the highest-priority venture before spreading to the next.",
      "bandwidth": "~12–16 hrs/week / Fits within 3–4 hr/day budget",
      "capitalRule": "$70k is life savings — treat it like precious fuel, not a startup fund.",
      "activeCount": 5,
      "primaryVentureId": "matchup",
      "ventures": [
        {
          "id": "matchup",
          "name": "Matchup",
          "type": "Sports prediction app (sweepstakes)",
          "stage": "Built — App Store blocked",
          "cofounders": "VJ, Varun",
          "blocker": "App Store legal rejection",
          "priorityLabel": "#1 — closest to launch",
          "priorityRank": 1,
          "priorityBand": "primary",
          "score": "🥇 4.21",
          "rawScore": "3.88",
          "nextAction": "Finish the App Store legal/compliance packet and resubmit.",
          "detail": "Closest to launch; built product with a compliance blocker, so this deserves the first real execution slot.",
          "source": "High ROI Ventures / Ventures MOC"
        },
        {
          "id": "smartbytes",
          "name": "Smartbytes",
          "type": "AI POS system for restaurants",
          "stage": "MVP built — no customers",
          "cofounders": "Roshan, Ceaver",
          "blocker": "Sales / customer acquisition",
          "priorityLabel": "#2 — needs go-to-market",
          "priorityRank": 2,
          "priorityBand": "secondary",
          "score": "🥉 3.56",
          "rawScore": "3.38",
          "nextAction": "Get one pilot conversation scheduled before building more.",
          "detail": "Product exists, but the business is waiting on restaurant pilots and a sales owner.",
          "source": "High ROI Ventures / Ventures MOC"
        },
        {
          "id": "ai-personal-assistant",
          "name": "AI Personal Assistant",
          "type": "Personal operating system: PunkRecords + Shika + assistant workflows",
          "stage": "Personal infrastructure — active",
          "cofounders": "Solo",
          "blocker": "Time to build",
          "priorityLabel": "#3 — high leverage personal tool",
          "priorityRank": 3,
          "priorityBand": "secondary",
          "score": "🥈 4.13",
          "rawScore": "4.13",
          "nextAction": "Keep it as infrastructure: ship the next workflow that saves time this week.",
          "detail": "Personal leverage project that can later become a product if it proves daily value.",
          "source": "High ROI Ventures / Ventures MOC"
        },
        {
          "id": "ai-tycoon",
          "name": "AI Tycoon",
          "type": "Multi-agent business automation venture",
          "stage": "Concept / architecture stage",
          "cofounders": "Solo",
          "blocker": "Time to define and operationalize the business system",
          "priorityLabel": "Parallel business bet",
          "priorityRank": 4,
          "priorityBand": "parallel",
          "score": "",
          "rawScore": "",
          "nextAction": "Define the business automation offer and keep dashboard work under this venture.",
          "detail": "Separate business automation bet; the agent dashboard belongs here, not under the personal assistant.",
          "source": "High ROI Ventures / Ventures MOC"
        },
        {
          "id": "freelance-contracting",
          "name": "Freelance Contracting",
          "type": "Tech build for food distributor (Alvin's connection)",
          "stage": "Deal pending — scope unclear",
          "cofounders": "Solo (Alvin intro)",
          "blocker": "Scope + pay not defined",
          "priorityLabel": "🟠 #4 — define the deal",
          "priorityRank": 4,
          "priorityBand": "secondary",
          "score": "3.88",
          "rawScore": "3.75",
          "nextAction": "Clarify scope, price, owner, and timeline before implementation.",
          "detail": "Near-term cash possibility, but only after scope and compensation are written down.",
          "source": "High ROI Ventures / Ventures MOC"
        },
        {
          "id": "real-estate",
          "name": "Real Estate",
          "type": "South FL rental / Airbnb (family-managed)",
          "stage": "Opportunity identified",
          "cofounders": "Family",
          "blocker": "Capital deployment decision",
          "priorityLabel": "🔵 Future — evaluate when ready",
          "priorityRank": 6,
          "priorityBand": "later",
          "score": "2.38",
          "rawScore": "2.63",
          "nextAction": "Hold until startup revenue or a specific cash-flow-positive property appears.",
          "detail": "Capital-heavy future option; evaluate only with a real cash-flow model and protected emergency buffer.",
          "source": "High ROI Ventures / Ventures MOC"
        },
        {
          "id": "tech-contracting-company",
          "name": "Tech Contracting Company",
          "type": "Agency / freelance biz",
          "stage": "Idea only",
          "cofounders": "Solo",
          "blocker": "Need more projects first",
          "priorityLabel": "⚪ Long-term idea",
          "priorityRank": 7,
          "priorityBand": "later",
          "score": "2.94",
          "rawScore": "3.13",
          "nextAction": "Hold until three paid freelance projects prove this deserves to become a company.",
          "detail": "Near-term cash possibility, but only after scope and compensation are written down.",
          "source": "High ROI Ventures / Ventures MOC"
        }
      ]
    }
  },
  "career": {
    "heroSummary": "Career is now tracked across current-job growth, next-job search goals, and portfolio readiness so every section can move from rough notes into visible progress.",
    "summaryCards": [
      {
        "label": "Career arc",
        "value": "In progress",
        "note": "MVerify founding engineer to C/ML/cloud AI infra to LifeArc founding engineer."
      },
      {
        "label": "Comp / role target",
        "value": "$140k–$200k+ TC",
        "note": "$90k base + $15k bonus + $10k stock (~$115k TC) current baseline; target role is SWE II / SWE III · Full-Stack · Backend · ML Engineer."
      },
      {
        "label": "Flagship proof",
        "value": "LifeArc",
        "note": "HIPAA AI platform, 100+ records/week, 70-90% faster review, $10-$100 internal run cost."
      },
      {
        "label": "Proof packaging",
        "value": "4 open asset lanes",
        "note": "Next assets: resume variants, technical post, GitHub profile, LifeArc carousel."
      },
      {
        "label": "Pipeline status",
        "value": "0 apps / 0 screens",
        "note": "10 target companies visible; target offer date Oct 31, 2026."
      },
      {
        "label": "Networking CRM",
        "value": "0 hot / 0 warm / 0 cold",
        "note": "Contact tracker is the referral and follow-up source of truth."
      },
      {
        "label": "Interview readiness",
        "value": "7 STAR stories",
        "note": "Active prep lanes: DSA / system design / MSML."
      },
      {
        "label": "Brand visibility",
        "value": "600 LinkedIn connections",
        "note": "Personal brand notes track LinkedIn, portfolio, GitHub, recruiter DMs, and recommendations."
      },
      {
        "label": "Credential path",
        "value": "Georgia Tech MSML",
        "note": "| Georgia Tech MSML completed | Career | 2027 | In progress |"
      }
    ],
    "highlights": [
      "LifeArc is the lead proof asset and should appear in resume, portfolio, STAR stories, LinkedIn, and interview narratives.",
      "Job search execution should stay targeted: 20-30 strong companies, warm outreach first, applications in waves.",
      "Readiness is a stack: proof packaging, networking, DSA, system design, behavioral stories, and personal brand need to move together."
    ],
    "freshness": {
      "label": "Career planning docs",
      "ageDays": 0,
      "stale": false
    },
    "blockers": [
      {
        "label": "Pipeline not active",
        "value": "0 applications",
        "detail": "Application Log and Job Search Overview show the search has not produced active screens yet.",
        "severity": "watch"
      },
      {
        "label": "Promotion narrative risk",
        "value": "Leadership gap",
        "detail": "Leadership skills and business involvement; technical work is already strong. Communication is most visible in Sprint meetings, LifeArc weekly calls, LifeArc demos, and talks with executives; target behavior: Be more professional and leader-like so Armando stops seeing Mitchell as a kid.",
        "severity": "watch"
      },
      {
        "label": "Networking gap",
        "value": "0 hot contacts",
        "detail": "Contact Tracker starts from zero, so warm outreach/referrals are the clearest missing channel.",
        "severity": "watch"
      },
      {
        "label": "Packaging gap",
        "value": "4 asset lanes",
        "detail": "Strong proprietary work needs public-safe proof assets: resume bullets, STAR stories, diagrams, case studies, and profile updates.",
        "severity": "watch"
      }
    ],
    "missingData": [
      {
        "label": "Live prep metrics",
        "value": "Manual sources only",
        "detail": "Resume variants, GitHub profile, portfolio visits, LinkedIn views, DSA reps, and system-design reps are not yet structured as dated metrics.",
        "severity": "stale"
      },
      {
        "label": "Application activity",
        "value": "No dated entries",
        "detail": "Application Log has templates but no real company entries yet.",
        "severity": "watch"
      }
    ],
    "timeline": [
      {
        "label": "Search kickoff",
        "detail": "Job Search Overview marks the search as preparing and applying.",
        "recency": "Apr 1, 2026",
        "severity": "watch"
      },
      {
        "label": "Promotion target",
        "detail": "Senior SWE or Director of LifeArc decision point with Armando — President of Abacus Intel and direct boss; proof packet cadence is Weekly checklist leading up to Sep 18, 2026.",
        "recency": "Sep 18, 2026 — 3-year anniversary",
        "severity": "watch"
      },
      {
        "label": "Offer deadline",
        "detail": "The target process should produce an offer before the hard deadline.",
        "recency": "Oct 31, 2026",
        "severity": "watch"
      },
      {
        "label": "MSML horizon",
        "detail": "Georgia Tech MSML remains the long-arc ML credential.",
        "recency": "Expected 2027",
        "severity": "good"
      }
    ],
    "career": {
      "headline": "Career",
      "categories": [
        {
          "id": "current-job",
          "title": "Current Job",
          "sections": [
            {
              "id": "promotion",
              "label": "Promotion",
              "status": "active",
              "value": "Senior SWE or Director of LifeArc",
              "detail": "Target date is Sep 18, 2026 — 3-year anniversary; decision-maker is Armando — President of Abacus Intel and direct boss. Promotion story is anchored on LifeArc ownership and a target salary move from $90k base + $15k bonus + $10k stock (~$115k TC) to $140k total compensation.",
              "nextAction": "Build a weekly proof packet: technical wins, business involvement, communication moments, and LifeArc evidence. Cadence: Weekly checklist leading up to Sep 18, 2026.",
              "source": "Career Strategy Overview"
            },
            {
              "id": "learning",
              "label": "Learning",
              "status": "active",
              "value": "DSA / system design / MSML",
              "detail": "Current role learning should compound through HIPAA compliance, AWS/GCP ML infra, product ownership, stakeholder communication, CI/CD, and distributed systems.",
              "nextAction": "Log what you are learning on the job separately from external interview prep, then pick the next on-job skill gap.",
              "source": "Learning Roadmap"
            }
          ]
        },
        {
          "id": "job-search",
          "title": "Job Search",
          "sections": [
            {
              "id": "target-role",
              "label": "Target Role",
              "status": "planned",
              "value": "SWE II / SWE III · Full-Stack · Backend · ML Engineer",
              "detail": "Best-fit roles are SWE II/SWE III, full-stack, backend, and ML-adjacent engineering roles at larger teams. 10 target companies are already visible.",
              "nextAction": "Rank the target role variants so resume, portfolio, and applications do not pull in different directions.",
              "source": "Career Strategy Overview"
            },
            {
              "id": "location",
              "label": "Location",
              "status": "planned",
              "value": "NYC preferred / remote-first acceptable",
              "detail": "Punk Records is clear that NYC or remote-first are preferred, with no low-cost-city relocation.",
              "nextAction": "Add must-have location constraints: hybrid tolerance, commute radius, relocation timing, and remote minimums.",
              "source": "Job Search Overview"
            },
            {
              "id": "compensation",
              "label": "Compensation",
              "status": "planned",
              "value": "$140k–$200k+ TC",
              "detail": "Current baseline is $90k base + $15k bonus + $10k stock (~$115k TC); minimum acceptable is documented as about $120k+ TC depending on location.",
              "nextAction": "Set hard floor, ideal base, ideal TC, and equity-risk tolerance for offer comparisons.",
              "source": "Job Search Overview"
            }
          ]
        },
        {
          "id": "portfolio",
          "title": "Portfolio",
          "sections": [
            {
              "id": "technical-interview-prep",
              "label": "Technical interview prep",
              "status": "active",
              "value": "DSA + system design",
              "detail": "Neetcode 150 and System Design Primer are selected, but reps are not yet logged as structured metrics.",
              "nextAction": "Add solved problem count, weak topics, mock count, and next system design prompt.",
              "source": "Learning Roadmap"
            },
            {
              "id": "star-stories",
              "label": "STAR stories",
              "status": "active",
              "value": "7 stories",
              "detail": "LifeArc, HIPAA, ambiguity, tradeoffs, MSML, conflict, and judgment stories exist as a strong story bank.",
              "nextAction": "Practice each story aloud and add follow-up answers for what you would do differently.",
              "source": "STAR Story Bank"
            },
            {
              "id": "behavioral-interview-prep",
              "label": "Behavioral interview prep",
              "status": "planned",
              "value": "Non-STAR answers mapped",
              "detail": "Why leave, tell me about yourself, and 5-year positioning are noted, but not yet drilled outside STAR format.",
              "nextAction": "Create a short non-STAR answer bank for motivation, values, collaboration style, and role fit.",
              "source": "STAR Story Bank"
            },
            {
              "id": "portfolio-website",
              "label": "Portfolio website",
              "status": "missing",
              "value": "[FILL IN or \"Not yet built\"]",
              "detail": "Portfolio strategy is defined around LifeArc, proprietary-work narrative, side projects, and MSML projects.",
              "nextAction": "Add the real portfolio URL, analytics status, and the first LifeArc case-study milestone.",
              "source": "Portfolio Overview"
            },
            {
              "id": "linkedin",
              "label": "LinkedIn",
              "status": "active",
              "value": "600 connections",
              "detail": "Profile views are Not currently tracked (assume <20); the headline/about copy and LifeArc carousel tasks are drafted but not finished.",
              "nextAction": "Refresh headline/about, add featured proof, and record weekly profile views.",
              "source": "Personal Brand Overview"
            },
            {
              "id": "github",
              "label": "GitHub",
              "status": "missing",
              "value": "0 followers",
              "detail": "GitHub profile polish, pinned repos, README, architecture diagram, and public signal are still open.",
              "nextAction": "Pin best repos and add a recruiter-readable README/proof block.",
              "source": "Personal Brand Overview"
            },
            {
              "id": "projects",
              "label": "Projects",
              "status": "active",
              "value": "LifeArc flagship",
              "detail": "Open proof lanes: resume variants, technical post, GitHub profile, LifeArc carousel.",
              "nextAction": "Create public-safe LifeArc case study with architecture, constraints, metrics, and tradeoffs.",
              "source": "Portfolio Overview"
            },
            {
              "id": "resume",
              "label": "Resume",
              "status": "active",
              "value": "0 / 3 variants ready-ish",
              "detail": "Master bullet bank and metrics are strong; final format and tailored PDFs still need completion.",
              "nextAction": "Choose final format and produce General SWE, ML/AI, and Health Tech variants.",
              "source": "Resume Overview"
            },
            {
              "id": "cover-letter",
              "label": "Cover letter",
              "status": "missing",
              "value": "Templates referenced",
              "detail": "Cover letter templates are referenced by the search docs, but no structured template data is being pulled into the dashboard yet.",
              "nextAction": "Add or wire Cover Letter Templates into Punk Records so Tier 1 applications can use a reusable base.",
              "source": "Job Search Overview"
            }
          ]
        }
      ],
      "starStories": [
        {
          "id": "story-1",
          "title": "Leading LifeArc from 0→1 (Ownership / Initiative)",
          "tags": [
            "leadership",
            "ownership",
            "initiative",
            "ambiguity",
            "technical-decision"
          ],
          "bestFor": [
            "Tell me about a time you took ownership.",
            "Describe a project you led.",
            "Tell me about a time you worked with minimal direction."
          ],
          "situation": "I was a founding engineer at a small tech team (~20 people) inside a life settlement company. The company had a clear business pain: reviewing medical records for underwriting was slow, expensive, and done manually.",
          "task": "I identified the opportunity and proposed building an AI-powered platform — LifeArc — to automate this process. I was given the green light and became the sole technical lead with no senior engineer to report to technically.",
          "action": "I made every architectural decision from scratch: chose GCP for the LLM layer (Gemini) because we could get a HIPAA BAA from Google — allowing us to legally process PHI through an LLM. Used AWS Medical Comprehend for structured medical entity extraction (ICD codes, diagnoses, medications). Built a FastAPI backend on AWS EC2, PostgreSQL on RDS, and a React portal for end users. I also designed a life expectancy model combining actuarial datasets with the AI-extracted medical features.",
          "result": "Delivered a production system that now processes 100+ medical records every week. It cut turnaround from multi-week, $1,000+ third-party estimates to 10–60 minutes at $10–$100 per record, saving the underwriting team hours per file. The company plans to scale it as a core product offering."
        },
        {
          "id": "story-2",
          "title": "HIPAA Compliance Problem (Problem-Solving / Technical Depth)",
          "tags": [
            "problemsolving",
            "technical",
            "compliance",
            "research",
            "ambiguity"
          ],
          "bestFor": [
            "Tell me about a difficult technical problem.",
            "When did you have to learn something completely new?",
            "Tell me about a constraint you had to work within."
          ],
          "situation": "When building LifeArc, I wanted to use an LLM (Gemini) to summarize medical records. But medical records contain Protected Health Information (PHI) — meaning I couldn't just send them to a third-party API without HIPAA compliance in place.",
          "task": "I had to figure out how to legally and securely run PHI through an LLM in a production system — something most engineers have never done.",
          "action": "I researched the HIPAA BAA (Business Associate Agreement) process — a legal framework that makes a cloud provider responsible for PHI they process. I discovered Google Cloud offered a HIPAA BAA for Gemini, which made it the right choice over OpenAI (which didn't have a BAA at the time). I set up the GCP project with encryption at rest and in transit, strict access controls, audit logging, and a no-PHI-in-logs policy. I documented the full compliance approach and got it reviewed.",
          "result": "LifeArc became a HIPAA-compliant production system that legally processes real patient medical records. This was the key unlock that made the whole product possible — and it's now a genuine differentiator in my profile. Most engineers at my stage have no exposure to regulated data environments."
        },
        {
          "id": "story-3",
          "title": "Founding Engineer — Adapting to Ambiguity (Adaptability)",
          "tags": [
            "adaptability",
            "ambiguity",
            "startup",
            "growth",
            "initiative"
          ],
          "bestFor": [
            "Tell me about a time you worked in a fast-moving or unstructured environment.",
            "How do you handle ambiguity?"
          ],
          "situation": "I joined [Company] as one of the first engineers on a greenfield SaaS product with a small team, no established processes, and a fast-moving roadmap.",
          "task": "I needed to contribute meaningfully from day one without the guardrails of a large engineering org — no design docs, no sprint planning, no code review culture yet.",
          "action": "I quickly took ownership of the frontend, established patterns for how we structured React components and handled state, and started proposing lightweight processes (PR reviews, basic documentation) as the team grew. When LifeArc emerged as an opportunity, I proactively scoped it and proposed it rather than waiting to be assigned.",
          "result": "Grew from frontend IC to full-stack engineer to project lead in 2.5 years — without a formal promotion process, by demonstrating ownership at each stage. LifeArc is the direct result of operating with initiative in an ambiguous environment."
        },
        {
          "id": "story-4",
          "title": "Dual AI Pipeline Design (Technical Decision-Making)",
          "tags": [
            "systemdesign",
            "technical",
            "architecture",
            "tradeoffs"
          ],
          "bestFor": [
            "Tell me about a technical decision you made and why.",
            "Describe a time you had to choose between two approaches."
          ],
          "situation": "When designing LifeArc's medical record processing, I needed to extract both narrative summaries AND structured data (ICD codes, medications, diagnoses) from unstructured clinical documents.",
          "task": "Decide on the right architecture for the extraction pipeline.",
          "action": "I evaluated two options: (1) Use only Gemini to extract everything via prompt engineering — fast to build but unreliable for structured entity extraction at scale. (2) Use a two-layer approach — Gemini for narrative summarization where LLM excels, and AWS Medical Comprehend (a purpose-built medical NLP service) for structured entity extraction where precision matters. I chose option 2 because reliability and accuracy of ICD coding was critical for the underwriting use case — wrong codes have real business impact.",
          "result": "The two-layer pipeline delivered both readable summaries for reviewers AND highly accurate structured data for downstream models. The tradeoff (added complexity) was justified by the quality gain in a domain where mistakes are costly."
        },
        {
          "id": "story-5",
          "title": "Working on Graduate School While Employed Full-Time (Work Ethic / Growth)",
          "tags": [
            "workethic",
            "growth",
            "learning",
            "commitment",
            "discipline"
          ],
          "bestFor": [
            "Tell me about a time you committed to self-improvement.",
            "How do you manage competing priorities?"
          ],
          "situation": "I started Georgia Tech's MSML program part-time while working full-time as a founding engineer and leading LifeArc.",
          "task": "Complete a rigorous graduate program (one of the most competitive in the country for ML) while managing significant professional responsibility.",
          "action": "I treat the MSML like a second job with dedicated time blocks. I apply concepts from coursework directly to LifeArc where possible — closing the gap between academic ML and applied systems. I've had to make tradeoffs (fewer social commitments, strict schedule discipline) but treat the investment as compounding.",
          "result": "Currently in progress — [X courses completed]. The MSML is deepening the ML foundations behind the work I'm already doing professionally, and is the long-term credential that opens ML Engineer and AI-adjacent roles."
        },
        {
          "id": "story-6",
          "title": "Protecting LifeArc Releases When Data Was Thin (Failure / Judgment)",
          "tags": [
            "failure",
            "judgment",
            "quality",
            "communication"
          ],
          "bestFor": [
            "Tell me about a time something didn’t go as planned.",
            "Describe a time you had to make a tough call under a deadline."
          ],
          "situation": "Early in the LifeArc build, the first life expectancy model performed well overall, but we saw a handful of outlier predictions that were wildly incorrect. Those results would have been dangerous for underwriting decisions, yet we had a hard deadline to deploy the tool internally and no quick way to expand the dataset.",
          "task": "Figure out how to launch on time without surfacing predictions we couldn’t stand behind.",
          "action": "I introduced two guardrails: (1) only display a result if the case’s age/gender/primary-impairment bucket had sufficient historical data, and (2) hide predictions when the min/max range of similar cases exceeded a threshold. I also communicated the gap to stakeholders and documented a data-enrichment plan to expand coverage next.",
          "result": "We launched on time with stakeholder trust intact — accuracy remained the priority, and hiding low-confidence results was the right tradeoff. Leadership appreciated the plan for expanding the dataset so we could increase coverage in future iterations."
        },
        {
          "id": "story-7",
          "title": "Aligning a Coworker Around LifeArc’s Deadline (Conflict / Collaboration)",
          "tags": [
            "conflict",
            "collaboration",
            "influence",
            "communication"
          ],
          "bestFor": [
            "Tell me about a time you dealt with a difficult teammate.",
            "How do you handle conflict or misalignment?"
          ],
          "situation": "LifeArc had a hard internal deadline from the founders, and another engineer was assigned to help me deploy the backend to AWS. He wasn’t prioritizing it and communication lagged, which put the release at risk.",
          "task": "I needed to get the deployment done on time without poisoning the working relationship.",
          "action": "Instead of escalating or blaming, I invited him to lunch daily so we could build rapport and I could walk him through why the project mattered. The casual setting opened up communication, he understood the stakes, and we aligned on a concrete plan.",
          "result": "Turnaround time improved immediately, the deployment landed before the stakeholder deadline, and the relationship got stronger rather than strained."
        }
      ],
      "prompts": [
        {
          "label": "Promotion process",
          "value": "Sep 18, 2026 — 3-year anniversary",
          "detail": "Decision-maker: Armando — President of Abacus Intel and direct boss. Still need written criteria and proof packet requirements for Senior SWE or Director of LifeArc at $140k total compensation.",
          "severity": "watch"
        },
        {
          "label": "Leadership case",
          "value": "Weekly proof packet",
          "detail": "Main visibility points: Sprint meetings, LifeArc weekly calls, LifeArc demos, and talks with executives. Leadership target: Be more professional and leader-like so Armando stops seeing Mitchell as a kid. Risk to manage: Age/title perception: other developers received Senior title around 3 years, but they were 30+ while Mitchell is much younger.",
          "severity": "watch"
        },
        {
          "label": "On-job learning",
          "value": "Need live list",
          "detail": "Which current-job skills do you want to learn more of: infra, product, compliance, management, architecture, CI/CD, or something else?",
          "severity": "watch"
        },
        {
          "label": "Technical prep metrics",
          "value": "Need counters",
          "detail": "Add LeetCode solved count, system-design reps, mocks completed, and weak topics so the tracker uses real activity instead of guesses.",
          "severity": "stale"
        },
        {
          "label": "Public assets",
          "value": "11 open tasks",
          "detail": "Need real portfolio URL/visits, GitHub URL/followers, LinkedIn views, and whether the LifeArc case study can be public. Portfolio visits: Not tracking yet.",
          "severity": "stale"
        }
      ]
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
    "heroSummary": "Wealth starts as a read-only finance cockpit: connect accounts safely, replace estimates with real balances, then budget and track net worth.",
    "summaryCards": [
      {
        "label": "Connection mode",
        "value": "Read-only planned",
        "note": "Bank login must happen through Plaid Link or a similar aggregator. This app should never collect bank credentials.",
        "stale": true
      },
      {
        "label": "Current estimate",
        "value": "$110,000",
        "note": "Manual working estimate until linked balances replace it."
      },
      {
        "label": "Budget baseline",
        "value": "Not connected",
        "note": "Actual categories and spend should come from synced transactions, not hardcoded month cards.",
        "stale": true
      },
      {
        "label": "Monthly surplus estimate",
        "value": "$2,476",
        "note": "Temporary estimate from known income and expenses. Replace after transaction sync."
      },
      {
        "label": "Real hourly value",
        "value": "Needs hours",
        "note": "Track job hours and freelance hours only, then divide monthly surplus by monthly hours.",
        "stale": true
      }
    ],
    "highlights": [
      "Start read-only: accounts, balances, transactions, and liabilities.",
      "Use a provider such as Plaid so bank credentials never touch this app.",
      "Budgeting and net-worth history should unlock only after real account data exists."
    ],
    "missingData": [
      {
        "label": "Bank connection backend",
        "value": "Built, needs keys",
        "detail": "Backend routes now cover Link token creation, public token exchange, encrypted provider token storage, balance sync, and disconnect.",
        "severity": "watch"
      },
      {
        "label": "Financial database",
        "value": "Migration ready",
        "detail": "Schema covers connected items, accounts, transactions, categories, budgets, snapshots, manual assets, liabilities, sync jobs, and audit events.",
        "severity": "watch"
      },
      {
        "label": "Privacy controls",
        "value": "Foundation ready",
        "detail": "Disconnect, token removal, account exclusion fields, manual entries, and audit history are part of the first schema.",
        "severity": "watch"
      }
    ],
    "wealth": {
      "headline": "Personal Finance Command Center",
      "asOf": "Safe build plan",
      "accounts": [
        {
          "label": "Bank links",
          "value": "0 connected",
          "note": "Use Plaid Link or an equivalent provider, never direct credential collection."
        },
        {
          "label": "Read-only scope",
          "value": "Required",
          "note": "Balances, accounts, transactions, liabilities, and investments later. No money movement."
        },
        {
          "label": "Manual estimate",
          "value": "$110,000",
          "note": "Displayed as an estimate until synced account balances exist."
        },
        {
          "label": "Safety gate",
          "value": "Before real use",
          "note": "Encryption, webhook validation, no sensitive logs, and deletion controls."
        }
      ],
      "hourly": {
        "monthlyNetIncome": "$5,226",
        "monthlyExpenses": "$2,750",
        "monthlySurplus": "$2,476",
        "jobHours": "Need weekly average",
        "freelanceHours": "Need weekly average",
        "formula": "$2,476 / ((job hours + freelance hours) * 4.33)",
        "threshold": "$35/hr",
        "status": "Ready after weekly hours are entered"
      },
      "panels": [
        {
          "id": "net-worth",
          "title": "Net Worth Tracking",
          "kicker": "Phase 3",
          "summary": "Track assets and liabilities from linked accounts plus manual entries, then snapshot monthly so history stays stable.",
          "metrics": [
            {
              "label": "Linked assets",
              "value": "Cash + investments",
              "note": "Checking, savings, brokerage, retirement, and other supported balances."
            },
            {
              "label": "Linked liabilities",
              "value": "Cards + loans",
              "note": "Credit cards, student loans, auto loans, and mortgages when available."
            },
            {
              "label": "Manual entries",
              "value": "Needed",
              "note": "Property, vehicles, private assets, crypto, and unsupported debts."
            }
          ],
          "nextAction": "Add monthly net-worth snapshots only after the linked-account schema and manual account form exist."
        },
        {
          "id": "real-hourly-value",
          "title": "Money Per Hour",
          "kicker": "Time value",
          "summary": "Show how much future money each work hour keeps after expenses, without mixing in school or startup time.",
          "metrics": [
            {
              "label": "Monthly saved",
              "value": "$2,476",
              "note": "Net income minus estimated expenses."
            },
            {
              "label": "Hours tracked",
              "value": "Job + freelance",
              "note": "Only these two buckets count for this calculation."
            },
            {
              "label": "Formula",
              "value": "Surplus / hours",
              "note": "$2,476 divided by monthly job + freelance hours."
            }
          ],
          "nextAction": "Enter average weekly job hours and average weekly freelance hours."
        },
        {
          "id": "cashflow",
          "title": "Transaction Sync",
          "kicker": "Phase 1",
          "summary": "Replace estimates with provider-synced transactions and balances, then categorize them into a clean monthly cashflow view.",
          "metrics": [
            {
              "label": "Provider",
              "value": "Plaid first",
              "note": "Abstract behind a provider interface so MX or Finicity can be added later."
            },
            {
              "label": "Token flow",
              "value": "Backend only",
              "note": "Browser receives Link token, backend stores encrypted access token."
            },
            {
              "label": "Webhooks",
              "value": "Required",
              "note": "Sync updates through verified provider webhooks and background jobs."
            }
          ],
          "nextAction": "Build backend endpoints for Link token creation, token exchange, account sync, transaction sync, and webhook verification."
        },
        {
          "id": "budgeting",
          "title": "Budgeting",
          "kicker": "Phase 2",
          "summary": "Use synced transactions to build monthly category budgets, recurring bills, cashflow, and category override tools.",
          "metrics": [
            {
              "label": "Categories",
              "value": "Editable",
              "note": "Auto-categorize first, then let Mitchell override rules and individual transactions."
            },
            {
              "label": "Bills",
              "value": "Detect recurring",
              "note": "Surface recurring subscriptions, utilities, debt payments, and income."
            },
            {
              "label": "Controls",
              "value": "Private by design",
              "note": "Exclude accounts from budget or net worth without deleting the connection."
            }
          ],
          "nextAction": "Add budget tables and category override UI after the first transaction sync is working."
        }
      ],
      "prompts": [
        {
          "label": "Provider decision",
          "value": "Plaid first",
          "detail": "Good default for US bank linking, OAuth, transactions, balances, liabilities, and investments.",
          "severity": "watch"
        },
        {
          "label": "Secrets boundary",
          "value": "Backend only",
          "detail": "Provider access tokens should never reach the browser and should be encrypted at rest.",
          "severity": "watch"
        },
        {
          "label": "Revocation",
          "value": "Must have",
          "detail": "Disconnect, delete, and pause sync controls are required before using real accounts.",
          "severity": "watch"
        }
      ],
      "connectionPlan": {
        "provider": "Plaid first, provider abstraction later",
        "safetyPosition": "Read-only financial data only. No money movement, no payments, no transfers.",
        "status": "Ready to build backend foundation",
        "steps": [
          {
            "label": "1. Link flow",
            "status": "next",
            "detail": "Frontend opens Plaid Link from a short-lived backend-created Link token."
          },
          {
            "label": "2. Token exchange",
            "status": "locked",
            "detail": "Backend exchanges the public token and stores the provider access token encrypted."
          },
          {
            "label": "3. Sync data",
            "status": "locked",
            "detail": "Fetch accounts, balances, transactions, liabilities, and later investments through background jobs."
          },
          {
            "label": "4. Privacy controls",
            "status": "locked",
            "detail": "Ship disconnect, pause sync, delete data, account exclusion, and audit history before real use."
          }
        ]
      }
    },
    "freshness": {
      "label": "Wealth scoreboard inputs",
      "ageDays": 0,
      "stale": false
    }
  },
  "education": {
    "heroSummary": "Education is a deadline radar for active classes and a compact OMSCS course map for finishing the Machine Learning specialization without vague school stress.",
    "summaryCards": [
      {
        "label": "Current program / course load",
        "value": "Georgia Tech MSML",
        "note": "| Georgia Tech MSML completed | Career | 2027 | In progress |"
      },
      {
        "label": "Current classes",
        "value": "CS7641 Machine Learning",
        "note": "In progress — Summer 2026"
      },
      {
        "label": "Most urgent deadline",
        "value": "Problem Set extra credit",
        "note": "Due 2026-07-31T23:59:00-04:00."
      },
      {
        "label": "OMSCS course map",
        "value": "2 taken / 1 active / 7 left",
        "note": "Ten-course plan follows the Machine Learning specialization path."
      },
      {
        "label": "Current learning focus",
        "value": "CS7641 + ML foundation",
        "note": "Communication quality and report clarity matter as much as working code."
      },
      {
        "label": "Academic priority level",
        "value": "Deadline-sensitive support lane",
        "note": "School stays visible through deadlines and course sequence, not generic motivation cards."
      }
    ],
    "highlights": [
      "Education prioritizes the next deadline across current classes.",
      "The degree map shows two courses taken, one active, and seven left.",
      "Alternatives stay available without cluttering the primary schedule."
    ],
    "freshness": {
      "label": "Education planning docs",
      "ageDays": 0,
      "stale": false
    },
    "education": {
      "activeProgram": "Georgia Tech OMSCS / MSML",
      "activeTerm": "Summer 2026",
      "activeCourses": [
        "CS7641 Machine Learning"
      ],
      "coursePlan": [
        {
          "code": "CS 8803 O17",
          "name": "Global Entrepreneurship",
          "term": "Spring 2026",
          "status": "taken",
          "role": "free-elective",
          "difficulty": 3,
          "why": "Product and venture context already counted in the 10-course plan."
        },
        {
          "code": "CS 6310",
          "name": "Software Architecture & Design",
          "term": "Spring 2026",
          "status": "taken",
          "role": "free-elective",
          "difficulty": 4,
          "why": "Useful architecture base for agent systems and scalable product work."
        },
        {
          "code": "CS 7641",
          "name": "Machine Learning",
          "term": "Summer 2026",
          "status": "active",
          "role": "core",
          "difficulty": 8,
          "why": "Required ML core and foundation for later ML electives."
        },
        {
          "code": "CS 6515",
          "name": "Intro to Graduate Algorithms",
          "term": "Fall 2026",
          "status": "planned",
          "role": "core",
          "difficulty": 9,
          "why": "Degree-safe algorithms anchor and hard thinking course."
        },
        {
          "code": "CS 6400",
          "name": "Database Systems Concepts and Design",
          "term": "Fall 2026",
          "status": "planned",
          "role": "free-elective",
          "difficulty": 5,
          "why": "High ROI for agent memory, state, retrieval, logs, and persistence."
        },
        {
          "code": "CS 7643",
          "name": "Deep Learning",
          "term": "Spring 2027",
          "status": "planned",
          "role": "ml-elective",
          "difficulty": 8,
          "why": "Strong modern AI depth."
        },
        {
          "code": "CS 6250",
          "name": "Computer Networks",
          "term": "Spring 2027",
          "status": "planned",
          "role": "free-elective",
          "difficulty": 6,
          "why": "Useful infrastructure and service-communication foundation."
        },
        {
          "code": "CS 7650",
          "name": "Natural Language Processing",
          "term": "Summer 2027",
          "status": "planned",
          "role": "ml-elective",
          "difficulty": 7,
          "why": "Directly relevant to agents and language-mediated workflows."
        },
        {
          "code": "CS 7646",
          "name": "Machine Learning for Trading",
          "term": "Fall 2027",
          "status": "planned",
          "role": "ml-elective",
          "difficulty": 6,
          "why": "Applied ML elective with finance relevance."
        },
        {
          "code": "CS 6200",
          "name": "Introduction to Operating Systems",
          "term": "Fall 2027",
          "status": "planned",
          "role": "free-elective",
          "difficulty": 7,
          "why": "Systems intuition for orchestration, processes, and resource management."
        }
      ],
      "alternatives": [
        {
          "code": "CSE 6250",
          "name": "Big Data for Health",
          "difficulty": 7,
          "bestFor": "LifeArc and health-data relevance."
        },
        {
          "code": "CS 6476",
          "name": "Computer Vision",
          "difficulty": 7,
          "bestFor": "Multimodal or vision pipeline interest."
        },
        {
          "code": "CS 7642",
          "name": "Reinforcement Learning",
          "difficulty": 9,
          "bestFor": "More technical prestige if the semester can absorb pain."
        },
        {
          "code": "ISYE 6420",
          "name": "Bayesian Statistics",
          "difficulty": 7,
          "bestFor": "Stronger statistical foundation."
        },
        {
          "code": "CSE 6242",
          "name": "Data and Visual Analytics",
          "difficulty": 6,
          "bestFor": "Applied analytics with moderate load."
        },
        {
          "code": "CS 6750",
          "name": "Human-Computer Interaction",
          "difficulty": 6,
          "bestFor": "Agent usability and product design."
        },
        {
          "code": "CS 7637",
          "name": "Knowledge-Based AI",
          "difficulty": 5,
          "bestFor": "Structured reasoning and symbolic AI complement."
        },
        {
          "code": "CS 7210",
          "name": "Distributed Computing",
          "difficulty": 10,
          "bestFor": "Maximum systems relevance with brutal workload."
        }
      ],
      "urgentDeadlines": [
        {
          "id": "cs7641-problem-set-extra-credit-2026-07-31t23-59-00-04-00",
          "courseCode": "CS7641",
          "courseName": "Machine Learning",
          "title": "Problem Set extra credit",
          "dueAt": "2026-07-31T23:59:00-04:00",
          "internalTarget": "2026-07-31T23:59:00-04:00",
          "kind": "extra-credit",
          "status": "urgent"
        },
        {
          "id": "cs7641-ul-report-discussion-2026-08-03t07-59-00-04-00",
          "courseCode": "CS7641",
          "courseName": "Machine Learning",
          "title": "UL Report Discussion",
          "dueAt": "2026-08-03T07:59:00-04:00",
          "internalTarget": "2026-08-02T23:59:00-04:00",
          "kind": "discussion",
          "status": "soon"
        },
        {
          "id": "cs7641-final-exam-2026-08-06t23-59-00-04-00",
          "courseCode": "CS7641",
          "courseName": "Machine Learning",
          "title": "Final Exam",
          "dueAt": "2026-08-06T23:59:00-04:00",
          "internalTarget": "2026-08-06T23:59:00-04:00",
          "kind": "exam",
          "status": "soon"
        }
      ],
      "planNote": "The default map favors ML core requirements plus agent-builder systems depth. Use alternatives when workload, specialization fit, or interests change."
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
  },
  "connections": {
    "heroSummary": "41 mapped people across 8 life lanes.",
    "summaryCards": [
      {
        "label": "Mapped people",
        "value": "41",
        "note": "8 life lanes in Connections."
      },
      {
        "label": "Priority people",
        "value": "3",
        "note": "Keep the active thread warm with one simple plan or check-in."
      },
      {
        "label": "Dormant important",
        "value": "5",
        "note": "Lohith: 2026-01-01 (college reunion)"
      },
      {
        "label": "Orlando local base",
        "value": "5",
        "note": "Keep the active thread warm with one simple plan or check-in."
      },
      {
        "label": "Career contacts",
        "value": "0",
        "note": "Career Networking contact tracker is still mostly a template.",
        "stale": true
      }
    ],
    "highlights": [
      "Keep each lane collapsed until it needs attention.",
      "Use lanes to see where the network is strong, thin, local, or dormant.",
      "Keep the people directory inside Connections."
    ],
    "freshness": {
      "label": "Connections life lanes",
      "ageDays": 0,
      "stale": false
    },
    "blockers": [
      {
        "label": "Career CRM",
        "value": "0 contacts",
        "detail": "Professional contact tracker exists but has no real contact rows yet.",
        "severity": "stale"
      }
    ],
    "missingData": [
      {
        "label": "Last-touch precision",
        "value": "Mixed formats",
        "detail": "Some last-contact values are dates, some are broad phrases like work or home visits.",
        "severity": "watch"
      },
      {
        "label": "Next actions",
        "value": "Inferred",
        "detail": "Next actions are currently inferred from category and recency until profile notes exist.",
        "severity": "watch"
      },
      {
        "label": "Family bridge",
        "value": "20 rows nearby",
        "detail": "Family data exists in a separate category and can be joined more deeply later.",
        "severity": "watch"
      }
    ],
    "connections": {
      "headline": "Life lanes",
      "posture": "People directory",
      "topReachOuts": [
        {
          "id": "melanie-romantic",
          "person": "Melanie",
          "category": "Romantic",
          "location": "Orlando",
          "closeness": "High — talking 4 months",
          "lastContact": "Late Mar 2026 (Pokémon Unite)",
          "priority": "active",
          "lane": "Romantic",
          "nextAction": "Keep the active thread warm with one simple plan or check-in.",
          "dormant": false,
          "profileStatus": "available",
          "profileSummary": "Melanie is the current romantic person in the Connections life-lanes record, based in Orlando, with high — talking 4 months context and active priority. Keep this profile focused on the live relationship thread, current warmth, and the next simple plan or check-in. Last recorded contact: Late Mar 2026 (Pokémon Unite)."
        },
        {
          "id": "mom-mother-immediate-family",
          "person": "Mom",
          "category": "Mother / immediate family",
          "location": "South Florida",
          "closeness": "Closest family relationship",
          "lastContact": "FaceTime 2x/week",
          "priority": "active",
          "lane": "Immediate family",
          "nextAction": "Keep Mom in the active family rotation with a direct call or text.",
          "dormant": false,
          "profileStatus": "available",
          "profileSummary": "Mom is immediate family: mother / immediate family, South Florida. PunkRecords frames immediate family as one of the most important relationship areas, with the family close but physically separated by Orlando versus South Florida. Current bond: Closest family relationship. Contact pattern: FaceTime 2x/week."
        },
        {
          "id": "lohith-close-friend",
          "person": "Lohith",
          "category": "Close friend",
          "location": "Houston",
          "closeness": "Medium — drifting with distance",
          "lastContact": "2026-01-01 (college reunion)",
          "priority": "medium",
          "lane": "Friends",
          "nextAction": "Send Lohith one low-friction catch-up text.",
          "dormant": true,
          "profileStatus": "available",
          "profileSummary": "Lohith is in the Friends lane as close friend, based in Houston, with medium — drifting with distance closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
        }
      ],
      "lanes": [
        {
          "id": "romantic",
          "title": "Romantic",
          "count": 1,
          "people": [
            {
              "id": "melanie-romantic",
              "person": "Melanie",
              "category": "Romantic",
              "location": "Orlando",
              "closeness": "High — talking 4 months",
              "lastContact": "Late Mar 2026 (Pokémon Unite)",
              "priority": "active",
              "lane": "Romantic",
              "nextAction": "Keep the active thread warm with one simple plan or check-in.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Melanie is the current romantic person in the Connections life-lanes record, based in Orlando, with high — talking 4 months context and active priority. Keep this profile focused on the live relationship thread, current warmth, and the next simple plan or check-in. Last recorded contact: Late Mar 2026 (Pokémon Unite)."
            }
          ]
        },
        {
          "id": "immediate-family",
          "title": "Immediate family",
          "count": 4,
          "people": [
            {
              "id": "mom-mother-immediate-family",
              "person": "Mom",
              "category": "Mother / immediate family",
              "location": "South Florida",
              "closeness": "Closest family relationship",
              "lastContact": "FaceTime 2x/week",
              "priority": "active",
              "lane": "Immediate family",
              "nextAction": "Keep Mom in the active family rotation with a direct call or text.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Mom is immediate family: mother / immediate family, South Florida. PunkRecords frames immediate family as one of the most important relationship areas, with the family close but physically separated by Orlando versus South Florida. Current bond: Closest family relationship. Contact pattern: FaceTime 2x/week."
            },
            {
              "id": "dad-father-immediate-family",
              "person": "Dad",
              "category": "Father / immediate family",
              "location": "South Florida",
              "closeness": "Good but surface remotely",
              "lastContact": "Low — texts for important things, FaceTime when Mom calls",
              "priority": "high",
              "lane": "Immediate family",
              "nextAction": "Keep Dad in the active family rotation with a direct call or text.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Dad is immediate family: father / immediate family, South Florida. PunkRecords frames immediate family as one of the most important relationship areas, with the family close but physically separated by Orlando versus South Florida. Current bond: Good but surface remotely. Contact pattern: Low — texts for important things, FaceTime when Mom calls."
            },
            {
              "id": "melvin-older-brother-immediate-family",
              "person": "Melvin",
              "category": "Older brother / immediate family",
              "location": "South Florida",
              "closeness": "Warm in person, shallow remotely",
              "lastContact": "Low — texts only",
              "priority": "high",
              "lane": "Immediate family",
              "nextAction": "Keep Melvin in the active family rotation with a direct call or text.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Melvin is immediate family: older brother / immediate family, South Florida. PunkRecords frames immediate family as one of the most important relationship areas, with the family close but physically separated by Orlando versus South Florida. Current bond: Warm in person, shallow remotely. Contact pattern: Low — texts only."
            },
            {
              "id": "milan-younger-brother-immediate-family",
              "person": "Milan",
              "category": "Younger brother / immediate family",
              "location": "South Florida",
              "closeness": "Warm, goofy, surface-level",
              "lastContact": "Low — texts only",
              "priority": "high",
              "lane": "Immediate family",
              "nextAction": "Keep Milan in the active family rotation with a direct call or text.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Milan is immediate family: younger brother / immediate family, South Florida. PunkRecords frames immediate family as one of the most important relationship areas, with the family close but physically separated by Orlando versus South Florida. Current bond: Warm, goofy, surface-level. Contact pattern: Low — texts only."
            }
          ]
        },
        {
          "id": "extended-family",
          "title": "Extended family",
          "count": 17,
          "people": [
            {
              "id": "abel-cousin-extended-family",
              "person": "Abel",
              "category": "Cousin / extended family",
              "location": "Miami / South Florida",
              "closeness": "Close through monthly home visits",
              "lastContact": "Every home visit / monthly",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Abel visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Abel is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "abin-cousin-extended-family",
              "person": "Abin",
              "category": "Cousin / extended family",
              "location": "Miami / South Florida",
              "closeness": "Close through monthly home visits",
              "lastContact": "Every home visit / monthly",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Abin visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Abin is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "akhil-cousin-extended-family",
              "person": "Akhil",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Akhil visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Akhil is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "alan-cousin-extended-family",
              "person": "Alan",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Alan visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Alan is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "alex-cousin-extended-family",
              "person": "Alex",
              "category": "Cousin / extended family",
              "location": "Miami / South Florida",
              "closeness": "Close through monthly home visits",
              "lastContact": "Every home visit / monthly",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Alex visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Alex is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "ambakan-cousin-extended-family",
              "person": "Ambakan",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Ambakan visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Ambakan is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "elba-cousin-extended-family",
              "person": "Elba",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Elba visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Elba is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "ida-cousin-extended-family",
              "person": "Ida",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Ida visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Ida is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "jackie-cousin-extended-family",
              "person": "Jackie",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Jackie visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Jackie is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "jaison-cousin-extended-family",
              "person": "Jaison",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Jaison visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Jaison is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "jeffrey-cousin-extended-family",
              "person": "Jeffrey",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Jeffrey visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Jeffrey is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "jessica-cousin-extended-family",
              "person": "Jessica",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Jessica visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Jessica is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "jude-cousin-extended-family",
              "person": "Jude",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Jude visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Jude is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "michael-cousin-extended-family",
              "person": "Michael",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Michael visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Michael is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "natalia-cousin-extended-family",
              "person": "Natalia",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Natalia visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Natalia is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "natasha-cousin-extended-family",
              "person": "Natasha",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Natasha visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Natasha is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            },
            {
              "id": "nivea-cousin-extended-family",
              "person": "Nivea",
              "category": "Cousin / extended family",
              "location": "Extended family",
              "closeness": "Extended family connection",
              "lastContact": "Family gatherings",
              "priority": "medium",
              "lane": "Extended family",
              "nextAction": "Keep Nivea visible for family visits, birthdays, and extended-family touchpoints.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Nivea is tracked in the extended family lane as cousin / extended family. PunkRecords says extended family matters through Miami, Chicago, home visits, family proximity, birthdays, and the broader Thanath/Kerala-rooted family network."
            }
          ]
        },
        {
          "id": "friends",
          "title": "Friends",
          "count": 9,
          "people": [
            {
              "id": "mehul-dance-team-close",
              "person": "Mehul",
              "category": "Dance team / close",
              "location": "South Florida",
              "closeness": "High — co-captain",
              "lastContact": "2026-01-01 (winter break)",
              "priority": "high",
              "lane": "Friends",
              "nextAction": "Send Mehul one low-friction catch-up text.",
              "dormant": true,
              "profileStatus": "available",
              "profileSummary": "Mehul is in the Friends lane as dance team / close, based in South Florida, with high — co-captain closeness and high priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (winter break)."
            },
            {
              "id": "josh-close-friend",
              "person": "Josh",
              "category": "Close friend",
              "location": "South Florida",
              "closeness": "High — old roommate",
              "lastContact": "Late Mar 2026 (Pokémon Unite)",
              "priority": "high",
              "lane": "Friends",
              "nextAction": "Send Josh one specific, low-pressure check-in.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Josh is in the Friends lane as close friend, based in South Florida, with high — old roommate closeness and high priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: Late Mar 2026 (Pokémon Unite)."
            },
            {
              "id": "anjali-college-friend-josh-s-gf",
              "person": "Anjali",
              "category": "College friend (Josh's GF)",
              "location": "South Florida (lives with Josh)",
              "closeness": "Medium",
              "lastContact": "2026-01-01 (college reunion)",
              "priority": "medium",
              "lane": "Friends",
              "nextAction": "Send Anjali one low-friction catch-up text.",
              "dormant": true,
              "profileStatus": "available",
              "profileSummary": "Anjali is in the Friends lane as college friend (josh's gf), based in South Florida (lives with Josh), with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
            },
            {
              "id": "chaquayla-college-friend",
              "person": "Chaquayla",
              "category": "College friend",
              "location": "Tallahassee",
              "closeness": "Medium",
              "lastContact": "2026-01-01 (college reunion)",
              "priority": "medium",
              "lane": "Friends",
              "nextAction": "Send Chaquayla one low-friction catch-up text.",
              "dormant": true,
              "profileStatus": "available",
              "profileSummary": "Chaquayla is in the Friends lane as college friend, based in Tallahassee, with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
            },
            {
              "id": "div-college-friend",
              "person": "Div",
              "category": "College friend",
              "location": "Mexico City (frequent Miami trips)",
              "closeness": "Medium",
              "lastContact": "2026-01-01 (college reunion)",
              "priority": "medium",
              "lane": "Friends",
              "nextAction": "Send Div one low-friction catch-up text.",
              "dormant": true,
              "profileStatus": "available",
              "profileSummary": "Div is in the Friends lane as college friend, based in Mexico City (frequent Miami trips), with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
            },
            {
              "id": "lohith-close-friend",
              "person": "Lohith",
              "category": "Close friend",
              "location": "Houston",
              "closeness": "Medium — drifting with distance",
              "lastContact": "2026-01-01 (college reunion)",
              "priority": "medium",
              "lane": "Friends",
              "nextAction": "Send Lohith one low-friction catch-up text.",
              "dormant": true,
              "profileStatus": "available",
              "profileSummary": "Lohith is in the Friends lane as close friend, based in Houston, with medium — drifting with distance closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
            },
            {
              "id": "shravya-college-friend",
              "person": "Shravya",
              "category": "College friend",
              "location": "Texas",
              "closeness": "Medium",
              "lastContact": "2026-01-01 (college reunion)",
              "priority": "medium",
              "lane": "Friends",
              "nextAction": "Send Shravya one low-friction catch-up text.",
              "dormant": true,
              "profileStatus": "available",
              "profileSummary": "Shravya is in the Friends lane as college friend, based in Texas, with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
            },
            {
              "id": "teja-college-friend",
              "person": "Teja",
              "category": "College friend",
              "location": "Chicago",
              "closeness": "Medium",
              "lastContact": "2026-01-01 (college reunion)",
              "priority": "medium",
              "lane": "Friends",
              "nextAction": "Send Teja one low-friction catch-up text.",
              "dormant": true,
              "profileStatus": "available",
              "profileSummary": "Teja is in the Friends lane as college friend, based in Chicago, with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
            },
            {
              "id": "alvin-hometown-friend",
              "person": "Alvin",
              "category": "Hometown friend",
              "location": "South Florida",
              "closeness": "Medium",
              "lastContact": "Weekly venture calls",
              "priority": "medium",
              "lane": "Friends",
              "nextAction": "Send Alvin one specific, low-pressure check-in.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Alvin is in the Friends lane as hometown friend, based in South Florida, with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: Weekly venture calls."
            }
          ]
        },
        {
          "id": "orlando-local",
          "title": "Orlando local",
          "count": 1,
          "people": [
            {
              "id": "david-orlando-friend",
              "person": "David",
              "category": "Orlando friend",
              "location": "Orlando",
              "closeness": "Low — haven't hung out",
              "lastContact": "2026-01-01 (college reunion)",
              "priority": "low",
              "lane": "Orlando local",
              "nextAction": "Turn this from surface-level into one real local hangout.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "David is part of the Orlando local base, based in Orlando, with low — haven't hung out closeness and low priority. This connection matters because the record flags Orlando as the place with the thinnest deeper local ties, so the profile should track whether this can become an actual hangout relationship. Last recorded contact: 2026-01-01 (college reunion)."
            }
          ]
        },
        {
          "id": "co-founders-ventures",
          "title": "Co-founders / ventures",
          "count": 4,
          "people": [
            {
              "id": "varun-co-founder-friend",
              "person": "Varun",
              "category": "Co-founder + friend",
              "location": "South Florida area",
              "closeness": "High — dance team + Matchup",
              "lastContact": "Active (venture)",
              "priority": "high",
              "lane": "Co-founders / ventures",
              "nextAction": "Add one non-work touchpoint around the next venture conversation.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Varun sits in the co-founder / venture lane as co-founder + friend, based in South Florida area, with high — dance team + matchup closeness and high priority. Track both the working relationship and the non-work friendship context so venture conversations do not become the only touchpoint. Last recorded contact: Active (venture)."
            },
            {
              "id": "vj-co-founder-friend",
              "person": "VJ",
              "category": "Co-founder + friend",
              "location": "Seattle",
              "closeness": "High — dance team + Matchup",
              "lastContact": "Active (venture)",
              "priority": "high",
              "lane": "Co-founders / ventures",
              "nextAction": "Add one non-work touchpoint around the next venture conversation.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "VJ sits in the co-founder / venture lane as co-founder + friend, based in Seattle, with high — dance team + matchup closeness and high priority. Track both the working relationship and the non-work friendship context so venture conversations do not become the only touchpoint. Last recorded contact: Active (venture)."
            },
            {
              "id": "ceaver-co-founder",
              "person": "Ceaver",
              "category": "Co-founder",
              "location": "[TBD — likely East Coast]",
              "closeness": "Low-medium",
              "lastContact": "Weekly venture calls",
              "priority": "medium",
              "lane": "Co-founders / ventures",
              "nextAction": "Add one non-work touchpoint around the next venture conversation.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Ceaver sits in the co-founder / venture lane as co-founder, with location still to confirm, with low-medium closeness and medium priority. Track both the working relationship and the non-work friendship context so venture conversations do not become the only touchpoint. Last recorded contact: Weekly venture calls."
            },
            {
              "id": "roshan-co-founder-friend",
              "person": "Roshan",
              "category": "Co-founder + friend",
              "location": "Virginia",
              "closeness": "Medium",
              "lastContact": "Active (venture)",
              "priority": "medium",
              "lane": "Co-founders / ventures",
              "nextAction": "Add one non-work touchpoint around the next venture conversation.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Roshan sits in the co-founder / venture lane as co-founder + friend, based in Virginia, with medium closeness and medium priority. Track both the working relationship and the non-work friendship context so venture conversations do not become the only touchpoint. Last recorded contact: Active (venture)."
            }
          ]
        },
        {
          "id": "career-network",
          "title": "Career network",
          "count": 4,
          "people": [
            {
              "id": "armando-boss-mentor",
              "person": "Armando",
              "category": "Boss / mentor",
              "location": "Orlando",
              "closeness": "Professional + poker",
              "lastContact": "Work",
              "priority": "medium",
              "lane": "Career network",
              "nextAction": "Create one lightweight work or career-context touchpoint.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Armando belongs in the career network as boss / mentor, based in Orlando, with professional + poker relationship context and medium priority. Keep notes around work context, mentorship value, and any useful career or professional follow-up. Last recorded contact: Work."
            },
            {
              "id": "alejandro-coworker",
              "person": "Alejandro",
              "category": "Coworker",
              "location": "Orlando",
              "closeness": "Surface",
              "lastContact": "Work",
              "priority": "low",
              "lane": "Career network",
              "nextAction": "Create one lightweight work or career-context touchpoint.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Alejandro belongs in the career network as coworker, based in Orlando, with surface relationship context and low priority. Keep notes around work context, mentorship value, and any useful career or professional follow-up. Last recorded contact: Work."
            },
            {
              "id": "jennifer-coworker",
              "person": "Jennifer",
              "category": "Coworker",
              "location": "Orlando",
              "closeness": "Surface",
              "lastContact": "Work",
              "priority": "low",
              "lane": "Career network",
              "nextAction": "Create one lightweight work or career-context touchpoint.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Jennifer belongs in the career network as coworker, based in Orlando, with surface relationship context and low priority. Keep notes around work context, mentorship value, and any useful career or professional follow-up. Last recorded contact: Work."
            },
            {
              "id": "jinan-coworker",
              "person": "Jinan",
              "category": "Coworker",
              "location": "Orlando",
              "closeness": "Surface",
              "lastContact": "Work",
              "priority": "low",
              "lane": "Career network",
              "nextAction": "Create one lightweight work or career-context touchpoint.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "Jinan belongs in the career network as coworker, based in Orlando, with surface relationship context and low priority. Keep notes around work context, mentorship value, and any useful career or professional follow-up. Last recorded contact: Work."
            }
          ]
        },
        {
          "id": "general-network",
          "title": "General network",
          "count": 1,
          "people": [
            {
              "id": "sf-indian-group-social-group",
              "person": "SF Indian group",
              "category": "Social group",
              "location": "South Florida",
              "closeness": "Collective close",
              "lastContact": "Home visits",
              "priority": "high",
              "lane": "General network",
              "nextAction": "Anchor the next touchpoint around the next South Florida visit.",
              "dormant": false,
              "profileStatus": "available",
              "profileSummary": "SF Indian group is tracked as a social group in the Friends lane, based in South Florida, with collective close context and high priority. Treat this as a group relationship profile: home visits and South Florida plans are the main way to keep the tie warm. Last recorded contact: Home visits."
            }
          ]
        }
      ],
      "localBase": [
        {
          "id": "melanie-romantic",
          "person": "Melanie",
          "category": "Romantic",
          "location": "Orlando",
          "closeness": "High — talking 4 months",
          "lastContact": "Late Mar 2026 (Pokémon Unite)",
          "priority": "active",
          "lane": "Romantic",
          "nextAction": "Keep the active thread warm with one simple plan or check-in.",
          "dormant": false,
          "profileStatus": "available",
          "profileSummary": "Melanie is the current romantic person in the Connections life-lanes record, based in Orlando, with high — talking 4 months context and active priority. Keep this profile focused on the live relationship thread, current warmth, and the next simple plan or check-in. Last recorded contact: Late Mar 2026 (Pokémon Unite)."
        },
        {
          "id": "david-orlando-friend",
          "person": "David",
          "category": "Orlando friend",
          "location": "Orlando",
          "closeness": "Low — haven't hung out",
          "lastContact": "2026-01-01 (college reunion)",
          "priority": "low",
          "lane": "Orlando local",
          "nextAction": "Turn this from surface-level into one real local hangout.",
          "dormant": false,
          "profileStatus": "available",
          "profileSummary": "David is part of the Orlando local base, based in Orlando, with low — haven't hung out closeness and low priority. This connection matters because the record flags Orlando as the place with the thinnest deeper local ties, so the profile should track whether this can become an actual hangout relationship. Last recorded contact: 2026-01-01 (college reunion)."
        },
        {
          "id": "jinan-coworker",
          "person": "Jinan",
          "category": "Coworker",
          "location": "Orlando",
          "closeness": "Surface",
          "lastContact": "Work",
          "priority": "low",
          "lane": "Career network",
          "nextAction": "Create one lightweight work or career-context touchpoint.",
          "dormant": false,
          "profileStatus": "available",
          "profileSummary": "Jinan belongs in the career network as coworker, based in Orlando, with surface relationship context and low priority. Keep notes around work context, mentorship value, and any useful career or professional follow-up. Last recorded contact: Work."
        },
        {
          "id": "jennifer-coworker",
          "person": "Jennifer",
          "category": "Coworker",
          "location": "Orlando",
          "closeness": "Surface",
          "lastContact": "Work",
          "priority": "low",
          "lane": "Career network",
          "nextAction": "Create one lightweight work or career-context touchpoint.",
          "dormant": false,
          "profileStatus": "available",
          "profileSummary": "Jennifer belongs in the career network as coworker, based in Orlando, with surface relationship context and low priority. Keep notes around work context, mentorship value, and any useful career or professional follow-up. Last recorded contact: Work."
        },
        {
          "id": "alejandro-coworker",
          "person": "Alejandro",
          "category": "Coworker",
          "location": "Orlando",
          "closeness": "Surface",
          "lastContact": "Work",
          "priority": "low",
          "lane": "Career network",
          "nextAction": "Create one lightweight work or career-context touchpoint.",
          "dormant": false,
          "profileStatus": "available",
          "profileSummary": "Alejandro belongs in the career network as coworker, based in Orlando, with surface relationship context and low priority. Keep notes around work context, mentorship value, and any useful career or professional follow-up. Last recorded contact: Work."
        }
      ],
      "dormantImportant": [
        {
          "id": "lohith-close-friend",
          "person": "Lohith",
          "category": "Close friend",
          "location": "Houston",
          "closeness": "Medium — drifting with distance",
          "lastContact": "2026-01-01 (college reunion)",
          "priority": "medium",
          "lane": "Friends",
          "nextAction": "Send Lohith one low-friction catch-up text.",
          "dormant": true,
          "profileStatus": "available",
          "profileSummary": "Lohith is in the Friends lane as close friend, based in Houston, with medium — drifting with distance closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
        },
        {
          "id": "mehul-dance-team-close",
          "person": "Mehul",
          "category": "Dance team / close",
          "location": "South Florida",
          "closeness": "High — co-captain",
          "lastContact": "2026-01-01 (winter break)",
          "priority": "high",
          "lane": "Friends",
          "nextAction": "Send Mehul one low-friction catch-up text.",
          "dormant": true,
          "profileStatus": "available",
          "profileSummary": "Mehul is in the Friends lane as dance team / close, based in South Florida, with high — co-captain closeness and high priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (winter break)."
        },
        {
          "id": "shravya-college-friend",
          "person": "Shravya",
          "category": "College friend",
          "location": "Texas",
          "closeness": "Medium",
          "lastContact": "2026-01-01 (college reunion)",
          "priority": "medium",
          "lane": "Friends",
          "nextAction": "Send Shravya one low-friction catch-up text.",
          "dormant": true,
          "profileStatus": "available",
          "profileSummary": "Shravya is in the Friends lane as college friend, based in Texas, with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
        },
        {
          "id": "teja-college-friend",
          "person": "Teja",
          "category": "College friend",
          "location": "Chicago",
          "closeness": "Medium",
          "lastContact": "2026-01-01 (college reunion)",
          "priority": "medium",
          "lane": "Friends",
          "nextAction": "Send Teja one low-friction catch-up text.",
          "dormant": true,
          "profileStatus": "available",
          "profileSummary": "Teja is in the Friends lane as college friend, based in Chicago, with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
        },
        {
          "id": "anjali-college-friend-josh-s-gf",
          "person": "Anjali",
          "category": "College friend (Josh's GF)",
          "location": "South Florida (lives with Josh)",
          "closeness": "Medium",
          "lastContact": "2026-01-01 (college reunion)",
          "priority": "medium",
          "lane": "Friends",
          "nextAction": "Send Anjali one low-friction catch-up text.",
          "dormant": true,
          "profileStatus": "available",
          "profileSummary": "Anjali is in the Friends lane as college friend (josh's gf), based in South Florida (lives with Josh), with medium closeness and medium priority. Connections frames this as part of the meaningful distributed friend network, so track shared history, distance drift, and the next low-pressure catch-up. Last recorded contact: 2026-01-01 (college reunion)."
        }
      ]
    }
  }
} as Partial<Record<PersonalProjectionKey, ProjectedSection>>

export function getGeneratedProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  const section = generatedProjectedSections[key]
  return section ? attachProjectedDashboard(key, section) : null
}
