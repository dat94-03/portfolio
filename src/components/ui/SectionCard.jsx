import { useState } from 'react'

/**
 * Section info card shown in the bottom-left corner. Two states:
 *   • Collapsed (default): eyebrow + title + short body + "Read more" toggle
 *     if the section has extra content.
 *   • Expanded: reveals `details[]` paragraphs and a clickable image gallery.
 *
 * The card resets to collapsed whenever `sectionId` changes so navigating
 * between islands doesn't leak state.
 *
 * `onImageClick(gallery, index)` is called when a gallery thumbnail is
 * clicked — the parent renders the lightbox.
 */
export default function SectionCard({ story, sectionId, onImageClick }) {
  const [expanded, setExpanded] = useState(false)

  // Reset when the section changes
  const key = sectionId
  const hasDetails = (story.details?.length ?? 0) > 0
  const hasGallery = (story.gallery?.length ?? 0) > 0
  const canExpand = hasDetails || hasGallery

  return (
    <section
      key={key}                       // re-mount on section change → collapse
      className={`section-caption ${expanded ? 'expanded' : ''} ${!story.title ? 'hidden' : ''}`}
    >
      <div className="eyebrow">{story.eyebrow}</div>
      <h2>{story.title}</h2>
      <p>{story.body}</p>

      {expanded && hasDetails && (
        <div className="details">
          {story.details.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>
      )}

      {expanded && hasGallery && (
        <div className="gallery">
          {story.gallery.map((img, i) => (
            <GalleryThumb
              key={img.src}
              image={img}
              index={i}
              onClick={() => onImageClick?.(story.gallery, i)}
            />
          ))}
        </div>
      )}

      {canExpand && (
        <button
          className="expand-btn"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Show less' : 'Read more'}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d={expanded
              ? 'M7 14l5-5 5 5H7z'
              : 'M7 10l5 5 5-5H7z'} />
          </svg>
        </button>
      )}
    </section>
  )
}

/**
 * A single gallery thumbnail. If the image fails to load (still empty
 * public/images/gallery/ folder for example) it falls back to a stylised
 * gradient tile with the caption text, so the UI never breaks.
 */
function GalleryThumb({ image, index, onClick }) {
  const [failed, setFailed] = useState(false)
  const palette = [
    ['#7fd0e0', '#a8d95f'],  // teal → grass
    ['#ffb3c1', '#ffe066'],  // rose → yellow
    ['#d3b8ff', '#7fd0e0'],  // lilac → teal
    ['#ff9b7a', '#ffe066'],  // coral → yellow
    ['#a8d95f', '#7fd0e0'],  // grass → teal
    ['#f2c15c', '#c98a2d'],  // gold → dark gold
  ]
  const [c1, c2] = palette[index % palette.length]

  return (
    <button className="gallery-thumb" onClick={onClick} aria-label={image.caption}>
      {!failed ? (
        <img
          src={image.src}
          alt={image.caption}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="gallery-fallback"
          style={{ background: `linear-gradient(140deg, ${c1}, ${c2})` }}
        >
          <span>{image.caption}</span>
        </div>
      )}
      <span className="gallery-caption">{image.caption}</span>
    </button>
  )
}
