import './App.css'
import { SpaceScene } from './components/SpaceScene'
import { useDashboardData } from './hooks/useDashboardData'

function App() {
  const { queueHealth, pipeline, watchdog, loading, error, activeAgents } = useDashboardData()

  return (
    <div className="app-shell">
      <header className="hero-shell">
        <div>
          <p className="eyebrow">AI Tycoon Command Deck</p>
          <h1>Space Ops Dashboard</h1>
          <p className="subcopy">
            Live view of agent activity, queue pressure, and operational alerts across your business system.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>Runnable</span>
            <strong>{queueHealth?.runnable_count ?? '...'}</strong>
          </div>
          <div className="stat-card">
            <span>In progress</span>
            <strong>{queueHealth?.in_progress_count ?? '...'}</strong>
          </div>
          <div className="stat-card danger">
            <span>Alerts</span>
            <strong>{queueHealth?.flagged_count ?? '...'}</strong>
          </div>
        </div>
      </header>

      <section className="scene-panel panel">
        <div className="panel-head">
          <div>
            <h2>Fleet activity</h2>
            <p>Each ship represents active or runnable agent work. Alert pulses reflect operational pressure.</p>
          </div>
          <div className="scene-meta">
            <span>Agents visualized: {activeAgents}</span>
            <span>Max severity: {queueHealth?.max_watchdog_severity ?? 0}</span>
          </div>
        </div>
        <SpaceScene activeAgents={activeAgents} flaggedCount={queueHealth?.flagged_count ?? 0} />
      </section>

      <main className="grid">
        <section className="panel">
          <h2>Queue health</h2>
          <div className="metrics-grid">
            <Metric label="Terminal failures" value={queueHealth?.terminal_failure_count} />
            <Metric label="Review loops" value={queueHealth?.review_loop_count} />
            <Metric label="Retry loops" value={queueHealth?.retry_loop_count} />
            <Metric label="Stale active" value={queueHealth?.stale_active_count} />
            <Metric label="Awaiting approval" value={queueHealth?.awaiting_approval_count} />
            <Metric label="Delivery failed" value={queueHealth?.delivery_failed_count} />
          </div>
        </section>

        <section className="panel">
          <h2>Pipeline now</h2>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.map((row) => (
                  <tr key={`${row.project}-${row.status}`}>
                    <td>{row.project}</td>
                    <td>{row.status}</td>
                    <td>{row.task_count}</td>
                  </tr>
                ))}
                {pipeline.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty">No live pipeline rows.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel full-width">
          <h2>Watchdog alerts</h2>
          {watchdog.length === 0 ? (
            <p className="empty">No active alerts. The fleet is calm.</p>
          ) : (
            <div className="alerts-list">
              {watchdog.map((item) => (
                <article key={item.id} className="alert-card">
                  <div className="alert-topline">
                    <span className="badge">{item.watchdog_reason}</span>
                    <span className="severity">Severity {item.severity}</span>
                  </div>
                  <h3>{item.task_title}</h3>
                  <p>{item.project}</p>
                  <ul>
                    <li>Status: {item.status}</li>
                    <li>Assigned: {item.assigned_agent_id || 'unassigned'}</li>
                    <li>Attempts: {item.attempt_count}</li>
                  </ul>
                  {item.rejection_reason && <p className="detail">{item.rejection_reason}</p>}
                  {item.last_error && <p className="detail">{item.last_error}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer-note">
        {loading ? 'Loading live telemetry...' : error ? `Data error: ${error}` : `Observed at ${queueHealth?.observed_at ?? 'unknown time'}`}
      </footer>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | undefined | null }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  )
}

export default App
