import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'

import { SKILL_GROUPS } from '../../data/skills.js'

/**
 * Skills as a garden: each category is a "bed" — a raised soil plot with a
 * colored group flag. Individual skills bloom as flowers of that group's
 * color, arranged in a small cluster around the bed. Hover a bloom to
 * reveal its label. Bees / dragonflies drift between beds.
 */
export default function SkillsConstellation() {
  const beds = useMemo(() => layoutBeds(SKILL_GROUPS), [])
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <group position={[0, 0, 0]}>
      {beds.map((b) => (
        <GardenBed
          key={b.id}
          bed={b}
          hoveredId={hoveredId}
          setHovered={setHoveredId}
        />
      ))}
      <Dragonflies />
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Layout: place bed centers in a rough grid centered at 0,0
 * ------------------------------------------------------------------ */
function layoutBeds(groups) {
  const perRow = 3
  const spacingX = 4.4
  const spacingZ = 3.8
  return groups.map((g, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const rowCount = Math.ceil(groups.length / perRow)
    const cx = (col - (perRow - 1) / 2) * spacingX
    const cz = (row - (rowCount - 1) / 2) * spacingZ
    return {
      id: g.id,
      label: g.label,
      color: g.color,
      items: g.items,
      cx,
      cz,
    }
  })
}

/* ------------------------------------------------------------------ *
 * Garden bed — raised planter, flag, and flower cluster
 * ------------------------------------------------------------------ */
function GardenBed({ bed, hoveredId, setHovered }) {
  const flowerPositions = useMemo(() => {
    return bed.items.map((_, i) => {
      const n = bed.items.length
      const angle = (i / n) * Math.PI * 2
      const r = 0.35 + (i % 3) * 0.28
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        y: 0.35 + (i % 4) * 0.08,
        seed: i * 0.7,
      }
    })
  }, [bed.items])

  return (
    <group position={[bed.cx, 0, bed.cz]}>
      {/* Planter — wooden square */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.7, 0.25, 1.7]} />
        <meshStandardMaterial color="#b17a4a" roughness={0.85} flatShading />
      </mesh>
      {/* Soil / grass top */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.55, 0.08, 1.55]} />
        <meshStandardMaterial color="#7bb444" roughness={0.9} flatShading />
      </mesh>

      {/* Little flag on a pole */}
      <mesh position={[-0.75, 0.7, -0.75]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 4]} />
        <meshStandardMaterial color="#8b5a30" flatShading />
      </mesh>
      <mesh position={[-0.45, 1.05, -0.75]}>
        <boxGeometry args={[0.65, 0.32, 0.03]} />
        <meshStandardMaterial color={bed.color} roughness={0.8} flatShading />
      </mesh>
      <Text
        position={[-0.45, 1.05, -0.73]}
        fontSize={0.09}
        color="#2d3e50"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
      >
        {bed.label}
      </Text>

      {/* Flowers — one per skill */}
      {bed.items.map((skill, i) => {
        const p = flowerPositions[i]
        const id = `${bed.id}-${i}`
        return (
          <SkillFlower
            key={id}
            id={id}
            label={skill}
            color={bed.color}
            position={[p.x, 0.35, p.z]}
            hoveredId={hoveredId}
            setHovered={setHovered}
            seed={p.seed}
          />
        )
      })}
    </group>
  )
}

function SkillFlower({ id, label, color, position, hoveredId, setHovered, seed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.3 + seed
    ref.current.position.y = position[1] + Math.sin(t * 1.5 + seed) * 0.04
  })
  const isHovered = hoveredId === id

  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(id) }}
      onPointerOut={() => setHovered((cur) => (cur === id ? null : cur))}
    >
      {/* Stem */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
        <meshStandardMaterial color="#5aa73a" flatShading />
      </mesh>
      {/* Bloom */}
      <group ref={ref} position={[0, 0.55, 0]} scale={isHovered ? 1.6 : 1}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09]}>
              <sphereGeometry args={[0.08, 6, 4]} />
              <meshStandardMaterial color={color} flatShading />
            </mesh>
          )
        })}
        <mesh>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshStandardMaterial color="#ffe066" flatShading />
        </mesh>
      </group>
      {/* Label popup */}
      {isHovered && (
        <Billboard position={[0, 1.1, 0]}>
          <mesh>
            <planeGeometry args={[label.length * 0.09 + 0.3, 0.28]} />
            <meshBasicMaterial color="#fff4e0" transparent opacity={0.95} />
          </mesh>
          <Text
            fontSize={0.13}
            color="#2d3e50"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Dragonflies — small colored dots drifting between beds
 * ------------------------------------------------------------------ */
function Dragonflies() {
  const groupRef = useRef()
  const N = 8
  const seeds = useMemo(() => Array.from({ length: N }, () => Math.random() * 100), [])
  useFrame((s) => {
    if (!groupRef.current) return
    const t = s.clock.elapsedTime
    groupRef.current.children.forEach((d, i) => {
      const seed = seeds[i]
      d.position.x = Math.sin(t * 0.5 + seed) * 6
      d.position.z = Math.cos(t * 0.35 + seed * 0.7) * 4
      d.position.y = 1.4 + Math.sin(t * 1.2 + seed) * 0.4
      d.rotation.y = t * 4 + seed
    })
  })
  const colors = ['#7fd0e0', '#ffb3c1', '#d3b8ff', '#ffe066', '#ff9b7a']
  return (
    <group ref={groupRef}>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i}>
          <coneGeometry args={[0.05, 0.14, 3]} />
          <meshStandardMaterial color={colors[i % colors.length]} flatShading />
        </mesh>
      ))}
    </group>
  )
}
