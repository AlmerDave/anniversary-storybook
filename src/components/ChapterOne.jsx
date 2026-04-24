import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture, OrbitControls } from '@react-three/drei'

// ── Story line definitions with word-level highlights ─────────────────────────
const STORY_SEGMENTS = [
  [
    { text: 'Before there was ' },
    { text: 'an us', color: '#C9A84C' },
    { text: '…' },
  ],
  [
    { text: 'There was only ' },
    { text: 'me', color: '#F5E6A3', glow: true },
    { text: '.' },
  ],
  [
    { text: 'Alone', color: '#7B4FBF' },
    { text: ' in a universe that had not yet found its ' },
    { text: 'reason', color: '#F5E6A3', glow: true },
    { text: '.' },
  ],
  [
    { text: 'Just ' },
    { text: 'waiting', color: '#E8B4D8' },
    { text: ', without knowing what I was ' },
    { text: 'waiting', color: '#E8B4D8' },
    { text: ' for.' },
  ],
]

// ── 3D rotating sun sphere ────────────────────────────────────────────────────
function SunSphere() {
  const meshRef = useRef()
  const sunTexture = useTexture(import.meta.env.BASE_URL + 'photos/sun.jpg')

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3
  })

  return (
    // Slight X tilt so the rotation is visually perceptible
    <mesh ref={meshRef} rotation={[0.18, 0, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={sunTexture}
        emissiveMap={sunTexture}
        emissive="#FF6600"
        emissiveIntensity={0.45}
        roughness={1.0}
        metalness={0.0}
      />
    </mesh>
  )
}

// ── Ambient dust mote ─────────────────────────────────────────────────────────
function DustMote({ x, delay, duration, repeatDelay }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 3,
        height: 3,
        left: x,
        bottom: 0,
        background: 'radial-gradient(circle, #F5E6A3 0%, rgba(201,168,76,0.3) 100%)',
        filter: 'blur(0.5px)',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [-10, -90, -160], opacity: [0, 0.7, 0], x: [0, 8, -4] }}
      transition={{ delay, duration, repeat: Infinity, repeatDelay, ease: 'easeOut' }}
    />
  )
}

// Pre-computed so Math.random() never runs inside JSX on re-render
const DUST_MOTES = [
  { x: -55,  delay: 0.5, duration: 3.2, repeatDelay: 1.4 },
  { x:  440, delay: 1.4, duration: 2.8, repeatDelay: 2.1 },
  { x:  65,  delay: 2.1, duration: 3.6, repeatDelay: 1.0 },
  { x:  310, delay: 0.9, duration: 2.5, repeatDelay: 2.6 },
  { x:  175, delay: 3.0, duration: 3.0, repeatDelay: 1.7 },
]

// ── Single story line — materialises as one unit, no typewriter ───────────────
// Each line fades in with a gentle upward drift and blur-to-clear.
// Lines appear 1.2s apart so each one has space to breathe before the next.
function StoryLine({ segs, delay }) {
  return (
    <motion.p
      className="font-body italic text-lg sm:text-xl text-starlight-white/80 leading-relaxed mb-2"
      initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: 'easeOut', delay }}
    >
      {segs.map((seg, i) => {
        if (!seg.color) return <span key={i}>{seg.text}</span>
        return (
          <span
            key={i}
            style={{
              color: seg.color,
              textShadow: seg.glow
                ? `0 0 10px ${seg.color}CC, 0 0 24px ${seg.color}66`
                : `0 0 8px ${seg.color}88`,
            }}
          >
            {seg.text}
          </span>
        )
      })}
    </motion.p>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChapterOne() {
  // Canvas size: 250px capped to 88vw so it never overflows on mobile
  const CANVAS_SIZE = 'min(250px, 88vw)'

  return (
    <section className="relative h-screen overflow-hidden flex items-center justify-center">

      {/* ── Vertical stack: sun on top, caption text directly below ── */}
      <div className="flex flex-col items-center" style={{ gap: '28px' }}>

        {/* ── Sun ── */}
        <div
          className="relative flex items-center justify-center pointer-events-auto"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        >
          {/* Ambient dust motes */}
          <div className="absolute inset-0" style={{ overflow: 'visible', pointerEvents: 'none' }}>
            {DUST_MOTES.map((m, i) => (
              <DustMote key={i} {...m} />
            ))}
          </div>

          {/* Three.js sun with WebGL */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onTouchStart={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
          >
            <Canvas
              camera={{ position: [0, 0, 2.8], fov: 45 }}
              gl={{ alpha: true, antialias: true }}
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* Low ambient — preserves the dark side for 3D depth */}
              <ambientLight intensity={0.1} />
              {/* Key light — warm highlight from upper-right */}
              <pointLight position={[3, 2, 3]} intensity={80} color="#FFF5E0" />
              {/* Rim light — subtle warm fill from behind */}
              <pointLight position={[-2, -1, -3]} intensity={20} color="#FF8C00" />
              <SunSphere />
              <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
            </Canvas>
          </motion.div>
        </div>

        {/* ── Caption text — sits directly below the sun like a painting label ── */}
        <div className="text-center px-6 max-w-lg pointer-events-none">
          {STORY_SEGMENTS.map((segs, i) => (
            <StoryLine key={i} segs={segs} delay={1.5 + i * 1.2} />
          ))}
        </div>

      </div>

    </section>
  )
}
