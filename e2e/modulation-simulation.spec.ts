/**
 * e2e/modulation-simulation.spec.ts
 * NextVWT – User Modulation Activity & Network Failure Simulation Tests
 */
import { test, expect } from '@playwright/test';

test.describe('User Modulation Activity Simulation', () => {
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
    await page.waitForSelector('button:has-text("PTT")', { timeout: 10_000 });
  });

  test('user can scan, change channel, and confirm selection', async ({ page }) => {
    // 1. Click SCAN button
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('input[placeholder="Cari channel..."]')).toBeVisible();

    // 2. Select KOPDAR NASIONAL UTAMA channel
    await page.locator('button').filter({ hasText: 'KOPDAR NASIONAL UTAMA' }).click();

    // 3. Confirm selection by clicking "Menuju Channel"
    await page.locator('button:has-text("Menuju Channel")').click();

    // 4. Modal should close and the channel should be loaded
    await expect(page.locator('input[placeholder="Cari channel..."]')).not.toBeVisible();
    await expect(page.locator('text=KOPDAR NASIONAL UTAMA')).toBeVisible({ timeout: 5_000 });
  });

  test('user can press-and-hold PTT to modulate voice transmission', async ({ page }) => {
    // 1. Open settings and turn off Toggle PTT (enable Hold-to-Talk mode)
    await page.click('button:has-text("Set")');
    await expect(page.locator('span:has-text("Pengaturan")').first()).toBeVisible();
    await page.click('label[for="toggle-togglePtt"]');
    await page.click('button:has-text("Simpan")');
    await expect(page.locator('span:has-text("Pengaturan")').first()).not.toBeVisible();

    const pttButton = page.locator('button:has-text("PTT")');
    const progressBar = page.locator('div.h-full.transition-all.duration-75').first();

    // 2. Initially standby (0% progress)
    await expect(progressBar).toHaveCSS('width', '0px');

    // 3. Simulate mouse down on PTT button
    await pttButton.hover();
    await page.mouse.down();
    await page.waitForTimeout(1000); // Wait for active modulation simulation

    // 4. Assert active modulation is happening (width is greater than 0)
    const activeWidth = await progressBar.evaluate((el) => el.style.width);
    expect(activeWidth).not.toBe('0%');
    expect(activeWidth).not.toBe('');

    // 5. Release mouse and return to standby
    await page.mouse.up();
    await page.waitForTimeout(500);
    await expect(progressBar).toHaveCSS('width', '0px');
  });

  test('user activity resilience under API/Network failure (Offline Robustness)', async ({ page }) => {
    // 1. Force the store state to offline (isConnected = false) via exposed window.__store__
    await page.evaluate(() => {
      const store = (window as unknown as { __store__?: { setState: (s: Record<string, unknown>) => void } }).__store__;
      if (store) store.setState({ isConnected: false });
    });

    // 2. Verify that the app is still functional and has "Offline" badge on LCD
    await expect(page.locator('text=Offline')).toBeVisible({ timeout: 5_000 });

    // 3. Go to settings, update info name, and save
    await page.click('button:has-text("Set")');
    await expect(page.locator('span:has-text("Pengaturan")').first()).toBeVisible();

    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill('Pebe Offline Test');
    await page.click('button:has-text("Simpan")');

    // 4. Verify the updated name is displayed on the LCD panel while offline
    await expect(page.locator('text=PEBE OFFLINE TEST')).toBeVisible();

    // 5. Restore network connection state in store
    await page.evaluate(() => {
      const store = (window as unknown as { __store__?: { setState: (s: Record<string, unknown>) => void } }).__store__;
      if (store) store.setState({ isConnected: true });
    });
  });
});
