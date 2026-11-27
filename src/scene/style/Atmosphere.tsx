'use client'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualitySettings } from './quality'
import { windTime } from './vegetation'

/** Fog and horizon share one colour so the ground melts into the sky at distance. */
export const HORIZON = '#15233d'

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const skyFragment = /* glsl */ `
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -0.2, 1.0);
    vec3 horizon = vec3(0.082, 0.137, 0.239);
    vec3 zenith = vec3(0.020, 0.043, 0.100);
    vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.7, h));
    // A faint warm glow low on the horizon: the miniature sits in a lit city night.
    col += vec3(0.10, 0.065, 0.02) * smoothstep(0.25, 0.0, abs(h)) * 0.55;
    // Colours above are authored as sRGB; the pipeline expects linear.
    gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
  }
`

/** Gradient night sky dome (drawn first, ignores fog and depth). */
export function Sky() {
  return (
    <mesh renderOrder={-10} raycast={() => null}>
      <sphereGeometry args={[520, 32, 16]} />
      <shaderMaterial
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}

/** Cool moonlight with shadows, a low blue fill, and a soft cyan rim from behind. */
export function Lights({ q }: { q: QualitySettings }) {
  useFrame((_, dt) => {
    windTime.value += dt
  })
  return (
    <>
      <hemisphereLight args={['#9fb4e0', '#26325a', 1.25]} />
      <directionalLight
        position={[-25, 40, -18]}
        intensity={2.5}
        color="#cfdcf7"
        castShadow={q.shadows}
        shadow-mapSize={[q.shadowMap, q.shadowMap]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[30, 14, 40]} intensity={0.55} color="#4aa8d8" />
    </>
  )
}
