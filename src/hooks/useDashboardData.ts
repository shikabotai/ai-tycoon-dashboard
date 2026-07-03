import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AgentChamber, AgentRow, AgentRunRow, ArtifactReviewItem, DashboardSummary, ProjectRow, ProjectSummary, QueueHealth, TaskDetail, TaskRow } from '../types'

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
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [agentRuns, setAgentRuns] = useState<AgentRunRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [queueHealthRes, agentsRes, tasksRes, projectsRes, agentRunsRes] = await Promise.all([
      supabase.from('v_queue_health').select('*').limit(1).maybeSingle(),
      supabase.from('agents').select('id,role,display_name,status,capabilities').order('id'),
      supabase.from('tasks').select('id,title,status,assigned_agent_id,current_step_index,project_id,updated_at,metadata').order('updated_at', { ascending: false }).limit(120),
      supabase.from('projects').select('id,title').order('title'),
      supabase.from('agent_runs').select('id,task_id,agent_id,agent_role,status,cost_usd,error_message,started_at,completed_at').order('started_at', { ascending: false }).limit(120),
    ])

    const firstError = queueHealthRes.error || agentsRes.error || tasksRes.error || projectsRes.error || agentRunsRes.error

    if (firstError) {
      setError(firstError.message)
    } else {
      setQueueHealth((queueHealthRes.data as QueueHealth | null) ?? null)
      setAgents((agentsRes.data as AgentRow[] | null) ?? [])
      setTasks((tasksRes.data as TaskRow[] | null) ?? [])
      setProjects((projectsRes.data as ProjectRow[] | null) ?? [])
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

  const artifactReviewItems = useMemo(() => [] as ArtifactReviewItem[], [])
  const activityFeed = useMemo(() => [] as { id: string; taskId: string; taskTitle: string; projectTitle?: string; eventType: string; actorAgentId?: string | null; createdAt: string; detail?: string }[], [])

  const projectSummary = useMemo(() => {
    return {
      activeDestinations: [],
      recentPublications: [],
      deliveryFailures: [],
    } satisfies ProjectSummary
  }, [])

  const summary = useMemo(() => {
    return {
      revenueUsd: 0,
      costUsd: 0,
      marginUsd: 0,
      publishedToday: 0,
      approvalsPending: 0,
    } satisfies DashboardSummary
  }, [])

  const getTaskDetail = useCallback((taskId: string): TaskDetail | undefined => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return undefined
    const projectTitle = task.project_id ? projects.find((project) => project.id === task.project_id)?.title : undefined

    return {
      task,
      projectTitle,
      approvals: [],
      artifacts: [],
      events: [],
      deliveries: [],
      publications: [],
    }
  }, [projects, tasks])

  const patchTask = useCallback(async (_taskId?: string, _patch?: Record<string, unknown>) => undefined, [])
  const decideApproval = useCallback(async (_item?: unknown, _status?: 'approved' | 'rejected', _comment?: string) => undefined, [])
  const decideTaskApproval = useCallback(async (_taskId?: string, _status?: 'approved' | 'rejected', _comment?: string) => undefined, [])

  return {
    queueHealth,
    pipeline: [],
    watchdog: [],
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
