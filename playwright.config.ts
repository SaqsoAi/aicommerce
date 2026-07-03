import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'PROJECT_AUDIT/playwright-report', open: 'never' }]
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  outputDir: 'PROJECT_AUDIT/playwright-results',

  projects: [
    {
      name: 'client-chromium-desktop',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' }
    },
    {
      name: 'client-firefox-desktop',
      use: { ...devices['Desktop Firefox'], baseURL: 'http://localhost:3000' }
    },
    {
      name: 'client-webkit-desktop',
      use: { ...devices['Desktop Safari'], baseURL: 'http://localhost:3000' }
    },
    {
      name: 'client-laptop',
      use: { browserName: 'chromium', viewport: { width: 1366, height: 768 }, baseURL: 'http://localhost:3000' }
    },
    {
      name: 'client-tablet',
      use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, baseURL: 'http://localhost:3000' }
    },
    {
      name: 'client-mobile',
      use: { ...devices['Pixel 7'], baseURL: 'http://localhost:3000' }
    },
    {
      name: 'admin-chromium-desktop',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3001' }
    },
    {
      name: 'admin-laptop',
      use: { browserName: 'chromium', viewport: { width: 1366, height: 768 }, baseURL: 'http://localhost:3001' }
    },
    {
      name: 'admin-tablet',
      use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, baseURL: 'http://localhost:3001' }
    },
    {
      name: 'admin-mobile',
      use: { ...devices['Pixel 7'], baseURL: 'http://localhost:3001' }
    }
  ]
});
