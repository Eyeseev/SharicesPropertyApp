import { expect, test } from '@playwright/test'
import { ALLOWED, INTRUDER, testSignIn } from './helpers'

test('unauthenticated page request redirects to sign-in', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/signin/)
})

test('unauthenticated /api/data returns 401', async ({ request }) => {
  const res = await request.get('/api/data', { maxRedirects: 0 })
  expect(res.status()).toBe(401)
})

test('responses carry noindex and robots.txt disallows all', async ({ request }) => {
  const res = await request.get('/signin')
  expect(res.headers()['x-robots-tag']).toContain('noindex')
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toMatch(/Disallow: \//)
})

test('a non-allowlisted test user is rejected', async ({ page }) => {
  await testSignIn(page, INTRUDER)
  await expect(page).toHaveURL(/\/signin\?error=AccessDenied/)
  await expect(page.locator('.signin-error')).toContainText('not on the access list')
  await page.goto('/')
  await expect(page).toHaveURL(/\/signin/)
  const api = await page.request.get('/api/data')
  expect(api.status()).toBe(401)
})

test('an allowlisted test user loads the scene and the data API', async ({ page }) => {
  await testSignIn(page, ALLOWED)
  await page.waitForURL((u) => u.pathname === '/')
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: /Front/ })).toBeVisible()
  const api = await page.request.get('/api/data')
  expect(api.status()).toBe(200)
  const data = await api.json()
  expect(data.geometry.elements.length).toBeGreaterThan(10)
  expect(JSON.stringify(data)).not.toContain('fixture-7f3a-do-not-ship')
})
