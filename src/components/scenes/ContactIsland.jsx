import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

import {
  IslandFoundation,
  FloatingRig,
} from '../../three/Island.jsx'
import { SOCIALS } from '../../data/socials.js'
import { Icon } from '../ui/Icons.jsx'

/**
 * Contact Island — hot-air balloons drifting over a rocky brown mountain.
 *
 * Mountain is shoved into the back-left corner (farthest from the
 * isometric camera) and shaped asymmetrically — no perfect cones. Rest
 * of the plot is open ground so the balloons breathe. Icons are painted
 * onto the balloon canvas via screen-space HTML anchors: no chip, no
 * background, just the glyph glowing on the envelope.
 */

const SIZE = 6.5
const HALF = SIZE / 2

// Warm sunset palette so each balloon reads distinct without clashing.
const BALLOON_TINTS = ['#e5563d', '#f2a03d', '#4ecdc4', '#e93f8f']

export default function ContactIsland() {
  return (
    <FloatingRig seed={7}>
      {/* Rocky brown-mountain foundation */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: '#3a2418', height: 0.6 },   // deep bedrock
          { color: '#5a3c26', height: 0.5 },   // rust rock
          { color: '#7c5836', height: 0.45 },  // sandstone
          { color: '#8f6c46', height: 0.35 },  // dusty tan
        ]}
      />

      {/* Ground plate on top of the foundation */}
      <GroundTop />

      {/* Three great pyramids spread along the plot's diagonal */}
      <GreatPyramids />

      {/* Hot-air balloons drifting above the plot */}
      <BalloonFleet />

      {/* Warm sunset accent lights */}
      <pointLight position={[3, 4, 2]}    intensity={1.2} color="#ffb266" distance={12} />
      <pointLight position={[-3, 3, -2]}  intensity={0.7} color="#ff8a5b" distance={8} />
      <pointLight position={[0, 6, 0]}    intensity={0.8} color="#fff2d4" distance={10} />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * Ground top — dusty tan slab covering the whole plot
 * ------------------------------------------------------------------ */
function GroundTop() {
  return (
    <group position={[0, 0.09, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[SIZE, 0.18, SIZE]} />
        <meshStandardMaterial color={'#8f6c46'} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[SIZE - 0.2, 0.02, SIZE - 0.2]} />
        <meshStandardMaterial color={'#a68256'} roughness={0.95} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Three great pyramids — Minecraft/step-pyramid style, built from
 * stacked square blocks that get one tier smaller each level up.
 * Arranged along the plot's front-left → back-right diagonal.
 * ------------------------------------------------------------------ */
function GreatPyramids() {
  return (
    <group position={[0, 0.19, 0]}>
      {/* Kept fine-grained (many layers) but each block is smaller in
          world units, so the three pyramids don't touch each other. */}
      <BlockPyramid position={[2.1,  0, -2.1]} tiers={44} blockSize={0.05} rot={0.05} />
      <BlockPyramid position={[0.0,  0,  0.0]} tiers={36} blockSize={0.05} rot={-0.03} />
      <BlockPyramid position={[-2.2, 0,  2.2]} tiers={28} blockSize={0.05} rot={0.08} />
    </group>
  )
}

/**
 * Step pyramid built from progressively-smaller stacked box tiers.
 * Each tier is 1 block tall; the base is `tiers * blockSize` wide and
 * shrinks by 1 block-width per side each level up. Alternating tier
 * tints hint at the block boundaries in silhouette.
 */
function BlockPyramid({ position, tiers = 9, blockSize = 0.3, rot = 0 }) {
  const items = []
  for (let i = 0; i < tiers; i++) {
    const side = (tiers - i) * blockSize
    const y = (i + 0.5) * blockSize
    items.push({ side, y, i })
  }
  return (
    <group position={position} rotation={[0, rot, 0]}>
      {items.map(({ side, y, i }) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[side, blockSize, side]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#c9985a' : '#dfae74'}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}
      {/* Small dark entrance block at the base front */}
      <mesh position={[0, blockSize * 0.5, (tiers * blockSize) / 2 + 0.01]}>
        <boxGeometry args={[blockSize * 0.9, blockSize * 0.7, 0.02]} />
        <meshStandardMaterial color={'#2a1c10'} roughness={0.95} flatShading />
      </mesh>
    </group>
  )
}


/* ------------------------------------------------------------------ *
 * Balloon fleet — one hot-air balloon per social. Layout floats them
 * above the front-right side of the plot (away from the mountain).
 * ------------------------------------------------------------------ */
function BalloonFleet() {
  const layout = [
    { pos: [-2.8, 2.6, -1.8], drift: 0    },   // back-left
    { pos: [ 2.6, 3.0, -1.6], drift: 0.9 },   // back-right
    { pos: [-2.6, 2.2,  1.8], drift: 1.6 },   // front-left
    { pos: [ 2.8, 2.4,  1.8], drift: 2.3 },   // front-right
  ]
  return (
    <group>
      {SOCIALS.map((s, i) => {
        const l = layout[i % layout.length]
        return (
          <Balloon
            key={s.id}
            social={s}
            basePos={l.pos}
            phase={l.drift}
            tint={BALLOON_TINTS[i % BALLOON_TINTS.length]}
          />
        )
      })}
    </group>
  )
}

function Balloon({ social, basePos, phase, tint }) {
  const groupRef = useRef()
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = basePos[1] + Math.sin(t * 0.6 + phase) * 0.14
    groupRef.current.position.x = basePos[0] + Math.sin(t * 0.3 + phase) * 0.08
    groupRef.current.rotation.z = Math.sin(t * 0.4 + phase) * 0.04
  })

  const disabled = social.url === '#'
  const isMailto = social.url.startsWith('mailto:')

  return (
    <group ref={groupRef} position={basePos}>
      {/* Envelope — chunky low-poly sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshStandardMaterial color={tint} roughness={0.6} flatShading />
      </mesh>
      {/* Contrast stripe wrapping the envelope's equator */}
      <mesh>
        <sphereGeometry args={[0.702, 10, 8, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.16]} />
        <meshStandardMaterial color={'#fff4d4'} roughness={0.7} flatShading />
      </mesh>
      {/* Bottom collar */}
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.22, 0.14, 0.14, 8]} />
        <meshStandardMaterial color={'#8b5a30'} roughness={0.85} flatShading />
      </mesh>
      {/* Ropes — four thin cylinders from collar to basket */}
      {[
        [ 0.12, 0, 0.12],
        [-0.12, 0, 0.12],
        [ 0.12, 0,-0.12],
        [-0.12, 0,-0.12],
      ].map((r, i) => (
        <mesh key={i} position={[r[0], -0.9, r[2]]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 4]} />
          <meshStandardMaterial color={'#3d2f22'} roughness={0.95} flatShading />
        </mesh>
      ))}
      {/* Basket — small brown wicker box */}
      <mesh position={[0, -1.14, 0]} castShadow>
        <boxGeometry args={[0.32, 0.22, 0.32]} />
        <meshStandardMaterial color={'#a06835'} roughness={0.85} flatShading />
      </mesh>
      {/* Basket lip */}
      <mesh position={[0, -1.03, 0]}>
        <boxGeometry args={[0.36, 0.05, 0.36]} />
        <meshStandardMaterial color={'#c9945a'} roughness={0.85} flatShading />
      </mesh>

      {/* Social icon — screen-space overlay pinned to the balloon's
          centre. No chip background: the glyph itself sits on the
          envelope canvas with a soft white glow. */}
      <Html
        center
        occlude={false}
        position={[0, 0.05, 0]}
        pointerEvents="auto"
        style={{ pointerEvents: 'auto' }}
      >
        <a
          href={disabled ? undefined : social.url}
          target={isMailto ? undefined : '_blank'}
          rel={isMailto ? undefined : 'noreferrer'}
          className={`balloon-icon balloon-icon--${social.id} ${disabled ? 'disabled' : ''}`}
          title={social.label}
          onClick={(e) => { if (disabled) e.preventDefault() }}
        >
          <Icon name={social.icon} />
          <span className="balloon-label">{social.label}</span>
        </a>
      </Html>
    </group>
  )
}
