import { motion } from 'framer-motion'

export default function StarModal({ star, onClose }) {
  if (!star) return null

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
        style={{ padding: '16px 16px 56px' }} // extra bottom = polaroid white strip
        initial={{ scale: 0.3, rotate: 14, opacity: 0 }}
        animate={{ scale: 1, rotate: 2, opacity: 1 }}
        exit={{ scale: 0.3, rotate: -10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()} // don't close when clicking the card
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
