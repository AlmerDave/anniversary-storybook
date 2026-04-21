import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

// Particle config — 120 slow-drifting stars in warm gold and white tones.
// Interactivity is disabled here; the CursorTrail component handles mouse effects.
const particlesOptions = {
  background: { opacity: 0 },
  fpsLimit: 60,
  particles: {
    number: {
      value: 120,
      density: { enable: true, area: 900 },
    },
    color: {
      value: ['#F5E6A3', '#C9A84C', '#FAFAFA', '#E8B4D8'],
    },
    shape: { type: 'circle' },
    opacity: {
      value: { min: 0.08, max: 0.65 },
      animation: { enable: true, speed: 0.4, sync: false },
    },
    size: {
      value: { min: 0.4, max: 2.2 },
    },
    move: {
      enable: true,
      speed: 0.25,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'out' },
    },
    twinkle: {
      particles: { enable: true, frequency: 0.05, opacity: 1 },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: false },
      onClick: { enable: false },
    },
  },
  detectRetina: true,
}

export default function ParticleCanvas() {
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    // initParticlesEngine must complete before <Particles> renders.
    // The useState guard prevents rendering until the engine is ready.
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setEngineReady(true))
  }, [])

  if (!engineReady) return null

  return (
    <Particles
      id="tsparticles"
      options={particlesOptions}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
