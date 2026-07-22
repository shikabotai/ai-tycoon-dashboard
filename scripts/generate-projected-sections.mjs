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
    heroSummary: 'Identity tracks the standards from Ideal Self, the gaps that still need work, and the active goal most likely to prove it today.',
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

function buildVesselData() {
  const fitness = readPunkFile('Vessel/Fitness/Fitness Overview.md')
  const nutrition = readPunkFile('Vessel/Nutrition/Nutrition Overview.md')
  const workoutDate = latestMarkdownDate('Vessel/Fitness/Workout Logs')
  const nutritionDate = latestMarkdownDate('Vessel/Nutrition/Daily Logs')
  const workoutAge = daysSince(workoutDate)
  const nutritionAge = daysSince(nutritionDate)
  const currentWeight = fitness.match(/\| Weight \| ~?(\d+)/)?.[1] ?? '—'
  const targetWeight = fitness.match(/\| Weight \| .*?\| (\d+[-–]\d+) lbs by September \|/)?.[1] ?? '145–148'
  const activeDirection = nutrition.match(/\*\*Active direction:\*\*\s*(.+)/)?.[1] ?? 'Cut / recomp'

  return {
    heroSummary: `Current body system is in a ${activeDirection.toLowerCase()} phase with ${currentWeight} lb as the latest working reference and a target range of ${targetWeight} lb by September.`,
    summaryCards: [
      { label: 'Weight / body metrics', value: `${currentWeight} lb`, note: `Target ${targetWeight} lb by September from Fitness Overview.` },
      { label: 'Workout consistency', value: workoutDate ? `Last logged ${workoutDate}` : 'Awaiting workout log', note: workoutDate ? `${workoutAge} days since latest workout evidence.` : 'Workout evidence has not reached the control center yet.', stale: (workoutAge ?? 999) > 4 },
      { label: 'Nutrition consistency', value: nutritionDate ? `Last logged ${nutritionDate}` : 'Awaiting nutrition log', note: nutritionDate ? `${nutritionAge} days since latest nutrition evidence.` : 'Nutrition evidence has not reached the control center yet.', stale: (nutritionAge ?? 999) > 3 },
      { label: 'Sleep / recovery', value: 'Best-effort projection', note: 'Sleep and recovery are estimated until direct recovery evidence is available.', stale: true },
      { label: 'Mental state / discipline', value: 'Consistency > intensity', note: 'Current philosophy emphasizes making 3 sessions/week automatic first.' },
      { label: 'Current physique goal', value: `${targetWeight} lb`, note: 'Lean, defined, and preserving muscle rather than swingy crash dieting.' },
    ],
    highlights: [
      `Latest workout evidence: ${workoutDate ?? 'missing'}`,
      `Latest nutrition evidence: ${nutritionDate ?? 'missing'}`,
      activeDirection,
    ],
    freshness: summarizeFreshness('Vessel evidence', Math.min(workoutAge ?? 999, nutritionAge ?? 999), 4),
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
