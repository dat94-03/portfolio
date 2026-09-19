import { useEffect, useState } from 'react'

/**
 * Full-screen lightbox for the section-card image galleries.
 *
 * Props:
 *   gallery : array of { src, caption }
 *   index   : current image index
 *   onClose : called when the lightbox should dismiss
 *   onIndexChange(next) : navigate to another image
 *
 * Behaviour:
 *   • Click backdrop or press ESC → close
 *   • ← / → arrow keys, or side buttons → prev / next
 *   • Failing image falls back to a stylised gradient with the caption
 */
export default function Lightbox({ gallery, index, onClose, onIndexChange }) {
  const [failed, setFailed] = useState(false)
  const current = gallery[index]

  // Reset the failed flag whenever we switch images
  useEffect(() => { setFailed(false) }, [index])

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
      else if (e.key === 'ArrowLeft')  { e.stopPropagation(); onIndexChange(Math.max(0, index - 1)) }
      else if (e.key === 'ArrowRight') { e.stopPropagation(); onIndexChange(Math.min(gallery.length - 1, index + 1)) }
    }
    // Capture-phase so we handle before the App-level nav sees them
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [index, gallery.length, onClose, onIndexChange])

  if (!current) return null
  const canPrev = index > 0
  const canNext = index < gallery.length - 1

  const palette = [
    ['#7fd0e0', '#a8d95f'],
    ['#ffb3c1', '#ffe066'],
    ['#d3b8ff', '#7fd0e0'],
    ['#ff9b7a', '#ffe066'],
    ['#a8d95f', '#7fd0e0'],
    ['#f2c15c', '#c98a2d'],
  ]
  const [c1, c2] = palette[index % palette.length]

  return (
    <div className="lightbox" onClick={onClose}>
      <button
        className="lightbox-close"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4l-6.3 6.3-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4L10.6 10.6l6.3-6.3z"/>
        </svg>
      </button>

      {canPrev && (
        <button
          className="lightbox-nav left"
          onClick={(e) => { e.stopPropagation(); onIndexChange(index - 1) }}
          aria-label="Previous image"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M15.7 5.3a1 1 0 0 0-1.4 0L7.6 12l6.7 6.7a1 1 0 1 0 1.4-1.4L10.4 12l5.3-5.3a1 1 0 0 0 0-1.4z"/>
          </svg>
        </button>
      )}
      {canNext && (
        <button
          className="lightbox-nav right"
          onClick={(e) => { e.stopPropagation(); onIndexChange(index + 1) }}
          aria-label="Next image"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M8.3 5.3a1 1 0 0 1 1.4 0L16.4 12l-6.7 6.7a1 1 0 1 1-1.4-1.4L13.6 12 8.3 6.7a1 1 0 0 1 0-1.4z"/>
          </svg>
        </button>
      )}

      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        {!failed ? (
          <img
            src={current.src}
            alt={current.caption}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className="lightbox-fallback"
            style={{ background: `linear-gradient(140deg, ${c1}, ${c2})` }}
          >
            <span>Image coming soon</span>
            <small>{current.caption}</small>
          </div>
        )}
        <figcaption>
          <span className="lightbox-caption">{current.caption}</span>
          <span className="lightbox-counter">{index + 1} / {gallery.length}</span>
        </figcaption>
      </figure>
    </div>
  )
}
