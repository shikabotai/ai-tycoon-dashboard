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

  return (
    <div className="space-scene css-space-scene">
      <div className="space-scene-backdrop" />
      <svg viewBox="0 0 100 100" className="space-scene-svg" aria-hidden="true">
        {pulses.map((radius) => (
          <circle key={radius} cx="50" cy="50" r={radius / 2} className="space-scene-pulse" />
        ))}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="4.4" className="space-scene-node-core" />
            <circle cx={node.x} cy={node.y} r="8.5" className="space-scene-node-glow" />
          </g>
        ))}
      </svg>
      <div className="space-scene-caption">CSS constellation fallback, visual layer preserved without Phaser runtime.</div>
    </div>
  )
}
