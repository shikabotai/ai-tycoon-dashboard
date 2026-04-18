import { useMemo, useState } from 'react'
import './App.css'
import type { AgentChamber } from './types'
import { useDashboardData } from './hooks/useDashboardData'

const LAYOUT: Array<Array<string | null>> = [
  [null, 'manager', null],
  ['gateway', null, 'reviewer'],
  ['researcher', null, 'content'],
  ['worker-1', null, 'worker-2'],
]

export default function App() {
  const { queueHealth, pipeline, watchdog, loading, error, agentChambers } = useDashboardData()
  const chamberMap = useMemo(() => new Map(agentChambers.map((agent) => [agent.id, agent])), [agentChambers])
  const [zoom, setZoom] = useState(1)
  const [topOpen, setTopOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  const zoomIn = () => setZoom((value) => Math.min(1.5, Number((value + 0.1).toFixed(2))))
  const zoomOut = () => setZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(2))))
  const resetZoom = () => setZoom(1)

  return (
    <div className="app-shell">
      <button className={`drawer-toggle top ${topOpen ? 'open' : ''}`} onClick={() => setTopOpen((v) => !v)}>
        {topOpen ? 'Hide command banner' : 'Show command banner'}
      </button>
      <button className={`drawer-toggle left ${leftOpen ? 'open' : ''}`} onClick={() => setLeftOpen((v) => !v)}>
        {leftOpen ? 'Hide queue' : 'Show queue'}
      </button>
      <button className={`drawer-toggle right ${rightOpen ? 'open' : ''}`} onClick={() => setRightOpen((v) => !v)}>
        {rightOpen ? 'Hide alerts' : 'Show alerts'}
      </button>

      <header className={`top-drawer ${topOpen ? 'open' : ''}`}>
        <div>
          <p className="eyebrow">AI Tycoon Starship</p>
          <h1>Interior Agent Deck</h1>
          <p className="subcopy">
            A single connected ship layout, with the manager chamber at the command hub and the rest of the crew linked through internal corridors.
          </p>
        </div>
        <div className="hero-stats compact">
          <StatCard label="Runnable" value={queueHealth?.runnable_count ?? 0} />
          <StatCard label="Active" value={queueHealth?.in_progress_count ?? 0} />
          <StatCard label="Alerts" value={queueHealth?.flagged_count ?? 0} danger />
        </div>
      </header>

      <aside className={`side-drawer left ${leftOpen ? 'open' : ''}`}>
        <div className="drawer-inner">
          <h2>Queue health</h2>
          <div className="metrics-grid single">
            <Metric label="Terminal failures" value={queueHealth?.terminal_failure_count} />
            <Metric label="Review loops" value={queueHealth?.review_loop_count} />
            <Metric label="Retry loops" value={queueHealth?.retry_loop_count} />
            <Metric label="Stale active" value={queueHealth?.stale_active_count} />
            <Metric label="Awaiting approval" value={queueHealth?.awaiting_approval_count} />
            <Metric label="Delivery failed" value={queueHealth?.delivery_failed_count} />
          </div>

          <h2>Pipeline</h2>
          <div className="table-shell slim">
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
                    <td>{row.count}</td>
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
        </div>
      </aside>

      <aside className={`side-drawer right ${rightOpen ? 'open' : ''}`}>
        <div className="drawer-inner">
          <h2>Watchdog</h2>
          {watchdog.length === 0 ? (
            <p className="empty">No active alerts. The ship is running clean.</p>
          ) : (
            <div className="alerts-list compact-list">
              {watchdog.map((item) => (
                <article key={item.id} className="alert-card compact-card">
                  <div className="alert-topline">
                    <span className="badge">{item.watchdog_reason}</span>
                    <span className="severity">S{item.severity}</span>
                  </div>
                  <h3>{item.task_title}</h3>
                  <p>{item.project}</p>
                  <ul>
                    <li>Status: {item.status}</li>
                    <li>Assigned: {item.assigned_agent_id || 'unassigned'}</li>
                    <li>Attempts: {item.attempt_count}</li>
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="map-stage compact-ship">
        <div className="map-toolbar">
          <button onClick={zoomOut}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn}>+</button>
          <button onClick={resetZoom}>Reset</button>
          <span className="toolbar-note">
            {loading ? 'Loading telemetry...' : error ? `Error: ${error}` : `Observed ${queueHealth?.observed_at ?? 'unknown'}`}
          </span>
        </div>

        <div className="map-viewport">
          <div className="starfield" />
          <div className="map-canvas compact" style={{ transform: `scale(${zoom})` }}>
            <div className="ship-hull" />
            <div className="ship-spine" />
            <div className="ship-grid connected">
              {LAYOUT.map((row, rowIndex) => (
                <div className="ship-row connected" key={rowIndex}>
                  {row.map((cell, cellIndex) =>
                    cell ? (
                      <AgentRoom key={cell} chamber={chamberMap.get(cell)} />
                    ) : (
                      <Connector key={`${rowIndex}-${cellIndex}`} rowIndex={rowIndex} cellIndex={cellIndex} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Connector({ rowIndex, cellIndex }: { rowIndex: number; cellIndex: number }) {
  const vertical = true
  const horizontal = rowIndex > 0
  const managerBridge = rowIndex === 0 && cellIndex === 0
  const managerBridgeRight = rowIndex === 0 && cellIndex === 2

  return (
    <div className={`connector-node ${managerBridge || managerBridgeRight ? 'manager-bridge' : ''}`}>
      {vertical && <div className="hallway-vertical animated" />}
      {horizontal && <div className="hallway-horizontal animated" />}
      <div className="hallway-core" />
    </div>
  )
}

function AgentRoom({ chamber }: { chamber?: AgentChamber }) {
  if (!chamber) {
    return <div className="agent-room empty-room">Offline chamber</div>
  }

  return (
    <article className={`agent-room role-${chamber.role}`}>
      <div className="room-glow" />
      <div className="room-stars" />
      <div className="agent-avatar-zone">
        <div className="agent-orbit orbit-one" />
        <div className="agent-orbit orbit-two" />
        <div className="agent-core">
          <div className="agent-eye" />
          <div className="agent-eye right" />
        </div>
      </div>
      <div className="room-topline">
        <span className="room-label">{chamber.chamberLabel}</span>
        <span className={`status-dot ${chamber.status}`}>{chamber.status}</span>
      </div>
      <h3>{chamber.displayName}</h3>
      <p className="room-role">{chamber.role}</p>
      <div className="room-task-count">{chamber.taskCount} active tasks</div>
      <div className="task-stack">
        {chamber.tasks.length === 0 ? (
          <div className="task-pill idle">Idle</div>
        ) : (
          chamber.tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="task-pill">
              <strong>{task.title}</strong>
              <span>{task.projectTitle || task.status}</span>
            </div>
          ))
        )}
      </div>
    </article>
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

function StatCard({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={`stat-card ${danger ? 'danger' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
