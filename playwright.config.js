// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file:///${path.resolve(__dirname, 'Mysite1.html').replace(/\\/g, '/')}`;

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'tests.spec.js',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  timeout: 30000,

  use: {
    baseURL: FILE_URL,
    actionTimeout: 5000,
    screenshot: 'only-on-failure',
  },

  projects: [
    // --- DESKTOP ---
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 },
      },
    },

    // --- TABLET ---
    {
      name: 'iPad',
      use: {
        ...devices['iPad (gen 7)'],
      },
    },
    {
      name: 'iPad landscape',
      use: {
        ...devices['iPad (gen 7) landscape'],
      },
    },

    // --- MOBILE ---
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'Small Phone',
      use: {
        ...devices['iPhone SE'],
      },
    },
  ],
});
