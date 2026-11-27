'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { ft } from '@/data/frame'
import type { QualitySettings } from './quality'

const GROUND_Y = -ft(0.62)

const vertex = /* glsl */ `
  varying vec2 vXZ;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vXZ = w.xz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

/**
 * Fine cyan/gold circuit lines on the dark ground: an anti-aliased street grid with blocks,
 * brighter nodes at crossings, travelling light pulses and a distance fade (CREATIVE_DIRECTION §3.2).
 * Pure decoration: this is an abstract grid, not a map of the neighbourhood.
 */
const fragment = /* glsl */ `
  varying vec2 vXZ;
  uniform float uTime;
  uniform float uIntensity;

  float line(float coord, float period, float width) {
    float c = coord / period;
    float d = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    return 1.0 - smoothstep(width - 0.5, width + 0.5, d);
  }
  float pulse(float coord, float period, float speed, float seed) {
    float p = fract(coord / (period * 6.0) - uTime * speed + seed);
    return smoothstep(0.0, 0.02, p) * (1.0 - smoothstep(0.02, 0.07, p));
  }

  void main() {
    vec2 p = vXZ;
    float dist = length(p);
    float fade = exp(-dist / 120.0);

    float minor = max(line(p.x, 12.0, 0.7), line(p.y, 12.0, 0.7));
    float major = max(line(p.x, 48.0, 1.1), line(p.y, 48.0, 1.1));
    // Nodes where two major lines cross.
    vec2 cell = abs(fract(p / 48.0 - 0.5) - 0.5) * 48.0;
    float node = 1.0 - smoothstep(0.35, 0.9, length(cell));

    float zx = pulse(p.y, 48.0, 0.35, 0.17) * line(p.x, 48.0, 1.4);
    float zy = pulse(p.x, 48.0, 0.28, 0.61) * line(p.y, 48.0, 1.4);

    vec3 cyan = vec3(0.16, 0.62, 0.86);
    vec3 gold = vec3(1.0, 0.76, 0.34);
    vec3 col = cyan * minor * 0.22 + cyan * major * 0.55 + gold * (node * 1.2 + (zx + zy) * 1.6);
    float a = (minor * 0.22 + major * 0.55 + node + (zx + zy)) * fade * uIntensity;
    gl_FragColor = vec4(col * fade * uIntensity, clamp(a, 0.0, 1.0));
  }
`

export function GridGround({ q }: { q: QualitySettings }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: 1 } }), [])
  const mat = useRef<THREE.ShaderMaterial>(null)
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime!.value += dt
  })
  return (
    <>
      {/* Dark glossy base; reflective on the Showcase tier only. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]} receiveShadow>
        <planeGeometry args={[520, 520]} />
        {q.reflector ? (
          <MeshReflectorMaterial
            color="#0d1a33"
            mirror={0.55}
            blur={[420, 120]}
            mixBlur={1.2}
            mixStrength={1.5}
            resolution={512}
            roughness={0.55}
            metalness={0.2}
            depthScale={0.8}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
          />
        ) : (
          <meshStandardMaterial color="#0e1a33" roughness={0.6} metalness={0.15} />
        )}
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, GROUND_Y + 0.004, 0]}
        renderOrder={1}
        raycast={() => null}
      >
        <planeGeometry args={[520, 520]} />
        <shaderMaterial
          ref={mat}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  )
}
