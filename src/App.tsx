import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

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

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null)
  const [summary, setSummary] = useState<Summary>({ revenueUsd: 0, costUsd: 0, marginUsd: 0, publishedToday: 0 })
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [queueRes, pnlRes, publicationsRes, projectsRes] = await Promise.all([
        supabase.from('v_queue_health').select('observed_at,runnable_count,in_progress_count,flagged_count').limit(1).maybeSingle(),
        supabase.from('v_project_pnl').select('project_id,revenue_usd,cost_usd,margin_usd').order('month', { ascending: false }).limit(50),
        supabase.from('publications').select('project_id,published_at').order('published_at', { ascending: false }).limit(100),
        supabase.from('projects').select('id,title').order('title'),
      ])

      if (cancelled) return

      const firstError = queueRes.error || pnlRes.error || publicationsRes.error || projectsRes.error
      if (firstError) {
        setError(firstError.message)
        setLoading(false)
        return
      }

      const queue = queueRes.data as QueueHealth | null
      const pnlRows = (pnlRes.data ?? []) as Array<{ project_id: string; revenue_usd: number; cost_usd: number; margin_usd: number }>
      const publicationRows = (publicationsRes.data ?? []) as Array<{ project_id: string | null; published_at: string }>
      const projectRows = (projectsRes.data ?? []) as ProjectRow[]

      setQueueHealth(queue)
      setProjects(projectRows)

      const latestPnlByProject = new Map<string, { revenue_usd: number; cost_usd: number; margin_usd: number }>()
      for (const row of pnlRows) {
        if (!latestPnlByProject.has(row.project_id)) {
          latestPnlByProject.set(row.project_id, row)
        }
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

  return (
    <div className="app-shell safe-mode-shell">
      <main className="safe-mode-main">
        <div className="safe-mode-card">
          <p className="eyebrow">AI Sensei Dashboard</p>
          <h1>Stability Rebuild, Phase 1</h1>
          <p className="subcopy">Rebuilding from the safe version in small stable layers. This phase restores top-level business metrics and queue health.</p>

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
        </div>
      </main>
    </div>
  )
}
