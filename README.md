# David Lo — Portfolio(Vibe it till you make it 🗿🗿🗿)

A cinematic low-poly 3D portfolio for **Lo Hoang Tien Dat (David)** — DevOps / Cloud Engineer. Built with **React + Vite + React Three Fiber** and designed to feel like a short guided flight through a career, not a wall of bullet points.

Live site: `https://david-lo.github.io` (once you deploy — see below).

---

## What the visitor experiences

Six connected 3D "zones", stitched together by a scroll-driven camera path:

1. **Hero — `boot.sh`** · A dark low-poly server room. A floating 3D vim terminal types out a welcome message. Click-and-drag rotates it.
2. **About — `whoami`** · A hex platform holding an avatar frame, orbited by three data-rings.
3. **Education — `origin`** · A **procedural low-poly HUST medal** sitting in an open velvet box. Pointer-hover follows the mouse. Click the medal to flip it. A GPA gauge glows behind. Three floating scholarship certificate cards flank.
4. **Experience — `landing_zone`** · A central Transit-Gateway hub with two dozen account-nodes orbiting on rings. Three pillars — Germany 🇩🇪, France 🇫🇷, Singapore 🇸🇬 — represent the three customer projects. Hover a pillar → a dossier card pops in.
5. **Skills — `arsenal`** · A drifting constellation of low-poly icons grouped by category (AWS · Governance · IaC & CI/CD · Containers · Monitoring · Languages · Data). Hover a node to reveal its label.
6. **Contact — `signal`** · A low-poly satellite dish with a beam of particles rising up. Social icons orbit on two rings. A contact card floats to the right.

Everything runs at any viewport size. Postprocessing (bloom, vignette, subtle chromatic aberration) gives the whole thing a cinematic sheen.

---

## Quick start

```bash
# 1. install
npm install

# 2. run in dev
npm run dev
# → http://localhost:5173

# 3. build
npm run build

# 4. preview the build locally
npm run preview
```

---

## Adding your images

The site currently uses placeholders (with graceful fallbacks). Drop the real
files into `public/images/` using these filenames — the site will pick them up
automatically:

| Slot | Path | Notes |
|---|---|---|
| Avatar | `public/images/avatar.png` | Square, at least 512×512. Shows on the About platform. Falls back to a monogram if missing. |
| HUST medal photo | `public/images/medal-hust.png` | Reference photo — not shown directly (the medal is procedural 3D), used only if you later choose to embed it as a texture. |
| Scholarship — 2024-2 | `public/images/scholarship-2024-2.png` | Shown behind a certificate frame in the Education scene. |
| Scholarship — 2025-1 | `public/images/scholarship-2025-1.png` | " |
| Scholarship — 2025-2 | `public/images/scholarship-2025-2.png` | " |

All placeholders are wrapped in `onError` handlers, so missing files fall back
to a stylised gradient — nothing breaks. See `public/images/README.md` for a
short guide.

---

## Editing content

All story copy and structured content lives in `src/data/`:

- `profile.js` — name, tagline, section titles, terminal typing script, HUST education details.
- `projects.js` — the three customer projects (Germany / France / Singapore).
- `skills.js` — grouped tech list; add/remove items and they re-lay-out automatically.
- `socials.js` — social links. Two entries (GitHub, LinkedIn, Email) already have real URLs from your resume; the rest are `#` — replace them.

Change any field and the site regenerates on next reload — no scene code
needs to be touched.

---

## Deploying to GitHub Pages (user site)

This project targets a **user site** repo — the repo must be named exactly
`<your-github-username>.github.io` (i.e. `david-lo.github.io`).

1. Create the repo `david-lo/david-lo.github.io` on GitHub (public, empty).
2. Push this folder as its `main` branch:
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "chore: initial portfolio scaffold"
   git branch -M main
   git remote add origin git@github.com:david-lo/david-lo.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source = `GitHub Actions`**.
4. That's it — the `.github/workflows/deploy.yml` workflow already in this
   repo will build & publish every push to `main`.

The site will be live at `https://david-lo.github.io` shortly after the first
successful workflow run.

### If you'd rather use a project site

Rename the repo (e.g. `dat94-03/portfolio`), then change `base` in
`vite.config.js` from `'/'` to `'/portfolio/'`. Everything else works the same.

---

## Layout of the source

```
portfolio/
├── .github/workflows/deploy.yml   ← GitHub Actions Pages deploy
├── index.html                      ← Single HTML shell
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── images/                     ← Drop your images here
└── src/
    ├── main.jsx                    ← React entry
    ├── App.jsx                     ← App shell (loader + canvas + overlay)
    ├── styles.css                  ← Design tokens + all HTML styling
    ├── data/                       ← All content — edit here
    │   ├── profile.js
    │   ├── projects.js
    │   ├── skills.js
    │   └── socials.js
    ├── components/
    │   ├── Scene.jsx               ← R3F canvas + scroll-driven camera rig
    │   ├── scenes/                 ← Six section-scenes
    │   │   ├── HeroTerminal.jsx
    │   │   ├── AboutPlatform.jsx
    │   │   ├── EducationMedal.jsx
    │   │   ├── ExperienceLandingZone.jsx
    │   │   ├── SkillsConstellation.jsx
    │   │   └── ContactSignal.jsx
    │   └── ui/                     ← HTML overlay chrome
    │       ├── Overlay.jsx
    │       ├── SocialDock.jsx
    │       ├── ScrollHint.jsx
    │       └── Icons.jsx
    └── three/
        ├── LowPolyGround.jsx       ← Shared displaced-plate ground
        ├── Starfield.jsx           ← Ambient star cloud
        └── PolyMedal.jsx           ← Procedural HUST medal + velvet box
```

---

## Design notes

- **Dark theme.** All backgrounds are deep near-black (`#05070c`) with cool
  accents (cyan `#4cc9f0`, violet `#9d7cff`) and warm gold (`#f5c86a`) for
  award/emphasis elements.
- **Low-poly, everywhere.** No high-poly imported meshes. Everything is
  procedural — cylinders, octahedrons, extruded shapes, flat-shaded
  materials. Keeps the bundle tiny and the aesthetic coherent.
- **Story-shaped copy.** Resume bullets were re-written into active-voice,
  narrative sentences. The résumé remains the source of truth for facts.
- **Accessibility.** Semantic top-nav with jump-to-section buttons, alt text
  on icons, `prefers-reduced-motion` respected by keeping animations subtle
  (further reductions can be added if you'd like — see notes in `Scene.jsx`).

---

## License

Personal / portfolio use. Fonts (Space Grotesk, JetBrains Mono) served from
Google Fonts under the SIL Open Font License.
