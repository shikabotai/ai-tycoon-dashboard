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

const DECK_LAYOUT = [
  ['gateway', 'manager', 'reviewer'],
  ['researcher', 'content', null],
  ['worker-1', 'worker-2', null],
]

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null)
  const [summary, setSummary] = useState<Summary>({ revenueUsd: 0, costUsd: 0, marginUsd: 0, publishedToday: 0 })
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [approvals, setApprovals] = useState<ApprovalRow[]>([])
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [approvalBusy, setApprovalBusy] = useState(false)
  const [taskBusy, setTaskBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [queueRes, pnlRes, publicationsRes, projectsRes, tasksRes, eventsRes, artifactsRes, approvalsRes, agentsRes] = await Promise.all([
        supabase.from('v_queue_health').select('observed_at,runnable_count,in_progress_count,flagged_count').limit(1).maybeSingle(),
        supabase.from('v_project_pnl').select('project_id,revenue_usd,cost_usd,margin_usd').order('month', { ascending: false }).limit(50),
        supabase.from('publications').select('project_id,published_at').order('published_at', { ascending: false }).limit(100),
        supabase.from('projects').select('id,title').order('title'),
        supabase.from('tasks').select('id,title,project_id,assigned_agent_id,status').order('updated_at', { ascending: false }).limit(120),
        supabase.from('task_events').select('id,task_id,event_type,actor_agent_id,created_at,payload').order('created_at', { ascending: false }).limit(60),
        supabase.from('artifacts').select('id,task_id,artifact_type,content,filename,storage_path,created_at').in('artifact_type', ['draft', 'draft_file', 'delivery_note', 'package']).order('created_at', { ascending: false }).limit(120),
        supabase.from('approvals').select('id,task_id,status,comment,created_at').order('created_at', { ascending: false }).limit(120),
        supabase.from('agents').select('id,role,display_name,status').order('id'),
      ])

      if (cancelled) return

      const firstError = queueRes.error || pnlRes.error || publicationsRes.error || projectsRes.error || tasksRes.error || eventsRes.error || artifactsRes.error || approvalsRes.error || agentsRes.error
      if (firstError) {
        setError(firstError.message)
        setLoading(false)
        return
      }

      const queue = queueRes.data as QueueHealth | null
      const pnlRows = (pnlRes.data ?? []) as Array<{ project_id: string; revenue_usd: number; cost_usd: number; margin_usd: number }>
      const publicationRows = (publicationsRes.data ?? []) as Array<{ project_id: string | null; published_at: string }>
      const projectRows = (projectsRes.data ?? []) as ProjectRow[]
      const taskRows = (tasksRes.data ?? []) as TaskRow[]
      const eventRows = (eventsRes.data ?? []) as EventRow[]
      const artifactRows = (artifactsRes.data ?? []) as ArtifactRow[]
      const approvalRows = (approvalsRes.data ?? []) as ApprovalRow[]
      const agentRows = (agentsRes.data ?? []) as AgentRow[]

      setQueueHealth(queue)
      setProjects(projectRows)
      setTasks(taskRows)
      setEvents(eventRows)
      setArtifacts(artifactRows)
      setApprovals(approvalRows)
      setAgents(agentRows)

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
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [selectedProjectId])

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

  async function reloadPageData() {
    window.location.reload()
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
    <div className="app-shell safe-mode-shell">
      <main className="safe-mode-main">
        <div className="safe-mode-card">
          <p className="eyebrow">AI Sensei Dashboard</p>
          <h1>Stability Rebuild, Phase 5</h1>
          <p className="subcopy">Task drill-down is back in a simpler modal path. We’re restoring useful control without bringing back the old brittle UI layers.</p>

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

        <div className="safe-mode-grid">
          <section className="safe-mode-card">
            <h2>App Status</h2>
            <ul className="safe-list">
              <li>Loading: {loading ? 'yes' : 'no'}</li>
              <li>Error: {error || 'none'}</li>
              <li>Observed at: {queueHealth?.observed_at || 'none'}</li>
            </ul>
          </section>

          <section className="safe-mode-card">
            <h2>Queue Health</h2>
            <ul className="safe-list">
              <li>Runnable: {queueHealth?.runnable_count ?? 0}</li>
              <li>Active: {queueHealth?.in_progress_count ?? 0}</li>
              <li>Alerts: {queueHealth?.flagged_count ?? 0}</li>
            </ul>
          </section>

          <section className="safe-mode-card">
            <h2>Business Metrics</h2>
            <ul className="safe-list">
              <li>Revenue: ${summary.revenueUsd.toFixed(2)}</li>
              <li>Cost: ${summary.costUsd.toFixed(2)}</li>
              <li>Margin: ${summary.marginUsd.toFixed(2)}</li>
              <li>Published today: {summary.publishedToday}</li>
            </ul>
          </section>

          <section className="safe-mode-card">
            <h2>Live Activity</h2>
            {filteredActivity.length === 0 ? (
              <p className="empty">No recent activity yet.</p>
            ) : (
              <div className="safe-list-blocks">
                {filteredActivity.map((item) => (
                  <div key={item.id} className="safe-item">
                    <strong>{item.eventType}</strong>
                    <span>{item.taskTitle}</span>
                    <small>{item.projectTitle || 'Unknown project'} • {item.actor}</small>
                    {item.detail && <small>{item.detail}</small>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="safe-mode-card chamber-section-card">
          <h2>Agent Deck</h2>
          <div className="chamber-deck-grid">
            {DECK_LAYOUT.flat().map((id, index) => {
              if (!id) return <div key={`empty-${index}`} className="chamber-placeholder" />
              const chamber = chamberCards.find((agent) => agent.id === id)
              if (!chamber) return <div key={id} className="chamber-card chamber-placeholder">Offline</div>
              const identity = agentIdentities[chamber.id] ?? agentIdentities.gateway
              return (
                <div key={chamber.id} className={`chamber-card theme-${identity.roomTheme}`} style={{ ['--agent-primary' as string]: identity.palette.primary, ['--agent-secondary' as string]: identity.palette.secondary }}>
                  <div className="chamber-glyph">{identity.name.slice(0, 1)}</div>
                  <strong>{identity.name}</strong>
                  <span>{identity.subtitle}</span>
                  <small>{chamber.activeTasks.length} active task{chamber.activeTasks.length === 1 ? '' : 's'}</small>
                  {chamber.activeTasks.slice(0, 2).map((task) => (
                    <button key={task.id} className="mini-task-button" onClick={() => setSelectedTaskId(task.id)}>{task.title}</button>
                  ))}
                </div>
              )
            })}
          </div>
        </section>

        <div className="safe-mode-grid single-column-grid">
          <section className="safe-mode-card">
            <h2>Review Dock</h2>
            {reviewItems.length === 0 ? (
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
                            await reloadPageData()
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
                            await reloadPageData()
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
        </div>

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
                    await reloadPageData()
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
                    await reloadPageData()
                  } finally {
                    setTaskBusy(false)
                  }
                }}>{taskBusy ? 'Saving...' : 'Cancel task'}</button>
              </div>

              <div className="task-detail-sections">
                <section className="summary-panel">
                  <h3>Artifacts</h3>
                  {selectedTaskDetail.artifacts.length === 0 ? <p className="empty">No artifacts.</p> : (
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
                  {selectedTaskDetail.approvals.length === 0 ? <p className="empty">No approvals.</p> : (
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
                  {selectedTaskDetail.events.length === 0 ? <p className="empty">No events.</p> : (
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
