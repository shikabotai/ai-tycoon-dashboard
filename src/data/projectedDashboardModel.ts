import type { PersonalProjectionKey } from './personalProjectionClient'
import type { ProjectedContextItem, ProjectedDashboard, ProjectedSection, ProjectedSignalPriority, ProjectedTimelineItem } from './projectedTypes'

export const projectedDashboardModel: Partial<Record<PersonalProjectionKey, ProjectedDashboard>> = {
  vessel: {
    headline: 'Body system operating board',
    metrics: [
      { label: 'Body target', sourceCardIndex: 0, priority: 'good' },
      { label: 'Training recency', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Nutrition recency', sourceCardIndex: 2, priority: 'good' },
      { label: 'Recovery coverage', sourceCardIndex: 3, priority: 'stale' },
    ],
    operatingRows: [
      { title: 'Cut / recomp lane', body: 'Keep the page oriented around controlled body composition progress.', sourceCardIndex: 5 },
      { title: 'Training rhythm', body: 'Workout logs are the lead evidence source for consistency.', sourceCardIndex: 1 },
      { title: 'Nutrition compliance', body: 'Food logging stays paired with the weight target.', sourceCardIndex: 2 },
      { title: 'Recovery gap', body: 'Sleep and recovery remain a known data gap until a direct source is connected.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Fitness Overview', body: 'Anchors weight, physique goal, and body-system direction.', sourceCardIndex: 0 },
      { title: 'Workout Logs', body: 'Shows the last training evidence and cadence.', sourceCardIndex: 1 },
      { title: 'Nutrition Daily Logs', body: 'Shows food-tracking recency and consistency.', sourceCardIndex: 2 },
    ],
    actionRows: [
      { title: 'Protect the next workout', body: 'Make the next lift the first correction when training drifts.', sourceCardIndex: 1 },
      { title: 'Keep food logs current', body: 'Treat stale nutrition data as the blocker.', sourceCardIndex: 2 },
      { title: 'Add recovery source', body: 'Connect sleep, energy, or readiness evidence.', sourceCardIndex: 3 },
    ],
  },
  identity: {
    headline: 'Mission and alignment board',
    metrics: [
      { label: 'Identity statement', sourceCardIndex: 0, priority: 'good' },
      { label: 'Alignment gap', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Year theme', sourceCardIndex: 2, priority: 'good' },
      { label: 'Top mission', sourceCardIndex: 3, priority: 'good' },
    ],
    operatingRows: [
      { title: 'Execution-era self', body: 'Frame identity around daily execution and emotional steadiness.', sourceCardIndex: 0 },
      { title: 'Mission priority', body: 'Keep the year theme and 90-day focus above lower-priority pulls.', sourceCardIndex: 2 },
      { title: 'Ideal-self gap', body: 'Use the ideal self to expose gaps worth closing.', sourceCardIndex: 1 },
      { title: 'Decision pressure', body: 'Environment, consistency, and energy gaps belong here when they influence choices.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ideal Self', body: 'Compass for character, habits, presence, and confidence.', sourceCardIndex: 0 },
      { title: 'Goals Overview', body: 'Supplies the immediate mission.', sourceCardIndex: 3 },
      { title: 'Annual Goals', body: 'Keeps the current year theme visible.', sourceCardIndex: 2 },
    ],
    actionRows: [
      { title: 'Choose from alignment', body: 'Favor moves that reduce the current-self to ideal-self gap.', sourceCardIndex: 1 },
      { title: 'Defend the top mission', body: 'Protect the lead active goal first.', sourceCardIndex: 3 },
      { title: 'Name the blocker', body: 'Turn friction into a concrete next move.', sourceCardIndex: 4 },
    ],
  },
  systems: {
    headline: 'Life operations command board',
    metrics: [
      { label: 'Open loops', sourceCardIndex: 0, priority: 'watch' },
      { label: 'Closed loops', sourceCardIndex: 1, priority: 'good' },
      { label: 'Surface area', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Automation posture', sourceCardIndex: 3, priority: 'good' },
    ],
    operatingRows: [
      { title: 'Task-board pressure', body: 'Operations Task Board is the capture and clarification source.', sourceCardIndex: 0 },
      { title: 'Closed-loop rate', body: 'Completed items prove the system is moving.', sourceCardIndex: 1 },
      { title: 'Venture surface area', body: 'Cross-project sprawl stays visible here.', sourceCardIndex: 2 },
      { title: 'Automation layer', body: 'AI support should reduce loops while preserving approval boundaries.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Operations Task Board', body: 'Primary source for checklist pressure.', sourceCardIndex: 0 },
      { title: 'Ventures MOC', body: 'Proxy for project surface area.', sourceCardIndex: 2 },
      { title: 'Business Command boundary', body: 'Live business execution stays separate from personal systems.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Clarify one open loop', body: 'Turn the most ambiguous item into a decision, action, or deletion.', sourceCardIndex: 0 },
      { title: 'Compress surface area', body: 'Use venture inventory as a warning when too many lines compete.', sourceCardIndex: 2 },
      { title: 'Upgrade live rollups', body: 'Improve structured rollups in the next source pass.', sourceCardIndex: 5 },
    ],
  },
  ventures: {
    headline: 'Portfolio strategy board',
    metrics: [
      { label: 'Portfolio inventory', sourceCardIndex: 0, priority: 'watch' },
      { label: 'Priority posture', sourceCardIndex: 1, priority: 'good' },
      { label: 'Active venture goals', sourceCardIndex: 2, priority: 'good' },
      { label: 'Blocker visibility', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Strategy, not live ops', body: 'Decide which venture lines deserve attention here; execute in Business Command.', sourceCardIndex: 0 },
      { title: 'Execution posture', body: 'Favor shipping and traction over new idea sprawl.', sourceCardIndex: 1 },
      { title: 'Goal pressure', body: 'Annual venture goals are the current pressure signal.', sourceCardIndex: 2 },
      { title: 'Priority compression', body: 'Reduce the portfolio into the next meaningful decision.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ventures MOC', body: 'Primary source for personal venture inventory.', sourceCardIndex: 0 },
      { title: 'Annual goals', body: 'Provides in-progress venture pressure.', sourceCardIndex: 2 },
      { title: 'Business boundary', body: 'Live blockers stay separate from personal strategy.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Name the priority venture', body: 'Pick the line with the best momentum, upside, and urgency.', sourceCardIndex: 4 },
      { title: 'Route live work to Business Command', body: 'Move execution decisions to the operations surface.', sourceCardIndex: 5 },
      { title: 'Add ROI ranking', body: 'Rank moves by leverage, cost, and expected return.', sourceCardIndex: 3 },
    ],
  },
  career: {
    headline: 'Trajectory and leverage board',
    metrics: [
      { label: 'Trajectory', sourceCardIndex: 0, priority: 'good' },
      { label: 'Primary goal', sourceCardIndex: 1, priority: 'good' },
      { label: 'Credential path', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Next milestone', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Income leverage lane', body: 'Focus on stronger role leverage and compensation.', sourceCardIndex: 1 },
      { title: 'Portfolio readiness', body: 'Turn shipped work into interview and negotiation proof.', sourceCardIndex: 5 },
      { title: 'Long-arc ML position', body: 'Use MSML progress as a compounding technical lever.', sourceCardIndex: 2 },
      { title: 'Opportunity filter', body: 'Judge opportunities by leverage, learning, compensation, and fit.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Annual goals', body: 'Supplies the raise / SWE role objective.', sourceCardIndex: 1 },
      { title: 'Five-year direction', body: 'Keeps the MSML and machine-learning arc visible.', sourceCardIndex: 2 },
      { title: 'Portfolio gap', body: 'Needs direct resume, repo, and interview cadence evidence.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Package shipped proof', body: 'Create a portfolio entry, resume bullet, and interview story.', sourceCardIndex: 5 },
      { title: 'Protect the comp move', body: 'Keep the higher-paying role objective visible.', sourceCardIndex: 1 },
      { title: 'Track interview readiness', body: 'Add readiness scoring when source data exists.', sourceCardIndex: 5 },
    ],
  },
  wealth: {
    headline: 'Capital strategy board',
    metrics: [
      { label: 'Financial priority', sourceCardIndex: 0, priority: 'good' },
      { label: 'Cashflow stance', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Wealth engines', sourceCardIndex: 3, priority: 'good' },
      { label: 'Data blind spot', sourceCardIndex: 4, priority: 'stale' },
    ],
    operatingRows: [
      { title: 'Earn-more-first strategy', body: 'Income growth and venture upside are the main capital levers.', sourceCardIndex: 1 },
      { title: 'Engine pairing', body: 'Career and ventures are the lead wealth engines.', sourceCardIndex: 3 },
      { title: 'Selective accumulation', body: 'Avoid over-optimizing small choices while bigger levers are open.', sourceCardIndex: 2 },
      { title: 'Visibility gap', body: 'Live net-worth, cash, and spending data are not connected yet.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Planning docs', body: 'Financial direction comes from goals and strategy notes.', sourceCardIndex: 0 },
      { title: 'Career and venture signals', body: 'Main multipliers are compensation and business traction.', sourceCardIndex: 3 },
      { title: 'Missing finance feed', body: 'Direct account data is needed for a precise scoreboard.', sourceCardIndex: 4 },
    ],
    actionRows: [
      { title: 'Prioritize leverage', body: 'Favor earning power, durable upside, and recurring surplus.', sourceCardIndex: 0 },
      { title: 'Add live scoreboard source', body: 'Connect balance, cashflow, and obligation sources.', sourceCardIndex: 4 },
      { title: 'Tie spend to strategy', body: 'Show whether spending supports career, health, or venture leverage.', sourceCardIndex: 5 },
    ],
  },
  education: {
    headline: 'Program and learning execution board',
    metrics: [
      { label: 'Program', sourceCardIndex: 0, priority: 'good' },
      { label: 'Strategic value', sourceCardIndex: 1, priority: 'good' },
      { label: 'Tradeoff', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Risk', sourceCardIndex: 4, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Credential as leverage', body: 'Education supports the ML path and career leverage.', sourceCardIndex: 1 },
      { title: 'Execution balance', body: 'Keep study depth visible without crowding shipping momentum.', sourceCardIndex: 2 },
      { title: 'Overload watch', body: 'Risk rises when too many active fronts compete.', sourceCardIndex: 4 },
      { title: 'Milestone gap', body: 'Courses, deadlines, and checkpoints need structured source data.', sourceCardIndex: 5 },
    ],
    evidenceRows: [
      { title: 'Georgia Tech MSML', body: 'Primary academic anchor.', sourceCardIndex: 0 },
      { title: 'Career linkage', body: 'Education ties directly to future ML positioning.', sourceCardIndex: 1 },
      { title: 'Missing deadline feed', body: 'Needs direct course/deadline evidence.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Protect the study lane', body: 'Make the next academic checkpoint explicit.', sourceCardIndex: 5 },
      { title: 'Balance depth and shipping', body: 'Choose study moves that preserve execution momentum.', sourceCardIndex: 2 },
      { title: 'Add course checkpoints', body: 'Expose courses, deliverables, due dates, and status.', sourceCardIndex: 5 },
    ],
  },
  knowledge: {
    headline: 'Decision-support knowledge board',
    metrics: [
      { label: 'Learning domains', sourceCardIndex: 0, priority: 'good' },
      { label: 'Mental models', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Recent knowledge', sourceCardIndex: 2, priority: 'stale' },
      { label: 'Gap to close', sourceCardIndex: 5, priority: 'stale' },
    ],
    operatingRows: [
      { title: 'Knowledge for action', body: 'Improve decisions instead of becoming an archive.', sourceCardIndex: 0 },
      { title: 'Model extraction', body: 'Surface mental models as reusable decision tools.', sourceCardIndex: 1 },
      { title: 'Reference hierarchy', body: 'Goals and identity notes are the strongest current references.', sourceCardIndex: 3 },
      { title: 'Recency gap', body: 'Recent additions are not yet projected.', sourceCardIndex: 2 },
    ],
    evidenceRows: [
      { title: 'Strategic notes', body: 'Current strength is goals, identity, and planning material.', sourceCardIndex: 3 },
      { title: 'Reading goal', body: 'Active reading target supplies one learning signal.', sourceCardIndex: 4 },
      { title: 'Knowledge rollup gap', body: 'Needs deeper traversal of knowledge-side sources.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Extract one usable model', body: 'Turn a note into a decision rule or checklist.', sourceCardIndex: 1 },
      { title: 'Connect recency', body: 'Add latest-note and latest-reference timestamps.', sourceCardIndex: 2 },
      { title: 'Tie reading to action', body: 'Use reading only when it produces clearer choices.', sourceCardIndex: 4 },
    ],
  },
  relationships: {
    headline: 'Connection and care board',
    metrics: [
      { label: 'Relationship posture', sourceCardIndex: 0, priority: 'good' },
      { label: 'Care focus', sourceCardIndex: 1, priority: 'good' },
      { label: 'Growth edge', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Privacy boundary', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Care without oversharing', body: 'Keep direction useful without exposing unnecessary private detail.', sourceCardIndex: 0 },
      { title: 'Family and future partner path', body: 'Show who and what needs attention, not raw diary content.', sourceCardIndex: 1 },
      { title: 'Social positioning', body: 'Confidence, environment, and consistent exposure are current levers.', sourceCardIndex: 2 },
      { title: 'Context fit', body: 'Treat blocker as an environment and exposure problem.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Planning layer', body: 'Evidence is directional; raw relationship logs should stay minimal.', sourceCardIndex: 0 },
      { title: 'Identity connection', body: 'Social confidence links back to Identity.', sourceCardIndex: 2 },
      { title: 'Privacy rule', body: 'Summarize patterns before rendering sensitive material.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Choose one care action', body: 'Make the next move concrete and respectful.', sourceCardIndex: 1 },
      { title: 'Improve environment fit', body: 'Prioritize contexts that make good connection more likely.', sourceCardIndex: 3 },
      { title: 'Keep the page minimal', body: 'Future integrations should summarize, not expose raw notes.', sourceCardIndex: 5 },
    ],
  },
}

function severityFromCard(stale?: boolean): ProjectedSignalPriority {
  return stale ? 'stale' : 'watch'
}

function deriveMissingData(section: ProjectedSection): ProjectedContextItem[] {
  if (section.missingData) return section.missingData
  return section.summaryCards
    .filter((card) => card.stale || /pending|missing|not yet|awaiting|gap|direct source|source layer/i.test(`${card.value} ${card.note}`))
    .slice(0, 3)
    .map((card) => ({
      label: card.label,
      value: card.value,
      detail: card.note,
      severity: severityFromCard(card.stale),
    }))
}

function deriveBlockers(section: ProjectedSection): ProjectedContextItem[] {
  if (section.blockers) return section.blockers
  return section.summaryCards
    .filter((card) => /blocker|risk|gap|need|tradeoff|pressure|overload|visibility/i.test(`${card.label} ${card.value} ${card.note}`))
    .slice(0, 3)
    .map((card) => ({
      label: card.label,
      value: card.value,
      detail: card.note,
      severity: severityFromCard(card.stale),
    }))
}

function deriveTimeline(section: ProjectedSection): ProjectedTimelineItem[] {
  if (section.timeline) return section.timeline
  if (!section.freshness) return []
  const recency = section.freshness.ageDays === null
    ? 'recency unknown'
    : `${section.freshness.ageDays} day${section.freshness.ageDays === 1 ? '' : 's'} old`
  return [{
    label: section.freshness.label,
    detail: section.freshness.stale ? 'Source freshness needs attention before this signal should be treated as current.' : 'Latest source freshness is inside the expected operating window.',
    recency,
    severity: section.freshness.stale ? 'stale' : 'good',
  }]
}

export function attachProjectedDashboard(key: PersonalProjectionKey, section: ProjectedSection): ProjectedSection {
  const dashboard = projectedDashboardModel[key]
  return {
    ...section,
    dashboard: section.dashboard ?? dashboard,
    blockers: deriveBlockers(section),
    missingData: deriveMissingData(section),
    timeline: deriveTimeline(section),
  }
}
