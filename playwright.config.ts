// playwright.config.ts – NextVWT E2E Test Configuration
// Menggunakan dotenv untuk memuat .env lokal sesuai Golden Rule #7

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env dari root project (sesuai user rules: wajib terhubung dotenv)
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  // ─── Test discovery ────────────────────────────────────────────────────────
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  // ─── Global settings ───────────────────────────────────────────────────────
  timeout: 30_000,               // 30s per test
  expect: { timeout: 8_000 },   // 8s per assertion
  fullyParallel: false,          // Serial untuk konsistensi UI tests
  retries: process.env.CI ? 2 : 0,
  workers: 1,                    // Single worker untuk stabilitas

  // ─── Reporter ──────────────────────────────────────────────────────────────
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // ─── Global use ────────────────────────────────────────────────────────────
  use: {
    baseURL: 'http://localhost:5174',

    // Screenshots & Traces untuk debugging CI failures (sesuai user rules)
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',

    // Viewport: Desktop 1280x800 (sesuai user rules untuk E2E)
    viewport: { width: 1280, height: 800 },

    // Locale Indonesia untuk konsistensi teks
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  },

  // ─── Projects (browsers) ───────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
    },
  ],

  // ─── Web server: auto-start Vite dev server sebelum tests ─────────────────
  webServer: {
    command: 'pnpm dev --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    timeout: 30_000,
  },

  // ─── Output directories ────────────────────────────────────────────────────
  outputDir: 'test-results/',
});
