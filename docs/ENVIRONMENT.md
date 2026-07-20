# Environment & Konfigurasi — NextVWT

Semua konfigurasi runtime dibaca dari environment variables (Vite: `import.meta.env.VITE_*`).
File `.env` **tidak di-commit** (pastikan di `.gitignore`). Salin dari `.env.example`.

## Variabel Wajib

| Variabel | Contoh | Fungsi |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | URL project Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` | Anon/publishable key (aman di client) |

## Variabel Opsional

| Variabel | Contoh | Fungsi |
|---|---|---|
| `VITE_TURN_URL` | `turn:biznetgio.example.com:3478` | TURN server (wajib produksi — AUD-11) |
| `VITE_TURN_USERNAME` | `nextvwt` | Username TURN |
| `VITE_TURN_CREDENTIAL` | `[REDACTED]` | Kredensial TURN |
| `VITE_EXPECTED_SIGNING_HASH` | `8F:3A:...:9A:8B` | SHA-256 fingerprint APK release (lihat `SECURITY.md`) |
| `VITE_LIVEKIT_URL` | `ws://localhost:7880` | **(Rencana SFU)** Kosong = mesh, terisi = LiveKit SFU |

## Server-side / CI Secrets (JANGAN di client)

| Secret | Tempat | Fungsi |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard / Edge Function Secrets | Akses DB server-side (moderasi, role) |
| `LIVEKIT_API_KEY` | Supabase Edge Function Secret / VPS env | Generate LiveKit token |
| `LIVEKIT_API_SECRET` | Supabase Edge Function Secret / VPS env | Generate LiveKit token |

> LiveKit token HARUS di-generate di server (Edge Function), tidak di bundle ke client.

## Branding & Channel (kode, bukan env)

Diubah di `src/app/utils/config.ts` (`BRAND`, `CHANNELS`):
- `simulatedUserOffset` — set `0` di produksi (sudah otomatis `PROD ? 0 : 125`).
- `isolatedChannels` — channel yang tidak publish audio (default `[100]`).
- `defaultChannel`, `supabaseRoomPrefix`, `defaultTheme`.

## Catatan
- Di dev tanpa env Supabase, `getSupabase()` fallback ke placeholder agar UI bisa dicek
  (bukan koneksi nyata).
- `import.meta.env.PROD` digunakan untuk mematikan simulasi (`simulatedUserOffset`)
  dan mengaktifkan blocking security audit.
