import { create } from 'zustand'
import type { SelectableId } from '@/data/schema'

export type PresetId = 'default' | 'front' | 'side' | 'rear' | 'top'
export type Mode = 'explorer' | 'financials' | 'chronicle' | 'photos'
export const MODES: Mode[] = ['explorer', 'financials', 'chronicle', 'photos']
export type QualityTier = 'showcase' | 'balanced' | 'simple'

const QUALITY_KEY = 'property-quality-tier'
const TIERS: QualityTier[] = ['showcase', 'balanced', 'simple']

/** Remembered choice if any, else a device guess: phones get Simple, modest desktops Balanced. */
export function initialQuality(): QualityTier {
  try {
    const saved = window.localStorage.getItem(QUALITY_KEY) as QualityTier | null
    if (saved && TIERS.includes(saved)) return saved
  } catch {
    // Storage can be blocked; fall through to the device guess.
  }
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  if (coarse || window.innerWidth < 800) return 'simple'
  if ((navigator.hardwareConcurrency ?? 8) <= 4) return 'balanced'
  return 'showcase'
}

type AppState = {
  selectedId: SelectableId | null
  hoveredId: SelectableId | null
  /** Incremented on every preset request so repeating the same preset re-animates. */
  presetRequest: { id: PresetId; n: number }
  cameraMoving: boolean
  quality: QualityTier
  /** One primary data layer at a time (PRD). Explorer = clean full-screen model. */
  mode: Mode
  panelOpen: boolean
  infoOpen: boolean
  chronicleId: string | null
  /** Photo record id shown enlarged, or null. */
  lightboxId: string | null
  select: (id: SelectableId | null) => void
  hover: (id: SelectableId | null) => void
  goTo: (id: PresetId) => void
  setCameraMoving: (v: boolean) => void
  setQuality: (q: QualityTier) => void
  setMode: (m: Mode) => void
  setPanelOpen: (open: boolean) => void
  setInfoOpen: (open: boolean) => void
  setChronicleId: (id: string | null) => void
  setLightbox: (id: string | null) => void
}

export const useApp = create<AppState>((set) => ({
  selectedId: null,
  hoveredId: null,
  presetRequest: { id: 'default', n: 0 },
  cameraMoving: false,
  quality: 'showcase',
  mode: 'explorer',
  panelOpen: true,
  infoOpen: false,
  chronicleId: null,
  lightboxId: null,
  select: (selectedId) => set({ selectedId }),
  hover: (hoveredId) => set({ hoveredId }),
  goTo: (id) => set((s) => ({ presetRequest: { id, n: s.presetRequest.n + 1 } })),
  setCameraMoving: (cameraMoving) => set({ cameraMoving }),
  setQuality: (quality) => {
    try {
      window.localStorage.setItem(QUALITY_KEY, quality)
    } catch {
      // Not remembered this time; the tier still applies.
    }
    set({ quality })
  },
  setMode: (mode) => set({ mode, panelOpen: true, lightboxId: null }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setInfoOpen: (infoOpen) => set({ infoOpen }),
  setChronicleId: (chronicleId) => set({ chronicleId }),
  setLightbox: (lightboxId) => set({ lightboxId }),
}))
