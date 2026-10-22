import { defineConfig } from '@playwright/test'

const headed = process.env.HEADED === '1'

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  workers: headed ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:5173',
    headless: !headed,
    launchOptions: {
      slowMo: headed ? Number(process.env.SLOWMO ?? 50) : 0,
    },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
