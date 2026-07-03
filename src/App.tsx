import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { useDashboardData } from './hooks/useDashboardData'
import { sendBusinessCommand } from './data/businessCommandApi'

type AppMode = 'personal' | 'business'
type PersonalSection =
  | 'home'
  | 'vessel'
  | 'identity'
  | 'career'
  | 'wealth'
  | 'ventures'
  | 'systems'
  | 'education'
  | 'relationships'
  | 'knowledge'

type BusinessPanel = 'overview' | 'agents' | 'review'

type PersonalCard = { label: string; value: string; note: string; stale?: boolean }

type PersonalSectionData = {
  heroSummary: string
  summaryCards: PersonalCard[]
  highlights: string[]
  freshness?: {
    label: string
    ageDays: number | null
    stale: boolean
  }
}

type AutopilotStatus = {
  activeTaskId: string
  title: string
  status: string
  startedAt: string
  lastHeartbeatAt: string
  lastWorkActionAt: string
  lastCommitAt: string | null
  currentStep: string
  lastCompletedStep: string
  nextStep: string
  percentEstimate: number
  blocker: string | null
  repo: string
  notes: string[]
}


type NodeSpec = {
  key: Exclude<PersonalSection, 'home'>
  label: string
  position: [number, number, number]
  tier: 'core' | 'secondary'
}

type LoginState = {
  username: string
  password: string
}

const VALID_USERNAME = 'mthanath64'
const VALID_PASSWORD = 'Mitch2002'
const MAX_LOGIN_ATTEMPTS = 10
const LOCKOUT_MS = 10 * 60 * 1000
const SESSION_KEY = 'control-center-auth'
const LOGIN_STATE_KEY = 'control-center-login-state'

const PERSONAL_NODES: NodeSpec[] = [
  { key: 'vessel', label: 'Vessel', position: [-3.6, 1.1, 0], tier: 'core' },
  { key: 'identity', label: 'Identity', position: [0, 2.65, 0], tier: 'core' },
  { key: 'career', label: 'Career', position: [3.4, 1.25, 0], tier: 'core' },
  { key: 'wealth', label: 'Wealth', position: [3.9, -0.55, 0], tier: 'core' },
  { key: 'ventures', label: 'Ventures', position: [2.25, -2.2, 0], tier: 'core' },
  { key: 'systems', label: 'Systems', position: [-2.25, -2.2, 0], tier: 'core' },
  { key: 'education', label: 'Education', position: [-4.2, -0.45, 0], tier: 'secondary' },
  { key: 'relationships', label: 'Relationships', position: [-1.45, 3.65, 0], tier: 'secondary' },
  { key: 'knowledge', label: 'Knowledge', position: [1.75, 3.6, 0], tier: 'secondary' },
]

const PERSONAL_SECTION_CONTENT: Record<Exclude<PersonalSection, 'home'>, { eyebrow: string; title: string; summaryCards: string[]; highlights: string[] }> = {
  vessel: {
    eyebrow: 'Body and performance',
    title: 'Vessel',
    summaryCards: ['Weight / body metrics', 'Workout consistency', 'Nutrition consistency', 'Sleep / recovery', 'Mental state / discipline', 'Current physique goal'],
    highlights: ['Recent workouts and body trends', 'Cut / recomp progress from PunkRecords', 'Stale-data warnings with best-effort status'],
  },
  identity: {
    eyebrow: 'Internal command',
    title: 'Identity',
    summaryCards: ['Current identity statement', 'Ideal self alignment', 'Current mission / year theme', 'Top active goals', 'Current dilemmas / blockers', 'Recent lessons / growth'],
    highlights: ['Ideal Self and Annual Goals as centerpieces', 'Decision Engine, philosophy, and blockers', 'Alignment-first view of momentum'],
  },
  career: {
    eyebrow: 'Trajectory and leverage',
    title: 'Career',
    summaryCards: ['Current career trajectory', 'Resume / portfolio readiness', 'Job search status', 'Skill-building progress', 'Current leverage opportunities', 'Next career milestone'],
    highlights: ['Career strategy overviews and SWOT', 'Portfolio / resume readiness', 'Opportunities tied to real repo data'],
  },
  wealth: {
    eyebrow: 'Capital and strategy',
    title: 'Wealth',
    summaryCards: ['Net worth', 'Cash / liquidity', 'Income snapshot', 'Investment allocation', 'Current financial priorities', 'Wealth-building progress / phase'],
    highlights: ['Budget, cashflow, investments, and tax strategy', 'Current financial priorities surfaced fast', 'Balanced between present state and future direction'],
  },
  ventures: {
    eyebrow: 'Personal venture strategy',
    title: 'Ventures',
    summaryCards: ['Current priority venture', 'Venture portfolio snapshot', 'Biggest blocker', 'Available capital / deployment posture', 'Current opportunity score / ROI focus', 'Next key venture decision'],
    highlights: ['Personal venture worldview from PunkRecords', 'Priority logic and blocker visibility', 'Clear distinction from live Business Command operations'],
  },
  systems: {
    eyebrow: 'Life operations layer',
    title: 'Systems',
    summaryCards: ['Today’s top priorities', 'Operations task board status', 'Active automations', 'Open loops / stale items', 'Discipline / consistency snapshot', 'Recent captures / updates'],
    highlights: ['Operations Task Board as a daily command center', 'Automations, capture systems, and stale-item visibility', 'Strong anchor for the global daily focus layer'],
  },
  education: {
    eyebrow: 'Learning and school',
    title: 'Education',
    summaryCards: ['Current program / course load', 'Current courses', 'Upcoming deadlines', 'Progress / completion status', 'Current learning focus', 'Academic priority level'],
    highlights: ['GT / UF / certification context', 'Current course and deadline clarity', 'Education visible without taking over the whole system'],
  },
  relationships: {
    eyebrow: 'Family and connection',
    title: 'Relationships',
    summaryCards: ['Family / relationship priority snapshot', 'Current connection health', 'Important people / relationship focus', 'Upcoming relationship actions', 'Long-term relationship vision', 'Current blockers / gaps'],
    highlights: ['Family, future partner, and relationship vision', 'Connection health without overexposing sensitive content', 'Actionable relationship focus rather than vague reflection'],
  },
  knowledge: {
    eyebrow: 'Mental models and references',
    title: 'Knowledge',
    summaryCards: ['Current learning domains', 'Most valuable mental models', 'Recently added knowledge', 'High-value references', 'Current research / reading focus', 'Knowledge gaps to close'],
    highlights: ['Business, finance, health, and psychology frameworks', 'Knowledge browser built from PunkRecords structure', 'Designed to support action, not just hoarding information'],
  },
}

function formatRelativeTime(value?: string | null) {
  if (!value) return 'No recent activity'
  const diffMs = Date.now() - Date.parse(value)
  if (Number.isNaN(diffMs)) return value
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
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

function App() {
  const [authed, setAuthed] = useState(false)
  const [appMode, setAppMode] = useState<AppMode>('personal')
  const [personalSection, setPersonalSection] = useState<PersonalSection>('home')
  const [businessPanel, setBusinessPanel] = useState<BusinessPanel>('overview')
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandValue, setCommandValue] = useState('')
  const [login, setLogin] = useState<LoginState>({ username: '', password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [commandResponse, setCommandResponse] = useState('Your spotlight command bar now routes by context and can shift Business Command focus automatically.')
  const [reviewNoteDrafts, setReviewNoteDrafts] = useState<Record<string, string>>({})
  const [selectedReviewTaskId, setSelectedReviewTaskId] = useState<string | null>(null)
  const [autopilotStatus, setAutopilotStatus] = useState<AutopilotStatus | null>(null)

  const dashboardData = useDashboardData()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const session = window.localStorage.getItem(SESSION_KEY)
    if (session === 'true') setAuthed(true)
    const stored = loadStoredLoginState()
    setAttempts(stored.attempts)
    setLockoutUntil(stored.lockoutUntil)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])


  useEffect(() => {
    let cancelled = false

    async function loadAutopilotStatus() {
      try {
        const response = await fetch('/api/autopilot/status')
        if (!response.ok) throw new Error('autopilot status failed')
        const data = (await response.json()) as AutopilotStatus | null
        if (!cancelled) setAutopilotStatus(data)
      } catch {
        if (!cancelled) setAutopilotStatus(null)
      }
    }

    void loadAutopilotStatus()
    const id = window.setInterval(() => {
      if (!cancelled) void loadAutopilotStatus()
    }, 15000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const lockedOut = lockoutUntil > now
  const lockoutSeconds = Math.max(0, Math.ceil((lockoutUntil - now) / 1000))

  const currentPersonalContent = personalSection === 'home' ? null : PERSONAL_SECTION_CONTENT[personalSection]
  const currentPersonalData = useMemo<PersonalSectionData | null>(() => {
    if (personalSection === 'home') return null
    if (!currentPersonalContent) return null
    return {
      heroSummary: `${currentPersonalContent.title} is scaffolded from the approved design plan and will next be connected to structured repo projections.`,
      summaryCards: currentPersonalContent.summaryCards.map((card) => ({
        label: card,
        value: 'Planned',
        note: 'Phase 1 shell is live. Repo-backed projections come next.',
      })),
      highlights: currentPersonalContent.highlights,
    }
  }, [personalSection, currentPersonalContent])

  const lifeMomentum = useMemo(() => ({ score: 78, trend: 'Rising', components: ['Vessel', 'Identity', 'Wealth', 'Ventures', 'Systems', 'Execution'] }), [])

  const businessSummary = dashboardData.summary
  const queueHealth = dashboardData.queueHealth
  const topPendingReview = dashboardData.artifactReviewItems[0]
  const selectedReviewTaskIdSafe = selectedReviewTaskId ?? topPendingReview?.taskId ?? null
  const selectedReviewItem = dashboardData.artifactReviewItems.find((item) => item.taskId === selectedReviewTaskIdSafe) ?? topPendingReview
  const selectedReviewDetail = selectedReviewItem ? dashboardData.getTaskDetail(selectedReviewItem.taskId) : undefined
  const businessAgents = dashboardData.agentChambers.slice(0, 6)
  const recentActivity = dashboardData.activityFeed.slice(0, 5)

  const dailyFocus = {
    personal: 'Keep Vessel momentum high and finish the next identity-aligned priority.',
    business: topPendingReview ? `Clear review pressure on ${topPendingReview.taskTitle}.` : 'Push the highest-value business bottleneck instead of spreading attention.',
    drift: queueHealth?.oldest_stale_task_title ? `Oldest stale task: ${queueHealth.oldest_stale_task_title}` : 'Logging and consistency slip fastest when priorities go vague.',
    momentum: `${lifeMomentum.score}/100 · ${lifeMomentum.trend}`,
  }

  function handleLoginSubmit(event: React.FormEvent) {
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
        setCommandResponse('Deny requires notes so the next attempt has actionable feedback.')
        return
      }
      await dashboardData.decideTaskApproval(taskId, status, reviewNoteDrafts[taskId] || undefined)
      setCommandResponse(status === 'approved' ? 'Review approved from Business Command.' : 'Review denied with notes from Business Command.')
      setSelectedReviewTaskId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Approval action failed.'
      setCommandResponse(message)
    }
  }

  async function submitCommand() {
    if (!commandValue.trim()) return
    const trimmed = commandValue.trim()
    setCommandHistory((prev) => [trimmed, ...prev].slice(0, 6))
    try {
      const response = await sendBusinessCommand(trimmed, {
        appMode,
        personalSection,
        businessPanel,
      }, businessSummary)
      if (appMode === 'business' && response.suggestedPanel) {
        setBusinessPanel(response.suggestedPanel)
      }
      setCommandResponse(`Route: ${response.route} · Intent: ${response.intent}. ${response.message} Next: ${response.nextAction}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Command routing failed.'
      setCommandResponse(message)
    }
    setCommandValue('')
  }

  if (!authed) {
    return (
      <div className="login-shell">
        <div className="login-orb" />
        <form className="login-card" onSubmit={handleLoginSubmit}>
          <div className="login-eyebrow">Private Control Center</div>
          <h1>Enter Command Access</h1>
          <p className="login-copy">A private life-and-business operating system for Mitchell.</p>
          <label>
            <span>Username</span>
            <input value={login.username} onChange={(e) => setLogin((prev) => ({ ...prev, username: e.target.value }))} autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} autoComplete="current-password" />
          </label>
          <button type="submit" disabled={lockedOut}>{lockedOut ? `Locked · ${lockoutSeconds}s` : 'Enter'}</button>
          <div className="login-meta">
            <span>Attempts used: {attempts}/{MAX_LOGIN_ATTEMPTS}</span>
            {loginError ? <span className="login-error">{loginError}</span> : <span>Simple Phase 1 access gate with temporary lockout.</span>}
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="control-shell">
      <header className="top-shell-bar">
        <div>
          <div className="shell-mark">Private Control Center</div>
          <div className="shell-submark">Dark-tech life OS · Personal first · Business command on standby</div>
        </div>
        <div className="shell-actions">
          <button className={appMode === 'personal' ? 'shell-toggle active' : 'shell-toggle'} onClick={() => setAppMode('personal')}>Personal</button>
          <button className={appMode === 'business' ? 'shell-toggle active' : 'shell-toggle'} onClick={() => setAppMode('business')}>Business</button>
          <button className="command-trigger" onClick={() => setCommandOpen(true)}>Open Command</button>
          <button className="logout-btn" onClick={logout}>Lock</button>
        </div>
      </header>

      <section className="daily-focus-strip">
        <div><span>Personal</span><strong>{dailyFocus.personal}</strong></div>
        <div><span>Business</span><strong>{dailyFocus.business}</strong></div>
        <div><span>Drift</span><strong>{dailyFocus.drift}</strong></div>
        <div><span>Momentum</span><strong>{dailyFocus.momentum}</strong></div>
      </section>

      {appMode === 'personal' ? (
        personalSection === 'home' ? (
          <main className="personal-home">
            <section className="avatar-scene-card">
              <div className="scene-overlay center-info">
                <div className="center-chip">Mitchell</div>
                <div className="center-age">Age 23</div>
                <div className="momentum-card">
                  <span>Life Momentum</span>
                  <strong>{lifeMomentum.score}/100</strong>
                  <em>{lifeMomentum.trend}</em>
                </div>
              </div>
              <div className="scene-overlay business-portal-wrap">
                <button className="business-portal" onClick={() => setAppMode('business')}>
                  <span>Gateway</span>
                  <strong>Business Command</strong>
                </button>
              </div>
              <div className="static-scene-shell">
                <div className="static-avatar-core">●</div>
                <div className="static-node-grid">
                  {PERSONAL_NODES.map((node) => (
                    <button key={node.key} className={`node-button ${node.tier}`} onClick={() => setPersonalSection(node.key)}>
                      {node.label}
                    </button>
                  ))}
                </div>
                <p className="login-copy">Static personal-home shell, with 3D stack removed for isolation.</p>
              </div>
            </section>
          </main>
        ) : (
          <main className="section-page personal-section-page">
            <section className="section-hero">
              <button className="back-button" onClick={() => setPersonalSection('home')}>← Personal Home</button>
              <div>
                <div className="section-eyebrow">{currentPersonalContent?.eyebrow}</div>
                <h1>{currentPersonalContent?.title}</h1>
                <p>{currentPersonalData?.heroSummary ?? `${currentPersonalContent?.title} is dashboard-first in Phase 1, with current state and goal progress balanced together.`}</p>
              </div>
            </section>
            <section className="summary-grid">
              {currentPersonalData?.summaryCards.map((card) => (
                <article key={card.label} className={`summary-card${card.stale ? ' stale' : ''}`}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.note}</p>
                </article>
              ))}
            </section>
            <section className="detail-panels">
              <article className="detail-panel">
                <h2>Why this page matters</h2>
                <ul>
                  {currentPersonalData?.highlights.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <article className="detail-panel">
                <h2>Projection status</h2>
                <p>This page is now using a real PunkRecords projection path. The next layer is richer source extraction and better freshness signals, not placeholder replacement.</p>
                {currentPersonalData?.freshness ? (
                  <div className={`history-chip${currentPersonalData.freshness.stale ? ' stale-chip' : ''}`}>
                    {currentPersonalData.freshness.label} · {currentPersonalData.freshness.ageDays === null ? 'freshness unknown' : `${currentPersonalData.freshness.ageDays}d old`}
                  </div>
                ) : null}
              </article>
            </section>
          </main>
        )
      ) : (
        <main className="business-command-page">
          <section className="section-hero business-hero">
            <div>
              <div className="section-eyebrow">Business Command</div>
              <h1>Hybrid Command Overview</h1>
              <p>Top = ventures/goals, middle = agents/hierarchy, side = reviews/blockers. This is the new operating bridge between business repo strategy and live business state.</p>
            </div>
            <div className="business-panel-switches">
              {(['overview', 'agents', 'review'] as BusinessPanel[]).map((panel) => (
                <button key={panel} className={businessPanel === panel ? 'shell-toggle active' : 'shell-toggle'} onClick={() => setBusinessPanel(panel)}>{panel}</button>
              ))}
            </div>
          </section>

          {dashboardData.loading ? (
            <section className="detail-panel business-status-panel">
              <h2>Loading live business state</h2>
              <p>Pulling projects, queue health, approvals, activity, and agent runs from Supabase.</p>
            </section>
          ) : dashboardData.error ? (
            <section className="detail-panel business-status-panel error">
              <h2>Business data issue</h2>
              <p>{dashboardData.error}</p>
            </section>
          ) : (
            <>
              <section className="business-top-strip">
                <article className="summary-card business-strip-card">
                  <span>Live ventures</span>
                  <strong>{dashboardData.projects.length}</strong>
                  <p>Tracked business projects currently visible in Supabase.</p>
                </article>
                <article className="summary-card business-strip-card">
                  <span>Revenue / margin</span>
                  <strong>{formatUsd(businessSummary.revenueUsd)} / {formatUsd(businessSummary.marginUsd)}</strong>
                  <p>Latest project-level P&L snapshot, with cost at {formatUsd(businessSummary.costUsd)}.</p>
                </article>
                <article className="summary-card business-strip-card">
                  <span>Approval pressure</span>
                  <strong>{businessSummary.approvalsPending}</strong>
                  <p>Artifacts currently awaiting human decision in the review dock.</p>
                </article>
                <article className="summary-card business-strip-card">
                  <span>Queue health</span>
                  <strong>{queueHealth?.runnable_count ?? 0} runnable / {queueHealth?.in_progress_count ?? 0} active</strong>
                  <p>{queueHealth?.stale_active_count ?? 0} stale active, {queueHealth?.flagged_count ?? 0} flagged, {queueHealth?.review_loop_count ?? 0} review loops.</p>
                </article>
                <article className="summary-card business-strip-card">
                  <span>Recent output</span>
                  <strong>{businessSummary.publishedToday} published today</strong>
                  <p>{recentActivity[0] ? `${recentActivity[0].taskTitle} · ${recentActivity[0].eventType}` : 'No recent activity yet.'}</p>
                </article>

                {autopilotStatus ? (
                  <article className="summary-card business-strip-card">
                    <span>Autopilot</span>
                    <strong>{autopilotStatus.percentEstimate}% · {autopilotStatus.status}</strong>
                    <p>Last work: {formatRelativeTime(autopilotStatus.lastWorkActionAt)} · Current step: {autopilotStatus.currentStep}</p>
                  </article>
                ) : null}
              </section>

              {businessPanel !== 'review' ? (
                <section className="business-main-grid">
                  <div className="business-center-column">
                    <article className="detail-panel hierarchy-panel">
                      <h2>Agent Hierarchy</h2>
                      <p>Live oversight view from Supabase tasks, agent runs, and recent activity.</p>
                      <div className="agent-card-grid">
                        {businessAgents.map((agent) => (
                          <div key={agent.id} className="agent-card-shell">
                            <span>{agent.chamberLabel}</span>
                            <strong>{agent.displayName}</strong>
                            <p>{agent.role} · {agent.status} · {agent.taskCount} active tasks</p>
                            <p>Recent run: {formatRelativeTime(agent.lastRunAt)} · Cost: {formatUsd(agent.totalCostUsd)}</p>
                            <p>{agent.tasks[0] ? `Current: ${agent.tasks[0].title}` : 'No active assigned task right now.'}</p>
                            <p>{agent.lastError ? `Blocked: ${agent.lastError}` : 'No current error signal.'}</p>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article className="detail-panel hierarchy-panel">
                      <h2>Recent activity</h2>
                      <ul>
                        {recentActivity.map((item) => (
                          <li key={item.id}>{item.taskTitle} · {item.eventType} · {formatRelativeTime(item.createdAt)}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </section>
              ) : null}

              {businessPanel !== 'agents' ? (
                <aside className="business-side-column">
                  <article className="detail-panel review-panel">
                    <h2>Review Dock</h2>
                    {selectedReviewItem ? (
                      <div className="review-dock-live">
                        <div className="review-queue-list">
                          {dashboardData.artifactReviewItems.slice(0, 4).map((item) => (
                            <button
                              key={`${item.taskId}-${item.artifactId}`}
                              className={selectedReviewItem.taskId === item.taskId ? 'review-queue-item active' : 'review-queue-item'}
                              onClick={() => setSelectedReviewTaskId(item.taskId)}
                            >
                              <strong>{item.taskTitle}</strong>
                              <span>{item.projectTitle ?? 'No project'} · {item.artifactType}</span>
                            </button>
                          ))}
                        </div>
                        <p><strong>{selectedReviewItem.taskTitle}</strong></p>
                        <p>{selectedReviewItem.projectTitle ?? 'No project title'} · {selectedReviewItem.artifactType} · {formatRelativeTime(selectedReviewItem.createdAt)}</p>
                        <p>{selectedReviewItem.filename || selectedReviewItem.storagePath || 'No file path yet'}</p>
                        {selectedReviewDetail ? (
                          <div className="review-detail-grid">
                            <div className="history-chip">Artifacts: {selectedReviewDetail.artifacts.length}</div>
                            <div className="history-chip">Approvals: {selectedReviewDetail.approvals.length}</div>
                            <div className="history-chip">Events: {selectedReviewDetail.events.length}</div>
                            <div className="history-chip">Deliveries: {selectedReviewDetail.deliveries.length}</div>
                            <div className="history-chip">Publications: {selectedReviewDetail.publications.length}</div>
                          </div>
                        ) : null}
                        <textarea
                          className="review-note-input"
                          placeholder="Required deny notes / optional approval notes"
                          value={reviewNoteDrafts[selectedReviewItem.taskId] || ''}
                          onChange={(e) => setReviewNoteDrafts((prev) => ({ ...prev, [selectedReviewItem.taskId]: e.target.value }))}
                        />
                        <div className="review-actions">
                          <button className="command-trigger solid" onClick={() => void decideReview(selectedReviewItem.taskId, 'approved')}>Approve</button>
                          <button className="logout-btn" onClick={() => void decideReview(selectedReviewItem.taskId, 'rejected')}>Deny</button>
                        </div>
                      </div>
                    ) : (
                      <p>No pending approval item right now.</p>
                    )}
                    <ul>
                      <li>{queueHealth?.oldest_stale_task_title ? `Oldest stale: ${queueHealth.oldest_stale_task_title}` : 'No stale task highlighted.'}</li>
                      <li>{queueHealth?.hottest_review_loop_task_title ? `Review loop hotspot: ${queueHealth.hottest_review_loop_task_title}` : 'No review loop hotspot currently.'}</li>
                      <li>{queueHealth?.hottest_retry_loop_task_title ? `Retry loop hotspot: ${queueHealth.hottest_retry_loop_task_title}` : 'No retry loop hotspot currently.'}</li>
                    </ul>
                    {autopilotStatus ? (
                      <div className="review-detail-grid">
                        <div className="history-chip">Current step: {autopilotStatus.currentStep}</div>
                        <div className="history-chip">Next step: {autopilotStatus.nextStep}</div>
                      </div>
                    ) : null}
                  </article>
                </aside>
              ) : null}
            </>
          )}
        </main>
      )}

      {commandOpen ? (
        <div className="command-overlay">
          <div className="command-modal">
              <div className="command-modal-top">
                <div>
                  <div className="shell-mark">Spotlight Command</div>
                  <div className="shell-submark">Natural-language control across personal and business contexts</div>
                </div>
                <button className="logout-btn" onClick={() => setCommandOpen(false)}>Close</button>
              </div>
              <div className="command-context">Context: {appMode} · {appMode === 'personal' ? personalSection : businessPanel}</div>
              {autopilotStatus ? <div className="command-context">Autopilot: {autopilotStatus.status} · {autopilotStatus.currentStep}</div> : null}
              <div className="command-input-wrap">
                <input
                  autoFocus
                  placeholder="Type what you want in natural language..."
                  value={commandValue}
                  onChange={(e) => setCommandValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void submitCommand()
                  }}
                />
                <button className="command-trigger solid" onClick={() => void submitCommand()}>Send</button>
              </div>
              <div className="command-response-box">{commandResponse}</div>
              {appMode === 'business' ? <div className="command-context">Business surface follows routed panel focus automatically.</div> : null}
              <div className="command-history">
                <h3>Recent commands</h3>
                {commandHistory.length === 0 ? <p>No commands yet.</p> : commandHistory.map((item) => <div key={item} className="history-chip">{item}</div>)}
              </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
