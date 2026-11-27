import type { GeometryElement } from '@/data/schema'

/** Typed accessors for element params. Throw loudly on a missing value (no silent constants). */
export function num(el: GeometryElement, key: string): number {
  const v = el.params[key]?.value
  if (typeof v !== 'number') throw new Error(`${el.id}: param "${key}" must be a number`)
  return v
}

export function str(el: GeometryElement, key: string): string {
  const v = el.params[key]?.value
  if (typeof v !== 'string') throw new Error(`${el.id}: param "${key}" must be a string`)
  return v
}

export function list(el: GeometryElement, key: string): number[] {
  const v = el.params[key]?.value
  if (!Array.isArray(v)) throw new Error(`${el.id}: param "${key}" must be a number list`)
  return v
}

export function bool(el: GeometryElement, key: string, fallback = false): boolean {
  const v = el.params[key]?.value
  return typeof v === 'boolean' ? v : fallback
}

export function byId(elements: GeometryElement[], id: string): GeometryElement {
  const el = elements.find((e) => e.id === id)
  if (!el) throw new Error(`geometry element "${id}" missing`)
  return el
}
