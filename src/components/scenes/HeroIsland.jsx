import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'

import {
  IslandFoundation,
  FloatingRig,
  ISLAND_PALETTE,
} from '../../three/Island.jsx'
import { ServerRack } from '../../three/ServerRack.jsx'
import IdeTerminal from '../ui/IdeTerminal.jsx'

/**
 * Hero Island — a datacenter lab diorama.
 *
 *   • Foundation strata (bedrock → cable trays → subfloor → tech-floor)
 *   • Perforated grey tech-floor top with a soft glow beneath
 *   • Four server racks lined along the back wall, blinking LEDs
 *   • A floating flat-screen monitor front-center that shows the bash
 *     "about" terminal, typing itself out
 *   • Cool blue overhead LED-strip lighting + warm accent on the monitor
 */

const SIZE      = 6.5
const HALF      = SIZE / 2
const FLOOR     = '#454852'
const FLOOR_TILE_LIGHT = '#565a66'
const FLOOR_TILE_DARK  = '#3b3e48'
const CABLE     = '#2a2c33'

export default function HeroIsland() {
  return (
    <FloatingRig seed={0.3}>
      {/* Foundation — datacenter substructure */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: ISLAND_PALETTE.bedrockDark, height: 0.55 },
          { color: '#4a3a2a',                   height: 0.4  },  // clay / conduit
          { color: '#2a2c33',                   height: 0.45 },  // cable-tray subfloor
          { color: '#5a5d68',                   height: 0.3  },  // raised access floor
        ]}
      />

      {/* Tile floor deck */}
      <TileFloor />

      {/* Row of server racks along the back */}
      <RackRow />

      {/* Cloud drift above the rack row */}
      <CloudDrift />

      {/* Cable trays running toward the front */}
      <CableRuns />

      {/* Floating monitor front-center holding the terminal */}
      <FloatingMonitor />

      {/* Lighting */}
      <pointLight position={[0, 4, -2]}  intensity={1.6} color="#a4d8ff" distance={9} />
      <pointLight position={[0, 4, 2]}   intensity={1.2} color="#ffe1a0" distance={8} />
      <pointLight position={[0, 1.5, 1.5]} intensity={0.9} color="#fff2c8" distance={5} />
      <ambientLight intensity={0.35} color="#c8dcec" />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * Tech tile floor — grey raised-access panels with a subtle grid
 * ------------------------------------------------------------------ */
function TileFloor() {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[SIZE, 0.08, SIZE]} />
        <meshStandardMaterial color={FLOOR} roughness={0.7} metalness={0.3} flatShading />
      </mesh>
      {/* Grid lines — a set of thin darker strips */}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((z, i) => (
        <mesh key={`z-${i}`} position={[0, 0.045, z]}>
          <boxGeometry args={[SIZE - 0.2, 0.01, 0.03]} />
          <meshStandardMaterial color={FLOOR_TILE_DARK} flatShading />
        </mesh>
      ))}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x, i) => (
        <mesh key={`x-${i}`} position={[x, 0.045, 0]}>
          <boxGeometry args={[0.03, 0.01, SIZE - 0.2]} />
          <meshStandardMaterial color={FLOOR_TILE_DARK} flatShading />
        </mesh>
      ))}
      {/* Highlight strip in the aisle between racks and monitor */}
      <mesh position={[0, 0.046, 0.4]}>
        <boxGeometry args={[3.4, 0.005, 0.9]} />
        <meshStandardMaterial
          color="#7bc7ff"
          emissive="#7bc7ff"
          emissiveIntensity={0.35}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Server rack row — four racks along the back wall
 * ------------------------------------------------------------------ */
function RackRow() {
  // Two rows: back wall (4 racks) + side (1 rack) so the diorama reads as
  // a proper server room rather than just monitors floating over floor.
  const back = [
    { x: -2.4, seed: 1 },
    { x: -0.8, seed: 2 },
    { x: 0.8,  seed: 3 },
    { x: 2.4,  seed: 4 },
  ]
  return (
    <group>
      {back.map((r, i) => (
        <ServerRack
          key={`back-${i}`}
          position={[r.x, 0.13, -2.0]}
          width={1.15}
          depth={0.7}
          height={2.5}
          units={10}
          seed={r.seed}
        />
      ))}
      {/* Side rack — turned 90° so its front faces the aisle */}
      <group position={[-2.8, 0.13, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <ServerRack width={1.15} depth={0.7} height={2.5} units={10} seed={5} />
      </group>
      <group position={[2.8, 0.13, -0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <ServerRack width={1.15} depth={0.7} height={2.5} units={10} seed={6} />
      </group>

    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Cloud drift — a few low-poly white cloud puffs floating over the rack
 * row, a subtle nod to "cloud infrastructure".
 * ------------------------------------------------------------------ */
function CloudDrift() {
  const clouds = [
    { pos: [-2.4, 3.8, -1.6], scale: 0.55, seed: 1.2 },
    { pos: [0.2,  4.2, -2.4], scale: 0.75, seed: 2.4 },
    { pos: [2.6,  3.6, -1.4], scale: 0.6,  seed: 3.7 },
    { pos: [-0.8, 4.6, -2.9], scale: 0.5,  seed: 4.9 },
  ]
  return (
    <group>
      {clouds.map((c, i) => (
        <Cloud key={i} position={c.pos} scale={c.scale} seed={c.seed} />
      ))}
    </group>
  )
}

function Cloud({ position, scale = 1, seed = 0 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * 0.4 + seed) * 0.08
    ref.current.position.x = position[0] + Math.sin(t * 0.2 + seed * 1.3) * 0.15
  })
  const puffs = [
    { x: 0,      y: 0,     r: 0.5  },
    { x: 0.55,   y: 0.05,  r: 0.4  },
    { x: -0.5,   y: 0.02,  r: 0.42 },
    { x: 0.22,   y: 0.28,  r: 0.35 },
    { x: -0.2,   y: 0.28,  r: 0.32 },
  ]
  return (
    <group ref={ref} position={position} scale={scale}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          <icosahedronGeometry args={[p.r, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#f0f6ff"
            emissiveIntensity={0.35}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Cable runs — thick black cable bundles snaking from racks toward the
 * monitor's base, giving the diorama that "wired-up" feel.
 * ------------------------------------------------------------------ */
function CableRuns() {
  const cables = [
    { from: [-2.5, 0.14, -1.65], to: [-0.8, 0.14, 0.2] },
    { from: [-0.85, 0.14, -1.65], to: [-0.2, 0.14, 0.2] },
    { from: [0.85, 0.14, -1.65],  to: [0.3, 0.14, 0.2]  },
    { from: [2.5, 0.14, -1.65],   to: [0.9, 0.14, 0.2]  },
  ]
  return (
    <group>
      {cables.map((c, i) => (
        <Cable key={i} from={c.from} to={c.to} />
      ))}
      {/* Small junction box where cables converge */}
      <mesh position={[0.05, 0.16, 0.25]}>
        <boxGeometry args={[0.5, 0.08, 0.32]} />
        <meshStandardMaterial color={CABLE} roughness={0.7} flatShading />
      </mesh>
    </group>
  )
}

function Cable({ from, to }) {
  const start = new THREE.Vector3(...from)
  const end = new THREE.Vector3(...to)
  const mid = start.clone().lerp(end, 0.5)
  const dir = end.clone().sub(start)
  const len = dir.length()
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  )
  return (
    <mesh position={mid.toArray()} quaternion={q}>
      <cylinderGeometry args={[0.04, 0.04, len, 6]} />
      <meshStandardMaterial color={CABLE} roughness={0.75} flatShading />
    </mesh>
  )
}

/* ------------------------------------------------------------------ *
 * Floating flat-screen monitor — a modern thin-bezel display hovering
 * above the aisle. Its screen area is an <Html transform> holding the
 * IDE terminal that types the bash "about" script.
 * ------------------------------------------------------------------ */
function FloatingMonitor() {
  const rig = useRef()
  const drag = useRef({ active: false, lastX: 0, offset: 0 })
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!rig.current) return
    const t = state.clock.elapsedTime
    rig.current.position.y = Math.sin(t * 0.8) * 0.05
    // User-drag adds an extra yaw offset on top of the Billboard's follow
    rig.current.rotation.y = drag.current.offset
  })
  // 1.2× larger, and thicker (relative depth like the medal's coin body)
  const w = 2.76
  const h = 1.68
  const d = 0.42
  const chassisColor = hovered ? '#2b3040' : '#1c1e26'
  const rimColor = hovered ? '#a4d8ff' : '#3a3f4c'
  const rimEmissive = hovered ? 0.8 : 0
  return (
    <Billboard follow lockX lockZ position={[-1.6, 1.7, 0.6]}>
    <group
      ref={rig}
      position={[0, 0, 0]}
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
      {/* Main slab — outer chassis (brightens on hover for highlight cue) */}
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={chassisColor}
          emissive={hovered ? '#3b6bff' : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
          roughness={0.55}
          metalness={0.55}
          flatShading
        />
      </mesh>
      {/* Slightly-inset front bezel (looks like a "screen bump") */}
      <mesh position={[0, 0, d / 2 - 0.008]}>
        <boxGeometry args={[w - 0.08, h - 0.08, 0.02]} />
        <meshStandardMaterial color="#0f1116" roughness={0.5} metalness={0.6} flatShading />
      </mesh>
      {/* Screen glass — glowing dark */}
      <mesh position={[0, 0, d / 2 + 0.006]}>
        <boxGeometry args={[w - 0.16, h - 0.14, 0.01]} />
        <meshStandardMaterial
          color="#0d1220"
          emissive="#1e2a3f"
          emissiveIntensity={0.55}
          roughness={0.15}
          metalness={0.6}
        />
      </mesh>
      {/* Ventilation slats on the back */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, -d / 2 - 0.005]}>
          <boxGeometry args={[w * 0.6, 0.04, 0.01]} />
          <meshStandardMaterial color="#0a0b10" flatShading />
        </mesh>
      ))}
      {/* Metal rim ring around the front edge */}
      {[
        { pos: [0, h / 2 - 0.02, d / 2 - 0.005], size: [w, 0.03, 0.03] },
        { pos: [0, -h / 2 + 0.02, d / 2 - 0.005], size: [w, 0.03, 0.03] },
        { pos: [-w / 2 + 0.02, 0, d / 2 - 0.005], size: [0.03, h, 0.03] },
        { pos: [w / 2 - 0.02, 0, d / 2 - 0.005], size: [0.03, h, 0.03] },
      ].map((r, i) => (
        <mesh key={i} position={r.pos}>
          <boxGeometry args={r.size} />
          <meshStandardMaterial
            color={rimColor}
            emissive={rimColor}
            emissiveIntensity={rimEmissive}
            roughness={0.4}
            metalness={0.85}
            flatShading
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Bottom brand strip */}
      <mesh position={[0, -h / 2 + 0.05, d / 2 + 0.001]}>
        <boxGeometry args={[0.35, 0.03, 0.005]} />
        <meshStandardMaterial color="#3a3f4c" flatShading />
      </mesh>
      {/* Power LED */}
      <mesh position={[w / 2 - 0.12, -h / 2 + 0.05, d / 2 + 0.001]}>
        <boxGeometry args={[0.024, 0.024, 0.005]} />
        <meshStandardMaterial color="#7ee787" emissive="#7ee787" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>

      {/* Levitation glow beneath — the monitor "hovers" over the aisle */}
      <mesh position={[0, -h / 2 - 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.7, 24]} />
        <meshBasicMaterial color="#7bc7ff" transparent opacity={0.4} />
      </mesh>

      {/* IDE terminal — inside the screen glass */}
      <Html
        transform
        distanceFactor={2.838}
        position={[0, 0.015, d / 2 + 0.02]}
        occlude={false}
        pointerEvents="auto"
      >
        <IdeTerminal />
      </Html>
    </group>
    </Billboard>
  )
}
