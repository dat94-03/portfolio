import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Khuê Văn Các — the Stellar Pavilion at the Temple of Literature in Hanoi,
 * one of Vietnam's national symbols of learning and the ceremonial gateway
 * of the country's first university. Thematically the perfect neighbour for
 * an HUST graduation medal.
 *
 * Two-tier structure:
 *   ┌──────────┐
 *   │  ▲▲▲▲▲   │  ← finial + double-curved tile roof
 *   │ ┌──┐ ┌──┐│
 *   │ │◯ │ │◯ ││  ← wooden pavilion room with moon windows on 4 sides
 *   │ └──┘ └──┘│
 *   │  ║   ║   │  ← balustrade
 *   │ ┃ ┃ ┃ ┃  │  ← four square stone columns
 *   │  ▬▬▬     │  ← stepped stone base
 *   └──────────┘
 *
 * All geometry is procedural, low-poly, and interactive: hover pulses the
 * emissive, drag rotates it around Y.
 */

const STONE      = '#f0dcb1'
const STONE_DARK = '#c9ac7c'
const WOOD       = '#c78b52'
const WOOD_DARK  = '#8b5a30'
const TILE       = '#7f5638'
const TILE_DARK  = '#5f3d24'
const RED        = '#c94d3a'

export default function KhueVanCac({ position = [0, 0, 0], scale = 1 }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const drag = useRef({ active: false, lastX: 0, offset: 0 })
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(t * 0.15) * 0.15 + drag.current.offset
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.03
    }
    // Pulsing ground glow underneath
    if (glowRef.current) {
      const base = hovered ? 0.7 : 0.4
      glowRef.current.material.opacity = base + Math.sin(t * 2) * 0.12
    }
  })

  return (
    <group
      position={position}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        drag.current.active = true
        drag.current.lastX = e.clientX
        document.body.style.cursor = 'grabbing'
        e.target.setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return
        const dx = e.clientX - drag.current.lastX
        drag.current.offset += dx * 0.008
        drag.current.lastX = e.clientX
      }}
      onPointerUp={(e) => {
        drag.current.active = false
        document.body.style.cursor = 'grab'
        e.target.releasePointerCapture?.(e.pointerId)
      }}
    >
      {/* Ground glow disc */}
      <mesh
        ref={glowRef}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.9, 1.6, 32]} />
        <meshBasicMaterial color="#ffe38a" transparent opacity={0.45} />
      </mesh>

      <group ref={groupRef}>
        <StoneBase hovered={hovered} />
        <Columns />
        <UpperFloor />
        <PavilionRoom hovered={hovered} />
        <Balustrade />
        <LowerRoof hovered={hovered} />
        <UpperRoof hovered={hovered} />
        <Finial />
      </group>

      {/* Warm accent light so the pavilion pops */}
      <pointLight
        position={[0, 2.5, 1.2]}
        intensity={hovered ? 1.6 : 1.0}
        distance={5}
        color="#ffe0a0"
      />
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Stone base — three stacked tiers
 * ------------------------------------------------------------------ */
function StoneBase({ hovered }) {
  const emissive = hovered ? '#ffdd88' : '#000000'
  const emiInt = hovered ? 0.12 : 0
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.24, 2.6]} />
        <meshStandardMaterial color={STONE_DARK} emissive={emissive} emissiveIntensity={emiInt} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[2.3, 0.16, 2.3]} />
        <meshStandardMaterial color={STONE} emissive={emissive} emissiveIntensity={emiInt} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[2.0, 0.12, 2.0]} />
        <meshStandardMaterial color={STONE_DARK} emissive={emissive} emissiveIntensity={emiInt} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.85, 0.06, 1.85]} />
        <meshStandardMaterial color={STONE} emissive={emissive} emissiveIntensity={emiInt} roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Four square stone columns
 * ------------------------------------------------------------------ */
function Columns() {
  const positions = [
    [-0.7, 1.3, 0.7],
    [0.7, 1.3, 0.7],
    [-0.7, 1.3, -0.7],
    [0.7, 1.3, -0.7],
  ]
  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          {/* Column shaft */}
          <mesh castShadow>
            <boxGeometry args={[0.24, 1.5, 0.24]} />
            <meshStandardMaterial color={STONE} roughness={0.85} flatShading />
          </mesh>
          {/* Column base — slightly wider */}
          <mesh position={[0, -0.72, 0]}>
            <boxGeometry args={[0.32, 0.08, 0.32]} />
            <meshStandardMaterial color={STONE_DARK} roughness={0.85} flatShading />
          </mesh>
          {/* Column capital */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.32, 0.06, 0.32]} />
            <meshStandardMaterial color={STONE_DARK} roughness={0.85} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Upper floor plate — sits on top of the columns
 * ------------------------------------------------------------------ */
function UpperFloor() {
  return (
    <group>
      <mesh position={[0, 2.08, 0]} castShadow>
        <boxGeometry args={[2.0, 0.08, 2.0]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 2.15, 0]}>
        <boxGeometry args={[1.85, 0.05, 1.85]} />
        <meshStandardMaterial color={STONE} roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Pavilion room — wooden box with 4 circular moon-windows
 * ------------------------------------------------------------------ */
function PavilionRoom({ hovered }) {
  const emissive = hovered ? '#ffcc7a' : '#3d1f0a'
  const emiInt = hovered ? 0.35 : 0.05
  return (
    <group>
      {/* Wall panels — 4 sides, thin */}
      {[
        { p: [0, 2.55, 0.75], s: [1.55, 0.75, 0.08], r: [0, 0, 0] },
        { p: [0, 2.55, -0.75], s: [1.55, 0.75, 0.08], r: [0, 0, 0] },
        { p: [-0.75, 2.55, 0], s: [0.08, 0.75, 1.55], r: [0, 0, 0] },
        { p: [0.75, 2.55, 0], s: [0.08, 0.75, 1.55], r: [0, 0, 0] },
      ].map((w, i) => (
        <mesh key={i} position={w.p} castShadow>
          <boxGeometry args={w.s} />
          <meshStandardMaterial
            color={WOOD}
            emissive={emissive}
            emissiveIntensity={emiInt}
            roughness={0.75}
            flatShading
          />
        </mesh>
      ))}

      {/* Four moon-windows — decorative torus rings + radial spokes */}
      {[
        { p: [0, 2.55, 0.8], r: [0, 0, 0] },
        { p: [0, 2.55, -0.8], r: [0, Math.PI, 0] },
        { p: [-0.8, 2.55, 0], r: [0, -Math.PI / 2, 0] },
        { p: [0.8, 2.55, 0], r: [0, Math.PI / 2, 0] },
      ].map((w, i) => (
        <MoonWindow key={i} position={w.p} rotation={w.r} hovered={hovered} />
      ))}

      {/* Small support brackets under the roof (bracket set / dou gong) */}
      {[
        [-0.6, 2.95, 0.78],
        [0.6, 2.95, 0.78],
        [-0.6, 2.95, -0.78],
        [0.6, 2.95, -0.78],
        [-0.78, 2.95, 0.6],
        [0.78, 2.95, 0.6],
        [-0.78, 2.95, -0.6],
        [0.78, 2.95, -0.6],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.14, 0.12, 0.14]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Moon window — decorative circular window with radial lattice
 * ------------------------------------------------------------------ */
function MoonWindow({ position, rotation, hovered }) {
  const spokes = 12
  return (
    <group position={position} rotation={rotation}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[0.28, 0.028, 8, 24]} />
        <meshStandardMaterial
          color={WOOD_DARK}
          emissive={hovered ? '#ffb060' : '#000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.7}
          flatShading
        />
      </mesh>
      {/* Inner dark disc — the "opening" */}
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.255, 20]} />
        <meshStandardMaterial color="#2a1608" roughness={0.9} />
      </mesh>
      {/* Radial spokes — thin bars from center to rim */}
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[0, 0, 0.015]}
            rotation={[0, 0, a]}
          >
            <boxGeometry args={[0.5, 0.018, 0.01]} />
            <meshStandardMaterial color={WOOD_DARK} flatShading />
          </mesh>
        )
      })}
      {/* Center hub */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.045, 12]} />
        <meshStandardMaterial color={WOOD_DARK} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Balustrade — small rail with vertical posts around the upper deck
 * ------------------------------------------------------------------ */
function Balustrade() {
  const rails = [
    { p: [0, 2.22, 0.9], s: [1.9, 0.06, 0.05] },
    { p: [0, 2.22, -0.9], s: [1.9, 0.06, 0.05] },
    { p: [-0.9, 2.22, 0], s: [0.05, 0.06, 1.9] },
    { p: [0.9, 2.22, 0], s: [0.05, 0.06, 1.9] },
  ]
  return (
    <group>
      {rails.map((r, i) => (
        <mesh key={i} position={r.p}>
          <boxGeometry args={r.s} />
          <meshStandardMaterial color={STONE_DARK} roughness={0.9} flatShading />
        </mesh>
      ))}
      {/* Small vertical balusters — 5 per side */}
      {[-1, 0, 1].flatMap((sign) =>
        sign === 0
          ? []
          : [-0.6, -0.3, 0, 0.3, 0.6].flatMap((offset) => [
              // front + back
              { p: [offset, 2.19, sign * 0.9] },
              // left + right
              { p: [sign * 0.9, 2.19, offset] },
            ])
      ).map((b, i) => (
        <mesh key={i} position={b.p}>
          <boxGeometry args={[0.035, 0.14, 0.035]} />
          <meshStandardMaterial color={STONE_DARK} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Roofs — two tiers of curved tiled roofs with upturned corners
 * ------------------------------------------------------------------ */
function LowerRoof({ hovered }) {
  const emissive = hovered ? '#c95a3a' : '#000'
  const emiInt = hovered ? 0.18 : 0
  return (
    <group position={[0, 3.05, 0]}>
      {/* Eave band — thick beam beneath the roof */}
      <mesh>
        <boxGeometry args={[1.95, 0.08, 1.95]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} flatShading />
      </mesh>
      {/* Roof pitch — truncated 4-sided pyramid */}
      <mesh position={[0, 0.28, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0.4, 1.4, 0.5, 4]} />
        <meshStandardMaterial
          color={TILE}
          emissive={emissive}
          emissiveIntensity={emiInt}
          roughness={0.75}
          flatShading
        />
      </mesh>
      {/* Underside of roof (darker) */}
      <mesh position={[0, 0.055, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[1.35, 1.4, 0.03, 4]} />
        <meshStandardMaterial color={TILE_DARK} roughness={0.85} flatShading />
      </mesh>
      {/* Upturned corner tips — small triangle points at each corner */}
      {[
        [1.15, 0.05, 1.15],
        [-1.15, 0.05, 1.15],
        [1.15, 0.05, -1.15],
        [-1.15, 0.05, -1.15],
      ].map((p, i) => (
        <group key={i} position={p}>
          {/* Vertical corner sweep */}
          <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.08, 0.32, 3]} />
            <meshStandardMaterial color={TILE_DARK} flatShading />
          </mesh>
          {/* Small round finial on the tip */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshStandardMaterial color={RED} roughness={0.5} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function UpperRoof({ hovered }) {
  const emissive = hovered ? '#c95a3a' : '#000'
  const emiInt = hovered ? 0.18 : 0
  return (
    <group position={[0, 3.55, 0]}>
      {/* Eave band */}
      <mesh>
        <boxGeometry args={[1.35, 0.06, 1.35]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} flatShading />
      </mesh>
      {/* Upper roof pitch */}
      <mesh position={[0, 0.22, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.95, 0.42, 4]} />
        <meshStandardMaterial
          color={TILE}
          emissive={emissive}
          emissiveIntensity={emiInt}
          roughness={0.75}
          flatShading
        />
      </mesh>
      {/* Ridge caps along the roof edges */}
      <mesh position={[0, 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.35, 0.06, 0.1]} />
        <meshStandardMaterial color={TILE_DARK} flatShading />
      </mesh>
      {/* Corner tips on upper roof */}
      {[
        [0.75, 0.02, 0.75],
        [-0.75, 0.02, 0.75],
        [0.75, 0.02, -0.75],
        [-0.75, 0.02, -0.75],
      ].map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.06, 0.24, 3]} />
            <meshStandardMaterial color={TILE_DARK} flatShading />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color={RED} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Central finial — decorative spire on the very top
 * ------------------------------------------------------------------ */
function Finial() {
  return (
    <group position={[0, 3.9, 0]}>
      {/* Base plate */}
      <mesh>
        <cylinderGeometry args={[0.11, 0.14, 0.08, 6]} />
        <meshStandardMaterial color={TILE_DARK} flatShading />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.2, 6]} />
        <meshStandardMaterial color={WOOD_DARK} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Central orb */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color={RED} roughness={0.4} flatShading />
      </mesh>
      {/* Top spike */}
      <mesh position={[0, 0.44, 0]}>
        <coneGeometry args={[0.04, 0.16, 5]} />
        <meshStandardMaterial color={RED} roughness={0.4} flatShading />
      </mesh>
      {/* Side ornaments — small dou-gong-like brackets on each side */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.13, 0.08, Math.sin(a) * 0.13]}
            rotation={[0, a, 0]}
          >
            <boxGeometry args={[0.05, 0.08, 0.02]} />
            <meshStandardMaterial color={WOOD_DARK} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}
