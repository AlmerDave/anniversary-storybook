import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Chapter II — Two Stars Collide
//
// Phase schedule (seconds from mount):
//   continuity  0–5   : Gold sun alone at left, fades in gently
//   arrival     5–14  : Violet star fades in at right (no slide)
//   approach    14–30 : Both walk slowly toward each other (±1.4 → 0)
//   collision   30–34 : White flash + 280-particle curved burst
//   newstars    34–∞  : Full-screen milky way + narration text
//
// Architecture:
//   - Full-screen Three.js Canvas (position absolute, inset 0) for 3D spheres
//   - DOM overlay (z-index 10) for all text, labels, burst particles, flash
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing helpers ────────────────────────────────────────────────────────────
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const easeInCubic    = t => t * t * t
const easeOutCubic   = t => 1 - Math.pow(1 - t, 3)
const easeOutQuart   = t => 1 - Math.pow(1 - t, 4)

// ── Phase schedule ────────────────────────────────────────────────────────────
const PHASE_SCHEDULE = [
  { name: 'continuity', start: 0  },
  { name: 'arrival',    start: 5  },
  { name: 'approach',   start: 14 },
  { name: 'collision',  start: 30 },
  { name: 'newstars',   start: 34 },
]

// ── Burst particles (280) — all Math.random() at module level, never in JSX ──
const BURST_COUNT = 280
const BURST_PARTICLES = Array.from({ length: BURST_COUNT }, (_, i) => {
  const angle   = (i / BURST_COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.5
  const dist    = 90 + Math.random() * 320          // 90–410 px from screen center
  const perpAng = angle + (Math.random() - 0.5) * 1.2
  const midDist = dist * (0.28 + Math.random() * 0.38)
  const pick    = Math.random()
  const color   = pick < 0.40 ? '#C9A84C'
                : pick < 0.70 ? '#7B4FBF'
                : pick < 0.88 ? '#FAFAFA'
                : '#F5E6A3'
  return {
    endX  : Math.cos(angle)   * dist,
    endY  : Math.sin(angle)   * dist,
    midX  : Math.cos(perpAng) * midDist,
    midY  : Math.sin(perpAng) * midDist,
    color,
    size  : 1.5 + Math.random() * 2.5,
    dur   : 2.6 + Math.random() * 1.8,
    delay : i * 0.004,
  }
})

// ── Milky way data (2000 particles) — pre-computed Float32Arrays ──────────────
const MW_COUNT  = 2000
const MW_FINAL  = new Float32Array(MW_COUNT * 3)
const MW_COLORS = new Float32Array(MW_COUNT * 3)
;(function buildMilkyWay() {
  const BAND = Math.PI / 6
  for (let i = 0; i < MW_COUNT; i++) {
    const phi  = Math.random() * 2 * Math.PI
    const r    = Math.sqrt(Math.random()) * 3.2
    const band = Math.sin(phi - BAND) * 0.4
    MW_FINAL[i * 3]     = Math.cos(phi) * r
    MW_FINAL[i * 3 + 1] = Math.sin(phi) * r * (0.35 + Math.abs(band))
    MW_FINAL[i * 3 + 2] = (Math.random() - 0.5) * 0.8
    const p = i % 10
    if (p < 4)      { MW_COLORS[i*3]=0.788; MW_COLORS[i*3+1]=0.659; MW_COLORS[i*3+2]=0.298 } // gold
    else if (p < 7) { MW_COLORS[i*3]=0.482; MW_COLORS[i*3+1]=0.310; MW_COLORS[i*3+2]=0.749 } // violet
    else            { MW_COLORS[i*3]=0.784; MW_COLORS[i*3+1]=0.784; MW_COLORS[i*3+2]=1.000 } // blue-white
  }
})()

// ── Phase timer hook ──────────────────────────────────────────────────────────
function usePhaseTimer() {
  const [phase, setPhase] = useState('continuity')
  useEffect(() => {
    const timers = PHASE_SCHEDULE.slice(1).map(({ name, start }) =>
      setTimeout(() => setPhase(name), start * 1000)
    )
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return phase
}

// ── Responsive sun radius ─────────────────────────────────────────────────────
function useSunRadius() {
  const [radius, setRadius] = useState(() => window.innerWidth < 768 ? 0.18 : 0.48)
  useEffect(() => {
    const handler = () => setRadius(window.innerWidth < 768 ? 0.18 : 0.48)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return radius
}

// ── Responsive violet radius ──────────────────────────────────────────────────
function useVioletRadius() {
  const [radius, setRadius] = useState(() => window.innerWidth < 768 ? 0.15 : 0.35)
  useEffect(() => {
    const handler = () => setRadius(window.innerWidth < 768 ? 0.15 : 0.35)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return radius
}

// ── Responsive star spread (±units from center) ───────────────────────────────
// At fov=50, z=6, mobile portrait visible width ≈ ±1.28 world units.
// Keep spread safely inside that so spheres never clip off-screen.
function useStarSpread() {
  const [spread, setSpread] = useState(() => window.innerWidth < 768 ? 0.85 : 1.4)
  useEffect(() => {
    const handler = () => setSpread(window.innerWidth < 768 ? 0.85 : 1.4)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return spread
}

// ── Star positions (RAF-driven refs — zero setState at 60fps) ─────────────────
function useStarPositions(phase, spread) {
  const goldRef   = useRef([-spread, 0, 0])  // gold starts at left
  const violetRef = useRef([ spread, 0, 0])  // violet starts at right
  const rafRef    = useRef(null)

  useEffect(() => {
    const cancel = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }

    // arrival: both spheres hold their positions — opacity animation handles the reveal
    if (phase === 'arrival') {
      return cancel
    }

    if (phase === 'approach') {
      // Snapshot start positions (already at ±spread from previous phases)
      goldRef.current   = [-spread, 0, 0]
      violetRef.current = [ spread, 0, 0]

      const start = Date.now()
      const WALK  = 16000  // full 16s phase — both walk from ±spread → 0

      const tick = () => {
        const elapsed = Date.now() - start
        const wt = Math.min(elapsed / WALK, 1)
        // Ease-in first half, heavy ease-out second half (slows near collision)
        const e = wt < 0.5
          ? easeInCubic(wt * 2) * 0.5
          : 0.5 + easeOutQuart((wt - 0.5) * 2) * 0.5
        // Subtle y-wobble that fades as they near each other
        const wobble = Math.sin(elapsed * 0.0008) * 0.05 * (1 - wt)
        goldRef.current   = [-spread * (1 - e),  wobble, 0]
        violetRef.current = [ spread * (1 - e), -wobble, 0]

        if (elapsed < WALK) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return cancel
    }

    if (phase === 'collision') {
      const start     = Date.now()
      const SHAKE_DUR = 580  // ms — matches the 0.55s material fade-out

      const tick = () => {
        const elapsed = Date.now() - start
        const t   = Math.min(elapsed / SHAKE_DUR, 1)
        const amp = 0.22 * (1 - t)   // amplitude shrinks to 0 as they fade

        // Two overlapping sine waves per axis → chaotic, non-repeating shake
        goldRef.current = [
          Math.sin(elapsed * 0.053) * amp + Math.sin(elapsed * 0.087) * amp * 0.45,
          Math.sin(elapsed * 0.046 + 1.1) * amp + Math.sin(elapsed * 0.074) * amp * 0.4,
          0,
        ]
        violetRef.current = [
          Math.sin(elapsed * 0.057 + 2.4) * amp + Math.sin(elapsed * 0.081) * amp * 0.45,
          Math.sin(elapsed * 0.049 + 3.8) * amp + Math.sin(elapsed * 0.069) * amp * 0.4,
          0,
        ]

        if (elapsed < SHAKE_DUR) rafRef.current = requestAnimationFrame(tick)
        else {
          goldRef.current   = [0, 0, 0]
          violetRef.current = [0, 0, 0]
        }
      }
      rafRef.current = requestAnimationFrame(tick)
      return cancel
    }

    if (phase === 'newstars') {
      goldRef.current   = [0, 0, 0]
      violetRef.current = [0, 0, 0]
    }

    return cancel
  }, [phase])

  return { goldRef, violetRef }
}

// ── Three.js: Sun sphere — fades in at left position ─────────────────────────
function SunSphere({ meshRef, radius, fadeOut }) {
  const tex          = useTexture('/photos/sun.jpg')
  const matRef       = useRef()
  const startRef     = useRef(null)
  const fadeOutStart = useRef(null)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    if (startRef.current === null) startRef.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - startRef.current

    if (fadeOut) {
      if (fadeOutStart.current === null) fadeOutStart.current = clock.elapsedTime
      const fo = clock.elapsedTime - fadeOutStart.current
      matRef.current.opacity = Math.max(1 - fo / 0.55, 0)  // fade out over 0.55s
    } else {
      fadeOutStart.current = null
      matRef.current.opacity = Math.min(elapsed / 2.0, 1)   // fade in over 2s
    }
  })

  return (
    <mesh ref={meshRef} rotation={[0.1, 0, 0]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        ref={matRef}
        map={tex}
        emissiveMap={tex}
        emissive="#FF6600"
        emissiveIntensity={0.45}
        roughness={1.0}
        metalness={0.0}
        transparent
        opacity={0}
      />
    </mesh>
  )
}

// ── Three.js: Violet (Neptune) sphere — fades in at right position ────────────
function VioletSphere({ meshRef, radius, fadeOut }) {
  const tex          = useTexture('/photos/neptune_saturn.jpg')
  const matRef       = useRef()
  const startRef     = useRef(null)
  const fadeOutStart = useRef(null)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    if (startRef.current === null) startRef.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - startRef.current

    if (fadeOut) {
      if (fadeOutStart.current === null) fadeOutStart.current = clock.elapsedTime
      const fo = clock.elapsedTime - fadeOutStart.current
      matRef.current.opacity = Math.max(1 - fo / 0.55, 0)  // fade out over 0.55s
    } else {
      fadeOutStart.current = null
      // 1s delay then fade in over 2.5s
      matRef.current.opacity = Math.min(Math.max(elapsed - 1.0, 0) / 2.5, 1)
    }
  })

  return (
    <mesh ref={meshRef} rotation={[0.1, 0, 0]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        ref={matRef}
        map={tex}
        emissiveMap={tex}
        emissive="#5B3F9F"
        emissiveIntensity={0.5}
        roughness={1.0}
        metalness={0.0}
        transparent
        opacity={0}
      />
    </mesh>
  )
}

// ── Three.js: Milky way Points geometry ───────────────────────────────────────
function MilkyWayPoints() {
  const pointsRef    = useRef()
  const startTimeRef = useRef(null)

  // Geometry starts with all-zero positions; useFrame lerps to MW_FINAL
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MW_COUNT * 3), 3))
    g.setAttribute('color',    new THREE.BufferAttribute(MW_COLORS.slice(), 3))
    return g
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    if (startTimeRef.current === null) startTimeRef.current = clock.elapsedTime

    const elapsed = clock.elapsedTime - startTimeRef.current
    const t = Math.min(elapsed / 4.5, 1)

    // Animate positions from origin → MW_FINAL (stops updating after t=1)
    if (t < 1) {
      const e   = easeOutCubic(t)
      const pos = pointsRef.current.geometry.attributes.position
      for (let i = 0; i < MW_COUNT; i++) {
        pos.array[i * 3]     = MW_FINAL[i * 3]     * e
        pos.array[i * 3 + 1] = MW_FINAL[i * 3 + 1] * e
        pos.array[i * 3 + 2] = MW_FINAL[i * 3 + 2] * e
      }
      pos.needsUpdate = true
    }

    // Continuous gentle twinkle via opacity oscillation
    if (pointsRef.current.material) {
      pointsRef.current.material.opacity =
        Math.min(t * 2.2, 0.88) + Math.sin(clock.elapsedTime * 1.5) * 0.04
    }
  })

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        vertexColors
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  )
}

// ── Three.js: Scene orchestrator ──────────────────────────────────────────────
function SceneContent({ goldPosRef, violetPosRef, phase, sunRadius, violetRadius }) {
  // Use a ref for phase inside useFrame to avoid stale closure
  const phaseRef       = useRef(phase)
  const goldMeshRef    = useRef()
  const violetMeshRef  = useRef()
  const goldLightRef   = useRef()
  const violetLightRef = useRef()

  useEffect(() => { phaseRef.current = phase }, [phase])

  useFrame(() => {
    // Update gold sphere position + rotation + its light
    if (goldMeshRef.current) {
      const [gx, gy, gz] = goldPosRef.current
      goldMeshRef.current.position.set(gx, gy, gz)
      goldMeshRef.current.rotation.y += 0.003
      if (goldLightRef.current) goldLightRef.current.position.set(gx, gy, gz)
    }
    // Update violet sphere position + rotation + its light
    if (violetMeshRef.current) {
      const [vx, vy, vz] = violetPosRef.current
      violetMeshRef.current.position.set(vx, vy, vz)
      violetMeshRef.current.rotation.y += 0.003
      if (violetLightRef.current) violetLightRef.current.position.set(vx, vy, vz)
    }
  })

  const showGold   = phase !== 'newstars'
  const showViolet = phase === 'arrival' || phase === 'approach' || phase === 'collision'
  const showMilky  = phase === 'newstars'

  return (
    <>
      {/* Base scene lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[3, 2, 4]}   intensity={20} color="#FFF5E0" />
      <pointLight position={[-2, -1, -3]} intensity={8}  color="#FF8C00" />

      {/* Gold sun + its warm point light */}
      {showGold && (
        <>
          <SunSphere meshRef={goldMeshRef} radius={sunRadius} fadeOut={phase === 'collision'} />
          <pointLight ref={goldLightRef} intensity={15} color="#FFA040" distance={8} decay={2} />
        </>
      )}

      {/* Violet star + its purple point light */}
      {showViolet && (
        <>
          <VioletSphere meshRef={violetMeshRef} radius={violetRadius} fadeOut={phase === 'collision'} />
          <pointLight ref={violetLightRef} intensity={12} color="#9B6FDF" distance={8} decay={2} />
        </>
      )}

      {/* Milky way particle field */}
      {showMilky && <MilkyWayPoints />}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChapterTwo({ metDate, story }) {
  const phase                  = usePhaseTimer()
  const sunRadius              = useSunRadius()
  const violetRadius           = useVioletRadius()
  const spread                 = useStarSpread()
  const { goldRef, violetRef } = useStarPositions(phase, spread)

  return (
    <section className="relative w-full h-screen overflow-hidden">

      {/* ── Full-screen Three.js canvas ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <SceneContent
            goldPosRef={goldRef}
            violetPosRef={violetRef}
            phase={phase}
            sunRadius={sunRadius}
            violetRadius={violetRadius}
          />
        </Canvas>
      </div>

      {/* ── DOM overlay — text, labels, burst, flash ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>

        {/* Chapter label — top center */}
        <motion.p
          className="absolute top-8 w-full text-center font-body text-xs uppercase tracking-[0.35em] text-gold-star/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Chapter II — Two Stars Collide
        </motion.p>

        {/* metDate — fades in mid-approach */}
        <AnimatePresence>
          {phase === 'approach' && (
            <motion.p
              className="absolute left-1/2 -translate-x-1/2 font-heading italic text-warm-glow/70 text-base sm:text-lg"
              style={{ bottom: '10%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 5, duration: 2.5 }}
            >
              {metDate}
            </motion.p>
          )}
        </AnimatePresence>

        {/* White flash — collision moment */}
        <AnimatePresence>
          {phase === 'collision' && (
            <motion.div
              className="absolute inset-0"
              style={{ background: 'white', zIndex: 20 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, times: [0, 0.18, 1], ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Burst particles — 280 curved arcs from screen center */}
        <AnimatePresence>
          {(phase === 'collision' || phase === 'newstars') &&
            BURST_PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width:           p.size,
                  height:          p.size,
                  backgroundColor: p.color,
                  boxShadow:       `0 0 ${p.size * 3}px ${p.color}99`,
                  left:            '50%',
                  top:             '50%',
                  marginLeft:      -p.size / 2,
                  marginTop:       -p.size / 2,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 2 }}
                animate={{
                  x:       [0, p.midX, p.endX],
                  y:       [0, p.midY, p.endY],
                  opacity: [1, 0.75, 0],
                  scale:   [2, 1.2, 0.3],
                }}
                exit={{}}
                transition={{
                  duration: p.dur,
                  ease:     'easeOut',
                  delay:    p.delay,
                  times:    [0, 0.32, 1],
                }}
              />
            ))
          }
        </AnimatePresence>

        {/* Narration over milky way — fades in after galaxy forms */}
        <AnimatePresence>
          {phase === 'newstars' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 1.6, ease: 'easeOut' }}
            >
              <p className="font-heading italic text-3xl sm:text-4xl text-warm-glow drop-shadow-lg">
                {metDate}
              </p>
              <p className="font-body text-lg text-starlight-white/65 max-w-md leading-relaxed">
                {story.meeting}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}
