import fs from 'node:fs'
import path from 'node:path'

export type ProjectedCard = {
  label: string
  value: string
  note: string
  stale?: boolean
}

export type ProjectedSection = {
  heroSummary: string
  summaryCards: ProjectedCard[]
  highlights: string[]
}

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

export function buildVesselData(): ProjectedSection {
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
      { label: 'Workout consistency', value: workoutDate ? `Last logged ${workoutDate}` : 'No recent log', note: workoutDate ? `${workoutAge} days since latest workout evidence.` : 'Workout log needs evidence.', stale: (workoutAge ?? 999) > 4 },
      { label: 'Nutrition consistency', value: nutritionDate ? `Last logged ${nutritionDate}` : 'No recent log', note: nutritionDate ? `${nutritionAge} days since latest nutrition evidence.` : 'Nutrition log needs evidence.', stale: (nutritionAge ?? 999) > 3 },
      { label: 'Sleep / recovery', value: 'Best-effort projection', note: 'Sleep and recovery will infer status until direct sleep/recovery parsers are added.', stale: true },
      { label: 'Mental state / discipline', value: 'Consistency > intensity', note: 'Current philosophy emphasizes making 3 sessions/week automatic first.' },
      { label: 'Current physique goal', value: `${targetWeight} lb`, note: 'Lean, defined, and preserving muscle rather than swingy crash dieting.' },
    ],
    highlights: [
      `Latest workout evidence: ${workoutDate ?? 'missing'}`,
      `Latest nutrition evidence: ${nutritionDate ?? 'missing'}`,
      activeDirection,
    ],
  }
}

export function buildIdentityData(): ProjectedSection {
  const annual = readPunkFile('Personal Decision Engine/Goals/Annual Goals.md')
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const ideal = readPunkFile('Personal Decision Engine/Ideal Self/Ideal Self.md')
  const mission = annual.match(/\*\*2026 Theme:\*\*\s*(.+)/)?.[1] ?? 'Execution'
  const topGoal = goals.match(/### 90-Day Focus \(Q2 2026\)[\s\S]*?1\. \*\*(.+?)\*\*/)?.[1] ?? 'Ship the software'
  const identityStatement = ideal.match(/#### Character & Habits[\s\S]*?- (.+)/)?.[1] ?? 'Calm, disciplined, focused, and happy every day.'
  const physicalGap = ideal.match(/\| Physical presence \/ energy \|[^\n]+\|[^\n]+\|([^|]+)\|/)?.[1]?.trim() ?? 'Close the physical / energy gap.'
  const socialGap = ideal.match(/\| Social confidence \|[^\n]+\|[^\n]+\|([^|]+)\|/)?.[1]?.trim() ?? 'Rebuild social confidence in the right environment.'

  return {
    heroSummary: `Identity is currently grounded in the ${mission} year theme, with ${topGoal.toLowerCase()} as the immediate mission and the ideal self acting as the compass.`,
    summaryCards: [
      { label: 'Current identity statement', value: 'Execution-era self', note: identityStatement },
      { label: 'Ideal self alignment', value: 'Gap-aware', note: 'The ideal self is treated as a grounded compass, not fantasy.' },
      { label: 'Current mission / year theme', value: mission, note: `Current top mission: ${topGoal}.` },
      { label: 'Top active goals', value: topGoal, note: 'Pulled from 90-day focus and annual goals.' },
      { label: 'Current dilemmas / blockers', value: 'Environment + consistency', note: socialGap },
      { label: 'Recent lessons / growth', value: 'Bridge current self to ideal self', note: physicalGap },
    ],
    highlights: [
      `Year theme: ${mission}`,
      `Top mission: ${topGoal}`,
      'Ideal Self, Goals Overview, and Annual Goals are the main identity anchors.',
    ],
  }
}

export function buildSystemsData(): ProjectedSection {
  const operations = readPunkFile('Operations/Operations Task Board.md')
  const ventures = readPunkFile('High ROI Ventures/Ventures MOC.md')
  const openItems = countMatches(operations, '- [ ]')
  const completedItems = countMatches(operations, '- [x]')
  const ventureMentions = countMatches(ventures, '\n- ')

  return {
    heroSummary: `Systems is grounded in the Operations Task Board with ${openItems} open checklist items currently visible and ${completedItems} completed ones captured in the source note.`,
    summaryCards: [
      { label: 'Operations board', value: `${openItems} open`, note: 'Derived from checklist items in Operations Task Board.' },
      { label: 'Closed loops', value: `${completedItems} completed`, note: 'Completed checklist count from the same operating board.' },
      { label: 'Venture surface area', value: `${ventureMentions} listed lines`, note: 'Quick proxy for active venture inventory in Ventures MOC.' },
      { label: 'Automation posture', value: 'Manual + AI-assisted', note: 'Current systems layer is still hybrid, not fully automated yet.' },
      { label: 'Operating principle', value: 'Capture > clarify > execute', note: 'The goal is a practical operations layer, not a decorative dashboard.' },
      { label: 'Current systems need', value: 'Better live rollups', note: 'This page is now ready for richer projection modules beyond simple counts.', stale: true },
    ],
    highlights: [
      'Operations Task Board is the main systems anchor.',
      'Ventures MOC helps expose cross-project surface area.',
      'This page should evolve into the daily operational command layer.',
    ],
  }
}

export function buildVenturesData(): ProjectedSection {
  const ventures = readPunkFile('High ROI Ventures/Ventures MOC.md')
  const annualGoals = readPunkFile('Personal Decision Engine/Goals/Annual Goals.md')
  const bulletCount = countMatches(ventures, '\n- ')
  const inProgressCount = countMatches(annualGoals.toLowerCase(), 'in progress')

  return {
    heroSummary: `Ventures is currently a portfolio view with ${bulletCount} venture bullets visible in the Ventures MOC and ${inProgressCount} explicit in-progress markers across annual goals.`,
    summaryCards: [
      { label: 'Portfolio inventory', value: `${bulletCount} listed bullets`, note: 'Fast proxy for how much venture surface area exists in the current note set.' },
      { label: 'Current priority posture', value: 'Execution over ideation', note: 'Annual goals emphasize shipping and traction, not endless exploration.' },
      { label: 'In-progress venture goals', value: `${inProgressCount} in progress`, note: 'Pulled from the annual goals source note.' },
      { label: 'Capital deployment stance', value: 'Selective', note: 'This control center should eventually expose ROI-ranked moves, not just inventories.' },
      { label: 'Biggest operating need', value: 'Priority compression', note: 'Reduce surface area and make the next best move obvious.' },
      { label: 'Current blocker visibility', value: 'Improving', note: 'Business Command will complement this page with live operational blockers.' },
    ],
    highlights: [
      'Ventures MOC remains the personal strategy-side anchor.',
      'Annual goals provide the immediate venture pressure.',
      'This page should stay distinct from Business Command live ops.',
    ],
  }
}
