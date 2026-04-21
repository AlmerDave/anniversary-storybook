import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

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

function useDancingStars(a = 80) {
  const [posA, setPosA] = useState({ x: a, y: 0 })
  const [posB, setPosB] = useState({ x: -a, y: 0 })
  const rafRef  = useRef(null)
  const mountMs = useRef(Date.now())

  useEffect(() => {
    const tick = () => {
      const t = ((Date.now() - mountMs.current) / 1000) * 0.55  // gentle speed
      setPosA(lemniscate(t, a))
      setPosB(lemniscate(t + Math.PI, a))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [a])

  return { posA, posB }
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

export default function ChapterFour({ anniversaryDate, letter, story, name }) {
  const target = getDaysSince(anniversaryDate)
  const count  = useCountUp(target)
  const { posA, posB } = useDancingStars(75)

  const lines = letter.split('\n').filter((l) => l.trim())

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-16">

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
        className="font-body text-xs uppercase tracking-[0.35em] text-gold-star/50 mb-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Chapter IV — Still Counting
      </motion.p>

      {/* Dancing stars — lemniscate figure-8 orbit */}
      <div
        className="relative flex items-center justify-center mb-10 z-10"
        style={{ width: 240, height: 130 }}
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
      </div>

      {/* Day counter */}
      <div className="text-center mb-12 space-y-2 relative z-10">
        <motion.p
          className="font-body text-sm uppercase tracking-[0.4em] text-gold-star/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Days together
        </motion.p>
        <motion.p
          className="font-heading text-8xl sm:text-9xl text-warm-glow"
          style={{ textShadow: '0 0 40px rgba(245,230,163,0.3)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
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
        className="w-16 h-px bg-gold-star/30 mb-12 relative z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />

      {/* Love letter — lines reveal staggered */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-lg mx-auto space-y-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.55, delayChildren: 1.2 } } }}
      >
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="text-starlight-white/85 leading-relaxed"
            style={{ fontFamily: '"Dancing Script", cursive', fontSize: '1.35rem' }}
            variants={{
              hidden:  { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: 'easeOut' } },
            }}
          >
            {line}
          </motion.p>
        ))}

        {/* Signed name */}
        <motion.p
          className="pt-4 text-warm-glow"
          style={{ fontFamily: '"Dancing Script", cursive', fontSize: '1.6rem' }}
          variants={{
            hidden:  { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 1.2, delay: lines.length * 0.5 } },
          }}
        >
          — for {name}, always
        </motion.p>
      </motion.div>

      {/* Footer flourish */}
      <motion.div
        className="mt-16 flex flex-col items-center gap-2 relative z-10"
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
