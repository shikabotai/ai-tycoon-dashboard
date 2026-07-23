import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const punkRoot = process.env.PUNK_RECORDS_ROOT ?? '/Users/shika/.openclaw/workspace/PunkRecords'
const outputPath = path.join(repoRoot, 'src/generated/projectedSections.ts')

function readPunkFile(relativePath) {
  try {
    return fs.readFileSync(path.join(punkRoot, relativePath), 'utf8')
  } catch {
    return ''
  }
}

function latestMarkdownDate(relativeDir) {
  try {
    const full = path.join(punkRoot, relativeDir)
    const files = fs.readdirSync(full).filter((file) => file.endsWith('.md')).sort()
    return files.length ? files[files.length - 1].replace(/\.md$/, '') : null
  } catch {
    return null
  }
}

function markdownListItems(markdown, headingPattern, limit = 5) {
  const section = markdown.match(new RegExp(`${headingPattern}[\\s\\S]*?(?=\\n## |$)`))?.[0] ?? ''
  return section
    .split('\n')
    .map((line) => line.match(/^-\s+(.+)/)?.[1]?.replace(/\*\*/g, '').trim())
    .filter(Boolean)
    .slice(0, limit)
}

function listMarkdownDates(relativeDir) {
  try {
    const full = path.join(punkRoot, relativeDir)
    return fs.readdirSync(full)
      .filter((file) => file.endsWith('.md'))
      .sort()
      .map((file) => file.replace(/\.md$/, ''))
  } catch {
    return []
  }
}

function daysSince(dateLike) {
  if (!dateLike) return null
  const value = Date.parse(dateLike)
  if (Number.isNaN(value)) return null
  return Math.floor((Date.now() - value) / (1000 * 60 * 60 * 24))
}

function countMatches(input, needle) {
  if (!input || !needle) return 0
  return input.split(needle).length - 1
}

function summarizeFreshness(label, ageDays, staleAfterDays) {
  return {
    label,
    ageDays,
    stale: ageDays === null ? true : ageDays > staleAfterDays,
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function firstMarkdownListItems(markdown, heading) {
  const section = markdown.match(new RegExp(`#### ${heading}[\\s\\S]*?(?=\\n#### |\\n### |\\n## |$)`))?.[0] ?? ''
  return section
    .split('\n')
    .map((line) => line.match(/^-\s+(.+)/)?.[1]?.trim())
    .filter(Boolean)
}

function idealSelfQualities(ideal) {
  const characterItems = firstMarkdownListItems(ideal, 'Character & Habits')
  const gapRows = ideal
    .split('\n')
    .map((line) => line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/))
    .filter(Boolean)
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
    const baseScore = Math.max(3.8, Math.min(7.2, 6.8 - index * 0.45 - (row.current.length > row.ideal.length ? 0.4 : 0)))
    return {
      id: slugify(row.name) || `quality-${index + 1}`,
      name: row.name,
      score: Number(baseScore.toFixed(1)),
      tenMeans: row.ideal,
      nextAction: row.gap || 'Pick one small behavior that proves this today.',
      source: 'Personal Decision Engine / Ideal Self',
    }
  })
}

function extractPreviousGeneratedSections() {
  try {
    const current = fs.readFileSync(outputPath, 'utf8')
    const match = current.match(/export const generatedProjectedSections:[\s\S]*?=\s*(\{[\s\S]*?\})\s+as Partial/)
    if (!match) return {}
    return JSON.parse(match[1])
  } catch {
    return {}
  }
}

function buildIdentityData(previous) {
  const annual = readPunkFile('Personal Decision Engine/Goals/Annual Goals.md')
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const ideal = readPunkFile('Personal Decision Engine/Ideal Self/Ideal Self.md')
  const mission = annual.match(/\*\*2026 Theme:\*\*\s*(.+)/)?.[1] ?? 'Execution'
  const topGoal = goals.match(/### 90-Day Focus \(Q2 2026\)[\s\S]*?1\. \*\*(.+?)\*\*/)?.[1] ?? 'Ship the software'
  const identityStatement = firstMarkdownListItems(ideal, 'Character & Habits')[0] ?? 'Calm, disciplined, focused, and happy every day.'
  const physicalGap = ideal.match(/\| Physical presence \/ energy \|[^\n]+\|[^\n]+\|([^|]+)\|/)?.[1]?.trim().replace(/\[\[|\]\]/g, '') ?? 'Close the physical / energy gap.'
  const socialGap = ideal.match(/\| Social confidence \|[^\n]+\|[^\n]+\|([^|]+)\|/)?.[1]?.trim().replace(/\[\[|\]\]/g, '') ?? 'Rebuild social confidence in the right environment.'
  const qualities = idealSelfQualities(ideal)
  const averageScore = qualities.length ? Number((qualities.reduce((total, item) => total + item.score, 0) / qualities.length).toFixed(1)) : 0
  const today = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }).format(new Date())
  const previousHistory = previous.identity?.identity?.scoreHistory ?? []
  const scoreHistory = [...previousHistory.filter((point) => point.label !== today), { label: today, score: averageScore }].slice(-7)
  const previousQualities = new Map((previous.identity?.identity?.qualities ?? []).map((quality) => [quality.id, quality]))
  const changedQualities = qualities
    .map((quality) => {
      const previousQuality = previousQualities.get(quality.id)
      const delta = previousQuality ? Number((quality.score - previousQuality.score).toFixed(1)) : 0
      return {
        qualityId: quality.id,
        delta,
        reason: previousQuality
          ? `${quality.source} refreshed; current gap: ${quality.nextAction}`
          : `Added from ${quality.source}; current gap: ${quality.nextAction}`,
      }
    })
    .filter((change, index) => change.delta !== 0 || index < 3)
    .slice(0, 3)

  return {
    heroSummary: '',
    summaryCards: [
      { label: 'Current identity statement', value: 'Ideal Self source', note: identityStatement },
      { label: 'Ideal self alignment', value: 'Gap-aware', note: 'The page compares source standards against current gaps.' },
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
      scoreHistory,
      nightlyChanges: changedQualities.length ? changedQualities : [
        { qualityId: qualities[0]?.id ?? 'identity', delta: 0, reason: 'Projection refreshed; no score movement since the previous snapshot.' },
      ],
      lastUpdatedLabel: `Nightly source refresh: ${today}`,
    },
  }
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

function workoutExerciseBlocks(markdown) {
  const section = markdown.match(/## Exercises\s*([\s\S]*?)(?=\n## |$)/)?.[1] ?? ''
  const blocks = []
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

function matchesMuscleTerm(value, term) {
  if (!value || !term) return false
  if (term.length <= 4 && /^[a-z0-9]+$/.test(term)) {
    return new RegExp(`\\b${term}\\b`).test(value)
  }
  return value.includes(term)
}

function buildMuscleHeatmap() {
  const dates = listMarkdownDates('Vessel/Fitness/Workout Logs')
  const today = Date.now()
  const groups = muscleGroupDefinitions.map((group) => ({
    ...group,
    recentSets: 0,
    lastHit: null,
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
    const heat = !group.lastHit
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

function buildVesselData() {
  const fitness = readPunkFile('Vessel/Fitness/Fitness Overview.md')
  const nutrition = readPunkFile('Vessel/Nutrition/Nutrition Overview.md')
  const mental = readPunkFile('Vessel/Mental/Mental Overview.md')
  const looks = readPunkFile('Vessel/Looksmaxxing/Looksmaxxing Overview.md')
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
  const mentalStack = mental.includes('Minimum Viable Mental Health Stack') ? 'Brain dump + breathwork' : 'Mental reset'
  const focusTarget = mental.match(/\| \*\*Time to first distraction\*\* \|[^|]+\|\s*([^|]+?)\s*\|/)?.[1]?.trim() ?? '25+ min'
  const looksFocus = looks.match(/## Current Focus\s*([\s\S]*?)(?=\n---|\n## |$)/)?.[1]
    ?.split('\n')
    .map((line) => line.match(/^-\s+(.+)/)?.[1]?.trim())
    .filter(Boolean)?.[0] ?? 'Practical routine'
  const looksRoutineSignal = looksRoutine.includes('Daily Routine') ? 'Daily grooming system' : 'Appearance system'
  const goingOutItems = (looksRoutine.match(/## Going-Out \/ Event Routine[\s\S]*?(?=\n## |$)/)?.[0] ?? '')
    .split('\n')
    .map((line) => line.match(/^-\s+(.+)/)?.[1]?.replace(/\*\*/g, '').trim())
    .filter(Boolean)
  const looksGoingOutTip = goingOutItems.find((item) => /intentional|hair|beard|outfit/i.test(item)) ?? goingOutItems[0] ?? null
  const looksMorningTip = looksRoutine.match(/### Morning[\s\S]*?-\s+(.+?)(?=\n|$)/)?.[1]?.replace(/\*\*/g, '') ?? null
  const looksQuickTip = looksGoingOutTip ?? looksMorningTip ?? looksFocus
  const muscleGroups = buildMuscleHeatmap()
  const meditationSessionLength = meditationReminderRules.match(/Start with \*\*([^*]+)\*\*/)?.[1] ?? '5-minute sessions'
  const morningReminder = meditationReminderRules.match(/Morning meditation reminder[\s\S]*?- Time:\s+\*\*([^*]+)\*\*/)?.[1]
  const eveningReminder = meditationReminderRules.match(/Evening reset reminder[\s\S]*?- Time:\s+\*\*([^*]+)\*\*/)?.[1]
  const reminderWindows = [morningReminder, eveningReminder].filter(Boolean)
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

function educationDeadlineStatus(dueAt) {
  const due = Date.parse(dueAt)
  if (Number.isNaN(due)) return 'later'
  const daysUntil = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysUntil <= 5) return 'urgent'
  if (daysUntil <= 14) return 'soon'
  return 'later'
}

function parseEasternDeadline(value) {
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

function inferDeadlineKind(title) {
  const lower = title.toLowerCase()
  if (lower.includes('exam')) return 'exam'
  if (lower.includes('quiz')) return 'quiz'
  if (lower.includes('discussion')) return 'discussion'
  if (lower.includes('extra credit')) return 'extra-credit'
  if (lower.includes('report')) return 'report'
  return 'assignment'
}

function buildCareerData() {
  const annualGoals = readPunkFile('Personal Decision Engine/Goals/Annual Goals.md')
  const goalsOverview = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const strategy = readPunkFile('Career/Career Strategy/Career Strategy Overview.md')
  const trajectory = readPunkFile('Career/Career Strategy/Career Trajectory.md')
  const resume = readPunkFile('Career/Resume & CV/Resume Overview.md')
  const jobSearch = readPunkFile('Career/Job Search Tracker/Job Search Overview.md')
  const applications = readPunkFile('Career/Job Search Tracker/Application Log.md')
  const contacts = readPunkFile('Career/Networking/Contact Tracker.md')
  const portfolio = readPunkFile('Career/Projects Portfolio/Portfolio Overview.md')
  const lifeArc = readPunkFile('Career/Projects Portfolio/LifeArc.md')
  const starStories = readPunkFile('Career/Behavioral Interview Prep/STAR Story Bank.md')
  const personalBrand = readPunkFile('Career/Personal Brand/Personal Brand Overview.md')
  const learning = readPunkFile('Career/Skills & Certifications/Learning Roadmap.md')
  const careerGoal = 'Land higher-paying SWE role or negotiate raise'
  const careerLine = annualGoals.split('\n').find((line) => line.includes(careerGoal)) ?? ''
  const fiveYearCareer = 'Georgia Tech MSML completed'
  const longArcLine = goalsOverview.split('\n').find((line) => line.includes(fiveYearCareer)) ?? ''
  const careerParts = careerLine.split('|').map((part) => part.trim()).filter(Boolean)
  const currentStatus = careerParts.length >= 4 ? careerParts[3] : 'In progress'
  const targetRole = strategy.match(/\| Title \|\s*([^|]+)\|/)?.[1]?.trim() ?? 'SWE II / SWE III · Full-Stack · Backend · ML Engineer'
  const compTarget = strategy.match(/\| Comp Target \|\s*([^|]+)\|/)?.[1]?.trim() ?? '$140k-$200k+ TC'
  const currentComp = jobSearch.match(/\*\*Current comp:\*\*\s*([^·\n]+)/)?.[1]?.trim() ?? '~$105k TC'
  const applicationsSent = jobSearch.match(/\| Applications sent \|\s*([^|]+)\|/)?.[1]?.trim() ?? applications.match(/\| Applied \|\s*([^|]+)\|/)?.[1]?.trim() ?? '0'
  const screensScheduled = jobSearch.match(/\| Screens scheduled \|\s*([^|]+)\|/)?.[1]?.trim() ?? '0'
  const targetOfferDate = jobSearch.match(/\| Target offer date \|\s*([^|]+)\|/)?.[1]?.trim() ?? 'Oct 31, 2026'
  const tierCompanyCount = (jobSearch.match(/\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*\[\s*\]\s*Researching/g) ?? []).length
  const starStoryCount = (starStories.match(/^#### Story \d+:/gm) ?? []).length
  const hotContacts = contacts.match(/\| Hot \(active conversation\) \|\s*([^|]+)\|/)?.[1]?.trim() ?? '0'
  const warmContacts = contacts.match(/\| Warm \(had real exchange\) \|\s*([^|]+)\|/)?.[1]?.trim() ?? '0'
  const coldContacts = contacts.match(/\| Cold \(connected, no reply yet\) \|\s*([^|]+)\|/)?.[1]?.trim() ?? '0'
  const linkedinConnections = personalBrand.match(/\| LinkedIn connections \|\s*\*\*([^*]+)\*\*/)?.[1]?.trim() ?? '600'
  const proofActions = [
    resume.includes('Create tailored versions') ? 'resume variants' : '',
    portfolio.includes('Technical blog post') ? 'technical post' : '',
    portfolio.includes('GitHub profile') ? 'GitHub profile' : '',
    personalBrand.includes('LifeArc carousel') ? 'LifeArc carousel' : '',
    lifeArc.includes('architecture diagram') ? 'architecture diagram' : '',
  ].filter(Boolean)
  const learningTracks = [
    learning.includes('Neetcode 150') ? 'DSA' : '',
    learning.includes('System Design') ? 'system design' : '',
    learning.includes('MSML') ? 'MSML' : '',
  ].filter(Boolean).join(' / ')

  return {
    heroSummary: 'Career is a leverage conversion system: package LifeArc and other shipped work into proof, then turn that proof into targeted outreach, interview readiness, and higher-comp role options.',
    summaryCards: [
      { label: 'Career arc', value: currentStatus || 'AI/ML product lead', note: trajectory.includes('Founding Engineer') ? 'Founding Engineer to Project Lead with full-stack, infra, and ML ownership.' : careerGoal },
      { label: 'Comp / role target', value: compTarget, note: `${currentComp} current baseline; target role is ${targetRole}.` },
      { label: 'Flagship proof', value: 'LifeArc', note: lifeArc.includes('100+ medical records per week') ? 'HIPAA AI platform, 100+ records/week, 70-90% faster review, $10-$100 internal run cost.' : 'LifeArc remains the centerpiece proof asset.' },
      { label: 'Proof packaging', value: `${proofActions.length} open asset lanes`, note: proofActions.length ? `Next assets: ${proofActions.slice(0, 4).join(', ')}.` : 'Resume, portfolio, LinkedIn, GitHub, and diagrams need upkeep.' },
      { label: 'Pipeline status', value: `${applicationsSent} apps / ${screensScheduled} screens`, note: `${tierCompanyCount || 10} target companies visible; target offer date ${targetOfferDate}.` },
      { label: 'Networking CRM', value: `${hotContacts} hot / ${warmContacts} warm / ${coldContacts} cold`, note: 'Contact tracker is the referral and follow-up source of truth.' },
      { label: 'Interview readiness', value: `${starStoryCount || 7} STAR stories`, note: learningTracks ? `Active prep lanes: ${learningTracks}.` : 'Track DSA, system design, and behavioral practice together.' },
      { label: 'Brand visibility', value: `${linkedinConnections} LinkedIn connections`, note: 'Personal brand notes track LinkedIn, portfolio, GitHub, recruiter DMs, and recommendations.' },
      { label: 'Credential path', value: 'Georgia Tech MSML', note: longArcLine || 'MSML is the long-arc ML differentiator, not a reason to wait.' },
    ],
    highlights: [
      'LifeArc is the lead proof asset and should appear in resume, portfolio, STAR stories, LinkedIn, and interview narratives.',
      'Job search execution should stay targeted: 20-30 strong companies, warm outreach first, applications in waves.',
      'Readiness is a stack: proof packaging, networking, DSA, system design, behavioral stories, and personal brand need to move together.',
    ],
    freshness: summarizeFreshness('Career planning docs', 0, 30),
    blockers: [
      { label: 'Pipeline not active', value: `${applicationsSent} applications`, detail: 'Application Log and Job Search Overview show the search has not produced active screens yet.', severity: 'watch' },
      { label: 'Networking gap', value: `${hotContacts} hot contacts`, detail: 'Contact Tracker starts from zero, so warm outreach/referrals are the clearest missing channel.', severity: 'watch' },
      { label: 'Packaging gap', value: `${proofActions.length} asset lanes`, detail: 'Strong proprietary work needs public-safe proof assets: resume bullets, STAR stories, diagrams, case studies, and profile updates.', severity: 'watch' },
    ],
    missingData: [
      { label: 'Live readiness scores', value: 'Manual sources only', detail: 'Resume variants, GitHub profile, portfolio visits, LinkedIn views, DSA reps, and system-design reps are not yet structured as dated metrics.', severity: 'stale' },
      { label: 'Application activity', value: 'No dated entries', detail: 'Application Log has templates but no real company entries yet.', severity: 'watch' },
    ],
    timeline: [
      { label: 'Search kickoff', detail: 'Job Search Overview marks the search as preparing and applying.', recency: 'Apr 1, 2026', severity: 'watch' },
      { label: 'Offer deadline', detail: 'The target process should produce an offer before the hard deadline.', recency: targetOfferDate, severity: 'watch' },
      { label: 'MSML horizon', detail: 'Georgia Tech MSML remains the long-arc ML credential.', recency: 'Expected 2027', severity: 'good' },
    ],
  }
}

function educationDeadlinesFromCourse(markdown, courseCode, courseName) {
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
    .filter(Boolean)
    .filter((deadline) => Date.parse(deadline.dueAt) >= Date.now() - (24 * 60 * 60 * 1000))
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
}

function buildEducationData() {
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const gtOverview = readPunkFile('School/Masters GT/GT Overview.md')
  const currentCourses = readPunkFile('School/School/Current Courses.md')
  const machineLearning = readPunkFile('School/Masters GT/Courses/Machine Learning/CS7641 Machine Learning Overview.md')
  const degreeLine = goals.split('\n').find((line) => line.includes('Georgia Tech MSML completed')) ?? ''
  const activeCourseLine = currentCourses.match(/\|\s*(CS7641 Machine Learning)\s*\|[^|]+\|\s*([^|]+?)\s*\|/) ?? gtOverview.match(/\|\s*(CS7641 — Machine Learning)\s*\|[^|]+\|\s*([^|]+?)\s*\|/)
  const activeCourse = activeCourseLine?.[1]?.replace(' — ', ' ') ?? 'CS7641 Machine Learning'
  const activeCourseStatus = activeCourseLine?.[2]?.trim() ?? 'In progress — Summer 2026'
  const urgentDeadlines = educationDeadlinesFromCourse(machineLearning, 'CS7641', 'Machine Learning')

  const coursePlan = [
    { code: 'CS 8803 O17', name: 'Global Entrepreneurship', term: 'Spring 2026', status: 'taken', role: 'free-elective', difficulty: 3, why: 'Product and venture context already counted in the 10-course plan.' },
    { code: 'CS 6310', name: 'Software Architecture & Design', term: 'Spring 2026', status: 'taken', role: 'free-elective', difficulty: 4, why: 'Useful architecture base for agent systems and scalable product work.' },
    { code: 'CS 7641', name: 'Machine Learning', term: 'Summer 2026', status: 'active', role: 'core', difficulty: 8, why: 'Required ML core and foundation for later ML electives.' },
    { code: 'CS 6515', name: 'Intro to Graduate Algorithms', term: 'Fall 2026', status: 'planned', role: 'core', difficulty: 9, why: 'Degree-safe algorithms anchor and hard thinking course.' },
    { code: 'CS 6400', name: 'Database Systems Concepts and Design', term: 'Fall 2026', status: 'planned', role: 'free-elective', difficulty: 5, why: 'High ROI for agent memory, state, retrieval, logs, and persistence.' },
    { code: 'CS 7643', name: 'Deep Learning', term: 'Spring 2027', status: 'planned', role: 'ml-elective', difficulty: 8, why: 'Strong modern AI depth.' },
    { code: 'CS 6250', name: 'Computer Networks', term: 'Spring 2027', status: 'planned', role: 'free-elective', difficulty: 6, why: 'Useful infrastructure and service-communication foundation.' },
    { code: 'CS 7650', name: 'Natural Language Processing', term: 'Summer 2027', status: 'planned', role: 'ml-elective', difficulty: 7, why: 'Directly relevant to agents and language-mediated workflows.' },
    { code: 'CS 7646', name: 'Machine Learning for Trading', term: 'Fall 2027', status: 'planned', role: 'ml-elective', difficulty: 6, why: 'Applied ML elective with finance relevance.' },
    { code: 'CS 6200', name: 'Introduction to Operating Systems', term: 'Fall 2027', status: 'planned', role: 'free-elective', difficulty: 7, why: 'Systems intuition for orchestration, processes, and resource management.' },
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
      planNote: 'The default map favors ML core requirements plus agent-builder systems depth. Use alternatives when workload, specialization fit, or interests change.',
    },
  }
}

const previous = extractPreviousGeneratedSections()
const generatedProjectedSections = {
  identity: buildIdentityData(previous),
  vessel: buildVesselData(),
  systems: previous.systems,
  ventures: previous.ventures,
  career: buildCareerData(),
  knowledge: previous.knowledge,
  wealth: previous.wealth,
  education: buildEducationData(),
  relationships: previous.relationships,
}

const serialized = JSON.stringify(generatedProjectedSections, null, 2)
const output = `import type { PersonalProjectionKey } from '../data/personalProjectionClient'
import { attachProjectedDashboard } from '../data/projectedDashboardModel'
import type { ProjectedSection } from '../data/projectedTypes'

export const generatedProjectedSections: Partial<Record<PersonalProjectionKey, ProjectedSection>> = ${serialized} as Partial<Record<PersonalProjectionKey, ProjectedSection>>

export function getGeneratedProjectedSection(key: PersonalProjectionKey): ProjectedSection | null {
  const section = generatedProjectedSections[key]
  return section ? attachProjectedDashboard(key, section) : null
}
`

fs.writeFileSync(outputPath, output)
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`)
