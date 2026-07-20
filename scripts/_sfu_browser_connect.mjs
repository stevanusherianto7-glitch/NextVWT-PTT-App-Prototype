// scripts/_sfu_browser_connect.mjs
// Bukti nyata SFU end-to-end: browser (Playwright chromium + fake media)
// connect ke LiveKit lokal ws://localhost:7880 pakai token dev (mint di node).
import { chromium } from 'playwright';
import { AccessToken } from 'livekit-server-sdk';
import { readFileSync } from 'node:fs';

const API_KEY = 'devkey';
const API_SECRET = 'devsecret1234567890abcdefghijklmn';
const URL = 'ws://localhost:7880';
const ROOM = 'ptt-room-1';

// 1) Mint token (server-side) di node
const at = new AccessToken(API_KEY, API_SECRET, { identity: 'browser-smoke', ttl: '2m' });
at.addGrant({ roomJoin: true, room: ROOM, canPublish: true, canSubscribe: true });
const token = await at.toJwt();
console.log('[browser-smoke] token len =', token.length);

// 2) Load livekit-client ESM, expose Room ke window lewat epilogue
const lkPath = 'node_modules/.pnpm/livekit-client@2.20.2_@types+dom-mediacapture-record@1.0.22/node_modules/livekit-client/dist/livekit-client.esm.mjs';
const lkSrc = readFileSync(lkPath, 'utf8') + '\nwindow.__LK = { Room, Track };\n';

const browser = await chromium.launch({
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[browser-smoke] PAGEERROR:', e.message));

await page.setContent('<!doctype html><html><body><h1>sfu-test</h1></body></html>');
await page.addScriptTag({ content: lkSrc, type: 'module' });

const result = await page.evaluate(
  async ({ url, token, room }) => {
    const LK = window.__LK;
    if (!LK || !LK.Room) return { ok: false, reason: 'LiveKit.Room not exposed' };
    const r = new LK.Room();
    let connected = false;
    r.on('connected', () => (connected = true));
    try {
      await r.connect(url, token, { autoSubscribe: true });
      await new Promise((res) => setTimeout(res, 2000));
      const participants = r.remoteParticipants.size + 1;
      const roomName = r.name;
      await r.disconnect();
      return { ok: connected, participants, roomName };
    } catch (e) {
      return { ok: false, reason: (e && e.message) || String(e) };
    }
  },
  { url: URL, token, room: ROOM }
);

console.log('[browser-smoke] RESULT =', JSON.stringify(result));
await browser.close();
process.exit(result && result.ok ? 0 : 1);
