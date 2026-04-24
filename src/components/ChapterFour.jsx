import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '../context/AudioContext'

// ─────────────────────────────────────────────────────────────────────────────
// Chapter IV — Still Counting
//
// - Aurora color waves sweep across background
// - Gold + violet stars orbit each other in a figure-8 lemniscate
// - Letter lines reveal staggered
// - Day counter counts up from 0 to real number on mount
// - Golden/violet particles drift upward
// ─────────────────────────────────────────────────────────────────────────────

function getDaysSince(isoDate) {
  const start = new Date(isoDate)
  const now   = new Date()
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
}

// Drifting particles — deterministic
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left:     `${(i * 37 + 8) % 86 + 7}%`,
  delay:    i * 0.6,
  duration: 3.5 + (i % 4) * 0.9,
  color:    i % 3 === 0 ? '#7B4FBF' : '#C9A84C',
  sizeClass: i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-2 h-2',
}))

// ── Lemniscate (figure-8) parametric orbit ────────────────────────────────────
// Bernoulli lemniscate: x = a·cos(t)/(1+sin²t), y = a·sin(t)·cos(t)/(1+sin²t)
function lemniscate(t, a) {
  const denom = 1 + Math.sin(t) * Math.sin(t)
  return {
    x: (a * Math.cos(t)) / denom,
    y: (a * Math.sin(t) * Math.cos(t)) / denom,
  }
}

function useDancingStars(a = 70) {
  const [posA, setPosA] = useState({ x: a, y: 0 })
  const [posB, setPosB] = useState({ x: -a, y: 0 })
  const [heartVisible, setHeartVisible] = useState(false)
  const rafRef      = useRef(null)
  const mountMs     = useRef(Date.now())
  const heartCooldown = useRef(false)

  useEffect(() => {
    const tick = () => {
      const t = ((Date.now() - mountMs.current) / 1000) * 0.55
      const pA = lemniscate(t, a)
      setPosA(pA)
      setPosB(lemniscate(t + Math.PI, a))

      // Stars cross through origin twice per cycle — pop a heart
      if (Math.abs(pA.x) < 8 && !heartCooldown.current) {
        heartCooldown.current = true
        setHeartVisible(true)
        setTimeout(() => {
          setHeartVisible(false)
          heartCooldown.current = false
        }, 1200)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [a])

  return { posA, posB, heartVisible }
}

// ── Count-up animation ────────────────────────────────────────────────────────
function useCountUp(target, durationMs = 1500) {
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || target === 0) return
    startedRef.current = true
    const startMs = Date.now()

    const iv = setInterval(() => {
      const progress = Math.min((Date.now() - startMs) / durationMs, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)  // ease-out-cubic
      setCount(Math.round(eased * target))
      if (progress >= 1) clearInterval(iv)
    }, 1000 / 60)

    return () => clearInterval(iv)
  }, [target, durationMs])

  return count
}

// ── Aurora wave ───────────────────────────────────────────────────────────────
// A sinusoidal filled shape that sweeps across the screen periodically
const AURORA_COLORS = ['#1B2A6B', '#7B4FBF', '#C9A84C', '#3ABFBF']

function AuroraWave({ delay, colorIndex, yPercent }) {
  const color = AURORA_COLORS[colorIndex % AURORA_COLORS.length]
  return (
    <motion.div
      className="absolute left-0 right-0 pointer-events-none overflow-hidden"
      style={{ top: `${yPercent}%`, height: '25%', opacity: 0 }}
      animate={{ opacity: [0, 0.16, 0.16, 0] }}
      transition={{
        delay,
        duration: 5.5,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'easeInOut',
        times: [0, 0.18, 0.72, 1],
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${color} 30%, ${color} 70%, transparent 100%)`,
          clipPath: 'polygon(0% 50%, 10% 20%, 25% 70%, 40% 10%, 55% 60%, 70% 15%, 85% 65%, 100% 30%, 100% 100%, 0% 100%)',
        }}
        animate={{ x: ['-10%', '10%'] }}
        transition={{
          delay,
          duration: 5.5,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}

// ── Letter highlight definitions ──────────────────────────────────────────────
const HIGHLIGHTS = [
  { match: 'choosing me', color: '#C9A84C', glow: true },
  { match: 'forever',     color: '#F5E6A3', glow: true },
  { match: 'star',        color: '#C9A84C', glow: true },
  { match: 'You',         color: '#7B4FBF', glow: true },
  { match: 'you',         color: '#7B4FBF', glow: true },
  { match: 'sky',         color: '#3ABFBF', glow: true },
  { match: 'love',        color: '#FF3355', glow: true },
]

function parseHighlights(line) {
  const matches = []
  for (const h of HIGHLIGHTS) {
    let idx = 0
    while (true) {
      const pos = line.indexOf(h.match, idx)
      if (pos === -1) break
      matches.push({ start: pos, end: pos + h.match.length, ...h })
      idx = pos + h.match.length
    }
  }
  matches.sort((a, b) => a.start - b.start)
  const segs = []
  let cursor = 0
  for (const m of matches) {
    if (m.start < cursor) continue
    if (m.start > cursor) segs.push({ text: line.slice(cursor, m.start) })
    segs.push({ text: m.match, color: m.color, glow: m.glow })
    cursor = m.end
  }
  if (cursor < line.length) segs.push({ text: line.slice(cursor) })
  return segs
}

function LetterLine({ line, isFirst }) {
  const segs = parseHighlights(line)
  return (
    <>
      {segs.map((seg, i) => {
        if (seg.color) {
          return (
            <span key={i} style={{
              color: seg.color,
              textShadow: `0 0 10px ${seg.color}CC, 0 0 24px ${seg.color}55`,
            }}>
              {seg.text}
            </span>
          )
        }
        if (isFirst && i === 0) {
          return (
            <span key={i}>
              <span style={{
                fontSize: '3.2rem',
                lineHeight: 1,
                color: '#C9A84C',
                textShadow: '0 0 18px rgba(201,168,76,0.7), 0 0 36px rgba(201,168,76,0.3)',
                fontWeight: 700,
                marginRight: '0.04em',
                verticalAlign: 'baseline',
              }}>
                {seg.text[0]}
              </span>
              {seg.text.slice(1)}
            </span>
          )
        }
        return <span key={i}>{seg.text}</span>
      })}
    </>
  )
}

export default function ChapterFour({ anniversaryDate, letter, story, name }) {
  const target = getDaysSince(anniversaryDate)
  const count  = useCountUp(target)
  const { posA, posB, heartVisible } = useDancingStars(70)
  const [done, setDone]   = useState(false)
  const { playSound }     = useAudio()
  const letterPlayedRef   = useRef(new Set())

  useEffect(() => {
    if (count === target && target > 0) setDone(true)
  }, [count, target])

  useEffect(() => {
    if (done) playSound('counter')
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  const lines = letter.split('\n').filter((l) => l.trim())

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto py-8 md:py-12 lg:py-16">

      {/* Aurora background waves */}
      <AuroraWave delay={0}   colorIndex={0} yPercent={8}  />
      <AuroraWave delay={2.2} colorIndex={1} yPercent={30} />
      <AuroraWave delay={4.4} colorIndex={2} yPercent={52} />
      <AuroraWave delay={6.6} colorIndex={3} yPercent={70} />
      <AuroraWave delay={8.8} colorIndex={0} yPercent={18} />
      <AuroraWave delay={11}  colorIndex={1} yPercent={82} />

      {/* Drifting particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute bottom-0 ${p.sizeClass} rounded-full pointer-events-none`}
          style={{ left: p.left, backgroundColor: p.color, opacity: 0 }}
          animate={{ y: [0, -480], opacity: [0, 0.7, 0.5, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: p.delay + 1.5,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Chapter label */}
      <motion.p
        className="font-body text-xs uppercase tracking-[0.35em] text-warm-glow mb-4 md:mb-6 lg:mb-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Chapter IV — Still Counting
      </motion.p>

      {/* Dancing stars — lemniscate figure-8 orbit */}
      <div
        className="relative flex items-center justify-center mb-6 md:mb-8 lg:mb-10 z-10"
        style={{ width: 200, height: 110 }}
      >
        {/* Gold star */}
        <div
          className="absolute w-10 h-10 rounded-full"
          style={{
            background: 'radial-gradient(circle at 38% 38%, #FAFAFA 0%, #F5E6A3 40%, #C9A84C 100%)',
            boxShadow: '0 0 20px 6px rgba(201,168,76,0.5)',
            transform: `translate(calc(-50% + ${posA.x}px), calc(-50% + ${posA.y}px))`,
          }}
        />
        {/* Violet star */}
        <div
          className="absolute w-9 h-9 rounded-full"
          style={{
            background: 'radial-gradient(circle at 38% 38%, #C4A8FF 0%, #9B6FDF 40%, #7B4FBF 100%)',
            boxShadow: '0 0 18px 5px rgba(123,79,191,0.5)',
            transform: `translate(calc(-50% + ${posB.x}px), calc(-50% + ${posB.y}px))`,
          }}
        />
        {/* Heart — appears when stars cross at center */}
        <AnimatePresence>
          {heartVisible && (
            <motion.span
              className="absolute select-none pointer-events-none z-20 text-2xl"
              style={{
                left: '50%', top: '50%', marginLeft: '-0.6rem', marginTop: '-0.6rem',
                color: '#FF3355',
                textShadow: '0 0 12px #FF335588',
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale:   [0.4, 1.3, 1.1, 0.9],
                y:       [0, -18, -30, -52],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut', times: [0, 0.15, 0.55, 1] }}
            >
              ♥
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Day counter */}
      <div className="text-center mb-6 md:mb-8 lg:mb-12 space-y-2 relative z-10">
        <motion.p
          className="font-body text-sm uppercase tracking-[0.4em] text-gold-star/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Days together
        </motion.p>
        <motion.p
          className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-warm-glow"
          style={{ textShadow: '0 0 40px rgba(245,230,163,0.3)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={done
            ? { opacity: 1, scale: [1, 1.04, 1], textShadow: ['0 0 40px rgba(245,230,163,0.3)', '0 0 80px rgba(201,168,76,0.9)', '0 0 40px rgba(245,230,163,0.3)'] }
            : { opacity: 1, scale: 1 }
          }
          transition={{ duration: done ? 0.8 : 0.8, delay: done ? 0 : 0.6, ease: 'easeOut' }}
        >
          {count.toLocaleString()}
        </motion.p>
        <motion.p
          className="font-body italic text-starlight-white/40 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {story.promise}
        </motion.p>
      </div>

      {/* Divider */}
      <motion.div
        className="w-16 h-px bg-gold-star/30 mb-6 md:mb-8 lg:mb-12 relative z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />

      {/* Love letter — lines reveal staggered */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-lg mx-auto space-y-2 md:space-y-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 1.4, delayChildren: 1.2 } } }}
      >
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="text-starlight-white/85 leading-relaxed"
            style={{ fontFamily: '"Lora", serif', fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)', fontStyle: 'italic' }}
            variants={{
              hidden:  { opacity: 0, y: 10, filter: 'blur(6px)' },
              visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 1.0, ease: 'easeOut' } },
            }}
            onAnimationStart={(def) => {
              if (def === 'visible' && !letterPlayedRef.current.has(i)) {
                letterPlayedRef.current.add(i)
                playSound('letter')
              }
            }}
          >
            <LetterLine line={line} isFirst={i === 0} />
          </motion.p>
        ))}

        {/* Signed name */}
        <motion.p
          className="pt-4 text-warm-glow"
          style={{ fontFamily: '"Lora", serif', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontStyle: 'italic', fontWeight: 700 }}
          variants={{
            hidden:  { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 1.2, delay: lines.length * 1.2 } },
          }}
        >
          — for {name}, always and forever
        </motion.p>
      </motion.div>

      {/* Footer flourish */}
      <motion.div
        className="mt-8 md:mt-12 lg:mt-16 flex flex-col items-center gap-2 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2, delay: 1.5 }}
      >
        <div className="w-1 h-1 rounded-full bg-gold-star" />
        <div className="w-px h-10 bg-gradient-to-b from-gold-star to-transparent" />
      </motion.div>

    </section>
  )
}
