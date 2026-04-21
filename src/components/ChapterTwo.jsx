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
//   collision   30–34 : White flash + 280-particle InstancedMesh radial burst
//   newstars    34–∞  : Full-screen milky way + narration text
//
// Architecture:
//   - Full-screen Three.js Canvas (position absolute, inset 0) for 3D spheres
//   - DOM overlay (z-index 10) for text, labels, and white flash only
//   - Burst particles live in the Canvas (InstancedMesh, 1 draw call)
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

// ── Burst particles (280) — physics data, all Math.random() at module level ───
const BURST_COUNT = 280
const DRAG        = 0.6   // drag coefficient for pos(t) = v₀·t·exp(−drag·t)
const BURST_DUR   = 3.5   // seconds until fully faded
// Color table: hot explosion core → cooling outer sparks → story palette
// pick thresholds: white-hot | orange | gold | amber | violet | warm-glow
const BURST_COLORS = [
  { max: 0.15, hex: '#FFFFFF', boost: 3.0 },  // white-hot core sparks
  { max: 0.35, hex: '#FF7A20', boost: 2.5 },  // hot orange
  { max: 0.55, hex: '#C9A84C', boost: 2.0 },  // gold (story color)
  { max: 0.72, hex: '#FFD060', boost: 2.2 },  // amber yellow
  { max: 0.88, hex: '#7B4FBF', boost: 1.8 },  // violet (story color, cooler)
  { max: 1.00, hex: '#F5E6A3', boost: 1.5 },  // warm-glow (dimmest outer)
]
const BURST_DATA  = Array.from({ length: BURST_COUNT }, () => {
  const angle = Math.random() * 2 * Math.PI
  const speed = 2.5 + Math.random() * 2.0          // world units/s initial radial speed
  const pick  = Math.random()
  const entry = BURST_COLORS.find(c => pick < c.max)
  const color = new THREE.Color(entry.hex).multiplyScalar(entry.boost)
  return {
    vx:   Math.cos(angle) * speed,
    vy:   Math.sin(angle) * speed,
    color,
    size: 0.018 + Math.random() * 0.020,           // slightly larger for additive glow
  }
})

// ── Milky way data (2000 particles) — pre-computed Float32Arrays ──────────────
const MW_COUNT  = 2000
const MW_FINAL  = new Float32Array(MW_COUNT * 3)
const MW_COLORS = new Float32Array(MW_COUNT * 3)
// Per-particle twinkling: independent phase seed + frequency per star
const MW_SEEDS  = new Float32Array(MW_COUNT)      // phase offset [0, 2π]
const MW_FREQS  = new Float32Array(MW_COUNT)      // oscillation speed [0.5, 2.5] rad/s
// Size tiers in CSS pixels (screen-space): 70% tiny / 20% medium / 10% bright hero
const MW_SIZES  = new Float32Array(MW_COUNT)
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
    // Each star gets its own heartbeat — no two in sync
    MW_SEEDS[i] = Math.random() * Math.PI * 2
    MW_FREQS[i] = 0.5 + Math.random() * 2.0
    // Size tiers: faint dust → medium → bright hero
    const sr = Math.random()
    MW_SIZES[i] = sr < 0.70 ? 1.5 + Math.random() * 1.0   // 1.5–2.5 px  (70 % — background dust)
                : sr < 0.90 ? 3.0 + Math.random() * 2.0   // 3.0–5.0 px  (20 % — visible stars)
                :             6.0 + Math.random() * 3.0   // 6.0–9.0 px  (10 % — bright hero stars)
  }
})()

// ── Milky way shaders ─────────────────────────────────────────────────────────
// Vertex: passes per-particle seed/freq/size to the fragment stage.
// "color" is the BufferGeometry attribute — declared manually because ShaderMaterial
//  does NOT auto-inject it the way PointsMaterial does.
const MW_VERT = /* glsl */`
  attribute vec3  color;
  attribute float aSeed;
  attribute float aFreq;
  attribute float aSize;

  varying vec3  vColor;
  varying float vSeed;
  varying float vFreq;

  void main() {
    vColor = color;
    vSeed  = aSeed;
    vFreq  = aFreq;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // aSize is in CSS pixels — no perspective division; stars are background objects
    gl_PointSize = aSize;
    gl_Position  = projectionMatrix * mvPosition;
  }
`
// Fragment: soft glow disc (smoothstep) + per-star sin twinkling.
// AdditiveBlending means overlapping stars naturally bloom into each other —
//  no EffectComposer needed.
const MW_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uOpacity;

  varying vec3  vColor;
  varying float vSeed;
  varying float vFreq;

  void main() {
    // Discard the square corners — render only the circular disc
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft glow: full brightness at centre, fades to transparent at radius 0.5
    float glow    = smoothstep(0.5, 0.0, dist);

    // Per-particle independent twinkle: 65 % base + ±35 % oscillation
    float twinkle = 0.65 + 0.35 * sin(uTime * vFreq + vSeed);

    // Boost colour slightly so additive blending reads as warm/vivid, not washed out
    gl_FragColor = vec4(vColor * 1.5, glow * twinkle * uOpacity);
  }
`

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
  const tex          = useTexture(import.meta.env.BASE_URL + 'photos/sun.jpg')
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
  const tex          = useTexture(import.meta.env.BASE_URL + 'photos/neptune_saturn.jpg')
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
  const matRef       = useRef()
  const startTimeRef = useRef(null)

  // Geometry: positions start at origin and lerp to MW_FINAL over 4.5 s.
  // aSeed / aFreq / aSize are static per-particle data baked at module level.
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MW_COUNT * 3), 3))
    g.setAttribute('color',    new THREE.BufferAttribute(MW_COLORS.slice(), 3))
    g.setAttribute('aSeed',    new THREE.BufferAttribute(MW_SEEDS.slice(), 1))
    g.setAttribute('aFreq',    new THREE.BufferAttribute(MW_FREQS.slice(), 1))
    g.setAttribute('aSize',    new THREE.BufferAttribute(MW_SIZES.slice(), 1))
    return g
  }, [])

  // Uniforms object is stable — useFrame mutates .value directly (no re-render)
  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uOpacity: { value: 0 },
  }), [])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !matRef.current) return
    if (startTimeRef.current === null) startTimeRef.current = clock.elapsedTime

    const elapsed = clock.elapsedTime - startTimeRef.current
    const t = Math.min(elapsed / 4.5, 1)

    // Drive shader uniforms each frame — twinkling + fade-in
    matRef.current.uniforms.uTime.value    = clock.elapsedTime
    matRef.current.uniforms.uOpacity.value = Math.min(t * 2.2, 0.88)

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
  })

  return (
    <points ref={pointsRef} geometry={geo}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={MW_VERT}
        fragmentShader={MW_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ── Three.js: Explosion burst — InstancedMesh, radial velocity with drag ─────
function ExplosionBurst() {
  const meshRef    = useRef()
  const startRef   = useRef(null)
  const coloredRef = useRef(false)
  const dummy      = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    // Set per-instance colors once on the first frame (instanceColor buffer)
    if (!coloredRef.current) {
      for (let i = 0; i < BURST_COUNT; i++)
        meshRef.current.setColorAt(i, BURST_DATA[i].color)
      meshRef.current.instanceColor.needsUpdate = true
      coloredRef.current = true
    }

    if (startRef.current === null) startRef.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - startRef.current
    const t       = Math.min(elapsed / BURST_DUR, 1)
    const decay   = Math.exp(-DRAG * elapsed)       // one exp() call per frame, reused below

    for (let i = 0; i < BURST_COUNT; i++) {
      const { vx, vy, size } = BURST_DATA[i]
      // pos(t) = v₀ · t · exp(−drag · t) — fast initial burst, decelerates via drag
      dummy.position.set(
        vx * elapsed * decay,
        vy * elapsed * decay,
        0
      )
      dummy.scale.setScalar(size * Math.max(2 - t * 2.5, 0.05))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    // Global opacity fade — all particles appear simultaneously so one value works
    meshRef.current.material.opacity = Math.max(1 - t * 1.4, 0)
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, BURST_COUNT]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  )
}

// ── Three.js: Camera shake — activates at collision, decays over 580 ms ───────
function CameraShakeEffect({ phaseRef }) {
  const shakeStartRef = useRef(null)
  const activeRef     = useRef(false)

  useFrame(({ camera }) => {
    const phase = phaseRef.current

    if (phase === 'collision') {
      if (!activeRef.current) {
        activeRef.current     = true
        shakeStartRef.current = performance.now()
      }
      const elapsed   = performance.now() - shakeStartRef.current
      const SHAKE_DUR = 580                            // ms — matches material fade-out
      const t         = Math.min(elapsed / SHAKE_DUR, 1)
      const amp       = 0.07 * (1 - t)                // world-units, decays to 0

      // Same dual-sine pattern as the existing mesh shake in useStarPositions
      camera.position.x =
        Math.sin(elapsed * 0.053) * amp + Math.sin(elapsed * 0.087) * amp * 0.45
      camera.position.y =
        Math.sin(elapsed * 0.046 + 1.1) * amp + Math.sin(elapsed * 0.074) * amp * 0.4
      camera.position.z = 6                           // z stays locked
    } else {
      if (activeRef.current) {
        // one-time reset back to canvas default
        camera.position.set(0, 0, 6)
        activeRef.current     = false
        shakeStartRef.current = null
      }
    }
  })

  return null
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
  const showBurst  = phase === 'collision' || phase === 'newstars'

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

      {/* Explosion burst — InstancedMesh radial particles */}
      {showBurst && <ExplosionBurst />}

      {/* Camera shake — fires during collision phase */}
      <CameraShakeEffect phaseRef={phaseRef} />
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

      {/* ── DOM overlay — text, labels, flash ── */}
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
