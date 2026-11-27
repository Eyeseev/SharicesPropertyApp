import { create } from 'zustand'
import type { SelectableId } from '@/data/schema'

export type PresetId = 'default' | 'front' | 'side' | 'rear' | 'top'
export type QualityTier = 'showcase' | 'balanced' | 'simple'

type AppState = {
  selectedId: SelectableId | null
  hoveredId: SelectableId | null
  /** Incremented on every preset request so repeating the same preset re-animates. */
  presetRequest: { id: PresetId; n: number }
  cameraMoving: boolean
  quality: QualityTier
  select: (id: SelectableId | null) => void
  hover: (id: SelectableId | null) => void
  goTo: (id: PresetId) => void
  setCameraMoving: (v: boolean) => void
  setQuality: (q: QualityTier) => void
}

export const useApp = create<AppState>((set) => ({
  selectedId: null,
  hoveredId: null,
  presetRequest: { id: 'default', n: 0 },
  cameraMoving: false,
  quality: 'showcase',
  select: (selectedId) => set({ selectedId }),
  hover: (hoveredId) => set({ hoveredId }),
  goTo: (id) => set((s) => ({ presetRequest: { id, n: s.presetRequest.n + 1 } })),
  setCameraMoving: (cameraMoving) => set({ cameraMoving }),
  setQuality: (quality) => set({ quality }),
}))
