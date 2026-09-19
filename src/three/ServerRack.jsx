import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Server rack — a tall dark cabinet with horizontal rack-unit slots and a
 * grid of blinking LED status indicators on the front. Each LED breathes
 * independently and a few are "activity" LEDs that flicker at a faster
 * rate so the rack reads as "live infrastructure".
 */

const CABINET      = '#1c1e26'
const BEZEL        = '#0f1116'
const RIM          = '#2a2d38'
const SLOT_BG      = '#0a0b10'
const LED_GREEN    = '#7ee787'
const LED_AMBER    = '#f5c86a'
const LED_BLUE     = '#7bc7ff'
const LED_RED      = '#ff5a5a'

export function ServerRack({
  position = [0, 0, 0],
  width = 0.9,
  depth = 0.55,
  height = 2.0,
  units = 8,        // number of rack-unit slots
  seed = 0,
}) {
  return (
    <group position={position}>
      {/* Base plinth (a bit wider) */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.08, 0.12, depth + 0.08]} />
        <meshStandardMaterial color={BEZEL} roughness={0.65} metalness={0.35} flatShading />
      </mesh>

      {/* Cabinet body */}
      <mesh position={[0, 0.12 + height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={CABINET} roughness={0.55} metalness={0.45} flatShading />
      </mesh>

      {/* Front recessed bezel — slightly darker frame */}
      <mesh position={[0, 0.12 + height / 2, depth / 2 + 0.001]}>
        <boxGeometry args={[width - 0.12, height - 0.14, 0.02]} />
        <meshStandardMaterial color={BEZEL} roughness={0.6} metalness={0.4} flatShading />
      </mesh>

      {/* Rack unit slots — each slot has its own front element */}
      <RackUnits
        origin={[0, 0.12, depth / 2 + 0.015]}
        width={width - 0.16}
        height={height - 0.18}
        units={units}
        seed={seed}
      />

      {/* Rack top cap */}
      <mesh position={[0, 0.12 + height + 0.03, 0]}>
        <boxGeometry args={[width + 0.06, 0.06, depth + 0.06]} />
        <meshStandardMaterial color={RIM} roughness={0.55} metalness={0.5} flatShading />
      </mesh>
    </group>
  )
}

function RackUnits({ origin, width, height, units, seed }) {
  const unitH = height / units

  // Precompute a per-unit spec (type = server/switch/blank/disk-array)
  const specs = useMemo(() => {
    const rand = mulberry32(Math.floor(seed * 1000) + 42)
    const arr = []
    for (let i = 0; i < units; i++) {
      const roll = rand()
      let type
      if (roll < 0.55)      type = 'server'
      else if (roll < 0.7)  type = 'switch'
      else if (roll < 0.82) type = 'disk'
      else if (roll < 0.92) type = 'blank'
      else                  type = 'display'
      arr.push({ type, seed: rand() * 100 })
    }
    return arr
  }, [units, seed])

  return (
    <group position={origin}>
      {specs.map((s, i) => {
        const y = i * unitH + unitH / 2
        return (
          <group key={i} position={[0, y, 0]}>
            {/* Slot background */}
            <mesh>
              <boxGeometry args={[width, unitH - 0.008, 0.01]} />
              <meshStandardMaterial color={SLOT_BG} roughness={0.7} flatShading />
            </mesh>
            <RackUnit type={s.type} width={width} height={unitH} seed={s.seed} />
          </group>
        )
      })}
    </group>
  )
}

function RackUnit({ type, width, height, seed }) {
  switch (type) {
    case 'server':  return <UnitServer  width={width} height={height} seed={seed} />
    case 'switch':  return <UnitSwitch  width={width} height={height} seed={seed} />
    case 'disk':    return <UnitDisk    width={width} height={height} seed={seed} />
    case 'display': return <UnitDisplay width={width} height={height} seed={seed} />
    case 'blank':
    default:        return <UnitBlank   width={width} height={height} />
  }
}

/**
 * 1U rack server — thin horizontal slot with 2 LEDs on the left, a
 * ventilation strip in the middle, and one blinking activity LED on the
 * right that pulses at a faster rate.
 */
function UnitServer({ width, height, seed }) {
  const activityRef = useRef()
  const powerRef = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (activityRef.current) {
      // Random blinking pattern for "network activity"
      const on = Math.sin(t * 8 + seed) > (0.2 + Math.sin(t + seed) * 0.3)
      activityRef.current.material.emissiveIntensity = on ? 2.2 : 0.15
    }
    if (powerRef.current) {
      // Gentle breathe for power light
      powerRef.current.material.emissiveIntensity = 1.4 + Math.sin(t * 1.5 + seed) * 0.3
    }
  })
  const led = 0.02
  const half = width / 2
  return (
    <group position={[0, 0, 0.005]}>
      {/* Power LED (green) */}
      <mesh ref={powerRef} position={[-half + 0.05, 0, 0]}>
        <boxGeometry args={[led * 1.3, led, 0.005]} />
        <meshStandardMaterial color={LED_GREEN} emissive={LED_GREEN} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* Static LED (amber) */}
      <mesh position={[-half + 0.09, 0, 0]}>
        <boxGeometry args={[led * 1.3, led, 0.005]} />
        <meshStandardMaterial color={LED_AMBER} emissive={LED_AMBER} emissiveIntensity={1.0} toneMapped={false} />
      </mesh>
      {/* Vent strip in the middle */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width * 0.35, height * 0.4, 0.003]} />
        <meshStandardMaterial color="#1a1c25" roughness={0.9} flatShading />
      </mesh>
      {/* Activity LED (blue, blinking) */}
      <mesh ref={activityRef} position={[half - 0.06, 0, 0]}>
        <boxGeometry args={[led * 1.3, led, 0.005]} />
        <meshStandardMaterial color={LED_BLUE} emissive={LED_BLUE} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * Switch — a row of 8 tiny link-status LEDs
 */
function UnitSwitch({ width, height, seed }) {
  const ledsRef = useRef()
  const ledsCount = 8
  useFrame((state) => {
    if (!ledsRef.current) return
    const t = state.clock.elapsedTime
    ledsRef.current.children.forEach((led, i) => {
      const on = Math.sin(t * 4 + i * 0.7 + seed) > -0.4
      led.material.emissiveIntensity = on ? 1.6 : 0.15
    })
  })
  const spacing = (width * 0.85) / ledsCount
  return (
    <group ref={ledsRef} position={[0, 0, 0.005]}>
      {Array.from({ length: ledsCount }).map((_, i) => (
        <mesh key={i} position={[(i - (ledsCount - 1) / 2) * spacing, 0, 0]}>
          <boxGeometry args={[0.015, 0.015, 0.005]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? LED_AMBER : LED_GREEN}
            emissive={i % 3 === 0 ? LED_AMBER : LED_GREEN}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Disk array — a row of drive bays with tiny activity LEDs
 */
function UnitDisk({ width, height, seed }) {
  const bays = 4
  const bayW = (width * 0.9) / bays
  return (
    <group position={[0, 0, 0.005]}>
      {Array.from({ length: bays }).map((_, i) => {
        const x = (i - (bays - 1) / 2) * bayW
        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Drive bay handle */}
            <mesh>
              <boxGeometry args={[bayW * 0.85, height * 0.7, 0.005]} />
              <meshStandardMaterial color="#22252f" roughness={0.6} flatShading />
            </mesh>
            {/* Drive LED (green) */}
            <BlinkingLed color={LED_GREEN} seed={seed + i} position={[bayW * 0.32, 0, 0.003]} />
          </group>
        )
      })}
    </group>
  )
}

/**
 * Display unit — a small dim screen with a fake status readout
 */
function UnitDisplay({ width, height, seed }) {
  const screenRef = useRef()
  useFrame((state) => {
    if (!screenRef.current) return
    screenRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime + seed) * 0.1
  })
  return (
    <group position={[0, 0, 0.005]}>
      <mesh ref={screenRef} position={[0, 0, 0]}>
        <boxGeometry args={[width * 0.4, height * 0.65, 0.005]} />
        <meshStandardMaterial
          color="#0d1a2a"
          emissive="#3aa3d8"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      {/* "text" lines */}
      {[-0.008, 0, 0.008].map((y, i) => (
        <mesh key={i} position={[-width * 0.04, y, 0.001]}>
          <boxGeometry args={[width * 0.24, 0.004, 0.001]} />
          <meshBasicMaterial color="#7ee787" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function UnitBlank({ width, height }) {
  return (
    <mesh position={[0, 0, 0.003]}>
      <boxGeometry args={[width * 0.9, height * 0.65, 0.003]} />
      <meshStandardMaterial color="#14161c" roughness={0.8} flatShading />
    </mesh>
  )
}

function BlinkingLed({ color, seed, position }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const on = Math.sin(state.clock.elapsedTime * 6 + seed) > 0.3
    ref.current.material.emissiveIntensity = on ? 1.8 : 0.15
  })
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.012, 0.012, 0.004]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} toneMapped={false} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
