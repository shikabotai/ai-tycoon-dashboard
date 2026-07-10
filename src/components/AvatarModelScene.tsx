import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type AvatarModelSceneProps = {
  modelPath: string
}

function RotatingAvatar({ modelPath }: AvatarModelSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF(modelPath)

  const { scene, position, scale } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true)
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
        object.frustumCulled = false
      }
    })

    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const modelScale = 3.2 / maxDim

    return {
      scene: clonedScene,
      position: new THREE.Vector3(-center.x * modelScale, -center.y * modelScale - 0.65, -center.z * modelScale),
      scale: modelScale,
    }
  }, [gltf.scene])

  useEffect(() => {
    groupRef.current?.rotation.set(0, -0.22, 0)
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.16
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

function ExperimentPlatform() {
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const scanRingRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (outerRingRef.current) outerRingRef.current.rotation.z += delta * 0.22
    if (innerRingRef.current) innerRingRef.current.rotation.z -= delta * 0.34
    if (haloRef.current) haloRef.current.rotation.y += delta * 0.18
    if (scanRingRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.1) * 0.035
      scanRingRef.current.scale.setScalar(pulse)
      scanRingRef.current.rotation.z += delta * 0.5
    }
  })

  return (
    <group position={[0, -1.55, 0]}>
      <pointLight position={[0, 0.28, 0]} color="#67e8ff" intensity={4.8} distance={4.2} />
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
      <group ref={haloRef} position={[0, 0.62, 0]}>
        <mesh rotation={[Math.PI / 2, 0.16, 0]}>
          <torusGeometry args={[1.18, 0.01, 8, 128]} />
          <meshStandardMaterial color="#c8fbff" transparent opacity={0.52} emissive="#7cf3ff" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, -0.22, 0]}>
          <torusGeometry args={[0.58, 0.008, 8, 96]} />
          <meshStandardMaterial color="#8bb8ff" transparent opacity={0.44} emissive="#4b8dff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.72, 1.18, 1.55, 64, 1, true]} />
        <meshBasicMaterial color="#79efff" transparent opacity={0.055} side={THREE.DoubleSide} depthWrite={false} />
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
  return (
    <div className="avatar-model-scene" aria-hidden="true">
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
        <RotatingAvatar modelPath={modelPath} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/avatar/control-center-avatar.glb')
