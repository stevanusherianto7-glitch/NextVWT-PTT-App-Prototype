// scripts/_sfu_smoke.mjs — bukti nyata SFU lokal: mint token + connect Room.
// Jalankan: node scripts/_sfu_smoke.mjs
import { AccessToken } from 'livekit-server-sdk';
import { Room } from 'livekit-client';

const API_KEY = 'devkey';
const API_SECRET = 'devsecret1234567890abcdefghijklmn';
const URL = 'ws://localhost:7880';
const ROOM = 'ptt-room-1';

const at = new AccessToken(API_KEY, API_SECRET, { identity: 'smoke-test', ttl: '2m' });
at.addGrant({ roomJoin: true, room: ROOM, canPublish: true, canSubscribe: true });
const token = await at.toJwt();
console.log('[smoke] token minted, len =', token.length);

const room = new Room();
let connected = false;
room.on('connected', () => {
  connected = true;
  console.log('[smoke] CONNECTED to', room.name, '| participants =', room.remoteParticipants.size + 1);
});
room.on('disconnected', (reason) => console.log('[smoke] disconnected:', reason));

try {
  await room.connect(URL, token, { autoSubscribe: true });
  console.log('[smoke] connected, waiting 1.5s for presence...');
  await new Promise((r) => setTimeout(r, 1500));
  console.log('[smoke] RESULT connected =', connected);
  await room.disconnect();
  process.exit(connected ? 0 : 1);
} catch (e) {
  console.error('[smoke] ERROR', e);
  process.exit(2);
}
