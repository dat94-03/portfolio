import * as THREE from 'three'

import {
  IslandFoundation,
  FloatingRig,
  ISLAND_PALETTE,
} from '../../three/Island.jsx'
import {
  BroadleafTree,
  PineTree,
  Rock,
  GrassTuft,
  GrassBlade,
  scatterGrass,
  Flower,
  Mushroom,
} from '../../three/NatureProps.jsx'

/**
 * About Island — "The person behind the pipelines."
 *
 * A hex-lawn diorama that reads as a personal space:
 *   • Layered cube foundation with a hex-tiled grass top
 *   • Cosy timber desk with laptop, coffee, and a small book stack
 *   • Running-shoe pedestal (nod to long-distance running)
 *   • Miniature "container yard" (three colored cubes) — hobby tinkering
 *   • A stone bench for scale + trees / flowers around the edges
 */

const SIZE = 6.5
const HALF = SIZE / 2

const HEX_GREEN       = '#7bb444'
const HEX_GREEN_DEEP  = '#4d9b3a'
const DESK_WOOD       = '#8b5a30'
const DESK_WOOD_LIGHT = '#c89968'

export default function AboutIsland() {
  return (
    <FloatingRig seed={1}>
      {/* Foundation — clean rectangular solid, four strata */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: ISLAND_PALETTE.bedrockDark, height: 0.6 },
          { color: ISLAND_PALETTE.bedrock,     height: 0.5 },
          { color: ISLAND_PALETTE.rock,        height: 0.45 },
          { color: ISLAND_PALETTE.soil,        height: 0.35 },
        ]}
      />

      {/* Hex-tiled grass carpet on top */}
      <HexLawn />

      {/* Grass straws poking through the hex lawn */}
      <GrassField />

      {/* Cosy corner: desk with laptop + coffee + books (back-left) */}
      <group position={[-1.5, 0.19, -1.4]} rotation={[0, Math.PI / 6, 0]}>
        <Desk />
        <Laptop position={[-0.35, 0.86, 0]} />
        <CoffeeCup position={[0.45, 0.86, 0.05]} />
        <BookStack position={[0.35, 0.86, -0.35]} />
      </group>

      {/* Running shoes on a small stone (front-left) */}
      <group position={[-1.7, 0.19, 1.5]} rotation={[0, -Math.PI / 5, 0]}>
        <ShoeRock />
        <RunningShoe position={[-0.14, 0.34, 0]} tint="#4ecdc4" />
        <RunningShoe position={[0.16, 0.34, 0.08]} tint="#ff8a5b" />
      </group>

      {/* Container yard — three colored cubes stacked, homage to container internals */}
      <group position={[1.6, 0.19, 1.4]} rotation={[0, Math.PI / 8, 0]}>
        <ContainerYard />
      </group>

      {/* Stone bench (back-right) — a quiet reading spot */}
      <group position={[1.7, 0.19, -1.4]} rotation={[0, -Math.PI / 8, 0]}>
        <StoneBench />
      </group>

      {/* Trees and greenery around the corners */}
      <BroadleafTree position={[-2.7, 0.19, -2.6]} scale={0.8} seed={5.1} />
      <PineTree position={[2.7, 0.19, -2.7]} scale={0.9} seed={5.3} />
      <BroadleafTree position={[2.7, 0.19, 2.6]} scale={0.75} seed={5.5} />
      <PineTree position={[-2.6, 0.19, 2.7]} scale={0.7} seed={5.7} />

      {/* Ground-level decor */}
      <GroundDecor />

      {/* Focused warm accent lighting */}
      <pointLight position={[-1.5, 3, -1.4]} intensity={0.6} color="#ffce7a" distance={5} />
      <pointLight position={[1.6, 2.5, 1.4]}  intensity={0.5} color="#8fd4ff" distance={5} />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * Hex-tiled grass carpet — one full grass slab plus a scatter of
 * slightly darker hex tiles on top for a stylised painted look.
 * ------------------------------------------------------------------ */
function HexLawn() {
  const tiles = []
  for (let x = -2.6; x <= 2.6; x += 0.9) {
    for (let z = -2.6; z <= 2.6; z += 0.9) {
      const jitter = (Math.sin(x * 4.7 + z * 3.1) + 1) * 0.5
      if (jitter > 0.55) continue                        // skip some for airiness
      tiles.push({ x, z, tone: jitter > 0.25 })
    }
  }
  return (
    <group position={[0, 0.09, 0]}>
      {/* Full grass slab underneath the hex overlay */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[SIZE, 0.18, SIZE]} />
        <meshStandardMaterial color={HEX_GREEN_DEEP} roughness={0.9} flatShading />
      </mesh>
      {/* Hex tile overlay — hexagonal (6-sided cylinder) discs */}
      {tiles.map((t, i) => (
        <mesh
          key={i}
          position={[t.x, 0.11, t.z]}
          rotation={[0, Math.PI / 6, 0]}
          receiveShadow
        >
          <cylinderGeometry args={[0.44, 0.44, 0.04, 6]} />
          <meshStandardMaterial
            color={t.tone ? HEX_GREEN : HEX_GREEN_DEEP}
            roughness={0.9}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Grass field — scattered blades between the hex tiles
 * ------------------------------------------------------------------ */
function GrassField() {
  const blades = scatterGrass({
    count: 55,
    bounds: { x0: -HALF + 0.2, x1: HALF - 0.2, z0: -HALF + 0.2, z1: HALF - 0.2 },
    excludes: [
      { x0: -2.3, x1: -0.5, z0: -2.2, z1: -0.6 },   // desk
      { x0: -2.4, x1: -1.0, z0: 0.9,  z1: 2.1 },    // shoes
      { x0: 1.0,  x1: 2.3,  z0: 0.9,  z1: 2.0 },    // containers
      { x0: 1.0,  x1: 2.4,  z0: -2.1, z1: -0.6 },   // bench
    ],
    y: 0.28,
    seed: 7788,
  })
  return (
    <group>
      {blades.map((b, i) => (
        <GrassBlade key={i} {...b} />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Cosy desk — a rectangular timber table on four legs
 * ------------------------------------------------------------------ */
function Desk() {
  return (
    <group>
      {/* Table top */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.9]} />
        <meshStandardMaterial color={DESK_WOOD_LIGHT} roughness={0.85} flatShading />
      </mesh>
      {/* Table lip */}
      <mesh position={[0, 0.76, 0]}>
        <boxGeometry args={[1.55, 0.04, 0.85]} />
        <meshStandardMaterial color={DESK_WOOD} roughness={0.9} flatShading />
      </mesh>
      {/* Legs */}
      {[
        [-0.7, 0.4, -0.38],
        [0.7,  0.4, -0.38],
        [-0.7, 0.4, 0.38],
        [0.7,  0.4, 0.38],
      ].map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color={DESK_WOOD} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* Small silver laptop, open — base + tilted lid with a soft glowing screen */
function Laptop({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.55, 0.04, 0.38]} />
        <meshStandardMaterial color="#b8bcc4" roughness={0.4} metalness={0.35} flatShading />
      </mesh>
      {/* Lid (tilted back) */}
      <group position={[0, 0.04, -0.16]} rotation={[-0.35, 0, 0]}>
        <mesh position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.55, 0.38, 0.03]} />
          <meshStandardMaterial color="#8a8f99" roughness={0.35} metalness={0.4} flatShading />
        </mesh>
        {/* Screen glow */}
        <mesh position={[0, 0.19, 0.017]}>
          <boxGeometry args={[0.5, 0.32, 0.005]} />
          <meshStandardMaterial
            color="#0e1a2a"
            emissive="#5cc8ff"
            emissiveIntensity={0.7}
            roughness={0.15}
            flatShading
          />
        </mesh>
      </group>
    </group>
  )
}

/* Cylindrical coffee cup with dark brew inside */
function CoffeeCup({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.22, 12]} />
        <meshStandardMaterial color="#f5efe0" roughness={0.7} flatShading />
      </mesh>
      {/* Brew */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.01, 12]} />
        <meshStandardMaterial color="#3d2214" roughness={0.4} flatShading />
      </mesh>
      {/* Handle */}
      <mesh position={[0.1, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.05, 0.015, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#f5efe0" roughness={0.7} flatShading />
      </mesh>
    </group>
  )
}

/* Little stack of three books, mixed spines */
function BookStack({ position = [0, 0, 0] }) {
  const books = [
    { c: '#c94d3a', y: 0.04, w: 0.32, h: 0.06 },
    { c: '#3d6ea8', y: 0.10, w: 0.30, h: 0.06 },
    { c: '#5aa73a', y: 0.16, w: 0.28, h: 0.06 },
  ]
  return (
    <group position={position} rotation={[0, 0.3, 0]}>
      {books.map((b, i) => (
        <mesh key={i} position={[0, b.y, 0]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.22]} />
          <meshStandardMaterial color={b.c} roughness={0.7} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* Little flat rock the shoes stand on */
function ShoeRock() {
  return (
    <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.42, 0.48, 0.28, 8]} />
      <meshStandardMaterial color={ISLAND_PALETTE.rock} roughness={0.9} flatShading />
    </mesh>
  )
}

/* Stylised running shoe — an angled wedge with a colored upper */
function RunningShoe({ position = [0, 0, 0], tint = '#4ecdc4' }) {
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {/* Sole */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[0.32, 0.06, 0.14]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} flatShading />
      </mesh>
      {/* Upper — wedge shape */}
      <mesh position={[-0.02, 0.10, 0]} castShadow>
        <boxGeometry args={[0.26, 0.08, 0.12]} />
        <meshStandardMaterial color={tint} roughness={0.7} flatShading />
      </mesh>
      {/* Toe box */}
      <mesh position={[0.13, 0.07, 0]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial color={tint} roughness={0.7} flatShading />
      </mesh>
    </group>
  )
}

/* Container yard — three colored shipping-cube stacks */
function ContainerYard() {
  const cubes = [
    { p: [-0.3, 0.15, 0],   c: '#4b9cd3' },
    { p: [0,    0.15, 0.3], c: '#6bcb77' },
    { p: [0.3,  0.15, 0],   c: '#ffb84c' },
    { p: [0,    0.45, 0.15], c: '#f26c6c' },
  ]
  return (
    <group>
      {/* Concrete pad */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.95, 0.05, 0.85]} />
        <meshStandardMaterial color="#a8a8a8" roughness={0.9} flatShading />
      </mesh>
      {cubes.map((cube, i) => (
        <group key={i} position={cube.p}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.28, 0.28]} />
            <meshStandardMaterial color={cube.c} roughness={0.7} flatShading />
          </mesh>
          {/* Container "ribs" — thin stripes */}
          <mesh>
            <boxGeometry args={[0.29, 0.04, 0.29]} />
            <meshStandardMaterial color="#00000022" transparent opacity={0.35} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* Stone bench — two stone pillars + a flat top slab */
function StoneBench() {
  return (
    <group>
      {/* Left support */}
      <mesh position={[-0.5, 0.2, 0]} castShadow>
        <boxGeometry args={[0.28, 0.4, 0.32]} />
        <meshStandardMaterial color={ISLAND_PALETTE.rock} roughness={0.9} flatShading />
      </mesh>
      {/* Right support */}
      <mesh position={[0.5, 0.2, 0]} castShadow>
        <boxGeometry args={[0.28, 0.4, 0.32]} />
        <meshStandardMaterial color={ISLAND_PALETTE.rock} roughness={0.9} flatShading />
      </mesh>
      {/* Top slab */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.4, 0.12, 0.42]} />
        <meshStandardMaterial color={ISLAND_PALETTE.sandWarm} roughness={0.9} flatShading />
      </mesh>
      {/* Little coffee cup on the bench */}
      <CoffeeCup position={[0.45, 0.51, 0]} />
    </group>
  )
}

/* Ground-level decor — grass tufts, flowers, and a mushroom or two */
function GroundDecor() {
  const grassPos = [
    [-2.4, 0.19, -0.4],
    [-0.4, 0.19, 2.4],
    [2.3, 0.19, 0.1],
    [-1.8, 0.19, 2.2],
    [0.4, 0.19, -1.8],
    [0.6, 0.19, 2.5],
  ]
  const flowers = [
    { p: [-1.9, 0.19, -2.4], c: '#ffb3c1' },
    { p: [2.4, 0.19, -2.2],  c: '#ffe066' },
    { p: [-2.5, 0.19, 0.3],  c: '#d3b8ff' },
    { p: [2.6, 0.19, 0.9],   c: '#ff9b7a' },
    { p: [-0.3, 0.19, -2.6], c: '#ffb3c1' },
  ]
  return (
    <group>
      {grassPos.map((p, i) => (
        <GrassTuft key={i} position={p} scale={0.55} />
      ))}
      {flowers.map((f, i) => (
        <Flower key={i} position={f.p} color={f.c} scale={0.65} />
      ))}
      <Mushroom position={[-1.1, 0.19, 2.4]} scale={0.9} />
      <Mushroom position={[2.5, 0.19, 2.0]} scale={0.7} />
      <Rock position={[-0.9, 0.28, -1.9]} scale={0.28} color={ISLAND_PALETTE.rock} seed={9.1} />
      <Rock position={[1.1, 0.26, -1.7]}  scale={0.22} color={ISLAND_PALETTE.rockDark} seed={9.2} />
    </group>
  )
}
