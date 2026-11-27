import { expect, test, type Page } from '@playwright/test'
import { ALLOWED, openScene, testSignIn } from './helpers'

const tab = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Modes' }).getByRole('button', { name })

test.describe('private photo and data access', () => {
  test('unauthenticated photo requests are refused', async ({ request }) => {
    const res = await request.get('/api/photos/aerial-2024', { maxRedirects: 0 })
    expect(res.status()).toBe(401)
  })

  test('an allowlisted session gets stored photos only, by record id', async ({ page }) => {
    await testSignIn(page, ALLOWED)
    await page.waitForURL((u) => u.pathname === '/')
    const ok = await page.request.get('/api/photos/aerial-2024')
    expect(ok.status()).toBe(200)
    expect(ok.headers()['content-type']).toBe('image/png')
    expect(ok.headers()['cache-control']).toContain('no-store')
    expect((await page.request.get('/api/photos/tax-1980s')).headers()['content-type']).toBe(
      'image/jpeg',
    )
    // Link-only items, unknown ids and path tricks never read a file.
    for (const id of [
      'tax-1940s',
      'sv-2024-10',
      'nope',
      '..%2F..%2Fpackage.json',
      '%2Fetc%2Fpasswd',
    ]) {
      expect((await page.request.get(`/api/photos/${id}`)).status(), id).toBe(404)
    }
  })
})

test.describe('living database views', () => {
  test.beforeEach(async ({ page }) => {
    await openScene(page)
  })

  test('Financials keeps sales, DOF values, taxes and estimates apart and honest', async ({
    page,
  }) => {
    await tab(page, 'Financials').click()
    const panel = page.getByRole('complementary', { name: 'Financials' })
    await expect(panel).toBeVisible()
    await expect(page).toHaveURL(/mode=financials/)

    const market = panel.locator('[data-kind="dof_market_value"]')
    await expect(market).toContainText('$659,000')
    await expect(market).toContainText('Reported')
    await expect(market).toContainText('Not an appraisal')
    const sale = panel.locator('[data-kind="recorded_sale"]')
    await expect(sale).toContainText('$569,000')
    await expect(sale).toContainText('Verified')
    const tax = panel.locator('[data-kind="property_tax"]')
    await expect(tax).toContainText('$6,337')
    // $6,669 is the 2026/27 figure, never the current-year card.
    await expect(tax).not.toContainText('$6,669')
    await expect(panel).toContainText('2026/27 tax $6,669')
    await expect(panel).toContainText('Third-party estimates')
    await expect(panel).toContainText('Not sales and not the')

    // Source details popover names the real source.
    await panel.getByRole('button', { name: 'Source details for Recorded sale' }).click()
    await expect(
      page.getByRole('dialog', { name: 'Source details for Recorded sale' }),
    ).toContainText('ACRIS')
    await page.keyboard.press('Escape')

    // The chart plots every year, including the 2024/25 dip.
    await expect(panel.getByRole('img', { name: /2024\/25 \$613,000/ })).toBeVisible()

    await panel.getByRole('tab', { name: 'Assessments' }).click()
    await expect(panel.getByRole('row', { name: /2024\/25/ })).toContainText('$613,000')
    await panel
      .getByRole('button', { name: /Source details/ })
      .last()
      .click()
    await expect(panel).toContainText('labelled Reported until checked')
    await page.screenshot({ path: 'tests/e2e/__screenshots__/mode-financials.png' })
  })

  test('Chronicle is chronological, labels approximations and keeps the build-year conflict', async ({
    page,
  }) => {
    await tab(page, 'Chronicle').click()
    const panel = page.getByRole('complementary', { name: 'Chronicle' })
    const items = panel.getByRole('list', { name: 'All events' }).getByRole('button')
    await expect(items).toHaveCount(17)
    await expect(items.first()).toContainText('1924')

    await items.filter({ hasText: 'House built (city record)' }).click()
    const detail = panel.locator('.chron-detail')
    await expect(detail).toContainText('Open conflict: Year the house was built')
    await detail.getByRole('button', { name: /Source details/ }).click()
    const pop = page.getByRole('dialog', { name: /Source details for House built/ })
    await expect(pop).toContainText('1945 (PLUTO, PropertyShark, SKYDB)')
    await expect(pop).toContainText('1939–41 tax photo')
    await page.keyboard.press('Escape')

    // Approximate ranges are marked, and prev/next steps through events.
    await items.filter({ hasText: 'Black chain-link fence installed' }).click()
    await expect(detail).toContainText('Between Nov 2022 and Oct 2024')
    await panel.getByRole('button', { name: 'Next event' }).click()
    await expect(detail.locator('h3')).not.toHaveText('Black chain-link fence installed')
    await page.screenshot({ path: 'tests/e2e/__screenshots__/mode-chronicle.png' })
  })

  test('Photos: filters, empty state, enlargement, and link-only items never embedded', async ({
    page,
  }) => {
    await tab(page, 'Photos').click()
    const panel = page.getByRole('complementary', { name: 'Photo Archive' })
    await expect(panel.locator('.photo-card')).toHaveCount(19)
    await expect(panel).toContainText('Nearest to today: May 2026')

    // Link-only cards show a link, never an image (Street View and the 1940s photo).
    const sv = panel.locator('[data-photo="sv-2024-10"]')
    await expect(sv.locator('img')).toHaveCount(0)
    await expect(sv.getByRole('link', { name: /Reference link/ })).toHaveAttribute(
      'href',
      /google\.com\/maps/,
    )
    await expect(panel.locator('[data-photo="tax-1940s"] img')).toHaveCount(0)

    // A filter with no match shows the honest empty state, not a placeholder photo.
    await panel.getByLabel('Filter by date').selectOption('pre1960')
    await panel.getByLabel('Filter by viewpoint').selectOption('side_139th')
    await expect(panel.getByTestId('photo-empty')).toContainText('Photo not yet available')
    await panel.getByLabel('Filter by viewpoint').selectOption('all')
    await expect(panel.locator('.photo-card')).toHaveCount(3) // 1924, 1951, 1940s link

    // Enlarge a stored photo; Escape closes it.
    await panel.getByRole('button', { name: /Enlarge Aerial view, 1951/ }).click()
    const box = page.getByRole('dialog', { name: 'Aerial view, 1951' })
    await expect(box).toBeVisible()
    await expect(box.getByRole('img')).toBeVisible()
    await expect(box).toContainText('CC BY 4.0')
    await page.keyboard.press('Escape')
    await expect(box).toBeHidden()
    await page.screenshot({ path: 'tests/e2e/__screenshots__/mode-photos.png' })
  })

  test('Info drawer shows unknowns, disputed build year and open questions', async ({ page }) => {
    await page.getByRole('button', { name: 'Open property information' }).click()
    const drawer = page.getByRole('complementary', { name: 'Property information' })
    await expect(drawer.locator('[data-fact="renovations"]')).toContainText('Unknown')
    await expect(drawer.locator('[data-fact="year-built"]')).toContainText('1945')
    await expect(drawer.locator('[data-fact="beds-baths"]')).toContainText('Reported')
    await expect(drawer.locator('[data-fact="flood-zone"]')).toContainText('Verified')
    await expect(drawer).toContainText('Year the house was built')
    await drawer
      .getByRole('button', { name: 'Source details for Year built (city record)' })
      .click()
    await expect(page.getByRole('dialog', { name: /Source details for Year built/ })).toContainText(
      'Open conflict',
    )
  })

  test('Explorer stays a clean full-screen model; panels collapse; deep link works', async ({
    page,
  }) => {
    await expect(page.getByRole('complementary', { name: 'Financials' })).toHaveCount(0)
    await tab(page, 'Financials').click()
    const panel = page.getByRole('complementary', { name: 'Financials' })
    await panel.getByRole('button', { name: 'Collapse Financials' }).click()
    await expect(panel.getByRole('tab', { name: 'Overview' })).toHaveCount(0)
    await tab(page, 'Property Explorer').click()
    await expect(panel).toHaveCount(0)
    await expect(page).not.toHaveURL(/mode=/)
    await page.goto('/?mode=photos')
    await expect(page.getByRole('complementary', { name: 'Photo Archive' })).toBeVisible()
  })
})
