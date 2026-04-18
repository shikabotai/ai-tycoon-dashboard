import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PipelineRow, QueueHealth, WatchdogRow } from '../types'

export function useDashboardData() {
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null)
  const [pipeline, setPipeline] = useState<PipelineRow[]>([])
  const [watchdog, setWatchdog] = useState<WatchdogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [queueHealthRes, pipelineRes, watchdogRes] = await Promise.all([
        supabase.from('v_queue_health').select('*').limit(1).maybeSingle(),
        supabase.from('v_pipeline_now').select('*').order('project').order('status'),
        supabase.from('v_task_watchdog').select('*').order('severity', { ascending: false }).order('updated_at', { ascending: true }).limit(12),
      ])

      if (cancelled) return

      const firstError = queueHealthRes.error || pipelineRes.error || watchdogRes.error
      if (firstError) {
        setError(firstError.message)
      } else {
        setQueueHealth((queueHealthRes.data as QueueHealth | null) ?? null)
        setPipeline((pipelineRes.data as PipelineRow[] | null) ?? [])
        setWatchdog((watchdogRes.data as WatchdogRow[] | null) ?? [])
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

  const activeAgents = useMemo(() => {
    const count = (queueHealth?.in_progress_count || 0) + (queueHealth?.runnable_count || 0)
    return Math.max(count, 1)
  }, [queueHealth])

  return { queueHealth, pipeline, watchdog, loading, error, activeAgents }
}
