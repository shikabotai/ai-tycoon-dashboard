import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import './App.css'
import { useDashboardData } from './hooks/useDashboardData'
import { loadProjectedSection, type PersonalProjectionKey } from './data/personalProjectionClient'
import type { ProjectedSection as LiveProjectedSection } from './data/projectedTypes'
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
type PersonalCard = { label: string; value: string; note: string; stale?: boolean }
type PersonalSectionData = { heroSummary: string; summaryCards: PersonalCard[]; highlights: string[]; freshness?: { label: string; ageDays: number | null; stale: boolean } }
type HomeSignalCard = { kicker: string; title: string; body: string }
type ProjectionHighlightCard = { title: string; text: string }
type CommandHistoryEntry = { id: string; text: string; context: string; action?: BusinessCommandResponse['runtimeAction']; handoff?: CommandHandoffResponse }
type CommandSuggestion = { label: string; prompt: string }
type EmptyStateProps = { label: string; title: string; body: string }
type AvatarAssetStatus = 'loading' | 'ready' | 'missing'

type NodeSpec = { key: Exclude<PersonalSection, 'home'>; label: string; tier: 'core' | 'secondary' }
type NavItem = { page: AppPage; label: string; description: string }

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
  const actionTrail = useMemo(() => commandHistory.filter((item) => item.action).slice(0, 3), [commandHistory])

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
          <p>Private personal and business operating system with direct routes for every major dashboard.</p>
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
                <div className="revamp-kicker">Avatar Stage</div>
                <h2>Mitchell’s command presence at the center</h2>
                <p>The home screen centers the avatar stage as a live identity surface, with personal signal cards and business pressure orbiting around it.</p>
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
                <div className="revamp-kicker">Command Principle</div>
                <h3>Private cockpit first</h3>
                <p>The control center reads as Mitchell’s private operating deck, with business systems orbiting a strong personal core.</p>
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
            <section className="detail-highlight-grid">
              {highlightCards.map((item) => (
                <article key={item.title} className="glass-panel detail-highlight-card">
                  <div className="revamp-kicker">Projection signal</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
              {currentPersonalData?.freshness ? (
                <article className={`glass-panel detail-highlight-card freshness-card${currentPersonalData.freshness.stale ? ' stale' : ''}`}>
                  <div className="revamp-kicker">Freshness</div>
                  <h3>{currentPersonalData.freshness.label}</h3>
                  <p>{currentPersonalData.freshness.ageDays == null ? 'Source recency has not been established yet.' : `${currentPersonalData.freshness.ageDays} day${currentPersonalData.freshness.ageDays === 1 ? '' : 's'} since latest source update.`}</p>
                </article>
              ) : null}
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
      ) : (
        <main className="revamp-business-grid">
          <section className="revamp-business-main">
            <article className="glass-panel hero-business-panel">
              <div className="revamp-kicker">Business Command</div>
              <h2>Live operations command</h2>
              <p>Queue pressure, approvals, agent load, and publishing signals stay close enough for a fast decision.</p>
              <div className="business-panel-switches">
                {(['overview', 'agents', 'review'] as BusinessPanel[]).map((panel) => (
                  <button
                    key={panel}
                    className={businessPanel === panel ? 'revamp-toggle active' : 'revamp-toggle'}
                    onClick={() => navigateToPage(panel === 'agents' ? 'agents' : panel === 'review' ? 'review-dock' : 'business-command')}
                  >
                    {panel}
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

            <section className="revamp-card-grid business-metric-grid">
              <article className="glass-panel business-metric-card"><span>Ventures</span><strong>{dashboardData.projects.length}</strong><p>Tracked projects visible in Supabase.</p></article>
              <article className="glass-panel business-metric-card"><span>Revenue / Margin</span><strong>{formatUsd(businessSummary.revenueUsd)} / {formatUsd(businessSummary.marginUsd)}</strong><p>Latest live business snapshot.</p></article>
              <article className="glass-panel business-metric-card"><span>Approval Pressure</span><strong>{businessSummary.approvalsPending}</strong><p>Items waiting in review.</p></article>
              <article className="glass-panel business-metric-card"><span>Recent Output</span><strong>{businessSummary.publishedToday} today</strong><p>{recentActivity[0] ? `${recentActivity[0].taskTitle} · ${recentActivity[0].eventType}` : 'Output lane quiet. The command deck is ready for the next release cycle.'}</p></article>
            </section>

            {businessPanel !== 'review' ? (
              <article className="glass-panel">
                <div className="revamp-kicker">Agent Hierarchy</div>
                <div className="agent-card-grid">
                  {businessAgents.length > 0 ? (
                    businessAgents.map((agent) => (
                      <div key={agent.id} className="agent-card-shell neon-agent-card">
                        <span>{agent.chamberLabel}</span>
                        <strong>{agent.displayName}</strong>
                        <p>{agent.role} · {agent.status}</p>
                        <p>{agent.tasks[0] ? `Current: ${agent.tasks[0].title}` : 'Standing by for the next assigned task.'}</p>
                      </div>
                    ))
                  ) : (
                    <BusinessEmptyState
                      label="Agent hierarchy"
                      title="No active chambers reporting"
                      body="The hierarchy stays ready for the next runtime sync with a clear, intentional quiet state."
                    />
                  )}
                </div>
              </article>
            ) : null}
          </section>

          <aside className="revamp-business-side">
            <article className="glass-panel review-dock-panel">
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
            <RuntimeTrailPanel items={actionTrail} />
          </aside>
        </main>
      )}

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
