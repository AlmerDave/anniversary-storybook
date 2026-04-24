# Anniversary Website — CLAUDE.md

A romantic, storybook-style anniversary website inspired by Van Gogh's *Starry Night*. Built with React, it tells the story of two people as a cosmic narrative — two stars drifting alone, pulled together by gravity. Navigation is chapter-by-chapter (button + swipe), not scroll-driven. Full plan: `docs/anniversary-website-plan.md`.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React + Vite | Core framework + dev server |
| Framer Motion | Chapter transitions, entrance animations, AnimatePresence |
| GSAP | Used only where noted — no ScrollTrigger anywhere |
| tsParticles | Background star field and particle effects |
| Tailwind CSS | Responsive utility-first styling |
| Google Fonts | Cormorant Garamond (headings) + DM Sans (body) + Dancing Script (letter) |
| Howler.js | Background music + SFX playback (singleton via AudioContext) |

---

## Design System

### Color Palette

```css
--deep-canvas:     #0D0D2B  /* main background */
--night-indigo:    #1B2A6B  /* sky layers */
--cobalt-swirl:    #2E4A9E  /* brush stroke accents */
--gold-star:       #C9A84C  /* her star — glow, highlights */
--warm-glow:       #F5E6A3  /* star shimmer, text accents */
--violet-star:     #7B4FBF  /* his star — Chapter II onwards */
--aurora-teal:     #3ABFBF  /* aurora wave color (Chapter IV) */
--blush-accent:    #E8B4D8  /* soft romantic highlights */
--starlight-white: #FAFAFA  /* body text, narration */
```

### Typography
- **Headings:** `Cormorant Garamond` — romantic serif, readable at all sizes
- **Body / Narration:** `DM Sans` — clean, modern, legible
- **Letter / Labels:** `Dancing Script` — handwritten feel for the love letter and star labels

---

## Architecture

### Navigation Model — Storybook (not scroll)
The site is a **full-viewport storybook**. Each page (Intro + 4 chapters) fills the screen. The user advances via:
- `← →` arrow buttons fixed at bottom-center
- Left/right swipe on mobile (50px threshold, native touch events)
- The pulsing constellation dot on the Intro page (entry only — no traditional button)

`App.jsx` holds `currentChapter` state (0 = Intro, 1–4 = chapters). Only the active chapter is rendered. `AnimatePresence mode="wait"` handles 0.8s fade transitions between chapters. **There is no page scroll between chapters.**

### Config-Driven — `src/data.js`
**All content lives in `src/data.js`.** Components never hardcode names, dates, messages, or photos. Everything reads from the `config` export:

```js
export const config = {
  name, anniversaryDate, metDate,
  story: { before, meeting, solar, promise },
  years: [{ year, label, planetColor, stars: [{ id, date, image, message }] }],
  letter
}
```

### File Structure

```
/anniversary-website
├── public/
│   ├── photos/             ← drop photo assets here (star1.jpg, star2.jpg … matching star id)
│   └── audio/              ← drop audio assets here (ambient.mp3 + sfx-*.mp3)
├── src/
│   ├── data.js             ← ALL CONTENT HERE — edit this only
│   ├── main.jsx            ← React entry point (mounts App)
│   ├── App.jsx             ← chapter state machine + nav buttons + swipe + AudioProvider
│   ├── index.css           ← global styles, CSS variables, fonts
│   ├── context/
│   │   └── AudioContext.jsx    Howler singleton — ambient music + SFX, mute toggle, useAudio() hook
│   └── components/
│       ├── Intro.jsx           Night Awakening — rapid shooting stars, constellation dot nav
│       ├── ChapterOne.jsx      A Universe Waiting — large sun-star, glow rings, "me" label, typewriter
│       ├── ChapterTwo.jsx      Two Stars Collide — 5-phase cinematic collision sequence
│       ├── ChapterThree.jsx    The Solar System of Us — Galaxy View + Planet View
│       ├── ChapterFour.jsx     Still Counting — aurora waves, dancing stars, letter reveal, day counter
│       ├── PlanetModal.jsx     Memory starfield + StarModal trigger (inside Chapter III Planet View)
│       ├── StarModal.jsx       Photo + message reveal card (polaroid style)
│       ├── AudioControls.jsx   Fixed mute/unmute speaker button (bottom-right, gold)
│       ├── CursorTrail.jsx     Golden brush stroke cursor trail effect
│       └── ParticleCanvas.jsx  Background star field (always mounted, behind chapters)
```

---

## Pages / Chapters

| # | Component | Description |
|---|---|---|
| 0 — Intro | `Intro` | Night Awakening: rapid shooting stars streak and settle, title fades in, pulsing constellation dot advances to Ch.I |
| I — A Universe Waiting | `ChapterOne` | Real 3D sun (`/public/photos/sun.jpg` NASA texture via `useTexture`), `OrbitControls` for inspection, stacking typewriter narration anchored to bottom |
| II — Two Stars Collide | `ChapterTwo` | 5-phase cinematic: gold star pulses → violet star arrives with "you" label → spiral orbit → kilonova burst → new stars scatter |
| III — The Solar System of Us | `ChapterThree` | Galaxy View: planets orbit central star (one planet per year). Click planet → Planet View: memory starfield for that year → `StarModal` |
| IV — Still Counting | `ChapterFour` | Aurora color waves, gold+violet stars in figure-8 orbit, love letter reveals line-by-line, day counter counts up from 0 |

---

## Key Implementation Notes

- **No ScrollTrigger** — GSAP ScrollTrigger is not used anywhere in the project.
- **No `whileInView`** — avoid using Framer Motion's `whileInView` in chapters; use `animate` with delays instead, since chapters mount directly into the viewport.
- **Chapters are viewport-filling** — most chapters use `min-h-screen flex items-center justify-center`. ChapterOne specifically uses `h-screen overflow-hidden` with absolute layers: star centered via `absolute inset-0 flex items-center justify-center`, text anchored via `absolute bottom-0`.
- **Nav button visibility rules**: ← hidden on Intro and Chapter I; → hidden on Chapter IV (last).
- **Back to Intro disabled** — once past the Intro, swipe/arrows cannot return to the Intro page (`goPrev` clamps to chapter 1).
- **ParticleCanvas stays mounted** — it lives outside `AnimatePresence` in `App.jsx` so the star field persists across chapter transitions.
- **Chapter III two-layer view** — `ChapterThree` holds `view` state (`'galaxy'` | `'planet'`). The RAF orbit loop in `usePlanetPositions` runs continuously. `PlanetModal` handles the memory starfield inside Planet View.
- **Chapter II phases** — driven by `usePhaseTimer` using plain `setTimeout` chains. Orbit animation uses a RAF loop (`useOrbit`) that runs only during the `orbit` phase.
- **Chapter IV dancing stars** — figure-8 lemniscate path computed via Bernoulli parametric equations in a RAF loop (`useDancingStars`). Day counter uses `useCountUp` (ease-out-cubic, ~1.5s).
- **data.js schema** — `years[]` drives Chapter III planets. Each year has a `stars[]` array for memories. `story.solar` is used in Ch.III; `story.promise` in Ch.IV. There is no `milestones[]` array.
- **data.js photo paths** — `image` fields use `` `${BASE}photos/starN.jpg` `` where `BASE = import.meta.env.BASE_URL`. Drop files into `public/photos/` named `star1.jpg`, `star2.jpg`, etc. matching the star `id`. This resolves correctly in both dev (`/photos/`) and GitHub Pages (`/anniversary-storybook/photos/`).
- **Audio system** — `AudioProvider` wraps the entire app in `App.jsx`. Audio is lazy-initialised on first user click (browser autoplay policy). Use `useAudio()` anywhere to call `playSound(name)` or `toggleMute()`. Howler's global `Howler.mute()` silences everything at once. SFX files live in `public/audio/` as `sfx-bloom.mp3`, `sfx-arrival.mp3`, `sfx-collision.mp3`, `sfx-newstars.mp3`, `sfx-planet.mp3`, `sfx-birth.mp3`, `sfx-letter.mp3`, `sfx-counter.mp3`. Missing files log a 404 warning but do not crash.

---

## Artist-Specific Details

These features are intentional for a partner who is a painter:

- **Cursor trail** (`CursorTrail.jsx`) — golden paint stroke follows the mouse for ~1 second then fades
- **Oil-paint shimmer** — stars use CSS filter effects to evoke oil on canvas texture
- **Painterly transitions** — each chapter fades in like a new canvas layer
- **Constellation dot navigation** — the Intro enter interaction feels like drawing a star map, not clicking a button
- **Polaroid photo cards** — memory photos slightly rotated like polaroids; hover lifts and straightens

---

## 3D / WebGL Notes (ChapterOne Sun)

ChapterOne renders a real 3D sun using React Three Fiber. Keep these consistent if revisiting:

- **Texture** — `/public/photos/sun.jpg` (NASA SDO equirectangular map). Loaded via `useTexture` from `@react-three/drei`.
- **Material** — `MeshStandardMaterial` with `map` + `emissiveMap` both set to the texture, `emissive="#FF6600"`, `emissiveIntensity={0.45}`, `roughness={1.0}`, `metalness={0.0}`. Do NOT raise `emissiveIntensity` above ~0.6 — it kills 3D depth by washing out shading.
- **Lighting** — `ambientLight intensity={0.1}` (low — preserves dark side for depth), warm key `pointLight` at `[3,2,3]`, orange rim `pointLight` at `[-2,-1,-3]`. Do NOT raise ambient above 0.3 or the sphere reads flat.
- **Canvas size** — `min(400px, 88vw)` responsive. Canvas uses `width/height: 100%` to fill its wrapper.
- **No EffectComposer / Bloom in ChapterOne** — Bloom was removed because WebGL effects clip hard at the canvas rectangle boundary. If bloom is needed in future chapters, the Canvas must be full-screen (`position: absolute, inset: 0`) so the glow has the entire viewport to bleed into.
- **Never wrap a Canvas in `.star-shimmer-lg`** — that class applies CSS `drop-shadow` which renders as a visible rectangle around the canvas box. CSS filters and WebGL canvases don't mix at element edges.
- **Entrance animation** — use `opacity: 0→1` fade only. Scale-based entrances with overshoot easings (e.g. `[0.34, 1.56, 0.64, 1]`) cause visible pop-and-enlarge on every page load and HMR refresh.
- **`Math.random()` in JSX** — never call `Math.random()` directly inside JSX props (e.g. in `transition`). It re-evaluates on every render causing animation resets. Pre-compute random values as a module-level constant array instead.

---

## When Unsure — Use Web Search

If you're uncertain about the correct approach for anything in this project — animation physics, easing curves, orbital mechanics, Framer Motion APIs, tsParticles config, React Three Fiber patterns, CSS filter behavior, or anything else — **use web search before guessing**. Good sources to check:

- MDN, React Three Fiber docs, Framer Motion docs, GSAP forums
- Stack Overflow, Codesandbox examples, GitHub issues for the relevant library
- Physics/math references for orbital mechanics, lemniscate curves, easing functions

Do not approximate or invent values for things like timing durations, spring physics, or parametric equations. Look them up.

---

## Deployment

Target: **Vercel** or **Netlify** free tier. Standard Vite build output (`dist/`). No backend required — fully static.

```bash
npm run build   # outputs to dist/
```
