import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Reusable low-poly city props for the Work/Experience island.
 *
 *   • Skyscraper — parametric building with lit window grid
 *   • Streetlight — thin pole with a glowing warm bulb
 *   • Car — tiny stylised box-car
 *   • BusinessTree — small trimmed round tree common in office plazas
 *   • Antenna — spike + blinking red light for the tallest tower
 */

/* ------------------------------------------------------------------ *
 * Skyscraper — a multi-floor tower with glowing window rows on all
 * four sides. Height and footprint are parametric. Optional flat-top
 * roof detail (antenna, ledge). Optional accent-stripe colour for
 * corporate branding (e.g. FPT orange).
 * ------------------------------------------------------------------ */
export function Skyscraper({
  position = [0, 0, 0],
  width = 1.2,
  depth = 1.2,
  height = 3.5,
  bodyColor = '#3d4a63',
  windowColor = '#ffdd88',
  accentColor,          // if set, adds a vertical stripe up the front
  hasAntenna = false,
  rooftop = 'flat',     // 'flat' | 'tiered' | 'setback'
  seed = 0,
}) {
  const floors = Math.max(3, Math.floor(height / 0.35))
  const floorH = height / floors

  // Pre-jitter which windows are "lit" (some dark for realism)
  const windowLitPattern = useMemo(() => {
    const rand = mulberry32(Math.floor((seed + 1) * 1000))
    const patt = []
    for (let f = 0; f < floors; f++) {
      const row = []
      for (let w = 0; w < 4; w++) row.push(rand() > 0.25)
      patt.push(row)
    }
    return patt
  }, [floors, seed])

  const cornerY = 0

  return (
    <group position={position}>
      {/* Main body */}
      <mesh position={[0, height / 2 + cornerY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.35} flatShading />
      </mesh>

      {/* Setback tier — if `tiered`, a narrower stack on top */}
      {rooftop === 'tiered' && (
        <mesh position={[0, height + 0.4, 0]} castShadow>
          <boxGeometry args={[width * 0.7, 0.8, depth * 0.7]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.35} flatShading />
        </mesh>
      )}
      {rooftop === 'setback' && (
        <mesh position={[width * 0.15, height + 0.2, depth * 0.15]} castShadow>
          <boxGeometry args={[width * 0.5, 0.4, depth * 0.5]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.35} flatShading />
        </mesh>
      )}

      {/* Rooftop cap / cornice */}
      <mesh position={[0, height + 0.04, 0]}>
        <boxGeometry args={[width + 0.08, 0.08, depth + 0.08]} />
        <meshStandardMaterial color="#2a2f42" roughness={0.7} flatShading />
      </mesh>

      {/* Window rows — 4 sides */}
      {[
        { rot: 0,             pos: [0, 0, depth / 2 + 0.001], side: 'front' },
        { rot: Math.PI,       pos: [0, 0, -depth / 2 - 0.001], side: 'back'  },
        { rot: Math.PI / 2,   pos: [width / 2 + 0.001, 0, 0], side: 'right' },
        { rot: -Math.PI / 2,  pos: [-width / 2 - 0.001, 0, 0], side: 'left' },
      ].map((face, si) => {
        const w = face.side === 'front' || face.side === 'back' ? width : depth
        const winCount = Math.max(2, Math.floor(w / 0.28))
        const winW = (w / winCount) * 0.68
        const winH = floorH * 0.55
        return (
          <group key={si} position={face.pos} rotation={[0, face.rot, 0]}>
            {Array.from({ length: floors }).map((_, f) =>
              Array.from({ length: winCount }).map((_, w) => {
                const lit = windowLitPattern[f]?.[w % 4] ?? true
                const x = (w - (winCount - 1) / 2) * (winW * 1.5)
                const y = f * floorH + floorH * 0.5
                return (
                  <mesh key={`${f}-${w}`} position={[x, y, 0.001]}>
                    <planeGeometry args={[winW, winH]} />
                    <meshStandardMaterial
                      color={lit ? windowColor : '#1a1e2f'}
                      emissive={lit ? windowColor : '#000000'}
                      emissiveIntensity={lit ? 1.1 : 0}
                      toneMapped={false}
                    />
                  </mesh>
                )
              }),
            )}
          </group>
        )
      })}

      {/* Accent vertical stripe (front face only) */}
      {accentColor && (
        <mesh position={[0, height / 2, depth / 2 + 0.005]}>
          <planeGeometry args={[width * 0.15, height * 0.9]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      )}

      {hasAntenna && <Antenna position={[0, height + 0.5, 0]} />}
    </group>
  )
}

/**
 * Rooftop antenna — a thin spike with a blinking red aviation light.
 */
export function Antenna({ position = [0, 0, 0] }) {
  const lightRef = useRef()
  useFrame((state) => {
    if (!lightRef.current) return
    // Blink once per second
    const t = state.clock.elapsedTime
    const on = Math.floor(t) % 2 === 0
    lightRef.current.material.emissiveIntensity = on ? 2.5 : 0.3
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.8, 4]} />
        <meshStandardMaterial color="#3a3f4c" flatShading />
      </mesh>
      <mesh ref={lightRef} position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial
          color="#ff4a3a"
          emissive="#ff4a3a"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Streetlight — tall thin pole with a warm bulb
 * ------------------------------------------------------------------ */
export function Streetlight({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Base */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 6]} />
        <meshStandardMaterial color="#2a2f42" flatShading />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 1.0, 6]} />
        <meshStandardMaterial color="#3a3f4c" flatShading />
      </mesh>
      {/* Arm */}
      <mesh position={[0.09, 1.05, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.03]} />
        <meshStandardMaterial color="#3a3f4c" flatShading />
      </mesh>
      {/* Lamp */}
      <mesh position={[0.18, 1.02, 0]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial
          color="#fff2c8"
          emissive="#ffe28a"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
      {/* Point-light so it actually illuminates */}
      <pointLight position={[0.18, 1.02, 0]} intensity={0.4} distance={2} color="#ffe28a" />
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Tiny car — a stylised box-car
 * ------------------------------------------------------------------ */
export function Car({ position = [0, 0, 0], rotationY = 0, color = '#e05a5a' }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Body */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.34, 0.12, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} flatShading />
      </mesh>
      {/* Cabin */}
      <mesh position={[-0.02, 0.16, 0]}>
        <boxGeometry args={[0.2, 0.08, 0.18]} />
        <meshStandardMaterial color="#2a2f42" roughness={0.3} metalness={0.7} flatShading />
      </mesh>
      {/* Wheels */}
      {[[-0.12, 0.03, 0.11], [0.12, 0.03, 0.11], [-0.12, 0.03, -0.11], [0.12, 0.03, -0.11]].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 6]} />
          <meshStandardMaterial color="#0f1220" roughness={0.9} flatShading />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[0.175, 0.08, 0.07]}>
        <sphereGeometry args={[0.02, 6, 4]} />
        <meshStandardMaterial color="#fff4d4" emissive="#fff4d4" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh position={[0.175, 0.08, -0.07]}>
        <sphereGeometry args={[0.02, 6, 4]} />
        <meshStandardMaterial color="#fff4d4" emissive="#fff4d4" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Business tree — small trimmed round tree common in office plazas
 * ------------------------------------------------------------------ */
export function BusinessTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 6]} />
        <meshStandardMaterial color="#6b4423" flatShading />
      </mesh>
      {/* Round crown */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#4d9b3a" roughness={0.7} flatShading />
      </mesh>
      {/* Small planter box */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.28, 0.06, 0.28]} />
        <meshStandardMaterial color="#8b7d68" flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Deterministic PRNG (mulberry32) — kept local so this file has no
 * cross-dependencies. Same as the one in NatureProps.
 * ------------------------------------------------------------------ */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
