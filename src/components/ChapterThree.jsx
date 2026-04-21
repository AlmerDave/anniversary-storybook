import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlanetModal from './PlanetModal'
import MilkyWayBackground from './MilkyWayBackground'

// ── Constants ─────────────────────────────────────────────────────────────────
const KEPLER_E      = 0.30
const TRAIL_LEN     = 90
const BIRTH_INIT_MS = 2000   // 2s of darkness before first star ignites
const BIRTH_STAGGER = 1800   // ~2s between each star's appearance
const BIRTH_POP_MS  = 600    // duration of the scale-pop birth animation
const BIRTH_RING_MS = 1200   // duration of the nova ring expansion
const SESSION_KEY   = 'ch3-planets-born'

// ── Shooting stars — galaxy view only ────────────────────────────────────────
const CH3_LOOP_STARS = [
  { startX: -250, startY:  60, travelX:  1900, travelY: 420, delay:  3.0, dur: 1.7, width: 300, thickness: 1.2, repeatDelay: 11 },
  { startX:  200, startY: -20, travelX:  1700, travelY: 580, delay:  8.0, dur: 2.0, width: 240, thickness: 1.0, repeatDelay: 14 },
  { startX: -150, startY: 280, travelX:  1800, travelY: 360, delay: 13.0, dur: 1.8, width: 260, thickness: 1.4, repeatDelay: 16 },
  { startX: 1600, startY: 120, travelX: -1700, travelY: 460, delay:  5.5, dur: 1.9, width: 220, thickness: 1.0, repeatDelay: 13 },
]

// ── Planet orbit layout ───────────────────────────────────────────────────────
function getPlanetOrbit(index) {
  const radii   = [80, 85, 175, 220, 260]
  const speeds  = [0.5, 0.6, 0.25, 0.18, 0.14]
  const offsets = [0, Math.PI * 0.7, Math.PI * 1.3, Math.PI * 0.3, Math.PI * 1.7]
  const centers = [
    { x: -85, y: -50 },
    { x:  65, y:  85 },
    { x:  90, y: -55 },
    { x: -50, y:  60 },
    { x:   0, y:   0 },
  ]
  return {
    radius: radii[index % radii.length],
    speed:  speeds[index % speeds.length],
    offset: offsets[index % offsets.length],
    center: centers[index % centers.length],
  }
}

// ── Keplerian position at angle M ────────────────────────────────────────────
function keplerPos(M, radius) {
  const theta = M + 2 * KEPLER_E * Math.sin(M) + 1.25 * KEPLER_E * KEPLER_E * Math.sin(2 * M)
  return {
    x: Math.cos(theta) * radius,
    y: Math.sin(theta) * radius * 0.5,
  }
}

// ── RAF hook: positions + trails + per-planet angle accumulators ──────────────
// Stars appear sequentially via timeouts; RAF only handles orbit math.
// hoveredIndexRef lets the loop read hover state without re-subscribing.
function usePlanetPositions(years, hoveredIndexRef) {
  const alreadyBorn = !!sessionStorage.getItem(SESSION_KEY)

  const [positions, setPositions] = useState(() =>
    years.map((_, i) => {
      const { radius, offset, center } = getPlanetOrbit(i)
      const p = keplerPos(offset, radius)
      return { x: center.x + p.x, y: center.y + p.y }
    })
  )
  const [visible,    setVisible]    = useState(() => new Array(years.length).fill(alreadyBorn))
  const [ringBirths, setRingBirths] = useState(() => new Array(years.length).fill(false))

  const rafRef      = useRef(null)
  const trailsRef   = useRef(years.map(() => []))
  const visibleRef  = useRef(new Array(years.length).fill(alreadyBorn))
  const anglesRef   = useRef(years.map((_, i) => getPlanetOrbit(i).offset))
  const lastTimeRef = useRef(Date.now() / 1000)

  // Schedule sequential star appearances (skipped if already born this session)
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    const timers = years.map((_, i) =>
      setTimeout(() => {
        visibleRef.current[i] = true
        setVisible(prev => { const n = [...prev]; n[i] = true; return n })
        setRingBirths(prev => { const n = [...prev]; n[i] = true; return n })
        setTimeout(() => {
          setRingBirths(prev => { const n = [...prev]; n[i] = false; return n })
        }, BIRTH_RING_MS + 200)
      }, BIRTH_INIT_MS + i * BIRTH_STAGGER)
    )

    const doneTimer = setTimeout(
      () => sessionStorage.setItem(SESSION_KEY, '1'),
      BIRTH_INIT_MS + (years.length - 1) * BIRTH_STAGGER + BIRTH_POP_MS + 400
    )

    return () => { timers.forEach(clearTimeout); clearTimeout(doneTimer) }
  }, [years])

  // RAF orbit loop — per-planet angle accumulators support smooth hover speed-up
  useEffect(() => {
    const tick = () => {
      const now = Date.now() / 1000
      const dt  = Math.min(now - lastTimeRef.current, 0.05) // clamp for hidden tab
      lastTimeRef.current = now

      years.forEach((_, i) => {
        const { speed } = getPlanetOrbit(i)
        const mult = hoveredIndexRef.current === i ? 1.8 : 1
        anglesRef.current[i] += speed * mult * dt
      })

      const newPositions = years.map((_, i) => {
        const { radius, center } = getPlanetOrbit(i)
        const local = keplerPos(anglesRef.current[i], radius)
        const pos = { x: center.x + local.x, y: center.y + local.y }

        if (visibleRef.current[i]) {
          trailsRef.current[i].push(pos)
          if (trailsRef.current[i].length > TRAIL_LEN) trailsRef.current[i].shift()
        } else {
          trailsRef.current[i] = []
        }

        return pos
      })

      setPositions(newPositions)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [years])

  return { positions, visible, ringBirths, trailsRef }
}

// ── Orbit ring with nebula haze ───────────────────────────────────────────────
function OrbitRing({ index, isHovered, planetColor }) {
  const { radius, center } = getPlanetOrbit(index)
  return (
    <>
      {/* Soft blurred aura along the orbit path — nebula haze */}
      <ellipse
        cx={center.x} cy={center.y}
        rx={radius} ry={radius * 0.5}
        fill="none"
        stroke={planetColor}
        strokeWidth={isHovered ? 9 : 6}
        opacity={isHovered ? 0.15 : 0.07}
        filter="url(#nebula-blur)"
        style={{ transition: 'opacity 0.4s, stroke-width 0.4s' }}
      />
      {/* Dashed orbit ring */}
      <ellipse
        cx={center.x} cy={center.y}
        rx={radius} ry={radius * 0.5}
        fill="none"
        stroke={isHovered ? planetColor : 'rgba(201,168,76,0.12)'}
        strokeWidth={isHovered ? 1.5 : 1}
        strokeDasharray="4 6"
        filter={isHovered ? 'url(#ring-glow)' : undefined}
        style={{ transition: 'stroke 0.35s, stroke-width 0.35s' }}
      />
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChapterThree({ years, story }) {
  const [view, setView]           = useState('galaxy')
  const [activePlanet, setActive] = useState(null)
  const [hoveredIndex, setHover]  = useState(null)
  const [zoomState, setZoomState] = useState(null)
  const pendingYearRef            = useRef(null)
  const hoveredIndexRef           = useRef(null)
  // Checked once at mount — determines whether to play the birth pop animation
  const wasAlreadyBornRef         = useRef(!!sessionStorage.getItem(SESSION_KEY))

  const { positions, visible, ringBirths, trailsRef } = usePlanetPositions(years, hoveredIndexRef)

  const handleHover = (i) => { setHover(i); hoveredIndexRef.current = i }
  const handleHoverEnd = () => { setHover(null); hoveredIndexRef.current = null }

  const handlePlanetClick = (year, pos, e) => {
    e.stopPropagation()
    pendingYearRef.current = year
    const originX = ((240 + pos.x) / 480 * 100).toFixed(2) + '%'
    const originY = ((240 + pos.y) / 480 * 100).toFixed(2) + '%'
    setZoomState({ originX, originY })
  }

  const handleZoomComplete = () => {
    setZoomState(null)
    setActive(pendingYearRef.current)
    setView('planet')
    pendingYearRef.current = null
  }

  const backToGalaxy = () => {
    setView('galaxy')
    setTimeout(() => setActive(null), 500)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      <MilkyWayBackground opacity={0.45} animateIn={false} />

      {/* Shooting stars — unmounted in planet view to avoid bleed-through */}
      {view === 'galaxy' && CH3_LOOP_STARS.map((s, i) => {
        const angle = Math.atan2(s.travelY, s.travelX) * (180 / Math.PI)
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left:            s.startX,
              top:             s.startY,
              width:           s.width,
              height:          s.thickness,
              transformOrigin: 'left center',
              rotate:          `${angle}deg`,
              background: `linear-gradient(
                to right,
                transparent 0%,
                rgba(245,230,163,0.04) 15%,
                rgba(245,230,163,0.5) 60%,
                rgba(201,168,76,0.9) 80%,
                rgba(255,255,255,0.9) 90%,
                rgba(255,255,255,0.3) 95%,
                transparent 100%
              )`,
              borderRadius: s.thickness,
              filter:       `drop-shadow(0 0 ${s.thickness + 1}px #F5E6A3) drop-shadow(0 0 ${s.thickness * 3}px #C9A84C88)`,
              zIndex:       5,
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x:       [0, s.travelX],
              y:       [0, s.travelY],
              opacity: [0, 0, 0.85, 0.8, 0],
            }}
            transition={{
              delay:       s.delay,
              duration:    s.dur,
              ease:        'easeOut',
              times:       [0, 0.05, 0.2, 0.7, 1],
              repeat:      Infinity,
              repeatDelay: s.repeatDelay,
            }}
          />
        )
      })}

      <AnimatePresence mode="wait">

        {/* ── Galaxy View ─────────────────────────────────────────────────── */}
        {view === 'galaxy' && (
          <motion.div
            key="galaxy"
            className="relative flex flex-col items-center justify-center w-full"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-8 px-6 space-y-2"
              initial={{ opacity: 0, y: 16 }}
              animate={zoomState ? { opacity: 0, y: 0 } : { opacity: 1, y: 0 }}
              transition={zoomState ? { duration: 0.2 } : { duration: 1, delay: 0.2 }}
            >
              <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-star/50">
                Chapter III — The Solar System of Us
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl text-starlight-white">
                Our World
              </h2>
              <p className="font-body italic text-starlight-white/50 text-base max-w-sm mx-auto">
                {story.solar}
              </p>
              <p className="font-body text-xs text-gold-star/40 pt-1">
                Click a star to explore a year
              </p>
            </motion.div>

            {/* Solar system canvas */}
            <motion.div
              className="relative flex items-center justify-center"
              style={{
                width:           480,
                height:          480,
                maxWidth:        '92vw',
                maxHeight:       '55vw',
                transformOrigin: zoomState
                  ? `${zoomState.originX} ${zoomState.originY}`
                  : '50% 50%',
              }}
              animate={zoomState ? { scale: 4.5, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={zoomState ? {
                scale:   { duration: 1.1, ease: [0.25, 0.1, 0.05, 1] },
                opacity: { duration: 0.7, delay: 0.45, ease: 'easeIn' },
              } : { duration: 0 }}
              onAnimationComplete={() => { if (zoomState) handleZoomComplete() }}
            >
              {/* SVG layer: orbit rings + nebula haze + trails + nova rings */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                viewBox="-240 -240 480 480"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter id="nebula-blur" x="-60%" y="-150%" width="220%" height="400%">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>

                  {/* Per-planet trail gradients */}
                  {years.map((year, i) => {
                    const trail = trailsRef.current[i]
                    if (trail.length < 2) return null
                    const head = trail[trail.length - 1]
                    const tail = trail[0]
                    return (
                      <linearGradient
                        key={`tg-${i}`}
                        id={`trail-grad-${i}`}
                        gradientUnits="userSpaceOnUse"
                        x1={tail.x} y1={tail.y}
                        x2={head.x} y2={head.y}
                      >
                        <stop offset="0%"   stopColor={year.planetColor} stopOpacity="0" />
                        <stop offset="60%"  stopColor={year.planetColor} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={year.planetColor} stopOpacity="0.55" />
                      </linearGradient>
                    )
                  })}
                </defs>


                {/* Orbital ghost trails */}
                {years.map((_, i) => {
                  const trail = trailsRef.current[i]
                  if (trail.length < 4) return null
                  const pts = trail.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
                  return (
                    <polyline
                      key={`trail-${i}`}
                      points={pts}
                      stroke={`url(#trail-grad-${i})`}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )
                })}

                {/* Nova birth rings — one-shot ring ripple when each star ignites */}
                {years.map((year, i) => (
                  <AnimatePresence key={i}>
                    {ringBirths[i] && (
                      <motion.circle
                        key={`nova-${i}`}
                        cx={positions[i].x}
                        cy={positions[i].y}
                        r={14}
                        fill="none"
                        stroke={year.planetColor}
                        strokeWidth={2}
                        initial={{ r: 14, opacity: 0.9, strokeWidth: 2.5 }}
                        animate={{ r: 62, opacity: 0, strokeWidth: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: BIRTH_RING_MS / 1000, ease: 'easeOut' }}
                      />
                    )}
                  </AnimatePresence>
                ))}
              </svg>

              {/* Stars — glowing suns with radial gradient core + corona haze */}
              {years.map((year, i) => {
                const pos       = positions[i]
                const isHovered = hoveredIndex === i
                const pulseDur  = getPlanetOrbit(i).speed < 0.3 ? 3.8 : 2.4
                // Outer corona div — a blurred aura slightly larger than the star
                const coronaSize = isHovered ? 54 : 44

                return (
                  // Positioning wrapper — keeps Framer Motion's transform clean for birth scale
                  <div
                    key={year.year}
                    className="absolute z-20"
                    style={{
                      left:      '50%',
                      top:       '50%',
                      transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                    }}
                  >
                    <motion.button
                      className="relative rounded-full focus:outline-none"
                      style={{
                        width:      isHovered ? 32 : 24,
                        height:     isHovered ? 32 : 24,
                        // Radial gradient gives a bright stellar core with colored corona
                        background: `radial-gradient(circle at 38% 35%, #ffffff 0%, #ffffffcc 15%, ${year.planetColor} 50%, ${year.planetColor}55 78%, transparent 100%)`,
                        transition: 'width 0.2s, height 0.2s',
                      }}
                      initial={{
                        scale:   wasAlreadyBornRef.current ? 1 : 0,
                        opacity: wasAlreadyBornRef.current ? 1 : 0,
                      }}
                      animate={visible[i]
                        ? {
                            scale:     wasAlreadyBornRef.current ? 1 : [0, 1.7, 1],
                            opacity:   1,
                            boxShadow: isHovered
                              ? [`0 0 30px 12px ${year.planetColor}bb`, `0 0 48px 20px ${year.planetColor}ee`, `0 0 30px 12px ${year.planetColor}bb`]
                              : [`0 0 12px 4px ${year.planetColor}66`, `0 0 26px 10px ${year.planetColor}99`, `0 0 12px 4px ${year.planetColor}66`],
                          }
                        : { scale: 0, opacity: 0 }
                      }
                      transition={{
                        scale:     { duration: BIRTH_POP_MS / 1000, ease: 'easeOut' },
                        opacity:   { duration: 0.35 },
                        boxShadow: { duration: pulseDur, repeat: Infinity, ease: 'easeInOut' },
                      }}
                      onMouseEnter={() => handleHover(i)}
                      onMouseLeave={handleHoverEnd}
                      onClick={(e) => handlePlanetClick(year, pos, e)}
                      aria-label={`Explore ${year.label}`}
                    >
                      {/* Diffuse outer corona — blurred radial haze */}
                      <span
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width:      coronaSize,
                          height:     coronaSize,
                          top:        '50%',
                          left:       '50%',
                          transform:  'translate(-50%, -50%)',
                          background: `radial-gradient(circle, ${year.planetColor}28 0%, transparent 70%)`,
                          filter:     'blur(6px)',
                          transition: 'width 0.2s, height 0.2s',
                        }}
                      />

                      {/* Label — always visible, floats above planet */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{ bottom: 'calc(100% + 12px)', whiteSpace: 'nowrap' }}
                      >
                        <span
                          className="font-body text-xs px-2 py-1 rounded"
                          style={{
                            color:      year.planetColor,
                            border:     `1px solid ${year.planetColor}55`,
                            background: 'rgba(13,13,43,0.88)',
                            boxShadow:  `0 0 10px 1px ${year.planetColor}33`,
                          }}
                        >
                          {year.label}
                        </span>
                      </div>
                    </motion.button>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ── Planet View ─────────────────────────────────────────────────── */}
        {view === 'planet' && activePlanet && (
          <motion.div
            key="planet"
            className="relative w-full min-h-screen flex flex-col items-center justify-center px-4"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <motion.button
              onClick={backToGalaxy}
              className="absolute top-8 left-8 flex items-center gap-2 text-gold-star/60 hover:text-gold-star transition-colors font-body text-sm"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ x: -3 }}
            >
              ← {activePlanet.label}
            </motion.button>

            <motion.div
              className="text-center mb-10 space-y-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {/* Planet icon in detail view also gets glowing sun treatment */}
              <motion.div
                className="mx-auto w-10 h-10 rounded-full mb-3"
                style={{
                  background: `radial-gradient(circle at 38% 35%, #ffffff 0%, #ffffffcc 15%, ${activePlanet.planetColor} 55%, transparent 100%)`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 20px 6px ${activePlanet.planetColor}66`,
                    `0 0 42px 18px ${activePlanet.planetColor}aa`,
                    `0 0 20px 6px ${activePlanet.planetColor}66`,
                  ],
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <h3 className="font-heading text-3xl sm:text-4xl text-starlight-white">
                {activePlanet.label}
              </h3>
              <p className="font-body text-xs text-gold-star/40 tracking-wide">
                Click a star to open a memory
              </p>
            </motion.div>

            <PlanetModal stars={activePlanet.stars} />
          </motion.div>
        )}

      </AnimatePresence>
    </section>
  )
}
