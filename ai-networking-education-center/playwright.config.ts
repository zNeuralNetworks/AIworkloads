import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'vite --port 3001',
    url: 'http://localhost:3001',
    // Reuse local dev server when present; CI still starts a fresh server.
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
