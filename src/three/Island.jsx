import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Island foundation — a cube-shaped base that shows layered geology on its
 * sides (grass, soil, rock, bedrock) plus an optional water pond zone on
 * top. Each stage of the portfolio sits on one of these, with the stage's
 * main object placed above the top surface.
 *
 *              ┌────────────────┐    ← biome-specific top surface
 *              │┌────  grass ──┐│      (grass / sand + water)
 *              │└──────────────┘│
 *              │╔══ soil (brown) ══╗│
 *              │╠══ rock (tan)  ══╣│  ← geological layers visible
 *              │╚═ bedrock (dark) ═╝│    on the four sides
 *              └────────────────┘
 *
 * Every island floats subtly (idle bob), casts a soft shadow onto empty
 * space beneath, and can be tinted / recoloured per stage.
 */

// Palette shared across all islands so the world stays cohesive
export const ISLAND_PALETTE = {
  grass:      '#7bb444',
  grassDark:  '#4d9b3a',
  sand:       '#f0d29c',
  sandWarm:   '#e0b476',
  soil:       '#a06835',
  soilDark:   '#7c4b1e',
  rock:       '#c5a373',
  rockDark:   '#a08558',
  bedrock:    '#5b4d3f',
  bedrockDark:'#3d322a',
  water:      '#6ed4dc',
  waterDeep:  '#3a95a4',
  snow:       '#f5efe0',
  magma:      '#e85a24',
  magmaGlow:  '#ffb144',
  desert:     '#e2b070',
  desertDark: '#b58244',
}

/**
 * A layered cube foundation. Renders each layer as its own thin box so the
 * side faces show the strata cleanly. Layer order is bottom-up.
 *
 * `layers` example (default is a temperate island):
 *   [
 *     { color: '#5b4d3f', height: 0.7 },  // bedrock (bottom)
 *     { color: '#c5a373', height: 0.4 },  // rock
 *     { color: '#a06835', height: 0.35 }, // soil
 *     { color: '#7bb444', height: 0.15 }, // grass top
 *   ]
 */
// Global slim factor applied to every layer's height. The top surface stays
// at y=0 so props sitting on top don't need to move; only the strata below
// get shorter, giving the island a slimmer profile.
const LAYER_HEIGHT_SCALE = 1 / 1.44

export function IslandFoundation({
  width = 6,
  depth = 6,
  layers,
  position = [0, 0, 0],
  bevelBottom = false,   // straight-sided rectangular solid by default
}) {
  const spec = layers ?? DEFAULT_LAYERS

  // Compute cumulative Y so the top surface sits at y=0 (island's local
  // origin is the top surface, easy for placing objects on top).
  const stack = useMemo(() => {
    const scaled = spec.map((l) => ({ ...l, height: l.height * LAYER_HEIGHT_SCALE }))
    const totalH = scaled.reduce((s, l) => s + l.height, 0)
    let y = -totalH
    return scaled.map((l) => {
      const centerY = y + l.height / 2
      y += l.height
      // Ignore any per-layer taper — the island reads best as a clean cube.
      return { ...l, centerY }
    })
  }, [spec])

  return (
    <group position={position}>
      {stack.map((l, i) => (
        <mesh key={i} position={[0, l.centerY, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, l.height, depth]} />
          <meshStandardMaterial
            color={l.color}
            roughness={l.roughness ?? 0.88}
            metalness={l.metalness ?? 0.02}
            flatShading
            emissive={l.emissive ?? '#000000'}
            emissiveIntensity={l.emissiveIntensity ?? 0}
          />
        </mesh>
      ))}

      {bevelBottom && (
        <mesh
          position={[0, -stack.reduce((s, l) => s + l.height, 0) - 0.2, 0]}
          rotation={[Math.PI, 0, 0]}
        >
          <cylinderGeometry args={[width * 0.4, width * 0.55, 0.5, 4]} />
          <meshStandardMaterial color={ISLAND_PALETTE.bedrockDark} roughness={0.95} flatShading />
        </mesh>
      )}
    </group>
  )
}

const DEFAULT_LAYERS = [
  { color: ISLAND_PALETTE.bedrock,   height: 0.7,  taper: 0.85 },
  { color: ISLAND_PALETTE.rock,      height: 0.5,  taper: 0.93 },
  { color: ISLAND_PALETTE.soil,      height: 0.35, taper: 0.98 },
  { color: ISLAND_PALETTE.grass,     height: 0.15, taper: 1.0 },
]

/**
 * A subtly-bobbing group wrapper — every island floats with its own phase
 * so they don't all move in sync.
 */
export function FloatingRig({ children, seed = 0, amplitude = 0.15 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = Math.sin(t * 0.5 + seed) * amplitude
    ref.current.rotation.y = Math.sin(t * 0.25 + seed * 0.3) * 0.02
  })
  return <group ref={ref}>{children}</group>
}

/**
 * A water pond — inset area cut into the top of the island. Renders as
 * a translucent blue plate with wave-lit sand/rock visible underneath.
 * Position/size relative to the island's local origin (top surface at y=0).
 */
export function WaterPond({
  position = [0, 0, 0],
  width = 2,
  depth = 2,
  waterY = -0.18,
  floorY = -0.4,
  floorColor = ISLAND_PALETTE.sand,
}) {
  const waterRef = useRef()
  useFrame((state) => {
    if (!waterRef.current) return
    // Gentle emissive pulse so the water reads as "alive"
    waterRef.current.material.emissiveIntensity =
      0.15 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05
  })
  return (
    <group position={position}>
      {/* Cutout floor visible beneath the water */}
      <mesh position={[0, floorY, 0]} receiveShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.9} flatShading />
      </mesh>
      {/* Water surface */}
      <mesh ref={waterRef} position={[0, waterY, 0]}>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial
          color={ISLAND_PALETTE.water}
          emissive={ISLAND_PALETTE.water}
          emissiveIntensity={0.15}
          transparent
          opacity={0.72}
          roughness={0.2}
          metalness={0.35}
          flatShading
        />
      </mesh>
    </group>
  )
}

/**
 * A grass patch — a slightly-raised plane on top of the island for objects
 * to sit on. Uses a subtle jagged edge (via inner ring of small triangles)
 * to feel painterly rather than clinical.
 */
export function GrassPatch({
  position = [0, 0, 0],
  width = 3,
  depth = 3,
  color = ISLAND_PALETTE.grass,
  darkColor = ISLAND_PALETTE.grassDark,
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
      {/* Slightly darker inner shadow for depth */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[width * 0.85, 0.02, depth * 0.85]} />
        <meshStandardMaterial color={darkColor} roughness={0.95} flatShading />
      </mesh>
    </group>
  )
}
