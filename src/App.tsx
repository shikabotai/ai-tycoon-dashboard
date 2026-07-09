import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import './App.css'
import { useDashboardData } from './hooks/useDashboardData'
import { loadProjectedSection, type PersonalProjectionKey } from './data/personalProjectionClient'
import type { ProjectedDashboard, ProjectedSection as LiveProjectedSection } from './data/projectedTypes'
import { sendBusinessCommand, sendCommandHandoff } from './data/businessCommandApi'
import { routeCommand } from './data/commandRouter'
import type { CommandHandoffResponse } from './server/commandHandoffApi'
import type { BusinessCommandResponse } from './server/commandRouteApi'

const SpaceScene = lazy(async () => {
  const mod = await import('./components/SpaceScene')
  return { default: mod.SpaceScene }
})

type AppMode = 'personal' | 'business'
type PersonalSection = 'home' | 'vessel' | 'identity' | 'career' | 'wealth' | 'ventures' | 'systems' | 'education' | 'relationships' | 'knowledge'
type BusinessPanel = 'overview' | 'agents' | 'review'
type BusinessPage = 'business-command' | 'agents' | 'review-dock' | 'runtime-trail'
type AppPage = PersonalSection | BusinessPage
type LoginState = { username: string; password: string }
type PersonalSectionData = LiveProjectedSection
type HomeSignalCard = { kicker: string; title: string; body: string }
type ProjectionHighlightCard = { title: string; text: string }
type CommandHistoryEntry = { id: string; text: string; context: string; action?: BusinessCommandResponse['runtimeAction']; handoff?: CommandHandoffResponse }
type CommandSuggestion = { label: string; prompt: string }
type EmptyStateProps = { label: string; title: string; body: string }
type AvatarAssetStatus = 'loading' | 'ready' | 'missing'
type CoreDashboardSection = Extract<PersonalSection, 'vessel' | 'identity' | 'systems'>
type GrowthDashboardSection = Extract<PersonalSection, 'ventures' | 'career' | 'wealth' | 'education' | 'knowledge' | 'relationships'>
type CoreDashboardDefinition = ProjectedDashboard

type NodeSpec = { key: Exclude<PersonalSection, 'home'>; label: string; tier: 'core' | 'secondary' }
type NavItem = { page: AppPage; label: string; description: string }
type PageDirective = { outcome: string; system: string; usefulFor: string; cadence: string }
type GrowthLoopCard = { page: Exclude<PersonalSection, 'home'>; label: string; command: string; result: string }

const VALID_USERNAME = 'mthanath64'
const VALID_PASSWORD = 'Mitch2002'
const MAX_LOGIN_ATTEMPTS = 10
const LOCKOUT_MS = 10 * 60 * 1000
const SESSION_KEY = 'control-center-auth'
const LOGIN_STATE_KEY = 'control-center-login-state'
const COMMAND_HISTORY_KEY = 'control-center-command-history'
const AVATAR_ASSET_PATH = '/avatar/control-center-avatar.png'

const PERSONAL_ROUTES: Record<PersonalSection, string> = {
  home: '/',
  vessel: '/vessel',
  identity: '/identity',
  career: '/career',
  wealth: '/wealth',
  ventures: '/ventures',
  systems: '/systems',
  education: '/education',
  relationships: '/relationships',
  knowledge: '/knowledge',
}

const BUSINESS_ROUTES: Record<BusinessPage, string> = {
  'business-command': '/business-command',
  agents: '/agents',
  'review-dock': '/review-dock',
  'runtime-trail': '/runtime-trail',
}

const PAGE_ROUTES: Record<AppPage, string> = { ...PERSONAL_ROUTES, ...BUSINESS_ROUTES }

const PERSONAL_NAV_ITEMS: NavItem[] = [
  { page: 'home', label: 'Home', description: 'Operating overview' },
  { page: 'vessel', label: 'Vessel', description: 'Body and performance' },
  { page: 'identity', label: 'Identity', description: 'Mission and self alignment' },
  { page: 'systems', label: 'Systems', description: 'Tasks, automations, open loops' },
  { page: 'ventures', label: 'Ventures', description: 'Personal venture strategy' },
  { page: 'career', label: 'Career', description: 'Trajectory and portfolio' },
  { page: 'wealth', label: 'Wealth', description: 'Capital and priorities' },
  { page: 'education', label: 'Education', description: 'Courses and deadlines' },
  { page: 'knowledge', label: 'Knowledge', description: 'Models and references' },
  { page: 'relationships', label: 'Relationships', description: 'Connection and care' },
]

const BUSINESS_NAV_ITEMS: NavItem[] = [
  { page: 'business-command', label: 'Business Command', description: 'Operations overview' },
  { page: 'agents', label: 'Agents', description: 'Workload and chambers' },
  { page: 'review-dock', label: 'Review Dock', description: 'Approval decisions' },
  { page: 'runtime-trail', label: 'Runtime Trail', description: 'Command provenance' },
]

const PAGE_DIRECTIVES: Record<AppPage, PageDirective> = {
  home: {
    outcome: 'Know the day in under a minute',
    system: 'Identity, body, work, money, learning, and relationships compressed into one operating view.',
    usefulFor: 'Choosing what deserves attention before the day gets noisy.',
    cadence: 'Daily scan',
  },
  vessel: {
    outcome: 'Protect energy and physique momentum',
    system: 'Training, nutrition, recovery, and discipline signals translated into next actions.',
    usefulFor: 'Keeping the body system aligned with confidence, health, and consistency.',
    cadence: 'Daily check',
  },
  identity: {
    outcome: 'Act like the person you are building',
    system: 'Mission, ideal-self gap, year theme, and blockers kept in one decision frame.',
    usefulFor: 'Making choices from identity instead of mood or pressure.',
    cadence: 'Morning and reset moments',
  },
  systems: {
    outcome: 'Reduce open loops',
    system: 'Tasks, automations, blockers, and operations pressure surfaced as a control layer.',
    usefulFor: 'Turning scattered obligations into a small number of executable moves.',
    cadence: 'Daily command',
  },
  ventures: {
    outcome: 'Aim effort at the highest-upside line',
    system: 'Portfolio pressure, venture priority, blockers, and ROI logic kept separate from live ops.',
    usefulFor: 'Preventing idea sprawl and choosing the best next bet.',
    cadence: 'Weekly strategy',
  },
  career: {
    outcome: 'Convert work into leverage',
    system: 'Role trajectory, compensation moves, portfolio proof, and skill compounding in one board.',
    usefulFor: 'Making shipped work count toward opportunity, income, and reputation.',
    cadence: 'Weekly review',
  },
  wealth: {
    outcome: 'Build capital around leverage',
    system: 'Income engines, cashflow stance, priority gaps, and finance visibility separated cleanly.',
    usefulFor: 'Focusing money decisions on career, venture, and life ROI.',
    cadence: 'Weekly money review',
  },
  education: {
    outcome: 'Learn what compounds',
    system: 'Program, deadlines, tradeoffs, and career value tied into one execution lane.',
    usefulFor: 'Keeping school useful without letting it swallow the rest of the system.',
    cadence: 'Study planning',
  },
  knowledge: {
    outcome: 'Turn information into better decisions',
    system: 'Mental models, references, learning domains, and knowledge gaps converted into tools.',
    usefulFor: 'Using what you learn to improve choices, not just collect notes.',
    cadence: 'Weekly extraction',
  },
  relationships: {
    outcome: 'Maintain real connection with respect',
    system: 'Care actions, environment fit, social confidence, and privacy boundaries summarized safely.',
    usefulFor: 'Making relationships actionable without exposing private detail.',
    cadence: 'Weekly touchpoint',
  },
  'business-command': {
    outcome: 'Move the business with fewer clicks',
    system: 'Queue pressure, revenue signals, reviews, and runtime actions in one command surface.',
    usefulFor: 'Knowing what business work should move, approve, or escalate first.',
    cadence: 'Live ops',
  },
  agents: {
    outcome: 'See who is carrying what',
    system: 'Agent chambers, assignments, costs, active tasks, and alert pressure grouped together.',
    usefulFor: 'Balancing automated work without losing sight of ownership.',
    cadence: 'Live ops',
  },
  'review-dock': {
    outcome: 'Approve only with context',
    system: 'Artifacts, decision notes, event evidence, and explicit approve or deny controls.',
    usefulFor: 'Keeping quality high while work continues moving.',
    cadence: 'As needed',
  },
  'runtime-trail': {
    outcome: 'Trust the system because it leaves evidence',
    system: 'Commands, handoffs, safety notes, audit ids, and provenance stored as a ledger.',
    usefulFor: 'Understanding what happened and why before delegating more.',
    cadence: 'Audit review',
  },
}

const GROWTH_LOOP_CARDS: GrowthLoopCard[] = [
  { page: 'identity', label: 'Decide', command: 'Start from mission and current self gap.', result: 'Cleaner choices' },
  { page: 'systems', label: 'Execute', command: 'Collapse open loops into one next move.', result: 'Less drag' },
  { page: 'vessel', label: 'Energize', command: 'Protect training, food, and recovery rhythm.', result: 'More capacity' },
  { page: 'wealth', label: 'Compound', command: 'Aim money and effort at leverage engines.', result: 'More options' },
]

const PERSONAL_NODES: NodeSpec[] = [
  { key: 'vessel', label: 'Vessel', tier: 'core' },
  { key: 'identity', label: 'Identity', tier: 'core' },
  { key: 'career', label: 'Career', tier: 'core' },
  { key: 'wealth', label: 'Wealth', tier: 'core' },
  { key: 'ventures', label: 'Ventures', tier: 'core' },
  { key: 'systems', label: 'Systems', tier: 'core' },
  { key: 'education', label: 'Education', tier: 'secondary' },
  { key: 'relationships', label: 'Relationships', tier: 'secondary' },
  { key: 'knowledge', label: 'Knowledge', tier: 'secondary' },
]

function pageFromPath(pathname: string): AppPage {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const match = (Object.entries(PAGE_ROUTES) as Array<[AppPage, string]>).find(([, path]) => path === normalized)
  return match?.[0] ?? 'home'
}

function isBusinessPage(page: AppPage): page is BusinessPage {
  return page === 'business-command' || page === 'agents' || page === 'review-dock' || page === 'runtime-trail'
}

function businessPanelFromPage(page: BusinessPage): BusinessPanel {
  if (page === 'agents') return 'agents'
  if (page === 'review-dock') return 'review'
  return 'overview'
}

function pageLabel(page: AppPage) {
  return [...PERSONAL_NAV_ITEMS, ...BUSINESS_NAV_ITEMS].find((item) => item.page === page)?.label ?? 'Home'
}

const COMMAND_SUGGESTIONS: Record<AppMode, CommandSuggestion[]> = {
  personal: [
    { label: 'Focus reset', prompt: 'Summarize my highest-priority personal focus right now.' },
    { label: 'Identity check', prompt: 'Show the strongest identity signal on this screen.' },
    { label: 'Systems pulse', prompt: 'What system needs attention first?' },
  ],
  business: [
    { label: 'Review pressure', prompt: 'Show the most urgent review item and why it matters.' },
    { label: 'Agent load', prompt: 'Which agent has the highest current workload?' },
    { label: 'Publishing pulse', prompt: 'Summarize recent output and what should ship next.' },
  ],
}

const PERSONAL_SECTION_CONTENT: Record<Exclude<PersonalSection, 'home'>, { eyebrow: string; title: string; summaryCards: string[]; highlights: string[] }> = {
  vessel: { eyebrow: 'Body and performance', title: 'Vessel', summaryCards: ['Weight / body metrics', 'Workout consistency', 'Nutrition consistency', 'Sleep / recovery'], highlights: ['Recent workouts and body trends', 'Cut / recomp progress', 'Stale-data warnings with best-effort status'] },
  identity: { eyebrow: 'Internal command', title: 'Identity', summaryCards: ['Identity statement', 'Ideal self alignment', 'Current mission', 'Top active goals'], highlights: ['Ideal Self and Annual Goals', 'Decision Engine and blockers', 'Alignment-first momentum view'] },
  career: { eyebrow: 'Trajectory and leverage', title: 'Career', summaryCards: ['Career trajectory', 'Portfolio readiness', 'Job search status', 'Next milestone'], highlights: ['Career strategy overviews', 'Portfolio readiness', 'Real repo opportunities'] },
  wealth: { eyebrow: 'Capital and strategy', title: 'Wealth', summaryCards: ['Net worth', 'Cash / liquidity', 'Income snapshot', 'Financial priorities'], highlights: ['Budget and cashflow strategy', 'Current priorities surfaced fast', 'Balanced present and future view'] },
  ventures: { eyebrow: 'Personal venture strategy', title: 'Ventures', summaryCards: ['Priority venture', 'Portfolio snapshot', 'Biggest blocker', 'Next key decision'], highlights: ['Personal venture worldview', 'Priority logic and blockers', 'Separate from Business Command'] },
  systems: { eyebrow: 'Life operations layer', title: 'Systems', summaryCards: ['Today priorities', 'Task board status', 'Active automations', 'Open loops'], highlights: ['Operations Task Board anchor', 'Automations and stale-item visibility', 'Daily command layer'] },
  education: { eyebrow: 'Learning and school', title: 'Education', summaryCards: ['Program', 'Courses', 'Upcoming deadlines', 'Learning focus'], highlights: ['Program context', 'Course clarity', 'Visible without taking over the system'] },
  relationships: { eyebrow: 'Family and connection', title: 'Relationships', summaryCards: ['Priority snapshot', 'Connection health', 'Important people', 'Upcoming actions'], highlights: ['Family and partner vision', 'Actionable relationship focus', 'Sensitive content kept minimal'] },
  knowledge: { eyebrow: 'Mental models and references', title: 'Knowledge', summaryCards: ['Learning domains', 'Mental models', 'Recent knowledge', 'Knowledge gaps'], highlights: ['Business, finance, health, psychology', 'Knowledge browser from PunkRecords', 'Built for action'] },
}

const CORE_DASHBOARD_DEFINITIONS: Record<CoreDashboardSection, CoreDashboardDefinition> = {
  vessel: {
    headline: 'Body system operating board',
    metrics: [
      { label: 'Body target', sourceCardIndex: 0, priority: 'good' },
      { label: 'Training recency', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Nutrition recency', sourceCardIndex: 2, priority: 'good' },
      { label: 'Recovery coverage', sourceCardIndex: 3, priority: 'stale' },
    ],
    operatingRows: [
      { title: 'Cut / recomp lane', body: 'Keep the dashboard oriented around a controlled cut and visible muscle preservation, not a generic fitness feed.', sourceCardIndex: 5 },
      { title: 'Training rhythm', body: 'Workout logs are the lead evidence source. If the latest lift log drifts, this page should treat consistency as the first correction.', sourceCardIndex: 1 },
      { title: 'Nutrition compliance', body: 'Nutrition logs carry the current body-composition signal and should stay paired with the weight target.', sourceCardIndex: 2 },
      { title: 'Recovery gap', body: 'Sleep and recovery remain a known data gap until a direct recovery source is connected.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Fitness Overview', body: 'Anchors weight, physique goal, and body-system direction.', sourceCardIndex: 0 },
      { title: 'Workout Logs', body: 'Shows the last training evidence and warns when the cadence gets stale.', sourceCardIndex: 1 },
      { title: 'Nutrition Daily Logs', body: 'Shows food-tracking recency and whether the cut signal is being maintained.', sourceCardIndex: 2 },
    ],
    actionRows: [
      { title: 'Protect the next workout', body: 'If training evidence is older than the target cadence, make the next lift the first operating move.', sourceCardIndex: 1 },
      { title: 'Keep food logs current', body: 'Nutrition is useful only while the log stays fresh; stale data should be treated as the blocker.', sourceCardIndex: 2 },
      { title: 'Add recovery source', body: 'The recovery card is intentionally flagged until sleep, energy, or readiness data is connected.', sourceCardIndex: 3 },
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
      { title: 'Execution-era self', body: 'Identity is framed as daily execution and emotional steadiness, not a motivational poster.', sourceCardIndex: 0 },
      { title: 'Mission priority', body: 'The year theme and 90-day focus should stay visible before any lower-priority personal work.', sourceCardIndex: 2 },
      { title: 'Ideal-self gap', body: 'The ideal self is useful because it shows gaps to close, not because it pretends the gap is gone.', sourceCardIndex: 1 },
      { title: 'Decision pressure', body: 'Environment, consistency, and energy gaps belong on this page when they influence choices.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ideal Self', body: 'The main compass for character, habits, physical presence, and social confidence.', sourceCardIndex: 0 },
      { title: 'Goals Overview', body: 'Supplies the immediate mission and keeps identity tied to execution.', sourceCardIndex: 3 },
      { title: 'Annual Goals', body: 'Keeps the current year theme and long-arc priorities visible.', sourceCardIndex: 2 },
    ],
    actionRows: [
      { title: 'Choose from alignment', body: 'Favor actions that reduce the gap between current self and ideal-self evidence.', sourceCardIndex: 1 },
      { title: 'Defend the top mission', body: 'If the dashboard shows too many pulls, protect the top active goal first.', sourceCardIndex: 3 },
      { title: 'Name the blocker', body: 'Turn environment or consistency friction into a concrete next move instead of leaving it vague.', sourceCardIndex: 4 },
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
      { title: 'Task-board pressure', body: 'The Operations Task Board is the control point for what needs capture, clarification, and execution.', sourceCardIndex: 0 },
      { title: 'Closed-loop rate', body: 'Completed items are the proof that the system is moving, not merely organizing.', sourceCardIndex: 1 },
      { title: 'Venture surface area', body: 'The systems page watches cross-project sprawl so the control center can compress priorities.', sourceCardIndex: 2 },
      { title: 'Automation layer', body: 'AI support should reduce open loops while keeping human judgment at approval boundaries.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Operations Task Board', body: 'Primary source for open and completed checklist pressure.', sourceCardIndex: 0 },
      { title: 'Ventures MOC', body: 'Proxy for how much project surface area the personal operating system must manage.', sourceCardIndex: 2 },
      { title: 'Business Command boundary', body: 'Live business execution is kept separate so personal systems do not become a noisy ops feed.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Clarify one open loop', body: 'Turn the most ambiguous open item into a decision, next action, or deletion.', sourceCardIndex: 0 },
      { title: 'Compress surface area', body: 'Use the venture inventory as a warning when too many lines are competing for attention.', sourceCardIndex: 2 },
      { title: 'Upgrade live rollups', body: 'The systems need is explicit: better rollups are the next data-model improvement.', sourceCardIndex: 5 },
    ],
  },
}

const GROWTH_DASHBOARD_DEFINITIONS: Record<GrowthDashboardSection, CoreDashboardDefinition> = {
  ventures: {
    headline: 'Portfolio strategy board',
    metrics: [
      { label: 'Portfolio inventory', sourceCardIndex: 0, priority: 'watch' },
      { label: 'Priority posture', sourceCardIndex: 1, priority: 'good' },
      { label: 'Active venture goals', sourceCardIndex: 2, priority: 'good' },
      { label: 'Blocker visibility', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Strategy, not live ops', body: 'This page decides which venture lines deserve attention; Business Command remains the place for live execution.', sourceCardIndex: 0 },
      { title: 'Execution posture', body: 'The current stance favors shipping and traction over new idea sprawl.', sourceCardIndex: 1 },
      { title: 'Goal pressure', body: 'Annual venture goals become the active pressure signal until richer operating data lands.', sourceCardIndex: 2 },
      { title: 'Priority compression', body: 'The dashboard should reduce the portfolio into the next meaningful decision, not celebrate a long inventory.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ventures MOC', body: 'Primary source for personal venture inventory and strategic surface area.', sourceCardIndex: 0 },
      { title: 'Annual goals', body: 'Provides the in-progress venture pressure and shipping posture.', sourceCardIndex: 2 },
      { title: 'Business boundary', body: 'Live blockers stay separate so this page can stay focused on personal strategy.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Name the priority venture', body: 'Compress the portfolio to the line with the best combination of momentum, upside, and urgency.', sourceCardIndex: 4 },
      { title: 'Route live work to Business Command', body: 'When the decision becomes execution, move it to the operations surface instead of crowding this page.', sourceCardIndex: 5 },
      { title: 'Add ROI ranking', body: 'Next data-model work should rank venture moves by leverage, cost, and expected return.', sourceCardIndex: 3 },
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
      { title: 'Income leverage lane', body: 'Career is currently about stronger role leverage and compensation, not passive resume storage.', sourceCardIndex: 1 },
      { title: 'Portfolio readiness', body: 'The next milestone should translate shipped work into a profile that can support interviews or negotiation.', sourceCardIndex: 5 },
      { title: 'Long-arc ML position', body: 'The MSML path is useful because it compounds technical leverage over time.', sourceCardIndex: 2 },
      { title: 'Opportunity filter', body: 'Current opportunities should be judged by leverage, learning, compensation, and fit with the wider operating system.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Annual goals', body: 'Supplies the current raise / SWE role objective.', sourceCardIndex: 1 },
      { title: 'Five-year direction', body: 'Keeps the MSML and machine-learning arc visible without letting it overwhelm the present.', sourceCardIndex: 2 },
      { title: 'Portfolio gap', body: 'The page needs direct resume, repo, and interview-cadence evidence in the next data-model pass.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Package shipped proof', body: 'Convert live software work into a career asset: portfolio entry, resume bullet, and interview story.', sourceCardIndex: 5 },
      { title: 'Protect the comp move', body: 'Keep the higher-paying SWE role / raise objective visible when choosing where to spend effort.', sourceCardIndex: 1 },
      { title: 'Track interview readiness', body: 'Add a direct readiness score once resume, projects, and outreach sources are connected.', sourceCardIndex: 5 },
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
      { title: 'Earn-more-first strategy', body: 'The current system treats income growth and venture upside as the main capital levers.', sourceCardIndex: 1 },
      { title: 'Engine pairing', body: 'Career and ventures are the lead wealth engines, so capital decisions should support those paths.', sourceCardIndex: 3 },
      { title: 'Selective accumulation', body: 'Avoid over-optimizing small decisions when the larger leverage paths are still being built.', sourceCardIndex: 2 },
      { title: 'Visibility gap', body: 'This page should be honest when live net-worth, cash, or spending data is not connected.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Planning docs', body: 'Current financial direction comes from goals and strategic notes, not direct account integrations.', sourceCardIndex: 0 },
      { title: 'Career and venture signals', body: 'The clearest financial multipliers are compensation growth and business traction.', sourceCardIndex: 3 },
      { title: 'Missing finance feed', body: 'A direct financial source remains required before this can become a precise scoreboard.', sourceCardIndex: 4 },
    ],
    actionRows: [
      { title: 'Prioritize leverage', body: 'Favor actions that increase earning power, durable upside, or recurring surplus.', sourceCardIndex: 0 },
      { title: 'Add live scoreboard source', body: 'Connect explicit balance, cashflow, and obligation sources before making this page more numerical.', sourceCardIndex: 4 },
      { title: 'Tie spend to strategy', body: 'Future decisions should show whether spending supports career, health, or venture leverage.', sourceCardIndex: 5 },
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
      { title: 'Credential as leverage', body: 'Education supports the long-term ML path and career leverage rather than existing as an isolated school panel.', sourceCardIndex: 1 },
      { title: 'Execution balance', body: 'The page should keep study depth visible without letting it crowd shipping, career, and health priorities.', sourceCardIndex: 2 },
      { title: 'Overload watch', body: 'Education risk rises when too many active fronts compete for sustained attention.', sourceCardIndex: 4 },
      { title: 'Milestone gap', body: 'Concrete courses, deadlines, and checkpoints need to become structured source data in the next pass.', sourceCardIndex: 5 },
    ],
    evidenceRows: [
      { title: 'Georgia Tech MSML', body: 'Primary academic anchor for the current education lane.', sourceCardIndex: 0 },
      { title: 'Career linkage', body: 'Education is tied directly to future career leverage and ML positioning.', sourceCardIndex: 1 },
      { title: 'Missing deadline feed', body: 'The page needs direct course/deadline evidence before it can behave like a school dashboard.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Protect the study lane', body: 'Keep the next academic checkpoint visible without letting it become vague background pressure.', sourceCardIndex: 5 },
      { title: 'Balance depth and shipping', body: 'Choose study moves that support career leverage while preserving execution momentum.', sourceCardIndex: 2 },
      { title: 'Add course checkpoints', body: 'Next data-model work should expose courses, deliverables, due dates, and completion status.', sourceCardIndex: 5 },
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
      { title: 'Knowledge for action', body: 'The section should improve decisions in career, ventures, health, and identity rather than become an archive.', sourceCardIndex: 0 },
      { title: 'Model extraction', body: 'Mental models need to be surfaced as reusable decision tools, not buried in prose.', sourceCardIndex: 1 },
      { title: 'Reference hierarchy', body: 'Goals and identity notes currently act as the strongest high-value references.', sourceCardIndex: 3 },
      { title: 'Recency gap', body: 'Recent additions are not yet projected, so the page must mark that data gap plainly.', sourceCardIndex: 2 },
    ],
    evidenceRows: [
      { title: 'Strategic notes', body: 'Current source strength is in goals, identity, and practical planning documents.', sourceCardIndex: 3 },
      { title: 'Reading goal', body: 'The active reading goal supplies one explicit learning target.', sourceCardIndex: 4 },
      { title: 'Knowledge rollup gap', body: 'The next projection pass needs deeper traversal of knowledge-side sources.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Extract one usable model', body: 'Turn the highest-value note into a decision rule or checklist that can improve execution.', sourceCardIndex: 1 },
      { title: 'Connect recency', body: 'Add latest-note and latest-reference timestamps so the page can distinguish live learning from old material.', sourceCardIndex: 2 },
      { title: 'Tie reading to action', body: 'Use the reading goal only when it produces a clearer choice or stronger operating principle.', sourceCardIndex: 4 },
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
      { title: 'Care without oversharing', body: 'This page should keep relationship direction useful while avoiding intimate or unnecessary detail.', sourceCardIndex: 0 },
      { title: 'Family and future partner path', body: 'The useful operating signal is who and what needs attention, not a full private diary.', sourceCardIndex: 1 },
      { title: 'Social positioning', body: 'Confidence, environment, and consistent exposure are the current growth levers.', sourceCardIndex: 2 },
      { title: 'Context fit', body: 'The blocker is treated as a practical environment and exposure problem, not a judgment-heavy personal label.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Planning layer', body: 'Current evidence is directional and strategy-heavy; direct relationship logs should stay minimal.', sourceCardIndex: 0 },
      { title: 'Identity connection', body: 'Social confidence and environment are linked back to the Identity page.', sourceCardIndex: 2 },
      { title: 'Privacy rule', body: 'Sensitive details should be summarized into safe operating signals before rendering.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Choose one care action', body: 'Make the next relationship move concrete and respectful without exposing private context.', sourceCardIndex: 1 },
      { title: 'Improve environment fit', body: 'Prioritize contexts that make good connection more likely instead of relying on intention alone.', sourceCardIndex: 3 },
      { title: 'Keep the page minimal', body: 'Future source integrations should summarize patterns and reminders, not display raw sensitive notes.', sourceCardIndex: 5 },
    ],
  },
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatActionTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'timestamp unavailable'
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function BusinessEmptyState({ label, title, body }: EmptyStateProps) {
  return (
    <div className="business-empty-state">
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  )
}

function RuntimeTrailPanel({ items }: { items: CommandHistoryEntry[] }) {
  return (
    <article className="glass-panel runtime-trail-panel">
      <div className="revamp-kicker">Runtime Trail</div>
      {items.length > 0 ? (
        <div className="runtime-trail-list">
          {items.map((item) => (
            <div key={item.id} className="runtime-trail-item">
              <span>{item.action?.status.replace(/_/g, ' ') ?? 'recorded'} · {item.action ? formatActionTime(item.action.executedAt) : 'timestamp unavailable'}</span>
              <strong>{item.action?.label ?? item.text}</strong>
              <p>{item.handoff ? `${item.handoff.status.replace(/_/g, ' ')} · ${item.handoff.auditId}` : item.action?.effect}</p>
            </div>
          ))}
        </div>
      ) : (
        <BusinessEmptyState
          label="Runtime trail"
          title="No actions recorded yet"
          body="Commands, assistant handoffs, and review decisions will collect here as the cockpit moves work."
        />
      )}
    </article>
  )
}

function loadStoredLoginState() {
  if (typeof window === 'undefined') return { attempts: 0, lockoutUntil: 0 }
  try {
    const raw = window.localStorage.getItem(LOGIN_STATE_KEY)
    if (!raw) return { attempts: 0, lockoutUntil: 0 }
    const parsed = JSON.parse(raw) as { attempts?: number; lockoutUntil?: number }
    return {
      attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
      lockoutUntil: typeof parsed.lockoutUntil === 'number' ? parsed.lockoutUntil : 0,
    }
  } catch {
    return { attempts: 0, lockoutUntil: 0 }
  }
}

function storeLoginState(state: { attempts: number; lockoutUntil: number }) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(state))
}

function isRuntimeAction(value: unknown): value is BusinessCommandResponse['runtimeAction'] {
  if (!value || typeof value !== 'object') return false
  const action = value as Partial<BusinessCommandResponse['runtimeAction']>
  return typeof action.id === 'string' &&
    typeof action.label === 'string' &&
    typeof action.status === 'string' &&
    typeof action.effect === 'string'
}

function isCommandHandoff(value: unknown): value is CommandHandoffResponse {
  if (!value || typeof value !== 'object') return false
  const handoff = value as Partial<CommandHandoffResponse>
  return typeof handoff.auditId === 'string' &&
    typeof handoff.status === 'string' &&
    typeof handoff.message === 'string' &&
    typeof handoff.recordedAt === 'string'
}

function loadStoredCommandHistory(): CommandHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(COMMAND_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<CommandHistoryEntry>[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => typeof item.id === 'string' && typeof item.text === 'string' && typeof item.context === 'string')
      .map((item) => ({
        id: item.id as string,
        text: item.text as string,
        context: item.context as string,
        action: isRuntimeAction(item.action) ? item.action : undefined,
        handoff: isCommandHandoff(item.handoff) ? item.handoff : undefined,
      }))
      .slice(0, 6)
  } catch {
    return []
  }
}

function storeCommandHistory(history: CommandHistoryEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(history.slice(0, 6)))
}

function App() {
  const [authed, setAuthed] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>(() => typeof window === 'undefined' ? 'home' : pageFromPath(window.location.pathname))
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandValue, setCommandValue] = useState('')
  const [login, setLogin] = useState<LoginState>({ username: '', password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>(() => loadStoredCommandHistory())
  const [commandResponse, setCommandResponse] = useState('Control center live. Projection layers active, Business Command ready, and the next move can route from here.')
  const [reviewNoteDrafts, setReviewNoteDrafts] = useState<Record<string, string>>({})
  const [selectedReviewTaskId, setSelectedReviewTaskId] = useState<string | null>(null)
  const [projectedSections, setProjectedSections] = useState<Partial<Record<PersonalProjectionKey, LiveProjectedSection>>>({})
  const [avatarAssetStatus, setAvatarAssetStatus] = useState<AvatarAssetStatus>('loading')

  const dashboardData = useDashboardData()
  const appMode: AppMode = isBusinessPage(currentPage) ? 'business' : 'personal'
  const personalSection: PersonalSection = isBusinessPage(currentPage) ? 'home' : currentPage
  const businessPanel: BusinessPanel = isBusinessPage(currentPage) ? businessPanelFromPage(currentPage) : 'overview'
  const currentPath = PAGE_ROUTES[currentPage]

  useEffect(() => {
    if (typeof window === 'undefined') return
    const session = window.localStorage.getItem(SESSION_KEY)
    if (session === 'true') setAuthed(true)
    const stored = loadStoredLoginState()
    setAttempts(stored.attempts)
    setLockoutUntil(stored.lockoutUntil)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handlePopstate = () => setCurrentPage(pageFromPath(window.location.pathname))
    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    storeCommandHistory(commandHistory)
  }, [commandHistory])

  useEffect(() => {
    let cancelled = false

    async function primeProjections() {
      const keys: PersonalProjectionKey[] = ['vessel', 'identity', 'systems', 'ventures', 'career', 'knowledge', 'wealth', 'education', 'relationships']
      const entries = await Promise.all(keys.map(async (key) => {
        try {
          const section = await loadProjectedSection(key)
          return section ? ([key, section] as const) : null
        } catch {
          return null
        }
      }))

      if (cancelled) return
      setProjectedSections(Object.fromEntries(entries.filter(Boolean) as Array<readonly [PersonalProjectionKey, LiveProjectedSection]>))
    }

    void primeProjections()
    return () => {
      cancelled = true
    }
  }, [])

  const lockedOut = lockoutUntil > now
  const commandSuggestions = COMMAND_SUGGESTIONS[appMode]
  const lockoutSeconds = Math.max(0, Math.ceil((lockoutUntil - now) / 1000))
  const businessSummary = dashboardData.summary
  const queueHealth = dashboardData.queueHealth
  const topPendingReview = dashboardData.artifactReviewItems[0]
  const selectedReviewTaskIdSafe = selectedReviewTaskId ?? topPendingReview?.taskId ?? null
  const selectedReviewItem = dashboardData.artifactReviewItems.find((item) => item.taskId === selectedReviewTaskIdSafe) ?? topPendingReview
  const selectedReviewDetail = selectedReviewItem ? dashboardData.getTaskDetail(selectedReviewItem.taskId) : undefined
  const businessAgents = dashboardData.agentChambers.slice(0, 6)
  const recentActivity = dashboardData.activityFeed.slice(0, 5)
  const commandPreview = useMemo(() => {
    const draft = commandValue.trim()
    if (!draft) return null
    return routeCommand(draft, { appMode, personalSection, businessPanel })
  }, [appMode, businessPanel, commandValue, personalSection])
  const runtimeTrailItems = useMemo(() => commandHistory.filter((item) => item.action || item.handoff), [commandHistory])
  const actionTrail = useMemo(() => runtimeTrailItems.slice(0, 3), [runtimeTrailItems])
  const pipelineRows = dashboardData.pipeline.slice(0, 8)
  const watchdogRows = dashboardData.watchdog.slice(0, 6)
  const reviewQueue = dashboardData.artifactReviewItems.slice(0, 6)
  const recentRuntimeActivity = dashboardData.activityFeed.slice(0, 6)
  const businessPageCopy = useMemo(() => {
    if (!isBusinessPage(currentPage)) {
      return {
        kicker: 'Business Command',
        title: 'Live operations command',
        body: 'Queue pressure, approvals, agent load, and publishing signals stay close enough for a fast decision.',
      }
    }
    const copy: Record<BusinessPage, { kicker: string; title: string; body: string }> = {
      'business-command': {
        kicker: 'Business Command',
        title: 'Live operations command',
        body: 'Queue pressure, approvals, agent load, and publishing signals stay close enough for a fast decision.',
      },
      agents: {
        kicker: 'Agents',
        title: 'Agent workload dashboard',
        body: 'Chambers, current assignments, runnable pressure, and blocked work are grouped as a first-class operations page.',
      },
      'review-dock': {
        kicker: 'Review Dock',
        title: 'Approval command lane',
        body: 'Pending artifacts, decision notes, latest events, and approval actions are the primary surface here.',
      },
      'runtime-trail': {
        kicker: 'Runtime Trail',
        title: 'Command provenance ledger',
        body: 'Commands, handoffs, review decisions, safety notes, and audit ids become the main operational record on this page.',
      },
    }
    return copy[currentPage]
  }, [currentPage])

  const currentPersonalContent = personalSection === 'home' ? null : PERSONAL_SECTION_CONTENT[personalSection]
  const currentPersonalData = useMemo<PersonalSectionData | null>(() => {
    if (personalSection === 'home' || !currentPersonalContent) return null
    const projected = projectedSections[personalSection as PersonalProjectionKey]
    if (projected) return projected
    return {
      heroSummary: `${currentPersonalContent.title} is drawing from PunkRecords so this chamber can present a focused operating view for Mitchell’s private control center.`,
      summaryCards: currentPersonalContent.summaryCards.map((card) => ({ label: card, value: 'Resolving', note: 'Source records are being organized into a usable operating signal.' })),
      highlights: currentPersonalContent.highlights,
    }
  }, [currentPersonalContent, personalSection, projectedSections])
  const currentCoreDashboard = personalSection === 'vessel' || personalSection === 'identity' || personalSection === 'systems'
    ? CORE_DASHBOARD_DEFINITIONS[personalSection]
    : null
  const currentGrowthDashboard = personalSection === 'ventures' || personalSection === 'career' || personalSection === 'wealth' || personalSection === 'education' || personalSection === 'knowledge' || personalSection === 'relationships'
    ? GROWTH_DASHBOARD_DEFINITIONS[personalSection]
    : null
  const currentSectionDashboard = currentPersonalData?.dashboard ?? currentCoreDashboard ?? currentGrowthDashboard
  const currentDirective = PAGE_DIRECTIVES[currentPage]
  const primaryNextMove = currentSectionDashboard?.actionRows[0]?.title ??
    (isBusinessPage(currentPage)
      ? (topPendingReview ? `Review ${topPendingReview.taskTitle}` : 'Keep the operations lane clear')
      : 'Start with the strongest signal')
  const currentEvidenceLabel = currentPersonalData?.freshness?.label ??
    (isBusinessPage(currentPage) ? 'Live business runtime' : 'Projected personal records')
  const currentSignalQuality = currentPersonalData?.freshness?.stale ? 'Needs refresh' : appMode === 'business' ? 'Live feed' : 'Usable signal'

  const highlightCards = useMemo<ProjectionHighlightCard[]>(() => {
    if (!currentPersonalData) return []
    return currentPersonalData.highlights.slice(0, 3).map((item, index) => ({
      title: currentPersonalData.summaryCards[index]?.label ?? `Highlight ${index + 1}`,
      text: item,
    }))
  }, [currentPersonalData])

  const homeSignalCards = useMemo<HomeSignalCard[]>(() => {
    const identity = projectedSections.identity
    const ventures = projectedSections.ventures
    const systems = projectedSections.systems

    return [
      {
        kicker: 'Identity Signal',
        title: identity?.summaryCards[0]?.value ?? 'Mission profile coming into focus',
        body: identity?.heroSummary ?? 'Pulling the current identity projection from PunkRecords.',
      },
      {
        kicker: 'Venture Pressure',
        title: ventures?.summaryCards[0]?.value ?? 'Priority venture coming into focus',
        body: ventures?.heroSummary ?? 'Surfacing venture pressure and next decision from real records.',
      },
      {
        kicker: 'System Readiness',
        title: systems?.summaryCards[0]?.value ?? 'Operations signal coming into focus',
        body: systems?.heroSummary ?? 'Reading the current systems layer before presenting the command deck.',
      },
    ]
  }, [projectedSections])

  function navigateToPage(page: AppPage) {
    setCurrentPage(page)
    if (typeof window === 'undefined') return
    const nextPath = PAGE_ROUTES[page]
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
  }

  async function handleLoginSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (lockedOut) {
      setLoginError(`Too many attempts. Try again in ${lockoutSeconds}s.`)
      return
    }
    if (login.username === VALID_USERNAME && login.password === VALID_PASSWORD) {
      setAuthed(true)
      setLoginError(null)
      setAttempts(0)
      setLockoutUntil(0)
      storeLoginState({ attempts: 0, lockoutUntil: 0 })
      window.localStorage.setItem(SESSION_KEY, 'true')
      return
    }
    const nextAttempts = attempts + 1
    const nextLockout = nextAttempts >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
    setAttempts(nextAttempts)
    setLockoutUntil(nextLockout)
    storeLoginState({ attempts: nextAttempts, lockoutUntil: nextLockout })
    setLoginError(nextLockout ? 'Too many failed attempts. Temporary lockout enabled.' : `Incorrect login. ${Math.max(0, MAX_LOGIN_ATTEMPTS - nextAttempts)} tries left.`)
  }

  function logout() {
    setAuthed(false)
    window.localStorage.removeItem(SESSION_KEY)
  }

  async function decideReview(taskId: string, status: 'approved' | 'rejected') {
    try {
      if (status === 'rejected' && !(reviewNoteDrafts[taskId] || '').trim()) {
        setCommandResponse('Review hold: a denial needs notes so the next pass has clear direction.')
        return
      }
      const reviewTitle = selectedReviewItem?.taskTitle ?? taskId
      const reviewProject = selectedReviewItem?.projectTitle
      const notes = reviewNoteDrafts[taskId] || undefined
      await dashboardData.decideTaskApproval(taskId, status, notes)
      const action: BusinessCommandResponse['runtimeAction'] = {
        id: `review-${status}-${taskId}`,
        label: status === 'approved' ? 'Approve review item' : 'Reject review item',
        target: 'dashboard-runtime',
        status: 'executed',
        effect: status === 'approved'
          ? `Approval sent for ${reviewTitle}; the review lane can advance from this decision.`
          : `Denial sent for ${reviewTitle}; the next pass now has explicit review feedback.`,
        safety: status === 'approved'
          ? 'Approval used the explicit review button; no assistant or external message was dispatched by the command trail.'
          : 'Denial used the explicit review button and required notes before the live review update was sent.',
        provenance: [
          `task:${taskId}`,
          `decision:${status}`,
          reviewProject ? `project:${reviewProject}` : 'project:unknown',
          notes ? 'notes:present' : 'notes:none',
        ],
        executedAt: new Date().toISOString(),
      }
      setCommandHistory((prev) => [{ id: `${Date.now()}`, text: `${status === 'approved' ? 'Approved' : 'Rejected'} review: ${reviewTitle}`, context: 'business · review', action }, ...prev].slice(0, 6))
      setCommandResponse(status === 'approved' ? 'Approval sent. Business Command cleared this item and saved the review action trace.' : 'Denial sent with notes. The review lane now has feedback and a saved action trace.')
      setSelectedReviewTaskId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Approval action failed.'
      setCommandResponse(message)
    }
  }

  async function submitCommand() {
    if (!commandValue.trim()) return
    const trimmed = commandValue.trim()
    const commandContextLabel = `${appMode} · ${appMode === 'personal' ? personalSection : businessPanel}`
    try {
      const response = await sendBusinessCommand(trimmed, { appMode, personalSection, businessPanel }, businessSummary)
      const handoff = response.runtimeAction.target === 'assistant-runtime'
        ? await sendCommandHandoff(trimmed, commandContextLabel, response.runtimeAction)
        : undefined
      if (appMode === 'business' && response.suggestedPanel) {
        navigateToPage(response.suggestedPanel === 'agents' ? 'agents' : response.suggestedPanel === 'review' ? 'review-dock' : 'business-command')
      }
      setCommandHistory((prev) => [{ id: `${Date.now()}`, text: trimmed, context: commandContextLabel, action: response.runtimeAction, handoff }, ...prev].slice(0, 6))
      setCommandResponse(`Command routed to ${response.route}. ${response.message} Runtime action: ${response.runtimeAction.effect}${handoff ? ` Handoff: ${handoff.message}` : ''} Next move: ${response.nextAction}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Command routing failed.'
      setCommandHistory((prev) => [{ id: `${Date.now()}`, text: trimmed, context: commandContextLabel }, ...prev].slice(0, 6))
      setCommandResponse(message)
    }
    setCommandValue('')
  }

  function renderBusinessHero() {
    return (
      <article className="glass-panel hero-business-panel business-page-hero">
        <div>
          <div className="revamp-kicker">{businessPageCopy.kicker}</div>
          <h2>{businessPageCopy.title}</h2>
          <p>{businessPageCopy.body}</p>
        </div>
        <div className="business-panel-switches">
          {BUSINESS_NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              className={currentPage === item.page ? 'revamp-toggle active' : 'revamp-toggle'}
              onClick={() => navigateToPage(item.page as BusinessPage)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="business-hero-strip">
          <article className="business-signal-card">
            <span>Approval pressure</span>
            <strong>{businessSummary.approvalsPending}</strong>
            <p>{topPendingReview ? `Top queue item: ${topPendingReview.taskTitle}` : 'Review lane clear. New approval pressure will surface here with the next artifact.'}</p>
          </article>
          <article className="business-signal-card">
            <span>Runtime load</span>
            <strong>{queueHealth?.runnable_count ?? 0} runnable</strong>
            <p>{queueHealth?.flagged_count ?? 0} flagged tasks need attention.</p>
          </article>
          <article className="business-signal-card">
            <span>Output today</span>
            <strong>{businessSummary.publishedToday}</strong>
            <p>{recentActivity[0] ? `${recentActivity[0].taskTitle} · ${recentActivity[0].eventType}` : 'Output lane quiet. The next publication event will become the lead signal.'}</p>
          </article>
        </div>
      </article>
    )
  }

  function renderBusinessMetricGrid() {
    return (
      <section className="revamp-card-grid business-metric-grid">
        <article className="glass-panel business-metric-card"><span>Ventures</span><strong>{dashboardData.projects.length}</strong><p>Tracked projects visible in Supabase.</p></article>
        <article className="glass-panel business-metric-card"><span>Revenue / Margin</span><strong>{formatUsd(businessSummary.revenueUsd)} / {formatUsd(businessSummary.marginUsd)}</strong><p>Latest live business snapshot.</p></article>
        <article className="glass-panel business-metric-card"><span>Approval Pressure</span><strong>{businessSummary.approvalsPending}</strong><p>Items waiting in review.</p></article>
        <article className="glass-panel business-metric-card"><span>Recent Output</span><strong>{businessSummary.publishedToday} today</strong><p>{recentActivity[0] ? `${recentActivity[0].taskTitle} · ${recentActivity[0].eventType}` : 'Output lane quiet. The command deck is ready for the next release cycle.'}</p></article>
      </section>
    )
  }

  function renderReviewDockPanel(mode: 'full' | 'compact') {
    return (
      <article className={`glass-panel review-dock-panel ${mode === 'full' ? 'review-dock-full' : ''}`}>
        <div className="revamp-kicker">Review Dock</div>
        {selectedReviewItem ? (
          <>
            <h3>{selectedReviewItem.taskTitle}</h3>
            <p>{selectedReviewItem.projectTitle ?? 'Unassigned project'} · {selectedReviewItem.artifactType}</p>
            <div className="review-dock-meta">
              <div>
                <span>Status</span>
                <strong>{selectedReviewItem.approvalStatus}</strong>
              </div>
              <div>
                <span>Artifacts</span>
                <strong>{selectedReviewDetail ? selectedReviewDetail.artifacts.length : 0}</strong>
              </div>
              <div>
                <span>Approvals</span>
                <strong>{selectedReviewDetail ? selectedReviewDetail.approvals.length : 0}</strong>
              </div>
            </div>
            {selectedReviewDetail ? (
              <div className="review-detail-stack">
                <div className="review-detail-card">
                  <span>Latest event</span>
                  <strong>{selectedReviewDetail.events[0]?.event_type ?? 'No event yet'}</strong>
                  <p>{(() => {
                    const payload = selectedReviewDetail.events[0]?.payload
                    if (payload && typeof payload === 'object') {
                      const reason = payload.reason
                      const comment = payload.comment
                      const decision = payload.decision
                      if (typeof reason === 'string' && reason.trim()) return reason
                      if (typeof comment === 'string' && comment.trim()) return comment
                      if (typeof decision === 'string' && decision.trim()) return decision
                    }
                    return 'This review item has not emitted a detailed event note yet.'
                  })()}</p>
                </div>
                <div className="review-detail-card">
                  <span>Latest artifact</span>
                  <strong>{selectedReviewDetail.artifacts[0]?.filename ?? selectedReviewDetail.artifacts[0]?.artifact_type ?? 'No artifact yet'}</strong>
                  <p>{selectedReviewDetail.artifacts[0]?.mime_type ?? 'Artifact metadata will appear here when available.'}</p>
                </div>
              </div>
            ) : null}
            <textarea className="review-note-input" placeholder="Add approval notes, or enter the required reason for a denial" value={reviewNoteDrafts[selectedReviewItem.taskId] || ''} onChange={(e) => setReviewNoteDrafts((prev) => ({ ...prev, [selectedReviewItem.taskId]: e.target.value }))} />
            <div className="review-actions">
              <button className="revamp-command-btn solid" onClick={() => void decideReview(selectedReviewItem.taskId, 'approved')}>Approve</button>
              <button className="revamp-lock-btn" onClick={() => void decideReview(selectedReviewItem.taskId, 'rejected')}>Deny</button>
            </div>
          </>
        ) : (
          <BusinessEmptyState
            label="Review dock"
            title="Approval lane clear"
            body="The next artifact requiring a decision will pin here with status, provenance, and action controls."
          />
        )}
      </article>
    )
  }

  function renderReviewQueue() {
    return (
      <article className="glass-panel business-list-panel">
        <div className="revamp-kicker">Review Queue</div>
        <div className="business-row-list">
          {reviewQueue.length > 0 ? reviewQueue.map((item) => (
            <button
              key={item.artifactId}
              className={selectedReviewItem?.taskId === item.taskId ? 'business-row-button active' : 'business-row-button'}
              onClick={() => setSelectedReviewTaskId(item.taskId)}
            >
              <span>{item.approvalStatus} · {item.artifactType}</span>
              <strong>{item.taskTitle}</strong>
              <p>{item.projectTitle ?? 'Unassigned project'}</p>
            </button>
          )) : (
            <BusinessEmptyState
              label="Review queue"
              title="No artifacts waiting"
              body="Pending drafts, delivery notes, and packages will appear here when they need an explicit decision."
            />
          )}
        </div>
      </article>
    )
  }

  function renderAgentDashboard() {
    return (
      <main className="business-page-layout agents-page-layout">
        {renderBusinessHero()}
        {renderBusinessMetricGrid()}
        <section className="business-two-column">
          <article className="glass-panel business-main-panel">
            <div className="revamp-kicker">Agent Workload</div>
            <div className="agent-card-grid agent-workload-grid">
              {businessAgents.length > 0 ? businessAgents.map((agent) => (
                <div key={agent.id} className="agent-card-shell neon-agent-card">
                  <span>{agent.chamberLabel} · {agent.status}</span>
                  <strong>{agent.displayName}</strong>
                  <p>{agent.role} · {agent.taskCount} active task{agent.taskCount === 1 ? '' : 's'}</p>
                  <p>{agent.tasks[0] ? `Current: ${agent.tasks[0].title}` : 'Standing by for the next assigned task.'}</p>
                  <div className="agent-card-meta">
                    <code>{agent.runCount} runs</code>
                    <code>{formatUsd(agent.totalCostUsd)}</code>
                  </div>
                </div>
              )) : (
                <BusinessEmptyState
                  label="Agent hierarchy"
                  title="No active chambers reporting"
                  body="The hierarchy stays ready for the next runtime sync with a clear, intentional quiet state."
                />
              )}
            </div>
          </article>
          <aside className="business-side-stack">
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Watchdog</div>
              <div className="business-row-list">
                {watchdogRows.length > 0 ? watchdogRows.map((item) => (
                  <div key={item.id} className="business-row-card">
                    <span>Severity {item.severity} · {item.status}</span>
                    <strong>{item.task_title}</strong>
                    <p>{item.project} · {item.watchdog_reason}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Watchdog"
                    title="No active alerts"
                    body="Flagged, stale, and retry-loop work will surface here with owner and task context."
                  />
                )}
              </div>
            </article>
            <RuntimeTrailPanel items={actionTrail} />
          </aside>
        </section>
      </main>
    )
  }

  function renderBusinessCommandDashboard() {
    return (
      <main className="business-page-layout">
        {renderBusinessHero()}
        {renderBusinessMetricGrid()}
        <section className="business-two-column">
          <article className="glass-panel business-main-panel">
            <div className="revamp-kicker">Pipeline Now</div>
            <div className="business-row-list">
              {pipelineRows.length > 0 ? pipelineRows.map((item) => (
                <div key={`${item.project}-${item.status}`} className="business-row-card">
                  <span>{item.status}</span>
                  <strong>{item.project}</strong>
                  <p>{item.count} task{item.count === 1 ? '' : 's'} in this lane.</p>
                </div>
              )) : (
                <BusinessEmptyState
                  label="Pipeline"
                  title="No live pipeline rows"
                  body="Business Command will show project lanes, task counts, and pressure when the runtime reports them."
                />
              )}
            </div>
          </article>
          <aside className="business-side-stack">
            {renderReviewDockPanel('compact')}
            <RuntimeTrailPanel items={actionTrail} />
          </aside>
        </section>
      </main>
    )
  }

  function renderReviewDockDashboard() {
    return (
      <main className="business-page-layout review-page-layout">
        {renderBusinessHero()}
        <section className="business-two-column review-command-grid">
          {renderReviewDockPanel('full')}
          <aside className="business-side-stack">
            {renderReviewQueue()}
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Recent Review Events</div>
              <div className="business-row-list">
                {recentRuntimeActivity.length > 0 ? recentRuntimeActivity.map((item) => (
                  <div key={item.id} className="business-row-card">
                    <span>{item.eventType}</span>
                    <strong>{item.taskTitle}</strong>
                    <p>{item.detail ?? item.projectTitle ?? 'Event detail unavailable.'}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Review events"
                    title="No recent events"
                    body="Review approvals, denials, and artifact updates will appear here after the runtime emits them."
                  />
                )}
              </div>
            </article>
          </aside>
        </section>
      </main>
    )
  }

  function renderRuntimeTrailDashboard() {
    return (
      <main className="business-page-layout runtime-page-layout">
        {renderBusinessHero()}
        <section className="business-two-column runtime-command-grid">
          <RuntimeTrailPanel items={runtimeTrailItems} />
          <aside className="business-side-stack">
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Safety Boundary</div>
              <div className="business-row-list">
                {runtimeTrailItems.length > 0 ? runtimeTrailItems.map((item) => (
                  <div key={item.id} className="business-row-card">
                    <span>{item.context}</span>
                    <strong>{item.action?.label ?? item.text}</strong>
                    <p>{item.handoff?.safety ?? item.action?.safety ?? 'Recorded without dispatching external work.'}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Safety"
                    title="No runtime actions yet"
                    body="Commands and review decisions will list their safety notes, audit ids, and provenance here."
                  />
                )}
              </div>
            </article>
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Handoff Status</div>
              <div className="business-row-list">
                {runtimeTrailItems.filter((item) => item.handoff).length > 0 ? runtimeTrailItems.filter((item) => item.handoff).map((item) => (
                  <div key={`${item.id}-handoff`} className="business-row-card">
                    <span>{item.handoff?.status.replace(/_/g, ' ')}</span>
                    <strong>{item.handoff?.auditId}</strong>
                    <p>{item.handoff?.message}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Handoffs"
                    title="No assistant handoffs recorded"
                    body="Same-origin handoff attempts will be listed here with audit ids and requires-approval status."
                  />
                )}
              </div>
            </article>
          </aside>
        </section>
      </main>
    )
  }

  if (!authed) {
    return (
      <div className="revamp-login-shell">
        <div className="revamp-login-grid" />
        <form className="revamp-login-card" onSubmit={handleLoginSubmit}>
          <div className="revamp-kicker">Private Control Center</div>
          <h1>Dark Tech Access</h1>
          <p>Private access into the live dark-tech control center.</p>
          <label><span>Username</span><input value={login.username} onChange={(e) => setLogin((prev) => ({ ...prev, username: e.target.value }))} autoComplete="username" /></label>
          <label><span>Password</span><input type="password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} autoComplete="current-password" /></label>
          <button type="submit" disabled={lockedOut}>{lockedOut ? `Locked · ${lockoutSeconds}s` : 'Enter Control Center'}</button>
          <div className="revamp-login-meta">{loginError ?? `Attempts used: ${attempts}/${MAX_LOGIN_ATTEMPTS}`}</div>
        </form>
      </div>
    )
  }

  return (
    <div className="revamp-shell">
      <div className="revamp-shell-bg" />
      <header className="revamp-topbar">
        <div>
          <div className="revamp-kicker">Mitchell Control Center</div>
          <h1>{pageLabel(currentPage)}</h1>
          <p>{currentDirective.outcome}. {currentDirective.system}</p>
        </div>
        <div className="revamp-top-actions">
          <button className={appMode === 'personal' ? 'revamp-toggle active' : 'revamp-toggle'} onClick={() => navigateToPage('home')}>Personal</button>
          <button className={appMode === 'business' ? 'revamp-toggle active' : 'revamp-toggle'} onClick={() => navigateToPage('business-command')}>Business</button>
          <button className="revamp-command-btn" onClick={() => setCommandOpen(true)}>Command</button>
          <button className="revamp-lock-btn" onClick={logout}>Lock</button>
        </div>
      </header>

      <nav className="app-nav-shell" aria-label="Control center sections">
        <section>
          <div className="app-nav-heading">Personal Dashboards</div>
          <div className="app-nav-grid">
            {PERSONAL_NAV_ITEMS.map((item) => (
              <button key={item.page} className={currentPage === item.page ? 'app-nav-item active' : 'app-nav-item'} onClick={() => navigateToPage(item.page)}>
                <span>{item.label}</span>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
        </section>
        <section>
          <div className="app-nav-heading">Business Operations</div>
          <div className="app-nav-grid business">
            {BUSINESS_NAV_ITEMS.map((item) => (
              <button key={item.page} className={currentPage === item.page ? 'app-nav-item active' : 'app-nav-item'} onClick={() => navigateToPage(item.page)}>
                <span>{item.label}</span>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
        </section>
      </nav>

      <section className="daily-command-strip" aria-label="Current command summary">
        <article className="daily-command-primary">
          <span>Best next move</span>
          <strong>{primaryNextMove}</strong>
          <p>{currentDirective.usefulFor}</p>
        </article>
        <article>
          <span>Signal quality</span>
          <strong>{currentSignalQuality}</strong>
          <p>{currentEvidenceLabel}</p>
        </article>
        <article>
          <span>Cadence</span>
          <strong>{currentDirective.cadence}</strong>
          <p>Designed for fast scanning, then deeper action only when needed.</p>
        </article>
        <article className="daily-command-action">
          <span>Command lane</span>
          <strong>Ask, route, decide</strong>
          <button className="revamp-command-btn solid" onClick={() => setCommandOpen(true)}>Open command</button>
        </article>
      </section>

      <section className="revamp-status-ribbon">
        <div><span>Current route</span><strong>{currentPath}</strong></div>
        <div><span>Section</span><strong>{pageLabel(currentPage)}</strong></div>
        <div><span>Mode</span><strong>{appMode === 'personal' ? 'Personal OS' : 'Business operations'}</strong></div>
        <div><span>Navigation</span><strong>Direct pages active</strong></div>
      </section>

      {appMode === 'personal' ? (
        personalSection === 'home' ? (
          <main className="revamp-home-grid">
            <section className="avatar-stage-card">
              <div className="avatar-stage-copy">
                <div className="revamp-kicker">Home Overview</div>
                <h2>Operating map for the day</h2>
                <p>Home summarizes the strongest personal and business signals, then routes into the dedicated dashboards that carry the actual work.</p>
              </div>
              <div className="avatar-stage-shell">
                <div className="avatar-stage-hud">
                  <div>
                    <span className="hud-label">Identity</span>
                    <strong>{projectedSections.identity?.summaryCards[0]?.value ?? 'Identity profile loading'}</strong>
                  </div>
                  <div>
                    <span className="hud-label">Business load</span>
                    <strong>{queueHealth?.runnable_count ?? 0} runnable</strong>
                  </div>
                  <div>
                    <span className="hud-label">Review pressure</span>
                    <strong>{businessSummary.approvalsPending} pending</strong>
                  </div>
                </div>
                <div className="avatar-stage-visual premium-stage-frame">
                  <Suspense fallback={<div className="visual-loading">Preparing the avatar stage…</div>}>
                    <SpaceScene activeAgents={businessAgents.length} flaggedCount={queueHealth?.flagged_count ?? 0} />
                  </Suspense>
                  {avatarAssetStatus !== 'missing' ? (
                    <img
                      className={`avatar-stage-asset ${avatarAssetStatus}`}
                      src={AVATAR_ASSET_PATH}
                      alt="Mitchell control center avatar"
                      decoding="async"
                      onLoad={() => setAvatarAssetStatus('ready')}
                      onError={() => setAvatarAssetStatus('missing')}
                    />
                  ) : null}
                </div>
                <div className="avatar-stage-signals">
                  {homeSignalCards.map((card) => (
                    <article key={card.kicker} className="home-signal-card">
                      <span>{card.kicker}</span>
                      <strong>{card.title}</strong>
                      <p>{card.body}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="avatar-node-rack">
                {PERSONAL_NODES.map((node) => (
                  <button key={node.key} className={`avatar-node-pill ${node.tier}`} onClick={() => navigateToPage(node.key)}>{node.label}</button>
                ))}
              </div>
              <div className="growth-loop-board">
                {GROWTH_LOOP_CARDS.map((item, index) => (
                  <button key={item.page} className="growth-loop-card" onClick={() => navigateToPage(item.page)}>
                    <span>0{index + 1} · {item.label}</span>
                    <strong>{item.command}</strong>
                    <small>{item.result}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="revamp-side-stack">
              <article className="glass-panel focus-panel">
                <div className="revamp-kicker">Personal Focus</div>
                <h3>{projectedSections.identity?.summaryCards[1]?.value ?? 'Ideal self profile loading'}</h3>
                <p>{projectedSections.identity?.summaryCards[1]?.note ?? 'Identity projections shape the home presentation around grounded personal context.'}</p>
              </article>
              <article className="glass-panel pulse-panel">
                <div className="revamp-kicker">Business Pulse</div>
                <h3>{queueHealth?.runnable_count ?? 0} runnable, {queueHealth?.flagged_count ?? 0} flagged</h3>
                <p>{topPendingReview ? `Top review pressure: ${topPendingReview.taskTitle}` : 'The business grid is ready for the next workflow wave, with room to move the highest-leverage task forward.'}</p>
              </article>
              <RuntimeTrailPanel items={actionTrail} />
              <article className="glass-panel principle-panel">
                <div className="revamp-kicker">Simple Growth Logic</div>
                <h3>Decide, execute, energize, compound</h3>
                <p>The home page now acts like an operating map: it shows the most useful loop first, then lets each dedicated dashboard carry its own deeper work.</p>
              </article>
            </section>
          </main>
        ) : (
          <main className="revamp-detail-page">
            <section className="revamp-detail-hero">
              <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
              <div>
                <div className="revamp-kicker">{currentPersonalContent?.eyebrow}</div>
                <h2>{currentPersonalContent?.title}</h2>
                <p>{currentPersonalData?.heroSummary}</p>
              </div>
              <aside className="section-utility-card">
                <span>{currentDirective.cadence}</span>
                <strong>{currentDirective.outcome}</strong>
                <p>{currentDirective.usefulFor}</p>
              </aside>
            </section>
            <section className="revamp-card-grid">
              {currentPersonalData?.summaryCards.map((card) => (
                <article key={card.label} className={`glass-panel detail-signal-card${card.stale ? ' stale' : ''}`}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.note}</p>
                </article>
              ))}
            </section>
            <section className="section-dashboard-grid">
              {currentSectionDashboard ? (
                <>
                  <article className={`glass-panel section-main-panel core-dashboard-panel${currentGrowthDashboard ? ' growth-dashboard-panel' : ''}`}>
                    <div className="revamp-kicker">Operating Dashboard</div>
                    <h3>{currentSectionDashboard.headline}</h3>
                    <div className="core-meter-grid">
                      {currentSectionDashboard.metrics.map((metric) => {
                        const card = currentPersonalData?.summaryCards[metric.sourceCardIndex]
                        return (
                          <div key={metric.label} className={`core-meter ${metric.priority}`}>
                            <span>{metric.label}</span>
                            <strong>{card?.value ?? 'No signal yet'}</strong>
                            <p>{card?.note ?? 'This signal is waiting on source coverage.'}</p>
                          </div>
                        )
                      })}
                    </div>
                    <div className="section-signal-list core-operating-list">
                      {currentSectionDashboard.operatingRows.map((item) => {
                        const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData?.summaryCards[item.sourceCardIndex] : undefined
                        return (
                          <div key={item.title} className={`section-signal-row${card?.stale ? ' stale' : ''}`}>
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                            {card ? <small>{card.label}: {card.value}</small> : null}
                          </div>
                        )
                      })}
                    </div>
                  </article>
                  <article className={`glass-panel section-evidence-panel${currentPersonalData?.freshness?.stale ? ' stale' : ''}`}>
                    <div className="revamp-kicker">Source And Evidence</div>
                    <h3>{currentPersonalData?.freshness?.label ?? 'Projection source status'}</h3>
                    <p>{currentPersonalData?.freshness ? (currentPersonalData.freshness.ageDays == null ? 'Source recency has not been established yet.' : `${currentPersonalData.freshness.ageDays} day${currentPersonalData.freshness.ageDays === 1 ? '' : 's'} since latest source update.`) : 'This page is using the current generated projection layer until the richer source model lands.'}</p>
                    <div className="core-source-list">
                      {currentSectionDashboard.evidenceRows.map((item) => {
                        const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData?.summaryCards[item.sourceCardIndex] : undefined
                        return (
                          <div key={item.title}>
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                            {card ? <span>{card.value}</span> : null}
                          </div>
                        )
                      })}
                    </div>
                    <div className="projection-context-grid">
                      {(currentPersonalData?.blockers ?? []).length > 0 ? (
                        <div className="projection-context-group">
                          <span>Blockers</span>
                          {(currentPersonalData?.blockers ?? []).slice(0, 2).map((item) => (
                            <div key={`${item.label}-${item.value}`} className={`projection-context-item ${item.severity ?? 'watch'}`}>
                              <strong>{item.label}: {item.value}</strong>
                              <p>{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {(currentPersonalData?.missingData ?? []).length > 0 ? (
                        <div className="projection-context-group">
                          <span>Missing Data</span>
                          {(currentPersonalData?.missingData ?? []).slice(0, 2).map((item) => (
                            <div key={`${item.label}-${item.value}`} className={`projection-context-item ${item.severity ?? 'watch'}`}>
                              <strong>{item.label}: {item.value}</strong>
                              <p>{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {(currentPersonalData?.timeline ?? []).length > 0 ? (
                        <div className="projection-context-group">
                          <span>Recency</span>
                          {(currentPersonalData?.timeline ?? []).slice(0, 2).map((item) => (
                            <div key={`${item.label}-${item.recency}`} className={`projection-context-item ${item.severity ?? 'watch'}`}>
                              <strong>{item.label}: {item.recency}</strong>
                              <p>{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                  <article className="glass-panel section-action-panel">
                    <div className="revamp-kicker">Action Lane</div>
                    <h3>Next moves</h3>
                    <div className="section-action-list">
                      {currentSectionDashboard.actionRows.map((item) => {
                        const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData?.summaryCards[item.sourceCardIndex] : undefined
                        return (
                          <div key={item.title} className={`section-action-item${card?.stale ? ' stale' : ''}`}>
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                            {card ? <small>{card.label}: {card.note}</small> : null}
                          </div>
                        )
                      })}
                    </div>
                  </article>
                </>
              ) : (
                <>
                  <article className="glass-panel section-main-panel">
                    <div className="revamp-kicker">Operating Dashboard</div>
                    <h3>{currentPersonalContent?.title} command view</h3>
                    <div className="section-signal-list">
                      {highlightCards.map((item) => (
                        <div key={item.title} className="section-signal-row">
                          <strong>{item.title}</strong>
                          <p>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                  <article className="glass-panel section-evidence-panel">
                    <div className="revamp-kicker">Source And Evidence</div>
                    <h3>{currentPersonalData?.freshness?.label ?? 'Projection source status'}</h3>
                    <p>{currentPersonalData?.freshness ? (currentPersonalData.freshness.ageDays == null ? 'Source recency has not been established yet.' : `${currentPersonalData.freshness.ageDays} day${currentPersonalData.freshness.ageDays === 1 ? '' : 's'} since latest source update.`) : 'This page is using the current generated projection layer until the richer source model lands.'}</p>
                    <div className="evidence-chip-row">
                      {(currentPersonalContent?.highlights ?? []).slice(0, 4).map((item) => <span key={item}>{item}</span>)}
                    </div>
                  </article>
                  <article className="glass-panel section-action-panel">
                    <div className="revamp-kicker">Action Lane</div>
                    <h3>Next moves</h3>
                    <div className="section-action-list">
                      {(currentPersonalData?.summaryCards ?? []).slice(0, 3).map((card) => (
                        <div key={card.label} className="section-action-item">
                          <strong>{card.label}</strong>
                          <p>{card.note}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                </>
              )}
            </section>
          </main>
        )
      ) : dashboardData.loading ? (
        <main className="revamp-business-grid">
          <section className="revamp-business-main">
            <article className="glass-panel hero-business-panel state-panel">
              <div className="revamp-kicker">Business Command</div>
              <h2>Syncing live operations</h2>
              <p>The control center is pulling the latest queue, review, and publishing signals from the runtime.</p>
            </article>
          </section>
          <aside className="revamp-business-side">
            <article className="glass-panel review-dock-panel state-panel">
              <div className="revamp-kicker">Review Dock</div>
              <p>Preparing the next approval lane.</p>
            </article>
          </aside>
        </main>
      ) : dashboardData.error ? (
        <main className="revamp-business-grid">
          <section className="revamp-business-main">
            <article className="glass-panel hero-business-panel state-panel error">
              <div className="revamp-kicker">Business Command</div>
              <h2>Runtime signal interrupted</h2>
              <p>{dashboardData.error}</p>
            </article>
          </section>
          <aside className="revamp-business-side">
            <article className="glass-panel review-dock-panel state-panel error">
              <div className="revamp-kicker">Review Dock</div>
              <p>Live review data will return here once the runtime connection stabilizes.</p>
            </article>
          </aside>
        </main>
      ) : currentPage === 'agents' ? renderAgentDashboard()
        : currentPage === 'review-dock' ? renderReviewDockDashboard()
          : currentPage === 'runtime-trail' ? renderRuntimeTrailDashboard()
            : renderBusinessCommandDashboard()}

      {commandOpen ? (
        <div className="command-overlay">
          <div className="command-modal revamp-command-modal">
            <div className="command-modal-top">
              <div>
                <div className="revamp-kicker">Spotlight Command</div>
                <div className="shell-submark">Natural-language control across personal and business operations</div>
              </div>
              <button className="revamp-lock-btn" onClick={() => setCommandOpen(false)}>Close</button>
            </div>
            <div className="command-context">Context: {appMode} · {appMode === 'personal' ? personalSection : businessPanel}</div>
            <div className="command-suggestion-row">
              {commandSuggestions.map((item) => (
                <button key={item.label} className="command-suggestion-chip" onClick={() => setCommandValue(item.prompt)}>{item.label}</button>
              ))}
            </div>
            <div className="command-input-wrap">
              <input autoFocus placeholder="Tell the control center what you want to do..." value={commandValue} onChange={(e) => setCommandValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void submitCommand() }} />
              <button className="revamp-command-btn solid" onClick={() => void submitCommand()}>Send</button>
            </div>
            <div className="command-preview-panel">
              <span>Routing preview</span>
              {commandPreview ? (
                <>
                  <strong>{commandPreview.route} · {commandPreview.intent.replace(/_/g, ' ')}</strong>
                  <p>{commandPreview.summary}</p>
                  <p className="command-preview-next">Next: {commandPreview.nextAction}</p>
                </>
              ) : (
                <>
                  <strong>Awaiting command</strong>
                  <p>Type a request to see the route, intent, and next action before it moves through the command lane.</p>
                </>
              )}
            </div>
            <div className="command-response-box">
              <span>Latest response</span>
              <strong>Command status</strong>
              <p>{commandResponse}</p>
            </div>
            <div className="command-history">
              <h3>Recent commands</h3>
              {commandHistory.length === 0 ? <p>The command lane is open and ready for the first move in this session.</p> : (
                <div className="command-history-list">
                  {commandHistory.map((item) => (
                    <div key={item.id} className="history-chip command-history-card">
                      <span>{item.context}</span>
                      <strong>{item.text}</strong>
                      {item.action ? (
                        <div className="command-action-trace">
                          <p><b>{item.action.label}</b> · {item.action.status.replace(/_/g, ' ')}</p>
                          <p>{item.action.effect}</p>
                          <p className="command-action-safety">{item.action.safety}</p>
                          <div className="command-action-meta">
                            <span>{formatActionTime(item.action.executedAt)}</span>
                            {item.action.provenance.map((entry) => <code key={entry}>{entry}</code>)}
                          </div>
                          {item.handoff ? (
                            <div className="command-handoff-trace">
                              <p><b>{item.handoff.status.replace(/_/g, ' ')}</b> · {item.handoff.message}</p>
                              <p>{item.handoff.safety}</p>
                              <div className="command-action-meta">
                                <span>{item.handoff.auditId}</span>
                                <span>{formatActionTime(item.handoff.recordedAt)}</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
