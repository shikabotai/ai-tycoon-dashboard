import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ActivityFeedItem, AgentChamber, AgentRow, AgentRunRow, ApprovalRow, ArtifactReviewItem, ArtifactRow, DashboardSummary, DeliveryRow, PipelineRow, ProjectDestinationRow, ProjectPnlRow, ProjectRow, ProjectSummary, PublicationRow, QueueHealth, TaskDetail, TaskEventRow, TaskRow, WatchdogRow } from '../types'

const CHAMBER_LABELS: Record<string, string> = {
  gateway: 'Dock A1',
  manager: 'Bridge B1',
  researcher: 'Lab C1',
  content: 'Writer Studio C2',
  'worker-1': 'Worker Bay D1',
  'worker-2': 'Worker Bay D2',
  reviewer: 'Control E1',
}

export function useDashboardData(_selectedProjectId?: string | null) {
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null)
  const [pipeline, setPipeline] = useState<PipelineRow[]>([])
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [approvals, setApprovals] = useState<ApprovalRow[]>([])
  const [watchdog, setWatchdog] = useState<WatchdogRow[]>([])
  const [pnl, setPnl] = useState<ProjectPnlRow[]>([])
  const [publications, setPublications] = useState<PublicationRow[]>([])
  const [destinations, setDestinations] = useState<ProjectDestinationRow[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])
  const [events, setEvents] = useState<TaskEventRow[]>([])
  const [agentRuns, setAgentRuns] = useState<AgentRunRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [queueHealthRes, pipelineRes, agentsRes, tasksRes, projectsRes, agentRunsRes, artifactsRes, approvalsRes, watchdogRes, pnlRes, publicationsRes, destinationsRes, deliveriesRes, eventsRes] = await Promise.all([
      supabase.from('v_queue_health').select('*').limit(1).maybeSingle(),
      supabase.from('v_pipeline_now').select('*').order('project').order('status'),
      supabase.from('agents').select('id,role,display_name,status,capabilities').order('id'),
      supabase.from('tasks').select('id,title,status,assigned_agent_id,current_step_index,project_id,updated_at,metadata').order('updated_at', { ascending: false }).limit(120),
      supabase.from('projects').select('id,title').order('title'),
      supabase.from('agent_runs').select('id,task_id,agent_id,agent_role,status,cost_usd,error_message,started_at,completed_at').order('started_at', { ascending: false }).limit(120),
      supabase.from('artifacts').select('id,task_id,artifact_type,content,mime_type,filename,storage_path,created_at').in('artifact_type', ['draft', 'draft_file', 'delivery_note', 'package']).order('created_at', { ascending: false }).limit(120),
      supabase.from('approvals').select('id,task_id,status,decided_at,created_at,comment').order('created_at', { ascending: false }).limit(120),
      supabase.from('v_task_watchdog').select('*').order('severity', { ascending: false }).order('updated_at', { ascending: true }).limit(12),
      supabase.from('v_project_pnl').select('project_id,title,business_type,month,revenue_usd,cost_usd,margin_usd').order('month', { ascending: false }).limit(80),
      supabase.from('publications').select('id,project_id,task_id,destination,external_url,published_at').order('published_at', { ascending: false }).limit(120),
      supabase.from('project_destinations').select('id,project_id,destination,is_active,config').limit(80),
      supabase.from('deliveries').select('id,task_id,destination,status,destination_ref,error,delivered_at').order('delivered_at', { ascending: false }).limit(120),
      supabase.from('task_events').select('id,task_id,event_type,actor_agent_id,payload,created_at').order('created_at', { ascending: false }).limit(80),
    ])

    const firstError = queueHealthRes.error || pipelineRes.error || agentsRes.error || tasksRes.error || projectsRes.error || agentRunsRes.error || artifactsRes.error || approvalsRes.error || watchdogRes.error || pnlRes.error || publicationsRes.error || destinationsRes.error || deliveriesRes.error || eventsRes.error

    if (firstError) {
      setError(firstError.message)
    } else {
      setQueueHealth((queueHealthRes.data as QueueHealth | null) ?? null)
      setPipeline((pipelineRes.data as PipelineRow[] | null) ?? [])
      setAgents((agentsRes.data as AgentRow[] | null) ?? [])
      setTasks((tasksRes.data as TaskRow[] | null) ?? [])
      setProjects((projectsRes.data as ProjectRow[] | null) ?? [])
      setAgentRuns((agentRunsRes.data as AgentRunRow[] | null) ?? [])
      setArtifacts((artifactsRes.data as ArtifactRow[] | null) ?? [])
      setApprovals((approvalsRes.data as ApprovalRow[] | null) ?? [])
      setWatchdog((watchdogRes.data as WatchdogRow[] | null) ?? [])
      setPnl((pnlRes.data as ProjectPnlRow[] | null) ?? [])
      setPublications((publicationsRes.data as PublicationRow[] | null) ?? [])
      setDestinations((destinationsRes.data as ProjectDestinationRow[] | null) ?? [])
      setDeliveries((deliveriesRes.data as DeliveryRow[] | null) ?? [])
      setEvents((eventsRes.data as TaskEventRow[] | null) ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    void load()
    const id = window.setInterval(() => {
      if (!cancelled) void load()
    }, 15000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [load])

  const filteredTaskIds = useMemo(() => new Set(tasks.map((task) => task.id)), [tasks])

  const filteredAgentRuns = useMemo(
    () => agentRuns.filter((run) => filteredTaskIds.has(run.task_id)),
    [agentRuns, filteredTaskIds],
  )

  const agentChambers = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project.title]))

    return agents
      .filter((agent) => ['gateway', 'manager', 'researcher', 'content', 'worker-1', 'worker-2', 'reviewer', 'designer', 'packager'].includes(agent.id))
      .map((agent) => {
        const agentTasks = tasks.filter((task) => task.assigned_agent_id === agent.id && !['done', 'published', 'cancelled'].includes(task.status) && !(task.metadata && (task.metadata as Record<string, unknown>).quarantined))
        const decoratedTasks = agentTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          projectTitle: task.project_id ? projectMap.get(task.project_id) : undefined,
        }))

        const runs = filteredAgentRuns.filter((run) => run.agent_id === agent.id)
        const totalCostUsd = runs.reduce((sum, run) => sum + Number(run.cost_usd || 0), 0)
        const lastRun = runs[0]

        return {
          id: agent.id,
          displayName: agent.display_name,
          role: agent.role,
          chamberLabel: CHAMBER_LABELS[agent.id] || agent.id,
          status: agent.status,
          taskCount: decoratedTasks.length,
          tasks: decoratedTasks,
          runCount: runs.length,
          totalCostUsd,
          lastRunAt: lastRun?.started_at,
          lastError: runs.find((run) => run.error_message)?.error_message ?? null,
          lastArtifactTitle: undefined,
        } satisfies AgentChamber
      })
  }, [agents, filteredAgentRuns, projects, tasks])

  const artifactReviewItems = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project.title]))
    const taskMap = new Map(tasks.map((task) => [task.id, task]))
    const latestApprovalByTask = new Map<string, ApprovalRow>()

    for (const approval of approvals) {
      if (!latestApprovalByTask.has(approval.task_id)) {
        latestApprovalByTask.set(approval.task_id, approval)
      }
    }

    return artifacts
      .filter((artifact) => filteredTaskIds.has(artifact.task_id))
      .map((artifact) => {
        const task = taskMap.get(artifact.task_id)
        const approval = latestApprovalByTask.get(artifact.task_id)
        return {
          artifactId: artifact.id,
          taskId: artifact.task_id,
          taskTitle: task?.title ?? 'Unknown task',
          projectTitle: task?.project_id ? projectMap.get(task.project_id) : undefined,
          assignedAgentId: task?.assigned_agent_id,
          artifactType: artifact.artifact_type,
          filename: artifact.filename,
          mimeType: artifact.mime_type,
          content: artifact.content,
          storagePath: artifact.storage_path,
          createdAt: artifact.created_at,
          approvalStatus: ((approval?.status as 'pending' | 'approved' | 'rejected' | undefined) ?? 'none'),
        } satisfies ArtifactReviewItem
      })
      .filter((item) => item.taskTitle !== 'Unknown task')
  }, [approvals, artifacts, filteredTaskIds, projects, tasks])
  const activityFeed = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project.title]))
    const taskMap = new Map(tasks.map((task) => [task.id, task]))

    return events
      .filter((event) => filteredTaskIds.has(event.task_id))
      .map((event) => {
        const task = taskMap.get(event.task_id)
        const payload = event.payload || {}
        const detail =
          typeof payload.reason === 'string' ? payload.reason :
          typeof payload.comment === 'string' ? payload.comment :
          typeof payload.decision === 'string' ? payload.decision :
          undefined

        return {
          id: event.id,
          taskId: event.task_id,
          taskTitle: task?.title ?? 'Unknown task',
          projectTitle: task?.project_id ? projectMap.get(task.project_id) : undefined,
          eventType: event.event_type,
          actorAgentId: event.actor_agent_id,
          createdAt: event.created_at,
          detail,
        } satisfies ActivityFeedItem
      })
      .filter((item) => item.taskTitle !== 'Unknown task')
  }, [events, filteredTaskIds, projects, tasks])

  const projectSummary = useMemo(() => {
    const activeDestinations = destinations.filter((item) => item.is_active)
    const recentPublications = publications.slice(0, 8)
    const deliveryFailures = deliveries.filter((item) => item.status !== 'sent' && filteredTaskIds.has(item.task_id)).slice(0, 8)

    return {
      activeDestinations,
      recentPublications,
      deliveryFailures,
    } satisfies ProjectSummary
  }, [deliveries, destinations, filteredTaskIds, publications])

  const summary = useMemo(() => {
    const latestPnlByProject = new Map<string, ProjectPnlRow>()
    for (const row of pnl) {
      if (!latestPnlByProject.has(row.project_id)) {
        latestPnlByProject.set(row.project_id, row)
      }
    }

    const today = new Date().toISOString().slice(0, 10)
    const publishedToday = publications.filter((item) => item.published_at?.slice(0, 10) === today).length

    let revenueUsd = 0
    let costUsd = 0
    let marginUsd = 0

    for (const row of latestPnlByProject.values()) {
      revenueUsd += Number(row.revenue_usd || 0)
      costUsd += Number(row.cost_usd || 0)
      marginUsd += Number(row.margin_usd || 0)
    }

    return {
      revenueUsd,
      costUsd,
      marginUsd,
      publishedToday,
      approvalsPending: artifactReviewItems.filter((item) => item.approvalStatus === 'pending' || item.approvalStatus === 'none').length,
    } satisfies DashboardSummary
  }, [artifactReviewItems, pnl, publications])

  const getTaskDetail = useCallback((taskId: string): TaskDetail | undefined => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return undefined
    const projectTitle = task.project_id ? projects.find((project) => project.id === task.project_id)?.title : undefined

    return {
      task,
      projectTitle,
      approvals: approvals.filter((item) => item.task_id === taskId),
      artifacts: artifacts.filter((item) => item.task_id === taskId),
      events: events.filter((item) => item.task_id === taskId),
      deliveries: deliveries.filter((item) => item.task_id === taskId),
      publications: publications.filter((item) => item.task_id === taskId),
    }
  }, [approvals, artifacts, deliveries, events, projects, publications, tasks])

  const patchTask = useCallback(async (taskId?: string, patch?: Record<string, unknown>) => {
    if (!taskId || !patch) return undefined

    const { error: patchError } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', taskId)

    if (patchError) throw patchError
    await load()
    return undefined
  }, [load])

  const decideTaskApproval = useCallback(async (taskId?: string, status?: 'approved' | 'rejected', comment?: string) => {
    if (!taskId || !status) return undefined

    const approval = approvals.find((item) => item.task_id === taskId && item.status === 'pending')
    if (!approval) {
      throw new Error('No pending approval is available for this task.')
    }

    const { error: approvalError } = await supabase
      .from('approvals')
      .update({
        status,
        decided_by: 'dashboard',
        decided_at: new Date().toISOString(),
        comment: comment ?? null,
      })
      .eq('id', approval.id)

    if (approvalError) throw approvalError

    if (status === 'rejected') {
      const task = tasks.find((item) => item.id === taskId)
      const metadata = { ...(task?.metadata ?? {}) }
      metadata.revision_notes = comment || 'Rejected from Business Command.'
      metadata.last_human_rejection_at = new Date().toISOString()
      metadata.revision_retry_count = Number(metadata.revision_retry_count ?? 0)

      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          status: 'assigned',
          current_step_index: Math.max(Number(task?.current_step_index ?? 1) - 1, 0),
          rejection_reason: comment || 'Rejected from Business Command.',
          metadata,
          last_error: null,
        })
        .eq('id', taskId)

      if (taskError) throw taskError
    }

    await load()
    return undefined
  }, [approvals, load, tasks])

  const decideApproval = useCallback(async (item?: unknown, status?: 'approved' | 'rejected', comment?: string) => {
    const taskId = typeof item === 'object' && item && 'taskId' in item ? String((item as { taskId?: unknown }).taskId) : undefined
    return decideTaskApproval(taskId, status, comment)
  }, [decideTaskApproval])

  return {
    queueHealth,
    pipeline,
    watchdog,
    loading,
    error,
    agentChambers,
    artifactReviewItems,
    decideApproval,
    summary,
    activityFeed,
    projects,
    projectSummary,
    getTaskDetail,
    patchTask,
    decideTaskApproval,
  }
}
