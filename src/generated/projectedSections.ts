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
        },
        {
          "label": "Jul 23",
          "score": 5.3
        },
        {
          "label": "Jul 24",
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
      "lastUpdatedLabel": "Nightly source refresh: Jul 24"
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
        "note": "Latest workout file: 2026-07-22.",
        "stale": false
      },
      {
        "label": "Nutrition log source",
        "value": "105g protein",
        "note": "1,020 kcal logged. Latest nutrition file: 2026-07-23.",
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
      "Latest workout evidence: 2026-07-22",
      "Latest nutrition evidence: 2026-07-23",
      "Cut / recomp, not lean bulk",
      "Mental priority: focus, attention span, meditation, and phone friction",
      "Looks priority: grooming, skin, hair, style, and event readiness"
    ],
    "freshness": {
      "label": "Vessel evidence",
      "ageDays": 1,
      "stale": false
    },
    "vessel": {
      "muscleGroups": [
        {
          "id": "back",
          "label": "Back",
          "priority": "V-taper priority",
          "recentSets": 30,
          "lastHit": "2026-07-21",
          "lastHitLabel": "3 days ago",
          "heat": "hot",
          "recommendation": "Keep one vertical pull and one row pattern active each week."
        },
        {
          "id": "shoulders",
          "label": "Shoulders",
          "priority": "Width priority",
          "recentSets": 13,
          "lastHit": "2026-07-21",
          "lastHitLabel": "3 days ago",
          "heat": "hot",
          "recommendation": "Keep lateral delts and rear delts visible for the shoulder-width goal."
        },
        {
          "id": "chest",
          "label": "Chest",
          "priority": "Upper-chest priority",
          "recentSets": 7,
          "lastHit": "2026-07-17",
          "lastHitLabel": "7 days ago",
          "heat": "hot",
          "recommendation": "Add pressing or fly work if chest has not shown up recently."
        },
        {
          "id": "biceps",
          "label": "Biceps",
          "priority": "Arm detail",
          "recentSets": 13,
          "lastHit": "2026-07-21",
          "lastHitLabel": "3 days ago",
          "heat": "hot",
          "recommendation": "Keep curls in the rotation, but do not let arms crowd out chest or legs."
        },
        {
          "id": "triceps",
          "label": "Triceps",
          "priority": "Arm mass",
          "recentSets": 12,
          "lastHit": "2026-07-20",
          "lastHitLabel": "4 days ago",
          "heat": "hot",
          "recommendation": "Use pushdowns or overhead work to keep arms full while cutting."
        },
        {
          "id": "abs",
          "label": "Abs",
          "priority": "Lean-look priority",
          "recentSets": 13,
          "lastHit": "2026-07-21",
          "lastHitLabel": "3 days ago",
          "heat": "hot",
          "recommendation": "Keep direct core work frequent while the cut reveals definition."
        },
        {
          "id": "legs",
          "label": "Legs",
          "priority": "Balance priority",
          "recentSets": 6,
          "lastHit": "2026-07-21",
          "lastHitLabel": "3 days ago",
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
    "heroSummary": "Wealth is a money scoreboard: current net worth, growth over time, monthly surplus, and the real value of work hours after expenses.",
    "summaryCards": [
      {
        "label": "Current net worth",
        "value": "$110,000",
        "note": "Mitchell supplied this as the working current estimate on July 23, 2026."
      },
      {
        "label": "Baseline net worth",
        "value": "$100,600",
        "note": "Punk Records baseline from March 2026, kept for growth comparison."
      },
      {
        "label": "Monthly net income",
        "value": "$5,226",
        "note": "Punk Records W-2 net income estimate."
      },
      {
        "label": "Monthly expenses",
        "value": "$2,750",
        "note": "Using the Punk Records fixed + variable monthly budget estimate."
      },
      {
        "label": "Monthly surplus",
        "value": "$2,476",
        "note": "Net income minus estimated expenses before hourly split."
      },
      {
        "label": "Real hourly value",
        "value": "Needs hours",
        "note": "Track job hours and freelance hours only, then divide monthly surplus by monthly hours.",
        "stale": true
      }
    ],
    "highlights": [
      "Net worth is the scoreboard.",
      "Monthly surplus explains whether the scoreboard is improving.",
      "Real hourly value should use job hours and freelance hours only."
    ],
    "missingData": [
      {
        "label": "Job hours",
        "value": "Need weekly average",
        "detail": "Needed to calculate real hourly value from saved money.",
        "severity": "watch"
      },
      {
        "label": "Freelance hours",
        "value": "Need weekly average",
        "detail": "Track separately from job hours so paid side work does not blur the W-2 picture.",
        "severity": "watch"
      },
      {
        "label": "Net-worth history",
        "value": "Need monthly snapshots",
        "detail": "The page has March 2026 and current estimates, but needs ongoing monthly entries for a real trend.",
        "severity": "watch"
      }
    ],
    "wealth": {
      "headline": "Wealth Command Center",
      "asOf": "July 23, 2026",
      "accounts": [
        {
          "label": "Current net worth",
          "value": "$110,000",
          "note": "Working current estimate."
        },
        {
          "label": "March baseline",
          "value": "$100,600",
          "note": "Punk Records baseline."
        },
        {
          "label": "Change since March",
          "value": "+$9,400",
          "note": "Approximate growth from baseline to current estimate."
        },
        {
          "label": "Liabilities",
          "value": "$0",
          "note": "Punk Records listed no liabilities."
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
          "title": "Net Worth Ledger",
          "kicker": "Scoreboard",
          "summary": "Track whether total wealth is actually growing, using the March baseline and current estimate as the first two anchors.",
          "metrics": [
            {
              "label": "Current",
              "value": "$110,000",
              "note": "Working estimate."
            },
            {
              "label": "Baseline",
              "value": "$100,600",
              "note": "March 2026 Punk Records."
            },
            {
              "label": "Growth",
              "value": "+$9,400",
              "note": "Approximate change since baseline."
            }
          ],
          "nextAction": "Add a monthly snapshot row with cash, investments, stock, vehicle, and liabilities."
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
          "title": "Cashflow Control",
          "kicker": "Savings engine",
          "summary": "Keep the income, expense, and surplus assumptions visible so the page does not drift into fake precision.",
          "metrics": [
            {
              "label": "Net income",
              "value": "$5,226",
              "note": "Punk Records estimate."
            },
            {
              "label": "Expenses",
              "value": "$2,750",
              "note": "Using the fixed + variable estimate."
            },
            {
              "label": "Surplus",
              "value": "$2,476",
              "note": "Estimated monthly money kept."
            }
          ],
          "nextAction": "Replace the estimate with a real trailing 30-day spend number when available."
        }
      ],
      "prompts": [
        {
          "label": "Job hours",
          "value": "Weekly average",
          "detail": "Needed for real hourly value.",
          "severity": "watch"
        },
        {
          "label": "Freelance hours",
          "value": "Weekly average",
          "detail": "Needed for the separate side-work hourly view.",
          "severity": "watch"
        },
        {
          "label": "Monthly snapshot",
          "value": "Next balance update",
          "detail": "Needed for the net-worth growth chart.",
          "severity": "watch"
        }
      ]
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
        "value": "UL Report",
        "note": "Due 2026-07-27T07:59:00-04:00."
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
          "id": "cs7641-ul-report-2026-07-27t07-59-00-04-00",
          "courseCode": "CS7641",
          "courseName": "Machine Learning",
          "title": "UL Report",
          "dueAt": "2026-07-27T07:59:00-04:00",
          "internalTarget": "2026-07-26T23:59:00-04:00",
          "kind": "report",
          "status": "urgent"
        },
        {
          "id": "cs7641-ul-unit-quiz-2026-07-27t07-59-00-04-00",
          "courseCode": "CS7641",
          "courseName": "Machine Learning",
          "title": "UL Unit Quiz",
          "dueAt": "2026-07-27T07:59:00-04:00",
          "internalTarget": "2026-07-26T23:59:00-04:00",
          "kind": "quiz",
          "status": "urgent"
        },
        {
          "id": "cs7641-problem-set-extra-credit-2026-07-31t23-59-00-04-00",
          "courseCode": "CS7641",
          "courseName": "Machine Learning",
          "title": "Problem Set extra credit",
          "dueAt": "2026-07-31T23:59:00-04:00",
          "internalTarget": "2026-07-31T23:59:00-04:00",
          "kind": "extra-credit",
          "status": "soon"
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
  }
} as Partial<Record<PersonalProjectionKey, ProjectedSection>>

export function getGeneratedProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  const section = generatedProjectedSections[key]
  return section ? attachProjectedDashboard(key, section) : null
}
