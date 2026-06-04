/**
 * e2e/channel-scan.spec.ts
 * NextVWT – Channel List Modal (SCAN Button) Flow Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Channel Scan Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("SCAN")', { timeout: 10_000 });
  });

  test('clicking SCAN opens the Daftar Channel modal', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('text=Daftar Channel')).toBeVisible({ timeout: 5_000 });
  });

  test('modal shows a search input placeholder "Cari channel..."', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    const searchInput = page.locator('input[placeholder="Cari channel..."]');
    await expect(searchInput).toBeVisible();
  });

  test('modal lists channel entries with number badges', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('text=CH-DARURAT')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=KOPDAR NASIONAL UTAMA')).toBeVisible();
  });

  test('search input filters channels dynamically', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    const searchInput = page.locator('input[placeholder="Cari channel..."]');
    await searchInput.fill('SAR');
    await expect(page.locator('text=CH-DARURAT / SAR INFO')).toBeVisible();
    await expect(page.locator('text=KOPDAR NASIONAL UTAMA')).not.toBeVisible();
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
    await expect(page.locator('text=Daftar Channel')).not.toBeVisible({ timeout: 5_000 });
  });

  test('closing modal with X button removes it from view', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('text=Daftar Channel')).toBeVisible({ timeout: 5_000 });

    // The X close button is inside the modal header — use aria or the SVG line pattern
    // It's the only button in the header row next to "Daftar Channel" text
    const modalHeader = page.locator('div.bg-white').filter({ hasText: 'Daftar Channel' }).first();
    const closeBtn = modalHeader.locator('button').last();
    await closeBtn.click();

    await expect(page.locator('text=Daftar Channel')).not.toBeVisible({ timeout: 5_000 });
  });

  test('backdrop click on modal closes it', async ({ page }) => {
    await page.click('button:has-text("SCAN")');
    await expect(page.locator('text=Daftar Channel')).toBeVisible({ timeout: 5_000 });

    // The backdrop is a div.absolute.inset-0 layered behind the modal card
    // Click the semi-transparent overlay directly
    const backdrop = page.locator('div.absolute.inset-0').first();
    await backdrop.click({ force: true });

    await expect(page.locator('text=Daftar Channel')).not.toBeVisible({ timeout: 5_000 });
  });
});
