# Testing — NextVWT

## 1. Unit (Vitest)

```bash
pnpm test                 # jalankan semua (9 file, ~196 test)
pnpm test src/app/store/slices/createWebRTCSlice.test.ts   # file spesifik
```

Konfigurasi: `vitest.config.ts`. Environment: `jsdom` untuk store/hook, `node` untuk util.
Fokus coverage: permissions (`permissions.test.ts` 44 test), rateLimiter, useWebRTC,
channel 100 echo (15 test).

**Gate**: semua test harus hijau sebelum merge. Jangan sementara-disable.

## 2. E2E (Playwright)

```bash
pnpm test:e2e             # butuh server di :5188 (auto-start via webServer config)
```

- Config: `playwright.config.ts` (baseURL `localhost:5188`, Chromium fake media).
- Spec: `e2e/*.spec.ts` (app-boot, channel-scan, karaoke-ptt, ptt-safeguards, voice-streaming, ...).
- Screenshot hanya di-fail (`screenshot: 'only-on-failure'`).
- Untuk cek visual manual: `npx playwright test --project=chromium --headed`.

## 3. Lint & Type

```bash
pnpm lint                 # ESLint src/**/*.{ts,tsx}
pnpm type-check           # tsc --noEmit
```

Keduanya wajib **0 error** (warning boleh, tapi usahakan 0).

## 4. Alur Verifikasi Sebelum Merge

1. `pnpm lint` → 0 error
2. `pnpm type-check` → exit 0
3. `pnpm test` → semua hijau
4. `pnpm build` → exit 0
5. (jika ubah UI/audio) `pnpm test:e2e` → hijau + cek screenshot

## 5. Tips
- `useWebRTC.test.ts` mock peer connection; jangan butuh mic asli.
- Playwright pakai `--use-fake-device-for-media-stream` → tidak butuh mic fisik.
- Jika test flaky pada timing audio, naikkan `expect.timeout` di config, jangan `--force`.
