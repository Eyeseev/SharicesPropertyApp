import { defineConfig, devices } from '@playwright/test'

const PORT = 3101
const BASE = `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
  ],
  webServer: {
    command: `next dev -p ${PORT}`,
    url: `${BASE}/signin`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      AUTH_TEST_MODE: '1',
      AUTH_SECRET: 'e2e-only-not-a-secret',
      NEXTAUTH_URL: BASE,
      ALLOWED_EMAILS: 'allowed@example.test,second@example.test',
    },
  },
})
