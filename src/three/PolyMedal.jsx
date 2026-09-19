import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Procedural low-poly HUST medal — every element is real 3D geometry
 * (no baked image). Faithful to the reference design:
 *
 *   ┌───────  ĐẠI HỌC BÁCH KHOA HÀ NỘI  ───────┐
 *   │              ★                            │
 *   │         ╱ graduation ╲                    │
 *   │    ~~~ (   cap on   ) ~~~   ← laurel wreath
 *   │         ╲  diploma  ╱                    │
 *   │            ▟ 2025 ▙  ← ribbon banner      │
 *   │           TỐT NGHIỆP                      │
 *   │            XUẤT SẮC                       │
 *   └── HANOI UNIVERSITY OF SCIENCE AND TECHNOLOGY
 *
 * Fonts: `NotoSans-Vietnamese-Bold.woff` (has Vietnamese diacritics)
 *        `NotoSans-Bold.woff` (Latin)
 */

// Base-aware font paths so they resolve under Vite's base (dev '/' /
// GitHub Pages project-site '/portfolio/'). Runtime string literals
// aren't rewritten by Vite, so we must prefix manually.
const BASE = import.meta.env.BASE_URL || '/'
const FONT_VN = `${BASE}fonts/NotoSans-Vietnamese-Bold.woff`
const FONT_EN = `${BASE}fonts/NotoSans-Bold.woff`

const GOLD_LIGHT = '#f6d47a'
const GOLD_MID   = '#e0a94a'
const GOLD_DEEP  = '#a86c1e'
const RIBBON_RED = '#c94d3a'

export default function PolyMedal({ position = [0, 0, 0], withBox = true }) {
  const boxRef = useRef()
  const medalRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const mouseTarget = useRef({ x: 0, y: 0 })

  // Small user-drag offset (pointer-drag rotates the medal)
  const drag = useRef({ active: false, lastX: 0, lastY: 0, offsetY: 0, offsetX: 0 })

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!medalRef.current) return

    // At rest, aim the medal's front face straight at the isometric camera
    // (positioned at ~[9, 5.2, 11] in Scene.jsx). Camera azimuth in XZ:
    // atan2(9, 11) ≈ 0.686 rad ≈ 39.3°. Add a gentle swing around that.
    const REST_Y = 0.686
    const wobbleY = REST_Y + Math.sin(t * 0.35) * 0.4125  // ±16° amplitude
    const wobbleX = Math.sin(t * 0.25) * 0.09
    const flipY = flipped ? Math.PI : 0

    medalRef.current.rotation.y = wobbleY + flipY + drag.current.offsetY
    medalRef.current.rotation.x = wobbleX + drag.current.offsetX

    // Floating bob — steady bob only; no hover-lift (used to jump 0.15
    // up on cursor-over which read as jittery)
    medalRef.current.position.y = Math.sin(t * 0.9) * 0.08
    if (boxRef.current) {
      boxRef.current.rotation.y = Math.sin(t * 0.2) * 0.04
    }
  })

  return (
    <group position={position}>
      {withBox && (
        <group ref={boxRef}>
          <VelvetBox />
        </group>
      )}
      <group
        ref={medalRef}
        position={[0, withBox ? 0.05 : 0.35, 0]}
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
          drag.current.lastY = e.clientY
          document.body.style.cursor = 'grabbing'
          e.target.setPointerCapture?.(e.pointerId)
        }}
        onPointerMove={(e) => {
          mouseTarget.current.x = ((e.clientX / window.innerWidth) - 0.5) * 2
          mouseTarget.current.y = ((e.clientY / window.innerHeight) - 0.5) * 2
          if (drag.current.active) {
            const dx = e.clientX - drag.current.lastX
            const dy = e.clientY - drag.current.lastY
            drag.current.offsetY += dx * 0.01
            drag.current.offsetX = THREE.MathUtils.clamp(
              drag.current.offsetX + dy * 0.008, -0.6, 0.6,
            )
            drag.current.lastX = e.clientX
            drag.current.lastY = e.clientY
          }
        }}
        onPointerUp={(e) => {
          drag.current.active = false
          document.body.style.cursor = 'grab'
          e.target.releasePointerCapture?.(e.pointerId)
        }}
        onDoubleClick={(e) => { e.stopPropagation(); setFlipped((f) => !f) }}
      >
        <MedalCoin hovered={hovered} />
        {hovered && <Sparkles />}
      </group>
      {/* Warm accent lights — strong enough for a rich golden glow */}
      <spotLight
        position={[0, 3.5, 2]}
        angle={0.5}
        penumbra={0.85}
        intensity={hovered ? 2.6 : 2.0}
        color="#fff0b8"
        target-position={[0, 0, 0]}
      />
      <pointLight position={[0, 0.5, 1.2]} intensity={0.9} distance={4} color="#ffce6a" />
      <pointLight position={[0, -1, 1.0]} intensity={0.4} distance={3} color="#ffb050" />
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Velvet box (used when withBox=true; standalone display without a box
 * in the Education scene puts the medal on a stone pedestal instead)
 * ------------------------------------------------------------------ */
function VelvetBox() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[2.4, 0.4, 2.4]} />
        <meshStandardMaterial color="#a06835" roughness={0.75} metalness={0.15} flatShading />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[2.1, 0.04, 2.1]} />
        <meshStandardMaterial color="#ffb3c1" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.02, 24]} />
        <meshStandardMaterial color="#e58aa0" roughness={1.0} flatShading />
      </mesh>
      <group position={[0, 0.02, -1.15]} rotation={[-Math.PI / 3.2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.4, 0.12, 2.4]} />
          <meshStandardMaterial color="#a06835" roughness={0.75} metalness={0.15} flatShading />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[2.1, 0.02, 2.1]} />
          <meshStandardMaterial color="#ff9b7a" roughness={1.0} flatShading />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * The medal itself — all-3D, no textures.
 * ------------------------------------------------------------------ */
function MedalCoin({ hovered = false }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Coin body — bright polished gold with a warm self-glow */}
      <mesh castShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.11, 48]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          emissive={hovered ? '#ffdc7a' : '#f2b040'}
          emissiveIntensity={hovered ? 0.7 : 0.45}
          roughness={0.45}
          metalness={0.75}
        />
      </mesh>
      {/* Inner rim ring on the front face (visual accent, no depth) */}
      <mesh position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 0.9, 48]} />
        <meshStandardMaterial color={GOLD_DEEP} metalness={0.7} roughness={0.55} />
      </mesh>
      {/* Mirror rim on the back face */}
      <mesh position={[0, -0.056, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 0.9, 48]} />
        <meshStandardMaterial color={GOLD_DEEP} metalness={0.7} roughness={0.55} />
      </mesh>
      {/* Front face plate — a slightly-raised polished disc that the emblem
          and text sit on. Warm gold glow. */}
      <mesh position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.87, 48]} />
        <meshStandardMaterial
          color="#ffe08a"
          emissive="#ffc85a"
          emissiveIntensity={0.55}
          roughness={0.5}
          metalness={0.55}
        />
      </mesh>

      {/* --- Front face (local Y axis is out-of-face along +Z world) --- */}
      <group position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Top curved text */}
        <CurvedText
          text="ĐẠI HỌC BÁCH KHOA HÀ NỘI"
          radius={0.75}
          angleStart={Math.PI * 0.85}
          angleEnd={Math.PI * 0.15}
          fontSize={0.075}
          color={GOLD_DEEP}
          font={FONT_VN}
          letterSpacing={0.02}
        />

        {/* Star between wreath tops, above the cap */}
        <Star position={[0, 0.34, 0.015]} outerR={0.06} innerR={0.026} depth={0.012} />

        {/* Laurel wreath — two arcs, opening at the top */}
        <Wreath />

        {/* Center emblem: graduation cap on diploma */}
        <group position={[0, 0.02, 0.02]}>
          <DiplomaScroll />
          <GraduationCap />
        </group>

        {/* Ribbon banner with "2025" */}
        <RibbonBanner text="2025" position={[0, -0.32, 0.02]} width={0.5} height={0.14} />

        {/* Vietnamese "TỐT NGHIỆP / XUẤT SẮC" — below the wreath, above
            the outer arc of English text. Pushed out on Z so no wreath
            leaf occludes it. */}
        <Text
          position={[0, -0.55, 0.12]}
          fontSize={0.062}
          font={FONT_VN}
          color={GOLD_DEEP}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          TỐT NGHIỆP
        </Text>
        <Text
          position={[0, -0.63, 0.12]}
          fontSize={0.062}
          font={FONT_VN}
          color={GOLD_DEEP}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          XUẤT SẮC
        </Text>

        {/* Bottom curved English text — hugging the rim */}
        <CurvedText
          text="HANOI UNIVERSITY OF SCIENCE AND TECHNOLOGY"
          radius={0.82}
          angleStart={-Math.PI * 0.9}
          angleEnd={-Math.PI * 0.1}
          fontSize={0.045}
          color={GOLD_DEEP}
          font={FONT_EN}
          letterSpacing={0.02}
          flipped
        />
      </group>

      {/* Back face — code motif easter egg.
          Rotation composes with the parent's [PI/2, 0, 0] to give an
          effective world rotation of RotY(180°): back-face normal points to
          world -Z and text +Y stays up. */}
      <group position={[0, -0.056, 0]} rotation={[-Math.PI / 2, Math.PI, 0]}>
        <mesh position={[0, 0, -0.002]}>
          <ringGeometry args={[0.55, 0.62, 40]} />
          <meshStandardMaterial color={GOLD_DEEP} metalness={0.9} roughness={0.35} />
        </mesh>
        <Text
          position={[0, 0.05, 0.001]}
          fontSize={0.14}
          color="#3a1a0a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.02}
          font={FONT_EN}
        >
          $ chmod +x future
        </Text>
        <Text
          position={[0, -0.12, 0.001]}
          fontSize={0.08}
          color="#3a1a0a"
          anchorX="center"
          anchorY="middle"
          font={FONT_EN}
        >
          — HUST · IT2 · SoICT —
        </Text>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Curved text — places each character along a circular arc, tangent-
 * oriented so it reads correctly along the top OR bottom of the coin.
 * ------------------------------------------------------------------ */
function CurvedText({
  text,
  radius,
  angleStart,
  angleEnd,
  fontSize = 0.08,
  color = '#5a3a10',
  font,
  letterSpacing = 0,
  flipped = false,      // set true for bottom arc so text isn't upside-down
}) {
  const chars = text.split('')
  const step = chars.length > 1 ? (angleStart - angleEnd) / (chars.length - 1) : 0
  return (
    <group>
      {chars.map((c, i) => {
        // For a bottom arc we want text to read left-to-right ALONG the arc
        // with letters standing UP (feet toward center, heads toward rim).
        const angle = flipped
          ? angleEnd + step * (chars.length - 1 - i)
          : angleStart - step * i
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        // Char's local +Y axis should point away from the disc center for
        // top arcs, and toward the center (upside-down) for bottom arcs.
        const rot = flipped ? angle + Math.PI / 2 : angle - Math.PI / 2
        return (
          <Text
            key={i}
            position={[x, y, 0.006]}
            rotation={[0, 0, rot]}
            fontSize={fontSize}
            color={color}
            font={font}
            anchorX="center"
            anchorY="middle"
            letterSpacing={letterSpacing}
          >
            {c === ' ' ? ' ' : c}
          </Text>
        )
      })}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Laurel wreath — two arcs of leaves meeting at the bottom and opening
 * at the top (where the star and cap live).
 * ------------------------------------------------------------------ */
function Wreath() {
  const leaves = useMemo(() => {
    const arr = []
    const LEAF_COUNT = 10
    // Left side arc from bottom (-Math.PI/2) to top-left (Math.PI - 0.4)
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < LEAF_COUNT; i++) {
        const t = i / (LEAF_COUNT - 1)
        // Sweep from just past the bottom (angle -Math.PI/2 + 0.15) up to
        // about 60° short of the top (angle ~Math.PI/2 - 0.6)
        const startDeg = -75
        const endDeg = 60
        const deg = startDeg + t * (endDeg - startDeg)
        const angleRad = deg * (Math.PI / 180)
        const r = 0.5 + Math.sin(t * Math.PI) * 0.02
        const x = Math.cos(angleRad) * r * side
        const y = Math.sin(angleRad) * r
        // Leaf orientation: tangent to the arc, tilted outward
        const rot = angleRad * side + (side < 0 ? Math.PI : 0) - Math.PI / 2
        arr.push({ x, y, rot, scale: 0.85 + Math.sin(t * Math.PI) * 0.2, side })
      }
    }
    return arr
  }, [])

  return (
    <group position={[0, 0, 0.005]}>
      {leaves.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, 0]} rotation={[0, 0, l.rot]} scale={l.scale}>
          {/* Low-poly leaf approximated by a stretched tetrahedron */}
          <tetrahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial
            color={GOLD_MID}
            emissive={GOLD_DEEP}
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.9}
            flatShading
          />
        </mesh>
      ))}
      {/* Ribbon knot at the base of the wreath */}
      <mesh position={[0, -0.46, 0.005]}>
        <boxGeometry args={[0.14, 0.06, 0.015]} />
        <meshStandardMaterial color={GOLD_DEEP} roughness={0.35} metalness={0.9} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Graduation cap — a flat mortarboard tilted on top of a small block,
 * with a tassel dangling to one side.
 * ------------------------------------------------------------------ */
function GraduationCap() {
  // All elements have small Z-extent so the cap sits as a flat medallion
  // relief on the coin's front face rather than piercing through the coin.
  return (
    <group position={[0, 0.05, 0.03]}>
      {/* Head band — small trapezoid, camera-facing */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.18, 0.06, 0.03]} />
        <meshStandardMaterial color={GOLD_DEEP} metalness={0.9} roughness={0.35} flatShading />
      </mesh>
      {/* Mortarboard — flat rhombus (square rotated 45°) sitting above the
          head-band. Thin in Z so it lies against the coin face. */}
      <mesh position={[0, 0.01, 0.01]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.28, 0.28, 0.025]} />
        <meshStandardMaterial color={GOLD_LIGHT} metalness={0.9} roughness={0.3} flatShading />
      </mesh>
      {/* Small button on top of the mortarboard */}
      <mesh position={[0, 0.01, 0.03]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshStandardMaterial color={GOLD_DEEP} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Tassel — draped over the front-right corner of the mortarboard */}
      <mesh position={[0.17, -0.02, 0.02]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.008, 0.012, 0.13, 5]} />
        <meshStandardMaterial color={RIBBON_RED} flatShading />
      </mesh>
      <mesh position={[0.19, -0.09, 0.025]}>
        <sphereGeometry args={[0.025, 6, 4]} />
        <meshStandardMaterial color={RIBBON_RED} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Diploma scroll — a small rolled tube behind/under the cap with a
 * red ribbon around it.
 * ------------------------------------------------------------------ */
function DiplomaScroll() {
  // Flat relief: a thin cylinder pressed against the coin face at Z≈0.02
  return (
    <group position={[0, -0.11, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
      {/* Rolled paper — thin cylinder lying horizontal, axis along world X */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.34, 12]} />
        <meshStandardMaterial color="#fff4e0" roughness={0.7} metalness={0.05} flatShading />
      </mesh>
      {/* End caps darker to suggest the roll */}
      <mesh position={[-0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.058, 0.058, 0.02, 12]} />
        <meshStandardMaterial color="#e8d3a0" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.058, 0.058, 0.02, 12]} />
        <meshStandardMaterial color="#e8d3a0" roughness={0.8} flatShading />
      </mesh>
      {/* Red ribbon wound around the middle */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.06, 0.014, 8, 20]} />
        <meshStandardMaterial color={RIBBON_RED} roughness={0.6} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Ribbon banner — an extruded trapezoid with folded tails
 * ------------------------------------------------------------------ */
function RibbonBanner({ text, position = [0, 0, 0], width = 0.5, height = 0.14 }) {
  const shape = useMemo(() => buildRibbonShape(width, height), [width, height])
  return (
    <group position={position}>
      {/* Banner body */}
      <mesh castShadow>
        <extrudeGeometry
          args={[shape, { depth: 0.015, bevelEnabled: false, curveSegments: 2 }]}
        />
        <meshStandardMaterial color={RIBBON_RED} roughness={0.55} metalness={0.2} flatShading />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 0, 0.025]}
        fontSize={0.07}
        color="#fff4e0"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        font={FONT_EN}
      >
        {text}
      </Text>
      {/* Small fold triangles on both ends — makes it look like a real ribbon */}
      <mesh position={[-width / 2 - 0.02, -0.04, 0.008]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.08, 3]} />
        <meshStandardMaterial color="#8b2e22" flatShading />
      </mesh>
      <mesh position={[width / 2 + 0.02, -0.04, 0.008]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.08, 3]} />
        <meshStandardMaterial color="#8b2e22" flatShading />
      </mesh>
    </group>
  )
}

function buildRibbonShape(width, height) {
  // A gently swagged trapezoid — flat on top, dipping in the middle at bottom.
  const s = new THREE.Shape()
  const w = width / 2
  const h = height / 2
  s.moveTo(-w, h)
  s.lineTo(w, h)
  s.lineTo(w * 0.95, -h * 0.6)
  s.quadraticCurveTo(0, -h * 1.15, -w * 0.95, -h * 0.6)
  s.lineTo(-w, h)
  return s
}

/* ------------------------------------------------------------------ *
 * Small 5-pointed star (extruded)
 * ------------------------------------------------------------------ */
function Star({ position = [0, 0, 0], outerR = 0.06, innerR = 0.026, depth = 0.01 }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const pts = 5
    const step = Math.PI / pts
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const a = i * step - Math.PI / 2
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      if (i === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    }
    s.closePath()
    return s
  }, [outerR, innerR])
  return (
    <mesh position={position}>
      <extrudeGeometry args={[shape, { depth, bevelEnabled: false, curveSegments: 2 }]} />
      <meshStandardMaterial color={GOLD_LIGHT} metalness={0.95} roughness={0.25} flatShading />
    </mesh>
  )
}

/* ------------------------------------------------------------------ *
 * Sparkles floating around on hover
 * ------------------------------------------------------------------ */
function Sparkles() {
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <Float
          key={i}
          speed={2 + i * 0.3}
          rotationIntensity={2}
          floatIntensity={0.6}
          floatingRange={[0, 0.2]}
        >
          <mesh
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 1.2,
              0.3 + (i % 2) * 0.4,
              Math.sin((i / 6) * Math.PI * 2) * 1.2,
            ]}
          >
            <tetrahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color={GOLD_LIGHT} toneMapped={false} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
