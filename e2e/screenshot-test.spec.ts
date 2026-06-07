import { test, expect } from '@playwright/test';
import * as path from 'path';

test('capture channel list screenshots', async ({ page }) => {
  await page.goto('/');

  // Bypass LoginGate if visible
  const guestBtn = page.locator('button:has-text("Masuk sebagai Tamu")');
  const pttBtn = page.locator('button:has-text("PTT")');
  await Promise.race([
    guestBtn.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
    pttBtn.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
  ]);
  if (await guestBtn.isVisible()) {
    await guestBtn.click();
  }

  // Click SCAN button to open modal
  await page.waitForSelector('button:has-text("SCAN")', { timeout: 10000 });
  await page.click('button:has-text("SCAN")');

  // Wait for the modal content to load
  await page.waitForSelector('input[placeholder="Cari channel..."]', { timeout: 5000 });

  // Screenshot 1: Initial load
  const artifactPath1 = path.join('C:', 'Users', 'ASUS', '.gemini', 'antigravity', 'brain', 'bb715ef8-1294-49e3-acb5-a46867e72022', 'screenshot_initial.png');
  await page.screenshot({ path: artifactPath1, fullPage: true });

  // Locate the list scroll container and scroll down to the bottom
  const scrollContainer = page.locator('.overflow-y-auto');
  await expect(scrollContainer).toBeVisible();
  
  // Scroll to the bottom
  await scrollContainer.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  
  // Wait a small bit for any visual settles
  await page.waitForTimeout(500);

  // Screenshot 2: Scrolled to the bottom
  const artifactPath2 = path.join('C:', 'Users', 'ASUS', '.gemini', 'antigravity', 'brain', 'bb715ef8-1294-49e3-acb5-a46867e72022', 'screenshot_scrolled.png');
  await page.screenshot({ path: artifactPath2, fullPage: true });
  
  console.log('Screenshots saved successfully!');
});
