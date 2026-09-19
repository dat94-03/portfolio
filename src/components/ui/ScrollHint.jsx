export default function ScrollHint({ dimmed }) {
  return (
    <div className={`scroll-hint ${dimmed ? 'dimmed' : ''}`}>
      <span>scroll</span>
      <div className="arrow" />
    </div>
  )
}
