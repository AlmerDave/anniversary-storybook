import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// SHOOTING STARS — Looping diagonal meteors with real physical travel
// Each star travels from upper-left region → lower-right (classic meteor angle)
// Varied sizes create depth: thin+fast = distant, thick+slow = close
// ─────────────────────────────────────────────────────────────────────────────
const LOOP_STARS = [
  // { startX, startY, travelX, travelY, delay, dur, width, thickness, repeatDelay }
  // Primary diagonal stream — upper-left to lower-right
  { startX: -300, startY:  -20, travelX: 1600, travelY: 500,  delay: 0.0,  dur: 1.8, width: 320, thickness: 1.5, repeatDelay: 4.2 },
  { startX: -200, startY:  120, travelX: 1500, travelY: 460,  delay: 0.6,  dur: 2.1, width: 260, thickness: 1,   repeatDelay: 5.0 },
  { startX:  100, startY:  -40, travelX: 1400, travelY: 520,  delay: 1.4,  dur: 1.6, width: 380, thickness: 2,   repeatDelay: 3.8 },
  { startX: -100, startY:  250, travelX: 1600, travelY: 400,  delay: 2.2,  dur: 2.3, width: 200, thickness: 1,   repeatDelay: 5.5 },
  { startX:  300, startY:  -60, travelX: 1300, travelY: 550,  delay: 0.9,  dur: 1.5, width: 420, thickness: 2.5, repeatDelay: 4.0 },
  // Occasional reverse — upper-right to lower-left
  { startX: 1400, startY:   80, travelX: -1600, travelY: 480, delay: 3.0,  dur: 2.0, width: 300, thickness: 1.5, repeatDelay: 7.0 },
  { startX: 1300, startY:  200, travelX: -1500, travelY: 420, delay: 5.5,  dur: 1.9, width: 240, thickness: 1,   repeatDelay: 8.0 },
  // Steep diagonal — feels like deep space
  { startX: -150, startY:  -80, travelX: 1100, travelY: 850,  delay: 1.8,  dur: 2.5, width: 180, thickness: 1,   repeatDelay: 6.0 },
]

// ─────────────────────────────────────────────────────────────────────────────
// HERO STARS — Large pulsing background stars for depth + atmosphere
// ─────────────────────────────────────────────────────────────────────────────
const HERO_STARS = [
  { x: '12%',  y: '18%', size: 4, delay: 0.3,  pulseDur: 3.2, color: '#F5E6A3' },
  { x: '88%',  y: '12%', size: 6, delay: 0.8,  pulseDur: 4.0, color: '#C9A84C' },
  { x: '72%',  y: '68%', size: 3, delay: 0.5,  pulseDur: 2.8, color: '#E8B4D8' },
  { x: '25%',  y: '75%', size: 5, delay: 1.0,  pulseDur: 3.6, color: '#F5E6A3' },
  { x: '55%',  y:  '8%', size: 3, delay: 0.2,  pulseDur: 2.4, color: '#C9A84C' },
  { x: '92%',  y: '45%', size: 4, delay: 1.2,  pulseDur: 3.8, color: '#E8B4D8' },
  { x:  '8%',  y: '50%', size: 3, delay: 0.6,  pulseDur: 3.0, color: '#F5E6A3' },
]

// ─────────────────────────────────────────────────────────────────────────────
// TITLE WORDS — for staggered word-by-word entrance
// ─────────────────────────────────────────────────────────────────────────────
const TITLE_LINE1 = ['A', 'Story', 'Written']
const TITLE_LINE2 = ['in', 'the', 'Stars']

// ─────────────────────────────────────────────────────────────────────────────
// CONSTELLATION — path nodes for twinkle animation
// ─────────────────────────────────────────────────────────────────────────────
const CONSTELLATION_PATH = 'M 60,80 L 180,30 L 340,70 L 500,20 L 640,60 L 780,80'
const CONSTELLATION_NODES = [
  { cx: 180, cy: 30 },
  { cx: 340, cy: 70 },
  { cx: 500, cy: 20 },
  { cx: 640, cy: 60 },
]

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter hook — character by character reveal
// ─────────────────────────────────────────────────────────────────────────────
function useTypewriter(text, startDelay = 0, speed = 80) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let timeout
    const start = setTimeout(() => {
      let i = 0
      const tick = () => {
        i++
        setDisplayed(text.slice(0, i))
        if (i < text.length) {
          timeout = setTimeout(tick, speed)
        } else {
          setDone(true)
        }
      }
      tick()
    }, startDelay * 1000)
    return () => {
      clearTimeout(start)
      clearTimeout(timeout)
    }
  }, [text, startDelay, speed])

  return { displayed, done }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Intro({ name, onBegin }) {
  const [skipped, setSkipped]         = useState(false)
  const [showCTA, setShowCTA]         = useState(false)
  const [isBeginning, setIsBeginning] = useState(false)
  const sectionRef                    = useRef(null)

  // Typewriter for subtitle — starts at 3.2s
  // When skipped, bypass typewriter and show full text immediately
  const fullSubtitle = `For ${name}`
  const { displayed: typedRaw, done: typingRawDone } = useTypewriter(fullSubtitle, 3.2, 90)
  const displayedSubtitle = skipped ? fullSubtitle : typedRaw
  const subtitleDone      = skipped ? true         : typingRawDone

  // CTA dot appears after constellation finishes drawing (~5.8s) or on skip
  useEffect(() => {
    const t = setTimeout(() => setShowCTA(true), skipped ? 50 : 5800)
    return () => clearTimeout(t)
  }, [skipped])

  // Skip handler — any click/tap on the section during animation completes instantly
  const handleSkip = useCallback(() => {
    if (showCTA) return // already at final state — clicks fall through to onBegin
    setSkipped(true)
    setShowCTA(true)
  }, [showCTA])

  // Begin handler — triggers gold bloom then hands off to App
  const handleBegin = useCallback(() => {
    setIsBeginning(true)
    setTimeout(() => onBegin(), 1100)
  }, [onBegin])

  // Timing shortcuts when skipped
  const T = (normal, fast = 0) => (skipped ? fast : normal)

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      onClick={handleSkip}
      style={{ cursor: showCTA ? 'default' : 'pointer' }}
    >

      {/* ── Ambient breathing background ──────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(46,74,158,0.22) 0%, transparent 70%)',
        }}
        animate={{
          scale:   [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 30% 65%, rgba(123,79,191,0.1) 0%, transparent 60%)',
        }}
        animate={{
          scale:   [1.05, 1, 1.05],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* ── Hero pulsing background stars ─────────────────────────────────── */}
      {HERO_STARS.map((star, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: star.x, top: star.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: T(star.delay, 0), duration: 0.6 }}
        >
          {/* Outer glow halo */}
          <motion.div
            style={{
              position: 'absolute',
              width:  star.size * 6,
              height: star.size * 6,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${star.color}44 0%, transparent 70%)`,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: star.pulseDur, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Star core */}
          <motion.div
            style={{
              width:  star.size,
              height: star.size,
              borderRadius: '50%',
              background: star.color,
              boxShadow: `0 0 ${star.size * 2}px ${star.color}, 0 0 ${star.size * 5}px ${star.color}88`,
              position: 'relative',
            }}
            animate={{
              scale:   [1, 1.3, 1],
              opacity: [0.7, 1,   0.7],
            }}
            transition={{ duration: star.pulseDur, repeat: Infinity, ease: 'easeInOut', delay: star.delay * 0.5 }}
          />
        </motion.div>
      ))}

      {/* ── Looping shooting stars ────────────────────────────────────────── */}
      {LOOP_STARS.map((s, i) => {
        const angle = Math.atan2(s.travelY, s.travelX) * (180 / Math.PI)
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: s.startX,
              top:  s.startY,
              width: s.width,
              height: s.thickness,
              transformOrigin: 'left center',
              rotate: `${angle}deg`,
              // Rich gradient: transparent → warm glow head → gold mid → fading tail
              background: `linear-gradient(
                to right,
                transparent 0%,
                rgba(245,230,163,0.05) 15%,
                rgba(245,230,163,0.6) 60%,
                rgba(201,168,76,1) 80%,
                rgba(255,255,255,0.95) 90%,
                rgba(255,255,255,0.4) 95%,
                transparent 100%
              )`,
              borderRadius: s.thickness,
              filter: `drop-shadow(0 0 ${s.thickness + 1}px #F5E6A3) drop-shadow(0 0 ${s.thickness * 3}px #C9A84C88)`,
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x:       [0, s.travelX],
              y:       [0, s.travelY],
              opacity: [0, 0, 0.9, 0.85, 0],
            }}
            transition={{
              delay:       T(s.delay, 0),
              duration:    s.dur,
              ease:        'easeIn',
              times:       [0, 0.05, 0.2, 0.7, 1],
              repeat:      Infinity,
              repeatDelay: skipped ? s.repeatDelay * 0.5 : s.repeatDelay,
            }}
          />
        )
      })}

      {/* ── Title + subtitle + centered CTA ──────────────────────────────── */}
      <div className="relative z-10 text-center px-6">
        <h1
          className="font-heading leading-tight"
          style={{
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            color: '#C9A84C',
          }}
        >
          {/* Line 1 */}
          <span className="block">
            {TITLE_LINE1.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.25em]"
                initial={{ opacity: 0, y: 20 + i * 4, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay:    T(1.4 + i * 0.18, 0 + i * 0.06),
                  duration: 0.9,
                  ease:     [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  textShadow: '0 0 30px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2)',
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>

          {/* Line 2 */}
          <span className="block">
            {TITLE_LINE2.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.25em]"
                initial={{ opacity: 0, y: 24 + i * 4, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay:    T(1.94 + i * 0.18, 0.18 + i * 0.06),
                  duration: 0.9,
                  ease:     [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  textShadow: '0 0 30px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2)',
                  // "Stars" gets extra glow bloom
                  ...(word === 'Stars' ? {
                    textShadow: '0 0 20px rgba(201,168,76,0.9), 0 0 50px rgba(201,168,76,0.5), 0 0 100px rgba(245,230,163,0.3)',
                  } : {}),
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* ── Subtitle — typewriter with Dancing Script ─────────────────── */}
        <div
          className="mt-5 relative z-10"
          style={{ minHeight: '2rem' }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: displayedSubtitle.length > 0 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              color: '#F5E6A3',
              opacity: 0.9,
              letterSpacing: '0.02em',
              textShadow: '0 0 20px rgba(245,230,163,0.4)',
            }}
          >
            {displayedSubtitle}
            {!subtitleDone && (
              <span
                style={{
                  display: 'inline-block',
                  width: 1,
                  height: '1em',
                  background: '#F5E6A3',
                  marginLeft: 3,
                  verticalAlign: 'middle',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
          </motion.p>
        </div>

        {/* ── Centered CTA — appears after constellation draws ─────────── */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              className="mt-10 flex flex-col items-center"
              style={{ gap: '0.6rem' }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleBegin() }}
                aria-label="Begin the story"
                className="relative focus:outline-none"
                style={{ width: 28, height: 28 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
              >
                {/* Core orb — static, no pulse */}
                <div
                  style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #FFF8E1, #C9A84C)',
                    boxShadow: '0 0 12px #C9A84C, 0 0 30px rgba(201,168,76,0.6), 0 0 60px rgba(201,168,76,0.3)',
                  }}
                />
              </motion.button>

              {/* CTA label */}
              <motion.span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: '#D4AAFF',
                  letterSpacing: '0.12em',
                  textShadow: '0 0 12px rgba(123,79,191,0.5)',
                  pointerEvents: 'none',
                  opacity: 0.85,
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.85, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                follow the stars
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Constellation — decorative only ──────────────────────────────── */}
      <motion.div
        className="absolute bottom-10 left-0 right-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T(3.6, 0.1), duration: 0.6 }}
      >
        <svg
          viewBox="0 60 840 100"
          preserveAspectRatio="xMidYMid meet"
          className="w-full overflow-visible"
          style={{ height: 80 }}
        >
          <defs>
            {/* Gradient for path color shift: gold → blush */}
            <linearGradient id="constGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.3" />
              <stop offset="60%"  stopColor="#C9A84C" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E8B4D8" stopOpacity="0.7" />
            </linearGradient>
            {/* Glow filter for nodes */}
            <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Self-drawing constellation path — gold → blush gradient */}
          <motion.path
            d={CONSTELLATION_PATH}
            stroke="url(#constGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: T(3.8, 0.1), duration: 2.0, ease: 'easeInOut' }}
          />

          {/* Constellation nodes with twinkle */}
          {CONSTELLATION_NODES.map(({ cx, cy }, i) => (
            <g key={i} filter="url(#nodeGlow)">
              {/* Halo */}
              <motion.circle
                cx={cx} cy={cy} r="6"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="0.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale:   [0, 1.4, 1],
                  opacity: [0, 0.5, 0.3],
                }}
                transition={{ delay: T(4.0 + i * 0.35, 0.2 + i * 0.1), duration: 0.5 }}
              />
              {/* Core dot */}
              <motion.circle
                cx={cx} cy={cy} r="2.5"
                fill="#C9A84C"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale:   [0, 1.5, 0.9, 1.1, 1],
                  opacity: [0, 1,   0.7, 0.9, 0.7],
                }}
                transition={{ delay: T(4.0 + i * 0.35, 0.2 + i * 0.1), duration: 0.6 }}
              />
              {/* Continuous twinkle */}
              <motion.circle
                cx={cx} cy={cy} r="2.5"
                fill="#F5E6A3"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{
                  delay:       T(4.6 + i * 0.35, 0.6 + i * 0.1),
                  duration:    2,
                  repeat:      Infinity,
                  repeatDelay: 1.5 + i * 0.7,
                  ease:        'easeInOut',
                }}
              />
            </g>
          ))}

          {/* Start node */}
          <motion.circle
            cx="60" cy="80" r="2"
            fill="#C9A84C"
            opacity="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: T(3.8, 0.1), duration: 0.3 }}
          />

          {/* End node — decorative, mirrors the start */}
          <motion.circle
            cx="780" cy="80" r="2"
            fill="#E8B4D8"
            opacity="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: T(5.8, 0.2), duration: 0.3 }}
          />
        </svg>
      </motion.div>

      {/* ── Subtle skip hint — visible only during animation ──────────────── */}
      <AnimatePresence>
        {!showCTA && (
          <motion.p
            className="absolute bottom-4 left-1/2 pointer-events-none"
            style={{
              transform: 'translateX(-50%)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.65rem',
              color: 'rgba(245,230,163,0.3)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.0, duration: 1 }}
          >
            tap to skip
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Gold bloom transition — fires when begin is clicked ───────────── */}
      <AnimatePresence>
        {isBeginning && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
            animate={{ opacity: [1, 1, 1, 0] }}
            transition={{ duration: 1.4, times: [0, 0.5, 0.75, 1], ease: 'easeInOut' }}
          >
            <motion.div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,248,225,0.98) 0%, rgba(245,230,163,0.8) 30%, rgba(201,168,76,0.5) 55%, transparent 75%)',
              }}
              animate={{ scale: 30 }}
              transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
}
