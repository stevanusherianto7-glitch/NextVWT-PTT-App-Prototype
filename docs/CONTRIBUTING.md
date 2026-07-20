# Contributing — NextVWT

## Konvensi Kode
- **Bahasa**: komentar & doc bebas (ID/EN), pesan commit & PR **Indonesia**.
- **Format**: Prettier + ESLint (`pnpm lint` wajib 0 error).
- **Type**: TypeScript strict (`pnpm type-check`). Hindari `any` di file baru.
- **State**: pakai Zustand slice, jangan tambah Context global tanpa diskusi.

## Struktur
- Logika audio → `src/app/hooks/` + `src/app/services/`.
- UI → `src/app/components/`.
- Moderasi/role → `src/features/moderation/`.
- Konfigurasi branding/channel → `src/app/utils/config.ts` (single source of truth).

## Aturan Keamanan (PENTING)
- **JANGAN** ambil role/izin dari `displayName`/`callSign` client-side. Role HARUS dari
  tabel `channel_roles` Supabase (`useChannelRole`). `getGlobalRole()` sudah dihapus
  sebagai contoh lubang keamanan — jangan dikembalikan.
- **JANGAN** commit `.env`, keystore, atau secret apa pun.
- Token LiveKit (SFU) di-generate di server, tidak di bundle client.

## Alur Kerja
1. Buat branch fitur: `feat/nama-fitur` atau `fix/nama-bug`.
2. Tulis/perbarui test (Vitest) untuk logika baru.
3. Jalankan gate: `pnpm lint && pnpm type-check && pnpm test && pnpm build`.
4. Untuk UI/audio: jalankan `pnpm test:e2e` + cek screenshot.
5. PR dengan deskripsi berisi **bukti** (output test/lint/build, bukan narasi).
6. Review: pastikan tidak ada secret bocor & role tetap server-authoritative.

## Refactor
- God-component (>400 baris) pecah ke sub-komponen/hook.
- Duplikasi sound/utility → ekstrak ke `utils/` (lihat `radioSound.ts`).
- Simulasi/demo (mis. `simulatedUserOffset`) wajib dinonaktifkan di `PROD`.

## Pesan Commit
Format: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
Contoh: `feat: tambah LiveKitAudioTransport dengan dual-mode flag`
