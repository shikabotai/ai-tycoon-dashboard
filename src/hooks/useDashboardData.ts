import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ActivityFeedItem, AgentChamber, AgentRow, AgentRunRow, ApprovalRow, ArtifactReviewItem, ArtifactRow, DashboardSummary, PipelineRow, ProjectPnlRow, ProjectRow, PublicationRow, QueueHealth, TaskEventRow, TaskRow, WatchdogRow } from '../types'

const CHAMBER_LABELS: Record<string, string> = {
  gateway: 'Dock A1',
  manager: 'Bridge B1',
  researcher: 'Lab C1',
  content: 'Studio C2',
  'worker-1': 'Bay D1',
  'worker-2': 'Bay D2',
  reviewer: 'Control E1',
}

export function useDashboardData(selectedProjectId?: string | null) {
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null)
  const [pipeline, setPipeline] = useState<PipelineRow[]>([])
  const [watchdog, setWatchdog] = useState<WatchdogRow[]>([])
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [approvals, setApprovals] = useState<ApprovalRow[]>([])
  const [pnl, setPnl] = useState<ProjectPnlRow[]>([])
  const [publications, setPublications] = useState<PublicationRow[]>([])
  const [events, setEvents] = useState<TaskEventRow[]>([])
  const [agentRuns, setAgentRuns] = useState<AgentRunRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [queueHealthRes, pipelineRes, watchdogRes, agentsRes, tasksRes, projectsRes, artifactsRes, approvalsRes, pnlRes, publicationsRes, eventsRes, agentRunsRes] = await Promise.all([
      supabase.from('v_queue_health').select('*').limit(1).maybeSingle(),
      supabase.from('v_pipeline_now').select('*').order('project').order('status'),
      supabase.from('v_task_watchdog').select('*').order('severity', { ascending: false }).order('updated_at', { ascending: true }).limit(12),
      supabase.from('agents').select('id,role,display_name,status,capabilities').order('id'),
      supabase.from('tasks').select('id,title,status,assigned_agent_id,current_step_index,project_id,updated_at').order('updated_at', { ascending: false }).limit(120),
      supabase.from('projects').select('id,title').order('title'),
      supabase.from('artifacts').select('id,task_id,artifact_type,content,mime_type,filename,storage_path,created_at').in('artifact_type', ['draft', 'draft_file', 'delivery_note', 'package']).order('created_at', { ascending: false }).limit(120),
      supabase.from('approvals').select('id,task_id,status,decided_at,created_at,comment').order('created_at', { ascending: false }).limit(120),
      supabase.from('v_project_pnl').select('project_id,title,business_type,month,revenue_usd,cost_usd,margin_usd').order('month', { ascending: false }).limit(80),
      supabase.from('publications').select('id,project_id,task_id,destination,published_at').order('published_at', { ascending: false }).limit(120),
      supabase.from('task_events').select('id,task_id,event_type,actor_agent_id,payload,created_at').order('created_at', { ascending: false }).limit(80),
      supabase.from('agent_runs').select('id,task_id,agent_id,agent_role,status,cost_usd,error_message,started_at,completed_at').order('started_at', { ascending: false }).limit(120),
    ])

    const firstError =
      queueHealthRes.error ||
      pipelineRes.error ||
      watchdogRes.error ||
      agentsRes.error ||
      tasksRes.error ||
      projectsRes.error ||
      artifactsRes.error ||
      approvalsRes.error ||
      pnlRes.error ||
      publicationsRes.error ||
      eventsRes.error ||
      agentRunsRes.error

    if (firstError) {
      setError(firstError.message)
    } else {
      setQueueHealth((queueHealthRes.data as QueueHealth | null) ?? null)
      setPipeline((pipelineRes.data as PipelineRow[] | null) ?? [])
      setWatchdog((watchdogRes.data as WatchdogRow[] | null) ?? [])
      setAgents((agentsRes.data as AgentRow[] | null) ?? [])
      setTasks((tasksRes.data as TaskRow[] | null) ?? [])
      setProjects((projectsRes.data as ProjectRow[] | null) ?? [])
      setArtifacts((artifactsRes.data as ArtifactRow[] | null) ?? [])
      setApprovals((approvalsRes.data as ApprovalRow[] | null) ?? [])
      setPnl((pnlRes.data as ProjectPnlRow[] | null) ?? [])
      setPublications((publicationsRes.data as PublicationRow[] | null) ?? [])
      setEvents((eventsRes.data as TaskEventRow[] | null) ?? [])
      setAgentRuns((agentRunsRes.data as AgentRunRow[] | null) ?? [])
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

  const filteredTasks = useMemo(
    () => (selectedProjectId ? tasks.filter((task) => task.project_id === selectedProjectId) : tasks),
    [selectedProjectId, tasks],
  )

  const filteredTaskIds = useMemo(() => new Set(filteredTasks.map((task) => task.id)), [filteredTasks])
  const filteredProjects = useMemo(
    () => (selectedProjectId ? projects.filter((project) => project.id === selectedProjectId) : projects),
    [projects, selectedProjectId],
  )

  const filteredAgentRuns = useMemo(
    () => agentRuns.filter((run) => filteredTaskIds.has(run.task_id)),
    [agentRuns, filteredTaskIds],
  )

  const agentChambers = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project.title]))
    const taskMap = new Map(tasks.map((task) => [task.id, task]))

    return agents
      .filter((agent) => ['gateway', 'manager', 'researcher', 'content', 'worker-1', 'worker-2', 'reviewer'].includes(agent.id))
      .map((agent) => {
        const agentTasks = filteredTasks.filter((task) => task.assigned_agent_id === agent.id && !['done', 'published', 'cancelled'].includes(task.status))
        const decoratedTasks = agentTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          projectTitle: task.project_id ? projectMap.get(task.project_id) : undefined,
        }))

        const runs = filteredAgentRuns.filter((run) => run.agent_id === agent.id)
        const totalCostUsd = runs.reduce((sum, run) => sum + Number(run.cost_usd || 0), 0)
        const lastRun = runs[0]
        const lastArtifactTask = [...filteredArtifacts].find((artifact) => {
          const task = taskMap.get(artifact.task_id)
          return task?.assigned_agent_id === agent.id
        })

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
          lastArtifactTitle: lastArtifactTask?.filename || lastArtifactTask?.artifact_type,
        } satisfies AgentChamber
      })
  }, [agents, filteredTasks, projects])

  const filteredApprovals = useMemo(
    () => approvals.filter((approval) => filteredTaskIds.has(approval.task_id)),
    [approvals, filteredTaskIds],
  )

  const filteredArtifacts = useMemo(
    () => artifacts.filter((artifact) => filteredTaskIds.has(artifact.task_id)),
    [artifacts, filteredTaskIds],
  )

  const artifactReviewItems = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project.title]))
    const taskMap = new Map(tasks.map((task) => [task.id, task]))
    const latestApprovalByTask = new Map<string, ApprovalRow>()

    for (const approval of filteredApprovals) {
      if (!latestApprovalByTask.has(approval.task_id)) {
        latestApprovalByTask.set(approval.task_id, approval)
      }
    }

    return filteredArtifacts
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
  }, [filteredArtifacts, filteredApprovals, projects, tasks])

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

  const filteredPipeline = useMemo(
    () => (selectedProjectId ? pipeline.filter((row) => row.project === filteredProjects[0]?.title) : pipeline),
    [filteredProjects, pipeline, selectedProjectId],
  )

  const filteredWatchdog = useMemo(() => {
    if (!selectedProjectId) return watchdog
    const selectedTitle = filteredProjects[0]?.title
    return watchdog.filter((item) => item.project === selectedTitle)
  }, [filteredProjects, selectedProjectId, watchdog])

  const filteredPnl = useMemo(
    () => (selectedProjectId ? pnl.filter((row) => row.project_id === selectedProjectId) : pnl),
    [pnl, selectedProjectId],
  )

  const filteredPublications = useMemo(
    () => (selectedProjectId ? publications.filter((item) => item.project_id === selectedProjectId) : publications),
    [publications, selectedProjectId],
  )

  const summary = useMemo(() => {
    const latestPnlByProject = new Map<string, ProjectPnlRow>()
    for (const row of filteredPnl) {
      if (!latestPnlByProject.has(row.project_id)) {
        latestPnlByProject.set(row.project_id, row)
      }
    }

    const today = new Date().toISOString().slice(0, 10)
    const publishedToday = filteredPublications.filter((item) => item.published_at?.slice(0, 10) === today).length

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
  }, [artifactReviewItems, filteredPnl, filteredPublications])

  const decideApproval = useCallback(async (item: ArtifactReviewItem, status: 'approved' | 'rejected', comment?: string) => {
    const existingApproval = approvals.find((approval) => approval.task_id === item.taskId && approval.status === 'pending')

    if (existingApproval) {
      const { error: updateError } = await supabase
        .from('approvals')
        .update({
          status,
          comment: comment || null,
          decided_by: 'dashboard',
          decided_at: new Date().toISOString(),
        })
        .eq('id', existingApproval.id)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from('approvals')
        .insert({
          task_id: item.taskId,
          artifact_id: item.artifactId,
          required_role: 'owner',
          status,
          decided_by: 'dashboard',
          decided_at: new Date().toISOString(),
          comment: comment || null,
        })

      if (insertError) throw insertError
    }

    await load()
  }, [approvals, load])

  return {
    queueHealth,
    pipeline: filteredPipeline,
    watchdog: filteredWatchdog,
    loading,
    error,
    agentChambers,
    artifactReviewItems,
    decideApproval,
    summary,
    activityFeed,
    projects,
  }
}
