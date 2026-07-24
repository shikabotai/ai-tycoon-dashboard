import type { PersonalProjectionKey } from './personalProjectionClient'
import type { ProjectedContextItem, ProjectedDashboard, ProjectedSection, ProjectedSignalPriority, ProjectedTimelineItem } from './projectedTypes'

export const projectedDashboardModel: Partial<Record<PersonalProjectionKey, ProjectedDashboard>> = {
  vessel: {
    headline: 'Train, fuel, mind, looks',
    metrics: [
      { label: 'Workout recency', sourceCardIndex: 1, priority: 'good' },
      { label: 'Nutrition signal', sourceCardIndex: 2, priority: 'good' },
      { label: 'Mental reset', sourceCardIndex: 3, priority: 'watch' },
      { label: 'Looks routine', sourceCardIndex: 4, priority: 'good' },
    ],
    operatingRows: [
      { title: 'Workout rhythm', body: 'Make the next lift obvious from the latest workout log.', sourceCardIndex: 1 },
      { title: 'Food log', body: 'Show protein and calories without turning the page into a spreadsheet.', sourceCardIndex: 2 },
      { title: 'Attention reset', body: 'Give focus, meditation, and phone-friction the same importance as body metrics.', sourceCardIndex: 3 },
      { title: 'Presentation system', body: 'Keep grooming, skin, hair, and style visible as compounding Vessel work.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Workout Logs', body: 'Shows current execution and the next recommended session.', sourceCardIndex: 1 },
      { title: 'Nutrition Daily Logs', body: 'Shows the current cut / recomp food signal.', sourceCardIndex: 2 },
      { title: 'Mental Overview', body: 'Anchors focus, attention span, meditation, and shutdown practices.', sourceCardIndex: 3 },
      { title: 'Looksmaxxing Routine', body: 'Anchors the daily appearance system and event-readiness layer.', sourceCardIndex: 4 },
    ],
    actionRows: [
      { title: 'Lock the next lift', body: 'Use the latest session note to pick the next workout instead of debating it.', sourceCardIndex: 1 },
      { title: 'Keep protein visible', body: 'Make the food log answer one question fast: is the cut protected today?', sourceCardIndex: 2 },
      { title: 'Run one mental rep', body: 'Brain dump, breathe, or meditate before attention gets eaten by the phone loop.', sourceCardIndex: 3 },
      { title: 'Do the simple polish', body: 'Run the daily grooming / skincare routine so looksmaxxing compounds quietly.', sourceCardIndex: 4 },
    ],
  },
  identity: {
    headline: 'Mission and alignment board',
    metrics: [
      { label: 'Identity statement', sourceCardIndex: 0, priority: 'good' },
      { label: 'Alignment gap', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Current focus', sourceCardIndex: 2, priority: 'good' },
      { label: 'Top active goal', sourceCardIndex: 3, priority: 'good' },
    ],
    operatingRows: [
      { title: 'Execution-era self', body: 'Frame identity around daily execution and emotional steadiness.', sourceCardIndex: 0 },
      { title: 'Focus priority', body: 'Keep the lead goal visible before lower-priority pulls.', sourceCardIndex: 2 },
      { title: 'Ideal-self gap', body: 'Use the ideal self to expose gaps worth closing.', sourceCardIndex: 1 },
      { title: 'Decision pressure', body: 'Environment, consistency, and energy gaps belong here when they influence choices.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ideal Self', body: 'Standards for character, habits, presence, and confidence.', sourceCardIndex: 0 },
      { title: 'Goals Overview', body: 'Shows what should be proved next.', sourceCardIndex: 3 },
      { title: 'Annual Goals', body: 'Keeps the larger focus visible.', sourceCardIndex: 2 },
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
    headline: 'Proof packaging and search readiness board',
    metrics: [
      { label: 'Flagship proof', sourceCardIndex: 2, priority: 'good' },
      { label: 'Proof packaging', sourceCardIndex: 3, priority: 'watch' },
      { label: 'Pipeline status', sourceCardIndex: 4, priority: 'watch' },
      { label: 'Interview readiness', sourceCardIndex: 6, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Lead with LifeArc', body: 'Make the HIPAA AI product the first proof asset across resume, portfolio, interviews, and LinkedIn.', sourceCardIndex: 2 },
      { title: 'Package private work safely', body: 'Translate proprietary work into metrics, diagrams, and stories without exposing code or confidential data.', sourceCardIndex: 3 },
      { title: 'Turn proof into pipeline', body: 'Use the packaged proof to drive targeted applications, warm outreach, screens, and offers.', sourceCardIndex: 4 },
      { title: 'Keep the readiness stack honest', body: 'Track resume variants, DSA, system design, STAR stories, LinkedIn, GitHub, and portfolio gaps together.', sourceCardIndex: 6 },
    ],
    evidenceRows: [
      { title: 'LifeArc deep dive', body: 'Supplies the strongest measurable career asset: regulated AI, cloud, ML, product ownership, and business impact.', sourceCardIndex: 2 },
      { title: 'Resume and portfolio notes', body: 'Show exactly which artifacts exist and which still need to be turned into outward-facing proof.', sourceCardIndex: 3 },
      { title: 'Job search and networking logs', body: 'Keep applications, target companies, contacts, referral asks, and follow-up dates in one operating lane.', sourceCardIndex: 4 },
    ],
    actionRows: [
      { title: 'Package one proof asset', body: 'Create or refresh one resume bullet, STAR story, architecture diagram, portfolio case study, or LinkedIn/GitHub artifact.', sourceCardIndex: 3 },
      { title: 'Advance one pipeline row', body: 'Research one target company, send one outreach, apply with the right variant, or follow up on a stale lead.', sourceCardIndex: 4 },
      { title: 'Sharpen one interview lane', body: 'Practice one STAR story, solve one DSA problem, or run one system-design rep tied to the target role profile.', sourceCardIndex: 6 },
    ],
  },
  wealth: {
    headline: 'Wealth command board',
    metrics: [
      { label: 'Current net worth', sourceCardIndex: 0, priority: 'good' },
      { label: 'March baseline', sourceCardIndex: 1, priority: 'good' },
      { label: 'Monthly surplus', sourceCardIndex: 4, priority: 'good' },
      { label: 'Hourly value', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Net-worth scoreboard', body: 'The first read should answer what total wealth is now and how it has moved since the baseline.', sourceCardIndex: 0 },
      { title: 'Savings engine', body: 'Monthly surplus explains how much money is actually retained after expenses.', sourceCardIndex: 4 },
      { title: 'Real hourly value', body: 'Hourly value should use saved money divided by job and freelance hours only.', sourceCardIndex: 5 },
      { title: 'Estimate discipline', body: 'Keep source assumptions visible until monthly snapshots and hour logs are connected.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Punk Records baseline', body: 'March 2026 supplies the first net-worth anchor.', sourceCardIndex: 1 },
      { title: 'Current estimate', body: 'Mitchell supplied the current net-worth number for the dashboard.', sourceCardIndex: 0 },
      { title: 'Budget estimate', body: 'The expense estimate comes from Punk Records until replaced by actual trailing spend.', sourceCardIndex: 3 },
    ],
    actionRows: [
      { title: 'Enter weekly hours', body: 'Add job hours and freelance hours so the real hourly value can calculate.', sourceCardIndex: 5 },
      { title: 'Add next snapshot', body: 'Capture a monthly net-worth row to turn the March and current values into a trend.', sourceCardIndex: 1 },
      { title: 'Replace estimates', body: 'Swap the budget estimate for actual trailing monthly spend when available.', sourceCardIndex: 3 },
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
