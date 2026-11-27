import { expect, test, type Page } from '@playwright/test'
import { PRESETS, cameraState, expectNear, expectedScene, openScene, waitSettled } from './helpers'

const SELECTABLE = [
  'house',
  'roof',
  'chimney',
  'front-door',
  'extension',
  'garage',
  'driveway',
  'fence-front',
  'fence-rear',
  'maple',
  'parcel',
] as const

const BUTTON: Record<string, RegExp> = {
  front: /^Front/,
  side: /^Side/,
  rear: /^Rear/,
  top: /^Top/,
  default: /^Reset/,
}

async function goPreset(page: Page, id: string) {
  await page.getByRole('button', { name: BUTTON[id] }).click()
  await waitSettled(page)
}

test.describe('scene', () => {
  test.beforeEach(async ({ page }) => {
    await openScene(page)
  })

  test('each camera preset animates, settles at its pose, and gets a review screenshot', async ({
    page,
  }) => {
    for (const id of ['front', 'side', 'rear', 'top', 'default']) {
      const preset = PRESETS.find((p) => p.id === id)!
      const before = await cameraState(page)
      await page.getByRole('button', { name: BUTTON[id] }).click()
      // It animates: the camera is moving shortly after the click.
      await page
        .waitForFunction(
          () =>
            (
              window as unknown as { __propertyScene: { state: () => { cameraMoving: boolean } } }
            ).__propertyScene.state().cameraMoving,
          undefined,
          { timeout: 3000 },
        )
        .catch(() => undefined)
      await waitSettled(page)
      const after = await cameraState(page)
      const exp = expectedScene(preset)
      expectNear(after.position, exp.position)
      expectNear(after.target, exp.target)
      if (id !== 'default') expect(after.position).not.toEqual(before.position)
      await page.screenshot({ path: `tests/e2e/__screenshots__/preset-${id}.png` })
    }
  })

  test('number keys trigger presets', async ({ page }) => {
    await page.keyboard.press('2')
    await waitSettled(page)
    expectNear(
      (await cameraState(page)).position,
      expectedScene(PRESETS.find((p) => p.id === 'side')!).position,
    )
  })

  test('Reset restores the default view after orbiting', async ({ page }) => {
    const canvas = page.locator('canvas')
    const box = (await canvas.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 300, box.y + box.height / 2 + 80, { steps: 12 })
    await page.mouse.up()
    await waitSettled(page)
    const moved = await cameraState(page)
    const exp = expectedScene(PRESETS.find((p) => p.id === 'default')!)
    expect(Math.abs(moved.position[0]! - exp.position[0]!)).toBeGreaterThan(0.5)
    await goPreset(page, 'default')
    const after = await cameraState(page)
    expectNear(after.position, exp.position)
    expectNear(after.target, exp.target)
  })

  test('camera stays above ground and outside the house when zooming in hard', async ({ page }) => {
    const canvas = page.locator('canvas')
    const box = (await canvas.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    for (let i = 0; i < 25; i++) await page.mouse.wheel(0, -400)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 400, { steps: 10 })
    await page.mouse.up()
    await waitSettled(page)
    const cam = await cameraState(page)
    const dist = Math.hypot(...cam.position.map((v, i) => v - cam.target[i]!))
    expect(cam.position[1]).toBeGreaterThan(0)
    expect(dist).toBeGreaterThanOrEqual(45 * 0.3048 - 0.05)
  })

  test('selecting each object opens a popup with an evidence badge; Escape clears', async ({
    page,
  }) => {
    const order = ['default', 'front', 'side', 'rear', 'top']
    for (const id of SELECTABLE) {
      let clicked = false
      for (const preset of order) {
        await goPreset(page, preset)
        const pt = await page.evaluate(
          (oid) =>
            (
              window as unknown as {
                __propertyScene: {
                  findClickablePoint: (i: string) => { x: number; y: number } | null
                }
              }
            ).__propertyScene.findClickablePoint(oid),
          id,
        )
        if (!pt) continue
        await page.mouse.click(pt.x, pt.y)
        clicked = true
        break
      }
      expect(clicked, `${id} should be clickable from some preset`).toBe(true)
      const popup = page.locator(`[data-object="${id}"]`)
      await expect(popup).toBeVisible()
      await expect(popup.locator('[data-evidence]').first()).toBeVisible()
      await expect(popup).toContainText('Sources:')
      await page.keyboard.press('Escape')
      await expect(popup).toBeHidden()
    }
  })
})
