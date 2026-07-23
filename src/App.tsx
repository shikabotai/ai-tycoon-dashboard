import { Suspense, lazy, useEffect, useMemo, useState, type CSSProperties } from 'react'
import './App.css'
import { useDashboardData } from './hooks/useDashboardData'
import { loadProjectedSection, type PersonalProjectionKey } from './data/personalProjectionClient'
import type { IdentityQualityProjection, ProjectedDashboard, ProjectedSection as LiveProjectedSection } from './data/projectedTypes'
import { sendBusinessCommand, sendCommandHandoff } from './data/businessCommandApi'
import { routeCommand } from './data/commandRouter'
import type { CommandHandoffResponse } from './server/commandHandoffApi'
import type { BusinessCommandResponse } from './server/commandRouteApi'

const AvatarModelScene = lazy(async () => {
  const mod = await import('./components/AvatarModelScene')
  return { default: mod.AvatarModelScene }
})

type AppMode = 'personal' | 'business'
type PersonalSection = 'home' | 'vessel' | 'identity' | 'career' | 'wealth' | 'ventures' | 'systems' | 'education' | 'relationships' | 'knowledge'
type BusinessPanel = 'overview' | 'agents' | 'review'
type BusinessPage = 'business-command' | 'agents' | 'review-dock' | 'runtime-trail'
type AppPage = PersonalSection | BusinessPage
type LoginState = { username: string; password: string }
type PersonalSectionData = LiveProjectedSection
type ProjectionHighlightCard = { title: string; text: string }
type CommandHistoryEntry = { id: string; text: string; context: string; action?: BusinessCommandResponse['runtimeAction']; handoff?: CommandHandoffResponse }
type CommandSuggestion = { label: string; prompt: string }
type QuickAction = { label: string; detail: string; prompt?: string; page?: AppPage }
type EmptyStateProps = { label: string; title: string; body: string }
type CoreDashboardSection = Extract<PersonalSection, 'vessel' | 'identity' | 'systems'>
type GrowthDashboardSection = Extract<PersonalSection, 'ventures' | 'career' | 'wealth' | 'education' | 'knowledge' | 'relationships'>
type CoreDashboardDefinition = ProjectedDashboard

type HomeConstellationNode = {
  key: Exclude<PersonalSection, 'home'>
  label: string
  tier: 'core' | 'secondary'
  x: number
  y: number
  anchorX: number
  anchorY: number
  tone: 'body' | 'mind' | 'ops' | 'growth' | 'capital' | 'connection'
}
type NavItem = { page: AppPage; label: string; description: string }
type PageDirective = { outcome: string; system: string; usefulFor: string; cadence: string }
type GrowthLoopDefinition = {
  target: string
  ritual: string
  blocker: string
  compound: string
  cadence: string
}
type CategoryDashboardKind = 'vessel-cockpit' | 'identity-compass' | 'systems-triage' | 'venture-radar' | 'career-ladder' | 'wealth-flow' | 'education-runway' | 'knowledge-forge' | 'relationship-orbit'
type CategorySignatureDashboard = {
  kind: CategoryDashboardKind
  eyebrow: string
  title: string
  readoutLabel: string
  readoutSourceIndex: number
  readoutUnit: string
  mapLabel: string
  mapItems: Array<{ label: string; sourceIndex: number }>
  lenses: Array<{ label: string; title: string; body: string; sourceIndex: number }>
}
type CrossDomainInsight = {
  label: string
  title: string
  body: string
  recommendation: string
  evidence: string
  pages: Exclude<PersonalSection, 'home'>[]
  tone: 'leverage' | 'tradeoff' | 'evidence'
}
type IdentityQuality = IdentityQualityProjection

const VALID_USERNAME = 'mthanath64'
const VALID_PASSWORD = 'Mitch2002'
const MAX_LOGIN_ATTEMPTS = 10
const LOCKOUT_MS = 10 * 60 * 1000
const SESSION_KEY = 'control-center-auth'
const LOGIN_STATE_KEY = 'control-center-login-state'
const COMMAND_HISTORY_KEY = 'control-center-command-history'
const IDENTITY_QUALITIES_KEY = 'control-center-identity-qualities'
const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')
const AVATAR_MODEL_VERSION = 'model-7-20260712'
const AVATAR_MODEL_PATH = `${appAssetPath('avatar/control-center-avatar.glb')}?v=${AVATAR_MODEL_VERSION}`

const DEFAULT_IDENTITY_QUALITIES: IdentityQuality[] = [
  { id: 'discipline', name: 'Discipline', score: 6.2, tenMeans: 'Keeps promises without needing drama or motivation.', nextAction: 'Choose the top task and finish it before drifting.', source: 'Fallback identity projection' },
  { id: 'presence', name: 'Presence', score: 5.4, tenMeans: 'Fully here with people, work, and rest.', nextAction: 'Put the phone away during the next real moment.', source: 'Fallback identity projection' },
  { id: 'physical-confidence', name: 'Physical confidence', score: 4.3, tenMeans: 'Feels strong, lean, energetic, and comfortable in a room.', nextAction: 'Protect the next lift or nutrition log.', source: 'Fallback identity projection' },
  { id: 'social-confidence', name: 'Social confidence', score: 4.8, tenMeans: 'Warm, playful, grounded, and easy to connect with.', nextAction: 'Create one small moment of connection today.', source: 'Fallback identity projection' },
  { id: 'reliability', name: 'Reliability', score: 7.1, tenMeans: 'Does what he says, especially when no one is watching.', nextAction: 'Close one open promise before starting another.', source: 'Fallback identity projection' },
]

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

function appAssetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

function browserPathForRoute(route: string) {
  if (!APP_BASE_PATH) return route
  return route === '/' ? `${APP_BASE_PATH}/` : `${APP_BASE_PATH}${route}`
}

function appPathFromBrowserPath(pathname: string) {
  if (!APP_BASE_PATH) return pathname
  if (pathname === APP_BASE_PATH) return '/'
  if (pathname.startsWith(`${APP_BASE_PATH}/`)) return pathname.slice(APP_BASE_PATH.length) || '/'
  return pathname
}

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
    system: 'Identity statement, score gaps, focus, and blockers kept in one decision frame.',
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

const HOME_CONSTELLATION_NODES: HomeConstellationNode[] = [
  { key: 'identity', label: 'Identity', tier: 'core', x: 50, y: 5, anchorX: 50, anchorY: 30, tone: 'mind' },
  { key: 'vessel', label: 'Vessel', tier: 'core', x: 82, y: 28, anchorX: 57, anchorY: 43, tone: 'body' },
  { key: 'systems', label: 'Systems', tier: 'core', x: 84, y: 56, anchorX: 61, anchorY: 54, tone: 'ops' },
  { key: 'ventures', label: 'Ventures', tier: 'core', x: 69, y: 82, anchorX: 55, anchorY: 67, tone: 'growth' },
  { key: 'career', label: 'Career', tier: 'core', x: 31, y: 82, anchorX: 45, anchorY: 67, tone: 'growth' },
  { key: 'wealth', label: 'Wealth', tier: 'core', x: 16, y: 56, anchorX: 39, anchorY: 57, tone: 'capital' },
  { key: 'relationships', label: 'Relationships', tier: 'secondary', x: 18, y: 31, anchorX: 40, anchorY: 34, tone: 'connection' },
  { key: 'education', label: 'Education', tier: 'secondary', x: 34, y: 18, anchorX: 45, anchorY: 34, tone: 'mind' },
  { key: 'knowledge', label: 'Knowledge', tier: 'secondary', x: 66, y: 18, anchorX: 55, anchorY: 34, tone: 'mind' },
]

function pageFromPath(pathname: string): AppPage {
  const normalized = appPathFromBrowserPath(pathname).replace(/\/+$/, '') || '/'
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

function sourceConfidence(section?: LiveProjectedSection) {
  if (!section) return 'Assembling'
  if (section.freshness?.stale) return 'Needs refresh'
  if ((section.missingData?.length ?? 0) > 0) return 'Partial'
  return 'Grounded'
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
  vessel: { eyebrow: 'Body and performance', title: 'Vessel', summaryCards: ['Body metrics', 'Workout log source', 'Nutrition log source', 'Meditation log source'], highlights: ['Recent workouts and body trends', 'Cut / recomp progress', 'Source-backed health signals'] },
  identity: { eyebrow: 'Internal command', title: 'Identity', summaryCards: ['Identity statement', 'Ideal self alignment', 'Current mission', 'Top active goals'], highlights: ['Ideal Self and Annual Goals', 'Decision Engine and blockers', 'Alignment-first momentum view'] },
  career: { eyebrow: 'Trajectory and leverage', title: 'Career', summaryCards: ['Career trajectory', 'Portfolio readiness', 'Job search status', 'Next milestone'], highlights: ['Career strategy overviews', 'Portfolio readiness', 'Real repo opportunities'] },
  wealth: { eyebrow: 'Capital and strategy', title: 'Wealth', summaryCards: ['Net worth', 'Cash / liquidity', 'Income snapshot', 'Financial priorities'], highlights: ['Budget and cashflow strategy', 'Current priorities surfaced fast', 'Balanced present and future view'] },
  ventures: { eyebrow: 'Personal venture strategy', title: 'Ventures', summaryCards: ['Priority venture', 'Portfolio snapshot', 'Biggest blocker', 'Next key decision'], highlights: ['Personal venture worldview', 'Priority logic and blockers', 'Separate from Business Command'] },
  systems: { eyebrow: 'Life operations layer', title: 'Systems', summaryCards: ['Today priorities', 'Task board status', 'Active automations', 'Open loops'], highlights: ['Operations Task Board anchor', 'Automations and stale-item visibility', 'Daily command layer'] },
  education: { eyebrow: 'Learning and school', title: 'Education', summaryCards: ['Program', 'Courses', 'Upcoming deadlines', 'Learning focus'], highlights: ['Program context', 'Course clarity', 'Visible without taking over the system'] },
  relationships: { eyebrow: 'Family and connection', title: 'Relationships', summaryCards: ['Priority snapshot', 'Connection health', 'Important people', 'Upcoming actions'], highlights: ['Family and partner vision', 'Actionable relationship focus', 'Sensitive content kept minimal'] },
  knowledge: { eyebrow: 'Mental models and references', title: 'Knowledge', summaryCards: ['Learning domains', 'Mental models', 'Recent knowledge', 'Knowledge gaps'], highlights: ['Business, finance, health, psychology', 'Knowledge browser from PunkRecords', 'Built for action'] },
}

const CATEGORY_SIGNATURE_DASHBOARDS: Record<Exclude<PersonalSection, 'home'>, CategorySignatureDashboard> = {
  vessel: {
    kind: 'vessel-cockpit',
    eyebrow: 'Body cockpit',
    title: 'Readiness, training, food, and recovery in one control surface.',
    readoutLabel: 'Primary body signal',
    readoutSourceIndex: 0,
    readoutUnit: 'target',
    mapLabel: 'Body lanes',
    mapItems: [
      { label: 'Lift', sourceIndex: 1 },
      { label: 'Fuel', sourceIndex: 2 },
      { label: 'Recover', sourceIndex: 3 },
      { label: 'Physique', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Train', title: 'Next session lock', body: 'Use the workout recency signal to decide whether training leads the day.', sourceIndex: 1 },
      { label: 'Fuel', title: 'Nutrition compliance', body: 'Pair the body target with the latest food-log evidence before judging progress.', sourceIndex: 2 },
      { label: 'Recover', title: 'Recovery blind spot', body: 'Keep sleep and energy marked as an explicit source gap until a real feed exists.', sourceIndex: 3 },
    ],
  },
  identity: {
    kind: 'identity-compass',
    eyebrow: 'Identity compass',
    title: 'Mission, ideal-self gap, and blockers arranged like a decision instrument.',
    readoutLabel: 'Alignment anchor',
    readoutSourceIndex: 2,
    readoutUnit: 'theme',
    mapLabel: 'Compass points',
    mapItems: [
      { label: 'Self', sourceIndex: 0 },
      { label: 'Gap', sourceIndex: 1 },
      { label: 'Mission', sourceIndex: 3 },
      { label: 'Friction', sourceIndex: 4 },
    ],
    lenses: [
      { label: 'Focus', title: 'Defend the top goal', body: 'Let the lead active goal outrank reactive lower-priority pulls.', sourceIndex: 3 },
      { label: 'Gap', title: 'Close one alignment gap', body: 'Pick the move that makes current behavior more like the ideal-self record.', sourceIndex: 1 },
      { label: 'Blocker', title: 'Name the pressure', body: 'Translate environment or consistency friction into a concrete constraint.', sourceIndex: 4 },
    ],
  },
  systems: {
    kind: 'systems-triage',
    eyebrow: 'Operations triage',
    title: 'Open loops move through clarify, delegate, close, and automate lanes.',
    readoutLabel: 'Open-loop pressure',
    readoutSourceIndex: 0,
    readoutUnit: 'loops',
    mapLabel: 'Triage lanes',
    mapItems: [
      { label: 'Capture', sourceIndex: 0 },
      { label: 'Close', sourceIndex: 1 },
      { label: 'Compress', sourceIndex: 2 },
      { label: 'Automate', sourceIndex: 3 },
    ],
    lenses: [
      { label: 'Clarify', title: 'Clarify one open loop', body: 'Convert ambiguity into a decision, action, owner, or deletion.', sourceIndex: 0 },
      { label: 'Compress', title: 'Reduce surface area', body: 'Use project sprawl as the signal to shrink the day’s active set.', sourceIndex: 2 },
      { label: 'Automate', title: 'Upgrade the rollup', body: 'Make AI support remove loops while keeping approval boundaries visible.', sourceIndex: 3 },
    ],
  },
  ventures: {
    kind: 'venture-radar',
    eyebrow: 'Portfolio radar',
    title: 'A strategy radar that compresses many ideas into one highest-upside move.',
    readoutLabel: 'Portfolio surface',
    readoutSourceIndex: 0,
    readoutUnit: 'lines',
    mapLabel: 'Radar vectors',
    mapItems: [
      { label: 'Inventory', sourceIndex: 0 },
      { label: 'Priority', sourceIndex: 1 },
      { label: 'Goals', sourceIndex: 2 },
      { label: 'Blocker', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Rank', title: 'Name the priority venture', body: 'Favor momentum, upside, urgency, and cost instead of a long inventory.', sourceIndex: 4 },
      { label: 'Ship', title: 'Execution over ideation', body: 'Push the selected line toward traction before adding another bet.', sourceIndex: 1 },
      { label: 'Route', title: 'Send live work to Business Command', body: 'Keep this page strategic once a decision becomes operational execution.', sourceIndex: 5 },
    ],
  },
  career: {
    kind: 'career-ladder',
    eyebrow: 'Proof engine',
    title: 'Package the strongest work, then convert it into outreach, interviews, and offers.',
    readoutLabel: 'Lead proof asset',
    readoutSourceIndex: 2,
    readoutUnit: 'proof',
    mapLabel: 'Career engine',
    mapItems: [
      { label: 'Proof', sourceIndex: 2 },
      { label: 'Package', sourceIndex: 3 },
      { label: 'Pipeline', sourceIndex: 4 },
      { label: 'Ready', sourceIndex: 6 },
    ],
    lenses: [
      { label: 'Proof', title: 'Lead with LifeArc', body: 'Turn the HIPAA AI platform into the first resume, portfolio, LinkedIn, and interview proof block.', sourceIndex: 2 },
      { label: 'Package', title: 'Close one asset gap', body: 'Ship one public-safe artifact: resume bullet, STAR story, architecture diagram, case study, GitHub polish, or LinkedIn feature.', sourceIndex: 3 },
      { label: 'Pipeline', title: 'Move one target forward', body: 'Convert packaged proof into a researched target, warm outreach, tailored application, follow-up, screen, or offer step.', sourceIndex: 4 },
      { label: 'Ready', title: 'Keep interviews trainable', body: 'Treat DSA, system design, and behavioral stories as one readiness stack tied to the target role profile.', sourceIndex: 6 },
    ],
  },
  wealth: {
    kind: 'wealth-flow',
    eyebrow: 'Capital flow',
    title: 'Money decisions routed through income engines, runway, visibility, and leverage.',
    readoutLabel: 'Capital priority',
    readoutSourceIndex: 0,
    readoutUnit: 'priority',
    mapLabel: 'Allocation channels',
    mapItems: [
      { label: 'Earn', sourceIndex: 1 },
      { label: 'Engines', sourceIndex: 3 },
      { label: 'Runway', sourceIndex: 4 },
      { label: 'Strategy', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Earn', title: 'Prioritize leverage', body: 'Favor earning power, durable upside, or recurring surplus.', sourceIndex: 0 },
      { label: 'See', title: 'Fix the visibility gap', body: 'The page should stay honest until balance, cashflow, and obligations exist.', sourceIndex: 4 },
      { label: 'Route', title: 'Tie spend to strategy', body: 'Show whether the next spend supports career, health, or venture leverage.', sourceIndex: 5 },
    ],
  },
  education: {
    kind: 'education-runway',
    eyebrow: 'Study runway',
    title: 'Program context, checkpoint gaps, overload watch, and career value sequenced in order.',
    readoutLabel: 'Program anchor',
    readoutSourceIndex: 0,
    readoutUnit: 'program',
    mapLabel: 'Runway checkpoints',
    mapItems: [
      { label: 'Program', sourceIndex: 0 },
      { label: 'Value', sourceIndex: 1 },
      { label: 'Balance', sourceIndex: 2 },
      { label: 'Deadline', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Checkpoint', title: 'Protect the study lane', body: 'Make the next academic checkpoint explicit before it becomes vague pressure.', sourceIndex: 5 },
      { label: 'Value', title: 'Connect school to leverage', body: 'Attach coursework to a real career or technical skill gain.', sourceIndex: 1 },
      { label: 'Load', title: 'Watch overload', body: 'Balance study depth against shipping, health, and business execution.', sourceIndex: 4 },
    ],
  },
  knowledge: {
    kind: 'knowledge-forge',
    eyebrow: 'Model forge',
    title: 'References enter as raw material and leave as decision tools.',
    readoutLabel: 'Learning domain',
    readoutSourceIndex: 0,
    readoutUnit: 'domain',
    mapLabel: 'Forge stations',
    mapItems: [
      { label: 'Input', sourceIndex: 2 },
      { label: 'Model', sourceIndex: 1 },
      { label: 'Reference', sourceIndex: 3 },
      { label: 'Decision', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Extract', title: 'Extract one usable model', body: 'Turn the strongest note into a reusable decision rule.', sourceIndex: 1 },
      { label: 'Refresh', title: 'Connect recency', body: 'Separate live learning from stale reference material.', sourceIndex: 2 },
      { label: 'Apply', title: 'Tie reading to action', body: 'Keep books and references useful by attaching them to a decision.', sourceIndex: 4 },
    ],
  },
  relationships: {
    kind: 'relationship-orbit',
    eyebrow: 'Care orbit',
    title: 'Connection signals stay useful, respectful, and privacy-first.',
    readoutLabel: 'Care posture',
    readoutSourceIndex: 0,
    readoutUnit: 'posture',
    mapLabel: 'Care orbit',
    mapItems: [
      { label: 'Family', sourceIndex: 1 },
      { label: 'Growth', sourceIndex: 2 },
      { label: 'Context', sourceIndex: 3 },
      { label: 'Privacy', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Care', title: 'Choose one care action', body: 'Make connection concrete without exposing unnecessary private detail.', sourceIndex: 1 },
      { label: 'Fit', title: 'Improve environment fit', body: 'Favor contexts that make good connection more likely.', sourceIndex: 3 },
      { label: 'Protect', title: 'Keep raw detail private', body: 'Render patterns and reminders, not sensitive relationship logs.', sourceIndex: 5 },
    ],
  },
}

const GROWTH_LOOP_DEFINITIONS: Record<Exclude<PersonalSection, 'home'>, GrowthLoopDefinition> = {
  vessel: {
    target: 'Body system that raises confidence, energy, and visible discipline.',
    ritual: 'Check training, food, and recovery before choosing the day’s hardest work.',
    blocker: 'Stale body inputs can hide whether effort is actually compounding.',
    compound: 'Better readiness makes business output, learning depth, and social confidence easier.',
    cadence: 'Daily body check',
  },
  identity: {
    target: 'Choices that match the person Mitchell is deliberately becoming.',
    ritual: 'Name the identity-aligned move before reacting to pressure or mood.',
    blocker: 'Too many pulls can make the top mission feel optional.',
    compound: 'Identity clarity turns goals into defaults instead of repeated negotiations.',
    cadence: 'Morning and reset',
  },
  systems: {
    target: 'Fewer open loops and cleaner execution across life and work.',
    ritual: 'Clarify, delegate, delete, or execute one ambiguous obligation.',
    blocker: 'Untriaged surface area makes the day feel productive without real closure.',
    compound: 'Cleaner systems free attention for health, business, learning, and relationships.',
    cadence: 'Daily command pass',
  },
  ventures: {
    target: 'A venture portfolio that concentrates effort on the highest-upside line.',
    ritual: 'Pick the one venture decision that creates the most leverage this week.',
    blocker: 'Idea sprawl can disguise itself as ambition.',
    compound: 'Focused venture work creates proof, income options, and career leverage.',
    cadence: 'Weekly strategy',
  },
  career: {
    target: 'Shipped work converted into compensation, reputation, and role leverage.',
    ritual: 'Turn one concrete artifact into portfolio, resume, or negotiation proof.',
    blocker: 'Good work loses value when it stays private or unframed.',
    compound: 'Career leverage funds freedom, wealth, education, and bigger business bets.',
    cadence: 'Twice-weekly proof pass',
  },
  wealth: {
    target: 'Capital decisions that support freedom and bigger upside.',
    ritual: 'Check whether the next spend or work block improves earning power or resilience.',
    blocker: 'Without live money signals, small optimizations can crowd out larger leverage.',
    compound: 'Better capital posture gives every other life domain more room to breathe.',
    cadence: 'Weekly money review',
  },
  education: {
    target: 'Learning that compounds career leverage instead of becoming background pressure.',
    ritual: 'Identify the next course checkpoint and connect it to a practical skill.',
    blocker: 'School can become a vague stressor when deadlines are not visible.',
    compound: 'Structured learning strengthens technical judgment and long-term opportunity.',
    cadence: 'Course checkpoint review',
  },
  knowledge: {
    target: 'Knowledge converted into decisions, models, and repeatable operating rules.',
    ritual: 'Extract one usable model from the highest-value note or reference.',
    blocker: 'A large archive can feel smart while staying inert.',
    compound: 'Decision-ready knowledge improves business, health, money, and relationships.',
    cadence: 'Weekly model extraction',
  },
  relationships: {
    target: 'Connection handled with care, privacy, and concrete follow-through.',
    ritual: 'Choose one respectful action that improves connection without overexposing context.',
    blocker: 'Good intentions decay when they never become a timed action.',
    compound: 'Stronger relationships make ambition feel supported instead of isolated.',
    cadence: 'Weekly connection check',
  },
}

const CROSS_DOMAIN_INSIGHTS: CrossDomainInsight[] = [
  {
    label: 'Leverage chain',
    title: 'Body readiness multiplies execution',
    body: 'Training, food, and recovery are not separate from work. They decide how much focus is available for career proof, business output, and social confidence.',
    recommendation: 'Protect the body check before choosing the hardest work block.',
    evidence: 'Vessel readiness changes Career, Ventures, and Relationships capacity.',
    pages: ['vessel', 'career', 'ventures', 'relationships'],
    tone: 'leverage',
  },
  {
    label: 'Tradeoff watch',
    title: 'Open loops tax every growth lane',
    body: 'If Systems is noisy, education, wealth, relationships, and venture decisions all become harder to execute cleanly.',
    recommendation: 'Clear one ambiguous obligation before adding more ambition.',
    evidence: 'Systems pressure touches Education, Wealth, and Venture execution.',
    pages: ['systems', 'education', 'wealth', 'ventures'],
    tone: 'tradeoff',
  },
  {
    label: 'Compounding move',
    title: 'Shipped proof should serve multiple goals',
    body: 'The best work should count at least twice: useful business output now, career proof later, and wealth leverage over time.',
    recommendation: 'Package the next shipped artifact so it can become proof.',
    evidence: 'Career, Ventures, Wealth, and Knowledge all improve from reusable output.',
    pages: ['career', 'ventures', 'wealth', 'knowledge'],
    tone: 'leverage',
  },
  {
    label: 'Decision support',
    title: 'Knowledge only matters when it changes a choice',
    body: 'Learning should feed concrete decisions in career, ventures, health, and money instead of becoming a passive archive.',
    recommendation: 'Extract one model and attach it to a real decision.',
    evidence: 'Knowledge is strongest when it changes Career, Venture, or Wealth behavior.',
    pages: ['knowledge', 'career', 'ventures', 'wealth'],
    tone: 'evidence',
  },
  {
    label: 'Human layer',
    title: 'Ambition needs protected connection',
    body: 'Relationships and identity keep the operating system human: useful progress should create more steadiness, not just more output.',
    recommendation: 'Choose one relationship action that supports the mission without overexposure.',
    evidence: 'Relationships and Identity stabilize the pressure created by Systems and Vessel work.',
    pages: ['relationships', 'identity', 'vessel', 'systems'],
    tone: 'tradeoff',
  },
  {
    label: 'Long arc',
    title: 'Education compounds when attached to real artifacts',
    body: 'School is most useful when each checkpoint strengthens career leverage, technical judgment, and the quality of shipped work.',
    recommendation: 'Connect the next course checkpoint to a portfolio-quality artifact.',
    evidence: 'Education compounds through Career, Knowledge, and Venture proof.',
    pages: ['education', 'career', 'knowledge', 'ventures'],
    tone: 'evidence',
  },
]

const CORE_DASHBOARD_DEFINITIONS: Record<CoreDashboardSection, CoreDashboardDefinition> = {
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
      { title: 'Execution-era self', body: 'Identity is framed as daily execution and emotional steadiness, not a motivational poster.', sourceCardIndex: 0 },
      { title: 'Focus priority', body: 'The lead goal should stay visible before lower-priority personal work.', sourceCardIndex: 2 },
      { title: 'Ideal-self gap', body: 'The ideal self is useful because it shows gaps to close, not because it pretends the gap is gone.', sourceCardIndex: 1 },
      { title: 'Decision pressure', body: 'Environment, consistency, and energy gaps belong on this page when they influence choices.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ideal Self', body: 'Standards for character, habits, physical presence, and social confidence.', sourceCardIndex: 0 },
      { title: 'Goals Overview', body: 'Shows what should be proved next.', sourceCardIndex: 3 },
      { title: 'Annual Goals', body: 'Keeps the larger focus and long-arc priorities visible.', sourceCardIndex: 2 },
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

function formatEducationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date pending'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
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

function normalizeIdentityQuality(item: Partial<IdentityQuality>, fallback: IdentityQuality): IdentityQuality {
  return {
    id: typeof item.id === 'string' ? item.id : fallback.id,
    name: typeof item.name === 'string' ? item.name : fallback.name,
    score: typeof item.score === 'number' ? Math.min(10, Math.max(1, item.score)) : fallback.score,
    tenMeans: typeof item.tenMeans === 'string' ? item.tenMeans : fallback.tenMeans,
    nextAction: typeof item.nextAction === 'string' ? item.nextAction : fallback.nextAction,
    source: typeof item.source === 'string' ? item.source : fallback.source,
  }
}

function loadStoredIdentityQualities(sourceQualities: IdentityQuality[] = DEFAULT_IDENTITY_QUALITIES): IdentityQuality[] {
  if (typeof window === 'undefined') return sourceQualities
  try {
    const raw = window.localStorage.getItem(IDENTITY_QUALITIES_KEY)
    if (!raw) return sourceQualities
    const parsed = JSON.parse(raw) as Partial<IdentityQuality>[]
    if (!Array.isArray(parsed)) return sourceQualities

    if (!sourceQualities.length) {
      return parsed
        .filter((item) => typeof item.id === 'string' && typeof item.name === 'string')
        .map((item, index) => normalizeIdentityQuality(item, DEFAULT_IDENTITY_QUALITIES[index] ?? {
          id: item.id as string,
          name: item.name as string,
          score: 5,
          tenMeans: 'The ideal version of this quality is clear and lived daily.',
          nextAction: 'Pick one small behavior that proves this today.',
          source: 'Manual identity edit',
        }))
    }

    const storedById = new Map(parsed.filter((item) => typeof item.id === 'string').map((item) => [item.id as string, item]))
    return sourceQualities.map((sourceQuality) => normalizeIdentityQuality(storedById.get(sourceQuality.id) ?? {}, sourceQuality))
  } catch {
    return sourceQualities
  }
}

function storeIdentityQualities(qualities: IdentityQuality[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(IDENTITY_QUALITIES_KEY, JSON.stringify(qualities))
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
  const [categoryLensIndex, setCategoryLensIndex] = useState<Partial<Record<Exclude<PersonalSection, 'home'>, number>>>({})
  const [identityQualityEdits, setIdentityQualityEdits] = useState<IdentityQuality[]>(() => loadStoredIdentityQualities([]))
  const [identityScoresEditable, setIdentityScoresEditable] = useState(false)
  const [educationAlternativesOpen, setEducationAlternativesOpen] = useState(false)
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
    storeIdentityQualities(identityQualityEdits)
  }, [identityQualityEdits])

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
  const sourceIdentityProjection = personalSection === 'identity' ? currentPersonalData?.identity : undefined
  const sourceIdentityQualities = useMemo(
    () => sourceIdentityProjection?.qualities?.length ? sourceIdentityProjection.qualities : DEFAULT_IDENTITY_QUALITIES,
    [sourceIdentityProjection],
  )
  const identityQualities = useMemo(() => {
    const storedById = new Map(identityQualityEdits.map((item) => [item.id, item]))
    return sourceIdentityQualities.map((sourceQuality) => normalizeIdentityQuality(storedById.get(sourceQuality.id) ?? {}, sourceQuality))
  }, [identityQualityEdits, sourceIdentityQualities])
  const sourceIdentityStatement = sourceIdentityProjection?.statement
    ?? currentPersonalData?.summaryCards.find((card) => card.label.toLowerCase().includes('identity statement'))?.note
    ?? 'Calm, disciplined, focused, and happy every day.'
  const identityStatement = sourceIdentityStatement
  const identityScoreHistory = sourceIdentityProjection?.scoreHistory?.length
    ? sourceIdentityProjection.scoreHistory
    : [{ label: 'Today', score: identityQualities.length ? Number((identityQualities.reduce((total, item) => total + item.score, 0) / identityQualities.length).toFixed(1)) : 0 }]
  const identityNightlyChanges = sourceIdentityProjection?.nightlyChanges?.length
    ? sourceIdentityProjection.nightlyChanges
    : [{ qualityId: identityQualities[0]?.id ?? 'identity', delta: 0, reason: 'Source projection is ready for the next nightly refresh.' }]
  const identityLastUpdatedLabel = sourceIdentityProjection?.lastUpdatedLabel ?? 'Latest source projection'

  const currentCoreDashboard = personalSection === 'vessel' || personalSection === 'identity' || personalSection === 'systems'
    ? CORE_DASHBOARD_DEFINITIONS[personalSection]
    : null
  const currentGrowthDashboard = personalSection === 'ventures' || personalSection === 'career' || personalSection === 'wealth' || personalSection === 'education' || personalSection === 'knowledge' || personalSection === 'relationships'
    ? GROWTH_DASHBOARD_DEFINITIONS[personalSection]
    : null
  const currentSectionDashboard = currentPersonalData?.dashboard ?? currentCoreDashboard ?? currentGrowthDashboard
  const currentGrowthLoop = useMemo(() => {
    if (personalSection === 'home' || !currentPersonalData || !currentSectionDashboard) return null
    const definition = GROWTH_LOOP_DEFINITIONS[personalSection]
    const primaryMetric = currentSectionDashboard.metrics[0]
    const primaryCard = primaryMetric ? currentPersonalData.summaryCards[primaryMetric.sourceCardIndex] : undefined
    const action = currentSectionDashboard.actionRows[0]
    const blocker = currentPersonalData.blockers?.[0] ?? currentPersonalData.missingData?.[0]
    return {
      definition,
      progressLabel: primaryCard?.label ?? primaryMetric?.label ?? 'Current signal',
      progressValue: primaryCard?.value ?? 'No signal yet',
      progressNote: primaryCard?.note ?? 'This loop is waiting for stronger source coverage.',
      nextAction: action?.title ?? 'Choose the next clean move',
      nextActionBody: action?.body ?? 'Pick the smallest action that makes the loop easier to repeat tomorrow.',
      blockerLabel: blocker ? `${blocker.label}: ${blocker.value}` : 'No critical blocker surfaced',
      blockerBody: blocker?.detail ?? definition.blocker,
    }
  }, [currentPersonalData, currentSectionDashboard, personalSection])
  const currentSignatureDashboard = personalSection === 'home' ? null : CATEGORY_SIGNATURE_DASHBOARDS[personalSection]
  const currentSignatureLensIndex = personalSection === 'home' ? 0 : categoryLensIndex[personalSection] ?? 0
  const currentDirective = PAGE_DIRECTIVES[currentPage]
  const primaryNextMove = currentSectionDashboard?.actionRows[0]?.title ??
    (isBusinessPage(currentPage)
      ? (topPendingReview ? `Review ${topPendingReview.taskTitle}` : 'Keep the operations lane clear')
      : 'Start with the strongest signal')
  const currentEvidenceLabel = currentPersonalData?.freshness?.label ??
    (isBusinessPage(currentPage) ? 'Live business runtime' : 'Projected personal records')
  const currentSignalQuality = currentPersonalData?.freshness?.stale ? 'Needs refresh' : appMode === 'business' ? 'Live feed' : 'Usable signal'
  const currentCrossDomainInsights = useMemo(() => {
    if (personalSection === 'home') return CROSS_DOMAIN_INSIGHTS.slice(0, 4)
    return CROSS_DOMAIN_INSIGHTS.filter((item) => item.pages.includes(personalSection)).slice(0, 3)
  }, [personalSection])
  const quickNavItems = useMemo(() => {
    const query = commandValue.trim().toLowerCase()
    const items = [...PERSONAL_NAV_ITEMS, ...BUSINESS_NAV_ITEMS]
    if (!query) return items
    return items.filter((item) => `${item.label} ${item.description} ${PAGE_ROUTES[item.page]}`.toLowerCase().includes(query)).slice(0, 6)
  }, [commandValue])
  const quickActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      {
        label: 'Open best next move',
        detail: primaryNextMove,
        prompt: `Turn this next move into a clear plan: ${primaryNextMove}`,
      },
      {
        label: 'Explain why this matters',
        detail: currentDirective.outcome,
        prompt: `Explain why ${pageLabel(currentPage)} matters for my growth today.`,
      },
    ]

    if (appMode === 'personal') {
      actions.push({
        label: 'Show linked leverage',
        detail: currentCrossDomainInsights[0]?.title ?? 'Cross-domain intelligence',
        page: currentCrossDomainInsights[0]?.pages[0] ?? 'systems',
      })
    } else {
      actions.push({
        label: 'Jump to review pressure',
        detail: topPendingReview ? topPendingReview.taskTitle : 'Review dock is clear',
        page: topPendingReview ? 'review-dock' : 'runtime-trail',
      })
    }

    return actions
  }, [appMode, currentCrossDomainInsights, currentDirective.outcome, currentPage, primaryNextMove, topPendingReview])
  const crossDomainSummary = useMemo(() => {
    const personalPages: Exclude<PersonalSection, 'home'>[] = ['vessel', 'identity', 'systems', 'ventures', 'career', 'wealth', 'education', 'knowledge', 'relationships']
    const staleCount = personalPages.filter((page) => projectedSections[page]?.freshness?.stale).length
    const missingCount = personalPages.reduce((total, page) => total + (projectedSections[page]?.missingData?.length ?? 0), 0)
    const groundedCount = personalPages.filter((page) => sourceConfidence(projectedSections[page]) === 'Grounded').length
    return { staleCount, missingCount, groundedCount }
  }, [projectedSections])
  const commandHorizonStats = useMemo(() => {
    const reviewPressure = businessSummary.approvalsPending + (queueHealth?.flagged_count ?? 0)
    const runtimeLoad = (queueHealth?.runnable_count ?? 0) + actionTrail.length
    const sourceScore = Math.max(0, crossDomainSummary.groundedCount - crossDomainSummary.staleCount)
    const horizonHealth = sourceScore >= 6 && reviewPressure === 0 ? 'Clear' : reviewPressure > 0 ? 'Pressure' : 'Building'
    return [
      {
        label: 'Growth signal',
        value: appMode === 'personal' ? `${crossDomainSummary.groundedCount}/9 grounded` : `${businessSummary.publishedToday} shipped`,
        detail: appMode === 'personal' ? `${crossDomainSummary.missingCount} data gaps tracked` : `${runtimeLoad} runtime traces loaded`,
      },
      {
        label: 'Pressure',
        value: reviewPressure > 0 ? `${reviewPressure} to resolve` : 'Clear lane',
        detail: reviewPressure > 0 ? 'Review and flagged work need attention' : 'No flagged review pressure surfaced',
      },
      {
        label: 'Operating mode',
        value: horizonHealth,
        detail: `${currentDirective.cadence} cadence`,
      },
    ]
  }, [actionTrail.length, appMode, businessSummary.approvalsPending, businessSummary.publishedToday, crossDomainSummary.groundedCount, crossDomainSummary.missingCount, crossDomainSummary.staleCount, currentDirective.cadence, queueHealth?.flagged_count, queueHealth?.runnable_count])

  const highlightCards = useMemo<ProjectionHighlightCard[]>(() => {
    if (!currentPersonalData) return []
    return currentPersonalData.highlights.slice(0, 3).map((item, index) => ({
      title: currentPersonalData.summaryCards[index]?.label ?? `Highlight ${index + 1}`,
      text: item,
    }))
  }, [currentPersonalData])

  function navigateToPage(page: AppPage) {
    setCurrentPage(page)
    setCommandOpen(false)
    if (typeof window === 'undefined') return
    const nextPath = browserPathForRoute(PAGE_ROUTES[page])
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
  }

  function updateIdentityQuality(id: string, updates: Partial<IdentityQuality>) {
    setIdentityQualityEdits(identityQualities.map((item) => (
      item.id === id
        ? { ...item, ...updates, score: updates.score === undefined ? item.score : Math.min(10, Math.max(1, updates.score)) }
        : item
    )))
  }

  useEffect(() => {
    if (!authed || typeof window === 'undefined') return
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
        return
      }
      if (event.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [authed])

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

  function renderPersonalDashboardLead() {
    if (personalSection === 'home' || !currentPersonalData || !currentSectionDashboard || !currentPersonalContent) return null

    const sourceRows = currentSectionDashboard.evidenceRows.slice(0, 3)
    const actionRows = currentSectionDashboard.actionRows.slice(0, 3)

    return (
      <section className={`category-dashboard-lead ${personalSection}`} aria-label={`${currentPersonalContent.title} dashboard`}>
        <article className="category-dashboard-header">
          <div>
            <div className="revamp-kicker">{currentPersonalContent.title} Dashboard</div>
            <h3>{currentSectionDashboard.headline}</h3>
            <p>{currentDirective.system}</p>
          </div>
          <div className="category-dashboard-status">
            <span>Signal quality</span>
            <strong>{sourceConfidence(currentPersonalData)}</strong>
            <small>{currentPersonalData.freshness?.label ?? 'Projected records'}</small>
          </div>
        </article>

        <div className="category-dashboard-metrics">
          {currentSectionDashboard.metrics.map((metric) => {
            const card = currentPersonalData.summaryCards[metric.sourceCardIndex]
            return (
              <article key={metric.label} className={`category-dashboard-metric ${metric.priority}${card?.stale ? ' stale' : ''}`}>
                <span>{metric.label}</span>
                <strong>{card?.value ?? 'No signal yet'}</strong>
                <p>{card?.note ?? 'This metric is waiting on source coverage.'}</p>
              </article>
            )
          })}
        </div>

        <div className="category-dashboard-lanes">
          <article className="category-dashboard-lane primary">
            <div className="revamp-kicker">Action Lane</div>
            {actionRows.map((item) => {
              const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData.summaryCards[item.sourceCardIndex] : undefined
              return (
                <div key={item.title} className={`category-dashboard-row${card?.stale ? ' stale' : ''}`}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  {card ? <small>{card.label}: {card.value}</small> : null}
                </div>
              )
            })}
          </article>
          <article className="category-dashboard-lane">
            <div className="revamp-kicker">Evidence Lane</div>
            {sourceRows.map((item) => {
              const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData.summaryCards[item.sourceCardIndex] : undefined
              return (
                <div key={item.title} className={`category-dashboard-row${card?.stale ? ' stale' : ''}`}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  {card ? <small>{card.label}: {card.note}</small> : null}
                </div>
              )
            })}
          </article>
        </div>
      </section>
    )
  }

  function renderIdentityScorecardPage() {
    const lowestQuality = identityQualities.length
      ? identityQualities.reduce((lowest, item) => item.score < lowest.score ? item : lowest)
      : null
    const averageScore = identityQualities.length
      ? identityQualities.reduce((total, item) => total + item.score, 0) / identityQualities.length
      : 0
    const chartMin = 1
    const chartMax = 10
    const chartWidth = 260
    const chartHeight = 96
    const chartPoints = identityScoreHistory.map((point, index) => {
      const x = identityScoreHistory.length === 1 ? chartWidth / 2 : (index / (identityScoreHistory.length - 1)) * chartWidth
      const y = chartHeight - ((point.score - chartMin) / (chartMax - chartMin)) * chartHeight
      return { ...point, x, y }
    })
    const chartPath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
    const firstHistoryPoint = identityScoreHistory[0]
    const latestHistoryPoint = identityScoreHistory[identityScoreHistory.length - 1]

    return (
      <section className="identity-simple-page" aria-label="Ideal self scorecard">
        <article className="identity-statement-panel">
          <div className="identity-statement-head">
            <div>
              <span>Identity statement</span>
              <small>{sourceIdentityProjection?.statementSource ?? 'Source projection'}</small>
            </div>
          </div>
          <textarea
            value={identityStatement}
            readOnly
            aria-label="Identity statement"
          />
        </article>

        <article className="identity-scorecard-panel">
          <div className="identity-scorecard-head">
            <div>
              <div className="revamp-kicker">Ideal Self Scorecard</div>
              <h3>Track the person your daily evidence says you are becoming.</h3>
            </div>
            <button
              className={`revamp-command-btn identity-edit-toggle${identityScoresEditable ? ' active' : ''}`}
              type="button"
              onClick={() => setIdentityScoresEditable((editable) => !editable)}
            >
              {identityScoresEditable ? 'Done' : 'Edit scores'}
            </button>
            <div className="identity-average">
              <span>Average</span>
              <strong>{averageScore.toFixed(1)}</strong>
            </div>
          </div>

          <div className="identity-quality-list">
            {identityQualities.map((quality) => (
              <article key={quality.id} className="identity-quality-row">
                <div className="identity-quality-copy">
                  <input
                    className="identity-quality-name"
                    value={quality.name}
                    onChange={(event) => updateIdentityQuality(quality.id, { name: event.target.value })}
                    aria-label={`${quality.name} name`}
                  />
                  <textarea
                    className="identity-quality-meaning"
                    value={quality.tenMeans}
                    onChange={(event) => updateIdentityQuality(quality.id, { tenMeans: event.target.value })}
                    aria-label={`${quality.name} meaning`}
                  />
                  <textarea
                    className="identity-quality-action"
                    value={quality.nextAction}
                    onChange={(event) => updateIdentityQuality(quality.id, { nextAction: event.target.value })}
                    aria-label={`${quality.name} next action`}
                  />
                </div>
                <div className="identity-score-control">
                  <strong>{quality.score.toFixed(1)}</strong>
                  {identityScoresEditable ? (
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={quality.score}
                      onChange={(event) => updateIdentityQuality(quality.id, { score: Number(event.target.value) })}
                      aria-label={`${quality.name} score`}
                    />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </article>

        <section className="identity-support-strip" aria-label="Identity support">
          <article className="identity-support-card">
            <span>Biggest gap</span>
            <strong>{lowestQuality?.name ?? 'No quality yet'}</strong>
            <p>{lowestQuality?.nextAction ?? 'Add one quality to start.'}</p>
          </article>
          <article className="identity-support-card">
            <span>Last nightly update</span>
            <strong>{identityLastUpdatedLabel}</strong>
            <div className="identity-change-list">
              {identityNightlyChanges.map((change) => {
                const quality = identityQualities.find((item) => item.id === change.qualityId)
                return (
                  <p key={change.qualityId}>
                    <b>{change.delta > 0 ? '+' : ''}{change.delta.toFixed(1)} {quality?.name ?? change.qualityId}</b>
                    {' '}
                    {change.reason}
                  </p>
                )
              })}
            </div>
          </article>
          <article className="identity-support-card identity-history-card">
            <span>Score history</span>
            <strong>{firstHistoryPoint?.score.toFixed(1)} to {latestHistoryPoint?.score.toFixed(1)}</strong>
            <svg className="identity-score-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Seven day identity score trend">
              <path d={`M 0 ${chartHeight - 12} H ${chartWidth}`} />
              <path className="trend" d={chartPath} />
              {chartPoints.map((point) => (
                <circle key={point.label} cx={point.x} cy={point.y} r="3.5" />
              ))}
            </svg>
            <div className="identity-chart-labels">
              <span>{firstHistoryPoint?.label}</span>
              <span>{latestHistoryPoint?.label}</span>
            </div>
          </article>
        </section>
      </section>
    )
  }

  function renderVesselPage() {
    if (!currentPersonalData) return null

    const findCard = (matcher: string) => currentPersonalData.summaryCards.find((card) => card.label.toLowerCase().includes(matcher))
    const readNumber = (value?: string) => {
      const match = value?.match(/([\d,.]+)/)
      if (!match) return null
      const parsed = Number(match[1].replace(/,/g, ''))
      return Number.isFinite(parsed) ? parsed : null
    }
    const nutrition = findCard('nutrition') ?? currentPersonalData.summaryCards[2]
    const proteinTarget = 150
    const cutCalorieMax = 2400
    const proteinLogged = readNumber(nutrition?.value)
    const caloriesLogged = readNumber(nutrition?.note?.match(/([\d,]+)\s*kcal/i)?.[0])
    const proteinProgress = proteinLogged === null ? null : Math.min(100, Math.round((proteinLogged / proteinTarget) * 100))
    const isCutting = currentPersonalData.highlights.some((highlight) => /cut|recomp/i.test(highlight))
    const calorieStatus = caloriesLogged === null
      ? 'Calories not logged'
      : caloriesLogged <= cutCalorieMax
        ? 'Under cut max'
        : 'Over cut max'
    const meditationPlan = currentPersonalData.vessel?.meditation
    const looksPlan = currentPersonalData.vessel?.looks
    const meditationLastLabel = meditationPlan?.latestSessionDate ? `Last logged ${meditationPlan.latestSessionDate}` : 'No meditation log yet'
    const meditationAction = meditationPlan?.nextRep ?? '5 min focused breathing after the morning brain dump'
    const meditationFallback = meditationPlan?.fallbackRep ?? 'Walking meditation or box breathing on unfocused days'
    const meditationReminderLabel = meditationPlan?.reminderWindows.length ? meditationPlan.reminderWindows.join(' / ') : '10:00 AM / 7:30 PM ET'
    const muscleGroups = currentPersonalData.vessel?.muscleGroups ?? []
    const laggingMuscleGroups = muscleGroups
      .filter((group) => group.heat === 'missing' || group.heat === 'stale' || group.heat === 'touched')
      .slice(0, 3)
    const muscleFocusList = laggingMuscleGroups.length ? laggingMuscleGroups : [...muscleGroups].sort((a, b) => a.recentSets - b.recentSets).slice(0, 3)
    const vesselStats = [
      { label: 'Protein today', value: proteinLogged === null ? '--' : `${proteinLogged}g`, note: proteinProgress === null ? `Target ${proteinTarget}g` : `${proteinProgress}% of ${proteinTarget}g target` },
      ...(isCutting ? [{ label: 'Calories today', value: caloriesLogged === null ? '--' : `${caloriesLogged} kcal`, note: caloriesLogged === null ? `Cut max ${cutCalorieMax} kcal` : `${calorieStatus}: ${cutCalorieMax} kcal` }] : []),
    ]

    return (
      <section className="vessel-page" aria-label="Vessel dashboard">
        <section className="vessel-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="vessel-hero-vitals" aria-label="Vessel quick readouts">
            {vesselStats.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.note}</small>
              </div>
            ))}
          </div>
          <aside className="vessel-readiness">
            <div
              className="vessel-readiness-ring"
              style={{ '--vessel-readiness': `${proteinProgress ?? 0}%` } as CSSProperties}
              aria-label={proteinProgress === null ? 'Protein target pending' : `Protein target ${proteinProgress}%`}
            >
              <div>
                <span>Protein</span>
                <strong>{proteinProgress ?? '--'}%</strong>
              </div>
            </div>
            <div className="vessel-ring-actions" aria-label="Nutrition targets">
              <div className="active good">
                <span>Protein</span>
                <strong>{proteinLogged === null ? `Target ${proteinTarget}g` : `${proteinLogged} / ${proteinTarget}g`}</strong>
              </div>
              {isCutting ? (
                <div className={caloriesLogged !== null && caloriesLogged > cutCalorieMax ? 'watch active' : 'good'}>
                  <span>Calories</span>
                  <strong>{caloriesLogged === null ? `Max ${cutCalorieMax}` : `${caloriesLogged} / ${cutCalorieMax}`}</strong>
                </div>
              ) : (
                <div>
                  <span>Calories</span>
                  <strong>Not tracked</strong>
                </div>
              )}
            </div>
          </aside>
        </section>

        {muscleGroups.length ? (
          <section className="vessel-muscle-map" aria-label="Workout muscle heat map">
            <div className="vessel-muscle-map-head">
              <div>
                <span>Workout heat map</span>
                <strong>Muscle groups from logs</strong>
                <p>{currentPersonalData.vessel?.muscleWindowLabel}</p>
              </div>
              <div className="vessel-muscle-focus">
                <span>Needs balance</span>
                <strong>{muscleFocusList.map((group) => group.label).join(' / ')}</strong>
              </div>
            </div>
            <div className="vessel-muscle-grid">
              {muscleGroups.map((group) => (
                <article className={`vessel-muscle-card ${group.heat}`} key={group.id}>
                  <div className="vessel-muscle-row">
                    <i aria-hidden="true" />
                    <strong>{group.label}</strong>
                    <em>{group.recentSets} sets</em>
                  </div>
                  <span>{group.priority}</span>
                  <p>{group.lastHitLabel}. {group.recommendation}</p>
                </article>
              ))}
            </div>
            <p className="vessel-muscle-note">{currentPersonalData.vessel?.musclePriorityNote}</p>
          </section>
        ) : null}

        <section className="vessel-support-grid" aria-label="Vessel support systems">
          <article className="vessel-meditation-card">
            <div>
              <span>Meditation consistency</span>
              <strong>{meditationLastLabel}</strong>
              <p>{meditationPlan?.sessionCount ? `${meditationPlan.sessionCount} logged sessions in Punk Records.` : 'The log exists, but consistency has not shown up in the data yet.'}</p>
            </div>
            <dl>
              <div>
                <dt>Baseline</dt>
                <dd>{meditationPlan?.baseline ?? '5-minute sessions'}</dd>
              </div>
              <div>
                <dt>Next rep</dt>
                <dd>{meditationAction}</dd>
              </div>
              <div>
                <dt>Fallback</dt>
                <dd>{meditationFallback}</dd>
              </div>
              <div>
                <dt>Reminder windows</dt>
                <dd>{meditationReminderLabel}</dd>
              </div>
            </dl>
          </article>
          <article className="vessel-looks-card">
            <div>
              <span>Looks support</span>
              <strong>Routine checklist</strong>
              <p>Only concrete items from the looksmaxxing routine.</p>
            </div>
            <div className="vessel-check-columns">
              <div>
                <b>Daily</b>
                {(looksPlan?.daily.length ? looksPlan.daily : ['Face wash', 'Moisturizer', 'SPF', 'Lip balm']).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <div>
                <b>Going out</b>
                {(looksPlan?.goingOut.length ? looksPlan.goingOut : ['Hair', 'Beard', 'Lips', 'Outfit intentional']).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </article>
        </section>
      </section>
    )
  }

  function renderEducationPage() {
    if (!currentPersonalData) return null

    const education = currentPersonalData.education
    const urgentDeadlines = education?.urgentDeadlines ?? []
    const coursePlan = education?.coursePlan ?? []
    const alternatives = education?.alternatives ?? []
    const activeCourse = coursePlan.find((course) => course.status === 'active')

    return (
      <section className="education-page" aria-label="Education dashboard">
        <section className="education-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="education-hero-copy">
            <span>{education?.activeProgram ?? 'Georgia Tech OMSCS / MSML'}</span>
            <strong>{activeCourse ? `${activeCourse.code} · ${activeCourse.name}` : currentPersonalData.summaryCards[1]?.value ?? 'Current course pending'}</strong>
          </div>
        </section>

        <section className="education-deadline-panel" aria-label="Most urgent education deadlines">
          <div className="education-panel-head">
            <div>
              <span>Course radar</span>
              <strong>Most urgent deadlines</strong>
            </div>
            <small>{education?.activeTerm ?? 'Summer 2026'}</small>
          </div>
          <div className="education-deadline-list">
            {urgentDeadlines.length ? urgentDeadlines.map((deadline, index) => (
              <article className={`education-deadline-card ${deadline.status}`} key={deadline.id}>
                <div className="education-deadline-rank">{index + 1}</div>
                <div>
                  <span>{deadline.courseCode} · {deadline.kind.replace('-', ' ')}</span>
                  <strong>{deadline.title}</strong>
                  <p>Due {formatEducationDate(deadline.dueAt)}</p>
                  {deadline.internalTarget !== deadline.dueAt ? <small>Internal target: {formatEducationDate(deadline.internalTarget)}</small> : null}
                </div>
              </article>
            )) : (
              <article className="education-deadline-card later">
                <div className="education-deadline-rank">0</div>
                <div>
                  <span>Course radar</span>
                  <strong>No upcoming deadline found</strong>
                  <p>Check Canvas and add the next current-class deadline to Punk Records.</p>
                </div>
              </article>
            )}
          </div>
        </section>

        <section className="education-course-map" aria-label="OMSCS ten course map">
          <div className="education-panel-head">
            <div>
              <span>Masters map</span>
              <strong>10-course OMSCS / MSML schedule</strong>
            </div>
            <button className="education-alt-toggle" onClick={() => setEducationAlternativesOpen((open) => !open)}>
              {educationAlternativesOpen ? 'Hide alternatives' : 'See alternatives'}
            </button>
          </div>
          <div className="education-course-grid">
            {coursePlan.map((course, index) => (
              <article className={`education-course-card ${course.status}`} key={`${course.code}-${course.term}`}>
                <div className="education-course-topline">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <em>{course.term}</em>
                </div>
                <strong>{course.code}</strong>
                <p>{course.name}</p>
                <div className="education-course-meta">
                  <span>{course.status}</span>
                  <span>{course.role.replace('-', ' ')}</span>
                  <span>{course.difficulty}/10</span>
                </div>
                <small>{course.why}</small>
              </article>
            ))}
          </div>
          <p className="education-plan-note">{education?.planNote}</p>
          {educationAlternativesOpen ? (
            <div className="education-alternatives" aria-label="Potential OMSCS course alternatives">
              {alternatives.map((course) => (
                <article key={course.code}>
                  <span>{course.code} · {course.difficulty}/10</span>
                  <strong>{course.name}</strong>
                  <p>{course.bestFor}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    )
  }

  function renderCareerPage() {
    if (!currentPersonalData) return null

    const findCard = (matcher: string) => currentPersonalData.summaryCards.find((card) => card.label.toLowerCase().includes(matcher))
    const proof = findCard('flagship') ?? currentPersonalData.summaryCards[2]
    const packaging = findCard('packaging') ?? currentPersonalData.summaryCards[3]
    const pipeline = findCard('pipeline') ?? currentPersonalData.summaryCards[4]
    const networking = findCard('networking') ?? currentPersonalData.summaryCards[5]
    const readiness = findCard('readiness') ?? currentPersonalData.summaryCards[6]
    const brand = findCard('brand') ?? currentPersonalData.summaryCards[7]
    const credential = findCard('credential') ?? currentPersonalData.summaryCards[8]
    const compTarget = findCard('comp') ?? currentPersonalData.summaryCards[1]
    const blockers = currentPersonalData.blockers ?? []
    const missingData = currentPersonalData.missingData ?? []
    const timeline = currentPersonalData.timeline ?? []
    const proofLanes = [
      { label: 'Resume', source: packaging, detail: 'Quantified bullet and tailored variant for the target role.' },
      { label: 'Portfolio', source: proof, detail: 'Public-safe case study with architecture, constraints, and impact.' },
      { label: 'Story', source: readiness, detail: 'STAR version that makes ownership, judgment, and tradeoffs easy to hear.' },
      { label: 'Brand', source: brand, detail: 'LinkedIn/GitHub proof that recruiters can verify quickly.' },
    ]
    const pipelineStages = [
      { label: 'Research', value: '10 visible', detail: 'Target companies already mapped from the Career notes.' },
      { label: 'Outreach', value: networking?.value ?? '0 hot / 0 warm / 0 cold', detail: networking?.note ?? 'Warm intros and follow-ups are the missing channel.' },
      { label: 'Apply', value: pipeline?.value ?? '0 apps / 0 screens', detail: pipeline?.note ?? 'Applications need dated entries before this becomes live.' },
      { label: 'Interview', value: readiness?.value ?? '7 STAR stories', detail: readiness?.note ?? 'Keep DSA, system design, and behavioral reps together.' },
      { label: 'Offer', value: timeline[1]?.recency ?? 'Oct 31, 2026', detail: timeline[1]?.detail ?? 'Use the offer deadline as the process anchor.' },
    ]

    return (
      <section className="career-page" aria-label="Career dashboard">
        <section className="career-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="career-hero-copy">
            <span>Proof engine</span>
            <strong>{proof?.value ?? 'LifeArc'}</strong>
            <p>{currentPersonalData.heroSummary}</p>
          </div>
          <aside className="career-target-card">
            <span>Comp / role target</span>
            <strong>{compTarget?.value ?? '$140k-$200k+ TC'}</strong>
            <p>{compTarget?.note ?? 'Target higher-leverage SWE, backend, full-stack, or ML engineering roles.'}</p>
          </aside>
        </section>

        <section className="career-proof-board" aria-label="Career proof packaging">
          <article className="career-proof-primary">
            <div className="revamp-kicker">Flagship Proof</div>
            <h3>{proof?.value ?? 'LifeArc'}</h3>
            <p>{proof?.note ?? 'Package the strongest shipped work into public-safe career evidence.'}</p>
            <div className="career-proof-metrics">
              <div><span>Pipeline</span><strong>{pipeline?.value ?? '0 apps / 0 screens'}</strong></div>
              <div><span>Network</span><strong>{networking?.value ?? '0 hot / 0 warm / 0 cold'}</strong></div>
              <div><span>Readiness</span><strong>{readiness?.value ?? '7 STAR stories'}</strong></div>
            </div>
          </article>
          <div className="career-proof-lanes">
            {proofLanes.map((lane) => (
              <article key={lane.label} className="career-proof-lane">
                <span>{lane.label}</span>
                <strong>{lane.source?.value ?? 'Needs update'}</strong>
                <p>{lane.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="career-pipeline-panel" aria-label="Career pipeline stages">
          <div className="career-panel-head">
            <div>
              <span>Search Ladder</span>
              <strong>Proof to offer path</strong>
            </div>
            <small>{currentPersonalData.freshness?.label ?? 'Career planning docs'}</small>
          </div>
          <div className="career-stage-track">
            {pipelineStages.map((stage, index) => (
              <article key={stage.label} className={`career-stage-card ${index < 1 ? 'ready' : index < 4 ? 'watch' : 'target'}`}>
                <em>{String(index + 1).padStart(2, '0')}</em>
                <span>{stage.label}</span>
                <strong>{stage.value}</strong>
                <p>{stage.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="career-readiness-grid" aria-label="Career readiness and gaps">
          <article className="career-readiness-card">
            <span>Interview stack</span>
            <strong>{readiness?.value ?? '7 STAR stories'}</strong>
            <p>{readiness?.note ?? 'Practice behavioral, DSA, and system design readiness as one stack.'}</p>
          </article>
          <article className="career-readiness-card">
            <span>Credential path</span>
            <strong>{credential?.value ?? 'Georgia Tech MSML'}</strong>
            <p>{credential?.note ?? 'MSML supports the long-arc ML positioning.'}</p>
          </article>
          {(blockers.length ? blockers : missingData).slice(0, 3).map((item) => (
            <article key={`${item.label}-${item.value}`} className={`career-readiness-card ${item.severity ?? 'watch'}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>
      </section>
    )
  }

  function renderCategorySignatureDashboard() {
    if (personalSection === 'home' || !currentSignatureDashboard || !currentPersonalData) return null

    const readoutCard = currentPersonalData.summaryCards[currentSignatureDashboard.readoutSourceIndex]
    const selectedLens = currentSignatureDashboard.lenses[currentSignatureLensIndex] ?? currentSignatureDashboard.lenses[0]
    const selectedLensCard = currentPersonalData.summaryCards[selectedLens.sourceIndex]
    const action = currentSectionDashboard?.actionRows[0]

    return (
      <section className={`category-signature-dashboard ${currentSignatureDashboard.kind}`} aria-label={`${currentPersonalContent?.title} signature dashboard`}>
        <article className="signature-prime">
          <div className="signature-prime-copy">
            <div className="revamp-kicker">{currentSignatureDashboard.eyebrow}</div>
            <h3>{currentSignatureDashboard.title}</h3>
            <p>{action?.body ?? currentDirective.usefulFor}</p>
          </div>
          <div className="signature-readout" aria-label={currentSignatureDashboard.readoutLabel}>
            <span>{currentSignatureDashboard.readoutLabel}</span>
            <strong>{readoutCard?.value ?? 'Resolving'}</strong>
            <small>{currentSignatureDashboard.readoutUnit}</small>
          </div>
        </article>

        <article className="signature-visual">
          <div className="signature-map-label">{currentSignatureDashboard.mapLabel}</div>
          <div className="signature-map">
            {currentSignatureDashboard.mapItems.map((item, index) => {
              const card = currentPersonalData.summaryCards[item.sourceIndex]
              return (
                <button
                  key={item.label}
                  className={`signature-map-node node-${index + 1}${card?.stale ? ' stale' : ''}`}
                  onClick={() => setCategoryLensIndex((prev) => ({ ...prev, [personalSection]: index % currentSignatureDashboard.lenses.length }))}
                >
                  <span>{item.label}</span>
                  <strong>{card?.value ?? 'No signal'}</strong>
                </button>
              )
            })}
          </div>
        </article>

        <article className="signature-lens-panel">
          <div className="signature-lens-tabs" role="tablist" aria-label={`${currentPersonalContent?.title} dashboard lens`}>
            {currentSignatureDashboard.lenses.map((lens, index) => (
              <button
                key={lens.label}
                className={index === currentSignatureLensIndex ? 'active' : ''}
                onClick={() => setCategoryLensIndex((prev) => ({ ...prev, [personalSection]: index }))}
              >
                {lens.label}
              </button>
            ))}
          </div>
          <div className="signature-lens-body">
            <span>{selectedLensCard?.label ?? 'Selected signal'}</span>
            <strong>{selectedLens.title}</strong>
            <p>{selectedLens.body}</p>
            <small>{selectedLensCard ? `${selectedLensCard.value}: ${selectedLensCard.note}` : 'This lens is waiting for stronger projection data.'}</small>
          </div>
        </article>
      </section>
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
    <div className={personalSection === 'home' && appMode === 'personal' ? 'revamp-shell home-shell' : 'revamp-shell'}>
      <div className="revamp-shell-bg" />
      <header className={personalSection === 'home' && appMode === 'personal' ? 'revamp-topbar home-topbar' : 'revamp-topbar'}>
        <div>
          <div className="revamp-kicker">Mitchell Control Center</div>
          <h1>{personalSection === 'home' && appMode === 'personal' ? 'Home' : pageLabel(currentPage)}</h1>
          {personalSection === 'home' && appMode === 'personal' ? null : <p>{currentDirective.outcome}. {currentDirective.system}</p>}
        </div>
        <div className="revamp-top-actions">
          <button className={appMode === 'personal' ? 'revamp-toggle active' : 'revamp-toggle'} onClick={() => navigateToPage('home')}>Personal</button>
          <button className={appMode === 'business' ? 'revamp-toggle active' : 'revamp-toggle'} onClick={() => navigateToPage('business-command')}>Business</button>
          <button className="revamp-command-btn" onClick={() => setCommandOpen(true)}>Command</button>
          <button className="revamp-lock-btn" onClick={logout}>Lock</button>
        </div>
      </header>

      {personalSection === 'home' && appMode === 'personal' ? null : (
        <>
          {appMode === 'business' ? (
            <>
              <section className="command-horizon" aria-label="Growth OS command horizon">
                <div className="command-horizon-lead">
                  <span className="revamp-kicker">Growth OS Horizon</span>
                  <strong>{primaryNextMove}</strong>
                  <p>{currentDirective.usefulFor}</p>
                </div>
                <div className="command-horizon-cells">
                  {commandHorizonStats.map((item) => (
                    <article key={item.label} className="command-horizon-cell">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>
                <button className="command-horizon-action" onClick={() => setCommandOpen(true)}>
                  <span>Command</span>
                  <strong>Ctrl K</strong>
                </button>
              </section>

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
                <div><span>Mode</span><strong>Business operations</strong></div>
                <div><span>Navigation</span><strong>Direct pages active</strong></div>
              </section>
            </>
          ) : null}
        </>
      )}

      {appMode === 'personal' ? (
        personalSection === 'home' ? (
          <main className="home-constellation-screen" aria-label="Home control map">
            <section className="home-avatar-constellation" aria-label="Avatar section map">
              <svg className="home-constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {HOME_CONSTELLATION_NODES.map((node) => (
                  <g key={node.key}>
                    <line
                      className={`constellation-line ${node.tone}`}
                      x1={node.x}
                      y1={node.y}
                      x2={node.anchorX}
                      y2={node.anchorY}
                    />
                    <circle className={`constellation-anchor ${node.tone}`} cx={node.anchorX} cy={node.anchorY} r="0.72" />
                  </g>
                ))}
              </svg>
              <div className="home-avatar-core">
                <div className="avatar-stage-visual premium-stage-frame">
                  <Suspense
                    fallback={null}
                  >
                    <AvatarModelScene modelPath={AVATAR_MODEL_PATH} />
                  </Suspense>
                </div>
                <div className="home-core-label">
                  <span>Avatar Hub</span>
                  <strong>{projectedSections.identity?.summaryCards[0]?.value ?? 'Identity profile loading'}</strong>
                </div>
              </div>
              {HOME_CONSTELLATION_NODES.map((node) => {
                return (
                  <button
                    key={node.key}
                    className={`home-orbit-node node-${node.key} ${node.tier} ${node.tone}`}
                    style={{ '--node-x': `${node.x}%`, '--node-y': `${node.y}%` } as CSSProperties}
                    onClick={() => navigateToPage(node.key)}
                  >
                    <strong>{node.label}</strong>
                  </button>
                )
              })}
            </section>
          </main>
        ) : (
          <main className="revamp-detail-page">
            {personalSection === 'identity' || personalSection === 'vessel' || personalSection === 'career' || personalSection === 'education' ? null : (
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
            )}
            {personalSection === 'identity' ? renderIdentityScorecardPage() : personalSection === 'vessel' ? renderVesselPage() : personalSection === 'career' ? renderCareerPage() : personalSection === 'education' ? renderEducationPage() : (
              <>
                {renderCategorySignatureDashboard()}
                {renderPersonalDashboardLead()}
                <section className="revamp-card-grid">
                  {currentPersonalData?.summaryCards.map((card) => (
                    <article key={card.label} className={`glass-panel detail-signal-card${card.stale ? ' stale' : ''}`}>
                      <span>{card.label}</span>
                      <strong>{card.value}</strong>
                      <p>{card.note}</p>
                    </article>
                  ))}
                </section>
                {currentGrowthLoop ? (
                  <section className="personal-growth-loop" aria-label={`${currentPersonalContent?.title} growth loop`}>
                    <article className="glass-panel growth-loop-prime">
                      <div className="revamp-kicker">{currentGrowthLoop.definition.cadence}</div>
                      <h3>{currentGrowthLoop.definition.target}</h3>
                      <p>{currentGrowthLoop.definition.compound}</p>
                    </article>
                    <article className="growth-loop-step">
                      <span>Current signal</span>
                      <strong>{currentGrowthLoop.progressValue}</strong>
                      <p>{currentGrowthLoop.progressLabel}: {currentGrowthLoop.progressNote}</p>
                    </article>
                    <article className="growth-loop-step">
                      <span>Ritual</span>
                      <strong>{currentGrowthLoop.definition.ritual}</strong>
                      <p>Repeatable, small, and designed to keep this domain moving without making the app feel heavy.</p>
                    </article>
                    <article className="growth-loop-step warning">
                      <span>Blocker</span>
                      <strong>{currentGrowthLoop.blockerLabel}</strong>
                      <p>{currentGrowthLoop.blockerBody}</p>
                    </article>
                    <article className="growth-loop-step action">
                      <span>Next logical move</span>
                      <strong>{currentGrowthLoop.nextAction}</strong>
                      <p>{currentGrowthLoop.nextActionBody}</p>
                    </article>
                  </section>
                ) : null}
                <section className="cross-domain-board detail-cross-domain" aria-label={`${currentPersonalContent?.title} cross-domain intelligence`}>
                  <article className="glass-panel cross-domain-prime">
                    <div className="revamp-kicker">Why This Matters</div>
                    <h3>{currentCrossDomainInsights[0]?.title ?? 'This domain affects the rest of the system.'}</h3>
                    <p>{currentCrossDomainInsights[0]?.body ?? 'The page stays useful by showing what this signal changes across the wider Growth OS.'}</p>
                    {currentCrossDomainInsights[0] ? (
                      <div className="cross-domain-prime-proof">
                        <strong>{currentCrossDomainInsights[0].recommendation}</strong>
                        <small>{currentCrossDomainInsights[0].evidence}</small>
                      </div>
                    ) : null}
                    <div className="confidence-row">
                      <span>{sourceConfidence(currentPersonalData ?? undefined)}</span>
                      <span>{currentPersonalData?.freshness?.label ?? 'Projected records'}</span>
                      <span>{currentPersonalData?.missingData?.length ?? 0} gaps</span>
                    </div>
                  </article>
                  {currentCrossDomainInsights.slice(1).map((item) => (
                    <button key={item.title} className={`cross-domain-card ${item.tone}`} onClick={() => navigateToPage(item.pages.find((page) => page !== personalSection) ?? item.pages[0])}>
                      <span>{item.label}</span>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                      <div className="cross-domain-card-proof">
                        <small>Next: {item.recommendation}</small>
                        <small>Evidence: {item.evidence}</small>
                      </div>
                      <div className="cross-domain-route-row">
                        {item.pages.map((page) => (
                          <em key={page}>{pageLabel(page)}</em>
                        ))}
                      </div>
                    </button>
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
              </>
            )}
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
            <div className="command-input-wrap">
              <input autoFocus placeholder="Tell the control center what you want to do..." value={commandValue} onChange={(e) => setCommandValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void submitCommand() }} />
              <button className="revamp-command-btn solid" onClick={() => void submitCommand()}>Send</button>
            </div>
            <div className="command-launcher-grid">
              <section className="command-route-panel" aria-label="Fast navigation">
                <span>Fast navigation</span>
                <div className="command-route-list">
                  {quickNavItems.map((item) => (
                    <button key={item.page} className={item.page === currentPage ? 'command-route-item active' : 'command-route-item'} onClick={() => navigateToPage(item.page)}>
                      <strong>{item.label}</strong>
                      <p>{item.description}</p>
                      <small>{PAGE_ROUTES[item.page]}</small>
                    </button>
                  ))}
                </div>
              </section>
              <section className="command-route-panel" aria-label="Context actions">
                <span>Context actions</span>
                <div className="command-action-grid">
                  {quickActions.map((item) => (
                    <button
                      key={item.label}
                      className="command-action-button"
                      onClick={() => item.page ? navigateToPage(item.page) : item.prompt ? setCommandValue(item.prompt) : undefined}
                    >
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                    </button>
                  ))}
                </div>
                <div className="command-suggestion-row compact">
                  {commandSuggestions.map((item) => (
                    <button key={item.label} className="command-suggestion-chip" onClick={() => setCommandValue(item.prompt)}>{item.label}</button>
                  ))}
                </div>
              </section>
            </div>
            <div className="command-intelligence-grid">
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
                    <p>Search a page, pick an action, or type a request to see the route before it moves through the command lane.</p>
                  </>
                )}
              </div>
              <div className="command-response-box">
                <span>Latest response</span>
                <strong>Command status</strong>
                <p>{commandResponse}</p>
              </div>
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
