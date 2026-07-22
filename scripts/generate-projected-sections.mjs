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
  const workoutDate = latestMarkdownDate('Vessel/Fitness/Workout Logs')
  const nutritionDate = latestMarkdownDate('Vessel/Nutrition/Daily Logs')
  const latestWorkout = workoutDate ? readPunkFile(`Vessel/Fitness/Workout Logs/${workoutDate}.md`) : ''
  const latestNutrition = nutritionDate ? readPunkFile(`Vessel/Nutrition/Daily Logs/${nutritionDate}.md`) : ''
  const workoutAge = daysSince(workoutDate)
  const nutritionAge = daysSince(nutritionDate)
  const currentWeight = fitness.match(/\| Weight \| ~?(\d+)/)?.[1] ?? '—'
  const targetWeight = fitness.match(/\| Weight \| .*?\| (\d+[-–]\d+) lbs by September \|/)?.[1] ?? '145–148'
  const activeDirection = (nutrition.match(/\*\*Active direction:\*\*\s*(.+)/)?.[1] ?? 'Cut / recomp').replace(/\.$/, '')
  const nextSession = latestWorkout.match(/Next session:\s*(.+)/)?.[1]?.replace(/\.$/, '') ?? 'Choose the next lift from the split'
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

  return {
    heroSummary: `A simple daily dashboard for the four Vessel levers: lift consistently, hit the food log, reset attention, and keep presentation sharp.`,
    summaryCards: [
      { label: 'Weight / body metrics', value: `${currentWeight} lb`, note: `Target ${targetWeight} lb by September from Fitness Overview.` },
      { label: 'Workout consistency', value: workoutDate ? `Last logged ${workoutDate}` : 'Awaiting workout log', note: workoutDate ? `${workoutAge} days since latest lift. Next: ${nextSession}.` : 'Workout evidence has not reached the control center yet.', stale: (workoutAge ?? 999) > 4 },
      { label: 'Nutrition consistency', value: nutritionDate ? `${latestProtein ? `${latestProtein}g protein` : `Logged ${nutritionDate}`}` : 'Awaiting nutrition log', note: nutritionDate ? `${latestCalories ? `${latestCalories} kcal logged. ` : ''}${nutritionAge} days since latest nutrition evidence.` : 'Nutrition evidence has not reached the control center yet.', stale: (nutritionAge ?? 999) > 3 },
      { label: 'Mental reset', value: mentalStack, note: 'Minimum viable stack: 5-minute brain dump, short breathing reset, and a real shutdown ritual.' },
      { label: 'Looksmaxxing', value: looksRoutineSignal, note: `Quick tip: ${looksQuickTip}` },
      { label: 'Focus / attention', value: focusTarget, note: 'Treat focus like a lift: measure time to first distraction and protect deep-work blocks.', stale: true },
      { label: 'Current physique goal', value: `${targetWeight} lb`, note: 'Lean, defined, and preserving muscle rather than swingy crash dieting.' },
      { label: 'Sleep / recovery', value: 'Best-effort projection', note: 'Sleep and recovery are estimated until direct recovery evidence is available.', stale: true },
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
    },
  }
}

const previous = extractPreviousGeneratedSections()
const generatedProjectedSections = {
  identity: buildIdentityData(previous),
  vessel: buildVesselData(),
  systems: previous.systems,
  ventures: previous.ventures,
  career: previous.career,
  knowledge: previous.knowledge,
  wealth: previous.wealth,
  education: previous.education,
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
