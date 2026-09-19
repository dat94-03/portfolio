import { SOCIALS } from '../../data/socials.js'
import { Icon } from './Icons.jsx'

export default function SocialDock() {
  return (
    <nav className="social-dock" aria-label="Social links">
      {SOCIALS.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target={s.url.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          title={s.label}
          aria-label={s.label}
        >
          <Icon name={s.icon} />
        </a>
      ))}
    </nav>
  )
}
