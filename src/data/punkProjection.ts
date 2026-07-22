import fs from 'node:fs'
import path from 'node:path'
import type { EducationDeadlineProjection, IdentityQualityProjection, ProjectedSection, VesselMuscleGroupProjection } from './projectedTypes'

const PUNK_RECORDS_ROOT = '/Users/shika/.openclaw/workspace/PunkRecords'

function readPunkFile(relativePath: string) {
  try {
    return fs.readFileSync(path.join(PUNK_RECORDS_ROOT, relativePath), 'utf8')
  } catch {
    return ''
  }
}

function latestMarkdownDate(relativeDir: string) {
  try {
    const full = path.join(PUNK_RECORDS_ROOT, relativeDir)
    const files = fs.readdirSync(full).filter((file: string) => file.endsWith('.md')).sort()
    return files.length ? files[files.length - 1].replace(/\.md$/, '') : null
  } catch {
    return null
  }
}

function listMarkdownDates(relativeDir: string) {
  try {
    const full = path.join(PUNK_RECORDS_ROOT, relativeDir)
    return fs.readdirSync(full)
      .filter((file: string) => file.endsWith('.md'))
      .sort()
      .map((file: string) => file.replace(/\.md$/, ''))
  } catch {
    return []
  }
}

function markdownListItems(markdown: string, headingPattern: string, limit = 5) {
  const section = markdown.match(new RegExp(`${headingPattern}[\\s\\S]*?(?=\\n## |$)`))?.[0] ?? ''
  return section
    .split('\n')
    .map((line) => line.match(/^-\s+(.+)/)?.[1]?.replace(/\*\*/g, '').trim())
    .filter((line): line is string => Boolean(line))
    .slice(0, limit)
}

function daysSince(dateLike?: string | null) {
  if (!dateLike) return null
  const value = Date.parse(dateLike)
  if (Number.isNaN(value)) return null
  return Math.floor((Date.now() - value) / (1000 * 60 * 60 * 24))
}

function countMatches(input: string, needle: string) {
  if (!input || !needle) return 0
  return input.split(needle).length - 1
}

function summarizeFreshness(label: string, ageDays: number | null, staleAfterDays: number) {
  return {
    label,
    ageDays,
    stale: ageDays === null ? true : ageDays > staleAfterDays,
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function firstMarkdownListItems(markdown: string, heading: string) {
  const section = markdown.match(new RegExp(`#### ${heading}[\\s\\S]*?(?=\\n#### |\\n### |\\n## |$)`))?.[0] ?? ''
  return section
    .split('\n')
    .map((line) => line.match(/^-\s+(.+)/)?.[1]?.trim())
    .filter((line): line is string => Boolean(line))
}

const muscleGroupDefinitions = [
  {
    id: 'back',
    label: 'Back',
    priority: 'V-taper priority',
    targetSets: 10,
    terms: ['lat', 'pulldown', 'pull-up', 'pull up', 'row', 't-bar', 'scapular', 'back extension'],
    recommendation: 'Keep one vertical pull and one row pattern active each week.',
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    priority: 'Width priority',
    targetSets: 8,
    terms: ['shoulder', 'lateral raise', 'rear delt', 'face pull', 'delt'],
    recommendation: 'Keep lateral delts and rear delts visible for the shoulder-width goal.',
  },
  {
    id: 'chest',
    label: 'Chest',
    priority: 'Upper-chest priority',
    targetSets: 7,
    terms: ['bench', 'incline press', 'chest', 'fly', 'pec'],
    recommendation: 'Add pressing or fly work if chest has not shown up recently.',
  },
  {
    id: 'biceps',
    label: 'Biceps',
    priority: 'Arm detail',
    targetSets: 6,
    terms: ['bicep', 'curl'],
    recommendation: 'Keep curls in the rotation, but do not let arms crowd out chest or legs.',
  },
  {
    id: 'triceps',
    label: 'Triceps',
    priority: 'Arm mass',
    targetSets: 6,
    terms: ['tricep', 'pushdown', 'skull crusher', 'overhead extension'],
    recommendation: 'Use pushdowns or overhead work to keep arms full while cutting.',
  },
  {
    id: 'abs',
    label: 'Abs',
    priority: 'Lean-look priority',
    targetSets: 6,
    terms: ['ab', 'core', 'crunch', 'leg raise'],
    recommendation: 'Keep direct core work frequent while the cut reveals definition.',
  },
  {
    id: 'legs',
    label: 'Legs',
    priority: 'Balance priority',
    targetSets: 9,
    terms: ['leg press', 'leg curl', 'leg extension', 'squat', 'romanian', 'rdl', 'hamstring', 'quad', 'glute', 'calf'],
    recommendation: 'Do not let the aesthetics push turn into skipping legs.',
  },
  {
    id: 'cardio',
    label: 'Cardio',
    priority: 'Cut support',
    targetSets: 2,
    terms: ['cardio', 'zone 2', 'walk', 'jog', 'run', 'bike', 'treadmill', 'stairmaster'],
    recommendation: 'Add Zone 2 when fat-loss support is missing from the week.',
  },
]

function workoutExerciseBlocks(markdown: string) {
  const section = markdown.match(/## Exercises\s*([\s\S]*?)(?=\n## |$)/)?.[1] ?? ''
  const blocks: Array<{ name: string, sets: number }> = []
  const headingRegex = /^###\s+(.+)$/gm
  const matches = [...section.matchAll(headingRegex)]

  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index ?? section.length : section.length
    const body = section.slice(start, end)
    const sets = body.split('\n').filter((line) => /^-\s+/.test(line.trim())).length
    blocks.push({ name: match[1].trim(), sets: Math.max(1, sets) })
  })

  return blocks
}

function matchesMuscleTerm(value: string, term: string) {
  if (!value || !term) return false
  if (term.length <= 4 && /^[a-z0-9]+$/.test(term)) {
    return new RegExp(`\\b${term}\\b`).test(value)
  }
  return value.includes(term)
}

function buildMuscleHeatmap(): VesselMuscleGroupProjection[] {
  const dates = listMarkdownDates('Vessel/Fitness/Workout Logs')
  const today = Date.now()
  const groups = muscleGroupDefinitions.map((group) => ({
    ...group,
    recentSets: 0,
    lastHit: null as string | null,
    exactSets: 0,
  }))

  dates.forEach((date) => {
    const age = daysSince(date)
    if (age === null || age > 28) return

    const markdown = readPunkFile(`Vessel/Fitness/Workout Logs/${date}.md`)
    const focus = markdown.match(/Focus:\s*(.+)/i)?.[1]?.toLowerCase() ?? ''
    const exercises = workoutExerciseBlocks(markdown)

    groups.forEach((group) => {
      const matchedSets = exercises.reduce((total, exercise) => {
        const name = exercise.name.toLowerCase()
        return group.terms.some((term) => matchesMuscleTerm(name, term)) ? total + exercise.sets : total
      }, 0)
      const focusBonus = group.terms.some((term) => matchesMuscleTerm(focus, term)) ? 1 : 0
      const totalSets = matchedSets + focusBonus
      if (totalSets === 0) return

      const weight = age <= 7 ? 1 : age <= 14 ? 0.65 : 0.35
      group.exactSets += totalSets
      group.recentSets += totalSets * weight
      if (!group.lastHit || Date.parse(date) > Date.parse(group.lastHit)) {
        group.lastHit = date
      }
    })
  })

  return groups.map((group) => {
    const age = group.lastHit ? Math.max(0, Math.floor((today - Date.parse(group.lastHit)) / (1000 * 60 * 60 * 24))) : null
    const recentSets = Math.round(group.recentSets)
    const heat: VesselMuscleGroupProjection['heat'] = !group.lastHit
      ? 'missing'
      : age !== null && age > 14
        ? 'stale'
        : recentSets >= group.targetSets
          ? 'hot'
          : recentSets >= Math.ceil(group.targetSets * 0.6)
            ? 'solid'
            : 'touched'

    return {
      id: group.id,
      label: group.label,
      priority: group.priority,
      recentSets,
      lastHit: group.lastHit,
      lastHitLabel: age === null ? 'No recent log' : age === 0 ? 'Today' : `${age} day${age === 1 ? '' : 's'} ago`,
      heat,
      recommendation: group.recommendation,
    }
  })
}

function idealSelfQualities(ideal: string): IdentityQualityProjection[] {
  const characterItems = firstMarkdownListItems(ideal, 'Character & Habits')
  const gapRows = ideal
    .split('\n')
    .map((line) => line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .filter((match) => !match[1].includes('Dimension') && !match[1].includes('---'))

  const sourceRows = gapRows.length
    ? gapRows.map((match) => ({
      name: match[1].trim().replace(/\s*\/\s*/g, ' / '),
      ideal: match[2].trim(),
      current: match[3].trim(),
      gap: match[4].trim().replace(/\[\[|\]\]/g, ''),
    }))
    : [
      { name: 'Discipline', ideal: characterItems[0] ?? 'Calm, disciplined, focused, and happy every day.', current: 'Needs daily evidence.', gap: 'Choose the top task and finish it before drifting.' },
      { name: 'Presence', ideal: characterItems[3] ?? 'Present and intentional.', current: 'Attention can fragment.', gap: 'Protect the next real moment from phone drift.' },
      { name: 'Social confidence', ideal: 'Magnetic, present, connecting.', current: 'Environment-sensitive.', gap: 'Create one small moment of connection today.' },
    ]

  return sourceRows.slice(0, 6).map((row, index) => {
    const hasConcreteGap = row.gap && !row.gap.toLowerCase().includes('source records')
    const baseScore = Math.max(3.8, Math.min(7.2, 6.8 - index * 0.45 - (row.current.length > row.ideal.length ? 0.4 : 0)))
    return {
      id: slugify(row.name) || `quality-${index + 1}`,
      name: row.name,
      score: Number(baseScore.toFixed(1)),
      tenMeans: row.ideal,
      nextAction: hasConcreteGap ? row.gap : 'Pick one small behavior that proves this today.',
      source: 'Personal Decision Engine / Ideal Self',
    }
  })
}

export function buildVesselData(): ProjectedSection {
  const fitness = readPunkFile('Vessel/Fitness/Fitness Overview.md')
  const nutrition = readPunkFile('Vessel/Nutrition/Nutrition Overview.md')
  const looksRoutine = readPunkFile('Vessel/Looksmaxxing/Looksmaxxing Routine.md')
  const meditationReminderRules = readPunkFile('Vessel/Mental/Meditation Reminder Rules.md')
  const workoutDate = latestMarkdownDate('Vessel/Fitness/Workout Logs')
  const nutritionDate = latestMarkdownDate('Vessel/Nutrition/Daily Logs')
  const meditationDates = listMarkdownDates('Vessel/Mental/Meditation/Daily Logs')
  const meditationLatestDate = meditationDates.at(-1) ?? null
  const latestNutrition = nutritionDate ? readPunkFile(`Vessel/Nutrition/Daily Logs/${nutritionDate}.md`) : ''
  const workoutAge = daysSince(workoutDate)
  const nutritionAge = daysSince(nutritionDate)
  const currentWeight = fitness.match(/\| Weight \| ~?(\d+)/)?.[1] ?? '—'
  const targetWeight = fitness.match(/\| Weight \| .*?\| (\d+[-–]\d+) lbs by September \|/)?.[1] ?? '145–148'
  const activeDirection = (nutrition.match(/\*\*Active direction:\*\*\s*(.+)/)?.[1] ?? 'Cut / recomp').replace(/\.$/, '')
  const latestProtein = latestNutrition.match(/Protein:\s*~?([\d.]+)\s*g/i)?.[1]
  const latestCalories = latestNutrition.match(/Calories:\s*~?([\d,]+)\s*kcal/i)?.[1]
  const muscleGroups = buildMuscleHeatmap()
  const meditationSessionLength = meditationReminderRules.match(/Start with \*\*([^*]+)\*\*/)?.[1] ?? '5-minute sessions'
  const morningReminder = meditationReminderRules.match(/Morning meditation reminder[\s\S]*?- Time:\s+\*\*([^*]+)\*\*/)?.[1]
  const eveningReminder = meditationReminderRules.match(/Evening reset reminder[\s\S]*?- Time:\s+\*\*([^*]+)\*\*/)?.[1]
  const reminderWindows = [morningReminder, eveningReminder].filter((item): item is string => Boolean(item))
  const looksDaily = markdownListItems(looksRoutine, '## Daily Routine', 4)
  const looksGoingOut = markdownListItems(looksRoutine, '## Going-Out / Event Routine', 4)

  return {
    heroSummary: `A simple daily dashboard for the four Vessel levers: lift consistently, hit the food log, reset attention, and keep presentation sharp.`,
    summaryCards: [
      { label: 'Weight / body metrics', value: `${currentWeight} lb`, note: `Target ${targetWeight} lb by September from Fitness Overview.` },
      { label: 'Workout log source', value: workoutDate ? 'Workout log available' : 'Awaiting workout log', note: workoutDate ? `Latest workout file: ${workoutDate}.` : 'No workout log file found yet.', stale: (workoutAge ?? 999) > 4 },
      { label: 'Nutrition log source', value: nutritionDate ? `${latestProtein ? `${latestProtein}g protein` : `Logged ${nutritionDate}`}` : 'Awaiting nutrition log', note: nutritionDate ? `${latestCalories ? `${latestCalories} kcal logged. ` : ''}Latest nutrition file: ${nutritionDate}.` : 'No nutrition log file found yet.', stale: (nutritionAge ?? 999) > 3 },
      { label: 'Meditation log source', value: meditationLatestDate ? `Logged ${meditationLatestDate}` : 'Needs source entries', note: `${meditationDates.length} meditation session files found.` },
      { label: 'Current physique goal', value: `${targetWeight} lb`, note: 'Lean, defined, and preserving muscle rather than swingy crash dieting.' },
    ],
    highlights: [
      `Latest workout evidence: ${workoutDate ?? 'missing'}`,
      `Latest nutrition evidence: ${nutritionDate ?? 'missing'}`,
      activeDirection,
      'Mental priority: focus, attention span, meditation, and phone friction',
      'Looks priority: grooming, skin, hair, style, and event readiness',
    ],
    freshness: summarizeFreshness('Vessel evidence', Math.min(workoutAge ?? 999, nutritionAge ?? 999), 4),
    vessel: {
      muscleGroups,
      muscleWindowLabel: 'Recent workout logs, weighted toward the last 7 days',
      musclePriorityNote: 'Aesthetic priorities emphasize V-taper, shoulder width, upper chest, arms, visible abs, balanced legs, and enough cardio to support the cut.',
      meditation: {
        latestSessionDate: meditationLatestDate,
        sessionCount: meditationDates.length,
        baseline: meditationSessionLength,
        nextRep: '5 min focused breathing after the morning brain dump',
        fallbackRep: 'Walking meditation or box breathing on unfocused days',
        reminderWindows,
      },
      looks: {
        daily: looksDaily,
        goingOut: looksGoingOut,
      },
    },
  }
}

export function buildIdentityData(): ProjectedSection {
  const annual = readPunkFile('Personal Decision Engine/Goals/Annual Goals.md')
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const ideal = readPunkFile('Personal Decision Engine/Ideal Self/Ideal Self.md')
  const mission = annual.match(/\*\*2026 Theme:\*\*\s*(.+)/)?.[1] ?? 'Execution'
  const topGoal = goals.match(/### 90-Day Focus \(Q2 2026\)[\s\S]*?1\. \*\*(.+?)\*\*/)?.[1] ?? 'Ship the software'
  const identityStatement = firstMarkdownListItems(ideal, 'Character & Habits')[0] ?? 'Calm, disciplined, focused, and happy every day.'
  const qualities = idealSelfQualities(ideal)
  const physicalGap = qualities.find((quality) => quality.id === 'physical-presence-energy')?.nextAction ?? 'Close the physical / energy gap.'
  const socialGap = qualities.find((quality) => quality.id === 'social-confidence')?.nextAction ?? 'Rebuild social confidence in the right environment.'
  const averageScore = qualities.length
    ? qualities.reduce((total, item) => total + item.score, 0) / qualities.length
    : 0

  return {
    heroSummary: '',
    summaryCards: [
      { label: 'Current identity statement', value: 'Execution-era self', note: identityStatement },
      { label: 'Ideal self alignment', value: 'Gap-aware', note: 'The ideal self is useful when it changes behavior.' },
      { label: 'Current focus', value: mission, note: `Top active goal: ${topGoal}.` },
      { label: 'Top active goals', value: topGoal, note: 'Pulled from 90-day focus and annual goals.' },
      { label: 'Current dilemmas / blockers', value: 'Environment + consistency', note: socialGap },
      { label: 'Recent lessons / growth', value: 'Bridge current self to ideal self', note: physicalGap },
    ],
    highlights: [
      `Current focus: ${mission}`,
      `Top active goal: ${topGoal}`,
      'Ideal Self and Goals Overview are the main identity anchors.',
    ],
    freshness: summarizeFreshness('Identity planning docs', 0, 30),
    identity: {
      statement: identityStatement,
      statementSource: 'Personal Decision Engine / Ideal Self / Character & Habits',
      qualities,
      scoreHistory: [{ label: 'Today', score: Number(averageScore.toFixed(1)) }],
      nightlyChanges: [
        { qualityId: qualities[0]?.id ?? 'identity', delta: 0, reason: 'Source projection refreshed from Ideal Self and Goals notes.' },
      ],
      lastUpdatedLabel: 'Latest source projection',
    },
  }
}

export function buildSystemsData(): ProjectedSection {
  const operations = readPunkFile('Operations/Operations Task Board.md')
  const ventures = readPunkFile('High ROI Ventures/Ventures MOC.md')
  const openItems = countMatches(operations, '- [ ]')
  const completedItems = countMatches(operations, '- [x]')
  const ventureMentions = countMatches(ventures, '\n- ')

  return {
    heroSummary: `Systems is grounded in the Operations Task Board with ${openItems} open checklist items visible and ${completedItems} completed ones captured in the source note.`,
    summaryCards: [
      { label: 'Operations board', value: `${openItems} open`, note: 'Derived from checklist items in Operations Task Board.' },
      { label: 'Closed loops', value: `${completedItems} completed`, note: 'Completed checklist count from the same operating board.' },
      { label: 'Venture surface area', value: `${ventureMentions} listed lines`, note: 'Quick proxy for active venture inventory in Ventures MOC.' },
      { label: 'Automation posture', value: 'Manual + AI-assisted', note: 'The systems layer blends human judgment with AI support.' },
      { label: 'Operating principle', value: 'Capture > clarify > execute', note: 'The goal is a practical operations layer, not a decorative dashboard.' },
      { label: 'Current systems need', value: 'Better live rollups', note: 'This page is now ready for richer projection modules beyond simple counts.', stale: true },
    ],
    highlights: [
      'Operations Task Board is the main systems anchor.',
      'Ventures MOC helps expose cross-project surface area.',
      'This page should evolve into the daily operational command layer.',
    ],
    freshness: summarizeFreshness('Operations board evidence', 0, 14),
  }
}

export function buildVenturesData(): ProjectedSection {
  const ventures = readPunkFile('High ROI Ventures/Ventures MOC.md')
  const annualGoals = readPunkFile('Personal Decision Engine/Goals/Annual Goals.md')
  const bulletCount = countMatches(ventures, '\n- ')
  const inProgressCount = countMatches(annualGoals.toLowerCase(), 'in progress')

  return {
    heroSummary: `Ventures presents a portfolio view with ${bulletCount} venture bullets visible in the Ventures MOC and ${inProgressCount} explicit in-progress markers across annual goals.`,
    summaryCards: [
      { label: 'Portfolio inventory', value: `${bulletCount} listed bullets`, note: 'Fast proxy for how much venture surface area exists in the current note set.' },
      { label: 'Current priority posture', value: 'Execution over ideation', note: 'Annual goals emphasize shipping and traction, not endless exploration.' },
      { label: 'In-progress venture goals', value: `${inProgressCount} in progress`, note: 'Pulled from the annual goals source note.' },
      { label: 'Capital deployment stance', value: 'Selective', note: 'The control center is moving toward ROI-ranked moves rather than simple inventory.' },
      { label: 'Biggest operating need', value: 'Priority compression', note: 'Reduce surface area and make the next best move obvious.' },
      { label: 'Current blocker visibility', value: 'Improving', note: 'Business Command keeps live operational blockers separate from the personal strategy layer.' },
    ],
    highlights: [
      'Ventures MOC remains the personal strategy-side anchor.',
      'Annual goals provide the immediate venture pressure.',
      'Personal strategy stays distinct from Business Command live operations.',
    ],
    freshness: summarizeFreshness('Ventures planning docs', 0, 21),
  }
}

export function buildCareerData(): ProjectedSection {
  const annualGoals = readPunkFile('Personal Decision Engine/Goals/Annual Goals.md')
  const goalsOverview = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const careerGoal = 'Land higher-paying SWE role or negotiate raise'
  const careerLine = annualGoals.split('\n').find((line) => line.includes(careerGoal)) ?? ''
  const fiveYearCareer = 'Georgia Tech MSML completed'
  const longArcLine = goalsOverview.split('\n').find((line) => line.includes(fiveYearCareer)) ?? ''
  const careerParts = careerLine.split('|').map((part) => part.trim()).filter(Boolean)
  const currentStatus = careerParts.length >= 4 ? careerParts[3] : 'In progress'

  return {
    heroSummary: 'Career is in a leverage-building phase, with job-search preparation and long-arc ML credentials both visible in the source planning system.',
    summaryCards: [
      { label: 'Current career trajectory', value: currentStatus || 'In progress', note: careerGoal },
      { label: 'Resume / portfolio readiness', value: 'Prep phase', note: 'Annual goals explicitly call out resume, interview, and leverage work.' },
      { label: 'Job search status', value: 'Not fully activated', note: 'The note set suggests preparation before a full push.' },
      { label: 'Skill-building progress', value: 'MSML path active', note: longArcLine || 'Georgia Tech MSML remains a visible long-arc credential target.' },
      { label: 'Current leverage opportunities', value: 'Comp increase focus', note: 'Target is a >$20k comp increase or stronger role leverage.' },
      { label: 'Next career milestone', value: 'Interview-ready profile', note: 'The next layer is direct portfolio, resume, and cadence evidence.' },
    ],
    highlights: [
      'Career blends income leverage with long-term ML positioning.',
      'Annual goals and 5-year goals are the main current sources.',
      'The next layer is direct evidence from portfolio, resume, and interview cadence.',
    ],
    freshness: summarizeFreshness('Career planning docs', 0, 30),
  }
}

export function buildKnowledgeData(): ProjectedSection {
  const ideal = readPunkFile('Personal Decision Engine/Ideal Self/Ideal Self.md')
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const bookGoalLine = goals.split('\n').find((line) => line.includes('Read 10 books')) ?? ''
  const modelMentions = countMatches(ideal.toLowerCase(), 'framework') + countMatches(ideal.toLowerCase(), 'mental model')

  return {
    heroSummary: 'Knowledge is execution-supportive rather than archival, with learning tied to decision quality, identity formation, and active goals.',
    summaryCards: [
      { label: 'Current learning domains', value: 'Career, ventures, self-mastery', note: 'The current note set points toward practical domains rather than broad browsing.' },
      { label: 'Most valuable mental models', value: `${modelMentions || 1} explicit mentions`, note: 'Source notes show frameworks as part of the decision system.' },
      { label: 'Recently added knowledge', value: 'Not yet projected', note: 'A future pass should surface recency from the knowledge-side repo structure.', stale: true },
      { label: 'High-value references', value: 'Goals + Ideal Self', note: 'Right now the strongest references are strategic and identity-oriented notes.' },
      { label: 'Current research / reading focus', value: 'Reading goal active', note: bookGoalLine || 'Annual goals include an explicit reading target.' },
      { label: 'Knowledge gaps to close', value: 'Stronger live knowledge rollups', note: 'This page needs deeper source mapping to become truly strong.', stale: true },
    ],
    highlights: [
      'Knowledge should help action, not become a hoarding layer.',
      'The strategy layer is established and ready for deeper source traversal.',
      'This section is ready for richer source traversal as the control center deepens.',
    ],
    freshness: summarizeFreshness('Knowledge strategy docs', 0, 30),
  }
}

export function buildWealthData(): ProjectedSection {
  return {
    heroSummary: 'Wealth is framed more as trajectory and future leverage than as a live net-worth ledger, with financial freedom acting as the central long-arc target.',
    summaryCards: [
      { label: 'Net worth trajectory', value: '$500k+ 5-year target', note: 'The five-year goals note explicitly anchors this wealth milestone.' },
      { label: 'Cash / liquidity', value: 'Pending source layer', note: 'Real balances need a dedicated finance source before they appear here.', stale: true },
      { label: 'Income snapshot', value: 'W-2 + venture upside', note: 'Current notes frame the transition away from paycheck dependence as a major goal.' },
      { label: 'Investment allocation', value: 'Not yet projected', note: 'A later pass should expose accounts, allocations, and trend signals.', stale: true },
      { label: 'Current financial priorities', value: 'Increase leverage', note: 'Comp growth and venture traction both matter on the current path.' },
      { label: 'Wealth-building phase', value: 'Foundation-building', note: 'Still in the phase of increasing earning power and owned upside.' },
    ],
    highlights: [
      'Wealth is moving toward a real finance cockpit, not a vague aspiration page.',
      'Current projections are strategic, not account-level.',
      'This section needs deeper data sources in a later pass.',
    ],
    freshness: summarizeFreshness('Wealth strategy docs', 0, 30),
  }
}

function educationDeadlineStatus(dueAt: string): EducationDeadlineProjection['status'] {
  const due = Date.parse(dueAt)
  if (Number.isNaN(due)) return 'later'
  const daysUntil = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysUntil <= 5) return 'urgent'
  if (daysUntil <= 14) return 'soon'
  return 'later'
}

function parseEasternDeadline(value: string) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})\s+(AM|PM)\s+ET/i)
  if (!match) return null
  const [, year, month, day, hourRaw, minute, meridiem] = match
  const hourNumber = Number(hourRaw)
  const hour24 = meridiem.toUpperCase() === 'PM'
    ? (hourNumber === 12 ? 12 : hourNumber + 12)
    : (hourNumber === 12 ? 0 : hourNumber)
  const dueAt = `${year}-${month}-${day}T${String(hour24).padStart(2, '0')}:${minute}:00-04:00`
  let internalTarget = dueAt

  if (hour24 === 7 && minute === '59') {
    const targetDate = new Date(`${year}-${month}-${day}T12:00:00-04:00`)
    targetDate.setDate(targetDate.getDate() - 1)
    const targetYear = targetDate.getFullYear()
    const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0')
    const targetDay = String(targetDate.getDate()).padStart(2, '0')
    internalTarget = `${targetYear}-${targetMonth}-${targetDay}T23:59:00-04:00`
  }

  return { dueAt, internalTarget }
}

function inferDeadlineKind(title: string): EducationDeadlineProjection['kind'] {
  const lower = title.toLowerCase()
  if (lower.includes('exam')) return 'exam'
  if (lower.includes('quiz')) return 'quiz'
  if (lower.includes('discussion')) return 'discussion'
  if (lower.includes('extra credit')) return 'extra-credit'
  if (lower.includes('report')) return 'report'
  return 'assignment'
}

function educationDeadlinesFromCourse(markdown: string, courseCode: string, courseName: string) {
  const section = markdown.match(/## Important Dates[\s\S]*?(?=\n## |\n### |$)/)?.[0] ?? ''
  return section
    .split('\n')
    .map((line) => {
      const match = line.match(/^-\s+\*\*([^*]+):\*\*\s+(.+?)\s+due\b/i)
      if (!match) return null
      const parsed = parseEasternDeadline(match[1])
      if (!parsed) return null
      const title = match[2].trim()
      return {
        id: slugify(`${courseCode}-${title}-${parsed.dueAt}`),
        courseCode,
        courseName,
        title,
        dueAt: parsed.dueAt,
        internalTarget: parsed.internalTarget,
        kind: inferDeadlineKind(title),
        status: educationDeadlineStatus(parsed.dueAt),
      }
    })
    .filter((deadline): deadline is EducationDeadlineProjection => Boolean(deadline))
    .filter((deadline) => Date.parse(deadline.dueAt) >= Date.now() - (24 * 60 * 60 * 1000))
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
}

export function buildEducationData(): ProjectedSection {
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const gtOverview = readPunkFile('School/Masters GT/GT Overview.md')
  const currentCourses = readPunkFile('School/School/Current Courses.md')
  const machineLearning = readPunkFile('School/Masters GT/Courses/Machine Learning/CS7641 Machine Learning Overview.md')
  const degreeLine = goals.split('\n').find((line) => line.includes('Georgia Tech MSML completed')) ?? ''
  const activeCourseLine = currentCourses.match(/\|\s*(CS7641 Machine Learning)\s*\|[^|]+\|\s*([^|]+?)\s*\|/) ?? gtOverview.match(/\|\s*(CS7641 — Machine Learning)\s*\|[^|]+\|\s*([^|]+?)\s*\|/)
  const activeCourse = activeCourseLine?.[1]?.replace(' — ', ' ') ?? 'CS7641 Machine Learning'
  const activeCourseStatus = activeCourseLine?.[2]?.trim() ?? 'In progress — Summer 2026'
  const deadlineRule = machineLearning.match(/Internal deadline rule:\*\*\s+(.+)/)?.[1]?.trim()
    ?? 'Treat 11:59 PM ET the prior night as the real target whenever Canvas shows an overnight close.'
  const urgentDeadlines = educationDeadlinesFromCourse(machineLearning, 'CS7641', 'Machine Learning')

  const coursePlan = [
    { code: 'CS 8803 O17', name: 'Global Entrepreneurship', term: 'Spring 2026', status: 'taken' as const, role: 'free-elective' as const, difficulty: 3, why: 'Product and venture context already counted in the 10-course plan.' },
    { code: 'CS 6310', name: 'Software Architecture & Design', term: 'Spring 2026', status: 'taken' as const, role: 'free-elective' as const, difficulty: 4, why: 'Useful architecture base for agent systems and scalable product work.' },
    { code: 'CS 7641', name: 'Machine Learning', term: 'Summer 2026', status: 'active' as const, role: 'core' as const, difficulty: 8, why: 'Required ML core and foundation for later ML electives.' },
    { code: 'CS 6515', name: 'Intro to Graduate Algorithms', term: 'Fall 2026', status: 'planned' as const, role: 'core' as const, difficulty: 9, why: 'Degree-safe algorithms anchor and hard thinking course.' },
    { code: 'CS 6400', name: 'Database Systems Concepts and Design', term: 'Fall 2026', status: 'planned' as const, role: 'free-elective' as const, difficulty: 5, why: 'High ROI for agent memory, state, retrieval, logs, and persistence.' },
    { code: 'CS 7643', name: 'Deep Learning', term: 'Spring 2027', status: 'planned' as const, role: 'ml-elective' as const, difficulty: 8, why: 'Strong modern AI depth.' },
    { code: 'CS 6250', name: 'Computer Networks', term: 'Spring 2027', status: 'planned' as const, role: 'free-elective' as const, difficulty: 6, why: 'Useful infrastructure and service-communication foundation.' },
    { code: 'CS 7650', name: 'Natural Language Processing', term: 'Summer 2027', status: 'planned' as const, role: 'ml-elective' as const, difficulty: 7, why: 'Directly relevant to agents and language-mediated workflows.' },
    { code: 'CS 7646', name: 'Machine Learning for Trading', term: 'Fall 2027', status: 'planned' as const, role: 'ml-elective' as const, difficulty: 6, why: 'Applied ML elective with finance relevance.' },
    { code: 'CS 6200', name: 'Introduction to Operating Systems', term: 'Fall 2027', status: 'planned' as const, role: 'free-elective' as const, difficulty: 7, why: 'Systems intuition for orchestration, processes, and resource management.' },
  ]

  const alternatives = [
    { code: 'CSE 6250', name: 'Big Data for Health', difficulty: 7, bestFor: 'LifeArc and health-data relevance.' },
    { code: 'CS 6476', name: 'Computer Vision', difficulty: 7, bestFor: 'Multimodal or vision pipeline interest.' },
    { code: 'CS 7642', name: 'Reinforcement Learning', difficulty: 9, bestFor: 'More technical prestige if the semester can absorb pain.' },
    { code: 'ISYE 6420', name: 'Bayesian Statistics', difficulty: 7, bestFor: 'Stronger statistical foundation.' },
    { code: 'CSE 6242', name: 'Data and Visual Analytics', difficulty: 6, bestFor: 'Applied analytics with moderate load.' },
    { code: 'CS 6750', name: 'Human-Computer Interaction', difficulty: 6, bestFor: 'Agent usability and product design.' },
    { code: 'CS 7637', name: 'Knowledge-Based AI', difficulty: 5, bestFor: 'Structured reasoning and symbolic AI complement.' },
    { code: 'CS 7210', name: 'Distributed Computing', difficulty: 10, bestFor: 'Maximum systems relevance with brutal workload.' },
  ]

  return {
    heroSummary: 'Education is a deadline radar for active classes and a compact OMSCS course map for finishing the Machine Learning specialization without vague school stress.',
    summaryCards: [
      { label: 'Current program / course load', value: 'Georgia Tech MSML', note: degreeLine || 'The 5-year goals note keeps this degree path visible.' },
      { label: 'Current classes', value: activeCourse, note: activeCourseStatus },
      { label: 'Most urgent deadline', value: urgentDeadlines[0]?.title ?? 'No upcoming deadline found', note: urgentDeadlines[0] ? `Due ${urgentDeadlines[0].dueAt}.` : 'Check Canvas and update Punk Records when new dates land.' },
      { label: 'OMSCS course map', value: '2 taken / 1 active / 7 left', note: 'Ten-course plan follows the Machine Learning specialization path.' },
      { label: 'Current learning focus', value: 'CS7641 + ML foundation', note: 'Communication quality and report clarity matter as much as working code.' },
      { label: 'Academic priority level', value: 'Deadline-sensitive support lane', note: 'School stays visible through deadlines and course sequence, not generic motivation cards.' },
    ],
    highlights: [
      'Education prioritizes the next deadline across current classes.',
      'The degree map shows two courses taken, one active, and seven left.',
      'Alternatives stay available without cluttering the primary schedule.',
    ],
    freshness: summarizeFreshness('Education planning docs', 0, 45),
    education: {
      activeProgram: 'Georgia Tech OMSCS / MSML',
      activeTerm: 'Summer 2026',
      activeCourses: [activeCourse],
      coursePlan,
      alternatives,
      urgentDeadlines,
      deadlineRule,
      planNote: 'The default map favors ML core requirements plus agent-builder systems depth. Use alternatives when workload, specialization fit, or interests change.',
    },
  }
}

export function buildRelationshipsData(): ProjectedSection {
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const relationshipLine = goals.split('\n').find((line) => line.includes('Seriously dating with marriage in mind')) ?? ''
  const annualLine = goals.split('\n').find((line) => line.includes('Start dating intentionally')) ?? ''

  return {
    heroSummary: 'Relationships are treated as a meaningful life pillar, but current notes show this area as intentionally secondary until environment, relocation, and broader life conditions improve.',
    summaryCards: [
      { label: 'Relationship priority snapshot', value: 'Strategic but delayed', note: annualLine || 'The annual goals note keeps this active but paused.' },
      { label: 'Current connection health', value: 'Not fully projected', note: 'A richer people/relationship data layer does not exist yet.', stale: true },
      { label: 'Important people / focus', value: 'Family + future partner path', note: relationshipLine || 'Long-term notes keep serious partnership visible.' },
      { label: 'Upcoming relationship actions', value: 'Environment shift first', note: 'Current notes imply relocation and life context are upstream dependencies.' },
      { label: 'Long-term relationship vision', value: 'Marriage-minded', note: 'The long arc is serious partnership, not casual drift.' },
      { label: 'Current blockers / gaps', value: 'Environment + timing', note: 'The current system explicitly recognizes context as a blocker.' },
    ],
    highlights: [
      'Relationships should remain human and respectful, not become a weird quantified dashboard.',
      'Current notes emphasize timing and environment constraints.',
      'This page stays intentionally lighter than the execution-heavy sections.',
    ],
    freshness: summarizeFreshness('Relationship planning docs', 0, 45),
  }
}
