import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Howl, Howler } from 'howler'

const BASE = import.meta.env.BASE_URL

const SFX_CONFIG = {
  bloom:     { src: [`${BASE}audio/sfx-bloom.mp3`],     volume: 0.5  },
  arrival:   { src: [`${BASE}audio/sfx-arrival.mp3`],   volume: 0.5  },
  collision: { src: [`${BASE}audio/sfx-collision.mp3`], volume: 0.7  },
  newstars:  { src: [`${BASE}audio/sfx-newstars.mp3`],  volume: 0.5  },
  planet:    { src: [`${BASE}audio/sfx-planet.mp3`],    volume: 0.35 },
  birth:     { src: [`${BASE}audio/sfx-birth.mp3`],     volume: 0.35 },
  letter:    { src: [`${BASE}audio/sfx-letter.mp3`],    volume: 0.35 },
  counter:   { src: [`${BASE}audio/sfx-counter.mp3`],   volume: 0.35 },
}

const AudioCtx = createContext(null)

export function AudioProvider({ children }) {
  const [muted, setMuted] = useState(false)
  const ambientRef        = useRef(null)
  const sfxRef            = useRef({})
  const startedRef        = useRef(false)

  useEffect(() => {
    const initAudio = () => {
      if (startedRef.current) return
      startedRef.current = true

      // Resume suspended AudioContext (required by browser autoplay policy)
      const resume = Howler.ctx ? Howler.ctx.resume() : Promise.resolve()
      resume.then(() => {
        const ambient = new Howl({
          src:    [`${BASE}audio/ambient.mp3`],
          loop:   true,
          volume: 0,
          onplayerror: (_id, err) => {
            // If playback is blocked, retry once AudioContext unlocks
            ambient.once('unlock', () => {
              ambient.play()
              ambient.fade(0, 0.35, 2000)
            })
          },
        })
        ambient.play()
        ambient.fade(0, 0.35, 2000)
        ambientRef.current = ambient

        Object.entries(SFX_CONFIG).forEach(([name, cfg]) => {
          sfxRef.current[name] = new Howl({ src: cfg.src, volume: cfg.volume })
        })
      })
    }

    const EVENTS = ['click', 'touchstart', 'keydown', 'pointerdown']
    EVENTS.forEach(e => document.addEventListener(e, initAudio, { once: true, passive: true }))
    return () => EVENTS.forEach(e => document.removeEventListener(e, initAudio))
  }, [])

  const playSound = useCallback((name) => {
    const howl = sfxRef.current[name]
    if (howl) howl.play()
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      Howler.mute(next)
      return next
    })
  }, [])

  return (
    <AudioCtx.Provider value={{ muted, toggleMute, playSound }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  return useContext(AudioCtx) ?? { muted: false, toggleMute: () => {}, playSound: () => {} }
}
