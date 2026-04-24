import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from './data'
import { AudioProvider } from './context/AudioContext'
import ParticleCanvas from './components/ParticleCanvas'
import AudioControls  from './components/AudioControls'
import Intro        from './components/Intro'
import ChapterOne   from './components/ChapterOne'
import ChapterTwo   from './components/ChapterTwo'
import ChapterThree from './components/ChapterThree'
import ChapterFour  from './components/ChapterFour'

const TOTAL_CHAPTERS = 4 // chapters 1–4; 0 = Intro

export default function App() {
  const [currentChapter, setCurrentChapter] = useState(0)
  const touchStartX = useRef(null)

  const goNext = () => setCurrentChapter(c => Math.min(c + 1, TOTAL_CHAPTERS))
  const goPrev = () => setCurrentChapter(c => Math.max(c - 1, 1)) // can't swipe back to Intro

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      if (delta > 0) goNext()  // swipe left  → next chapter
      else           goPrev()  // swipe right → previous chapter
    }
    touchStartX.current = null
  }

  function renderChapter(chapter) {
    switch (chapter) {
      case 0: return (
        <Intro name={config.name} onBegin={() => setCurrentChapter(1)} />
      )
      case 1: return <ChapterOne story={config.story} />
      case 2: return <ChapterTwo metDate={config.metDate} story={config.story} />
      case 3: return <ChapterThree years={config.years} story={config.story} />
      case 4: return (
        <ChapterFour
          anniversaryDate={config.anniversaryDate}
          letter={config.letter}
          story={config.story}
          name={config.name}
        />
      )
      default: return null
    }
  }

  // Show ← only from chapter 2+ (no going back to Intro)
  const showPrev = currentChapter > 1
  // Show → from chapter 1 through 3 (chapter 4 is the last)
  const showNext = currentChapter >= 1 && currentChapter < TOTAL_CHAPTERS

  return (
    <AudioProvider>
    <div
      className="relative w-screen h-screen overflow-hidden bg-deep-canvas"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Always-on star field — fixed, pointer-events-none */}
      <ParticleCanvas />
      <AudioControls />

      {/* Active chapter — fills full viewport */}
      <main className="relative z-10 w-full h-full van-gogh-swirl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {renderChapter(currentChapter)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation arrows — hidden on Intro */}
      {currentChapter > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8">
          {/* ← Previous */}
          {showPrev ? (
            <motion.button
              onClick={goPrev}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gold-star border border-gold-star/30 bg-deep-canvas/60 backdrop-blur-sm hover:bg-gold-star/10 transition-colors"
              aria-label="Previous chapter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ←
            </motion.button>
          ) : (
            <div className="w-10 h-10" aria-hidden="true" />
          )}

          {/* → Next */}
          {showNext ? (
            <motion.button
              onClick={goNext}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gold-star border border-gold-star/30 bg-deep-canvas/60 backdrop-blur-sm hover:bg-gold-star/10 transition-colors"
              aria-label="Next chapter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              →
            </motion.button>
          ) : (
            <div className="w-10 h-10" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
    </AudioProvider>
  )
}
