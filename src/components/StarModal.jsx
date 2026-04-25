import { motion } from 'framer-motion'

function SpecialCard({ star, onClose }) {
  const lines = star.message.split('\n')
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-deep-canvas/90 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex flex-col items-center justify-center text-center max-w-sm w-full px-8 py-12 rounded-lg"
        style={{
          border:     '1px solid #C9A84C55',
          boxShadow:  '0 0 60px 12px #C9A84C22, inset 0 0 40px 4px #C9A84C0a',
          background: 'radial-gradient(ellipse at center, #1a1830 0%, #0D0D2B 70%)',
        }}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing orb */}
        <motion.div
          className="w-10 h-10 rounded-full mb-6"
          style={{
            background: 'radial-gradient(circle at 38% 35%, #ffffff 0%, #ffffffcc 18%, #F5E6A3 50%, transparent 100%)',
          }}
          animate={{
            boxShadow: [
              '0 0 18px 6px #F5E6A366, 0 0 40px 14px #C9A84C33',
              '0 0 36px 16px #F5E6A399, 0 0 70px 28px #C9A84C66',
              '0 0 18px 6px #F5E6A366, 0 0 40px 14px #C9A84C33',
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Heading */}
        <motion.h2
          className="font-heading text-4xl text-gold-star mb-6"
          style={{ textShadow: '0 0 24px #C9A84Caa' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          {lines[0]}
        </motion.h2>

        {/* Body lines */}
        <div className="space-y-2">
          {lines.slice(1).map((line, i) => (
            <motion.p
              key={i}
              className="text-starlight-white/80 leading-relaxed"
              style={{ fontFamily: '"Dancing Script", cursive', fontSize: '1.25rem' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.18, duration: 0.6 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </motion.div>

      <motion.p
        className="absolute bottom-8 left-0 right-0 text-center font-body text-xs text-starlight-white/30 uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Click anywhere to close
      </motion.p>
    </motion.div>
  )
}

export default function StarModal({ star, onClose }) {
  if (!star) return null

  if (star.isSpecial) return <SpecialCard star={star} onClose={onClose} />

  return (
    // Backdrop
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-deep-canvas/85 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Polaroid card */}
      <motion.div
        className="relative bg-starlight-white rounded-sm shadow-2xl max-w-xs w-full"
        style={{ padding: '16px 16px 56px' }}
        initial={{ scale: 0.3, rotate: 14, opacity: 0 }}
        animate={{ scale: 1, rotate: 2, opacity: 1 }}
        exit={{ scale: 0.3, rotate: -10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <img
          src={star.image}
          alt={star.date}
          className="w-full h-64 object-cover rounded-sm"
          style={{ filter: 'sepia(12%) saturate(90%)' }}
        />

        {/* Polaroid caption area */}
        <div className="mt-4 text-center space-y-2">
          <p className="font-heading italic text-sm text-deep-canvas/50 tracking-wide">
            {star.date}
          </p>
          <p
            className="text-deep-canvas/80 leading-relaxed px-2"
            style={{ fontFamily: '"Dancing Script", cursive', fontSize: '1.1rem' }}
          >
            {star.message}
          </p>
        </div>

        {/* Corner fold decoration */}
        <div className="absolute top-2 right-2 w-3 h-3 bg-deep-canvas/8 rounded-sm" />
      </motion.div>

      {/* Close hint */}
      <motion.p
        className="absolute bottom-8 left-0 right-0 text-center font-body text-xs text-starlight-white/30 uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Click anywhere to close
      </motion.p>
    </motion.div>
  )
}
