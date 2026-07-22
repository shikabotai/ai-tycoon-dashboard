import fs from 'node:fs'
import path from 'node:path'
import type { ProjectedSection } from './projectedTypes'

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

function summarizeFreshness(label: string, ageDays: number | null, staleAfterDays: number) {
  return {
    label,
    ageDays,
    stale: ageDays === null ? true : ageDays > staleAfterDays,
  }
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
    heroSummary: `Identity tracks the standards you are trying to live, the gaps that still need work, and the active goal most likely to prove it today.`,
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

export function buildEducationData(): ProjectedSection {
  const goals = readPunkFile('Personal Decision Engine/Goals/Goals Overview.md')
  const degreeLine = goals.split('\n').find((line) => line.includes('Georgia Tech MSML completed')) ?? ''

  return {
    heroSummary: 'Education is a supporting but serious track, centered on completing the Georgia Tech MSML path while balancing career and execution priorities.',
    summaryCards: [
      { label: 'Current program / course load', value: 'Georgia Tech MSML', note: degreeLine || 'The 5-year goals note keeps this degree path visible.' },
      { label: 'Current courses', value: 'Pending academic source', note: 'Course-level data and deadlines need a dedicated academic source before they appear here.', stale: true },
      { label: 'Upcoming deadlines', value: 'Pending academic source', note: 'Course-level timing needs a dedicated academic source before it appears here.', stale: true },
      { label: 'Progress / completion status', value: 'In progress', note: 'The education track is active, not complete.' },
      { label: 'Current learning focus', value: 'ML credibility + execution balance', note: 'Education supports long-term positioning and practical leverage.' },
      { label: 'Academic priority level', value: 'Important but not primary', note: 'Current active life priorities still lean heavily toward execution and leverage.' },
    ],
    highlights: [
      'Education stays visible without dominating the control center.',
      'The next layer is live academic detail and concrete milestones.',
      'Current projection keeps the long-arc program in view.',
    ],
    freshness: summarizeFreshness('Education planning docs', 0, 45),
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
