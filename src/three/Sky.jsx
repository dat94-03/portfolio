import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Big sky-dome shader (top → warm bottom gradient) plus a family of
 * drifting low-poly clouds and simple V-shaped birds. Distant mountain
 * silhouettes hang along the horizon. Dome + sun + mountains follow the
 * camera so every scene has a backdrop.
 */
export default function Sky({ totalSections = 6, spacing = 32 }) {
  const centerZ = ((totalSections - 1) * spacing) / 2
  return (
    <group>
      <CameraFollower>
        <SkyDome />
        <SunDisc />
        <MountainRange />
      </CameraFollower>
      <Clouds count={22} zRange={[-30, (totalSections - 1) * spacing + 30]} />
      <Birds count={10} zRange={[0, (totalSections - 1) * spacing]} />
    </group>
  )
}

/**
 * Keeps its children centered on the camera's XZ position so the sky-dome,
 * sun disc and mountain silhouettes stay "at infinity" as the camera flies
 * from scene to scene.
 */
function CameraFollower({ children }) {
  const ref = useRef()
  const { camera } = useThree()
  useFrame(() => {
    if (!ref.current) return
    ref.current.position.x = camera.position.x
    ref.current.position.z = camera.position.z
  })
  return <group ref={ref}>{children}</group>
}

/* ------------------------------------------------------------------ *
 * Sky-dome — inverted sphere with vertex-color gradient
 * ------------------------------------------------------------------ */
function SkyDome() {
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(160, 24, 16)
    const colors = []
    // Bright blue sky with a warm-tan horizon — like the reference temple ruin
    const top = new THREE.Color('#7fc4e0')
    const mid = new THREE.Color('#b7deed')
    const warm = new THREE.Color('#f5e0b8')
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 160 // -1 .. 1
      const t = THREE.MathUtils.clamp((y + 1) / 2, 0, 1)
      const c = new THREE.Color()
      if (t < 0.5) c.lerpColors(warm, mid, t * 2)
      else c.lerpColors(mid, top, (t - 0.5) * 2)
      colors.push(c.r, c.g, c.b)
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return g
  }, [])
  return (
    <mesh geometry={geom} scale={[1, 1, 1]} renderOrder={-100}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}

function SunDisc() {
  const ref = useRef()
  useFrame((s) => {
    if (ref.current) ref.current.material.opacity = 0.9 + Math.sin(s.clock.elapsedTime * 0.5) * 0.05
  })
  // Behind the camera's forward direction (-Z), high in sky
  return (
    <mesh ref={ref} position={[-42, 32, -100]} renderOrder={-99}>
      <circleGeometry args={[8, 24]} />
      <meshBasicMaterial color="#f5d885" transparent opacity={0.7} depthWrite={false} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ *
 * Clouds — clusters of white spheres drifting slowly along +X
 * ------------------------------------------------------------------ */
function Clouds({ count, zRange }) {
  const clouds = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 90,
        y: 16 + Math.random() * 14,
        z: THREE.MathUtils.lerp(zRange[0], zRange[1], Math.random()),
        speed: 0.2 + Math.random() * 0.3,
        scale: 0.7 + Math.random() * 1.4,
        seed: Math.random() * 100,
      })
    }
    return arr
  }, [count, zRange])

  const groupRef = useRef()
  useFrame((_, dt) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((c, i) => {
      const cfg = clouds[i]
      c.position.x += cfg.speed * dt
      if (c.position.x > 55) c.position.x = -55
    })
  })

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
          <Cloud />
        </group>
      ))}
    </group>
  )
}

function Cloud() {
  // A cloud is 4-6 overlapping spheres — chunky, low-poly.
  const puffs = useMemo(() => {
    const n = 5
    const arr = []
    for (let i = 0; i < n; i++) {
      arr.push({
        x: (i - n / 2) * 0.9 + (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.4,
        r: 0.9 + Math.random() * 0.6,
      })
    }
    return arr
  }, [])
  return (
    <group>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <icosahedronGeometry args={[p.r, 0]} />
          <meshStandardMaterial
            color="#f8f4ea"
            emissive="#fff2d4"
            emissiveIntensity={0.15}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Birds — flapping V-shapes drifting through the sky
 * ------------------------------------------------------------------ */
function Birds({ count, zRange }) {
  const birds = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 60,
        y: 8 + Math.random() * 10,
        z: THREE.MathUtils.lerp(zRange[0], zRange[1], Math.random()),
        speed: 1.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        dir: Math.random() < 0.5 ? 1 : -1,
      })
    }
    return arr
  }, [count, zRange])

  const groupRef = useRef()
  useFrame((state, dt) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((b, i) => {
      const cfg = birds[i]
      b.position.x += cfg.speed * dt * cfg.dir
      if (cfg.dir > 0 && b.position.x > 40) b.position.x = -40
      if (cfg.dir < 0 && b.position.x < -40) b.position.x = 40
      // Flap: rotate wings via child scale animation
      const flap = Math.sin(t * 8 + cfg.phase) * 0.6
      if (b.children[0]) b.children[0].rotation.z = flap
      if (b.children[1]) b.children[1].rotation.z = -flap
      b.rotation.y = cfg.dir > 0 ? 0 : Math.PI
    })
  })

  return (
    <group ref={groupRef}>
      {birds.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]}>
          <Wing side="left" />
          <Wing side="right" />
        </group>
      ))}
    </group>
  )
}

function Wing({ side }) {
  const x = side === 'left' ? -0.15 : 0.15
  return (
    <mesh position={[x, 0, 0]}>
      <coneGeometry args={[0.12, 0.6, 3]} />
      <meshBasicMaterial color="#3d4b5e" />
    </mesh>
  )
}

/* ------------------------------------------------------------------ *
 * Distant mountain silhouette — a long triangular ridge along horizon
 * ------------------------------------------------------------------ */
function MountainRange() {
  // Use a Shape with jagged top for a clean silhouette. Mountains appear
  // both in front (-Z) and behind (+Z) the follower origin so any scroll
  // direction still shows a horizon.
  const shapeNear = useMemo(() => buildRidge(280, 14, 12), [])
  const shapeFar  = useMemo(() => buildRidge(280, 10, 18), [])

  return (
    <group>
      {/* Far range — behind — pale warm ridge */}
      <mesh position={[0, 0, -75]} renderOrder={-98}>
        <shapeGeometry args={[shapeFar]} />
        <meshBasicMaterial color="#c5b193" depthWrite={false} />
      </mesh>
      {/* Near range — behind — warmer tawny ridge */}
      <mesh position={[0, 0, -60]} renderOrder={-97}>
        <shapeGeometry args={[shapeNear]} />
        <meshBasicMaterial color="#a68b5c" depthWrite={false} />
      </mesh>
      {/* Far range — ahead */}
      <mesh position={[0, 0, 75]} rotation={[0, Math.PI, 0]} renderOrder={-98}>
        <shapeGeometry args={[shapeFar]} />
        <meshBasicMaterial color="#c5b193" depthWrite={false} />
      </mesh>
      {/* Near range — ahead */}
      <mesh position={[0, 0, 60]} rotation={[0, Math.PI, 0]} renderOrder={-97}>
        <shapeGeometry args={[shapeNear]} />
        <meshBasicMaterial color="#a68b5c" depthWrite={false} />
      </mesh>
    </group>
  )
}

function buildRidge(width, maxHeight, peaks) {
  const s = new THREE.Shape()
  s.moveTo(-width / 2, 0)
  for (let i = 0; i <= peaks; i++) {
    const x = -width / 2 + (i / peaks) * width
    // Vary peak heights pseudo-randomly but deterministically
    const h = maxHeight * (0.35 + 0.65 * pseudo(i * 3.7))
    s.lineTo(x - width / peaks / 2, h * 0.4)
    s.lineTo(x, h)
  }
  s.lineTo(width / 2, 0)
  s.closePath()
  return s
}

function pseudo(x) {
  const v = Math.sin(x * 12.9898) * 43758.5453
  return v - Math.floor(v)
}
