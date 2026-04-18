import { useState } from 'react'
import './App.css'
import { useDashboardData } from './hooks/useDashboardData'

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const { queueHealth, loading, error, artifactReviewItems, summary, activityFeed, projects } = useDashboardData(selectedProjectId)

  return (
    <div className="app-shell safe-mode-shell">
      <main className="safe-mode-main">
        <div className="safe-mode-card">
          <p className="eyebrow">AI Sensei Dashboard</p>
          <h1>Safe Mode</h1>
          <p className="subcopy">This stripped-down view is running to isolate the crash. If this page stays visible, the black screen is in the richer UI layer, not the core app boot path.</p>

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
            <h2>Status</h2>
            <ul className="safe-list">
              <li>Loading: {loading ? 'yes' : 'no'}</li>
              <li>Error: {error || 'none'}</li>
              <li>Runnable: {queueHealth?.runnable_count ?? 0}</li>
              <li>Active: {queueHealth?.in_progress_count ?? 0}</li>
              <li>Alerts: {queueHealth?.flagged_count ?? 0}</li>
            </ul>
          </section>

          <section className="safe-mode-card">
            <h2>Business Metrics</h2>
            <ul className="safe-list">
              <li>Revenue: ${(summary?.revenueUsd ?? 0).toFixed(2)}</li>
              <li>Cost: ${(summary?.costUsd ?? 0).toFixed(2)}</li>
              <li>Margin: ${(summary?.marginUsd ?? 0).toFixed(2)}</li>
              <li>Published today: {summary?.publishedToday ?? 0}</li>
              <li>Pending approvals: {summary?.approvalsPending ?? 0}</li>
            </ul>
          </section>

          <section className="safe-mode-card">
            <h2>Recent Activity</h2>
            {activityFeed.length === 0 ? (
              <p className="empty">No recent activity.</p>
            ) : (
              <div className="safe-list-blocks">
                {activityFeed.slice(0, 8).map((item) => (
                  <div key={item.id} className="safe-item">
                    <strong>{item.eventType}</strong>
                    <span>{item.taskTitle}</span>
                    <small>{item.projectTitle || 'Unknown project'}</small>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="safe-mode-card">
            <h2>Pending Review</h2>
            {artifactReviewItems.length === 0 ? (
              <p className="empty">No review items.</p>
            ) : (
              <div className="safe-list-blocks">
                {artifactReviewItems.slice(0, 8).map((item) => (
                  <div key={item.artifactId} className="safe-item">
                    <strong>{item.taskTitle}</strong>
                    <span>{item.artifactType}</span>
                    <small>{item.approvalStatus}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
