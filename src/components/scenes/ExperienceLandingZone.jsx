import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'

import { PROJECTS } from '../../data/projects.js'
import { PalmTree, PineTree, Rock, GrassTuft, Flower } from '../../three/NatureProps.jsx'

/**
 * Experience: three small islands (Germany, France, Singapore) around a
 * central lighthouse "hub", each connected by a wooden footbridge. Hover
 * an island's totem pole to reveal that project's dossier.
 */
export default function ExperienceLandingZone() {
  const [activeProject, setActiveProject] = useState(null)
  const islandLayout = useMemo(() => [
    { angle: -Math.PI * 0.72, radius: 5.2 },  // left
    { angle: -Math.PI * 0.5,  radius: 5.4 },  // back-center
    { angle: -Math.PI * 0.28, radius: 5.2 },  // right
  ], [])

  return (
    <group>
      <Lighthouse />
      {PROJECTS.map((p, i) => {
        const cfg = islandLayout[i]
        const x = Math.cos(cfg.angle) * cfg.radius
        const z = Math.sin(cfg.angle) * cfg.radius
        return (
          <ProjectIsland
            key={p.id}
            project={p}
            position={[x, 0, z]}
            angleFromHub={cfg.angle}
            active={activeProject === p.id}
            onEnter={() => setActiveProject(p.id)}
            onLeave={() => setActiveProject((cur) => (cur === p.id ? null : cur))}
            index={i}
          />
        )
      })}

      {activeProject && (
        <group position={[0, 5.5, 2.5]}>
          <Html
            transform
            distanceFactor={4.5}
            pointerEvents="none"
            style={{ transition: 'opacity 0.3s' }}
          >
            <ProjectDossier project={PROJECTS.find((p) => p.id === activeProject)} />
          </Html>
        </group>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Central lighthouse hub with a rotating light on top
 * ------------------------------------------------------------------ */
function Lighthouse() {
  const lightRef = useRef()
  useFrame((s) => {
    if (lightRef.current) lightRef.current.rotation.y = s.clock.elapsedTime * 0.9
  })
  return (
    <group position={[0, 0, 0]}>
      {/* Central island base — larger circle */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.2, 12]} />
        <meshStandardMaterial color="#a8d95f" roughness={0.9} flatShading />
      </mesh>
      {/* Sand edge */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[2.6, 2.8, 0.1, 12]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.9} flatShading />
      </mesh>
      {/* Lighthouse body — striped red/white */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 2.6, 12]} />
        <meshStandardMaterial color="#fff4e0" roughness={0.8} flatShading />
      </mesh>
      {/* Red stripes — 3 rings */}
      {[0.6, 1.5, 2.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.55, 0.6, 0.35, 12]} />
          <meshStandardMaterial color="#ff9b7a" roughness={0.8} flatShading />
        </mesh>
      ))}
      {/* Balcony */}
      <mesh position={[0, 2.85, 0]}>
        <cylinderGeometry args={[0.65, 0.55, 0.15, 12]} />
        <meshStandardMaterial color="#8b5a30" roughness={0.85} flatShading />
      </mesh>
      {/* Light room */}
      <mesh position={[0, 3.15, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.4, 12]} />
        <meshStandardMaterial color="#fff4e0" roughness={0.5} flatShading />
      </mesh>
      {/* Rotating beam */}
      <group ref={lightRef} position={[0, 3.15, 0]}>
        <mesh position={[0.9, 0, 0]}>
          <coneGeometry args={[0.5, 1.8, 3, 1, true]} />
          <meshBasicMaterial color="#ffe066" transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.9, 0, 0]} rotation={[0, Math.PI, 0]}>
          <coneGeometry args={[0.5, 1.8, 3, 1, true]} />
          <meshBasicMaterial color="#ffe066" transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Roof */}
      <mesh position={[0, 3.6, 0]}>
        <coneGeometry args={[0.45, 0.5, 12]} />
        <meshStandardMaterial color="#c94d3a" roughness={0.7} flatShading />
      </mesh>
      {/* Flag */}
      <mesh position={[0, 3.95, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
        <meshStandardMaterial color="#8b5a30" />
      </mesh>
      <mesh position={[0.12, 4.0, 0]}>
        <coneGeometry args={[0.06, 0.2, 3]} />
        <meshStandardMaterial color="#ffe066" flatShading />
      </mesh>

      {/* Grass tufts + flowers on the island */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <group key={i}>
            <GrassTuft
              position={[Math.cos(a) * 1.9, 0.2, Math.sin(a) * 1.9]}
              scale={0.8}
            />
            <Flower
              position={[Math.cos(a + 0.4) * 1.5, 0.2, Math.sin(a + 0.4) * 1.5]}
              color={['#ffb3c1', '#ffe066', '#d3b8ff'][i % 3]}
              scale={0.75}
            />
          </group>
        )
      })}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Project island — small platform + tree + flag pole + name banner
 * ------------------------------------------------------------------ */
function ProjectIsland({ project, position, angleFromHub, active, onEnter, onLeave, index }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = (active || hovered ? 0.15 : 0) + Math.sin(t * 0.8 + index) * 0.03
  })

  const trunkColors = ['#4bb8c4', '#d3b8ff', '#f2c15c']  // per region tint
  const accentColor = project.accent

  // Compute a rotation so the flag faces the hub
  const facingRotY = Math.atan2(-position[0], -position[2])

  return (
    <group position={position} rotation={[0, facingRotY, 0]}>
      <group
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onEnter() }}
        onPointerOut={() => { setHovered(false); onLeave() }}
      >
        {/* Island — grassy top with sandy edge */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[1.4, 1.7, 0.2, 8]} />
          <meshStandardMaterial color="#a8d95f" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[1.6, 1.9, 0.1, 8]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.9} flatShading />
        </mesh>

        {/* One central palm/pine and a companion */}
        {index === 0 && (
          <>
            <PineTree position={[-0.5, 0.2, -0.3]} scale={0.85} seed={index} />
            <Rock position={[0.6, 0.35, 0.4]} scale={0.3} />
          </>
        )}
        {index === 1 && (
          <>
            <PalmTree position={[-0.5, 0.2, -0.3]} scale={0.85} tilt={0.05} seed={index} />
            <Rock position={[0.6, 0.35, 0.4]} scale={0.3} color="#d4b98a" />
          </>
        )}
        {index === 2 && (
          <>
            <PalmTree position={[-0.5, 0.2, -0.3]} scale={0.85} tilt={-0.05} seed={index} />
            <Rock position={[0.6, 0.35, 0.4]} scale={0.3} color="#c9a86b" />
          </>
        )}

        {/* Grass and flowers */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <group key={i}>
              <GrassTuft position={[Math.cos(a) * 1.1, 0.2, Math.sin(a) * 1.1]} scale={0.7} />
            </group>
          )
        })}

        {/* Flag pole in front */}
        <group position={[0, 0.2, 0.5]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
            <meshStandardMaterial color="#8b5a30" flatShading />
          </mesh>
          <mesh position={[0.55, 2.0, 0]}>
            <boxGeometry args={[1.1, 0.65, 0.04]} />
            <meshStandardMaterial color={accentColor} roughness={0.8} flatShading />
          </mesh>
          <Text
            position={[0.55, 2.0, 0.05]}
            fontSize={0.24}
            color="#3d2914"
            anchorX="center"
            anchorY="middle"
          >
            {project.flag}
          </Text>
          {/* Nameplate at base */}
          <group position={[0, 0.1, 0.05]} rotation={[-Math.PI / 4, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.1, 0.35, 0.06]} />
              <meshStandardMaterial color="#8b5a30" roughness={0.85} flatShading />
            </mesh>
            <Text
              position={[0, 0.05, 0.04]}
              rotation={[0, 0, 0]}
              fontSize={0.11}
              color="#fff4e0"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.15}
            >
              {project.customerRegion.toUpperCase()}
            </Text>
            <Text
              position={[0, -0.08, 0.04]}
              fontSize={0.07}
              color="#f5deb3"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
            >
              {project.scale}
            </Text>
          </group>
        </group>

        {/* Hover glow ring */}
        {(hovered || active) && (
          <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.7, 24]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* Wooden footbridge back toward the hub */}
      <Footbridge
        from={[0, 0.15, 0]}
        length={Math.sqrt(position[0] ** 2 + position[2] ** 2) - 2.4}
      />
    </group>
  )
}

function Footbridge({ from, length }) {
  // Bridge extends from the island back toward origin
  const planks = Math.max(4, Math.round(length * 3))
  return (
    <group position={from} rotation={[0, Math.PI, 0]}>
      {/* Two rails */}
      <mesh position={[0, -0.05, -length / 2 - 1.2]}>
        <boxGeometry args={[0.05, 0.06, length + 0.2]} />
        <meshStandardMaterial color="#8b5a30" flatShading />
      </mesh>
      {Array.from({ length: planks }).map((_, i) => {
        const t = i / (planks - 1)
        const z = -1.2 - t * length
        return (
          <mesh key={i} position={[0, -0.1, z]}>
            <boxGeometry args={[0.75, 0.05, length / planks - 0.02]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#b17a4a' : '#a06835'} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}

function ProjectDossier({ project }) {
  return (
    <div className="dossier">
      <div className="dossier-tag">{project.codename} · {project.partition}</div>
      <h3>{project.headline}</h3>
      <div className="customer">
        {project.flag} {project.customerRegion} Customer · {project.scale}
      </div>
      <ul>
        {project.highlights.slice(0, 4).map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </div>
  )
}
