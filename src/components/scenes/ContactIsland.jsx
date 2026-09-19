import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

import {
  IslandFoundation,
  FloatingRig,
} from '../../three/Island.jsx'
import { SOCIALS } from '../../data/socials.js'
import { Icon } from '../ui/Icons.jsx'

/**
 * Contact Island — cyberpunk signal beacon.
 *
 * A dark metallic platform with neon-grid tiles and a central obelisk
 * antenna. Social-icon holograms orbit slowly around the antenna at
 * varying altitudes; each hologram is a real anchor tag (via drei
 * <Html transform>) so a click opens the linked profile in a new tab.
 */

const SIZE = 6.5
const HALF = SIZE / 2

const NEON_MAGENTA = '#ff2bd6'
const NEON_CYAN    = '#12e6f0'
const NEON_PURPLE  = '#7f4dff'

export default function ContactIsland() {
  return (
    <FloatingRig seed={7}>
      {/* Dark tech-block foundation */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: '#0a0d14', height: 0.6 },
          { color: '#141824', height: 0.5 },
          { color: '#1a1f2e', height: 0.45 },
          { color: '#252c40', height: 0.35 },
        ]}
      />

      {/* Neon-grid tile plate on top */}
      <NeonGridTop />

      {/* Neon strip lights running along the top edges */}
      <NeonEdges />

      {/* Central obelisk antenna with rotating rings & pulsing tip */}
      <group position={[0, 0.28, 0]}>
        <CentralAntenna />
      </group>

      {/* Floating clickable social holograms orbiting the antenna */}
      <OrbitingSocials />

      {/* Small holo pylons at the corners */}
      <HoloPylon position={[-2.6, 0.28, -2.6]} tint={NEON_MAGENTA} />
      <HoloPylon position={[ 2.6, 0.28, -2.6]} tint={NEON_CYAN} />
      <HoloPylon position={[-2.6, 0.28,  2.6]} tint={NEON_CYAN} />
      <HoloPylon position={[ 2.6, 0.28,  2.6]} tint={NEON_MAGENTA} />

      {/* Neon accent lighting */}
      <pointLight position={[0, 4, 0]}    intensity={1.6} color={NEON_CYAN}    distance={12} />
      <pointLight position={[-3, 2, -3]}  intensity={0.9} color={NEON_MAGENTA} distance={7} />
      <pointLight position={[3, 2, 3]}    intensity={0.9} color={NEON_MAGENTA} distance={7} />
      <pointLight position={[3, 2, -3]}   intensity={0.7} color={NEON_PURPLE}  distance={6} />
      <pointLight position={[-3, 2, 3]}   intensity={0.7} color={NEON_PURPLE}  distance={6} />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * Neon-grid tile plate — a dark metal top with a grid of thin
 * emissive lines (cyan) drawn on it.
 * ------------------------------------------------------------------ */
function NeonGridTop() {
  const lineCount = 8
  const step = SIZE / lineCount

  const lines = []
  for (let i = 0; i <= lineCount; i++) {
    const p = -HALF + i * step
    // Horizontal (along X)
    lines.push({ key: `x${i}`, pos: [0, 0.12, p], size: [SIZE, 0.012, 0.02] })
    // Vertical (along Z)
    lines.push({ key: `z${i}`, pos: [p, 0.12, 0], size: [0.02, 0.012, SIZE] })
  }

  return (
    <group position={[0, 0.09, 0]}>
      {/* Base metal plate */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[SIZE, 0.18, SIZE]} />
        <meshStandardMaterial color={'#161b28'} roughness={0.5} metalness={0.4} flatShading />
      </mesh>
      {/* Slightly-brighter inner tile */}
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[SIZE - 0.2, 0.02, SIZE - 0.2]} />
        <meshStandardMaterial color={'#1e2436'} roughness={0.5} metalness={0.4} flatShading />
      </mesh>
      {/* Emissive neon grid lines */}
      {lines.map((l) => (
        <mesh key={l.key} position={l.pos}>
          <boxGeometry args={l.size} />
          <meshStandardMaterial
            color={NEON_CYAN}
            emissive={NEON_CYAN}
            emissiveIntensity={1.4}
            toneMapped={false}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Neon edge strips — glowing magenta lines wrapping the top of the
 * platform's foundation for that circuit-board silhouette.
 * ------------------------------------------------------------------ */
function NeonEdges() {
  const edgeY = 0.18
  const edges = [
    { pos: [0,        edgeY, -HALF], size: [SIZE, 0.03, 0.03] },
    { pos: [0,        edgeY,  HALF], size: [SIZE, 0.03, 0.03] },
    { pos: [-HALF,    edgeY, 0],     size: [0.03, 0.03, SIZE] },
    { pos: [ HALF,    edgeY, 0],     size: [0.03, 0.03, SIZE] },
  ]
  return (
    <group>
      {edges.map((e, i) => (
        <mesh key={i} position={e.pos}>
          <boxGeometry args={e.size} />
          <meshStandardMaterial
            color={NEON_MAGENTA}
            emissive={NEON_MAGENTA}
            emissiveIntensity={1.6}
            toneMapped={false}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Central antenna — dark obelisk with three glowing rings that spin,
 * capped with a pulsing beacon at the tip.
 * ------------------------------------------------------------------ */
function CentralAntenna() {
  const ringsRef = useRef()
  const beaconRef = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringsRef.current) ringsRef.current.rotation.y = t * 0.8
    if (beaconRef.current) {
      beaconRef.current.material.emissiveIntensity = 2.0 + Math.sin(t * 3) * 0.6
    }
  })
  return (
    <group>
      {/* Broad plinth */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.05, 0.24, 8]} />
        <meshStandardMaterial color={'#181d2c'} roughness={0.55} metalness={0.5} flatShading />
      </mesh>
      {/* Tapered obelisk */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.32, 2.4, 5]} />
        <meshStandardMaterial color={'#1c2337'} roughness={0.4} metalness={0.6} flatShading />
      </mesh>
      {/* Emissive stripe running up the obelisk */}
      <mesh position={[0, 1.4, 0.14]}>
        <boxGeometry args={[0.05, 2.0, 0.01]} />
        <meshStandardMaterial
          color={NEON_CYAN}
          emissive={NEON_CYAN}
          emissiveIntensity={1.6}
          toneMapped={false}
          flatShading
        />
      </mesh>

      {/* Three counter-rotating neon rings */}
      <group ref={ringsRef} position={[0, 1.2, 0]}>
        {[
          { r: 1.0, color: NEON_MAGENTA, y: 0,    tilt: 0.2  },
          { r: 0.8, color: NEON_CYAN,    y: 0.4,  tilt: -0.5 },
          { r: 1.2, color: NEON_PURPLE,  y: -0.3, tilt: 0.6  },
        ].map((r, i) => (
          <mesh
            key={i}
            position={[0, r.y, 0]}
            rotation={[Math.PI / 2 + r.tilt, 0, 0]}
          >
            <torusGeometry args={[r.r, 0.02, 6, 48]} />
            <meshStandardMaterial
              color={r.color}
              emissive={r.color}
              emissiveIntensity={1.5}
              toneMapped={false}
              flatShading
            />
          </mesh>
        ))}
      </group>

      {/* Pulsing beacon at the tip */}
      <mesh ref={beaconRef} position={[0, 2.65, 0]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color={NEON_CYAN}
          emissive={NEON_CYAN}
          emissiveIntensity={2.0}
          toneMapped={false}
          flatShading
        />
      </mesh>
      {/* Beacon halo */}
      <mesh position={[0, 2.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.36, 32]} />
        <meshBasicMaterial color={NEON_CYAN} transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Orbiting social holograms — each social is a clickable holo-panel
 * that opens its URL in a new tab. The whole rig rotates slowly around
 * the central antenna; each panel bobs with its own phase.
 * ------------------------------------------------------------------ */
function OrbitingSocials() {
  const groupRef = useRef()
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.12
  })

  const count = SOCIALS.length
  return (
    <group ref={groupRef} position={[0, 0.36, 0]}>
      {SOCIALS.map((s, i) => {
        const angle = (i / count) * Math.PI * 2
        // Alternate radius + altitude for a "constellation" spread
        const radius   = 2.2 + (i % 2 === 0 ? 0.15 : -0.15)
        const altitude = 1.4 + ((i * 0.35) % 1.2)
        return (
          <SocialHolo
            key={s.id}
            social={s}
            position={[Math.cos(angle) * radius, altitude, Math.sin(angle) * radius]}
            phase={i * 0.7}
          />
        )
      })}
    </group>
  )
}

function SocialHolo({ social, position, phase }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * 1.4 + phase) * 0.08
    // Counter-rotate against the parent's rotation so panels stay
    // roughly camera-facing (crude billboard — good enough for the vibe)
    ref.current.rotation.y = -t * 0.12
  })

  const disabled = social.url === '#'
  return (
    <group ref={ref} position={position}>
      {/* Small emissive stem beneath the panel — a "holo emitter" */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.14, 6]} />
        <meshStandardMaterial
          color={NEON_CYAN}
          emissive={NEON_CYAN}
          emissiveIntensity={1.2}
          toneMapped={false}
          flatShading
        />
      </mesh>
      {/* Emitter base disc */}
      <mesh position={[0, -0.33, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 12]} />
        <meshStandardMaterial color={'#242a3d'} roughness={0.5} metalness={0.6} flatShading />
      </mesh>

      {/* The clickable holo panel — real HTML anchor via drei Html */}
      <Html
        transform
        occlude={false}
        distanceFactor={5}
        pointerEvents="auto"
        style={{ pointerEvents: 'auto' }}
      >
        <a
          href={disabled ? undefined : social.url}
          target={social.url.startsWith('mailto:') ? undefined : '_blank'}
          rel={social.url.startsWith('mailto:') ? undefined : 'noreferrer'}
          className={`cyber-icon ${disabled ? 'disabled' : ''}`}
          title={social.label}
          onClick={(e) => { if (disabled) e.preventDefault() }}
        >
          <Icon name={social.icon} />
          <span className="cyber-icon-label">{social.label}</span>
        </a>
      </Html>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Holo pylons — small corner totems that just add cyberpunk decor.
 * Each is a short obelisk topped with a pulsing neon cube.
 * ------------------------------------------------------------------ */
function HoloPylon({ position, tint }) {
  const gemRef = useRef()
  useFrame((state) => {
    if (!gemRef.current) return
    const t = state.clock.elapsedTime
    gemRef.current.material.emissiveIntensity = 1.6 + Math.sin(t * 2.5 + position[0]) * 0.5
    gemRef.current.rotation.y = t * 1.2
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.3, 0.34]} />
        <meshStandardMaterial color={'#181d2c'} roughness={0.5} metalness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.18, 0.4, 0.18]} />
        <meshStandardMaterial color={'#1c2337'} roughness={0.4} metalness={0.7} flatShading />
      </mesh>
      <mesh ref={gemRef} position={[0, 0.85, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial
          color={tint}
          emissive={tint}
          emissiveIntensity={1.6}
          toneMapped={false}
          flatShading
        />
      </mesh>
    </group>
  )
}
