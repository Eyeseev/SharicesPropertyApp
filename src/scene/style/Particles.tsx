'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vNear;
  void main() {
    vec3 p = position;
    // Slow drift: each bokeh disc wanders on its own small orbit.
    p.x += sin(uTime * 0.06 + aPhase * 6.28) * 4.0;
    p.y += sin(uTime * 0.045 + aPhase * 12.0) * 3.0;
    p.z += cos(uTime * 0.05 + aPhase * 9.0) * 4.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(aSize * uScale / -mv.z, 120.0);
    vColor = aColor;
    vNear = smoothstep(18.0, 45.0, -mv.z);
    vTwinkle = 0.75 + 0.25 * sin(uTime * 0.5 + aPhase * 20.0);
  }
`

/** Soft glassy disc with a slightly brighter rim, like out-of-focus lights. */
const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vNear;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float body = 1.0 - smoothstep(0.1, 1.0, d);
    float rim = smoothstep(0.55, 0.88, d) * (1.0 - smoothstep(0.88, 1.0, d));
    float a = (body * 0.13 + rim * 0.17) * vTwinkle * vNear;
    gl_FragColor = vec4(vColor * 1.9, a);
  }
`

const PALETTE = ['#ffbf55', '#ffbf55', '#ffd98a', '#4fb8ee', '#4fb8ee', '#f07aa8']

/**
 * Atmospheric bokeh (CREATIVE_DIRECTION §3.3): soft gold, cyan and occasional rose discs in a
 * background shell. They sit well behind the property and never cross it.
 */
export function Particles({ count }: { count: number }) {
  const { geometry, uniforms } = useMemo(() => {
    let seed = 1234567
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    const col = new Float32Array(count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      // Shell behind and around the lot, kept off the camera's close orbit space.
      // Biased low: the default camera looks down, so the visible background is the far ground.
      const az = rand() * Math.PI * 2
      const r = 30 + rand() * 85
      const y = 5 + Math.pow(rand(), 1.3) * 26
      pos.set([Math.cos(az) * r, y, Math.sin(az) * r], i * 3)
      size[i] = 3.5 + Math.pow(rand(), 2.4) * 11
      phase[i] = rand()
      c.set(PALETTE[Math.floor(rand() * PALETTE.length)]!)
      col.set([c.r, c.g, c.b], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400)
    return { geometry: g, uniforms: { uTime: { value: 0 }, uScale: { value: 520 } } }
  }, [count])
  const mat = useRef<THREE.ShaderMaterial>(null)
  useFrame((state, dt) => {
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime!.value += dt
    u.uScale!.value = state.size.height * 0.55
  })
  if (count === 0) return null
  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-5} raycast={() => null}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
        toneMapped={false}
      />
    </points>
  )
}
