import { useTexture } from '@react-three/drei'

import {
  IslandFoundation,
  FloatingRig,
  ISLAND_PALETTE,
} from '../../three/Island.jsx'
import {
  Skyscraper,
  Streetlight,
  Car,
  BusinessTree,
} from '../../three/CityProps.jsx'

/**
 * Work / Experience Island — a compact corporate city block.
 *
 *   • Foundation: four strata, with a top layer that reads as
 *     "underground / subway" concrete rather than soil.
 *   • Concrete plaza on top with an intersecting road grid, sidewalks,
 *     and pedestrian crossings.
 *   • 6 skyscrapers of varying heights and glass tints — the tallest is
 *     the FPT Software tower (orange accent stripe + rooftop antenna).
 *   • Streetlights, planters/trees, and 2 cars on the road for detail.
 */

const SIZE = 6.5
const HALF = SIZE / 2

// Warm dawn skyscraper glow palette
const PLAZA_LIGHT = '#c9c4b8'
const PLAZA_DARK  = '#a8a294'
const ROAD        = '#3d3f45'
const ROAD_LINE   = '#e6e1d1'
const SUBWAY      = '#4a4a55'

// FPT-Software orange for the flagship tower accent
const FPT_ORANGE  = '#ff7a1a'
const FPT_BLUE    = '#0f6cbd'
const FPT_GREEN   = '#26b04b'

export default function WorkIsland() {
  return (
    <FloatingRig seed={3}>
      {/* Foundation — city strata (bedrock → utility → foundation → subway) */}
      <IslandFoundation
        width={SIZE}
        depth={SIZE}
        layers={[
          { color: ISLAND_PALETTE.bedrockDark, height: 0.55 },
          { color: ISLAND_PALETTE.bedrock,     height: 0.5  },
          { color: '#7a5c3e',                  height: 0.4  },  // utility clay
          { color: SUBWAY,                     height: 0.4  },  // subway concrete
        ]}
      />

      {/* Concrete plaza deck on top */}
      <PlazaDeck />
      <Roads />
      <Sidewalks />

      {/* Skyscrapers */}
      {/* Flagship FPT tower — tallest, back-center */}
      <Skyscraper
        position={[-0.4, 0.13, -2.0]}
        width={1.4}
        depth={1.4}
        height={4.4}
        bodyColor="#526988"
        windowColor="#ffdd88"
        accentColor={FPT_ORANGE}
        hasAntenna
        rooftop="tiered"
        seed={1}
      />
      {/* FPT Software logo billboard, mounted on the flagship tower's
          front face (facing +Z, toward camera) */}
      <FptLogoBillboard position={[-0.4, 3.2, -1.28]} />
      {/* Second copy on the +X face so the logo reads from the isometric
          camera angle no matter which side is more visible */}
      <FptLogoBillboard position={[0.31, 3.2, -2.0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Corporate glass tower — back-left */}
      <Skyscraper
        position={[-2.2, 0.13, -1.6]}
        width={1.1}
        depth={1.1}
        height={3.4}
        bodyColor="#6089b0"
        windowColor="#c8e4ff"
        rooftop="flat"
        seed={2}
      />

      {/* Mid-rise glass tower — back-right */}
      <Skyscraper
        position={[1.9, 0.13, -1.9]}
        width={1.2}
        depth={1.0}
        height={3.0}
        bodyColor="#75648b"
        windowColor="#ffe8b0"
        accentColor={FPT_BLUE}
        rooftop="setback"
        seed={3}
      />

      {/* Shorter corner tower — front-left */}
      <Skyscraper
        position={[-2.1, 0.13, 1.0]}
        width={1.0}
        depth={1.0}
        height={2.2}
        bodyColor="#8a7568"
        windowColor="#fff2c8"
        seed={4}
      />

      {/* Boutique offices — front-right */}
      <Skyscraper
        position={[1.6, 0.13, 1.4]}
        width={1.1}
        depth={0.9}
        height={1.8}
        bodyColor="#6d896d"
        windowColor="#bcffcd"
        accentColor={FPT_GREEN}
        seed={5}
      />

      {/* Compact retail block — front-center */}
      <Skyscraper
        position={[-0.2, 0.13, 2.0]}
        width={1.3}
        depth={0.7}
        height={1.4}
        bodyColor="#98836a"
        windowColor="#ffc38a"
        seed={6}
      />

      {/* Streetlights along the roads */}
      <Streetlight position={[-1.4, 0.13, 0]} scale={0.85} />
      <Streetlight position={[1.4, 0.13, 0]} scale={0.85} />
      <Streetlight position={[0, 0.13, -0.6]} scale={0.85} />
      <Streetlight position={[0, 0.13, 0.6]} scale={0.85} />

      {/* Small business trees / planters at building corners */}
      <BusinessTree position={[-2.9, 0.13, 2.6]} scale={0.85} />
      <BusinessTree position={[2.9, 0.13, 2.6]} scale={0.85} />
      <BusinessTree position={[-1.0, 0.13, 2.7]} scale={0.75} />
      <BusinessTree position={[0.9, 0.13, 2.7]} scale={0.75} />

      {/* A couple of cars on the roads */}
      <Car position={[-0.6, 0.15, 0]} rotationY={0} color="#e05a5a" />
      <Car position={[0.5, 0.15, 0]} rotationY={Math.PI} color="#ffd464" />
      <Car position={[0, 0.15, 0.9]} rotationY={-Math.PI / 2} color="#3d7cc7" />

      {/* Scene lighting — brighter overhead + warm street glow so the city
          reads clearly in the diorama's neutral backdrop. */}
      <pointLight position={[0, 8, 4]}  intensity={2.0} color="#fff4e0" distance={18} />
      <pointLight position={[0, 7, -4]} intensity={1.4} color="#e8ecf7" distance={16} />
      <pointLight position={[-0.4, 4, -2]} intensity={0.9} color="#ffb060" distance={7} />
      <pointLight position={[0, 1.8, 0]}  intensity={0.7} color="#ffce6a" distance={5} />
      <pointLight position={[3, 3, 3]}    intensity={0.5} color="#a4d8ff" distance={6} />
    </FloatingRig>
  )
}

/* ------------------------------------------------------------------ *
 * Plaza deck — concrete top surface with slight highlight
 * ------------------------------------------------------------------ */
function PlazaDeck() {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[SIZE, 0.08, SIZE]} />
        <meshStandardMaterial color={PLAZA_LIGHT} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[SIZE - 0.2, 0.02, SIZE - 0.2]} />
        <meshStandardMaterial color={PLAZA_DARK} roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Roads — a cross of two intersecting streets with lane markings
 * ------------------------------------------------------------------ */
function Roads() {
  const roadW = 1.05
  return (
    <group position={[0, 0.11, 0]}>
      {/* East-west road */}
      <mesh>
        <boxGeometry args={[SIZE, 0.01, roadW]} />
        <meshStandardMaterial color={ROAD} roughness={0.85} flatShading />
      </mesh>
      {/* North-south road */}
      <mesh>
        <boxGeometry args={[roadW, 0.01, SIZE]} />
        <meshStandardMaterial color={ROAD} roughness={0.85} flatShading />
      </mesh>
      {/* Lane markings — dashed centre line east-west */}
      {[-2.7, -1.9, -1.1, 1.1, 1.9, 2.7].map((x, i) => (
        <mesh key={`ew-${i}`} position={[x, 0.008, 0]}>
          <boxGeometry args={[0.4, 0.005, 0.06]} />
          <meshStandardMaterial color={ROAD_LINE} flatShading />
        </mesh>
      ))}
      {/* Lane markings — dashed centre line north-south */}
      {[-2.7, -1.9, -1.1, 1.1, 1.9, 2.7].map((z, i) => (
        <mesh key={`ns-${i}`} position={[0, 0.008, z]}>
          <boxGeometry args={[0.06, 0.005, 0.4]} />
          <meshStandardMaterial color={ROAD_LINE} flatShading />
        </mesh>
      ))}
      {/* Pedestrian crossings at the intersection */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
        <mesh key={`cross-n-${i}`} position={[x, 0.009, -0.55]}>
          <boxGeometry args={[0.08, 0.005, 0.5]} />
          <meshStandardMaterial color={ROAD_LINE} flatShading />
        </mesh>
      ))}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
        <mesh key={`cross-s-${i}`} position={[x, 0.009, 0.55]}>
          <boxGeometry args={[0.08, 0.005, 0.5]} />
          <meshStandardMaterial color={ROAD_LINE} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Sidewalks — thin raised bands along the road edges
 * ------------------------------------------------------------------ */
function Sidewalks() {
  const roadW = 1.05
  const sideOffset = roadW / 2 + 0.14
  const sideThick = 0.06
  return (
    <group position={[0, 0.12, 0]}>
      {/* East-west road sidewalks */}
      {[sideOffset, -sideOffset].map((z, i) => (
        <mesh key={`ew-${i}`} position={[0, 0, z]}>
          <boxGeometry args={[SIZE, 0.02, sideThick]} />
          <meshStandardMaterial color="#b0aa9c" roughness={0.9} flatShading />
        </mesh>
      ))}
      {/* North-south road sidewalks */}
      {[sideOffset, -sideOffset].map((x, i) => (
        <mesh key={`ns-${i}`} position={[x, 0, 0]}>
          <boxGeometry args={[sideThick, 0.02, SIZE]} />
          <meshStandardMaterial color="#b0aa9c" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * FPT Software logo billboard — a small textured panel mounted on the
 * flagship tower's facade. The panel is a thin box with a bit of depth
 * so the sign reads as physical corporate signage, not a decal.
 * ------------------------------------------------------------------ */
function FptLogoBillboard({ position = [0, 0, 0], rotation = [0, 0, 0], size = 0.95 }) {
  const texture = useTexture('/images/fpt-software.png')
  return (
    <group position={position} rotation={rotation}>
      {/* Deep backing plate — reads as the sign's back frame */}
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[size + 0.06, size + 0.06, 0.04]} />
        <meshStandardMaterial color={'#0b3f78'} roughness={0.6} metalness={0.2} flatShading />
      </mesh>
      {/* Logo face */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.55}
          metalness={0.05}
          emissive={'#ffffff'}
          emissiveIntensity={0.18}
          emissiveMap={texture}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
