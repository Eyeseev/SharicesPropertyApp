'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import type { QualitySettings } from './quality'

/**
 * Post chain (TECHNICAL_ARCHITECTURE §5): selective bloom (HDR emissives only), tone mapping,
 * vignette, SMAA. The simple tier skips the composer and lets the renderer tone-map directly.
 */
export function Effects({ q }: { q: QualitySettings }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    // With a composer the ToneMapping effect does the work; without it the renderer must.
    // Renderer settings are plain three.js state, not React state.
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMapping = q.composer ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.05
  }, [gl, q.composer])
  if (!q.composer) return null
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={q.bloom}
        luminanceThreshold={1}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.72}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
      {q.smaa ? <SMAA /> : <></>}
    </EffectComposer>
  )
}
