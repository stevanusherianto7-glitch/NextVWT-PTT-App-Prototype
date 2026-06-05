/**
 * e2e/channel-scan.spec.ts
 * NextVWT – Channel List Modal (SCAN Button) Flow Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Channel Scan Flow', () => {
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
    await page.waitForSelector('button:has-text("SCAN")', { timeout: 10_000 });
  });

  test('clicking SCAN opens the Daftar Channel modal', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('input[placeholder="Cari channel..."]')).toBeVisible({ timeout: 5_000 });
  });

  test('modal shows a search input placeholder "Cari channel..."', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    const searchInput = page.locator('input[placeholder="Cari channel..."]');
    await expect(searchInput).toBeVisible();
  });

  test('modal lists channel entries with number badges', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('text=DUKUNGAN & BANTUAN')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=KOPDAR NASIONAL UTAMA')).toBeVisible();
  });

  test('search input filters channels dynamically', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    const searchInput = page.locator('input[placeholder="Cari channel..."]');
    await searchInput.fill('KOPDAR');
    await expect(page.locator('text=KOPDAR NASIONAL UTAMA')).toBeVisible();
    await expect(page.locator('text=DUKUNGAN & BANTUAN')).not.toBeVisible();
  });

  test('searching for non-existent channel shows "Tidak ada channel ditemukan"', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    const searchInput = page.locator('input[placeholder="Cari channel..."]');
    await searchInput.fill('XXXXXXXXXXX');
    await expect(page.locator('text=Tidak ada channel ditemukan')).toBeVisible();
  });

  test('selecting a channel closes the modal', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await page.locator('button').filter({ hasText: 'KOPDAR NASIONAL UTAMA' }).click();
    // Click 'Menuju Channel' in the private channel dialog options
    await page.locator('button:has-text("Menuju Channel")').click();
    await expect(page.locator('input[placeholder="Cari channel..."]')).not.toBeVisible({ timeout: 5_000 });
  });

  test('closing modal with X button removes it from view', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('input[placeholder="Cari channel..."]')).toBeVisible({ timeout: 5_000 });

    // Click the X button in the header of the modal
    const closeBtn = page.locator('button[aria-label="Tutup"]');
    await closeBtn.click();

    await expect(page.locator('input[placeholder="Cari channel..."]')).not.toBeVisible({ timeout: 5_000 });
  });

  test('backdrop click on modal closes it', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('input[placeholder="Cari channel..."]')).toBeVisible({ timeout: 5_000 });

    // Click the backdrop
    const backdrop = page.getByTestId('modal-backdrop');
    await backdrop.click({ position: { x: 10, y: 10 } });

    await expect(page.locator('input[placeholder="Cari channel..."]')).not.toBeVisible({ timeout: 5_000 });
  });
});
