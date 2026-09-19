import { useEffect, useState } from 'react'
import { STORY, PROFILE } from '../../data/profile.js'

/**
 * Modern IDE-style terminal — a self-contained React component that
 * renders the bash "about" script typing itself out. Designed to be
 * dropped inside a drei <Html transform> so it can sit on a 3D surface
 * (a signboard, a monitor screen, etc.).
 *
 * Handles its own typing animation, cursor blink, and status bar.
 */
export default function IdeTerminal() {
  const lines = STORY.hero.terminalLines
  const [typed, setTyped] = useState(() => lines.map(() => null))
  const [allDone, setAllDone] = useState(false)
  const [activeLine, setActiveLine] = useState(0)
  const [cursorPos, setCursorPos] = useState('1:1')
  const [activeTab, setActiveTab] = useState('about')     // 'about' | 'role'

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

  const isAbout = activeTab === 'about'
  const fileName = isAbout ? 'about.sh' : 'role.md'
  // Tabs need to be event-swallowing so their clicks don't fall through to
  // the 3D group's onPointerDown drag handler.
  const stop = (e) => e.stopPropagation()

  return (
    <div className="term" onPointerDown={stop}>
      <div className="term-tabs">
        <div
          className={`term-tab ${isAbout ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <span className="dot" />
          <span>~/about.sh</span>
        </div>
        <div
          className={`term-tab ${!isAbout ? 'active' : ''}`}
          onClick={() => setActiveTab('role')}
        >
          <span className="dot" />
          <span>role.md</span>
        </div>
      </div>

      <div className="term-body">
        {isAbout ? (
          <>
            <div className="term-code">
              {lines.map((line, i) => {
                const shown = typed[i]
                const isCurrent = (!allDone && i === activeLine) ||
                                  (allDone && i === lines.length - 1)
                return (
                  <div className="term-line" key={i}>
                    <span className="term-lineno">{i + 1}</span>
                    <span className="term-linetext">
                      {shown ? renderBashLine(shown.text, shown.kind) : ''}
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
          </>
        ) : (
          <RoleMdContent />
        )}
      </div>

      <div className="term-status">
        <span className="mode">{isAbout ? 'NORMAL' : 'MARKDOWN'}</span>
        <span className="file">{fileName}</span>
        <span className="pos">{isAbout ? cursorPos : '1:1'}</span>
      </div>
    </div>
  )
}

/**
 * Markdown content rendered when the `role.md` tab is active — a short
 * summary of what David does day-to-day, styled to look like a rendered
 * markdown file inside a code editor.
 */
function RoleMdContent() {
  return (
    <div className="term-md" style={{ flex: 1 }}>
      <h1>DevOps / Cloud Engineer</h1>
      <p>
        Six years running enterprise cloud platforms for international
        customers at <code>FPT Software</code>, currently on their AWS
        Landing Zone practice.
      </p>

      <h2>Focus</h2>
      <ul>
        <li>AWS <code>Control Tower</code> · <code>Organizations</code> · <code>Identity Center</code></li>
        <li><code>Terraform</code> · <code>AFT</code> · <code>CDK</code> · <code>GitHub Actions</code></li>
        <li>Kubernetes (<code>EKS</code>) · <code>Argo CD</code> · <code>Helm</code></li>
        <li>SCPs · <code>GuardDuty</code> · <code>Security Hub</code> · <code>Vault</code></li>
      </ul>

      <h2>Where</h2>
      <ul>
        <li>Hanoi, Vietnam · GMT+7</li>
        <li>Comfortable across EU + APAC time zones</li>
      </ul>
    </div>
  )
}

// Bash syntax colouring
function renderBashLine(text, kind) {
  if (kind === 'blank' || text === '') return ''
  if (kind === 'comment' || text.startsWith('#')) {
    return <span className="comment">{text}</span>
  }
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
