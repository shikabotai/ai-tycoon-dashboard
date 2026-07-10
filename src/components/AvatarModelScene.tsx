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
    groupRef.current.rotation.y += delta * 0.34
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene} />
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
        <RotatingAvatar modelPath={modelPath} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/avatar/control-center-avatar.glb')
