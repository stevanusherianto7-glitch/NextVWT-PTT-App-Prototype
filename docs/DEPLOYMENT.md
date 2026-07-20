# Deployment — NextVWT

## 1. Prerequisites
- Node 18+, pnpm
- Akun Supabase (Auth + Realtime + DB)
- (Produksi) VPS untuk web + SFU (LiveKit)
- (Native) Android SDK + keystore release

## 2. Web (PWA)

```bash
pnpm install
cp .env.example .env          # isi VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
pnpm build                    # output dist/ + sw.js (PWA)
```

Hasil `dist/` adalah static site + PWA. Deploy ke:
- VPS (nginx/static server), atau
- Vercel/Netlify (jika tidak pakai VPS).

Pastikan header COOP/COEP jika butuh SharedArrayBuffer (tidak wajib untuk PTT dasar).

## 3. Supabase (Backend)

Jalankan migrasi:
```bash
supabase db push          # atau supabase migration up
```
Aktifkan Realtime pada tabel/channel yang dibutuhkan. Deploy edge functions:
```bash
supabase login                                   # OAuth (publishable key saja TIDAK cukup untuk deploy)
supabase functions deploy livekit-token          # mint LiveKit token (server-side)
supabase secrets set LIVEKIT_API_KEY=devkey LIVEKIT_API_SECRET=devsecret1234567890abcdefghijklmn
```
> `livekit-token` memanggil `supabase.functions.invoke('livekit-token', {body:{channel}})` dari klien.
> Tanpa deploy, app SFU mode tetap boot & graceful-fallback (token mint gagal → toast, mesh fallback).

## 4. Android (Capacitor)

```bash
pnpm build
npx cap sync android
npx cap open android      # build APK/AAB di Android Studio
```

`capacitor.config.ts`:
```ts
{ appId: 'com.nextvwt.ptt', appName: 'NextVWT', webDir: 'dist' }
```

### Signing (rilis)
1. `keytool -list -v -keystore release.keystore -alias nextvwt`
2. Simpan SHA-256 ke secret `VITE_EXPECTED_SIGNING_HASH` (lihat `SECURITY.md`).
3. Build release dengan keystore tersebut.

## 5. SFU (LiveKit) — Tahap Produksi

Arsitek memutuskan: **self-host di VPS** (region SG dekat Indonesia), bukan LiveKit Cloud
(gratis, kontrol cost di skala 5000 tenant).

### Dev lokal (docker-compose sudah disediakan)
```bash
# Jalankan LiveKit + NextVWT dev server dengan SFU AKTIF (VITE_LIVEKIT_URL ter-set)
bash scripts/dev-livekit.sh
# atau tanpa docker (asumsi LiveKit sudah jalan):
bash scripts/dev-livekit.sh --no-docker
```
File terkait:
- `docker-compose.livekit.yml` — service `livekit/livekit-server`, port 7880 (ws), 7881 (tcp rtc), 50000-60000 (udp rtc).
- `livekit/config.yaml` — dev key `devkey`/`devsecret...`, TURN off (localhost). **Ganti key di prod!**
- `.env.example` — `VITE_LIVEKIT_URL` + `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` (server-only).

### Produksi (VPS)
```bash
# Di VPS: jalankan livekit-server (compose sama, TURN enabled + domain + TLS)
docker compose -f docker-compose.livekit.yml up -d
```
Lalu:
- Set `VITE_LIVEKIT_URL=wss://<vps-domain>:7880` di env web (wss = TLS).
- `livekit/config.yaml`: `turn.enabled: true`, `domain: <vps-domain>`, sertifikat TLS.
- Supabase secret `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` = key produksi (bukan devkey).
- Token di-mint client via `supabase.functions.invoke('livekit-token')` (lihat `src/app/services/livekitToken.ts`).

> Penting: `LIVEKIT_API_SECRET` HANYA di server (Edge Function / VPS env). JANGAN di client bundle.

## 6. Verifikasi Pasca-Deploy
- `pnpm test` (unit) hijau.
- `pnpm test:e2e` (Playwright) hijau di URL deploy — cakup **2 origin**:
  - Origin 1 (Mesh): selalu jalan (`e2e/audio-topology.spec.ts` → "Origin 1 — Mesh").
  - Origin 2 (SFU): jalankan dengan `NEXTVWT_RUN_SFU_E2E=1 bash scripts/dev-livekit.sh`
    lalu `pnpm test:e2e` (project `chromium-sfu` aktif).
- Cek `adb logcat` untuk `[AppSecurity] Signing certificate verification passed`
  pada build Android rilis.
- Pastikan TURN terkonfigurasi (tes di jaringan seluler/NAT ketat).
