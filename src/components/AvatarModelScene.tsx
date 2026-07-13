import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { type MutableRefObject, type PointerEvent, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type AvatarModelSceneProps = {
  modelPath: string
}

type AvatarRotationControl = {
  dragging: MutableRefObject<boolean>
  targetY: MutableRefObject<number>
  velocityY: MutableRefObject<number>
}

const PLATFORM_BASE_Y = -0.05
const INITIAL_AVATAR_ROTATION = -0.22
const DRAG_ROTATION_SPEED = 0.012
const AUTO_ROTATION_SPEED = 0.16
const INERTIA_DECAY = 0.9

function RotatingAvatar({ modelPath, rotationControl }: AvatarModelSceneProps & { rotationControl: AvatarRotationControl }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF(modelPath)

  const scene = useMemo(() => {
    const clonedScene = gltf.scene.clone(true)
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
        object.frustumCulled = false
      }
    })

    return clonedScene
  }, [gltf.scene])

  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.set(0, INITIAL_AVATAR_ROTATION, 0)
    rotationControl.targetY.current = INITIAL_AVATAR_ROTATION
  }, [rotationControl.targetY])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (rotationControl.dragging.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationControl.targetY.current, 0.42)
      return
    }

    if (Math.abs(rotationControl.velocityY.current) > 0.004) {
      rotationControl.targetY.current += rotationControl.velocityY.current * delta
      rotationControl.velocityY.current *= INERTIA_DECAY
    } else {
      rotationControl.velocityY.current = 0
      rotationControl.targetY.current += delta * AUTO_ROTATION_SPEED
    }

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationControl.targetY.current, 0.18)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

function ExperimentPlatform() {
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const scanRingRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (outerRingRef.current) outerRingRef.current.rotation.z += delta * 0.22
    if (innerRingRef.current) innerRingRef.current.rotation.z -= delta * 0.34
    if (scanRingRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.1) * 0.035
      scanRingRef.current.scale.setScalar(pulse)
      scanRingRef.current.rotation.z += delta * 0.5
    }
  })

  return (
    <group position={[0, PLATFORM_BASE_Y, 0]}>
      <pointLight position={[0, 0.2, 0]} color="#67e8ff" intensity={3.4} distance={3.2} />
      <mesh receiveShadow position={[0, -0.08, 0]}>
        <cylinderGeometry args={[1.62, 1.85, 0.18, 96]} />
        <meshStandardMaterial color="#06111f" metalness={0.72} roughness={0.24} emissive="#064d68" emissiveIntensity={0.32} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.58, 96]} />
        <meshStandardMaterial color="#071525" transparent opacity={0.62} metalness={0.45} roughness={0.38} emissive="#0c7d9d" emissiveIntensity={0.18} />
      </mesh>
      <mesh ref={outerRingRef} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.54, 0.025, 14, 160]} />
        <meshStandardMaterial color="#8df3ff" emissive="#46ddff" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh ref={innerRingRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.018, 12, 128]} />
        <meshStandardMaterial color="#72a8ff" emissive="#3f7dff" emissiveIntensity={1.9} toneMapped={false} />
      </mesh>
      <mesh ref={scanRingRef} position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.16, 0.012, 10, 128]} />
        <meshStandardMaterial color="#baf7ff" emissive="#7cf3ff" emissiveIntensity={2.6} toneMapped={false} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 8
        return (
          <mesh key={angle} position={[Math.cos(angle) * 1.55, 0.18, Math.sin(angle) * 1.55]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#a9f6ff" emissive="#62e7ff" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

export function AvatarModelScene({ modelPath }: AvatarModelSceneProps) {
  const rotationControl = {
    dragging: useRef(false),
    targetY: useRef(INITIAL_AVATAR_ROTATION),
    velocityY: useRef(0),
  }
  const dragState = useRef({ x: 0, time: 0 })

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    rotationControl.dragging.current = true
    rotationControl.velocityY.current = 0
    dragState.current = { x: event.clientX, time: performance.now() }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!rotationControl.dragging.current) return
    const now = performance.now()
    const dx = event.clientX - dragState.current.x
    const dt = Math.max((now - dragState.current.time) / 1000, 0.016)
    rotationControl.targetY.current += dx * DRAG_ROTATION_SPEED
    rotationControl.velocityY.current = (dx * DRAG_ROTATION_SPEED) / dt
    dragState.current = { x: event.clientX, time: now }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    rotationControl.dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      className="avatar-model-scene"
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Canvas
        camera={{ position: [0, 0.2, 6.4], fov: 32, near: 0.1, far: 100 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true }}
        shadows
      >
        <ambientLight intensity={1.25} />
        <hemisphereLight args={[0xffffff, 0x26364d, 1.3]} />
        <directionalLight position={[3, 4, 5]} intensity={3.8} />
        <directionalLight position={[-4, 2, 3]} intensity={1.8} color="#8bd8ff" />
        <directionalLight position={[0, 3, -5]} intensity={2.2} color="#5ce4ff" />
        <ExperimentPlatform />
        <RotatingAvatar modelPath={modelPath} rotationControl={rotationControl} />
      </Canvas>
    </div>
  )
}
