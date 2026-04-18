import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AgentChamber, AgentRow, ApprovalRow, ArtifactReviewItem, ArtifactRow, PipelineRow, ProjectRow, QueueHealth, TaskRow, WatchdogRow } from '../types'

const CHAMBER_LABELS: Record<string, string> = {
  gateway: 'Dock A1',
  manager: 'Bridge B1',
  researcher: 'Lab C1',
  content: 'Studio C2',
  'worker-1': 'Bay D1',
  'worker-2': 'Bay D2',
  reviewer: 'Control E1',
}

export function useDashboardData() {
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null)
  const [pipeline, setPipeline] = useState<PipelineRow[]>([])
  const [watchdog, setWatchdog] = useState<WatchdogRow[]>([])
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [approvals, setApprovals] = useState<ApprovalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [queueHealthRes, pipelineRes, watchdogRes, agentsRes, tasksRes, projectsRes, artifactsRes, approvalsRes] = await Promise.all([
        supabase.from('v_queue_health').select('*').limit(1).maybeSingle(),
        supabase.from('v_pipeline_now').select('*').order('project').order('status'),
        supabase.from('v_task_watchdog').select('*').order('severity', { ascending: false }).order('updated_at', { ascending: true }).limit(12),
        supabase.from('agents').select('id,role,display_name,status,capabilities').order('id'),
        supabase.from('tasks').select('id,title,status,assigned_agent_id,current_step_index,project_id,updated_at').not('status', 'in', '(done,published,cancelled)').order('updated_at', { ascending: false }).limit(30),
        supabase.from('projects').select('id,title').limit(50),
        supabase.from('artifacts').select('id,task_id,artifact_type,content,mime_type,filename,storage_path,created_at').in('artifact_type', ['draft', 'draft_file', 'delivery_note', 'package']).order('created_at', { ascending: false }).limit(60),
        supabase.from('approvals').select('id,task_id,status,decided_at,created_at').order('created_at', { ascending: false }).limit(60),
      ])

      if (cancelled) return

      const firstError =
        queueHealthRes.error ||
        pipelineRes.error ||
        watchdogRes.error ||
        agentsRes.error ||
        tasksRes.error ||
        projectsRes.error ||
        artifactsRes.error ||
        approvalsRes.error

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
      }

      setLoading(false)
    }

    load()
    const id = window.setInterval(load, 15000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const agentChambers = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project.title]))

    return agents
      .filter((agent) => ['gateway', 'manager', 'researcher', 'content', 'worker-1', 'worker-2', 'reviewer'].includes(agent.id))
      .map((agent) => {
        const agentTasks = tasks.filter((task) => task.assigned_agent_id === agent.id)
        const decoratedTasks = agentTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          projectTitle: task.project_id ? projectMap.get(task.project_id) : undefined,
        }))

        return {
          id: agent.id,
          displayName: agent.display_name,
          role: agent.role,
          chamberLabel: CHAMBER_LABELS[agent.id] || agent.id,
          status: agent.status,
          taskCount: decoratedTasks.length,
          tasks: decoratedTasks,
        } satisfies AgentChamber
      })
  }, [agents, tasks, projects])

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
  }, [artifacts, approvals, projects, tasks])

  return { queueHealth, pipeline, watchdog, loading, error, agentChambers, artifactReviewItems }
}
