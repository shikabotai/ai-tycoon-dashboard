import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [observedAt, setObservedAt] = useState<string | null>(null)
  const [runnable, setRunnable] = useState<number>(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from('v_queue_health').select('observed_at,runnable_count').limit(1).maybeSingle()

      if (cancelled) return

      if (error) {
        setError(error.message)
      } else {
        setObservedAt(data?.observed_at ?? null)
        setRunnable(data?.runnable_count ?? 0)
      }

      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app-shell safe-mode-shell">
      <main className="safe-mode-main">
        <div className="safe-mode-card">
          <p className="eyebrow">AI Sensei Dashboard</p>
          <h1>Ultra Safe Mode</h1>
          <p className="subcopy">Single-query crash test. If this still turns black, the issue is deeper than the dashboard UI.</p>
          <ul className="safe-list">
            <li>Loading: {loading ? 'yes' : 'no'}</li>
            <li>Error: {error || 'none'}</li>
            <li>Observed at: {observedAt || 'none'}</li>
            <li>Runnable count: {runnable}</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
