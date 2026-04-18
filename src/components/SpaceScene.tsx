import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'

type SpaceSceneProps = {
  activeAgents: number
  flaggedCount: number
}

export function SpaceScene({ activeAgents, flaggedCount }: SpaceSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    class FleetScene extends Phaser.Scene {
      ships: Phaser.GameObjects.Arc[] = []
      pulses: Phaser.GameObjects.Arc[] = []

      create() {
        const { width, height } = this.scale
        this.cameras.main.setBackgroundColor('#050816')

        for (let i = 0; i < 120; i += 1) {
          this.add.circle(
            Phaser.Math.Between(0, width),
            Phaser.Math.Between(0, height),
            Phaser.Math.FloatBetween(0.4, 1.8),
            0xffffff,
            Phaser.Math.FloatBetween(0.3, 0.9),
          )
        }

        this.add.circle(width * 0.18, height * 0.28, 48, 0x53c8ff, 0.18)
        this.add.circle(width * 0.82, height * 0.22, 64, 0xff7b72, 0.12)
        this.add.circle(width * 0.7, height * 0.75, 86, 0x8b5cf6, 0.12)

        this.drawFleet()
      }

      drawFleet() {
        this.ships.forEach((ship) => ship.destroy())
        this.pulses.forEach((pulse) => pulse.destroy())
        this.ships = []
        this.pulses = []

        const { width, height } = this.scale
        const total = Math.max(activeAgents, 1)
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) * 0.28

        for (let i = 0; i < total; i += 1) {
          const angle = (Math.PI * 2 * i) / total
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * (radius * 0.62)
          const ship = this.add.circle(x, y, 9, 0x7dd3fc, 1)
          this.add.circle(x, y, 22, 0x7dd3fc, 0.08)
          this.ships.push(ship)

          this.tweens.add({
            targets: ship,
            y: y + Phaser.Math.Between(-8, 8),
            x: x + Phaser.Math.Between(-12, 12),
            duration: Phaser.Math.Between(1800, 3200),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          })
        }

        const alertCount = Math.min(flaggedCount, 6)
        for (let i = 0; i < alertCount; i += 1) {
          const pulse = this.add.circle(centerX, centerY, 24 + i * 12, 0xff7b72, 0.08)
          pulse.setStrokeStyle(1, 0xff7b72, 0.35)
          this.pulses.push(pulse)
          this.tweens.add({
            targets: pulse,
            alpha: 0.02,
            scale: 1.8,
            duration: 1800 + i * 220,
            repeat: -1,
            ease: 'Sine.easeOut',
          })
        }
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: containerRef.current.clientWidth,
        height: 360,
      },
      scene: FleetScene,
    })

    gameRef.current = game

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene('default') as Phaser.Scene & { drawFleet?: () => void } | undefined
    scene?.drawFleet?.()
  }, [activeAgents, flaggedCount])

  return <div ref={containerRef} className="space-scene" />
}
