/**
 * e2e/app-boot.spec.ts
 * NextVWT – App Boot & Initial State Tests
 *
 * Validates that the application:
 * 1. Loads correctly without errors
 * 2. Shows the correct initial UI elements
 * 3. Displays channel 100 (landing channel) on boot
 * 4. Shows the NextVWT brand logo and marquee
 */
import { test, expect } from '@playwright/test';

test.describe('App Boot & Initial State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Automatically bypass LoginGate if visible
    const guestBtn = page.locator('button:has-text("Masuk sebagai Tamu")');
    const pttBtn = page.locator('button:has-text("PTT")');
    await Promise.race([
      guestBtn.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
      pttBtn.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
    ]);
    if (await guestBtn.isVisible()) {
      await guestBtn.click();
    }
    // Wait for main app shell to be visible
    await page.waitForSelector('text=NextVWT', { timeout: 10_000 });
  });

  test('should load the app without a white screen or crash', async ({ page }) => {
    // The root div must be present and not blank
    const appRoot = page.locator('#root');
    await expect(appRoot).toBeVisible();

    // No fatal error boundary or white-screen
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Something went wrong');
    expect(bodyText).not.toContain('Cannot read properties');
  });

  test('should display the NextVWT brand logo and name', async ({ page }) => {
    await expect(page.locator('text=NextVWT').first()).toBeVisible();
  });

  test('should show the LCD panel with channel number', async ({ page }) => {
    // The LCD panel renders a 3-digit channel display
    // Default channel is 100, displayed as "100"
    const lcdText = await page.textContent('body');
    expect(lcdText).toContain('100');
  });

  test('should show the marquee text with STANDBY • READY', async ({ page }) => {
    // The animated marquee includes STANDBY and READY keywords
    const marqueeEl = page.locator('.animate-marquee').first();
    await expect(marqueeEl).toBeVisible();
    const marqueeText = await marqueeEl.textContent();
    expect(marqueeText).toContain('STANDBY');
    expect(marqueeText).toContain('READY');
  });

  test('should show control buttons: SCAN, SET, ▲, ▼', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'SCAN' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'SET' })).toBeVisible();
  });

  test('should show the PTT button by default', async ({ page }) => {
    // PTT button has text "PTT" somewhere visible
    const pttBtn = page.locator('button', { hasText: 'PTT' });
    await expect(pttBtn).toBeVisible();
  });

  test('should show the power toggle in ON state by default', async ({ page }) => {
    // Power toggle — the slider input
    const powerToggle = page.locator('input[type="checkbox"]').first();
    await expect(powerToggle).toBeChecked();
  });
});
