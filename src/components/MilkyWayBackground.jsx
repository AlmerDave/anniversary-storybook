import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// MilkyWayBackground — shared particle starfield
//
// Props:
//   opacity      (0–1)    — target max opacity; default 0.88 (full Ch2), 0.22 (Ch3 backdrop)
//   animateIn    (bool)   — if true, particles fly in from origin over 4.5s; default true
//   style        (object) — extra CSS on the wrapper div
// ─────────────────────────────────────────────────────────────────────────────

const MW_COUNT  = 2000
const MW_FINAL  = new Float32Array(MW_COUNT * 3)
const MW_COLORS = new Float32Array(MW_COUNT * 3)
const MW_SEEDS  = new Float32Array(MW_COUNT)
const MW_FREQS  = new Float32Array(MW_COUNT)
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
    if (p < 4)      { MW_COLORS[i*3]=0.788; MW_COLORS[i*3+1]=0.659; MW_COLORS[i*3+2]=0.298 }
    else if (p < 7) { MW_COLORS[i*3]=0.482; MW_COLORS[i*3+1]=0.310; MW_COLORS[i*3+2]=0.749 }
    else            { MW_COLORS[i*3]=0.784; MW_COLORS[i*3+1]=0.784; MW_COLORS[i*3+2]=1.000 }
    MW_SEEDS[i] = Math.random() * Math.PI * 2
    MW_FREQS[i] = 0.5 + Math.random() * 2.0
    const sr = Math.random()
    MW_SIZES[i] = sr < 0.70 ? 1.5 + Math.random() * 1.0
                : sr < 0.90 ? 3.0 + Math.random() * 2.0
                :             6.0 + Math.random() * 3.0
  }
})()

const MW_VERT = /* glsl */`
  attribute vec3  color;
  attribute float aSeed;
  attribute float aFreq;
  attribute float aSize;

  uniform float uDPR;

  varying vec3  vColor;
  varying float vSeed;
  varying float vFreq;

  void main() {
    vColor = color;
    vSeed  = aSeed;
    vFreq  = aFreq;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uDPR;
    gl_Position  = projectionMatrix * mvPosition;
  }
`

const MW_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uOpacity;

  varying vec3  vColor;
  varying float vSeed;
  varying float vFreq;

  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    float glow    = smoothstep(0.5, 0.0, dist);
    float twinkle = 0.65 + 0.35 * sin(uTime * vFreq + vSeed);
    gl_FragColor = vec4(vColor * 1.5, glow * twinkle * uOpacity);
  }
`

const easeOutCubic = t => 1 - Math.pow(1 - t, 3)

function MilkyWayPoints({ targetOpacity, animateIn }) {
  const pointsRef    = useRef()
  const matRef       = useRef()
  const startTimeRef = useRef(null)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MW_COUNT * 3), 3))
    g.setAttribute('color',    new THREE.BufferAttribute(MW_COLORS.slice(), 3))
    g.setAttribute('aSeed',    new THREE.BufferAttribute(MW_SEEDS.slice(), 1))
    g.setAttribute('aFreq',    new THREE.BufferAttribute(MW_FREQS.slice(), 1))
    g.setAttribute('aSize',    new THREE.BufferAttribute(MW_SIZES.slice(), 1))
    return g
  }, [])

  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uOpacity: { value: 0 },
    uDPR:     { value: Math.min(window.devicePixelRatio || 1, 3) },
  }), [])

  // If not animating in, pre-fill positions immediately
  useEffect(() => {
    if (!animateIn && pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position
      for (let i = 0; i < MW_COUNT; i++) {
        pos.array[i * 3]     = MW_FINAL[i * 3]
        pos.array[i * 3 + 1] = MW_FINAL[i * 3 + 1]
        pos.array[i * 3 + 2] = MW_FINAL[i * 3 + 2]
      }
      pos.needsUpdate = true
    }
  }, [animateIn])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !matRef.current) return
    if (startTimeRef.current === null) startTimeRef.current = clock.elapsedTime

    const elapsed = clock.elapsedTime - startTimeRef.current
    const t = animateIn ? Math.min(elapsed / 4.5, 1) : 1

    matRef.current.uniforms.uTime.value    = clock.elapsedTime
    matRef.current.uniforms.uOpacity.value = animateIn
      ? Math.min(t * 2.2, targetOpacity)
      : targetOpacity * Math.min(elapsed / 1.5, 1)  // gentle fade-in for backdrop

    if (animateIn && t < 1) {
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

export default function MilkyWayBackground({
  opacity    = 0.88,
  animateIn  = true,
  style      = {},
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0, ...style }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ alpha: true, antialias: false }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <MilkyWayPoints targetOpacity={opacity} animateIn={animateIn} />
      </Canvas>
    </div>
  )
}
