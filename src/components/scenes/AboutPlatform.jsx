import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'

import { PROFILE } from '../../data/profile.js'
import { PineTree, PalmTree, GrassTuft, Flower, Rock, Mushroom, scatter } from '../../three/NatureProps.jsx'

/**
 * About: a small meadow clearing with the avatar mounted on a wooden easel
 * / picture-frame stand. Butterflies (color dots) flutter around; pine
 * trees line the back edge.
 */
export default function AboutPlatform() {
  return (
    <group>
      <Meadow />
      <PhotoFrame />
      <Butterflies />
    </group>
  )
}

function Meadow() {
  const trees = [
    { x: -6, z: -3, kind: 'pine', scale: 1.1 },
    { x: -8, z: -1, kind: 'pine', scale: 0.9 },
    { x: 6, z: -3, kind: 'pine', scale: 1.05 },
    { x: 8, z: -1, kind: 'pine', scale: 0.95 },
    { x: -5.5, z: 2, kind: 'palm', scale: 0.85 },
    { x: 5.5, z: 2, kind: 'palm', scale: 0.85 },
  ]
  const grass = scatter(34, { w: 14, h: 8 }, 21)
  const flowers = scatter(18, { w: 12, h: 7 }, 33)
  const flowerColors = ['#ffb3c1', '#ffe066', '#d3b8ff', '#ff9b7a', '#7fd0e0']
  const mushrooms = scatter(4, { w: 8, h: 5 }, 44)
  const rocks = scatter(3, { w: 10, h: 6 }, 55)

  return (
    <group>
      {trees.map((t, i) =>
        t.kind === 'pine'
          ? <PineTree key={i} position={[t.x, 0, t.z]} scale={t.scale} seed={i * 2.1} />
          : <PalmTree key={i} position={[t.x, 0, t.z]} scale={t.scale} tilt={0.05 * (i % 2 === 0 ? 1 : -1)} seed={i} />
      )}
      {grass.map((g, i) => (
        <GrassTuft key={`g-${i}`} position={[g.x, 0, g.z]} scale={g.scale * 0.6} />
      ))}
      {flowers.map((f, i) => (
        <Flower
          key={`f-${i}`}
          position={[f.x, 0, f.z]}
          color={flowerColors[i % flowerColors.length]}
          scale={f.scale * 0.9}
        />
      ))}
      {mushrooms.map((m, i) => (
        <Mushroom key={`m-${i}`} position={[m.x, 0, m.z]} scale={m.scale} />
      ))}
      {rocks.map((r, i) => (
        <Rock key={`r-${i}`} position={[r.x, r.scale * 0.3, r.z]} scale={r.scale * 0.5} />
      ))}
    </group>
  )
}

function PhotoFrame() {
  const easelRef = useRef()
  useFrame((s) => {
    if (easelRef.current) {
      easelRef.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.03
    }
  })
  return (
    <group ref={easelRef} position={[0, 0, 0]}>
      {/* Easel legs — two front, one back */}
      <mesh position={[-0.7, 0.9, 0]} rotation={[0, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#8b5a30" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.7, 0.9, 0]} rotation={[0, 0, -0.08]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#8b5a30" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.9, -0.5]} rotation={[-0.12, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#8b5a30" roughness={0.9} flatShading />
      </mesh>
      {/* Cross-support */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#a06835" roughness={0.9} flatShading />
      </mesh>
      {/* Picture frame */}
      <group position={[0, 1.85, 0]}>
        {/* Gold outer frame — a touch taller than wide for a portrait crop */}
        <mesh castShadow>
          <boxGeometry args={[1.7, 2.0, 0.14]} />
          <meshStandardMaterial color="#f2c15c" metalness={0.4} roughness={0.55} flatShading />
        </mesh>
        {/* Inner mat (behind the photo) */}
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[1.5, 1.8, 0.02]} />
          <meshStandardMaterial color="#fff4e0" roughness={0.7} flatShading />
        </mesh>

        {/* Avatar photo — Suspended so the whole scene doesn't crash if the
            texture is missing; useTexture throws until the image loads. */}
        <Suspense fallback={null}>
          <AvatarPhoto />
        </Suspense>

        {/* Name plate below the frame */}
        <mesh position={[0, -1.2, 0.08]} castShadow>
          <boxGeometry args={[1.3, 0.28, 0.06]} />
          <meshStandardMaterial color="#b17a4a" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0, -1.2, 0.115]}>
          <boxGeometry args={[1.2, 0.22, 0.02]} />
          <meshStandardMaterial color="#8b5a30" roughness={0.85} flatShading />
        </mesh>
        <Text
          position={[0, -1.19, 0.13]}
          fontSize={0.14}
          color="#fdf5e3"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {PROFILE.alias.toUpperCase()}
        </Text>
      </group>
    </group>
  )
}

function AvatarPhoto() {
  const tex = useTexture(PROFILE.avatar)
  // Preserve the photo's aspect: fit width, letterbox height, so a portrait
  // doesn't get stretched wide.
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return (
    <mesh position={[0, 0, 0.09]}>
      <planeGeometry args={[1.45, 1.75]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  )
}

function Butterflies() {
  const groupRef = useRef()
  const N = 6
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((b, i) => {
      const s = i / N
      const orbitR = 2 + Math.sin(t * 0.3 + i) * 0.4
      const angle = t * 0.5 * (i % 2 === 0 ? 1 : -1) + s * Math.PI * 2
      b.position.x = Math.cos(angle) * orbitR
      b.position.z = Math.sin(angle) * orbitR * 0.6
      b.position.y = 1.8 + Math.sin(t * 2 + i) * 0.4
      b.rotation.z = Math.sin(t * 8 + i) * 0.6
    })
  })
  const colors = ['#ffb3c1', '#ffe066', '#d3b8ff', '#ff9b7a', '#7fd0e0', '#ffb3c1']
  return (
    <group ref={groupRef}>
      {Array.from({ length: N }).map((_, i) => (
        <group key={i}>
          <mesh position={[-0.06, 0, 0]}>
            <coneGeometry args={[0.06, 0.14, 3]} />
            <meshStandardMaterial color={colors[i]} flatShading />
          </mesh>
          <mesh position={[0.06, 0, 0]}>
            <coneGeometry args={[0.06, 0.14, 3]} />
            <meshStandardMaterial color={colors[i]} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

