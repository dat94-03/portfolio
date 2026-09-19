import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import {
  IslandFoundation,
  FloatingRig,
  ISLAND_PALETTE,
} from '../../three/Island.jsx'
import {
  PineTree,
  Rock,
  GrassTuft,
  GrassBlade,
  scatterGrass,
  Flower,
} from '../../three/NatureProps.jsx'
import { SKILL_GROUPS } from '../../data/skills.js'

/**
 * Skills Island — "The Arsenal."
 *
 * A slate-grey observatory platform with a central obelisk. Seven glowing
 * skill orbs orbit at three altitudes above the platform, each colour-coded
 * for a skill group (cloud, governance, IaC, containers, monitoring,
 * languages, databases). The scene reads as a "constellation" viewpoint —
 * a night-sky-in-daylight feel — flanked by pine trees.
 */

const SIZE = 6.5
const HALF = SIZE / 2

// Fallback colour palette if data doesn't include one
const GROUP_COLORS = [
  '#4b9cd3',  // cloud - AWS blue
  '#f26c6c',  // governance - red
  '#8b5cf6',  // IaC - purple
  '#22c55e',  // containers - green
  '#f59e0b',  // monitoring - amber
  '#06b6d4',  // languages - cyan
  '#ec4899',  // databases - pink
]

export default function SkillsIsland() {
  return (
    <FloatingRig seed={4}>
      {/* Foundation — stone/slate strata */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: ISLAND_PALETTE.bedrockDark, height: 0.6 },
          { color: ISLAND_PALETTE.bedrock,     height: 0.5 },
          { color: '#6b6d78',                  height: 0.45 },
          { color: '#8b8d99',                  height: 0.35 },
        ]}
      />

      {/* Circular slate observatory platform on top */}
      <ObservatoryPlatform />

      {/* Concentric rune rings */}
      <RuneRings />

      {/* Central obelisk with a glowing top gem */}
      <group position={[0, 0.36, 0]}>
        <Obelisk />
      </group>

      {/* Orbiting skill orbs */}
      <OrbitingOrbs />

      {/* Pine trees at the corners */}
      <PineTree position={[-2.6, 0.18, -2.6]} scale={0.85} seed={4.1} />
      <PineTree position={[2.6, 0.18, -2.6]}  scale={0.9}  seed={4.2} />
      <PineTree position={[-2.6, 0.18, 2.5]}  scale={0.75} seed={4.3} />
      <PineTree position={[2.6, 0.18, 2.5]}   scale={0.8}  seed={4.4} />

      {/* Grass at the corners (where the slate doesn't cover) */}
      <CornerGrass />

      {/* Small crystalline rocks scattered around */}
      <Rock position={[-1.9, 0.28, 2.2]} scale={0.28} color={'#5f7188'} seed={4.5} />
      <Rock position={[1.9,  0.28, 2.2]} scale={0.32} color={'#3f5878'} seed={4.6} />
      <Rock position={[-2.2, 0.26, -1.5]} scale={0.22} color={'#5f7188'} seed={4.7} />
      <Rock position={[2.2,  0.28, -1.8]} scale={0.30} color={'#3f5878'} seed={4.8} />

      {/* Focused observatory lighting */}
      <pointLight position={[0, 5, 0]}   intensity={1.4} color="#ffffff" distance={12} />
      <pointLight position={[0, 2.4, 0]} intensity={0.7} color="#8fd4ff" distance={4} />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * Observatory platform — a circular slate disc on top of the cube,
 * with a slightly-brighter inner ring highlight.
 * ------------------------------------------------------------------ */
function ObservatoryPlatform() {
  return (
    <group position={[0, 0.10, 0]}>
      {/* Outer slate ring */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[3.0, 3.0, 0.16, 32]} />
        <meshStandardMaterial color="#5f6572" roughness={0.85} flatShading />
      </mesh>
      {/* Inner disc — lighter shade */}
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[2.6, 2.6, 0.04, 32]} />
        <meshStandardMaterial color="#7a808c" roughness={0.85} flatShading />
      </mesh>
      {/* Center circle — subtle emissive gold */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.03, 32]} />
        <meshStandardMaterial
          color="#b48a3a"
          emissive="#ffce6a"
          emissiveIntensity={0.35}
          roughness={0.5}
          flatShading
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Rune rings — three thin glowing rings on the slate, each concentric.
 * ------------------------------------------------------------------ */
function RuneRings() {
  const ringRef = useRef()
  useFrame((state) => {
    if (!ringRef.current) return
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.2
  })
  return (
    <group ref={ringRef} position={[0, 0.24, 0]}>
      {[1.3, 1.9, 2.4].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.04, r, 48]} />
          <meshBasicMaterial
            color={i === 0 ? '#a6e3a1' : i === 1 ? '#89b4fa' : '#f5c86a'}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Central obelisk — a tapered rectangular prism with a floating gem
 * at the tip.
 * ------------------------------------------------------------------ */
function Obelisk() {
  const gemRef = useRef()
  useFrame((state) => {
    if (!gemRef.current) return
    const t = state.clock.elapsedTime
    gemRef.current.rotation.y = t * 0.6
    gemRef.current.position.y = 2.7 + Math.sin(t * 1.6) * 0.06
  })
  return (
    <group>
      {/* Base plinth — square */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.3, 1.05]} />
        <meshStandardMaterial color="#4a4e5a" roughness={0.9} flatShading />
      </mesh>
      {/* Second plinth — slightly smaller */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.85, 0.15, 0.85]} />
        <meshStandardMaterial color="#5f6572" roughness={0.9} flatShading />
      </mesh>
      {/* Obelisk shaft — tapered */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.35, 2.0, 4]} />
        <meshStandardMaterial color="#6a707c" roughness={0.7} flatShading />
      </mesh>
      {/* Small pyramid cap */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[0.16, 0.28, 4]} />
        <meshStandardMaterial color="#5a606c" roughness={0.6} flatShading />
      </mesh>
      {/* Floating gem — icosahedron */}
      <mesh ref={gemRef} position={[0, 2.7, 0]}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#89b4fa"
          emissive="#89b4fa"
          emissiveIntensity={0.75}
          roughness={0.15}
          metalness={0.4}
          flatShading
        />
      </mesh>
      {/* Halo under the gem */}
      <mesh position={[0, 2.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.35, 32]} />
        <meshBasicMaterial color="#89b4fa" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Orbiting orbs — one per skill group, each on its own orbit radius,
 * altitude, and phase. Colored by group index.
 * ------------------------------------------------------------------ */
function OrbitingOrbs() {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.15
  })

  const groups = (SKILL_GROUPS && SKILL_GROUPS.length) ? SKILL_GROUPS : DEFAULT_GROUPS
  const count = Math.min(groups.length, 7)

  const orbs = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    // Alternating radius + altitude for a spatial constellation feel
    const radius = 1.9 + (i % 3) * 0.35
    const altitude = 1.3 + ((i * 0.6) % 1.6)
    orbs.push({
      key: groups[i].id || i,
      label: groups[i].title || groups[i].name || `Skill ${i}`,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
      pos: [Math.cos(angle) * radius, altitude, Math.sin(angle) * radius],
      phase: i * 0.7,
    })
  }

  return (
    <group ref={ref} position={[0, 0.36, 0]}>
      {orbs.map((o) => (
        <SkillOrb key={o.key} {...o} />
      ))}
    </group>
  )
}

const DEFAULT_GROUPS = [
  { id: 'cloud',      title: 'Cloud' },
  { id: 'governance', title: 'Governance' },
  { id: 'iac',        title: 'IaC & CI/CD' },
  { id: 'containers', title: 'Containers' },
  { id: 'monitoring', title: 'Monitoring' },
  { id: 'languages',  title: 'Languages' },
  { id: 'databases',  title: 'Databases' },
]

function SkillOrb({ pos, color, phase }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = pos[1] + Math.sin(t * 1.4 + phase) * 0.08
    ref.current.rotation.y = t * 0.8 + phase
  })
  return (
    <group ref={ref} position={pos}>
      {/* Faceted orb */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.25}
          metalness={0.35}
          flatShading
        />
      </mesh>
      {/* Halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.38, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Downward light-cone hint */}
      <mesh position={[0, -0.15, 0]}>
        <coneGeometry args={[0.12, 0.24, 6, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Corner grass — the slate disc doesn't cover the whole cube top, so
 * fill the exposed corners with grass tufts + blades.
 * ------------------------------------------------------------------ */
function CornerGrass() {
  const blades = scatterGrass({
    count: 45,
    bounds: { x0: -HALF + 0.2, x1: HALF - 0.2, z0: -HALF + 0.2, z1: HALF - 0.2 },
    // Skip the whole slate disc — radius 3.0 from center
    excludes: [{ x0: -3.0, x1: 3.0, z0: -3.0, z1: 3.0 }],
    y: 0.28,
    seed: 44321,
  }).filter(({ position: [x, , z] }) => Math.hypot(x, z) > 2.9)

  const flowers = [
    { p: [-2.6, 0.19, 0.4],   c: '#ffb3c1' },
    { p: [2.6,  0.19, -0.3],  c: '#ffe066' },
    { p: [0.2,  0.19, -2.7],  c: '#d3b8ff' },
    { p: [-0.4, 0.19, 2.7],   c: '#ff9b7a' },
  ]

  return (
    <group>
      {blades.map((b, i) => <GrassBlade key={i} {...b} />)}
      {flowers.map((f, i) => <Flower key={i} position={f.p} color={f.c} scale={0.6} />)}
      <GrassTuft position={[-2.7, 0.19, 1.5]} scale={0.55} />
      <GrassTuft position={[2.5, 0.19, 1.2]}  scale={0.55} />
      <GrassTuft position={[-1.4, 0.19, -2.7]} scale={0.55} />
      <GrassTuft position={[1.3, 0.19, 2.7]}  scale={0.55} />
    </group>
  )
}
