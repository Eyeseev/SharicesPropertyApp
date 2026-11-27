'use client'

import { createContext, useContext } from 'react'
import type { PropertyData } from '@/data/loader'

const Ctx = createContext<PropertyData | null>(null)
export const DataProvider = Ctx.Provider

export function useData(): PropertyData {
  const d = useContext(Ctx)
  if (!d) throw new Error('useData must be used inside <DataProvider>')
  return d
}
