import * as THREE from 'three'

import PolyMedal from '../../three/PolyMedal.jsx'
import KhueVanCac from '../../three/KhueVanCac.jsx'
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
  LilyPad,
} from '../../three/NatureProps.jsx'

/**
 * Medal Island — a rectangular-solid diorama:
 *   • Four-strata cube foundation (bedrock → rock → soil-dark → soil)
 *   • Top surface is an **L-shaped brown soil ground**, with the empty
 *     corner cut out to hold a **pond** of turquoise water dotted with
 *     lily pads and dark-blue polished stones along the edge.
 *   • Stone pedestal with the floating rotating HUST medal (left of L)
 *   • Khuê Văn Các pavilion (right of L)
 *   • Low-poly broadleaf trees at the corners
 */

// Top-surface geometry — using object-space coordinates centered on origin.
const SIZE = 6.5           // island footprint
const HALF = SIZE / 2      // 3.25
const POND = {
  // Pond occupies the front-right corner
  x0: 0.5, x1: HALF,       // pond X range = 0.5 .. 3.25 (width 2.75)
  z0: 0.5, z1: HALF,       // pond Z range = 0.5 .. 3.25 (depth 2.75)
}

const GRASS_COLOR     = '#5aa73a'
const GRASS_HIGHLIGHT = '#7bb444'
const WATER_COLOR     = '#5fc7d1'
const WATER_DEEP      = '#3c96a5'
const POND_FLOOR      = '#7a5230'
const ROCK_BLUE       = '#37536e'
const ROCK_BLUE_DEEP  = '#26374b'

export default function EducationIsland() {
  return (
    <FloatingRig seed={2}>
      {/* Foundation — clean rectangular solid, four strata visible */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: ISLAND_PALETTE.bedrockDark, height: 0.6 },
          { color: ISLAND_PALETTE.bedrock,     height: 0.5 },
          { color: ISLAND_PALETTE.rock,        height: 0.45 },
          { color: '#6d4a2c',                  height: 0.35 },  // topsoil layer
        ]}
      />

      {/* Raised L-shape grass ground on top of the cube */}
      <LShapeGround />

      {/* Pond in the front-right corner */}
      <Pond />

      {/* Decorative lily pads and rocks in / around the pond */}
      <PondLife />

      {/* Dense grass straws sticking up from the lawn */}
      <GrassField />

      {/* Central stone pedestal + floating medal (on the L, back-left) */}
      <group position={[-1.5, 0.18, -1.5]}>
        <StonePedestal />
        <group position={[0, 2.75, 0]} scale={1.275}>
          <PolyMedal withBox={false} />
        </group>
        {/* Warm glow disc on the pedestal top */}
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.02, 32]} />
          <meshBasicMaterial color="#fff2c8" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Khuê Văn Các — on the L, back-right */}
      <group position={[1.5, 0.18, -1.5]} scale={0.55}>
        <KhueVanCac />
      </group>

      {/* Broadleaf trees at the corners of the plot. The relocated tree
          sits on the back border, 1/3 of the edge length (≈ 2.17 units)
          from the farthest corner (-HALF, -HALF). */}
      <BroadleafTree position={[-1.08, 0.18, -2.9]} scale={1.17}  seed={2.1} />
      <BroadleafTree position={[2.6,   0.18, -2.6]} scale={1.105} seed={2.7} />
      <BroadleafTree position={[-2.6,  0.18,  2.4]} scale={0.975} seed={3.3} />

      {/* Ground-level decor — flowers + grass tufts scattered on the L */}
      <GroundDecor />

      {/* Focused lighting so the medal + pavilion pop */}
      <pointLight position={[0, 6, 3]} intensity={1.1} color="#fff4d8" distance={12} />
      <pointLight position={[-1.5, 3, -1.5]} intensity={0.6} color="#ffce6a" distance={5} />
      <pointLight position={[1.5, 3, -1.5]}  intensity={0.5} color="#ffb050" distance={5} />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * L-shape brown soil ground — two rectangles forming an L, together
 * covering the whole top of the foundation minus the pond corner.
 * ------------------------------------------------------------------ */
function LShapeGround() {
  // Back bar: full width × depth from -HALF to POND.z0
  const backW = SIZE
  const backD = POND.z0 + HALF
  const backZ = (-HALF + POND.z0) / 2

  // Front-left bar: from -HALF to POND.x0 in X, from POND.z0 to +HALF in Z
  const frontW = POND.x0 + HALF
  const frontD = HALF - POND.z0
  const frontX = (-HALF + POND.x0) / 2
  const frontZ = (POND.z0 + HALF) / 2

  return (
    <group position={[0, 0.09, 0]}>
      {/* Back bar — grass */}
      <mesh position={[0, 0, backZ]} receiveShadow castShadow>
        <boxGeometry args={[backW, 0.18, backD]} />
        <meshStandardMaterial color={GRASS_COLOR} roughness={0.9} flatShading />
      </mesh>
      {/* Slightly-brighter highlight on top */}
      <mesh position={[0, 0.095, backZ]}>
        <boxGeometry args={[backW - 0.2, 0.02, backD - 0.2]} />
        <meshStandardMaterial color={GRASS_HIGHLIGHT} roughness={0.9} flatShading />
      </mesh>

      {/* Front-left bar — grass */}
      <mesh position={[frontX, 0, frontZ]} receiveShadow castShadow>
        <boxGeometry args={[frontW, 0.18, frontD]} />
        <meshStandardMaterial color={GRASS_COLOR} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[frontX, 0.095, frontZ]}>
        <boxGeometry args={[frontW - 0.2, 0.02, frontD - 0.2]} />
        <meshStandardMaterial color={GRASS_HIGHLIGHT} roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Grass field — many individual straws sticking up across the L-shape,
 * plus a few larger tufts. Deterministically scattered so the layout is
 * stable across renders.
 * ------------------------------------------------------------------ */
function GrassField() {
  // Scatter within the full top surface, excluding the pond corner and a
  // few small "footprint" zones under the pedestal / pavilion / trees so
  // grass doesn't poke through them.
  const grassBlades = scatterGrass({
    count: 93,
    bounds: { x0: -HALF + 0.1, x1: HALF - 0.1, z0: -HALF + 0.1, z1: HALF - 0.1 },
    excludes: [
      { x0: POND.x0 - 0.3, x1: HALF, z0: POND.z0 - 0.3, z1: HALF },   // pond area
      { x0: -2.3, x1: -0.7, z0: -2.3, z1: -0.7 },                     // pedestal footprint
      { x0: 0.7,  x1: 2.3,  z0: -2.3, z1: -0.7 },                     // Khuê Văn Các footprint
      // Tree footprints
      { x0: -1.5,  x1: -0.7, z0: -3.25, z1: -2.4 }, // relocated tree along back edge
      { x0: 2.2,   x1: 3.0,  z0: -3.0,  z1: -2.2 },
      { x0: -3.0,  x1: -2.2, z0: 2.0,   z1: 2.8  },
    ],
    y: 0.28,
    seed: 12345,
  })

  return (
    <group>
      {grassBlades.map((b, i) => (
        <GrassBlade key={i} {...b} />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Pond — sunken area in the front-right corner
 * ------------------------------------------------------------------ */
function Pond() {
  const cx = (POND.x0 + POND.x1) / 2
  const cz = (POND.z0 + POND.z1) / 2
  const width = POND.x1 - POND.x0
  const depth = POND.z1 - POND.z0
  return (
    <group position={[cx, 0, cz]}>
      {/* Pond floor — sandy silt */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[width - 0.05, 0.05, depth - 0.05]} />
        <meshStandardMaterial color={POND_FLOOR} roughness={0.9} flatShading />
      </mesh>
      {/* Water surface — a bit above the floor, translucent */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[width - 0.02, 0.08, depth - 0.02]} />
        <meshStandardMaterial
          color={WATER_COLOR}
          emissive={WATER_DEEP}
          emissiveIntensity={0.25}
          transparent
          opacity={0.78}
          roughness={0.15}
          metalness={0.45}
          flatShading
        />
      </mesh>
      {/* Ripple ring — subtle emissive band along the shore */}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[(width - 0.02) / 2 - 0.1, (width - 0.02) / 2, 4]} />
        <meshBasicMaterial color="#a7ecf3" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Life in and around the pond — lily pads, rocks
 * ------------------------------------------------------------------ */
function PondLife() {
  return (
    <group>
      {/* Lily pads on the water surface (world Y ~ 0.18 in island frame) */}
      <LilyPad position={[1.4, 0.19, 1.6]} scale={0.9} flower angle={0.4} />
      <LilyPad position={[2.5, 0.19, 1.4]} scale={0.8} angle={1.1} />
      <LilyPad position={[1.9, 0.19, 2.7]} scale={0.75} flower angle={-0.6} />
      <LilyPad position={[2.7, 0.19, 2.7]} scale={0.7} angle={0.9} />

      {/* Dark-blue polished rocks around the pond edge — some IN the water */}
      <Rock position={[0.4, 0.14, 1.6]}  scale={0.35} color={ROCK_BLUE}      seed={1.1} />
      <Rock position={[0.3, 0.13, 2.5]}  scale={0.28} color={ROCK_BLUE_DEEP} seed={1.2} />
      <Rock position={[3.0, 0.14, 0.4]}  scale={0.32} color={ROCK_BLUE}      seed={1.3} />
      <Rock position={[2.0, 0.13, 0.4]}  scale={0.24} color={ROCK_BLUE_DEEP} seed={1.4} />
      <Rock position={[3.1, 0.11, 2.0]}  scale={0.30} color={ROCK_BLUE}      seed={1.5} />
      {/* A tiny rock cluster on the L-shore corner */}
      <Rock position={[0.6, 0.22, 0.6]}  scale={0.20} color={ROCK_BLUE}      seed={1.6} />
    </group>
  )
}

/**
 * Stone pedestal that the medal floats above.
 */
function StonePedestal() {
  return (
    <group>
      {/* Base plinth */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.15, 0.3, 8]} />
        <meshStandardMaterial color={ISLAND_PALETTE.rock} roughness={0.9} flatShading />
      </mesh>
      {/* Column */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.75, 0.6, 8]} />
        <meshStandardMaterial color={ISLAND_PALETTE.sand} roughness={0.9} flatShading />
      </mesh>
      {/* Top plate */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.12, 8]} />
        <meshStandardMaterial color={ISLAND_PALETTE.sandWarm} roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Ground-level decor — grass tufts and flowers scattered across the
 * L-shape brown soil (avoiding the pond area).
 * ------------------------------------------------------------------ */
function GroundDecor() {
  const grassPos = [
    [-2.2, 0.19, -1.8],
    [-0.5, 0.19, -2.6],
    [0.6, 0.19, -2.2],
    [-2.4, 0.19, 0.9],
    [-1.8, 0.19, -2.4],
    [0.2, 0.19, -0.6],
    [-0.7, 0.19, 1.6],
    [-2.5, 0.19, 1.9],
  ]
  const flowers = [
    { p: [-0.9, 0.19, -2.0], c: '#ffb3c1' },
    { p: [-2.3, 0.19, -0.4], c: '#ffe066' },
    { p: [0.8, 0.19, -2.4],  c: '#d3b8ff' },
    { p: [-1.9, 0.19, -0.9], c: '#ff9b7a' },
    { p: [0.1, 0.19, -1.4],  c: '#ffb3c1' },
    { p: [-1.4, 0.19, 1.7],  c: '#ffe066' },
    { p: [-2.6, 0.19, -1.1], c: '#d3b8ff' },
  ]
  return (
    <group>
      {grassPos.map((p, i) => (
        <GrassTuft key={i} position={p} scale={0.55} />
      ))}
      {flowers.map((f, i) => (
        <Flower key={i} position={f.p} color={f.c} scale={0.65} />
      ))}
    </group>
  )
}
