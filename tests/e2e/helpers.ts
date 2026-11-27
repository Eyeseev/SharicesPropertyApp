import { expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'

export const ALLOWED = 'allowed@example.test'
export const INTRUDER = 'intruder@example.test'
const FT = 0.3048

export async function testSignIn(page: Page, email: string) {
  await page.goto('/signin')
  await page.getByPlaceholder('allowed account email').fill(email)
  await page.getByRole('button', { name: 'Test sign-in' }).click()
}

export async function openScene(page: Page) {
  await testSignIn(page, ALLOWED)
  await page.waitForURL((u) => u.pathname === '/')
  await page.waitForFunction(() => {
    const s = (window as unknown as { __propertyScene?: { ids: () => string[] } }).__propertyScene
    return !!s && s.ids().length === 11
  })
  await waitSettled(page)
}

export async function waitSettled(page: Page) {
  // Allow the transition to start, then wait for the camera to stop.
  await page.waitForTimeout(300)
  await page.waitForFunction(
    () =>
      (
        window as unknown as { __propertyScene: { state: () => { cameraMoving: boolean } } }
      ).__propertyScene.state().cameraMoving === false,
  )
  await page.waitForTimeout(400)
}

type Preset = { id: string; position: [number, number, number]; target: [number, number, number] }
export const PRESETS: Preset[] = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'app-data/real/cameras.json'), 'utf8'),
).presets

/** Expected scene-space (metres) camera position and target for a preset. */
export function expectedScene(p: Preset) {
  const [s0, t, h] = p.position
  const s = p.id === 'top' ? s0 + 0.5 : s0
  return {
    position: [t * FT, h * FT, s * FT],
    target: [p.target[1] * FT, p.target[2] * FT, p.target[0] * FT],
  }
}

export async function cameraState(page: Page) {
  return page.evaluate(() =>
    (
      window as unknown as {
        __propertyScene: { camera: () => { position: number[]; target: number[] } }
      }
    ).__propertyScene.camera(),
  )
}

export function expectNear(actual: number[], expected: number[], tol = 0.25) {
  actual.forEach((v, i) => expect(Math.abs(v - (expected[i] as number))).toBeLessThan(tol))
}
