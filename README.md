# Lỗ Hoàng Tiến Đạt (David) — Portfolio

A portfolio that draws itself. The page is a **draw.io canvas**, and as you
scroll, a team of cursors drags out the shapes, types the labels and pulls the
connectors — nine pages of diagram, built live.

**Live:** https://dat94-03.github.io/portfolio/

---

## The idea

I spend my days in draw.io diagramming AWS landing zones, so the portfolio is
one: grid paper, the diagrams.net default fill/stroke palette, containers with
caption bars, swimlane-style cards, notes with folded corners, hexagons,
marching-ants selection outlines, and orthogonal connectors with flow
animation.

Nothing is pre-rendered. Scroll position drives a scheduler, and the scheduler
drives four concurrent "runners" — cursors named like CI matrix jobs — each
drawing its own branch of the page. Dependencies are inferred, so a connector
waits for both shapes it joins, and an independent card never waits for its
neighbour.

Two rules shape the whole interaction:

- **The ink never dries backwards.** Progress is monotonic per page. Scroll
  back up and finished work stays on the canvas; the cursors disappear because
  there is nothing left to draw.
- **One zoom for the document.** Like a real `.drawio` file, every page renders
  at the same scale — the tightest page's fit — so no page reads bigger than
  another.

## The nine pages

| # | Page | |
|---|---|---|
| 01 | Title | photo, name, role, stack |
| 02 | About me | how I work |
| 03 | Education & certs | HUST · IT2 · K66, Excellent Graduate, AWS SAP + SAA, TOEIC 920, and the paperwork |
| 04 | FPT Software | the employer, branching to three projects |
| 05 | Project A | Internal Developer Platform on Backstage (Japan) |
| 06 | Project B | Enterprise AWS Landing Zone, 1,000+ accounts (Germany) |
| 07 | Project C | CI/CD governance & DevSecOps (Singapore) |
| 08 | Toolbox | what I actually use |
| 09 | Contact | a flowchart that ends in an email address |

## Things worth clicking

- **Drag on empty canvas** — rubber-band select, like the editor. Click a shape
  to select it alone, `Esc` to clear.
- **Photo thumbnails** — open a preview dialog with the filename in its title
  bar. `←` / `→` to step through, `Esc` to close.
- **Dark mode** — the toggle in the top bar. Every shape has a dark-canvas
  palette, and the choice survives a reload.
- **Contact cards** — real links, keyboard reachable.
- **Replay** — at the bottom. Wipes the board and draws it all again.

## Built with

Nothing. One `index.html`, one `icons.js`, and the images.

No framework, no build step, no bundler, no runtime dependency, no network
request. Brand marks are inlined path data from
[Simple Icons](https://simpleicons.org) (CC0); logos and photographs are mine.

```
index.html     the page: styles, the nine pages' data, and the engine
icons.js       official brand mark path data
logos/         institution and employer logos
photos/        gallery images (thumbnail + full for each)
```

## Running it

Open `index.html`. That's it — `file://` works, because there is nothing to
serve.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which uploads the
repository root to GitHub Pages. No build. Set
**Settings → Pages → Source = "GitHub Actions"** once.

## Accessibility and fallbacks

- `prefers-reduced-motion` — pages render complete instead of animating, and
  the marching ants, flow arrows and cursor all stand still.
- **Below 820px wide** (or 560px tall) the page switches renderer: shapes leave
  absolute positioning and stack into a single column, because scaling a
  1180px canvas onto a phone would render 14px text at 4px. Cards still draw
  themselves top-down and labels still type.
- Contact cards and gallery thumbnails are focusable with visible focus rings.
