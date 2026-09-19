import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Scene from './components/Scene.jsx'
import Overlay from './components/ui/Overlay.jsx'
import { SECTIONS } from './data/profile.js'

/**
 * Discrete-carousel navigation:
 *   • ← / → keyboard arrows
 *   • Left/right on-screen buttons
 *   • Mouse wheel / trackpad — snapping, single-step per gesture
 *   • Touch swipe on mobile
 *
 * State is a single `activeIndex` — Scene animates the island rig to it.
 */
export default function App() {
  const [ready, setReady] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0) // Start on the hero (lab) island
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('portfolio-theme') || 'light'
  })
  const lastNav = useRef(0)                          // debounce wheel scroll

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350)
    return () => clearTimeout(t)
  }, [])

  // Reflect theme on <html> so CSS variables in [data-theme="dark"] pick it up
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const go = useCallback((delta) => {
    setActiveIndex((cur) => {
      const next = Math.max(0, Math.min(SECTIONS.length - 1, cur + delta))
      return next
    })
  }, [])

  const jumpTo = useCallback((i) => {
    setActiveIndex(Math.max(0, Math.min(SECTIONS.length - 1, i)))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(1) }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(-1) }
      else if (e.key === 'Home') { e.preventDefault(); jumpTo(0) }
      else if (e.key === 'End')  { e.preventDefault(); jumpTo(SECTIONS.length - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, jumpTo])

  // Wheel navigation — debounced so a single scroll gesture = one island step
  useEffect(() => {
    const onWheel = (e) => {
      const now = performance.now()
      if (now - lastNav.current < 550) return
      const dx = Math.abs(e.deltaX)
      const dy = Math.abs(e.deltaY)
      const magnitude = Math.max(dx, dy)
      if (magnitude < 5) return
      const dir = (dx > dy ? e.deltaX : e.deltaY) > 0 ? 1 : -1
      lastNav.current = now
      go(dir)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [go])

  // Touch swipe
  useEffect(() => {
    let startX = 0, startY = 0
    const onStart = (e) => {
      const t = e.touches[0]
      startX = t.clientX
      startY = t.clientY
    }
    const onEnd = (e) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
      go(dx < 0 ? 1 : -1)
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [go])

  return (
    <div className="app-root">
      <div className={`loader ${ready ? 'gone' : ''}`}>
        <div className="glyph" />
        <div className="text">initialising cluster…</div>
      </div>

      <div className="canvas-wrap">
        <Suspense fallback={null}>
          <Scene activeIndex={activeIndex} theme={theme} onSectionChange={() => {}} />
        </Suspense>
      </div>

      <Overlay
        sections={SECTIONS}
        activeIndex={activeIndex}
        onJump={jumpTo}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  )
}
