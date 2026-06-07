/**
 * e2e/karaoke-ptt.spec.ts
 * NextVWT – Karaoke Mode PTT Resilience E2E Tests
 */
import { test, expect } from '@playwright/test';

test.describe('PTT Resilience in Karaoke / Music Mode', () => {
  test('should open Karaoke Player and modulate PTT voice streaming with built-in Echo without crashing', async ({
    browser,
  }) => {
    // 1. Setup browser context with microphone permission
    const context = await browser.newContext({ permissions: ['microphone'] });
    const page = await context.newPage();

    // Listen to console and page error events to detect any unhandled crash or warnings
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => {
      console.error('PAGE ERROR DETECTED:', err);
      pageErrors.push(err);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('PAGE CONSOLE ERROR:', msg.text());
      }
    });

    // 2. Load the application and bypass auth using Guest mode
    await page.goto('/');
    const guestBtn = page.locator('button:has-text("Masuk sebagai Tamu")');
    await guestBtn.waitFor({ state: 'visible', timeout: 5000 });
    await guestBtn.click();

    // 3. Open Settings Panel
    const setBtn = page.locator('button:has-text("Set")');
    await setBtn.waitFor({ state: 'visible', timeout: 5000 });
    await setBtn.click();

    // Verify Settings Panel is open
    await expect(page.locator('div:has-text("Pengaturan")').first()).toBeVisible();

    // 4. In settings, make sure Audio Mode is "Musik" (Music Mode) and Built-in Echo is active
    // Let's verify or toggle them if needed. By default, audioMode is 'music' in store.
    // Let's check the state in store
    const storeState = await page.evaluate(() => (window as any).__store__.getState());
    expect(storeState.audioMode).toBe('music');
    expect(storeState.builtInEcho).toBe(true);

    // Set channel to a normal non-isolated channel (Channel 16) to allow network broadcasting to be tested
    await page.evaluate(() => (window as any).__store__.getState().setChannelNumber(16));

    // 5. Click "Buka Pemutar Karaoke" button to open the player
    const openKaraokeBtn = page.locator('button:has-text("Buka Pemutar Karaoke")');
    await openKaraokeBtn.waitFor({ state: 'visible', timeout: 3000 });
    await openKaraokeBtn.click();

    // Verify button toggles to "Tutup Pemutar Karaoke"
    await expect(page.locator('button:has-text("Tutup Pemutar Karaoke")')).toBeVisible();

    // Close settings panel to return to main device layout where Karaoke Player is rendered
    const simpanBtn = page.locator('button:has-text("Simpan")');
    await simpanBtn.waitFor({ state: 'visible', timeout: 3000 });
    await simpanBtn.click();

    // Verify Karaoke Player container is open and visible on screen
    await expect(page.locator('span:has-text("NextVWT Karaoke Player")')).toBeVisible();

    // 6. Mock getUserMedia to supply a synthetic Web Audio stream for CI environment compatibility
    await page.evaluate(() => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const dest = ctx.createMediaStreamDestination();
      const osc = ctx.createOscillator();
      osc.connect(dest);
      osc.start();

      navigator.mediaDevices.getUserMedia = async () => {
        return dest.stream;
      };
    });

    // 7. Setup Spy on broadcastVoiceChunk to collect base64 audio packets
    await page.evaluate(() => {
      (window as any).recordedVoiceChunks = [];
      const store = (window as any).__store__;
      const originalBroadcast = store.getState().broadcastVoiceChunk;
      store.getState().broadcastVoiceChunk = (base64: string) => {
        (window as any).recordedVoiceChunks.push(base64);
        originalBroadcast(base64);
      };
    });

    // 8. Trigger PTT Transmission (Simulate user speaking/singing)
    await page.evaluate(() => {
      const store = (window as any).__store__;
      store.getState().setTransmitting(true);
    });

    // Wait for 2 seconds to allow the Web Audio feedback delay loop (Echo) to process
    // and package chunks of voice data.
    await page.waitForTimeout(2000);

    // 9. Stop PTT Transmission
    await page.evaluate(() => {
      const store = (window as any).__store__;
      store.getState().setTransmitting(false);
    });

    await page.waitForTimeout(500);

    // 10. Assertions & Resilience Checks
    // Ensure no unhandled runtime page errors occurred during the entire cycle
    expect(pageErrors.length).toBe(0);

    // Ensure audio chunks were successfully captured, proving the microphone capture,
    // software echo loop, and broadcasting mechanisms executed smoothly.
    const chunksCount = await page.evaluate(() => (window as any).recordedVoiceChunks.length);
    expect(chunksCount).toBeGreaterThan(0);

    const firstChunk = await page.evaluate(() => (window as any).recordedVoiceChunks[0]);
    expect(firstChunk).not.toBeNull();
    expect(firstChunk).toMatch(/^[A-Za-z0-9+/=]+$/); // Should be valid Base64 string

    // Close the browser context cleanly
    await context.close();
  });
});
