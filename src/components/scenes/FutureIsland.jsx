import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

import {
  IslandFoundation,
  FloatingRig,
  ISLAND_PALETTE,
} from '../../three/Island.jsx'
import {
  BroadleafTree,
  Rock,
  GrassTuft,
  GrassBlade,
  scatterGrass,
  Flower,
} from '../../three/NatureProps.jsx'

/**
 * Future Island — "to_be_continued"
 *
 * A reserved plot next to the FPT (work) island. Each company David works
 * with gets its own island in this diorama; this one is deliberately mostly
 * empty, marked by a stone plaque with a quiet invitation carved in it.
 *
 *   • Grass top, minimal props (deliberate empty feel)
 *   • Central slate plaque with "TO BE CONTINUED / your island here"
 *   • Warm stone lantern beside the plaque — welcoming light
 *   • Cherry-blossom-tinted tree in one corner
 *   • Empty pedestal in the front-right — "your logo could stand here"
 *   • Firefly-like glowing motes drifting above the ground
 */

const SIZE = 6.5
const HALF = SIZE / 2

const BLOSSOM_PINK      = '#f5b7c9'
const BLOSSOM_PINK_DEEP = '#e58aa4'
const PLAQUE_STONE      = '#7d8391'
const PLAQUE_STONE_DEEP = '#4e5461'
const LANTERN_GLOW      = '#ffce7a'

export default function FutureIsland() {
  return (
    <FloatingRig seed={6}>
      {/* Foundation — same strata as neighbouring islands so it reads as
          part of the same world, just empty on top */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: ISLAND_PALETTE.bedrockDark, height: 0.6 },
          { color: ISLAND_PALETTE.bedrock,     height: 0.5 },
          { color: ISLAND_PALETTE.rock,        height: 0.45 },
          { color: '#6d4a2c',                  height: 0.35 },
        ]}
      />

      {/* Grass top — one clean slab, no L cut-outs */}
      <GrassTop />

      {/* Scattered grass straws for texture */}
      <GrassField />

      {/* Central "For Rent"-style wooden signboard */}
      <group position={[0, 0.19, -0.6]}>
        <ForRentSign />
      </group>

      {/* Stone lantern to the plaque's right, warm glow */}
      <group position={[1.3, 0.19, -0.4]}>
        <StoneLantern />
      </group>

      {/* Cherry-blossom tree at back-left corner */}
      <BlossomTree position={[-2.4, 0.19, -2.3]} scale={0.9} seed={6.1} />

      {/* Empty pedestal at front-right — implies "your logo goes here" */}
      <group position={[1.7, 0.19, 1.4]}>
        <EmptyPedestal />
      </group>

      {/* A few rocks & flowers around the edges */}
      <Rock position={[-1.9, 0.28, 2.0]} scale={0.28} color={ISLAND_PALETTE.rock} seed={6.2} />
      <Rock position={[2.3,  0.26, -2.2]} scale={0.24} color={ISLAND_PALETTE.rockDark} seed={6.3} />
      <Rock position={[-2.6, 0.28, 1.0]}  scale={0.22} color={ISLAND_PALETTE.rock} seed={6.4} />

      <GroundDecor />

      {/* Firefly motes drifting over the empty grass */}
      <Fireflies />

      {/* Warm invitation lighting */}
      <pointLight position={[1.3, 1.5, -0.4]} intensity={0.9} color={LANTERN_GLOW} distance={5} />
      <pointLight position={[0, 3, 0]}        intensity={0.7} color="#fff2d4"       distance={8} />
      <pointLight position={[-2.4, 2, -2.3]}  intensity={0.5} color={BLOSSOM_PINK}   distance={4} />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * Grass top — a full-cover, two-tone grass slab
 * ------------------------------------------------------------------ */
function GrassTop() {
  return (
    <group position={[0, 0.09, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[SIZE, 0.18, SIZE]} />
        <meshStandardMaterial color={'#4d9b3a'} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[SIZE - 0.2, 0.02, SIZE - 0.2]} />
        <meshStandardMaterial color={'#7bb444'} roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

function GrassField() {
  const blades = scatterGrass({
    count: 80,
    bounds: { x0: -HALF + 0.2, x1: HALF - 0.2, z0: -HALF + 0.2, z1: HALF - 0.2 },
    excludes: [
      { x0: -1.2, x1: 1.2, z0: -1.6, z1: 0.4 },   // plaque
      { x0: 0.9,  x1: 1.7, z0: -0.9, z1: 0.1 },   // lantern
      { x0: 1.2,  x1: 2.3, z0: 0.9,  z1: 2.0 },   // pedestal
      { x0: -3.0, x1: -1.7, z0: -3.0, z1: -1.5 }, // tree
    ],
    y: 0.28,
    seed: 60123,
  })
  return (
    <group>
      {blades.map((b, i) => <GrassBlade key={i} {...b} />)}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * "For Rent" wooden signboard — a friendly real-estate-style hanging
 * sign. Wooden gallows post with a rectangular signboard suspended
 * from a horizontal crossbar via two short rope segments. Little bird
 * perched on top of the crossbar.
 * ------------------------------------------------------------------ */
const WOOD_LIGHT    = '#d4a066'
const WOOD_MID      = '#a06835'
const WOOD_DARK     = '#6b4423'
const SIGN_ACCENT   = '#4ec06f'   // friendly green so it matches the site palette
const SIGN_ACCENT_D = '#3a9855'

function ForRentSign() {
  // Small idle sway of the whole signboard so it feels alive
  const boardRef = useRef()
  useFrame((state) => {
    if (!boardRef.current) return
    const t = state.clock.elapsedTime
    boardRef.current.rotation.z = Math.sin(t * 0.8) * 0.03
  })
  return (
    <group>
      {/* Small dirt base at the foot of the post */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.34, 0.12, 8]} />
        <meshStandardMaterial color={ISLAND_PALETTE.soilDark} roughness={0.9} flatShading />
      </mesh>

      {/* Vertical post */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 2.1, 0.16]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} flatShading />
      </mesh>
      {/* Post highlight strip (a slightly-lighter stripe on the front) */}
      <mesh position={[0, 1.05, 0.09]}>
        <boxGeometry args={[0.06, 2.0, 0.01]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} flatShading />
      </mesh>

      {/* Horizontal crossbar at the top — a gallows-style arm */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <boxGeometry args={[1.9, 0.14, 0.16]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} flatShading />
      </mesh>
      {/* Crossbar cap ends */}
      <mesh position={[-0.95, 2.05, 0]} castShadow>
        <boxGeometry args={[0.14, 0.22, 0.22]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.95, 2.05, 0]} castShadow>
        <boxGeometry args={[0.14, 0.22, 0.22]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} flatShading />
      </mesh>

      {/* Two rope/chain segments, angled forward — reach from the crossbar's
          front-bottom edge down to the top rings of the sign. */}
      <mesh position={[-0.75, 1.84, 0.165]} rotation={[-0.545, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.36, 6]} />
        <meshStandardMaterial color={'#3d2f22'} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0.75, 1.84, 0.165]} rotation={[-0.545, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.36, 6]} />
        <meshStandardMaterial color={'#3d2f22'} roughness={0.95} flatShading />
      </mesh>
      {/* Small eye-hooks under the crossbar where the ropes attach */}
      <mesh position={[-0.75, 1.97, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.035, 0.012, 6, 10]} />
        <meshStandardMaterial color={'#efc98a'} roughness={0.4} metalness={0.7} flatShading />
      </mesh>
      <mesh position={[0.75, 1.97, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.035, 0.012, 6, 10]} />
        <meshStandardMaterial color={'#efc98a'} roughness={0.4} metalness={0.7} flatShading />
      </mesh>

      {/* The signboard itself — hangs in front of the post so the post
          never intersects the panel. Sways very gently around the
          crossbar-bottom pivot. */}
      <group ref={boardRef} position={[0, 1.98, 0]}>
        <group position={[0, -0.78, 0.25]}>
          {/* Board frame (darker wood border) */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.94, 0.09]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.85} flatShading />
          </mesh>
          {/* Colored panel — friendly green, on both faces */}
          <mesh position={[0, 0, 0.048]}>
            <boxGeometry args={[1.72, 0.78, 0.02]} />
            <meshStandardMaterial color={SIGN_ACCENT} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0, -0.048]}>
            <boxGeometry args={[1.72, 0.78, 0.02]} />
            <meshStandardMaterial color={SIGN_ACCENT_D} roughness={0.7} flatShading />
          </mesh>

          {/* FOR RENT text on the front */}
          <Text
            position={[0, 0.15, 0.065]}
            fontSize={0.28}
            color={'#ffffff'}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
            outlineWidth={0.008}
            outlineColor={'#1a3a26'}
          >
            FOR RENT
          </Text>
          {/* Divider strip */}
          <mesh position={[0, -0.06, 0.065]}>
            <boxGeometry args={[1.5, 0.03, 0.005]} />
            <meshStandardMaterial color={'#ffffff'} flatShading />
          </mesh>
          {/* Subtitle */}
          <Text
            position={[0, -0.24, 0.065]}
            fontSize={0.12}
            color={'#ffffff'}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.03}
          >
            // your logo here
          </Text>

          {/* Small ring anchor points on the top corners */}
          <mesh position={[-0.75, 0.5, 0]}>
            <torusGeometry args={[0.05, 0.015, 6, 10]} />
            <meshStandardMaterial color={'#efc98a'} roughness={0.4} metalness={0.7} flatShading />
          </mesh>
          <mesh position={[0.75, 0.5, 0]}>
            <torusGeometry args={[0.05, 0.015, 6, 10]} />
            <meshStandardMaterial color={'#efc98a'} roughness={0.4} metalness={0.7} flatShading />
          </mesh>
        </group>
      </group>

      {/* Small bird perched on the crossbar (front-facing silhouette) */}
      <Bird position={[-0.4, 2.17, 0]} />
    </group>
  )
}

/* Tiny stylised bird — body + head + beak + tail */
function Bird({ position }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    // Slight head bob — alive
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.4) * 0.05
  })
  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color={'#2b2f3a'} roughness={0.75} flatShading />
      </mesh>
      {/* Head */}
      <mesh position={[0.07, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshStandardMaterial color={'#2b2f3a'} roughness={0.75} flatShading />
      </mesh>
      {/* Beak */}
      <mesh position={[0.13, 0.08, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.02, 0.06, 5]} />
        <meshStandardMaterial color={'#e0a63a'} roughness={0.5} flatShading />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.09, -0.02, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.035, 0.09, 4]} />
        <meshStandardMaterial color={'#2b2f3a'} roughness={0.75} flatShading />
      </mesh>
      {/* Eye speck */}
      <mesh position={[0.1, 0.11, 0.045]}>
        <sphereGeometry args={[0.012, 6, 4]} />
        <meshStandardMaterial color={'#f5efe0'} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Stone lantern — Japanese-style toro. Stack of tapering blocks with a
 * warm glowing chamber. Signals invitation / welcome.
 * ------------------------------------------------------------------ */
function StoneLantern() {
  const glowRef = useRef()
  useFrame((state) => {
    if (!glowRef.current) return
    const t = state.clock.elapsedTime
    glowRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.25
  })
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.24, 6]} />
        <meshStandardMaterial color={PLAQUE_STONE_DEEP} roughness={0.9} flatShading />
      </mesh>
      {/* Column */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.62, 6]} />
        <meshStandardMaterial color={PLAQUE_STONE} roughness={0.9} flatShading />
      </mesh>
      {/* Middle disc */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.08, 6]} />
        <meshStandardMaterial color={PLAQUE_STONE_DEEP} roughness={0.9} flatShading />
      </mesh>
      {/* Glow chamber (fire box) */}
      <mesh ref={glowRef} position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial
          color={LANTERN_GLOW}
          emissive={LANTERN_GLOW}
          emissiveIntensity={1.5}
          roughness={0.5}
          flatShading
        />
      </mesh>
      {/* Roof block */}
      <mesh position={[0, 1.36, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.08, 6]} />
        <meshStandardMaterial color={PLAQUE_STONE_DEEP} roughness={0.9} flatShading />
      </mesh>
      {/* Pointy cap */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.14, 0.2, 6]} />
        <meshStandardMaterial color={PLAQUE_STONE_DEEP} roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Empty pedestal — a low circular plinth. Deliberately empty; the void
 * on top is the invitation. A soft warm disc marks the space.
 * ------------------------------------------------------------------ */
function EmptyPedestal() {
  const discRef = useRef()
  useFrame((state) => {
    if (!discRef.current) return
    discRef.current.material.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 1.4) * 0.15
  })
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.72, 0.2, 8]} />
        <meshStandardMaterial color={ISLAND_PALETTE.rock} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.16, 8]} />
        <meshStandardMaterial color={ISLAND_PALETTE.sand} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 8]} />
        <meshStandardMaterial color={ISLAND_PALETTE.sandWarm} roughness={0.85} flatShading />
      </mesh>
      {/* Pulsing warm disc on top — "your logo lives here" */}
      <mesh ref={discRef} position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.02, 24]} />
        <meshBasicMaterial color={LANTERN_GLOW} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Cherry-blossom tree — reused BroadleafTree branches but with pink
 * foliage overlays for a "seasonal" invitation feel.
 * ------------------------------------------------------------------ */
function BlossomTree({ position, scale, seed }) {
  return (
    <group position={position} scale={scale}>
      <BroadleafTree seed={seed} />
      {/* Blossom overlays — small pink spheres above the tree's foliage */}
      <group position={[0, 2.3, 0]}>
        {BLOSSOMS.map((b, i) => (
          <mesh key={i} position={b.p}>
            <icosahedronGeometry args={[b.r, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? BLOSSOM_PINK : BLOSSOM_PINK_DEEP}
              roughness={0.75}
              flatShading
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

const BLOSSOMS = [
  { p: [-0.28, 0.2, 0.1],  r: 0.28 },
  { p: [0.25,  0.35, -0.05], r: 0.32 },
  { p: [0.05,  0.55, 0.25],  r: 0.24 },
  { p: [-0.15, 0.45, -0.28], r: 0.22 },
  { p: [0.35,  -0.05, 0.28], r: 0.22 },
  { p: [-0.32, 0.1, -0.22],  r: 0.20 },
]

/* ------------------------------------------------------------------ *
 * Fireflies — small glowing motes drifting slowly above the grass.
 * Adds movement to an otherwise-quiet island.
 * ------------------------------------------------------------------ */
function Fireflies() {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < 12; i++) {
      arr.push({
        base: [
          (Math.random() - 0.5) * 5.5,
          0.8 + Math.random() * 1.5,
          (Math.random() - 0.5) * 5.5,
        ],
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.8,
      })
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.children.forEach((child, i) => {
      const p = positions[i]
      child.position.x = p.base[0] + Math.sin(t * p.speed + p.phase) * 0.5
      child.position.y = p.base[1] + Math.sin(t * p.speed * 1.3 + p.phase) * 0.2
      child.position.z = p.base[2] + Math.cos(t * p.speed + p.phase) * 0.5
      const opacity = 0.35 + Math.sin(t * 2 + p.phase) * 0.25
      if (child.material) child.material.opacity = opacity
    })
  })

  return (
    <group ref={ref}>
      {positions.map((p, i) => (
        <mesh key={i} position={p.base}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color={LANTERN_GLOW} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Sparse ground decor — a couple flowers, a couple tufts, nothing more.
 * Deliberately quiet to reinforce the "reserved / waiting" feel.
 * ------------------------------------------------------------------ */
function GroundDecor() {
  const flowers = [
    { p: [-1.5, 0.19, 1.6], c: BLOSSOM_PINK },
    { p: [-0.6, 0.19, 2.4], c: '#ffe066' },
    { p: [2.0,  0.19, -0.6], c: BLOSSOM_PINK_DEEP },
    { p: [-2.4, 0.19, -0.8], c: '#d3b8ff' },
    { p: [0.2,  0.19, 2.6],  c: BLOSSOM_PINK },
  ]
  return (
    <group>
      {flowers.map((f, i) => (
        <Flower key={i} position={f.p} color={f.c} scale={0.65} />
      ))}
      <GrassTuft position={[-2.2, 0.19, 1.6]} scale={0.55} />
      <GrassTuft position={[2.4,  0.19, 0.4]} scale={0.55} />
      <GrassTuft position={[-0.4, 0.19, -2.4]} scale={0.55} />
      <GrassTuft position={[2.6,  0.19, 2.4]} scale={0.55} />
    </group>
  )
}
