import { useMemo } from 'react'

type SpaceSceneProps = {
  activeAgents: number
  flaggedCount: number
}

export function SpaceScene({ activeAgents, flaggedCount }: SpaceSceneProps) {
  const nodes = useMemo(() => {
    const total = Math.max(activeAgents, 1)
    return Array.from({ length: total }, (_, index) => {
      const angle = (Math.PI * 2 * index) / total
      const x = 50 + Math.cos(angle) * 32
      const y = 50 + Math.sin(angle) * 22
      return { id: index, x, y }
    })
  }, [activeAgents])

  const pulses = useMemo(() => Array.from({ length: Math.min(flaggedCount, 6) }, (_, index) => 28 + index * 10), [flaggedCount])
  const ringLabels = useMemo(
    () => [
      `Agent lattice · ${Math.max(activeAgents, 1)} nodes`,
      `Review pressure · ${flaggedCount} flagged`,
      'Premium dark-tech stage, lightweight runtime',
    ],
    [activeAgents, flaggedCount],
  )

  return (
    <div className="space-scene css-space-scene">
      <div className="space-scene-backdrop" />
      <div className="space-scene-aura" />
      <svg viewBox="0 0 100 100" className="space-scene-svg" aria-hidden="true">
        <defs>
          <radialGradient id="avatarCoreGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(120, 214, 255, 0.95)" />
            <stop offset="55%" stopColor="rgba(74, 145, 255, 0.38)" />
            <stop offset="100%" stopColor="rgba(7, 18, 38, 0)" />
          </radialGradient>
        </defs>
        {pulses.map((radius) => (
          <circle key={radius} cx="50" cy="50" r={radius / 2} className="space-scene-pulse" />
        ))}
        <circle cx="50" cy="50" r="15" className="space-scene-core-glow" />
        <circle cx="50" cy="50" r="7.2" className="space-scene-core-shell" />
        <circle cx="50" cy="50" r="3.1" className="space-scene-core-node" />
        {nodes.map((node) => (
          <g key={node.id}>
            <line x1="50" y1="50" x2={node.x} y2={node.y} className="space-scene-link" />
            <circle cx={node.x} cy={node.y} r="4.4" className="space-scene-node-core" />
            <circle cx={node.x} cy={node.y} r="8.5" className="space-scene-node-glow" />
          </g>
        ))}
      </svg>
      <div className="space-scene-caption premium">
        {ringLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
