# 🌌 Anniversary Website — Master Plan
**A Living Painting of Your Love Story**
*Built with React JS · Powered by Claude Sonnet 4.6*

---

## The Concept

Inspired by Van Gogh's *Starry Night* — a deep indigo canvas of swirling brush strokes and glowing stars, each one holding a piece of your relationship. The entire website tells a single cosmic narrative: **two stars drifting alone in the universe, slowly pulled toward each other by gravity — colliding, exploding, and creating an entire galaxy of shared memories.**

She won't just be viewing a website. She'll be living through your story.

---

## Color Palette

| Name | Hex | Usage |
|---|---|---|
| Deep Canvas | `#0D0D2B` | Main background |
| Night Indigo | `#1B2A6B` | Sky layers |
| Cobalt Swirl | `#2E4A9E` | Brush stroke accents |
| Gold Star | `#C9A84C` | Her star — glow, highlights |
| Warm Glow | `#F5E6A3` | Star shimmer, text accents |
| Violet Star | `#7B4FBF` | His star (Chapter II onwards) |
| Blush Accent | `#E8B4D8` | Soft highlights, romantic touches |
| Aurora Teal | `#3ABFBF` | Aurora wave color (Chapter IV) |
| Starlight White | `#FAFAFA` | Body text, narration |

**Fonts:**
- Headings → `Cormorant Garamond` (romantic serif, far more readable than Playfair Display)
- Body / Narration → `DM Sans` (clean, modern, legible at all sizes)

> **Why the font change:** Playfair Display is beautiful but strains the eyes at body sizes. Cormorant Garamond keeps the romantic elegance for headings while DM Sans ensures narration text is effortlessly readable.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React + Vite | Core framework + dev server |
| Framer Motion | Chapter transitions, entrance animations, AnimatePresence |
| GSAP | Auto-play animations — star movement, orbital paths, aurora waves |
| tsParticles | Background star field, shooting stars, stardust particles |
| Tailwind CSS | Responsive utility-first styling |
| Google Fonts | Cormorant Garamond + DM Sans |

**Deployment:** Vercel or Netlify (free tier, shareable link)

---

## Configuration — `data.js`

Everything lives in a single config file. You never touch component code — just fill in your content:

```js
// data.js — fill this in, everything else is automatic

export const config = {
  // Her name
  name: "Her Name",

  // Your relationship start date (for the live day counter)
  anniversaryDate: "2023-03-20",

  // The date you first met
  metDate: "2023-01-15",

  // Chapter narration text (edit these to your own words)
  story: {
    before: "Before there was an us, there was just you — and a universe that hadn't found its reason yet.",
    meeting: "Then on [date], everything changed.",
    solar: "From that collision, an entire world was born.",
    promise: "And we're only just beginning.",
  },

  // Anniversary years — each becomes a planet in Chapter III
  // years[] drives the planet solar system view
  years: [
    {
      year: "2024",
      label: "Year One",
      planetColor: "#3A8FE8",   // blue planet
      stars: [
        {
          id: 1,
          date: "March 20, 2024",
          image: "/photos/photo1.jpg",
          message: "Your personal message here...",
        },
        {
          id: 2,
          date: "June 14, 2024",
          image: "/photos/photo2.jpg",
          message: "Another memory...",
        },
        // add more stars inside this year...
      ],
    },
    {
      year: "2025",
      label: "Year Two",
      planetColor: "#E87B3A",   // warm orange planet
      stars: [
        {
          id: 3,
          date: "March 20, 2025",
          image: "/photos/photo3.jpg",
          message: "Two years of everything...",
        },
        // add more...
      ],
    },
    // add more years as they come...
  ],

  // Final love letter (Chapter IV)
  letter: `Write your final message to her here.
This will animate in line by line as aurora waves pass through.
Make it personal. Make her cry (the good kind).`,
};
```

---

## Story Chapters

### Intro — "Night Awakening"
**Component:** `Intro.jsx`

The canvas opens on a dark indigo sky. Stars don't drift in slowly — they **shoot and streak** rapidly across the screen, a rapid meteor shower that gradually settles. The site title and her name fade in softly. At the bottom, a slowly self-drawing constellation line traces itself across the screen, ending in a single pulsing dot. She clicks or taps the dot to begin.

> *"[Her Name]"*

**Animations:**
- Rapid shooting stars streak in multiple directions on load — fast, energetic, alive
- Stars settle into the background particle field after the initial burst
- Title and subtitle ("A Love Story / Our Forever Journey") fade in with Framer Motion
- A constellation line draws itself slowly at the bottom — like a beckoning path
- The line ends in a glowing pulsing dot — this is the enter button
- No traditional button — the dot IS the interaction

**Navigation trigger:** Click / tap the pulsing constellation dot → advances to Chapter I

---

### Chapter I — "A Universe Waiting"
**Component:** `ChapterOne.jsx`

The canvas is quiet after the Intro's energy. A single enormous star — sun-sized, blazing gold — dominates the center of the screen. It radiates slow, warm pulsing glow rings outward. A small handwritten-style label **"me"** suddenly pops in near the star with a soft bounce animation, like someone sticking a note on a painting. Typewriter narration fades in below.

> *"Before there was an us, there was just you — and a universe that hadn't found its reason yet."*

**Animations:**
- Single large star (much bigger than before — sun scale, not a dot) pulses with slow warm glow rings
- Glow rings expand outward and fade — like a heartbeat
- `"me"` label pops in with a soft bounce after ~1.5s — handwritten font style
- Typewriter narration text below the star
- Background particle field very sparse — emphasizes loneliness of a single star

**Key design note:** The star should feel lonely but beautiful — the whole screen built around just this one thing.

---

### Chapter II — "Two Stars Collide"
**Component:** `ChapterTwo.jsx`

A slow, cinematic, scientifically-grounded collision sequence. This is the emotional heart of the whole site — take it slow.

> *"Then on [date], everything changed."*

**The sequence — 5 phases:**

**Phase 1 — Continuity (0–2s):** The gold star from Chapter I remains on screen, still pulsing gently. The screen is quiet.

**Phase 2 — Arrival (2–6s):** A purple/violet star drifts in slowly from the opposite edge of the screen. It's a different color — intentional. Two different people, two different worlds. A small `"you"` label pops in near it, matching the `"me"` label from Chapter I.

**Phase 3 — Orbit (6–14s):** Both stars begin a slow gravitational orbit around each other — not rushing, spiraling gently inward. The orbit gets tighter over time. The date you met fades in during this phase.

**Phase 4 — Collision (14–17s):** The stars merge in a burst of golden-violet light. Not a simple flash — an explosion that lingers. Particle debris fans outward.

**Phase 5 — New Stars Born (17–25s):** The explosion cloud doesn't just fade. It collapses into multiple new smaller stars scattered across the canvas — scientifically accurate (binary star merger → nova → stellar nursery → new star cluster). These new stars are the seeds of Chapter III's solar system.

**Science note for Claude Code:** This mirrors a real stellar merger / kilonova event. Two stars of different types merge → massive energy release → ejecta forms a nebula cloud → gravity collapses the cloud into new stars. The gold + violet color mixing during the explosion is also accurate to the light spectrum of a kilonova.

**Animations:**
- Phase 1: Gold star pulses — same as Chapter I for continuity
- Phase 2: Violet star drifts in from edge with `"you"` label pop-in
- Phase 3: GSAP orbital path animation — slow elliptical orbit tightening over time
- Phase 4: Particle burst explosion with gold + violet color mixing
- Phase 5: Particle cloud collapses → new stars scatter and settle across the canvas

---

### Chapter III — "The Solar System of Us"
**Component:** `ChapterThree.jsx` + `PlanetModal.jsx`

This chapter merges the original Chapter III (memory stars) and Chapter IV (timeline) into one seamless cosmic experience. It has two layers: the **Galaxy View** and the **Planet View**.

> *"From that collision, an entire world was born."*

**Layer 1 — Galaxy View (default):**

The explosion from Chapter II settles into a living galaxy. A central star glows at the center. Planets orbit it — each planet represents an anniversary year (2024, 2025, etc.). The background is a slowly drifting field of stars and nebula — alive and moving, not static.

- Planets orbit the central star at different speeds and distances (like a real solar system)
- Each planet is labeled with its year and has its own color
- Hover over a planet: it slows, glows, and shows a year label tooltip
- Click a planet: triggers zoom-in transition

**Layer 2 — Planet View (on click):**

The camera zooms into the selected planet. The planet dissolves and the screen fills with a starfield specific to that year — each star is a memory. This is the current Chapter III experience, now nested inside the planet.

- Stars appear one-by-one as the starfield fills
- Hover: star pulses brighter
- Click: `PlanetModal` blooms open — polaroid-style photo card with message
- A back button (small constellation arrow) returns to the Galaxy View
- Shooting stars occasionally streak across the background

**Animations:**
- Galaxy background: tsParticles with slow drift — nebula colors, deep blues and purples
- Planets: GSAP circular orbit paths, each at unique speed/radius
- Planet hover: Framer Motion scale + glow
- Zoom transition: Framer Motion scale from planet position → full screen, then crossfade to starfield
- Memory stars: staggered fade-in on enter
- Modal: scale + blur reveal

**Data driven:** Entirely by the `years[]` array in `data.js`. Add a new year object and a new planet appears automatically.

---

### Chapter IV — "Still Counting"
**Component:** `ChapterFour.jsx`

The final chapter — but unlike the original quiet closing, this one is **alive**. Two things happen simultaneously: the universe celebrates around her, and the love letter writes itself at the center of it all.

> *"And we're only just beginning."*

**The scene:**

The gold star and violet star from Chapter II reappear — but now they dance. They orbit each other playfully, no longer colliding but in harmony. Smaller stars swirl around them. Behind everything, slow aurora-like color waves pulse across the canvas — deep blues rolling into purples rolling into gold — like the northern lights, but cosmic.

The love letter text reveals itself line by line. Each aurora wave that passes through "reveals" the next line of text — as if the universe itself is writing it for her.

Below the letter: the live day counter. It doesn't just appear — it counts up dramatically from 0 to the real number when the chapter loads, then continues ticking in real time.

**Animations:**
- **Dancing stars:** GSAP orbital animation — gold + violet stars orbit each other in a gentle figure-8 / lemniscate path
- **Swirling star field:** Smaller stars pulse and drift around the two main stars
- **Aurora waves:** Slow sinusoidal color waves sweep across the background — `#1B2A6B` → `#7B4FBF` → `#C9A84C` → `#3ABFBF` looping
- **Letter reveal:** Each line of the love letter fades in as an aurora wave passes over it — not typewriter, not handwriting — a soft luminous reveal
- **Day counter:** Counts up from 0 → real number on chapter mount (~1.5s animation), then live ticks in real time
- **Golden particles:** Drift upward slowly throughout — like embers from a fire

**Mood:** Joyful, alive, warm. Not quiet or melancholy — this is a celebration. The universe is dancing because she exists in it.

---

## Artist-Specific Touches

These details are designed specifically for a girlfriend who is a painter / visual artist:

- **Brush stroke cursor trail** — as she moves her mouse, a golden paint stroke follows for ~1 second then fades (`CursorTrail.jsx`)
- **Oil-paint shimmer** — stars use CSS filter effects to evoke oil on canvas texture
- **Painterly chapter transitions** — each chapter fades in like a new canvas layer being painted over the last
- **Van Gogh swirl background** — slow looping swirl animations in the background evoke brushwork in motion
- **Polaroid photo cards** — memory photos slightly rotated like polaroids pinned to a wall; hover lifts and straightens them
- **Constellation dot navigation** — the enter interaction on the Intro feels like drawing a star map, not clicking a button

---

## Navigation Model

The site is a **full-viewport storybook**. Each page fills the screen. The user advances via:
- `← →` arrow buttons fixed at bottom-center
- Left/right swipe on mobile (50px threshold)
- The pulsing constellation dot on the Intro page (entry only)

`App.jsx` holds `currentChapter` state (0 = Intro, 1–4 = chapters). Only the active chapter is rendered. `AnimatePresence mode="wait"` handles transitions. **No scroll between chapters.**

**Nav rules:**
- ← hidden on Intro and Chapter I
- → hidden on Chapter IV (last)
- Intro is a one-way gate — once past it, back navigation cannot return to Intro

---

## Recommended Build Order

| Step | Task |
|---|---|
| 1 | Project scaffold + `data.js` config + global styles (palette, fonts) |
| 2 | Intro — rapid shooting stars + constellation dot navigation |
| 3 | Chapter I — large sun-star + "me" label pop-in + typewriter |
| 4 | Chapter II — 5-phase collision sequence (orbit → explosion → new stars) |
| 5 | Chapter III — Galaxy View with orbiting planets |
| 6 | Chapter III — Planet View zoom + memory starfield + modal |
| 7 | Chapter IV — dancing stars + aurora waves + letter reveal + counter |
| 8 | Polish — cursor trail, mobile responsiveness, chapter transitions |

---

## File Structure

```
/anniversary-website
├── public/
│   └── photos/               ← drop your photos here
├── src/
│   ├── data.js               ← YOUR CONTENT GOES HERE — edit this only
│   ├── main.jsx              ← React entry point
│   ├── App.jsx               ← chapter state machine + nav + swipe
│   ├── index.css             ← global styles, CSS variables, fonts
│   └── components/
│       ├── Intro.jsx             Night Awakening — rapid stars, constellation dot
│       ├── ChapterOne.jsx        A Universe Waiting — huge lone star, "me" label
│       ├── ChapterTwo.jsx        Two Stars Collide — 5-phase cinematic collision
│       ├── ChapterThree.jsx      The Solar System of Us — galaxy + planet views
│       ├── ChapterFour.jsx       Still Counting — dancing stars, aurora, letter, counter
│       ├── PlanetModal.jsx       Memory starfield + photo modal (inside Ch.III)
│       ├── StarModal.jsx         Photo + message polaroid card
│       ├── CursorTrail.jsx       Golden brush stroke cursor effect
│       └── ParticleCanvas.jsx    Background star field (always mounted)
```

---

*Made with love · Built for her* 🌌