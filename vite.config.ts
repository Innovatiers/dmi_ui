/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Dev server only: forwards /api to this API (for example the compose stack), so the UI calls it same-origin. */
const apiProxy = process.env.COGNIAWERKS_API_PROXY;

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: apiProxy ? { '/api': apiProxy } : undefined },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.ts'],
  },
});
