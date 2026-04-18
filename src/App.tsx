import { useMemo, useRef, useState } from 'react'
import './App.css'
import type { AgentChamber, ArtifactReviewItem } from './types'
import { agentIdentities } from './agentIdentities'
import { buildAvatar } from './lib/avatars'
import { useDashboardData } from './hooks/useDashboardData'

const LAYOUT: Array<Array<string | null>> = [
  [null, 'manager', null],
  ['gateway', null, 'reviewer'],
  ['researcher', null, 'content'],
  ['worker-1', null, 'worker-2'],
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const MIN_ZOOM = 0.28
const MAX_ZOOM = 1.8
const INITIAL_CAMERA = { x: 0, y: 0 }

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const { queueHealth, pipeline, watchdog, loading, error, agentChambers, artifactReviewItems, decideApproval, summary, activityFeed, projects, projectSummary, getTaskDetail, patchTask, decideTaskApproval } = useDashboardData(selectedProjectId)
  const chamberMap = useMemo(() => new Map(agentChambers.map((agent) => [agent.id, agent])), [agentChambers])
  const [zoom, setZoom] = useState(0.72)
  const [camera, setCamera] = useState(INITIAL_CAMERA)
  const [topOpen, setTopOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const [approvalBusy, setApprovalBusy] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskActionBusy, setTaskActionBusy] = useState(false)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const gestureRef = useRef<{ startDistance: number; startZoom: number; midpointX: number; midpointY: number } | null>(null)
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; startCameraX: number; startCameraY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    startCameraX: 0,
    startCameraY: 0,
  })
  const activePointerIdRef = useRef<number | null>(null)

  const cancelDrag = () => {
    dragRef.current.active = false
    activePointerIdRef.current = null
  }

  const applyZoom = (nextZoom: number, clientX?: number, clientY?: number) => {
    const viewport = viewportRef.current
    const clamped = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
    if (!viewport) {
      setZoom(clamped)
      return
    }

    const rect = viewport.getBoundingClientRect()
    const anchorX = (clientX ?? rect.left + rect.width / 2) - rect.left
    const anchorY = (clientY ?? rect.top + rect.height / 2) - rect.top

    setCamera((current) => {
      const worldX = (anchorX - current.x) / zoom
      const worldY = (anchorY - current.y) / zoom
      return {
        x: anchorX - worldX * clamped,
        y: anchorY - worldY * clamped,
      }
    })
    setZoom(clamped)
  }

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const factor = event.deltaY < 0 ? 1.14 : 0.86
    applyZoom(zoom * factor, event.clientX, event.clientY)
  }

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.pointerType === 'touch' && event.isPrimary === false) return
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startCameraX: camera.x,
      startCameraY: camera.y,
    }
    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const drag = dragRef.current
    if (!drag.active || activePointerIdRef.current !== event.pointerId) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    setCamera({ x: drag.startCameraX + dx, y: drag.startCameraY + dy })
  }

  const endPointer: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    cancelDrag()
  }

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (event.touches.length === 2) {
      cancelDrag()
      const a = event.touches[0]
      const b = event.touches[1]
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      gestureRef.current = {
        startDistance: distance,
        startZoom: zoom,
        midpointX: (a.clientX + b.clientX) / 2,
        midpointY: (a.clientY + b.clientY) / 2,
      }
    }
  }

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (event.touches.length !== 2 || !gestureRef.current) return
    event.preventDefault()
    const a = event.touches[0]
    const b = event.touches[1]
    if (!a || !b) return
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    const midpointX = (a.clientX + b.clientX) / 2
    const midpointY = (a.clientY + b.clientY) / 2
    const nextZoom = gestureRef.current.startZoom * (distance / gestureRef.current.startDistance)
    applyZoom(nextZoom, midpointX, midpointY)
  }

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (event.touches.length < 2) {
      gestureRef.current = null
    }
    if (event.touches.length === 0) {
      cancelDrag()
    }
  }

  const selectedChamber = selectedAgentId ? chamberMap.get(selectedAgentId) : undefined
  const selectedIdentity = selectedChamber ? agentIdentities[selectedChamber.id] : undefined
  const selectedTaskDetail = selectedTaskId ? getTaskDetail(selectedTaskId) : undefined
  const safeProjectSummary = projectSummary ?? { activeDestinations: [], recentPublications: [], deliveryFailures: [] }
  const pendingArtifactReviewItems = (artifactReviewItems || []).filter((item) => item.approvalStatus === 'pending' || item.approvalStatus === 'none')
  const selectedArtifact = selectedArtifactId
    ? artifactReviewItems.find((item) => item.artifactId === selectedArtifactId)
    : pendingArtifactReviewItems[0] ?? artifactReviewItems[0]

  return (
    <div className="app-shell">
      <button className={`drawer-toggle top ${topOpen ? 'open' : ''}`} onClick={() => setTopOpen((v) => !v)}>
        {topOpen ? 'Hide command banner' : 'Show command banner'}
      </button>
      <button className={`drawer-toggle left ${leftOpen ? 'open' : ''}`} onClick={() => setLeftOpen((v) => !v)}>
        {leftOpen ? 'Hide queue' : 'Show queue'}
      </button>
      <button className={`drawer-toggle right ${rightOpen ? 'open' : ''}`} onClick={() => setRightOpen((v) => !v)}>
        {rightOpen ? 'Hide review dock' : 'Show review dock'}
      </button>

      <header className={`top-drawer ${topOpen ? 'open' : ''}`}>
        <div>
          <p className="eyebrow">AI Tycoon Starship</p>
          <h1>Interior Agent Deck</h1>
          <p className="subcopy">
            A single connected ship layout, with the manager chamber at the command hub and the rest of the crew linked through internal corridors.
          </p>
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
        <div className="hero-stats compact command-center-grid">
          <StatCard label="Revenue" value={`$${(summary?.revenueUsd ?? 0).toFixed(2)}`} />
          <StatCard label="Cost" value={`$${(summary?.costUsd ?? 0).toFixed(2)}`} />
          <StatCard label="Margin" value={`$${(summary?.marginUsd ?? 0).toFixed(2)}`} />
          <StatCard label="Published today" value={summary?.publishedToday ?? 0} />
          <StatCard label="Pending approvals" value={summary?.approvalsPending ?? 0} />
          <StatCard label="Runnable" value={queueHealth?.runnable_count ?? 0} />
          <StatCard label="Active" value={queueHealth?.in_progress_count ?? 0} />
          <StatCard label="Alerts" value={queueHealth?.flagged_count ?? 0} danger />
        </div>

        <div className="project-summary-strip">
          <div className="metric-card">
            <span>Active destinations</span>
            <strong>{safeProjectSummary.activeDestinations.length}</strong>
          </div>
          <div className="metric-card">
            <span>Recent publications</span>
            <strong>{safeProjectSummary.recentPublications.length}</strong>
          </div>
          <div className="metric-card">
            <span>Delivery failures</span>
            <strong>{safeProjectSummary.deliveryFailures.length}</strong>
          </div>
        </div>
        {(safeProjectSummary.activeDestinations.length > 0 || safeProjectSummary.recentPublications.length > 0 || safeProjectSummary.deliveryFailures.length > 0) && (
          <div className="project-summary-panels">
            <section className="summary-panel">
              <h3>Destinations</h3>
              {safeProjectSummary.activeDestinations.length === 0 ? (
                <p className="empty">No active destinations.</p>
              ) : (
                <div className="summary-list">
                  {safeProjectSummary.activeDestinations.map((item) => (
                    <div key={item.id} className="summary-item">
                      <strong>{item.destination}</strong>
                      <span>{item.is_active ? 'active' : 'inactive'}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="summary-panel">
              <h3>Delivery health</h3>
              {safeProjectSummary.deliveryFailures.length === 0 ? (
                <p className="empty">No recent delivery failures.</p>
              ) : (
                <div className="summary-list">
                  {safeProjectSummary.deliveryFailures.map((item) => (
                    <div key={item.id} className="summary-item">
                      <strong>{item.destination}</strong>
                      <span>{item.error || item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <section className="outbound-history-panel">
          <div className="outbound-history-header">
            <div>
              <p className="eyebrow">Outbound</p>
              <h3>Publication history</h3>
            </div>
            <span className="badge">{safeProjectSummary.recentPublications.length} recent</span>
          </div>
          {safeProjectSummary.recentPublications.length === 0 ? (
            <p className="empty">No shipped outputs yet.</p>
          ) : (
            <div className="outbound-history-list">
              {safeProjectSummary.recentPublications.map((item) => (
                <div key={item.id} className="outbound-card task-button" role="button" tabIndex={0} onClick={() => item.task_id && setSelectedTaskId(item.task_id)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && item.task_id) setSelectedTaskId(item.task_id) }}>
                  <div className="outbound-card-topline">
                    <span className="badge">{item.destination}</span>
                    <span>{new Date(item.published_at).toLocaleString()}</span>
                  </div>
                  <strong>{item.external_url || 'Published artifact'}</strong>
                  <small>{item.task_id || 'No task id'}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </header>

      <aside className={`side-drawer left ${leftOpen ? 'open' : ''}`}>
        <div className="drawer-inner">
          <h2>Live activity</h2>
          {activityFeed.length === 0 ? (
            <p className="empty">No recent activity yet.</p>
          ) : (
            <div className="activity-feed">
              {activityFeed.slice(0, 12).map((item) => (
                <div key={item.id} className="activity-card task-button" role="button" tabIndex={0} onClick={() => setSelectedTaskId(item.taskId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedTaskId(item.taskId) }}>
                  <div className="activity-topline">
                    <span className="badge">{item.eventType}</span>
                    <span className="severity">{item.actorAgentId || 'system'}</span>
                  </div>
                  <h3>{item.taskTitle}</h3>
                  <p>{item.projectTitle || 'Unknown project'}</p>
                  {item.detail && <small>{item.detail}</small>}
                </div>
              ))}
            </div>
          )}

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
        <div className="drawer-inner review-drawer">
          <div className="review-drawer-header">
            <div>
              <h2>Review dock</h2>
              <p className="subcopy">Open artifacts, inspect final work, and approve or decline before shipping.</p>
            </div>
            <span className="badge">{pendingArtifactReviewItems.length} pending</span>
          </div>

          <div className="artifact-review-panel">
            <div className="artifact-review-list">
              {pendingArtifactReviewItems.length === 0 ? (
                <p className="empty">No pending approvals right now.</p>
              ) : (
                pendingArtifactReviewItems.map((item) => (
                  <button
                    key={item.artifactId}
                    className={`artifact-list-item ${selectedArtifact?.artifactId === item.artifactId ? 'active' : ''}`}
                    onClick={() => setSelectedArtifactId(item.artifactId)}
                  >
                    <div className="artifact-list-topline">
                      <span className="badge">{item.artifactType}</span>
                      <span className={`approval-pill approval-${item.approvalStatus}`}>{item.approvalStatus}</span>
                    </div>
                    <strong>{item.taskTitle}</strong>
                    <span>{item.projectTitle || 'Unassigned project'}</span>
                    <small>{item.filename || item.storagePath || item.createdAt}</small>
                  </button>
                ))
              )}
            </div>

            <div className="artifact-preview-card">
              {selectedArtifact ? (
                <ArtifactPreview item={selectedArtifact} approvalBusy={approvalBusy} onApprove={async (item) => {
                  try {
                    setApprovalBusy(true)
                    await decideApproval(item, 'approved')
                    setSelectedArtifactId(null)
                  } finally {
                    setApprovalBusy(false)
                  }
                }} onReject={async (item) => {
                  const reason = window.prompt('Why are you declining this artifact?', 'Needs revision')
                  if (reason === null) return
                  try {
                    setApprovalBusy(true)
                    await decideApproval(item, 'rejected', reason)
                    setSelectedArtifactId(null)
                  } finally {
                    setApprovalBusy(false)
                  }
                }} />
              ) : (
                <p className="empty">Select an artifact to review.</p>
              )}
            </div>
          </div>

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
        <div className="map-hint">Pinch or scroll to zoom. Drag to pan.</div>
        <div
          ref={viewportRef}
          className="map-viewport interactive camera-mode"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerLeave={endPointer}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="starfield" />
          <div
            className="map-canvas compact camera-canvas"
            style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${zoom})` }}
          >
            <div className="ship-hull" />
            <div className="ship-spine" />
            <div className="ship-grid connected">
              {LAYOUT.map((row, rowIndex) => (
                <div className="ship-row connected" key={rowIndex}>
                  {row.map((cell, cellIndex) =>
                    cell ? (
                      <AgentRoom key={cell} chamber={chamberMap.get(cell)} onOpen={() => setSelectedAgentId(cell)} />
                    ) : (
                      <Connector key={`${rowIndex}-${cellIndex}`} rowIndex={rowIndex} cellIndex={cellIndex} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="map-status-pill">
          {loading ? 'Loading telemetry...' : error ? `Error: ${error}` : `${Math.round(zoom * 100)}% zoom • observed ${queueHealth?.observed_at ?? 'unknown'}`}
        </div>
      </main>

      {selectedTaskDetail && (
        <div className="agent-modal-backdrop" onClick={() => setSelectedTaskId(null)}>
          <div className="agent-modal task-detail-modal" onClick={(event) => event.stopPropagation()}>
            <button className="agent-modal-close" onClick={() => setSelectedTaskId(null)}>Close</button>
            <div className="agent-modal-header">
              <div>
                <p className="eyebrow">Task drill-down</p>
                <h2>{selectedTaskDetail.task.title}</h2>
                <p className="subcopy">{selectedTaskDetail.projectTitle || 'Unknown project'} • {selectedTaskDetail.task.status}</p>
              </div>
            </div>

            <div className="agent-modal-grid">
              <div className="metric-card">
                <span>Approvals</span>
                <strong>{selectedTaskDetail.approvals.length}</strong>
              </div>
              <div className="metric-card">
                <span>Artifacts</span>
                <strong>{selectedTaskDetail.artifacts.length}</strong>
              </div>
              <div className="metric-card">
                <span>Events</span>
                <strong>{selectedTaskDetail.events.length}</strong>
              </div>
              <div className="metric-card">
                <span>Deliveries</span>
                <strong>{selectedTaskDetail.deliveries.length}</strong>
              </div>
              <div className="metric-card">
                <span>Publications</span>
                <strong>{selectedTaskDetail.publications.length}</strong>
              </div>
            </div>

            <div className="artifact-actions task-detail-actions">
              <button className="action-button secondary" disabled={taskActionBusy} onClick={async () => {
                try {
                  setTaskActionBusy(true)
                  await patchTask(selectedTaskDetail.task.id, { status: 'assigned' })
                } finally {
                  setTaskActionBusy(false)
                }
              }}>
                {taskActionBusy ? 'Saving...' : 'Reset to assigned'}
              </button>
              <button className="action-button danger" disabled={taskActionBusy} onClick={async () => {
                const reason = window.prompt('Cancel this task? Add an optional reason.', 'cancelled from dashboard')
                if (reason === null) return
                try {
                  setTaskActionBusy(true)
                  await patchTask(selectedTaskDetail.task.id, { status: 'cancelled', last_error: reason || null })
                  setSelectedTaskId(null)
                } finally {
                  setTaskActionBusy(false)
                }
              }}>
                {taskActionBusy ? 'Saving...' : 'Cancel task'}
              </button>
              {selectedTaskDetail.approvals.some((item) => item.status === 'pending') && (
                <>
                  <button className="action-button primary" disabled={taskActionBusy} onClick={async () => {
                    try {
                      setTaskActionBusy(true)
                      await decideTaskApproval(selectedTaskDetail.task.id, 'approved')
                    } finally {
                      setTaskActionBusy(false)
                    }
                  }}>
                    {taskActionBusy ? 'Saving...' : 'Approve task'}
                  </button>
                  <button className="action-button danger" disabled={taskActionBusy} onClick={async () => {
                    const reason = window.prompt('Why are you rejecting this task?', 'Needs revision')
                    if (reason === null) return
                    try {
                      setTaskActionBusy(true)
                      await decideTaskApproval(selectedTaskDetail.task.id, 'rejected', reason)
                    } finally {
                      setTaskActionBusy(false)
                    }
                  }}>
                    {taskActionBusy ? 'Saving...' : 'Reject task'}
                  </button>
                </>
              )}
            </div>

            <div className="task-detail-sections">
              <section className="summary-panel">
                <h3>Artifacts</h3>
                {selectedTaskDetail.artifacts.length === 0 ? <p className="empty">No artifacts.</p> : (
                  <div className="summary-list">
                    {selectedTaskDetail.artifacts.map((item) => (
                      <div key={item.id} className="summary-item">
                        <strong>{item.filename || item.artifact_type}</strong>
                        <span>{item.created_at}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="summary-panel">
                <h3>Approvals</h3>
                {selectedTaskDetail.approvals.length === 0 ? <p className="empty">No approvals.</p> : (
                  <div className="summary-list">
                    {selectedTaskDetail.approvals.map((item) => (
                      <div key={item.id} className="summary-item">
                        <strong>{item.status}</strong>
                        <span>{item.comment || item.created_at}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="summary-panel">
                <h3>Delivery trail</h3>
                {selectedTaskDetail.deliveries.length === 0 && selectedTaskDetail.publications.length === 0 ? <p className="empty">No delivery history.</p> : (
                  <div className="summary-list">
                    {selectedTaskDetail.deliveries.map((item) => (
                      <div key={item.id} className="summary-item">
                        <strong>{item.destination} • {item.status}</strong>
                        <span>{item.destination_ref || item.error || item.delivered_at || 'No detail'}</span>
                      </div>
                    ))}
                    {selectedTaskDetail.publications.map((item) => (
                      <div key={item.id} className="summary-item">
                        <strong>Published to {item.destination}</strong>
                        <span>{item.external_url || item.published_at}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {selectedChamber && selectedIdentity && (
        <div className="agent-modal-backdrop" onClick={() => setSelectedAgentId(null)}>
          <div
            className={`agent-modal theme-${selectedIdentity.roomTheme}`}
            onClick={(event) => event.stopPropagation()}
            style={{
              ['--agent-primary' as string]: selectedIdentity.palette.primary,
              ['--agent-secondary' as string]: selectedIdentity.palette.secondary,
              ['--agent-glow' as string]: selectedIdentity.palette.glow,
            }}
          >
            <button className="agent-modal-close" onClick={() => setSelectedAgentId(null)}>Close</button>
            <div className="agent-modal-header">
              <div>
                <p className="eyebrow">{selectedChamber.chamberLabel}</p>
                <h2>{selectedIdentity.name}</h2>
                <p className="subcopy">{selectedIdentity.subtitle}</p>
              </div>
              <div className="agent-avatar-zone modal-avatar">
                <div className="agent-character modal-character">
                  <img src={buildAvatar(selectedIdentity.avatarSeed)} alt={selectedIdentity.name} className="agent-portrait" />
                </div>
                <div className="agent-orbit orbit-one" />
                <div className="agent-orbit orbit-two" />
              </div>
            </div>

            <div className="agent-modal-grid">
              <div className="metric-card">
                <span>Status</span>
                <strong>{selectedChamber.status}</strong>
              </div>
              <div className="metric-card">
                <span>Role</span>
                <strong>{selectedChamber.role}</strong>
              </div>
              <div className="metric-card">
                <span>Active tasks</span>
                <strong>{selectedChamber.taskCount}</strong>
              </div>
              <div className="metric-card">
                <span>Recent runs</span>
                <strong>{selectedChamber.runCount}</strong>
              </div>
              <div className="metric-card">
                <span>Total cost</span>
                <strong>${selectedChamber.totalCostUsd.toFixed(2)}</strong>
              </div>
              <div className="metric-card">
                <span>Last run</span>
                <strong>{selectedChamber.lastRunAt ? new Date(selectedChamber.lastRunAt).toLocaleString() : 'No runs yet'}</strong>
              </div>
            </div>

            {(selectedChamber.lastError || selectedChamber.lastArtifactTitle) && (
              <section className="agent-detail-strip">
                {selectedChamber.lastArtifactTitle && (
                  <div className="metric-card">
                    <span>Last artifact</span>
                    <strong>{selectedChamber.lastArtifactTitle}</strong>
                  </div>
                )}
                {selectedChamber.lastError && (
                  <div className="metric-card danger-card">
                    <span>Last error</span>
                    <strong>{selectedChamber.lastError}</strong>
                  </div>
                )}
              </section>
            )}

            <section className="agent-task-section">
              <h3>Current work</h3>
              {selectedChamber.tasks.length === 0 ? (
                <p className="empty">No active tasks right now.</p>
              ) : (
                <div className="task-stack modal-stack">
                  {selectedChamber.tasks.map((task) => (
                    <div key={task.id} className="task-pill task-button" role="button" tabIndex={0} onClick={() => setSelectedTaskId(task.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedTaskId(task.id) }}>
                      <strong>{task.title}</strong>
                      <span>{task.projectTitle || task.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
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

function AgentRoom({ chamber, onOpen }: { chamber?: AgentChamber; onOpen?: () => void }) {
  if (!chamber) {
    return <div className="agent-room empty-room">Offline chamber</div>
  }

  const identity = agentIdentities[chamber.id] ?? {
    name: chamber.displayName,
    subtitle: chamber.role,
    roomTheme: 'default-room',
    palette: { primary: '#7dd3fc', secondary: '#22d3ee', glow: 'rgba(34, 211, 238, 0.35)', accent: '#e0f2fe', background: '#10263a' },
    avatarSeed: chamber.id,
  }

  const avatarUri = buildAvatar(identity.avatarSeed)

  return (
    <button
      className={`agent-room role-${chamber.role} theme-${identity.roomTheme}`}
      onClick={onOpen}
      style={{
        ['--agent-primary' as string]: identity.palette.primary,
        ['--agent-secondary' as string]: identity.palette.secondary,
        ['--agent-glow' as string]: identity.palette.glow,
      }}
    >
      <div className="room-glow" />
      <div className="room-stars" />
      <div className="agent-avatar-zone">
        <div className="agent-walk-path" />
        <div className="agent-character">
          <img src={avatarUri} alt={identity.name} className="agent-portrait" />
        </div>
        <div className="agent-orbit orbit-one" />
        <div className="agent-orbit orbit-two" />
      </div>
      <div className="room-prop room-prop-a" />
      <div className="room-prop room-prop-b" />
      <div className="room-console-lights">
        <span />
        <span />
        <span />
      </div>
      <div className="room-desk" />
      <div className="room-helper-bot" />
    </button>
  )
}

function downloadInlineArtifact(item: ArtifactReviewItem) {
  if (!item.content) return
  const blob = new Blob([item.content], { type: item.mimeType || 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = item.filename || `${item.taskTitle.replace(/\s+/g, '_').toLowerCase()}-${item.artifactType}.txt`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function renderArtifactContent(content?: string | null) {
  if (!content?.trim()) {
    return <p className="empty">No inline artifact content stored yet. Open the file path when available.</p>
  }

  const lines = content.split('\n')

  return (
    <div className="artifact-markdown">
      {lines.map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={index} className="artifact-spacer" />
        if (trimmed.startsWith('### ')) return <h5 key={index}>{trimmed.slice(4)}</h5>
        if (trimmed.startsWith('## ')) return <h4 key={index}>{trimmed.slice(3)}</h4>
        if (trimmed.startsWith('# ')) return <h3 key={index}>{trimmed.slice(2)}</h3>
        if (trimmed.startsWith('- ')) return <li key={index}>{trimmed.slice(2)}</li>
        if (/^\d+\.\s/.test(trimmed)) return <li key={index}>{trimmed.replace(/^\d+\.\s/, '')}</li>
        return <p key={index}>{line}</p>
      })}
    </div>
  )
}

function ArtifactPreview({ item, approvalBusy, onApprove, onReject }: { item: ArtifactReviewItem; approvalBusy: boolean; onApprove: (item: ArtifactReviewItem) => Promise<void>; onReject: (item: ArtifactReviewItem) => Promise<void> }) {
  return (
    <div className="artifact-preview-inner">
      <div className="artifact-preview-topline">
        <div>
          <p className="eyebrow">{item.projectTitle || 'Artifact review'}</p>
          <h3>{item.taskTitle}</h3>
        </div>
        <span className={`approval-pill approval-${item.approvalStatus}`}>{item.approvalStatus}</span>
      </div>

      <div className="artifact-meta-grid">
        <div className="metric-card">
          <span>Agent</span>
          <strong>{item.assignedAgentId || 'unknown'}</strong>
        </div>
        <div className="metric-card">
          <span>Type</span>
          <strong>{item.artifactType}</strong>
        </div>
        <div className="metric-card">
          <span>File</span>
          <strong>{item.filename || 'inline artifact'}</strong>
        </div>
        <div className="metric-card">
          <span>MIME</span>
          <strong>{item.mimeType || 'text/plain'}</strong>
        </div>
        <div className="metric-card artifact-meta-wide">
          <span>Storage path</span>
          <strong>{item.storagePath || 'stored inline in database'}</strong>
        </div>
      </div>

      <div className="artifact-actions">
        <button className="action-button primary" disabled={approvalBusy} onClick={() => void onApprove(item)}>
          {approvalBusy ? 'Saving...' : 'Approve to ship'}
        </button>
        <button className="action-button danger" disabled={approvalBusy} onClick={() => void onReject(item)}>
          {approvalBusy ? 'Saving...' : 'Decline'}
        </button>
        {item.content && (
          <button className="action-button secondary" disabled={approvalBusy} onClick={() => downloadInlineArtifact(item)}>
            Download text
          </button>
        )}
        {item.storagePath && (
          <button className="action-button secondary" disabled={approvalBusy} onClick={() => window.alert(`Storage path: ${item.storagePath}`)}>
            View storage path
          </button>
        )}
      </div>

      <div className="artifact-preview-body">
        {renderArtifactContent(item.content)}
      </div>
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

function StatCard({ label, value, danger = false }: { label: string; value: number | string; danger?: boolean }) {
  return (
    <div className={`stat-card ${danger ? 'danger' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
