import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * A long low-poly island: a sandy path down the middle, grass on either side,
 * with a strip of turquoise water flanking the outer edges. Vertex-colored
 * so the transitions read as clear "biomes" without needing textures.
 */
export default function LowPolyGround({ totalSections = 6, spacing = 32 }) {
  const geom = useMemo(() => {
    const length = totalSections * spacing + spacing
    const width = 90
    const segX = 40
    const segZ = totalSections * 12
    const g = new THREE.PlaneGeometry(width, length, segX, segZ)
    g.rotateX(-Math.PI / 2)

    const pos = g.attributes.position
    const colors = []

    // Warm autumn/desert palette: rust-orange grass, tawny sand, bright cyan water
    const grass = new THREE.Color('#e0a563')
    const grassDark = new THREE.Color('#b57436')
    const sand = new THREE.Color('#f0c894')
    const sandWarm = new THREE.Color('#deac6c')
    const water = new THREE.Color('#7ac9d8')
    const waterDeep = new THREE.Color('#4ea3b5')

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const absX = Math.abs(x)

      // biome ranges (in world units, from center outward)
      // 0..10   : sandy path
      // 10..24  : grass
      // 24..38  : sandy shore
      // 38..    : water
      let y = 0
      let color = new THREE.Color()

      const noise =
        Math.sin(x * 0.4) * 0.25 +
        Math.cos(z * 0.35) * 0.35 +
        Math.sin((x + z) * 0.15) * 0.18

      if (absX < 8) {
        // Sandy path — soft, nearly flat
        y = -0.3 + noise * 0.12
        color.lerpColors(sand, sandWarm, (Math.sin(z * 0.5) + 1) / 2 * 0.6)
      } else if (absX < 22) {
        // Grass — rolling
        y = -0.1 + noise * 0.55 + (absX - 8) * 0.02
        // stripe pattern for variety
        const t = ((Math.sin(z * 0.4) + 1) / 2) * 0.5 + (absX - 8) / 14 * 0.5
        color.lerpColors(grass, grassDark, t)
      } else if (absX < 34) {
        // Sandy shore going down
        const t = (absX - 22) / 12
        y = -0.4 - t * 0.6 + noise * 0.15
        color.lerpColors(sandWarm, sand, 1 - t)
      } else {
        // Water — flat, low, slight wave
        y = -1.6 + Math.sin(x * 0.6 + z * 0.4) * 0.05 + Math.cos(z * 0.7) * 0.04
        const t = THREE.MathUtils.clamp((absX - 34) / 20, 0, 1)
        color.lerpColors(water, waterDeep, t)
      }

      pos.setY(i, y)
      colors.push(color.r, color.g, color.b)
    }

    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [totalSections, spacing])

  const centerZ = ((totalSections - 1) * spacing) / 2

  return (
    <mesh geometry={geom} position={[0, 0, centerZ]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.9} metalness={0.02} flatShading />
    </mesh>
  )
}
