import { motion } from 'framer-motion'
import { useAudio } from '../context/AudioContext'

export default function AudioControls() {
  const { muted, toggleMute } = useAudio()

  return (
    <motion.button
      onClick={toggleMute}
      className="fixed z-50 flex items-center justify-center rounded-full border border-gold-star/30 bg-deep-canvas/60 backdrop-blur-sm hover:bg-gold-star/10 transition-colors"
      style={{ bottom: '2rem', right: '1rem', width: 40, height: 40 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      )}
    </motion.button>
  )
}
