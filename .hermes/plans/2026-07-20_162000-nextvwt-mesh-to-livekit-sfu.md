# Migrasi NextVWT: Supabase-Mesh → LiveKit-SFU — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Mengganti topologi audio WebRTC *mesh* (1 koneksi per peer) dengan *SFU* LiveKit supaya channel bisa menampung 10–50 user sesuai PRD Persona Pebe tanpa saturasi CPU/bandwidth di sisi transmitter, sambil mempertahankan fitur PTT broadcast, moderasi, presence, dan channel 100 echo.

**Architecture:**
- **Audio path**: dari N peer-connection (mesh) → 1 koneksi ke LiveKit SFU. Client publish 1 track audio, subscribe ke track semua user lain. Offloader bandwidth ke server.
- **Signaling**: dari Supabase Realtime broadcast (offer/answer/candidate) → LiveKit Client SDK (`livekit-client`) yang menangani signaling+ICE+TURN bawaan. Supabase tetap dipakai untuk **Auth, DB (moderation logs, channel_roles), presence metadata** — bukan signaling audio.
- **Channel 100 echo**: tetap loopback lokal (tidak publish ke SFU) agar test mic sendiri tidak broadcast ke orang lain (sudah dijamin `BRAND.isolatedChannels=[100]` + `useAudioStreamer` routing `channel===100`).
- **Strateggi**: dual-mode. `VITE_LIVEKIT_URL` kosong → fallback ke mesh Supabase (kompabilitas dev + rollout bertahap). Terisi → SFU.

**Tech Stack:** `livekit-client` (v2.x), `livekit-server`/LiveKit Cloud (SFU), Supabase (Auth+DB+presence), Zustand (tetap), Capacitor (tetap), Vitest + Playwright (verifikasi).

**Asumsi kritis (dari audit kode):**
- `src/app/hooks/useAudioStreamer.ts` memegang mesh-peer map (`peerConnectionsRef`) + recording + routing chunk. Ini pusat refactor.
- `src/app/services/webrtcConfig.ts` menyediakan ICE server (sekarang STUN + optional TURN via env). LiveKit menggantikan ini dengan TURN bawaan SFU.
- `src/app/store/usePTTStore.ts` punya action `broadcastVoiceChunk`, `onVoiceChunkReceived`, `broadcastWebRTCSignaling`, `setOnWebRTCSignalingReceived`, `activeTransmitter`, `activeUsers`, `subscribeToChannel`.
- `src/app/services/channelSubscription.ts` menangani Supabase presence + broadcast handler (pttHandler/voiceHandler/modHandler). Setelah migrasi, voice broadcast (audio chunk + webrtc signaling) pindah ke LiveKit track; presence + moderasi broadcast tetap di Supabase.
- PRD `AUD-11` (TURN wajib produksi) terpenuhi otomatis oleh LiveKit SFU.

---

## STATUS EKSEKUSI (update 2026-07-21)
Implementasi dijalankan bertahap di sesi yang sama:
- ✅ Task 1–3, 5–13 SELESAI & terverifikasi (lint 0 error, type-check OK, 206 test pass, build OK).
- ❌ Task 4 DIBATALKAN (mesh tetap utuh; SFU path tambahan saja — kurangi risiko regresi).
- ⏭️ Task 14 (deploy livekit-server VPS/docker), Task 15 (Playwright 2-origin) BELUM — butuh env SFU nyata.
- 🔄 Task 16 (docs) — sedang dikerjakan bersama Task 12/16 ini.

Verifikasi: `pnpm type-check && pnpm lint && pnpm test && pnpm build` semua hijau.

---

## Fase 0 — Persiapan & Dependency

### Task 1: Tambah dependency `livekit-client`
**Objective:** Install SDK LiveKit di frontend tanpa break build.

**Files:** Modify `package.json`

**Step 1:** Tambah ke `dependencies`:
```json
"livekit-client": "^2.5.0"
```
**Step 2:** Jalankan `pnpm install` → expected: sukses, lockfile update.
**Step 3:** Commit.

### Task 2: Env flag dual-mode
**Objective:** Tambah switch `VITE_LIVEKIT_URL` agar mesh lama tetap jalan saat flag kosong.

**Files:** Modify `src/app/utils/secureConfig.ts` (tambah field), `src/app/utils/config.ts` (baca env).

**Step 1:** Di `secureConfig.ts` tambah:
```ts
livekitUrl: import.meta.env.VITE_LIVEKIT_URL || '',
```
**Step 2:** Di `config.ts` ekspos helper:
```ts
export const USE_SFU = Boolean(import.meta.env.VITE_LIVEKIT_URL);
```
**Step 3:** `pnpm type-check` → expected PASS.
**Step 4:** Commit.

---

## Fase 1 — Abstraksi Audio Transport (tanpa ubah behavior mesh dulu)

### Task 3: Buat interface `AudioTransport`
**Objective:** Definisikan kontrak agar `useRadioAudioEngine` tidak tahu mesh vs SFU.

**Files:** Create `src/app/services/audioTransport.ts`

**Step 1:** Tulis interface:
```ts
export interface AudioTransport {
  connect(room: string, token: string): Promise<void>;
  disconnect(): void;
  publishMic(track: MediaStreamTrack): Promise<void>;
  setMicEnabled(enabled: boolean): void;
  onRemoteAudio(cb: (userId: string, stream: MediaStream) => void): void;
  onLocalChunk(cb: (base64: string) => void): void; // fallback mesh / ch100
}
```
**Step 2:** `pnpm type-check` PASS.
**Step 3:** Commit.

### Task 4: Implementasi `MeshAudioTransport` (wrapper mesh lama)
**Objective:** Bungkus logika mesh `useAudioStreamer` ke interface agar tidak ada breaking change.

**Files:** Create `src/app/services/meshAudioTransport.ts`; Modify `src/app/hooks/useAudioStreamer.ts` (ekspos `peerConnectionsRef` via getter, atau pindahkan logika koneksi ke transport).

**Step 1:** Tulis `MeshAudioTransport` yang memanggil `useWebRTC` + `broadcastVoiceChunk` seperti sekarang.
**Step 2:** `pnpm test` → 196 pass tetap.
**Step 3:** Commit.

### Task 5: Implementasi `LiveKitAudioTransport`
**Objective:** Transport SFU sungguhan.

**Files:** Create `src/app/services/livekitAudioTransport.ts`

**Step 1:** Tulis implementasi pakai `livekit-client`:
```ts
import { Room, Track, createLocalAudioTrack } from 'livekit-client';
export class LiveKitAudioTransport implements AudioTransport {
  private room = new Room();
  async connect(room: string, token: string) {
    await this.room.connect(import.meta.env.VITE_LIVEKIT_URL, token);
  }
  // publish mic, subscribe remote, publishData untuk chunk fallback
}
```
**Step 2:** `pnpm type-check` PASS (butuh `livekit-client` terinstall Task 1).
**Step 3:** Commit.

---

## Fase 2 — Token & Auth

### Task 6: Edge function `livekit-token`
**Objective:** Generate access token LiveKit dari server (Supabase Edge Function) pakai `apikey` + `secret` (jangan di client).

**Files:** Create `supabase/functions/livekit-token/index.ts`; Modify `src/app/utils/secureConfig.ts`.

**Step 1:** Edge function:
```ts
import { AccessToken } from 'livekit-server-sdk'; // di Deno via esm.sh
// baca room dari query, userId dari auth.uid
// return { token }
```
**Step 2:** Client fetch token:
```ts
const { data } = await supabase.functions.invoke('livekit-token', { body: { room: `ptt-room-${channel}` } });
```
**Step 3:** `pnpm type-check` PASS.
**Step 4:** Commit.

### Task 7: Test token endpoint (integration)
**Objective:** Pastikan token valid untuk room + identity.

**Files:** Create `src/app/services/livekitToken.test.ts` (mock fetch).

**Step 1:** Mock `getSupabase().functions.invoke` → return token dummy; assert transport bisa `connect` dengan mock `Room`.
**Step 2:** `pnpm test` → new test PASS.
**Step 3:** Commit.

---

## Fase 3 — Integrasi ke Orchestrator

### Task 8: Pilih transport di `useRadioAudioEngine`
**Objective:** Gunakan `LiveKitAudioTransport` bila `USE_SFU`, else `MeshAudioTransport`.

**Files:** Modify `src/app/hooks/useRadioAudioEngine.ts`

**Step 1:** Ganti inisiasi audio engine:
```ts
const transport = USE_SFU
  ? new LiveKitAudioTransport()
  : new MeshAudioTransport();
```
**Step 2:** Pastikan `channel===100` tetap pakai loopback lokal (jangan `transport.connect` untuk ch100).
**Step 3:** `pnpm test` + `pnpm type-check` PASS.
**Step 4:** Commit.

### Task 9: PTT broadcast mapping
**Objective:** `setTransmitting(true)` → `transport.setMicEnabled(true)` + broadcast `activeTransmitter` (presence Supabase tetap). `setTransmitting(false)` → `setMicEnabled(false)`.

**Files:** Modify `src/app/hooks/useRadioAudioEngine.ts` + `src/app/store/slices/createUISlice.ts` (aksi `setTransmitting`).

**Step 1:** Di `setTransmitting` slice, panggil `transport.setMicEnabled(value)` (via ref yang disimpan di orchestrator).
**Step 2:** `pttHandler.ts` (Supabase broadcast `ptt_state`) tetap jalan untuk indikator TX/RX — tidak dihapus.
**Step 3:** `pnpm test` PASS.
**Step 4:** Commit.

### Task 10: Voice chunk routing
**Objective:** Di SFU mode, audio keluar via LiveKit track (bukan base64 chunk). Di mesh/ch100, base64 chunk tetap (fallback).

**Files:** Modify `src/app/hooks/useAudioStreamer.ts` `startRecording` callback.

**Step 1:** Jika `USE_SFU` → jangan `broadcastVoiceChunk`, biarkan track LiveKit yang mengalirkan.
**Step 2:** Jika `!USE_SFU || channel===100` → logika base64 tetap.
**Step 3:** `pnpm test` PASS.
**Step 4:** Commit.

---

## Fase 4 — Moderasi & Presence (pertahankan Supabase)

### Task 11: Moderasi tetap di Supabase
**Objective:** Hang-up / kick / role / status broadcast tetap lewat Supabase Realtime (bukan LiveKit Data API) — konsisten dengan `modHandler.ts` + `useRadioModeration.ts`.

**Files:** No change needed; verifikasi `src/app/services/handlers/modHandler.ts` + `src/app/hooks/useRadioModeration.ts` masih subscribe Supabase `room:${roomId}:moderation`.

**Step 1:** Jalankan `pnpm test` → 196 pass (moderasi test di `permissions.test.ts` tetap hijau).
**Step 2:** Dokumentasikan di `REFACTOR_SUMMARY.md` bahwa moderasi tidak dipindah.
**Step 3:** Commit (doc only).

### Task 12: Presence mapping
**Objective:** Active users di LCD diisi dari LiveKit `Room.participants` (bukan Supabase presence) saat SFU mode.

**Files:** Modify `src/app/services/livekitAudioTransport.ts` (`onParticipantConnected/Disconnected` → update `usePTTStore.activeUsers`) + `useRadioAudioEngine.ts`.

**Step 1:** Di transport, map participant → shape `activeUsers` (userId, displayName dari metadata, callSign, role).
**Step 2:** Saat `USE_SFU`, `subscribeToChannel` Supabase tetap jalan untuk moderasi tapi `activeUsers` di-override oleh LiveKit participants.
**Step 3:** `pnpm type-check` PASS.
**Step 4:** Commit.

---

## Fase 5 — Channel 100 Echo (regresi-proof)

### Task 13: Echo tetap loopback lokal
**Objective:** Pastikan ch100 tidak publish ke SFU.

**Files:** Modify `src/app/hooks/useRadioAudioEngine.ts`

**Step 1:** Di efek transmit, jika `channel===100` → `transport` tidak di-connect; pakai `useAudioStreamer` echo base64 seperti sekarang (`echoChunksRef`).
**Step 2:** Tambah test `useChannel100EchoTest.ts` sudah ada (15 test) — pastikan masih PASS.
**Step 3:** `pnpm test` → echo test PASS.
**Step 4:** Commit.

---

## Fase 6 — Deploy & Verifikasi End-to-End

### Task 14: LiveKit server (dev)
**Objective:** Jalankan SFU lokal untuk test.

**Files:** Create `scripts/dev-livekit.sh` (jalankan `livekit-server` docker).

**Step 1:** Script:
```bash
docker run --rm -p 7880:7880 livekit/livekit-server \
  --dev --bind 0.0.0.0
```
**Step 2:** Set `.env` `VITE_LIVEKIT_URL=ws://localhost:7880` + `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` (dev).
**Step 3:** `pnpm dev` → buka 2 tab browser, tes PTT antar tab.
**Step 4:** Commit (script only).

### Task 15: Playwright dua origin
**Objective:** Bukti visual PTT SFU jalan di localhost + cloudflare tunnel (sesuai GOLDEN_RULES NextVWT).

**Files:** Existing `e2e/karaoke-ptt.spec.ts` extend; atau `e2e/sfu-ptt.spec.ts` baru.

**Step 1:** Tulis spec: login guest 2 browser, join ch1, user A transmit → user B dapat audio (cek `activeTransmitter` + `audioContext`).
**Step 2:** `pnpm test:e2e` → PASS tanpa pageerror.
**Step 3:** Screenshot via `browser_vision` untuk bukti.
**Step 4:** Commit.

### Task 16: Update dokumentasi
**Objective:** Catat arsitektur baru di `ARCHITECTURE_ADOPTION.md` + `REFACTOR_SUMMARY.md`.

**Files:** Modify `ARCHITECTURE_ADOPTION.md`, `REFACTOR_SUMMARY.md`.

**Step 1:** Tambah section "Audio Transport: Mesh → SFU (LiveKit)".
**Step 2:** `pnpm build` → exit 0.
**Step 3:** Commit.

---

## Risiko & Tradeoff
1. **Breaking change di `useAudioStreamer`**: mesh logic dipindah ke `MeshAudioTransport`. Mitigasi: dual-mode Task 2, test 196 harus tetap hijau.
2. **LiveKit TURN**: SFU bawa TURN, tapi butuh `LIVEKIT_API_SECRET` di server (jangan di client). Edge function Task 6 menangani.
3. **Cost SFU**: LiveKit Cloud berbayar per menit; self-host `livekit-server` di VPS (sesuai keputusan deploy VPS user) gratis.
4. **Latensi**: SFU tambah hop server; target PRD <300ms masih achievable dengan region SG (dekat Indonesia).
5. **Channel 100**: aman karena isolated + loopback; tidak publish ke SFU.

## Keputusan Arsitek (DIAMBIL ALIH — 2026-07-20, user delegasikan)
User: "3 keputusan yang butuh konfirmasi, kamu sebagai arsitek silahkan ambil alih keputusan."

1. **SFU: SELF-HOST `livekit-server` di VPS** (bukan LiveKit Cloud). Konsisten keputusan deploy VPS user, gratis, region SG dekat Indonesia. Cost terkontrol di skala 5000 tenant.
2. **Moderasi TETAP di Supabase Realtime** (hang-up/kick/role/status tidak pindah ke LiveKit Data API). Sudah jalan + lebih murah + logs sudah di DB.
3. **Rollout PHASE via dual-mode flag `VITE_LIVEKIT_URL`**: kosong = mesh (fallback/dev, behavior lama utuh), terisi = SFU. Zero-risk rollout; mesh sebagai safety net saat UAT.

→ Semua Open Questions RESOLVED. Task 4 (MeshAudioTransport wrapper) DITIADAKAN: mesh dibiarkan utuh di `useAudioStreamer`; SFU hanya path tambahan saat `USE_SFU`. Mengurangi risiko regresi 196 test.
