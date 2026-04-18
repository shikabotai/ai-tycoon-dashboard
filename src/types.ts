export type QueueHealth = {
  observed_at: string
  runnable_count: number
  in_progress_count: number
  flagged_count: number
  terminal_failure_count: number
  review_loop_count: number
  retry_loop_count: number
  stale_active_count: number
  awaiting_approval_count: number
  delivery_failed_count: number
  delivery_failure_history_count: number
  max_watchdog_severity: number | null
  oldest_stale_task_id: string | null
  oldest_stale_project: string | null
  oldest_stale_task_title: string | null
  oldest_stale_updated_at: string | null
  hottest_review_loop_task_id: string | null
  hottest_review_loop_project: string | null
  hottest_review_loop_task_title: string | null
  hottest_review_loop_rejected_count: number | null
  hottest_retry_loop_task_id: string | null
  hottest_retry_loop_project: string | null
  hottest_retry_loop_task_title: string | null
  hottest_retry_loop_retry_count: number | null
}

export type PipelineRow = {
  project: string
  status: string
  count: number
}

export type WatchdogRow = {
  id: string
  project: string
  task_title: string
  task_type: string | null
  status: string
  assigned_agent_id: string | null
  current_step_index: number | null
  attempt_count: number
  max_attempts: number | null
  last_error: string | null
  rejection_reason: string | null
  watchdog_reason: string
  severity: number
  updated_at: string
}

export type AgentRow = {
  id: string
  role: string
  display_name: string
  status: string
  capabilities: Record<string, boolean> | null
}

export type TaskRow = {
  id: string
  title: string
  status: string
  assigned_agent_id: string | null
  current_step_index: number | null
  project_id: string | null
  updated_at: string
}

export type ProjectRow = {
  id: string
  title: string
}

export type AgentChamber = {
  id: string
  displayName: string
  role: string
  chamberLabel: string
  status: string
  taskCount: number
  tasks: Array<{
    id: string
    title: string
    status: string
    projectTitle?: string
  }>
}

export type ArtifactRow = {
  id: string
  task_id: string
  artifact_type: string
  content: string | null
  mime_type: string | null
  filename: string | null
  storage_path: string | null
  created_at: string
}

export type ApprovalRow = {
  id: string
  task_id: string
  status: string
  decided_at: string | null
  created_at: string
}

export type ArtifactReviewItem = {
  artifactId: string
  taskId: string
  taskTitle: string
  projectTitle?: string
  assignedAgentId?: string | null
  artifactType: string
  filename?: string | null
  mimeType?: string | null
  content?: string | null
  storagePath?: string | null
  createdAt: string
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'none'
}

export type ProjectPnlRow = {
  project_id: string
  title: string
  business_type: string | null
  month: string | null
  revenue_usd: number
  cost_usd: number
  margin_usd: number
}

export type PublicationRow = {
  id: string
  project_id: string | null
  task_id: string | null
  destination: string
  published_at: string
}

export type DashboardSummary = {
  revenueUsd: number
  costUsd: number
  marginUsd: number
  publishedToday: number
  approvalsPending: number
}
