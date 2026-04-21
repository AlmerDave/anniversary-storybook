import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StarModal from './StarModal'

// Deterministic star positions using golden-angle distribution
function getStarStyle(id) {
  const phi   = 137.508 * id * (Math.PI / 180)
  const r     = 28 + (id % 5) * 10   // 28–68 % of space
  const cx    = 50 + r * Math.cos(phi) * 0.55
  const cy    = 50 + r * Math.sin(phi) * 0.40
  const x     = Math.min(Math.max(cx, 5), 90)
  const y     = Math.min(Math.max(cy, 10), 88)
  const sizes = ['w-3 h-3', 'w-2 h-2', 'w-4 h-4', 'w-2.5 h-2.5', 'w-3 h-3']
  return { left: `${x}%`, top: `${y}%`, sizeClass: sizes[id % sizes.length] }
}

const starVariants = {
  hidden:  { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 220, damping: 18 } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

// Two occasional shooting stars for atmosphere
const SHOOTING = [
  { top: '18%', delay: 2,  dur: 3.5 },
  { top: '62%', delay: 9,  dur: 4.0 },
]

export default function PlanetModal({ stars }) {
  const [activeStar, setActiveStar] = useState(null)

  const positioned = useMemo(
    () => stars.map((s) => ({ ...s, ...getStarStyle(s.id) })),
    [stars]
  )

  return (
    <div className="relative w-full" style={{ height: '52vh', minHeight: 300 }}>
      {/* Memory stars */}
      <motion.div
        className="relative w-full h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {positioned.map((star) => (
          <motion.button
            key={star.id}
            className={`absolute ${star.sizeClass} rounded-full bg-warm-glow star-shimmer focus:outline-none`}
            style={{ left: star.left, top: star.top, transform: 'translate(-50%, -50%)' }}
            variants={starVariants}
            whileHover={{
              scale: 2.2,
              filter: 'drop-shadow(0 0 14px #F5E6A3) drop-shadow(0 0 28px #C9A84C)',
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 1.5 }}
            onClick={() => setActiveStar(star)}
            aria-label={`Memory from ${star.date}`}
          />
        ))}

        {/* Shooting stars */}
        {SHOOTING.map((s, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-24 pointer-events-none"
            style={{
              top: s.top,
              left: '-120px',
              background: 'linear-gradient(to right, transparent, #F5E6A3, transparent)',
              rotate: '-12deg',
            }}
            animate={{ x: ['0px', '1500px'], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: s.dur,
              delay: s.delay,
              repeat: Infinity,
              repeatDelay: 14 + i * 6,
              ease: 'linear',
            }}
          />
        ))}
      </motion.div>

      {/* StarModal */}
      <AnimatePresence>
        {activeStar && (
          <StarModal
            key={activeStar.id}
            star={activeStar}
            onClose={() => setActiveStar(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
