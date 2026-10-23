import { defineConfig, devices } from '@playwright/test';

const ADMIN_SPEC = /admin\.spec\.ts$/;

export default defineConfig({
  testDir: './e2e',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  webServer: [
    {
      command: 'npm run build && npm run preview -- --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
    },
    {
      // The administration scenarios need the development role switcher, so they run against the dev server. With
      // E2E_API=compose, /api is proxied to COGNIAWERKS_API_PROXY (default: the compose API on port 8080).
      command: 'npx vite --port 5174 --strictPort',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_BASE_URL: '',
        COGNIAWERKS_API_PROXY:
          process.env.E2E_API === 'compose' ? (process.env.COGNIAWERKS_API_PROXY ?? 'http://localhost:8080') : '',
      },
    },
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: ADMIN_SPEC },
    { name: 'tablet', use: { ...devices['Galaxy Tab S4'] }, testIgnore: ADMIN_SPEC },
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5174' },
      testMatch: ADMIN_SPEC,
    },
  ],
});
