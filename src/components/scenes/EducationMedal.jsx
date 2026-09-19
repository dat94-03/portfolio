import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

import PolyMedal from '../../three/PolyMedal.jsx'
import KhueVanCac from '../../three/KhueVanCac.jsx'
import { PineTree, Rock, Flower, GrassTuft, scatter } from '../../three/NatureProps.jsx'
import { EDUCATION } from '../../data/profile.js'

/**
 * Education: the HUST medal floats and rotates high above a stone
 * pedestal on a small grassy hill. Interact: drag = spin, double-click =
 * flip to reveal the back-face easter-egg.
 */
export default function EducationMedal() {
  return (
    <group>
      <Hillside />
      {/* Stone pedestal on the hilltop */}
      <group position={[0, 1.4, 0]}>
        <StonePedestal />
        {/* Soft glow disc on the pedestal top marking where the medal levitates */}
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 0.02, 32]} />
          <meshBasicMaterial color="#fff2c8" transparent opacity={0.45} />
        </mesh>
      </group>
      {/* Medal — floats well above the pedestal top and gently wobbles */}
      <group position={[0, 3.6, 0]} scale={1.25}>
        <PolyMedal withBox={false} />
      </group>

      {/* Khuê Văn Các — the ceremonial pavilion of Vietnam's Temple of
          Literature, sitting to the right of the medal pedestal. The
          thematic anchor for the education section. */}
      <KhueVanCac position={[5, 0, 0]} scale={0.85} />

      <Plaque />
    </group>
  )
}

function Hillside() {
  const grass = scatter(24, { w: 12, h: 8 }, 6)
  const flowers = scatter(14, { w: 10, h: 7 }, 12)
  const rocks = scatter(3, { w: 8, h: 5 }, 18)
  const trees = [
    { x: -6.5, z: -3, scale: 1.1 },
    { x: -8, z: 0, scale: 0.95 },
    { x: -7, z: 3, scale: 1.05 },
    { x: 6.5, z: -3, scale: 1.1 },
    { x: 8, z: 0, scale: 0.95 },
    { x: 7, z: 3, scale: 1.05 },
  ]
  return (
    <group>
      {/* Small grassy hill under the medal */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <coneGeometry args={[3.5, 1.3, 12]} />
        <meshStandardMaterial color="#a8d95f" roughness={0.9} flatShading />
      </mesh>
      {trees.map((t, i) => (
        <PineTree key={i} position={[t.x, 0, t.z]} scale={t.scale} seed={i * 3.3} />
      ))}
      {grass.map((g, i) => (
        <GrassTuft key={`g-${i}`} position={[g.x, 0, g.z]} scale={g.scale * 0.7} />
      ))}
      {flowers.map((f, i) => (
        <Flower
          key={`f-${i}`}
          position={[f.x, 0, f.z]}
          color={['#ffb3c1', '#ffe066', '#d3b8ff'][i % 3]}
          scale={f.scale * 0.9}
        />
      ))}
      {rocks.map((r, i) => (
        <Rock key={`r-${i}`} position={[r.x, r.scale * 0.3, r.z]} scale={r.scale * 0.5} />
      ))}
    </group>
  )
}

function StonePedestal() {
  return (
    <group>
      {/* Base */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.3, 8]} />
        <meshStandardMaterial color="#c9a86b" roughness={0.9} flatShading />
      </mesh>
      {/* Column */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.75, 0.95, 0.5, 8]} />
        <meshStandardMaterial color="#d4b98a" roughness={0.9} flatShading />
      </mesh>
      {/* Top plate */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.15, 8]} />
        <meshStandardMaterial color="#e8d3a0" roughness={0.85} flatShading />
      </mesh>
      {/* Flower ring around the base */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2
        const x = Math.cos(a) * 1.5
        const z = Math.sin(a) * 1.5
        return (
          <Flower
            key={i}
            position={[x, 0, z]}
            color={['#ffb3c1', '#ffe066', '#d3b8ff', '#ff9b7a'][i % 4]}
            scale={0.8}
          />
        )
      })}
    </group>
  )
}

function FlagpoleRow() {
  return (
    <group>
      {EDUCATION.scholarships.map((s, i) => {
        const angle = (i - 1) * 0.5
        const r = 4.8
        const x = Math.sin(angle) * r
        const z = Math.cos(angle) * -2.2 - 2.2
        return (
          <Flagpole
            key={s.term}
            position={[x, 0, z]}
            term={s.term}
            label={s.label}
            image={s.image}
            color={['#ff9b7a', '#ffe066', '#7fd0e0'][i]}
            index={i}
          />
        )
      })}
    </group>
  )
}

function Flagpole({ position, term, label, image, color, index }) {
  const flagRef = useRef()
  useFrame((state) => {
    if (!flagRef.current) return
    // Slight flag flutter
    const t = state.clock.elapsedTime
    flagRef.current.rotation.y = Math.sin(t * 1.4 + index) * 0.15
  })
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.8, 6]} />
        <meshStandardMaterial color="#8b5a30" roughness={0.9} flatShading />
      </mesh>
      {/* Ball on top */}
      <mesh position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#f2c15c" metalness={0.7} roughness={0.3} flatShading />
      </mesh>
      {/* Banner */}
      <group ref={flagRef} position={[0.05, 2.2, 0]}>
        <mesh position={[0.6, 0, 0]} castShadow>
          <boxGeometry args={[1.2, 0.75, 0.04]} />
          <meshStandardMaterial color={color} roughness={0.85} flatShading />
        </mesh>
        <Html
          transform
          distanceFactor={2.6}
          position={[0.6, 0, 0.05]}
          pointerEvents="none"
        >
          <div style={styles.banner}>
            <img
              src={image}
              alt={term}
              style={styles.bannerImg}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div style={styles.bannerOverlay}>
              <div style={styles.bannerTerm}>{term}</div>
              <div style={styles.bannerLabel}>{label}</div>
            </div>
          </div>
        </Html>
      </group>
      {/* Small flower cluster at the base */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <Flower
            key={i}
            position={[Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35]}
            color={['#ffb3c1', '#ffe066', '#d3b8ff'][i]}
            scale={0.75}
          />
        )
      })}
    </group>
  )
}

function Plaque() {
  return (
    <group position={[0, 0.06, 2.4]} rotation={[-Math.PI / 8, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2.6, 0.06, 0.7]} />
        <meshStandardMaterial color="#8b5a30" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[2.4, 0.02, 0.5]} />
        <meshStandardMaterial color="#f2c15c" metalness={0.6} roughness={0.4} />
      </mesh>
      <Html
        transform
        distanceFactor={2.4}
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        pointerEvents="none"
      >
        <div style={styles.plaqueWrap}>
          <div style={styles.plaqueTitle}>{EDUCATION.medal.title}</div>
          <div style={styles.plaqueSub}>{EDUCATION.medal.subtitle} · GPA {EDUCATION.gpa}</div>
        </div>
      </Html>
    </group>
  )
}

const styles = {
  banner: {
    width: 240, height: 150,
    position: 'relative',
    borderRadius: 6, overflow: 'hidden',
    background: 'linear-gradient(160deg, #fff4e0, #f5deb3)',
    fontFamily: 'Space Grotesk, sans-serif',
    boxShadow: '0 4px 20px -6px rgba(45,62,80,0.35)',
  },
  bannerImg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', opacity: 0.85,
  },
  bannerOverlay: {
    position: 'relative', zIndex: 1, height: '100%',
    display: 'grid', alignContent: 'end', padding: 14,
    background: 'linear-gradient(to top, rgba(255,244,224,0.95), transparent)',
  },
  bannerTerm: {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
    letterSpacing: '0.28em', color: '#4d9b3a',
    textTransform: 'uppercase', marginBottom: 4,
  },
  bannerLabel: {
    fontSize: 14, color: '#3d2914', fontWeight: 600,
  },
  plaqueWrap: {
    width: 340, textAlign: 'center',
    fontFamily: 'Space Grotesk, sans-serif',
    color: '#3d2914', padding: '10px 0',
  },
  plaqueTitle: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4 },
  plaqueSub: {
    fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
    color: '#8b5a30', letterSpacing: '0.2em', textTransform: 'uppercase',
  },
}
