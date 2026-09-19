import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

import { SECTIONS } from '../data/profile.js'
import HeroIsland from './scenes/HeroIsland.jsx'
import EducationIsland from './scenes/EducationIsland.jsx'
import WorkIsland from './scenes/WorkIsland.jsx'
import FutureIsland from './scenes/FutureIsland.jsx'
import ContactIsland from './scenes/ContactIsland.jsx'

/**
 * Floating-island carousel.
 *
 * Islands are laid out on the X axis at fixed positions (SPACING units
 * apart). The whole rig translates on X so the "active" island sits at
 * x=0 in front of a fixed isometric camera. Navigation is discrete: each
 * left/right input snaps to the next island with an 800ms easing curve.
 *
 * Only the Medal (Education) Island is fully built out — the others are
 * placeholders while the user verifies the design one at a time.
 */

const SPACING = 16                // world-space distance between island centers
const SECTION_COUNT = SECTIONS.length
// Isometric-diorama angle — high enough to see the top, low enough to
// clearly show the cube's stacked layers on the two visible side faces.
const CAMERA_POS = [9, 5.2, 11]
const CAMERA_LOOK = [0, -0.4, 0]

/**
 * Slides the whole island rig on X so `active` is centred at x=0.
 * Uses easeOutCubic for a snappy but soft snap.
 */
function IslandRig({ active, children }) {
  const ref = useRef()
  const currentX = useRef(-active * SPACING)

  useFrame((_, dt) => {
    if (!ref.current) return
    const targetX = -active * SPACING
    // Ease toward target — dt-independent lerp with a snappy time constant
    const k = 1 - Math.pow(0.001, dt)
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX, k)
    ref.current.position.x = currentX.current
  })

  return <group ref={ref}>{children}</group>
}

/**
 * Placeholder island — a plain layered cube with a coloured tag on top.
 * Used for stages we haven't rebuilt for the carousel yet.
 */
function PlaceholderIsland({ label, tint = '#7bb444' }) {
  return (
    <group>
      {[
        { color: '#3d322a', height: 0.6, taper: 0.75 },
        { color: '#5b4d3f', height: 0.5, taper: 0.86 },
        { color: '#a06835', height: 0.4, taper: 0.95 },
        { color: tint,      height: 0.15, taper: 1.0 },
      ].reduce((acc, l) => {
        const totalH = acc.total + l.height
        const centerY = -acc.total - l.height / 2
        acc.stack.push(
          <mesh key={acc.stack.length} position={[0, centerY, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.5 * l.taper, l.height, 6.5 * l.taper]} />
            <meshStandardMaterial color={l.color} roughness={0.9} flatShading />
          </mesh>
        )
        acc.total = totalH
        return acc
      }, { stack: [], total: 0 }).stack}
      {/* Simple pillar with a floating tag */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 6]} />
        <meshStandardMaterial color="#e0c399" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2, 0.6, 0.2]} />
        <meshStandardMaterial color={tint} roughness={0.7} flatShading />
      </mesh>
      {/* We'd render label text here but Text has extra cost during nav —
          keep placeholders lightweight until we build each stage out. */}
    </group>
  )
}

const BG_LIGHT = '#dcd1bd'   // warm cream
const BG_DARK  = '#131826'   // deep near-navy

export default function Scene({ activeIndex = 0, theme = 'light', onSectionChange }) {
  // Report section changes so overlay can highlight the nav dots.
  useEffect(() => {
    onSectionChange?.(activeIndex)
  }, [activeIndex, onSectionChange])

  const bg = theme === 'dark' ? BG_DARK : BG_LIGHT

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: CAMERA_POS, fov: 38, near: 0.1, far: 200 }}
      shadows
      onCreated={({ camera }) => camera.lookAt(...CAMERA_LOOK)}
    >
      {/* Background + fog swap with theme; islands themselves stay warm */}
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 30, 90]} />

      {/* Balanced studio lighting — like a diorama on display */}
      <ambientLight intensity={0.55} color="#fff4e0" />
      <hemisphereLight args={['#cfe6f5', '#c78b52', 0.5]} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.1}
        color="#fff2d4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-5, 4, -4]} intensity={0.25} color="#b8d5ff" />

      <IslandRig active={activeIndex}>
        {SECTIONS.map((sec, i) => (
          <group key={sec.id} position={[i * SPACING, 0, 0]}>
            {sec.id === 'hero' ? (
              <HeroIsland />
            ) : sec.id === 'education' ? (
              <EducationIsland />
            ) : sec.id === 'experience' ? (
              <WorkIsland />
            ) : sec.id === 'future' ? (
              <FutureIsland />
            ) : sec.id === 'contact' ? (
              <ContactIsland />
            ) : (
              <PlaceholderIsland
                label={sec.label}
                tint={placeholderTint(i)}
              />
            )}
          </group>
        ))}
      </IslandRig>

      <EffectComposer disableNormalPass multisampling={0}>
        <Vignette eskil={false} offset={0.3} darkness={0.35} />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
    </Canvas>
  )
}

function placeholderTint(i) {
  return ['#7ec850', '#e0a563', '#f5c86a', '#c94d3a', '#7fd0e0', '#d3b8ff'][i % 6]
}

export { SPACING, SECTION_COUNT }
