import { useState } from 'react'
import { STORY, PROFILE } from '../../data/profile.js'
import SocialDock from './SocialDock.jsx'
import SectionCard from './SectionCard.jsx'
import Lightbox from './Lightbox.jsx'

/**
 * HTML overlay for the island carousel.
 *   • Top nav — brand + section labels (click to jump)
 *   • Big left/right arrows on the screen edges
 *   • Expandable SectionCard in bottom-left with title, body, details,
 *     and image gallery
 *   • Pagination dots at bottom-center
 *   • Social dock on the right
 *   • Lightbox overlay (rendered on top of everything) when a gallery
 *     thumbnail is clicked
 */
export default function Overlay({ sections, activeIndex, onJump, onPrev, onNext, theme = 'light', onToggleTheme }) {
  const active = sections[activeIndex] || sections[0]
  const story = STORY[active.id] || {}
  const canPrev = activeIndex > 0
  const canNext = activeIndex < sections.length - 1

  // Lightbox state — { gallery, index } when open, null when closed
  const [lightbox, setLightbox] = useState(null)

  return (
    <div className="overlay">
      <nav className="topnav">
        <button className="brand" onClick={() => onJump(0)}>
          <span className="brand-mark" />
          <span>david@devops:~</span>
        </button>
        <div className="nav-links">
          {sections.map((s, i) => (
            <button
              key={s.id}
              className={i === activeIndex ? 'active' : ''}
              onClick={() => onJump(i)}
            >
              {s.label}
            </button>
          ))}
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              // Sun icon
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              // Moon icon
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Side arrows */}
      <button
        className={`nav-arrow left ${!canPrev ? 'disabled' : ''}`}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous island"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.7 5.3a1 1 0 0 0-1.4 0L7.6 12l6.7 6.7a1 1 0 1 0 1.4-1.4L10.4 12l5.3-5.3a1 1 0 0 0 0-1.4z"/>
        </svg>
      </button>
      <button
        className={`nav-arrow right ${!canNext ? 'disabled' : ''}`}
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next island"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.3 5.3a1 1 0 0 1 1.4 0L16.4 12l-6.7 6.7a1 1 0 1 1-1.4-1.4L13.6 12 8.3 6.7a1 1 0 0 1 0-1.4z"/>
        </svg>
      </button>

      <SectionCard
        story={story}
        sectionId={active.id}
        onImageClick={(gallery, index) => setLightbox({ gallery, index })}
      />

      {/* Pagination dots */}
      <div className="pagination">
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={`dot ${i === activeIndex ? 'active' : ''}`}
            onClick={() => onJump(i)}
            aria-label={`Go to ${s.label}`}
          >
            <span className="dot-label">{s.label}</span>
          </button>
        ))}
      </div>

      <SocialDock />

      <footer style={footerStyle}>
        <span>© {new Date().getFullYear()} · {PROFILE.name}</span>
        <span style={{ opacity: 0.5 }}> · built with React Three Fiber</span>
      </footer>

      {lightbox && (
        <Lightbox
          gallery={lightbox.gallery}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndexChange={(next) =>
            setLightbox((cur) => ({ ...cur, index: next }))
          }
        />
      )}
    </div>
  )
}

const footerStyle = {
  position: 'absolute',
  left: 32,
  bottom: 12,
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 10,
  letterSpacing: '0.16em',
  color: '#5a6482',
  pointerEvents: 'none',
}
