import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'

import { PROFILE } from '../../data/profile.js'
import { SOCIALS } from '../../data/socials.js'
import { PalmTree, GrassTuft, Flower, Rock } from '../../three/NatureProps.jsx'

/**
 * Contact: a small tropical island with a wooden signal-tower / lighthouse
 * beacon. Paper airplanes (or origami birds) carrying social names orbit
 * around it. Contact card floats to the right.
 */
export default function ContactSignal() {
  return (
    <group>
      <IslandBase />
      <SignalTower />
      <PaperPlanesOrbit />
      <ContactCard />
    </group>
  )
}

function IslandBase() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.3, 14]} />
        <meshStandardMaterial color="#a8d95f" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[3.5, 3.9, 0.15, 14]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.9} flatShading />
      </mesh>
      {/* Palms */}
      <PalmTree position={[-2.2, 0.25, -1.2]} scale={0.9} tilt={0.1} seed={0.4} />
      <PalmTree position={[2.2, 0.25, -1.2]} scale={0.9} tilt={-0.1} seed={0.9} />
      <PalmTree position={[-2.6, 0.25, 1.2]} scale={0.8} tilt={0.06} seed={1.4} />
      {/* Rocks */}
      <Rock position={[1.8, 0.4, 1.3]} scale={0.45} />
      <Rock position={[-2.5, 0.35, 0.4]} scale={0.35} color="#d4b98a" />
      {/* Grass + flowers */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <group key={i}>
            <GrassTuft
              position={[Math.cos(a) * 2.5, 0.2, Math.sin(a) * 2.5]}
              scale={0.7}
            />
            <Flower
              position={[Math.cos(a + 0.3) * 2.2, 0.2, Math.sin(a + 0.3) * 2.2]}
              color={['#ffb3c1', '#ffe066', '#d3b8ff', '#ff9b7a'][i % 4]}
              scale={0.8}
            />
          </group>
        )
      })}
    </group>
  )
}

function SignalTower() {
  const beamRef = useRef()
  useFrame((s) => {
    if (beamRef.current) beamRef.current.rotation.y = s.clock.elapsedTime * 0.7
  })
  return (
    <group position={[0, 0.25, 0]}>
      {/* Wooden platform */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.15, 8]} />
        <meshStandardMaterial color="#b17a4a" roughness={0.85} flatShading />
      </mesh>
      {/* Three support beams */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.55, 1.2, Math.sin(a) * 0.55]}
            rotation={[0, a, 0.12]}
            castShadow
          >
            <cylinderGeometry args={[0.06, 0.09, 2.0, 6]} />
            <meshStandardMaterial color="#8b5a30" flatShading />
          </mesh>
        )
      })}
      {/* Upper platform */}
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.12, 8]} />
        <meshStandardMaterial color="#a06835" roughness={0.85} flatShading />
      </mesh>
      {/* Lantern housing */}
      <mesh position={[0, 2.65, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#fff4e0" roughness={0.5} flatShading />
      </mesh>
      {/* Flame / signal light */}
      <mesh position={[0, 2.65, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial
          color="#ffe066"
          emissive="#ffb84d"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* Rotating beam */}
      <group ref={beamRef} position={[0, 2.65, 0]}>
        <mesh position={[0.8, 0, 0]}>
          <coneGeometry args={[0.4, 1.6, 3, 1, true]} />
          <meshBasicMaterial color="#ffe066" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.8, 0, 0]} rotation={[0, Math.PI, 0]}>
          <coneGeometry args={[0.4, 1.6, 3, 1, true]} />
          <meshBasicMaterial color="#ffe066" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Roof */}
      <mesh position={[0, 3.15, 0]}>
        <coneGeometry args={[0.42, 0.5, 4]} />
        <meshStandardMaterial color="#c94d3a" roughness={0.7} flatShading />
      </mesh>
      {/* Point light for the beacon */}
      <pointLight position={[0, 2.65, 0]} intensity={0.9} distance={6} color="#ffdd88" />
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Paper planes carrying social labels, orbiting the tower
 * ------------------------------------------------------------------ */
function PaperPlanesOrbit() {
  const groupRef = useRef()
  useFrame((s) => {
    if (groupRef.current) groupRef.current.rotation.y = s.clock.elapsedTime * 0.15
  })

  const inner = SOCIALS.slice(0, 5)
  const outer = SOCIALS.slice(5)

  return (
    <group ref={groupRef} position={[0, 3.2, 0]}>
      {inner.map((s, i) => {
        const a = (i / inner.length) * Math.PI * 2
        return <PaperPlane key={s.id} label={s.label} position={[Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6]} />
      })}
      {outer.map((s, i) => {
        const a = (i / outer.length) * Math.PI * 2 + Math.PI / 6
        return (
          <PaperPlane
            key={s.id}
            label={s.label}
            position={[Math.cos(a) * 3.8, 0.4 + Math.sin(a) * 0.3, Math.sin(a) * 3.8]}
          />
        )
      })}
    </group>
  )
}

function PaperPlane({ label, position }) {
  const ref = useRef()
  useFrame((s) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 2) * 0.15
  })
  return (
    <group position={position} ref={ref}>
      {/* Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.14, 0.5, 3]} />
        <meshStandardMaterial color="#fff4e0" roughness={0.7} flatShading />
      </mesh>
      {/* Wing */}
      <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.4, 3]} />
        <meshStandardMaterial color="#d9eefa" flatShading />
      </mesh>
      <Text
        position={[0, 0.28, 0]}
        fontSize={0.11}
        color="#2d3e50"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#fff4e0"
      >
        {label}
      </Text>
    </group>
  )
}

function ContactCard() {
  // Wooden "postcard" board with pinned notes — pure R3F, always renders
  const rows = [
    { k: 'NAME',  v: `${PROFILE.name} — ${PROFILE.alias}` },
    { k: 'ROLE',  v: PROFILE.role },
    { k: 'EMAIL', v: PROFILE.email },
    { k: 'PHONE', v: PROFILE.phone },
    { k: 'WHERE', v: PROFILE.location },
  ]
  return (
    <group position={[3.6, 2.9, 1.6]} rotation={[0, -0.35, 0]}>
      {/* Post — a tall stake */}
      <mesh position={[-1.3, -1.6, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 3.6, 6]} />
        <meshStandardMaterial color="#8b5a30" flatShading />
      </mesh>
      {/* Board */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.8, 0.1]} />
        <meshStandardMaterial color="#fdf5e3" roughness={0.8} flatShading />
      </mesh>
      {/* Board border planks */}
      <mesh position={[0, 0.87, 0.02]}>
        <boxGeometry args={[2.6, 0.14, 0.12]} />
        <meshStandardMaterial color="#b17a4a" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, -0.87, 0.02]}>
        <boxGeometry args={[2.6, 0.14, 0.12]} />
        <meshStandardMaterial color="#b17a4a" roughness={0.85} flatShading />
      </mesh>
      {/* Title */}
      <Text
        position={[0, 0.6, 0.06]}
        fontSize={0.14}
        color="#4d9b3a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
        fontWeight="bold"
      >
        // SIGNAL
      </Text>
      {/* Rows */}
      {rows.map((r, i) => {
        const y = 0.32 - i * 0.22
        return (
          <group key={r.k}>
            <Text
              position={[-1.05, y, 0.06]}
              fontSize={0.08}
              color="#8b7355"
              anchorX="left"
              anchorY="middle"
              letterSpacing={0.16}
            >
              {r.k}
            </Text>
            <Text
              position={[-0.55, y, 0.06]}
              fontSize={0.11}
              color="#3d2914"
              anchorX="left"
              anchorY="middle"
              maxWidth={2.0}
            >
              {r.v}
            </Text>
          </group>
        )
      })}
      {/* Little pin */}
      <mesh position={[0.9, 0.7, 0.08]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#ff9b7a" flatShading />
      </mesh>
    </group>
  )
}
