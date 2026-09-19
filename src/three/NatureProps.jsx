import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A library of reusable low-poly natural props. All flat-shaded, chunky,
 * pastel-friendly. Compose scenes from these instead of dark neon geometry.
 */

/* ------------------------------------------------------------------ *
 * Palm tree — tapered brown trunk + 6 pointed leaves
 * ------------------------------------------------------------------ */
export function PalmTree({ position = [0, 0, 0], scale = 1, tilt = 0.1, seed = 0 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.z = tilt + Math.sin(t * 0.9 + seed) * 0.03
  })

  const leafCount = 7
  return (
    <group position={position} scale={scale}>
      <group ref={ref}>
        {/* Trunk — stack of segments each slightly offset for that curved palm look */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = i * 0.55
          const bend = Math.sin(i * 0.5) * 0.08
          const rw = 0.18 - i * 0.015
          return (
            <mesh key={i} position={[bend, y + 0.2, 0]} castShadow>
              <cylinderGeometry args={[rw, rw + 0.03, 0.6, 6]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#b17a4a' : '#a06835'} roughness={0.85} flatShading />
            </mesh>
          )
        })}
        {/* Leaves fan out from the top */}
        <group position={[Math.sin(6 * 0.5) * 0.08, 3.6, 0]}>
          {Array.from({ length: leafCount }).map((_, i) => {
            const a = (i / leafCount) * Math.PI * 2
            return (
              <group key={i} rotation={[Math.PI / 2.6, 0, a]}>
                <mesh position={[0, 0.9, 0]} castShadow>
                  <coneGeometry args={[0.45, 1.8, 3]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? '#7ec850' : '#4d9b3a'}
                    roughness={0.75}
                    flatShading
                  />
                </mesh>
              </group>
            )
          })}
          {/* Coconut cluster */}
          <mesh position={[0, 0.05, 0]}>
            <icosahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial color="#8b5a30" roughness={0.9} flatShading />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Broadleaf tree — chunky brown branchy trunk with several icosahedron
 * foliage clumps at the branch tips. Modeled after low-poly oak/deciduous
 * references: a central trunk that forks near the top into 3–4 branches,
 * each capped with a rounded green "leaf blob" (icosahedron with subtle
 * jitter, flat-shaded).
 * ------------------------------------------------------------------ */
export function BroadleafTree({ position = [0, 0, 0], scale = 1, seed = 1 }) {
  const rand = useMemo(() => mulberry32(Math.floor(seed * 1000) + 7), [seed])

  // Branch layout — each branch is a cylinder from origin to a target point.
  const branches = useMemo(() => {
    const arr = []
    // Main trunk goes from ground to a fork height
    arr.push({ from: [0, 0, 0], to: [0, 1.1, 0], r0: 0.14, r1: 0.11 })
    // Four sub-branches from the fork point, spreading outward
    const forkY = 1.1
    const layout = [
      { angleDeg: 25,  spread: 0.5, tip: [-0.55, forkY + 0.6, 0.25] },
      { angleDeg: -30, spread: 0.5, tip: [0.55, forkY + 0.75, -0.15] },
      { angleDeg: 80,  spread: 0.4, tip: [0.05, forkY + 0.95, 0.55] },
      { angleDeg: -80, spread: 0.4, tip: [0.15, forkY + 0.85, -0.55] },
    ]
    for (const b of layout) {
      arr.push({
        from: [0, forkY, 0],
        to: b.tip,
        r0: 0.09,
        r1: 0.06,
      })
    }
    return arr
  }, [])

  // Foliage clumps — one at each branch tip, plus a top-center clump.
  const foliage = useMemo(() => {
    const clumps = []
    for (const b of branches.slice(1)) {
      clumps.push({
        pos: b.to,
        radius: 0.32 + rand() * 0.14,
        color: rand() > 0.5 ? '#5aa73a' : '#4d9b3a',
      })
    }
    // Top-crown clump — sits above the fork
    clumps.push({
      pos: [0.05, 2.15, 0.05],
      radius: 0.42,
      color: '#5aa73a',
    })
    // One extra offset clump to break the symmetry
    clumps.push({
      pos: [0.25, 1.85, 0.3],
      radius: 0.24,
      color: '#4d9b3a',
    })
    return clumps
  }, [branches, rand])

  const groupRef = useRef()
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + seed) * 0.02
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {branches.map((b, i) => (
        <Branch key={i} from={b.from} to={b.to} r0={b.r0} r1={b.r1} />
      ))}
      {foliage.map((f, i) => (
        <LeafBlob key={i} position={f.pos} radius={f.radius} color={f.color} seed={seed + i} />
      ))}
    </group>
  )
}

/**
 * A branch — a cylinder oriented between two points.
 */
function Branch({ from, to, r0 = 0.08, r1 = 0.06 }) {
  const { position, quaternion, height } = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const mid = start.clone().lerp(end, 0.5)
    const dir = end.clone().sub(start)
    const h = dir.length()
    // Cylinder is Y-aligned by default; rotate to match direction
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    )
    return { position: mid.toArray(), quaternion: q, height: h }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[r1, r0, height, 6]} />
      <meshStandardMaterial color="#6b4423" roughness={0.85} flatShading />
    </mesh>
  )
}

/**
 * A foliage clump — jittered icosahedron for that faceted low-poly leaf blob.
 */
function LeafBlob({ position, radius, color, seed = 1 }) {
  const geom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(radius, 0)
    const rand = mulberry32(Math.floor(seed * 1000))
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) + (rand() - 0.5) * radius * 0.15)
      pos.setY(i, pos.getY(i) + (rand() - 0.5) * radius * 0.15)
      pos.setZ(i, pos.getZ(i) + (rand() - 0.5) * radius * 0.15)
    }
    g.computeVertexNormals()
    return g
  }, [radius, seed])
  return (
    <mesh geometry={geom} position={position} castShadow>
      <meshStandardMaterial color={color} roughness={0.75} flatShading />
    </mesh>
  )
}

/* ------------------------------------------------------------------ *
 * Pine tree — brown trunk + stacked green cones (Christmas-tree style)
 * ------------------------------------------------------------------ */
export function PineTree({ position = [0, 0, 0], scale = 1, seed = 0 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 + seed) * 0.04
  })
  return (
    <group position={position} scale={scale} ref={ref}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.8, 6]} />
        <meshStandardMaterial color="#8b5a30" roughness={0.9} flatShading />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 1.0 + i * 0.7, 0]} castShadow>
          <coneGeometry args={[0.9 - i * 0.2, 1.1, 8]} />
          <meshStandardMaterial
            color={i === 0 ? '#5aa73a' : i === 1 ? '#4d9b3a' : '#3d8a2f'}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Rock — smoothed low-poly boulder. Uses a subdivided icosahedron with
 * gentle vertex jitter so it reads as a rounded stone, not a spiky crystal.
 * Slightly flattened on Y to look like a natural boulder sitting on ground.
 * ------------------------------------------------------------------ */
export function Rock({
  position = [0, 0, 0],
  scale = 1,
  color = '#3f5878',      // default: dark slate-blue
  seed = 1,
}) {
  const geom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 1)  // detail=1 → smoother
    const rand = mulberry32(Math.floor(seed * 1000))
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) + (rand() - 0.5) * 0.14)
      pos.setY(i, pos.getY(i) + (rand() - 0.5) * 0.14)
      pos.setZ(i, pos.getZ(i) + (rand() - 0.5) * 0.14)
    }
    g.computeVertexNormals()
    return g
  }, [seed])

  return (
    <mesh
      geometry={geom}
      position={position}
      scale={[scale, scale * 0.7, scale]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} flatShading />
    </mesh>
  )
}

/* Deterministic PRNG so identical `seed` produces the same rock shape */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ *
 * Lily pad — flat green disc, optionally topped with a lotus flower
 * ------------------------------------------------------------------ */
export function LilyPad({ position = [0, 0, 0], scale = 1, flower = false, angle = 0 }) {
  return (
    <group position={position} rotation={[0, angle, 0]} scale={scale}>
      {/* Pad — flat cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.03, 14]} />
        <meshStandardMaterial color="#4d9b3a" roughness={0.6} flatShading />
      </mesh>
      {/* Darker rim */}
      <mesh position={[0, 0.017, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.01, 14]} />
        <meshStandardMaterial color="#3d7d2a" roughness={0.6} flatShading />
      </mesh>
      {/* V-notch — a small wedge cutout (approximated with a dark triangle) */}
      <mesh position={[0, 0.024, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.16, 3]} />
        <meshBasicMaterial color="#2d5f22" />
      </mesh>

      {flower && (
        <group position={[0, 0.06, 0]}>
          {/* Outer petals */}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07]}>
                <sphereGeometry args={[0.055, 6, 4]} />
                <meshStandardMaterial color="#ffc0d3" flatShading />
              </mesh>
            )
          })}
          {/* Inner cluster */}
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.03, 0.03, Math.sin(a) * 0.03]}>
                <sphereGeometry args={[0.032, 6, 4]} />
                <meshStandardMaterial color="#ff9bbc" flatShading />
              </mesh>
            )
          })}
          {/* Yellow stigma */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.028, 6, 4]} />
            <meshStandardMaterial color="#ffe066" flatShading />
          </mesh>
        </group>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Grass tuft — 3 tiny green triangles clustered together
 * ------------------------------------------------------------------ */
export function GrassTuft({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.15, (i - 1) * 0.05]} rotation={[0, i * 0.7, 0]}>
          <coneGeometry args={[0.06, 0.28, 3]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#7bb444' : '#5aa73a'} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Grass blade — a single tall thin blade sticking straight up, faceted.
 * Used for scattering across a lawn to give it "real grass straw"
 * standing-out texture rather than a flat painted-green plane.
 * ------------------------------------------------------------------ */
export function GrassBlade({
  position = [0, 0, 0],
  scale = 1,
  angle = 0,           // rotation around Y so blades aren't all facing the same way
  bend = 0,            // slight forward lean
  color = '#5aa73a',
}) {
  return (
    <mesh
      position={position}
      rotation={[bend, angle, 0]}
      scale={[scale, scale, scale]}
    >
      <coneGeometry args={[0.028, 0.32, 3]} />
      <meshStandardMaterial color={color} roughness={0.7} flatShading />
    </mesh>
  )
}

/**
 * Field-scatter helper — deterministically places many grass blades within
 * a rectangular XZ patch, avoiding an optional inner "cut-out" rectangle
 * (e.g. the pond area). Returns props ready to spread over <GrassBlade>.
 */
export function scatterGrass({
  count = 60,
  bounds,                // { x0, x1, z0, z1 }
  excludes = [],         // [{ x0, x1, z0, z1 }, ...] regions to skip
  y = 0.1,
  seed = 42,
}) {
  const rand = mulberry32(seed)
  const out = []
  let tries = 0
  while (out.length < count && tries < count * 20) {
    tries++
    const x = bounds.x0 + rand() * (bounds.x1 - bounds.x0)
    const z = bounds.z0 + rand() * (bounds.z1 - bounds.z0)
    let inExclude = false
    for (const ex of excludes) {
      if (x >= ex.x0 && x <= ex.x1 && z >= ex.z0 && z <= ex.z1) {
        inExclude = true
        break
      }
    }
    if (inExclude) continue
    out.push({
      position: [x, y, z],
      scale: 0.65 + rand() * 0.65,
      angle: rand() * Math.PI * 2,
      bend: (rand() - 0.5) * 0.35,
      color: rand() > 0.5 ? '#5aa73a' : (rand() > 0.5 ? '#7bb444' : '#3d7d2a'),
    })
  }
  return out
}

/* ------------------------------------------------------------------ *
 * Flower — thin green stem + colored 4-petal head
 * ------------------------------------------------------------------ */
export function Flower({ position = [0, 0, 0], color = '#ffb3c1', scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 4]} />
        <meshStandardMaterial color="#5aa73a" flatShading />
      </mesh>
      <group position={[0, 0.45, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i / 4) * Math.PI * 2, 0]}>
            <mesh position={[0.08, 0, 0]}>
              <sphereGeometry args={[0.08, 6, 4]} />
              <meshStandardMaterial color={color} flatShading />
            </mesh>
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshStandardMaterial color="#ffe066" flatShading />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Temple pillar — tan Greek-style column, standing or broken
 * ------------------------------------------------------------------ */
export function TemplePillar({ position = [0, 0, 0], scale = 1, height = 3, broken = false }) {
  return (
    <group position={position} scale={scale}>
      {/* Base plinth */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.24, 0.9]} />
        <meshStandardMaterial color="#d5b384" roughness={0.9} flatShading />
      </mesh>
      {/* Middle base */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.75, 0.14, 0.75]} />
        <meshStandardMaterial color="#e0c399" roughness={0.9} flatShading />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, 0.45 + height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, height, 8]} />
        <meshStandardMaterial color="#f0d7a8" roughness={0.85} flatShading />
      </mesh>
      {broken ? (
        // Diagonal jagged break at top
        <mesh position={[0, 0.45 + height + 0.05, 0]} rotation={[0.3, 0, 0.2]} castShadow>
          <coneGeometry args={[0.3, 0.3, 5]} />
          <meshStandardMaterial color="#c8b087" roughness={0.9} flatShading />
        </mesh>
      ) : (
        <>
          {/* Capital */}
          <mesh position={[0, 0.45 + height + 0.1, 0]} castShadow>
            <boxGeometry args={[0.7, 0.16, 0.7]} />
            <meshStandardMaterial color="#e0c399" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.45 + height + 0.24, 0]} castShadow>
            <boxGeometry args={[0.85, 0.14, 0.85]} />
            <meshStandardMaterial color="#d5b384" roughness={0.9} flatShading />
          </mesh>
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Temple entablature — horizontal beam that spans between two pillars
 * ------------------------------------------------------------------ */
export function TempleBeam({ position = [0, 0, 0], length = 4, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <boxGeometry args={[length, 0.35, 0.85]} />
        <meshStandardMaterial color="#e0c399" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[length + 0.15, 0.14, 0.95]} />
        <meshStandardMaterial color="#d5b384" roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Mushroom — small red-cap with white spots
 * ------------------------------------------------------------------ */
export function Mushroom({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.24, 6]} />
        <meshStandardMaterial color="#fdf5e3" flatShading />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.18, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ff8a80" flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Scatter helper — deterministically scatters props inside a rectangle,
 * used by scenes to fill the surrounding area.
 * ------------------------------------------------------------------ */
export function scatter(count, area, seed = 0) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const rx = pseudo(seed + i * 3.7) - 0.5
    const rz = pseudo(seed + i * 7.1 + 100) - 0.5
    arr.push({
      x: rx * area.w,
      z: rz * area.h + (area.zOffset || 0),
      rot: pseudo(seed + i * 5.3) * Math.PI * 2,
      scale: 0.75 + pseudo(seed + i * 9.1) * 0.6,
    })
  }
  return arr
}

function pseudo(x) {
  const v = Math.sin(x * 12.9898) * 43758.5453
  return v - Math.floor(v)
}
