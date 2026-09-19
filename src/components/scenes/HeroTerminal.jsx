import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

import { STORY, PROFILE } from '../../data/profile.js'
import {
  PalmTree, Rock, GrassTuft, Flower, TemplePillar, TempleBeam, scatter,
} from '../../three/NatureProps.jsx'

/**
 * Hero: a sunny beach clearing. Palm trees flank the scene, wildflowers and
 * grass tufts dot the sand. Center-stage is a wooden signboard holding a
 * modern IDE-style terminal that types out David's bash "about" script.
 * Drag anywhere to rotate the sign.
 */
export default function HeroTerminal() {
  return (
    <group>
      <BeachClearing />
      <FloatingTerminal />
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Beach clearing — palms, rocks, grass, flowers
 * ------------------------------------------------------------------ */
function BeachClearing() {
  const palms = [
    { x: -5, z: -2, tilt: 0.08 },
    { x: -6.5, z: 1.5, tilt: -0.06 },
    { x: 5, z: -2, tilt: -0.09 },
    { x: 6.5, z: 1.5, tilt: 0.07 },
    { x: -8, z: -5, tilt: 0.05, scale: 0.9 },
    { x: 8, z: -5, tilt: -0.05, scale: 0.9 },
  ]
  const rocks = [
    { x: -3.4, z: 2, scale: 0.4 },
    { x: 3.6, z: 2.2, scale: 0.35 },
    { x: -2.2, z: -3.5, scale: 0.28 },
    { x: 2.6, z: -3.4, scale: 0.3 },
  ]
  const grass = scatter(28, { w: 14, h: 8, zOffset: -1 }, 3)
  const flowers = scatter(14, { w: 12, h: 7, zOffset: -1 }, 11)
  const flowerColors = ['#ffb3c1', '#ffe066', '#d3b8ff', '#ff9b7a']

  return (
    <group>
      {/* Ancient temple ruin as backdrop */}
      <TempleRuin position={[0, 0, -6]} />

      {palms.map((p, i) => (
        <PalmTree
          key={i}
          position={[p.x, 0, p.z]}
          scale={p.scale ?? 1}
          tilt={p.tilt}
          seed={i * 1.7}
        />
      ))}
      {rocks.map((r, i) => (
        <Rock key={i} position={[r.x, r.scale * 0.4, r.z]} scale={r.scale} />
      ))}
      {grass.map((g, i) => (
        <GrassTuft key={`g-${i}`} position={[g.x, 0, g.z]} scale={g.scale * 0.7} />
      ))}
      {flowers.map((f, i) => (
        <Flower
          key={`f-${i}`}
          position={[f.x, 0, f.z]}
          color={flowerColors[i % flowerColors.length]}
          scale={f.scale}
        />
      ))}
    </group>
  )
}

/**
 * A ruined Greek-style temple as backdrop — four pillars and a beam,
 * some pillars broken to show age.
 */
function TempleRuin({ position }) {
  return (
    <group position={position}>
      {/* Base stone platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[8.5, 0.2, 3.5]} />
        <meshStandardMaterial color="#c8a97a" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[7.8, 0.1, 3.0]} />
        <meshStandardMaterial color="#dcbe89" roughness={0.9} flatShading />
      </mesh>
      {/* Four full-height pillars */}
      <TemplePillar position={[-3.2, 0.3, 0]} height={3.4} />
      <TemplePillar position={[-1.1, 0.3, 0]} height={3.4} />
      <TemplePillar position={[1.1, 0.3, 0]} height={3.4} />
      <TemplePillar position={[3.2, 0.3, 0]} height={3.4} />
      {/* Broken pillar behind */}
      <TemplePillar position={[-2, 0.3, -1.4]} height={1.8} broken />
      <TemplePillar position={[2, 0.3, -1.4]} height={2.2} broken />
      {/* Entablature across the top */}
      <TempleBeam position={[0, 4.1, 0]} length={7.0} />
      {/* Pediment (triangular top) */}
      <mesh position={[0, 4.55, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.9, 3]} rotation={[0, Math.PI / 6, 0]} />
        <meshStandardMaterial color="#e0c399" roughness={0.9} flatShading />
      </mesh>
      {/* Small steps to entrance */}
      <mesh position={[0, 0.05, 1.9]}>
        <boxGeometry args={[2.5, 0.1, 0.4]} />
        <meshStandardMaterial color="#c8a97a" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.15, 2.2]}>
        <boxGeometry args={[2.0, 0.1, 0.3]} />
        <meshStandardMaterial color="#c8a97a" roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Wooden signboard holding the terminal (drag anywhere to rotate)
 * ------------------------------------------------------------------ */
function FloatingTerminal() {
  const rig = useRef()
  const { size } = useThree()
  const drag = useRef({ active: false, x: 0, targetY: 0, currentY: 0 })

  useEffect(() => {
    const onDown = (e) => { drag.current.active = true; drag.current.x = e.clientX }
    const onMove = (e) => {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.x
      drag.current.targetY = THREE.MathUtils.clamp(
        drag.current.targetY + dx / (size.width * 0.9),
        -0.5, 0.5,
      )
      drag.current.x = e.clientX
    }
    const onUp = () => (drag.current.active = false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [size.width])

  useFrame((state) => {
    if (!rig.current) return
    const t = state.clock.elapsedTime
    const idle = drag.current.active ? 0 : Math.sin(t * 0.6) * 0.06
    drag.current.currentY = THREE.MathUtils.lerp(
      drag.current.currentY, drag.current.targetY + idle, 0.08
    )
    rig.current.rotation.y = drag.current.currentY
    rig.current.position.y = 1.65 + Math.sin(t * 0.9) * 0.04
  })

  return (
    <group ref={rig} position={[0, 1.65, 0]}>
      <SignFrame />
      <Html
        transform
        distanceFactor={3.6}
        position={[0, 0.1, 0.09]}
        occlude={false}
        className="term-html"
        pointerEvents="auto"
      >
        <TerminalContent />
      </Html>
    </group>
  )
}

function SignFrame() {
  const wood = '#b17a4a'
  const woodDark = '#8b5a30'
  return (
    <group>
      {/* Two support posts driven into the ground */}
      <mesh position={[-1.9, -1.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 2.6, 6]} />
        <meshStandardMaterial color={woodDark} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[1.9, -1.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 2.6, 6]} />
        <meshStandardMaterial color={woodDark} roughness={0.9} flatShading />
      </mesh>
      {/* Back board — wider to hold the taller terminal */}
      <mesh castShadow>
        <boxGeometry args={[4.0, 2.3, 0.12]} />
        <meshStandardMaterial color="#f4d9a8" roughness={0.85} flatShading />
      </mesh>
      {/* Top plank cross-piece */}
      <mesh position={[0, 1.25, 0.03]} rotation={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[4.1, 0.18, 0.14]} />
        <meshStandardMaterial color={wood} roughness={0.85} flatShading />
      </mesh>
      {/* Bottom plank */}
      <mesh position={[0, -1.25, 0.03]} castShadow>
        <boxGeometry args={[4.1, 0.18, 0.14]} />
        <meshStandardMaterial color={wood} roughness={0.85} flatShading />
      </mesh>
      {/* Small side-flag on a stubby pole */}
      <mesh position={[1.95, 1.55, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.45, 4]} />
        <meshStandardMaterial color={woodDark} flatShading />
      </mesh>
      <mesh position={[2.12, 1.7, 0]}>
        <coneGeometry args={[0.09, 0.28, 3]} />
        <meshStandardMaterial color="#ff9b7a" flatShading />
      </mesh>
      {/* Vine leaves at the base corners */}
      {[-2.02, 2.02].map((x, i) => (
        <mesh key={i} position={[x, -1.15, 0.1]} rotation={[0, 0, i === 0 ? -0.5 : 0.5]}>
          <coneGeometry args={[0.11, 0.35, 3]} />
          <meshStandardMaterial color="#7ec850" flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * Modern IDE-style terminal with tabs, line numbers, avatar, syntax
 * highlighting, and typewriter animation.
 * ------------------------------------------------------------------ */
function TerminalContent() {
  const lines = STORY.hero.terminalLines
  const [typed, setTyped] = useState(() => lines.map(() => null))
  const [allDone, setAllDone] = useState(false)
  const [activeLine, setActiveLine] = useState(0)
  const [cursorPos, setCursorPos] = useState('1:1')

  useEffect(() => {
    let cancelled = false
    let li = 0
    let ci = 0
    let timer = null

    const step = () => {
      if (cancelled) return
      if (li >= lines.length) {
        setAllDone(true)
        setCursorPos(`${lines.length}:${lines[lines.length - 1].text.length + 1}`)
        return
      }
      const currentLi = li
      const currentCi = ci
      const line = lines[currentLi]

      if (currentCi >= line.text.length) {
        setTyped((prev) => {
          const next = prev.slice()
          next[currentLi] = { ...line, done: true }
          return next
        })
        li = currentLi + 1
        ci = 0
        setActiveLine(li)
        timer = setTimeout(step, line.kind === 'comment' ? 120 : 200)
        return
      }

      const nextCi = currentCi + 1
      setTyped((prev) => {
        const next = prev.slice()
        next[currentLi] = { ...line, text: line.text.slice(0, nextCi), done: false }
        return next
      })
      setCursorPos(`${currentLi + 1}:${nextCi + 1}`)
      ci = nextCi
      const delay = line.kind === 'blank' ? 0
                  : line.kind === 'comment' ? 14
                  : 16 + Math.random() * 18
      timer = setTimeout(step, delay)
    }

    timer = setTimeout(step, 250)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [lines])

  return (
    <div className="term">
      <div className="term-tabs">
        <div className="term-tab active">
          <span className="dot" />
          <span>~/about.sh</span>
        </div>
        <div className="term-tab">
          <span className="dot" />
          <span>role.md</span>
        </div>
      </div>

      <div className="term-body">
        <div className="term-code">
          {lines.map((line, i) => {
            const shown = typed[i]
            const isCurrent = (!allDone && i === activeLine) ||
                              (allDone && i === lines.length - 1)
            return (
              <div className="term-line" key={i}>
                <span className="term-lineno">{i + 1}</span>
                <span className="term-linetext">
                  {shown ? renderBashLine(shown.text, shown.kind) : (line.kind === 'blank' ? '' : '')}
                  {isCurrent && shown && !shown.done && <span className="caret" />}
                  {allDone && i === lines.length - 1 && <span className="caret" />}
                </span>
              </div>
            )
          })}
        </div>
        <div className="term-avatar">
          <img
            src={PROFILE.avatar}
            alt={PROFILE.alias}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'grid'
            }}
          />
          <div className="initials" style={{ display: 'none' }}>DL</div>
        </div>
      </div>

      <div className="term-status">
        <span className="mode">NORMAL</span>
        <span className="file">about.sh</span>
        <span className="pos">{cursorPos}</span>
      </div>
    </div>
  )
}

// Bash syntax colouring
function renderBashLine(text, kind) {
  if (kind === 'blank' || text === '') return ''
  if (kind === 'comment' || text.startsWith('#')) {
    return <span className="comment">{text}</span>
  }
  // export USER="value"
  const exportMatch = text.match(/^(export)(\s+)([A-Z_][A-Z0-9_]*)(=)("[^"]*"?)/)
  if (exportMatch) {
    const [, kw, sp, name, eq, str] = exportMatch
    const rest = text.slice(exportMatch[0].length)
    return (
      <>
        <span className="kw">{kw}</span>{sp}
        <span className="var">{name}</span>{eq}
        <span className="str">{str}</span>
        {rest}
      </>
    )
  }
  // echo "..."
  const echoMatch = text.match(/^(echo)(\s+)("[^"]*"?)/)
  if (echoMatch) {
    const [, kw, sp, str] = echoMatch
    return (
      <>
        <span className="kw">{kw}</span>{sp}
        <span className="str">{highlightStringVars(str)}</span>
        {text.slice(echoMatch[0].length)}
      </>
    )
  }
  return text
}

function highlightStringVars(str) {
  const parts = []
  const re = /\$[A-Z_][A-Z0-9_]*/g
  let last = 0
  let m
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) parts.push(str.slice(last, m.index))
    parts.push(<span className="dollar" key={m.index}>{m[0]}</span>)
    last = m.index + m[0].length
  }
  if (last < str.length) parts.push(str.slice(last))
  return parts
}
