import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { agentIdentities } from './agentIdentities'

type QueueHealth = {
  observed_at: string | null
  runnable_count: number
  in_progress_count: number
  flagged_count: number
}

type Summary = {
  revenueUsd: number
  costUsd: number
  marginUsd: number
  publishedToday: number
}

type ProjectRow = {
  id: string
  title: string
}

type TaskRow = {
  id: string
  title: string
  project_id: string | null
  assigned_agent_id?: string | null
  status?: string
}

type EventRow = {
  id: string
  task_id: string
  event_type: string
  actor_agent_id: string | null
  created_at: string
  payload: Record<string, unknown> | null
}

type ArtifactRow = {
  id: string
  task_id: string
  artifact_type: string
  content: string | null
  filename: string | null
  storage_path: string | null
  created_at: string
}

type ApprovalRow = {
  id: string
  task_id: string
  status: string
  comment?: string | null
  created_at: string
}

type ReviewItem = {
  artifactId: string
  taskId: string
  taskTitle: string
  projectTitle?: string
  artifactType: string
  content: string | null
  filename: string | null
  storagePath: string | null
  approvalStatus: string
}

type AgentRow = {
  id: string
  role: string
  display_name: string
  status: string
}

type TaskDetail = {
  task: TaskRow
  projectTitle?: string
  approvals: ApprovalRow[]
  artifacts: ArtifactRow[]
  events: EventRow[]
}

type PanelKey = 'metrics' | 'activity' | 'review'

const DECK_LAYOUT = [
  ['gateway', 'manager', 'reviewer'],
  ['researcher', 'content', null],
  ['worker-1', 'worker-2', null],
]

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const [approvalBusy, setApprovalBusy] = useState(false)
  const [taskBusy, setTaskBusy] = useState(false)
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null)

  const [metricsLoaded, setMetricsLoaded] = useState(false)
  const [activityLoaded, setActivityLoaded] = useState(false)
  const [reviewLoaded, setReviewLoaded] = useState(false)

  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null)
  const [summary, setSummary] = useState<Summary>({ revenueUsd: 0, costUsd: 0, marginUsd: 0, publishedToday: 0 })
  const [events, setEvents] = useState<EventRow[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [approvals, setApprovals] = useState<ApprovalRow[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadBase() {
      setLoading(true)
      setError(null)

      const [projectsRes, tasksRes, agentsRes] = await Promise.all([
        supabase.from('projects').select('id,title').order('title'),
        supabase.from('tasks').select('id,title,project_id,assigned_agent_id,status').order('updated_at', { ascending: false }).limit(80),
        supabase.from('agents').select('id,role,display_name,status').order('id'),
      ])

      if (cancelled) return

      const firstError = projectsRes.error || tasksRes.error || agentsRes.error
      if (firstError) {
        setError(firstError.message)
        setLoading(false)
        return
      }

      setProjects((projectsRes.data ?? []) as ProjectRow[])
      setTasks((tasksRes.data ?? []) as TaskRow[])
      setAgents((agentsRes.data ?? []) as AgentRow[])
      setLoading(false)
    }

    void loadBase()
    return () => {
      cancelled = true
    }
  }, [selectedProjectId])

  useEffect(() => {
    if (openPanel !== 'metrics' || metricsLoaded) return
    let cancelled = false

    async function loadMetrics() {
      const [queueRes, pnlRes, publicationsRes] = await Promise.all([
        supabase.from('v_queue_health').select('observed_at,runnable_count,in_progress_count,flagged_count').limit(1).maybeSingle(),
        supabase.from('v_project_pnl').select('project_id,revenue_usd,cost_usd,margin_usd').order('month', { ascending: false }).limit(50),
        supabase.from('publications').select('project_id,published_at').order('published_at', { ascending: false }).limit(100),
      ])

      if (cancelled) return
      const firstError = queueRes.error || pnlRes.error || publicationsRes.error
      if (firstError) {
        setError(firstError.message)
        return
      }

      setQueueHealth((queueRes.data as QueueHealth | null) ?? null)

      const pnlRows = (pnlRes.data ?? []) as Array<{ project_id: string; revenue_usd: number; cost_usd: number; margin_usd: number }>
      const publicationRows = (publicationsRes.data ?? []) as Array<{ project_id: string | null; published_at: string }>
      const latestPnlByProject = new Map<string, { revenue_usd: number; cost_usd: number; margin_usd: number }>()
      for (const row of pnlRows) {
        if (!latestPnlByProject.has(row.project_id)) latestPnlByProject.set(row.project_id, row)
      }

      let revenueUsd = 0
      let costUsd = 0
      let marginUsd = 0
      for (const [projectId, row] of latestPnlByProject.entries()) {
        if (!selectedProjectId || selectedProjectId === projectId) {
          revenueUsd += Number(row.revenue_usd || 0)
          costUsd += Number(row.cost_usd || 0)
          marginUsd += Number(row.margin_usd || 0)
        }
      }

      const today = new Date().toISOString().slice(0, 10)
      const publishedToday = publicationRows.filter((row) => row.published_at?.slice(0, 10) === today && (!selectedProjectId || row.project_id === selectedProjectId)).length
      setSummary({ revenueUsd, costUsd, marginUsd, publishedToday })
      setMetricsLoaded(true)
    }

    void loadMetrics()
    return () => {
      cancelled = true
    }
  }, [metricsLoaded, openPanel, selectedProjectId])

  useEffect(() => {
    if (openPanel !== 'activity' || activityLoaded) return
    let cancelled = false

    async function loadActivity() {
      const { data, error: activityError } = await supabase.from('task_events').select('id,task_id,event_type,actor_agent_id,created_at,payload').order('created_at', { ascending: false }).limit(40)
      if (cancelled) return
      if (activityError) {
        setError(activityError.message)
        return
      }
      setEvents((data ?? []) as EventRow[])
      setActivityLoaded(true)
    }

    void loadActivity()
    return () => {
      cancelled = true
    }
  }, [activityLoaded, openPanel])

  useEffect(() => {
    if (openPanel !== 'review' || reviewLoaded) return
    let cancelled = false

    async function loadReview() {
      const [artifactsRes, approvalsRes] = await Promise.all([
        supabase.from('artifacts').select('id,task_id,artifact_type,content,filename,storage_path,created_at').in('artifact_type', ['draft', 'draft_file', 'delivery_note', 'package']).order('created_at', { ascending: false }).limit(80),
        supabase.from('approvals').select('id,task_id,status,comment,created_at').order('created_at', { ascending: false }).limit(80),
      ])

      if (cancelled) return
      const firstError = artifactsRes.error || approvalsRes.error
      if (firstError) {
        setError(firstError.message)
        return
      }

      setArtifacts((artifactsRes.data ?? []) as ArtifactRow[])
      setApprovals((approvalsRes.data ?? []) as ApprovalRow[])
      setReviewLoaded(true)
    }

    void loadReview()
    return () => {
      cancelled = true
    }
  }, [openPanel, reviewLoaded])

  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project.title])), [projects])
  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks])

  const filteredActivity = useMemo(() => {
    const items: Array<{ id: string; eventType: string; actor: string; taskTitle: string; projectTitle?: string; detail?: string }> = []

    for (const event of events) {
      const task = taskMap.get(event.task_id)
      if (!task) continue
      if (selectedProjectId && task.project_id !== selectedProjectId) continue

      let detail: string | undefined
      const payload = event.payload || {}
      if (typeof payload.comment === 'string') detail = payload.comment
      else if (typeof payload.reason === 'string') detail = payload.reason
      else if (typeof payload.decision === 'string') detail = payload.decision

      items.push({
        id: event.id,
        eventType: event.event_type,
        actor: event.actor_agent_id || 'system',
        taskTitle: task.title,
        projectTitle: task.project_id ? projectMap.get(task.project_id) : undefined,
        detail,
      })
    }

    return items.slice(0, 12)
  }, [events, projectMap, selectedProjectId, taskMap])

  const reviewItems = useMemo(() => {
    const latestApprovalByTask = new Map<string, ApprovalRow>()
    const items: ReviewItem[] = []

    for (const approval of approvals) {
      if (!latestApprovalByTask.has(approval.task_id)) latestApprovalByTask.set(approval.task_id, approval)
    }

    for (const artifact of artifacts) {
      const task = taskMap.get(artifact.task_id)
      if (!task) continue
      if (selectedProjectId && task.project_id !== selectedProjectId) continue
      const approval = latestApprovalByTask.get(artifact.task_id)
      const approvalStatus = approval?.status ?? 'none'
      if (approvalStatus !== 'pending' && approvalStatus !== 'none') continue

      items.push({
        artifactId: artifact.id,
        taskId: artifact.task_id,
        taskTitle: task.title,
        projectTitle: task.project_id ? projectMap.get(task.project_id) : undefined,
        artifactType: artifact.artifact_type,
        content: artifact.content,
        filename: artifact.filename,
        storagePath: artifact.storage_path,
        approvalStatus,
      })
    }

    return items.slice(0, 12)
  }, [approvals, artifacts, projectMap, selectedProjectId, taskMap])

  const selectedReviewItem = selectedArtifactId ? reviewItems.find((item) => item.artifactId === selectedArtifactId) : reviewItems[0]

  const chamberCards = useMemo(() => {
    return agents
      .filter((agent) => ['gateway', 'manager', 'reviewer', 'researcher', 'content', 'worker-1', 'worker-2'].includes(agent.id))
      .map((agent) => {
        const activeTasks = tasks.filter((task) => task.assigned_agent_id === agent.id && (!selectedProjectId || task.project_id === selectedProjectId) && task.status !== 'done' && task.status !== 'published' && task.status !== 'cancelled')
        return {
          ...agent,
          activeTasks,
        }
      })
  }, [agents, selectedProjectId, tasks])

  const selectedTaskDetail = useMemo(() => {
    if (!selectedTaskId) return undefined
    const task = taskMap.get(selectedTaskId)
    if (!task) return undefined
    return {
      task,
      projectTitle: task.project_id ? projectMap.get(task.project_id) : undefined,
      approvals: approvals.filter((item) => item.task_id === selectedTaskId),
      artifacts: artifacts.filter((item) => item.task_id === selectedTaskId),
      events: events.filter((item) => item.task_id === selectedTaskId),
    } satisfies TaskDetail
  }, [approvals, artifacts, events, projectMap, selectedTaskId, taskMap])

  const focusProject = selectedProjectId ? projects.find((project) => project.id === selectedProjectId) : undefined
  const activeChambers = chamberCards.filter((agent) => agent.activeTasks.length > 0).length
  const headlineStatus = error ? 'Needs attention' : loading ? 'Refreshing' : 'Stable orbit'

  function togglePanel(panel: PanelKey) {
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  async function reloadLazyPanel(panel: PanelKey) {
    if (panel === 'metrics') setMetricsLoaded(false)
    if (panel === 'activity') setActivityLoaded(false)
    if (panel === 'review') setReviewLoaded(false)
    setOpenPanel(panel)
  }

  async function reloadTaskContext() {
    const [tasksRes, eventsRes, artifactsRes, approvalsRes] = await Promise.all([
      supabase.from('tasks').select('id,title,project_id,assigned_agent_id,status').order('updated_at', { ascending: false }).limit(80),
      activityLoaded ? supabase.from('task_events').select('id,task_id,event_type,actor_agent_id,created_at,payload').order('created_at', { ascending: false }).limit(40) : Promise.resolve({ data: events, error: null }),
      reviewLoaded ? supabase.from('artifacts').select('id,task_id,artifact_type,content,filename,storage_path,created_at').in('artifact_type', ['draft', 'draft_file', 'delivery_note', 'package']).order('created_at', { ascending: false }).limit(80) : Promise.resolve({ data: artifacts, error: null }),
      reviewLoaded ? supabase.from('approvals').select('id,task_id,status,comment,created_at').order('created_at', { ascending: false }).limit(80) : Promise.resolve({ data: approvals, error: null }),
    ])

    if (tasksRes.error || eventsRes.error || artifactsRes.error || approvalsRes.error) {
      setError(tasksRes.error?.message || eventsRes.error?.message || artifactsRes.error?.message || approvalsRes.error?.message || 'Reload failed')
      return
    }

    setTasks((tasksRes.data ?? []) as TaskRow[])
    if (activityLoaded) setEvents((eventsRes.data ?? []) as EventRow[])
    if (reviewLoaded) {
      setArtifacts((artifactsRes.data ?? []) as ArtifactRow[])
      setApprovals((approvalsRes.data ?? []) as ApprovalRow[])
    }
  }

  async function decideItem(taskId: string, artifactId: string, status: 'approved' | 'rejected', comment?: string) {
    const pending = approvals.find((item) => item.task_id === taskId && item.status === 'pending')
    if (pending) {
      const { error } = await supabase.from('approvals').update({ status, comment: comment || null, decided_by: 'dashboard', decided_at: new Date().toISOString() }).eq('id', pending.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('approvals').insert({ task_id: taskId, artifact_id: artifactId, required_role: 'owner', status, comment: comment || null, decided_by: 'dashboard', decided_at: new Date().toISOString() })
      if (error) throw error
    }
  }

  async function patchTask(taskId: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from('tasks').update(patch).eq('id', taskId)
    if (error) throw error
  }

  return (
    <div className="app-shell safe-mode-shell command-deck-shell">
      <main className="safe-mode-main command-deck-main map-first-main">
        <section className="command-hero-card map-first-hero">
          <div className="command-hero-copy">
            <p className="eyebrow">AI Sensei Command Deck</p>
            <h1>{focusProject ? focusProject.title : 'Fleet overview'}</h1>
            <p className="subcopy">The map leads now. Stats, activity, and review stay collapsed until you actually open them, so the dashboard feels lighter instead of dumping everything at once.</p>

            <label className="project-switcher">
              <span>Business focus</span>
              <select value={selectedProjectId ?? ''} onChange={(event) => setSelectedProjectId(event.target.value || null)}>
                <option value="">All businesses</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="hero-status-cluster">
            <div className="hero-status-pill">
              <span className="status-dot" />
              <strong>{headlineStatus}</strong>
            </div>
            <div className="hero-mini-stats">
              <div className="hero-mini-card">
                <span>Agents carrying work</span>
                <strong>{activeChambers}</strong>
              </div>
              <div className="hero-mini-card">
                <span>Open panel</span>
                <strong>{openPanel || 'none'}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="safe-mode-card chamber-section-card chamber-command-card map-stage-card ship-stage-card">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Agent chambers</p>
              <h2>Living ship</h2>
            </div>
            <p className="section-note">Tap a chamber task for drill-down, or open a drawer only when you need details.</p>
          </div>

          <div className="ship-stage-shell">
            <div className="ship-stage-stars" />
            <div className="ship-stage-hull" />
            <div className="ship-stage-bridge" />

            <div className="ship-stage-grid">
              {DECK_LAYOUT.flat().map((id, index) => {
                if (!id) return <div key={`empty-${index}`} className="ship-stage-empty" />
                const chamber = chamberCards.find((agent) => agent.id === id)
                if (!chamber) return <div key={id} className="chamber-card chamber-placeholder">Offline</div>
                const identity = agentIdentities[chamber.id] ?? agentIdentities.gateway
                return (
                  <div key={chamber.id} className={`chamber-card command-chamber-card ship-chamber-card theme-${identity.roomTheme} ${chamber.activeTasks.length > 0 ? 'has-work' : ''} ${chamber.id === 'manager' ? 'manager-hub-card' : ''}`} style={{ ['--agent-primary' as string]: identity.palette.primary, ['--agent-secondary' as string]: identity.palette.secondary, ['--agent-glow' as string]: identity.palette.glow }}>
                    <div className="chamber-card-topline">
                      <div className="chamber-glyph">{identity.name.slice(0, 1)}</div>
                      <span className="chamber-task-count">{chamber.activeTasks.length} active</span>
                    </div>
                    <strong>{identity.name}</strong>
                    <span>{identity.subtitle}</span>
                    <div className="chamber-task-stack">
                      {chamber.activeTasks.length === 0 ? (
                        <p className="empty">Quiet chamber</p>
                      ) : (
                        chamber.activeTasks.slice(0, 2).map((task) => (
                          <button key={task.id} className="mini-task-button" onClick={async () => {
                            setSelectedTaskId(task.id)
                          }}>{task.title}</button>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="drawer-toggle-row">
          <button className={`drawer-tab ${openPanel === 'metrics' ? 'active' : ''}`} onClick={() => togglePanel('metrics')}>Business pulse</button>
          <button className={`drawer-tab ${openPanel === 'activity' ? 'active' : ''}`} onClick={() => togglePanel('activity')}>Live activity</button>
          <button className={`drawer-tab ${openPanel === 'review' ? 'active' : ''}`} onClick={() => togglePanel('review')}>Review dock</button>
        </section>

        {openPanel === 'metrics' && (
          <section className="safe-mode-card lazy-panel-card">
            <div className="section-heading-row compact">
              <div>
                <p className="eyebrow">Business pulse</p>
                <h2>At a glance</h2>
              </div>
              <button className="panel-refresh-button" onClick={() => void reloadLazyPanel('metrics')}>Refresh</button>
            </div>
            {!metricsLoaded ? (
              <p className="empty">Loading metrics...</p>
            ) : (
              <div className="friendly-metrics-grid">
                <div className="friendly-metric-card revenue">
                  <span>Revenue</span>
                  <strong>${summary.revenueUsd.toFixed(2)}</strong>
                </div>
                <div className="friendly-metric-card cost">
                  <span>Cost</span>
                  <strong>${summary.costUsd.toFixed(2)}</strong>
                </div>
                <div className="friendly-metric-card margin">
                  <span>Margin</span>
                  <strong>${summary.marginUsd.toFixed(2)}</strong>
                </div>
                <div className="friendly-metric-card queue">
                  <span>Queue pressure</span>
                  <strong>{queueHealth?.runnable_count ?? 0}/{queueHealth?.in_progress_count ?? 0}</strong>
                  <small>runnable / active</small>
                </div>
              </div>
            )}
          </section>
        )}

        {openPanel === 'activity' && (
          <section className="safe-mode-card lazy-panel-card">
            <div className="section-heading-row compact">
              <div>
                <p className="eyebrow">Recent motion</p>
                <h2>Live activity</h2>
              </div>
              <button className="panel-refresh-button" onClick={() => void reloadLazyPanel('activity')}>Refresh</button>
            </div>
            {!activityLoaded ? (
              <p className="empty">Loading activity...</p>
            ) : filteredActivity.length === 0 ? (
              <p className="empty">No recent activity yet.</p>
            ) : (
              <div className="safe-list-blocks activity-feed-friendly">
                {filteredActivity.map((item) => (
                  <div key={item.id} className="safe-item activity-friendly-item">
                    <div className="activity-friendly-topline">
                      <strong>{item.eventType}</strong>
                      <span>{item.actor}</span>
                    </div>
                    <span>{item.taskTitle}</span>
                    <small>{item.projectTitle || 'Unknown project'}</small>
                    {item.detail && <small>{item.detail}</small>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {openPanel === 'review' && (
          <section className="safe-mode-card lazy-panel-card">
            <div className="section-heading-row compact">
              <div>
                <p className="eyebrow">Human gate</p>
                <h2>Review dock</h2>
              </div>
              <button className="panel-refresh-button" onClick={() => void reloadLazyPanel('review')}>Refresh</button>
            </div>
            {!reviewLoaded ? (
              <p className="empty">Loading review items...</p>
            ) : reviewItems.length === 0 ? (
              <p className="empty">No pending review items right now.</p>
            ) : (
              <div className="review-safe-grid">
                <div className="safe-list-blocks">
                  {reviewItems.map((item) => (
                    <button key={item.artifactId} className={`artifact-list-item ${selectedReviewItem?.artifactId === item.artifactId ? 'active' : ''}`} onClick={() => setSelectedArtifactId(item.artifactId)}>
                      <div className="artifact-list-topline">
                        <span className="badge">{item.artifactType}</span>
                        <span className={`approval-pill approval-${item.approvalStatus}`}>{item.approvalStatus}</span>
                      </div>
                      <strong>{item.taskTitle}</strong>
                      <span>{item.projectTitle || 'Unknown project'}</span>
                    </button>
                  ))}
                </div>

                <div className="artifact-preview-card">
                  {selectedReviewItem ? (
                    <div className="artifact-preview-inner">
                      <div className="artifact-preview-topline">
                        <div>
                          <p className="eyebrow">{selectedReviewItem.projectTitle || 'Review item'}</p>
                          <h3>{selectedReviewItem.taskTitle}</h3>
                        </div>
                        <span className={`approval-pill approval-${selectedReviewItem.approvalStatus}`}>{selectedReviewItem.approvalStatus}</span>
                      </div>

                      <div className="artifact-actions">
                        <button className="action-button primary" disabled={approvalBusy} onClick={async () => {
                          try {
                            setApprovalBusy(true)
                            await decideItem(selectedReviewItem.taskId, selectedReviewItem.artifactId, 'approved')
                            await reloadTaskContext()
                          } finally {
                            setApprovalBusy(false)
                          }
                        }}>{approvalBusy ? 'Saving...' : 'Approve to ship'}</button>
                        <button className="action-button danger" disabled={approvalBusy} onClick={async () => {
                          const reason = window.prompt('Why are you declining this artifact?', 'Needs revision')
                          if (reason === null) return
                          try {
                            setApprovalBusy(true)
                            await decideItem(selectedReviewItem.taskId, selectedReviewItem.artifactId, 'rejected', reason)
                            await reloadTaskContext()
                          } finally {
                            setApprovalBusy(false)
                          }
                        }}>{approvalBusy ? 'Saving...' : 'Decline'}</button>
                      </div>

                      <div className="artifact-preview-body">
                        <pre>{selectedReviewItem.content || selectedReviewItem.storagePath || 'No inline artifact content stored yet.'}</pre>
                      </div>
                    </div>
                  ) : (
                    <p className="empty">Select an item to review.</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {selectedTaskDetail && (
          <div className="agent-modal-backdrop" onClick={() => setSelectedTaskId(null)}>
            <div className="agent-modal task-detail-modal" onClick={(event) => event.stopPropagation()}>
              <button className="agent-modal-close" onClick={() => setSelectedTaskId(null)}>Close</button>
              <div className="agent-modal-header">
                <div>
                  <p className="eyebrow">Task drill-down</p>
                  <h2>{selectedTaskDetail.task.title}</h2>
                  <p className="subcopy">{selectedTaskDetail.projectTitle || 'Unknown project'} • {selectedTaskDetail.task.status || 'unknown'}</p>
                </div>
              </div>

              <div className="agent-modal-grid">
                <div className="metric-card"><span>Approvals</span><strong>{selectedTaskDetail.approvals.length}</strong></div>
                <div className="metric-card"><span>Artifacts</span><strong>{selectedTaskDetail.artifacts.length}</strong></div>
                <div className="metric-card"><span>Events</span><strong>{selectedTaskDetail.events.length}</strong></div>
              </div>

              <div className="artifact-actions task-detail-actions">
                <button className="action-button secondary" disabled={taskBusy} onClick={async () => {
                  try {
                    setTaskBusy(true)
                    await patchTask(selectedTaskDetail.task.id, { status: 'assigned' })
                    await reloadTaskContext()
                  } finally {
                    setTaskBusy(false)
                  }
                }}>{taskBusy ? 'Saving...' : 'Reset to assigned'}</button>
                <button className="action-button danger" disabled={taskBusy} onClick={async () => {
                  const reason = window.prompt('Cancel this task? Add an optional reason.', 'cancelled from dashboard')
                  if (reason === null) return
                  try {
                    setTaskBusy(true)
                    await patchTask(selectedTaskDetail.task.id, { status: 'cancelled' })
                    await reloadTaskContext()
                  } finally {
                    setTaskBusy(false)
                  }
                }}>{taskBusy ? 'Saving...' : 'Cancel task'}</button>
              </div>

              <div className="task-detail-sections">
                <section className="summary-panel">
                  <h3>Artifacts</h3>
                  {selectedTaskDetail.artifacts.length === 0 ? <p className="empty">No artifacts loaded yet.</p> : (
                    <div className="summary-list">
                      {selectedTaskDetail.artifacts.map((item) => (
                        <div key={item.id} className="summary-item">
                          <strong>{item.filename || item.artifact_type}</strong>
                          <span>{item.created_at}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="summary-panel">
                  <h3>Approvals</h3>
                  {selectedTaskDetail.approvals.length === 0 ? <p className="empty">No approvals loaded yet.</p> : (
                    <div className="summary-list">
                      {selectedTaskDetail.approvals.map((item) => (
                        <div key={item.id} className="summary-item">
                          <strong>{item.status}</strong>
                          <span>{item.comment || item.created_at}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="summary-panel">
                  <h3>Event trail</h3>
                  {selectedTaskDetail.events.length === 0 ? <p className="empty">No events loaded yet.</p> : (
                    <div className="summary-list">
                      {selectedTaskDetail.events.slice(0, 12).map((item) => (
                        <div key={item.id} className="summary-item">
                          <strong>{item.event_type}</strong>
                          <span>{item.actor_agent_id || 'system'} • {item.created_at}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
