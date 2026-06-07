# NextVWT PTT App - Analisis Menyeluruh, Super Prompt & PRD

> **Tanggal:** 7 Juni 2026
> **Versi Proyek:** 0.0.1 (Prototype Phase)
> **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Supabase + WebRTC + Capacitor Android 8
> **Skor Kesiapan Produksi:** 65 / 100

---

## Daftar Isi

1. [Analisis Menyeluruh & Audit Mendalam](#1-analisis-menyeluruh--audit-mendalam)
2. [Temuan Kritis](#2-temuan-kritis)
3. [Temuan Tinggi](#3-temuan-tinggi)
4. [Kekuatan & Hal yang Sudah Baik](#4-kekuatan--hal-yang-sudah-baik)
5. [Rekomendasi Strategis & Roadmap](#5-rekomendasi-strategis--roadmap)
6. [Super Prompt untuk AI Assistant](#6-super-prompt-untuk-ai-assistant)
7. [Product Requirements Document (PRD)](#7-product-requirements-document-prd)

---

## 1. Analisis Menyeluruh & Audit Mendalam

### 1.1 Gambaran Arsitektur

```
Pengguna -> LoginGate -> Supabase Auth (Google OAuth / Guest)
                   |
              RadioLayout
                   |
       usePTTStore (Zustand)
       |-- Supabase Realtime Channel (presence, ptt_state broadcast)
       |-- WebRTC Signaling (via Supabase broadcast)
       +-- useAudioStreamer
           |-- MediaRecorder (mic capture)
           |-- VAD (Voice Activity Detection)
           |-- RTCPeerConnection (audio streaming)
           +-- AudioContext (playback + echo + karaoke)
```

### 1.2 Struktur Proyek

```
nextvwt-ptt-app-prototype/
├── src/
│   ├── app/
│   │   ├── components/        # 15 UI components utama
│   │   │   └── ui/            # 50+ shadcn/Radix UI components
│   │   ├── hooks/
│   │   │   └── useAudioStreamer.ts   # WebRTC + VAD + MediaRecorder (400+ baris)
│   │   ├── store/
│   │   │   ├── usePTTStore.ts        # Zustand global state + Supabase subscription
│   │   │   └── usePTTStore.test.ts   # Unit tests (20+ test cases)
│   │   └── utils/
│   │       ├── config.ts      # Konfigurasi brand, channel, audio (white-label)
│   │       ├── constants.ts   # Channel list re-export
│   │       └── supabase.ts    # Supabase client init
│   ├── styles/                # CSS themes (8 tema: classic, v1-v6, monokrom)
│   └── main.tsx
├── android/                   # Capacitor Android wrapper
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       └── res/xml/network_security_config.xml
├── e2e/                       # 11 Playwright E2E specs
├── capacitor.config.ts
└── package.json
```

### 1.3 Ringkasan Skor Per Dimensi

| Dimensi | Skor | Catatan |
|---|---|---|
| **Keamanan** | 40/100 | Credential bocor, izin Android hilang |
| **Arsitektur** | 75/100 | Solid, perlu refactor monolith |
| **Kualitas Kode** | 70/100 | TypeScript cukup ketat, beberapa any |
| **Testing** | 80/100 | Unit + E2E baik |
| **UX & Audio** | 85/100 | Detail audio sangat baik |
| **Kesiapan Mobile** | 50/100 | Manifest tidak lengkap, belum iOS |
| **Skalabilitas** | 55/100 | Data statis, tidak ada TURN, tidak ada rate limit |
| **Dokumentasi** | 70/100 | Design spec ada, API docs kurang |

**Skor Keseluruhan: 65 / 100**

---

## 2. Temuan Kritis

### 🔴 KRITIS-01: Credential Bocor ke Git History

**File:** `.env` | **Dampak:** Sangat Tinggi

File `.env` ter-commit ke repositori dan berisi kredensial nyata:

```dotenv
VITE_SUPABASE_URL=https://tqixjycrxhjmpyffhxvg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable__uPRzhQpHd6coAx9TISEGQ_k65Ai_eP
VITE_GOOGLE_CLIENT_ID=573176982412-r3r5bao0piov4tnhcsnkvjpooft0avmo.apps.googleusercontent.com
```

**Risiko:** Penyerang bisa mengakses Supabase Realtime channel langsung, brute-force enumeration, dan penyalahgunaan Google OAuth Client ID untuk phishing.

**FIX:**

```bash
# 1. Rotasi SEMUA credential sekarang di dashboard masing-masing
# 2. Hapus .env dari git history menggunakan BFG Repo Cleaner:
java -jar bfg.jar --delete-files .env repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force

# 3. Pastikan .gitignore diterapkan:
git rm --cached .env
git commit -m "chore: remove .env from tracking"
```

---

### 🔴 KRITIS-02: Izin Android Kritis Hilang di Manifest

**File:** `android/app/src/main/AndroidManifest.xml` | **Dampak:** Tinggi

Hanya ada satu permission: `android.permission.INTERNET`. Permission yang **wajib ada** namun hilang:

| Permission | Dibutuhkan untuk |
|---|---|
| `RECORD_AUDIO` | Akses mikrofon — fitur inti PTT |
| `VIBRATE` | Haptic feedback saat PTT |
| `MODIFY_AUDIO_SETTINGS` | Kontrol audio mode di Android |
| `FOREGROUND_SERVICE` | Transmisi audio saat app di background |

**FIX:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-feature android:name="android.hardware.microphone" android:required="true" />
    <application ...>
```

---

### 🔴 KRITIS-03: Logika `isDummyKey` Memalsukan Status Koneksi

**File:** `src/app/store/usePTTStore.ts` (baris ~7–11) | **Dampak:** Tinggi

```typescript
// Kode bermasalah saat ini:
const isDummyKey =
  !supabaseKey ||
  supabaseKey.startsWith('sb_publishable_') ||  // ← key ASLI juga memenuhi kondisi ini!
  supabaseKey.includes('placeholder') ||
  supabaseKey === '';

if (isDummyKey) {
  usePTTStore.setState({ isConnected: true }); // ← BERBAHAYA
}
```

Prefix `sb_publishable_` adalah format key **asli** Supabase yang baru. Bahkan dengan key nyata, `isDummyKey` akan bernilai `true` dan otomatis menyetel `isConnected = true` tanpa koneksi backend yang sesungguhnya.

**FIX:**

```typescript
const isDummyKey =
  !supabaseKey ||
  supabaseKey === 'your-supabase-key' ||
  supabaseKey.includes('placeholder') ||
  supabaseKey.length < 20;

// HAPUS blok auto-set isConnected:
// if (isDummyKey) { usePTTStore.setState({ isConnected: true }); }
```

---

### 🔴 KRITIS-04: Guest Login dengan Identitas Hardcoded Global

**File:** `src/app/App.tsx` (baris ~55–67) | **Dampak:** Sedang-Tinggi

```typescript
onGuestLogin={() => {
  setUser({
    id: 'guest-session-id',       // ← SAMA untuk semua tamu
    email: 'guest@nextvwt.local', // ← SAMA untuk semua tamu
    user_metadata: {
      full_name: infoText || 'Pebe Herianto',  // ← nama pribadi hardcoded
    },
    // ...
  } as User);
}}
```

Semua pengguna tamu memiliki `userId = 'guest-session-id'` yang identik → konflik di Supabase Presence, pesan PTT yang salah atribusi.

**FIX:**

```typescript
onGuestLogin={() => {
  const guestId = `guest-${crypto.randomUUID()}`;
  setUser({
    id: guestId,
    email: `${guestId}@guest.nextvwt.local`,
    user_metadata: {
      full_name: `Tamu ${guestId.slice(-4).toUpperCase()}`,
    },
    app_metadata: { provider: 'guest' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User);
}}
```

---

## 3. Temuan Tinggi

### 🟡 TINGGI-01: Tidak Ada TURN Server — WebRTC Gagal di Banyak Jaringan

**File:** `src/app/hooks/useAudioStreamer.ts` (baris ~27–29)

```typescript
const RTC_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],  // STUN saja
};
```

Di belakang NAT simetris (umum pada jaringan seluler Indonesia — Telkomsel, XL, Indosat), WebRTC P2P akan **gagal total** tanpa TURN server.

**FIX:**

```typescript
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    },
  ],
};
```

Opsi TURN server: Twilio Network Traversal Service, Coturn self-hosted (gratis), atau Metered.ca (free tier).

---

### 🟡 TINGGI-02: Konflik Dependensi — MUI + Radix Sekaligus

**File:** `package.json`

Dua sistem UI besar yang saling tumpang tindih:
- **MUI:** `@mui/material@7.3.5` + `@mui/icons-material@7.3.5` + `@emotion/react` + `@emotion/styled` — total ~400KB gzip — **TIDAK DIGUNAKAN**
- **Radix UI + shadcn:** 30+ paket `@radix-ui/*` — total ~150KB gzip — **AKTIF DIGUNAKAN**

**FIX:**

```bash
pnpm remove @mui/material @mui/icons-material @emotion/react @emotion/styled @popperjs/core
```

---

### 🟡 TINGGI-03: Data Pengguna Riil Hardcoded di Source Code

**File:** `src/app/utils/config.ts` (array `CHANNELS`)

27 username pengguna nyata (contoh: `Pebri Haryanto`, `pak_rudi_rt`, `sar_team_1`) disimpan langsung di kode sumber.

**FIX — Migrasi ke Supabase:**

```sql
CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('green', 'red', 'gray')) DEFAULT 'gray',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE channel_members (
  channel_id INTEGER REFERENCES channels(id),
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);
```

---

## 3.5 Temuan Sedang

### 🟠 SEDANG-01: Tidak Ada React Error Boundary

**Dampak:** Crash satu komponen (misalnya `useAudioStreamer` gagal init) menyebabkan seluruh layar putih tanpa pesan error atau tombol recovery.

**FIX:**

```tsx
// src/app/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('PTT App Error:', error, info);
    // Kirim ke Sentry jika tersedia
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-900 text-white">
          <h2 className="text-xl font-bold mb-4">Terjadi kesalahan</h2>
          <p className="text-gray-400 mb-6 text-sm">{this.state.error?.message}</p>
          <button
            className="px-6 py-2 bg-green-500 rounded-full font-bold"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Coba lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

### 🟠 SEDANG-02: `useAudioStreamer.ts` Terlalu Monolitik

**File:** `src/app/hooks/useAudioStreamer.ts` — 400+ baris, satu file menangani:

1. WebRTC peer connection management
2. VAD (Voice Activity Detection)
3. MediaRecorder chunking
4. AudioContext playback
5. Echo/delay effect chain
6. Volume sync dari store

Ini melanggar Single Responsibility Principle dan membuat unit testing hampir tidak mungkin.

**FIX — Refactor menjadi:**

```
hooks/
├── useWebRTC.ts          # Peer connections, signaling, offer/answer
├── useVAD.ts             # Voice Activity Detection
├── useAudioPlayback.ts   # AudioContext, buffer queue, gainNode
└── useAudioStreamer.ts   # Orchestrator ringan yang mengkomposisi hooks di atas
```

---

### 🟠 SEDANG-03: Certificate Pinning Akan Kedaluwarsa

**File:** `android/app/src/main/res/xml/network_security_config.xml`

```xml
<pin-set expiration="2027-01-01">
```

Saat ini 7 bulan lagi. Setelah tanggal ini, **seluruh koneksi ke Supabase dari Android akan diblokir** oleh sistem Android. Tidak ada mekanisme reminder atau rotasi otomatis.

**FIX:**

1. Perpanjang expiration ke `2028-01-01` sebagai langkah sementara
2. Tambahkan pin backup dari intermediate CA cadangan
3. Catat tanggal review di kalender tim (6 bulan sebelum expiry)
4. Pertimbangkan OTA key rotation via remote config

---

### 🟠 SEDANG-04: Build Artifact Ter-commit ke Repositori

**Temuan:** Folder `dist/`, `android/.gradle/`, `android/app/build/`, dan file `nextvwt.apk` ikut masuk ke dalam repositori meskipun `.gitignore` sudah mendaftarkannya.

**Dampak:** Ukuran repositori membengkak, git history kotor, APK debug ter-distribusi tanpa kontrol.

**FIX:**

```bash
git rm -r --cached dist/ android/.gradle/ android/app/build/ nextvwt.apk
git commit -m "chore: remove build artifacts from tracking"
```

---

## 3.6 Temuan Rendah

### 🔵 RENDAH-01: Scanning Channel Tidak Memiliki Delay yang Tepat

**File:** `src/app/components/RadioLayout.tsx`

```typescript
// Interval scan terlalu cepat (300ms per channel):
const interval = setInterval(() => {
  channelUp();
}, 300);
```

Setiap `channelUp()` memicu `subscribeToChannel()` baru. Dengan 300ms interval, ini akan membuat ratusan koneksi Supabase dalam hitungan detik.

**FIX:** Gunakan debounce, atau hanya scan channel yang terdaftar di `STATIC_CHANNELS`, bukan increment satu per satu.

---

### 🔵 RENDAH-02: `setProgress` Menggunakan `Math.random()` — Nilai Modulator Tidak Realistis

**File:** `src/app/components/RadioLayout.tsx`

```typescript
const interval = setInterval(() => {
  setProgress(Math.floor(Math.random() * 70) + 30); // 30–100 acak
}, 100);
```

Progress bar modulator menampilkan nilai acak yang tidak mencerminkan level audio sebenarnya. Ini kurang informatif dibanding analisis RMS yang sudah ada di VAD.

**FIX:** Sambungkan nilai `rms` dari VAD analyser ke progress bar untuk representasi level suara yang nyata.

---

### 🔵 RENDAH-03: `any` Type di Beberapa Tempat Kritis

**File:** `src/app/hooks/useAudioStreamer.ts`

```typescript
const handleSignaling = useCallback(async (payload: any) => { // ← any
const vadIntervalRef = useRef<any>(null);                       // ← any
```

**FIX:** Definisikan interface `WebRTCSignalingPayload` dan gunakan `ReturnType<typeof setInterval>` untuk interval ref.

---

### 🔵 RENDAH-04: Tidak Ada Rate Limiting pada Broadcast Transmisi

**File:** `src/app/store/usePTTStore.ts` — `broadcastVoiceChunk()`

Tidak ada throttling pada pengiriman chunk audio. Jika `MediaRecorder` menghasilkan chunk lebih cepat dari 255ms (karena kondisi sistem), Supabase bisa menerima flood broadcast dari satu user.

**FIX:** Tambahkan `maxChunksPerSecond` limiter di `broadcastVoiceChunk`.

---

### 🔵 RENDAH-05: Nama Default Hardcoded ('Pebe Herianto')

**File:** `src/app/store/usePTTStore.ts`

```typescript
const DEFAULT_SETTINGS = {
  infoText: 'Pebe Herianto',   // ← nama pribadi pengembang sebagai default
  locationText: 'BANDUNG, JAWA BARAT',
```

**FIX:** Gunakan placeholder generik seperti `'Pengguna Baru'` atau kosong `''`.

---

## 3.7 Dependensi Utama — Analisis Detail

| Paket | Versi | Fungsi | Status |
|---|---|---|---|
| `react` | 18.3.1 | UI framework | ✅ Aktif |
| `zustand` | ^5.0.14 | State management | ✅ Aktif |
| `@supabase/supabase-js` | ^2.107.0 | Auth + Realtime | ✅ Aktif |
| `@capacitor/android` | ^8.4.0 | Android wrapper | ✅ Aktif |
| `@mui/material` | 7.3.5 | ⚠️ Tidak digunakan aktif | 🔴 Hapus |
| `@mui/icons-material` | 7.3.5 | ⚠️ Tidak digunakan aktif | 🔴 Hapus |
| `@emotion/react` | 11.14.0 | ⚠️ Hanya untuk MUI | 🔴 Hapus |
| `@emotion/styled` | 11.14.1 | ⚠️ Hanya untuk MUI | 🔴 Hapus |
| `@radix-ui/*` | 1.x–2.x | UI primitives (shadcn) | ✅ Aktif |
| `motion` | 12.23.24 | Animasi | ✅ Aktif |
| `react-router` | 7.13.0 | Routing | ✅ Aktif |
| `vite` | 6.3.5 | Build tool | ✅ Aktif |
| `canvas-confetti` | 1.9.4 | Efek visual | ✅ Aktif |
| `lucide-react` | 0.487.0 | Icon library | ✅ Aktif |
| `sonner` | 2.0.3 | Toast notifications | ✅ Aktif |
| `recharts` | 2.15.2 | Charts library | ✅ Aktif |
| `cmdk` | 1.1.1 | Command palette | ✅ Aktif |
| `vaul` | 1.1.2 | Drawer component | ✅ Aktif |
| `date-fns` | 3.6.0 | Date utilities | ✅ Aktif |
| `react-hook-form` | 7.55.0 | Form management | ✅ Aktif |

---

## 4. Kekuatan & Hal yang Sudah Baik

### ✅ Implementasi Audio WebRTC yang Matang

`useAudioStreamer.ts` mengimplementasikan:
- **Dual-path audio:** WebRTC P2P untuk real-time + fallback base64 via Supabase broadcast
- **VAD (Voice Activity Detection):** Menggunakan `AnalyserNode` dengan RMS threshold untuk mute otomatis saat silence
- **Fast PTT track swapping:** Mengganti track di `RTCPeerConnection` tanpa renegotiasi
- **Role-based offer/answer:** UUID comparison untuk mencegah offer duplikat
- **ICE candidate queuing:** Kandidat yang datang sebelum `setRemoteDescription` di-queue dengan benar

### ✅ State Management yang Bersih

`usePTTStore.ts` dengan Zustand:
- **Persisted keys** terpisah dari volatile runtime state
- **`safeGetStorage` / `safeSetStorage`** dengan try-catch untuk offline resilience
- **Idempotent `initializeSession`**
- **Offline recovery** dari localStorage saat startup

### ✅ Testing Coverage yang Baik

- **Unit tests:** 20+ test case di `usePTTStore.test.ts` dengan Vitest
- **E2E tests:** 11 Playwright specs (app-boot, channel-scan, karaoke-ptt, layout-shift, modulation-simulation, multi-user-modulation, power-toggle, ptt-safeguards, screenshot-test, settings-flow, voice-streaming)

### ✅ Arsitektur White-Label Siap

`config.ts` sebagai single source of truth untuk branding:
- Nama, warna, slogan, channel prefix bisa diganti tanpa menyentuh komponen
- 8 tema CSS siap pakai

### ✅ Audio Mode Dua-Jalur yang Tepat

- **Discussion mode:** `echoCancellation: true`, `noiseSuppression: true`, `autoGainControl: true`
- **Music/Karaoke mode:** Semua filter dinonaktifkan, stereo channel, Opus 128kbps
- Built-in echo/delay effect untuk mode karaoke

### ✅ TLS Certificate Pinning Android

`network_security_config.xml` mengimplementasikan SHA-256 pinning untuk domain Supabase dengan 4 pin (Let's Encrypt R3, E1, Cloudflare ECC CA-3, ISRG Root X1).

### ✅ PTT Button dengan UX Detail yang Baik

- Sound design otentik (pre-chirp dual-tone + squelch tail + Roger beep)
- Haptic feedback via `navigator.vibrate()`
- Keyboard Spacebar support untuk desktop
- Toggle mode vs Push-to-Hold yang bisa dikonfigurasi
- Animasi 3D press dengan CSS transform yang halus

### ✅ Aquarium Canvas Engine yang Impresif

- High-DPI (Retina) scaling
- Fisika pergerakan ikan berbasis vektor dengan steering force
- 4 spesies ikan dengan parameter visual unik (Goldfish, Blue Betta, Neon Tetra, Pink Betta)
- Sistem partikel (gelembung, plankton, rumput laut)
- Evasion system interaktif (sentuhan)

---

## 5. Rekomendasi Strategis & Roadmap

### Fase 1 — Segera (Hari Ini)

| # | Tindakan | Estimasi | File |
|---|---|---|---|
| 1.1 | Rotasi Supabase URL + Key di dashboard | 15 menit | Supabase Dashboard |
| 1.2 | Rotasi Google OAuth Client ID | 15 menit | Google Cloud Console |
| 1.3 | Hapus `.env` dari git history (BFG) | 30 menit | Terminal |
| 1.4 | Tambahkan `RECORD_AUDIO`, `VIBRATE` ke Manifest | 10 menit | `AndroidManifest.xml` |
| 1.5 | Fix logika `isDummyKey` | 15 menit | `usePTTStore.ts` |

### Fase 2 — Minggu Ini

| # | Tindakan | Estimasi | File |
|---|---|---|---|
| 2.1 | Fix guest login dengan UUID unik per sesi | 1 jam | `App.tsx` |
| 2.2 | Hapus dependensi MUI (`pnpm remove`) | 30 menit | `package.json` |
| 2.3 | Tambahkan React Error Boundary | 2 jam | `ErrorBoundary.tsx` |
| 2.4 | Perbaiki scan interval (debounce + channel list) | 1 jam | `RadioLayout.tsx` |
| 2.5 | Hapus nama default pribadi dari settings | 10 menit | `usePTTStore.ts` |

### Fase 3 — 1–2 Minggu ke Depan

| # | Tindakan | Estimasi | File |
|---|---|---|---|
| 3.1 | Setup TURN server (Coturn / Metered.ca) | 1 hari | `useAudioStreamer.ts` |
| 3.2 | Refactor `useAudioStreamer.ts` menjadi 3–4 hook | 2–3 hari | `hooks/` |
| 3.3 | Migrasi data channel ke Supabase DB | 1–2 hari | `config.ts` + SQL |
| 3.4 | Perpanjang certificate pinning + setup reminder | 30 menit | `network_security_config.xml` |
| 3.5 | Tambahkan `FOREGROUND_SERVICE` permission | 2 jam | Android native |

### Fase 4 — Pra-Produksi (Sebelum Launch)

| # | Tindakan | Estimasi |
|---|---|---|
| 4.1 | End-to-end enkripsi audio (E2EE via DTLS-SRTP verification) | 1 minggu |
| 4.2 | Rate limiting per-user di Supabase Edge Functions | 2–3 hari |
| 4.3 | iOS `info.plist` microphone permission string | 1 hari |
| 4.4 | Monitoring Sentry (error tracking produksi) | 1 hari |
| 4.5 | CI/CD pipeline (GitHub Actions: test + build + APK) | 2–3 hari |
| 4.6 | Security audit formal (penetration testing) | 1–2 minggu |
| 4.7 | Play Store listing preparation | 3–5 hari |

---

## 6. Super Prompt untuk AI Assistant

```
Kamu adalah NextVWT AI Engineering Assistant — spesialis senior dalam pengembangan aplikasi
Push-to-Talk (PTT) berbasis React + WebRTC. Tugasmu membantu pengembangan NextVWT PTT App
dengan kedalaman teknis tinggi dan standar produksi.

═══════════════════════════════════════════════════════════════════════
PROFIL SPESIALISASI
═══════════════════════════════════════════════════════════════════════

Domain:   Audio streaming real-time, WebRTC P2P, PTT communication systems
Stack:    React 18 + TypeScript (strict) + Vite + Tailwind CSS 4 + Zustand 5 + Supabase + Capacitor Android 8
Fokus:    Performance, security, scalability, mobile optimization, production readiness

═══════════════════════════════════════════════════════════════════════
KAPABILITAS UTAMA
═══════════════════════════════════════════════════════════════════════

1. ARSITEKTUR AUDIO
   - WebRTC P2P (RTCPeerConnection, ICE, SDP negotiation, STUN/TURN)
   - VAD (Voice Activity Detection) via AnalyserNode + RMS threshold
   - MediaRecorder chunking dengan Base64 fallback
   - AudioContext pipeline (gain, echo, delay, playback)
   - Opus codec optimization (discussion vs music/karaoke mode)

2. STATE MANAGEMENT
   - Zustand 5 dengan persistensi localStorage selektif
   - Offline resilience (safeGetStorage / safeSetStorage)
   - Real-time sync via Supabase Presence + Broadcast
   - Session management (idempotent initializeSession)

3. MOBILE DEVELOPMENT
   - Capacitor 8 Android wrapper
   - Android permissions (RECORD_AUDIO, VIBRATE, FOREGROUND_SERVICE)
   - SSL certificate pinning (network_security_config.xml)
   - ProGuard obfuscation + Terser minification
   - Dynamic viewport (100dvh) untuk mobile browser

4. UI/UX ENGINEERING
   - 3D skeuomorphic design system (8 tema visual)
   - Glassmorphism + bevel effects
   - Aquarium Canvas engine (fisika ikan, partikel, evasion system)
   - Responsive mobile-first (320px - 414px primary)
   - Skeuomorphic PTT button dengan tactile 3D feedback

5. SECURITY
   - SSL pinning (SHA-256 SPKI)
   - Credential management & rotation
   - Supabase RLS policies
   - Anti-cloning obfuscation
   - Rate limiting & flood protection

6. TESTING & QUALITY
   - Unit testing (Vitest + React Testing Library)
   - E2E testing (Playwright)
   - TypeScript strict mode
   - ESLint + Prettier enforcement

7. PRODUCTION DEPLOYMENT
   - CI/CD via GitHub Actions
   - Vercel deployment
   - Sentry error tracking
   - Bundle optimization (code splitting, lazy loading)
   - Play Store preparation

═══════════════════════════════════════════════════════════════════════
ATURAN KERJA
═══════════════════════════════════════════════════════════════════════

- Selalu pertimbangkan mobile performance dan battery impact
- Prioritaskan audio latency di bawah 150ms untuk PTT
- Gunakan TypeScript strict mode dengan proper typing (DILARANG KERAS ada tipe data 'any')
- Ikuti existing code patterns dalam proyek
- Selalu sertakan error handling dan edge cases
- Berikan implementasi yang production-ready (bukan prototype)
- Referensi existing files dalam proyek untuk consistency
- Gunakan Conventional Commits format
- Test coverage minimum 80% untuk code baru

═══════════════════════════════════════════════════════════════════════
PENGETAHUAN KHUSUS NEXTVWT
═══════════════════════════════════════════════════════════════════════

- 8 tema visual: classic, v1 (Glass Crystal), v2 (Premium Goldfish),
  v3 (Soft Crystal/Blue Betta), v4 (Smoked Crystal/Neon Tetra),
  v5 (Aurora Glass/Pink Betta), v6 (Live Aquarium), monokrom (Legacy Retro)
- Dual-path audio: WebRTC P2P + Base64 fallback via Supabase Broadcast
- Presence system via Supabase Realtime Channel
- White-label architecture via config.ts
- Aquarium Canvas engine dengan 4 spesies ikan + fisika realistis
- D-Pad kontrol dengan SVG molded backing + 3D bevel
- LCD Panel dengan glassmorphism bertingkat (5 layer visual)
- Channel system: Green (public), Red (restricted), Gray (system)
- Sound design: pre-chirp dual-tone, squelch tail, Roger beep
- Brand logo 3D sphere dengan sinyal hijau 3 arsitektur

═══════════════════════════════════════════════════════════════════════
FORMAT RESPONS
═══════════════════════════════════════════════════════════════════════

- Code selalu dalam ```tsx/ts/js``` dengan proper imports
- Jelaskan arsitektur/pendekatan SEBELUM implementasi
- Berikan file path suggestion untuk setiap perubahan
- Include testing approach untuk setiap fitur baru
- Sebutkan performance considerations
- Berikan estimasi effort (waktu)
- Gunakan bahasa Indonesia untuk penjelasan, English untuk code
```

---

## 7. Product Requirements Document (PRD)

# Product Requirements Document — NextVWT PTT App v1.0

**Versi Dokumen:** 1.0
**Tanggal:** 7 Juni 2026
**Status:** Draft
**Penulis:** Product & Engineering Team

---

### 7.1 Product Overview

| Field | Detail |
|-------|--------|
| **Nama Produk** | NextVWT PTT App |
| **Kategori** | Aplikasi Push-to-Talk (Walkie-Talkie Digital) |
| **Platform** | Android (Capacitor), Web PWA, iOS (planned) |
| **Target Pengguna** | Tim komunikasi, profesional lapangan, komunitas |
| **USP** | Audio real-time latensi rendah + visual 3D skeuomorphic autentik |

### Problem Statement

1. Komunikasi tim di lapangan membutuhkan latensi rendah dan keandalan tinggi
2. Infrastruktur radio fisik mahal (Rp 500K–5Jt per unit), terbatas jarak, dan tidak scalable
3. Aplikasi PTT existing (Zello, Voxer) kurang optimal untuk penggunaan profesional di Indonesia
4. Butuh solusi yang customizable (white-label) untuk berbagai segmen industri

### Solution Statement

NextVWT menyediakan solusi PTT digital dengan:
- **Audio real-time** latensi rendah (<150ms via WebRTC P2P)
- **Fallback Base64** untuk kompatibilitas semua jaringan Indonesia
- **UI 3D skeuomorphic** autentik seperti radio fisik untuk familiaritas pengguna
- **Multi-channel** dengan presence detection real-time
- **White-label ready** untuk kustomisasi brand klien

---

### 7.2 Target User & Use Cases

#### Primary Users

1. **Professional Teams** — Security, event organizer, construction, mining
2. **Community Groups** — Radio komunitas, volunteer organization, RT/RW
3. **Business Operations** — Warehouse, retail, logistics, hospitality

#### Key Use Cases

| Use Case | User | Scenario | Frequency |
|---|---|---|---|
| Koordinasi tim lapangan | Security guard | Patroli malam, koordinasi pos | Harian, 8 jam |
| Komunikasi darurat | Volunteer | Bencana alam, evakuasi | Insidental |
| Event management | EO staff | Koordinasi backstage, logistic | Event-based |
| Daily operations | Warehouse staff | Koordinasi pengiriman, inventory | Harian, 10 jam |
| Komunitas sosial | Komunitas radio | Ngobrol santai, sharing info | Harian, santai |

---

### 7.3 Product Goals & Success Metrics

#### Business Goals

| Metric | Target | Timeline |
|---|---|---|
| Monthly Recurring Revenue (MRR) | $5,000/bulan | 6 bulan post-launch |
| Monthly Active Users (MAU) | 10,000 | Bulan pertama |
| User Retention (30-day) | 60% | 3 bulan post-launch |
| Enterprise Clients | 5 clients | 12 bulan post-launch |

#### Technical Goals

| Metric | Target | Priority |
|---|---|---|
| Audio Latency (WebRTC) | <150ms | P0 |
| Audio Latency (Fallback) | <500ms | P0 |
| Uptime | 99.9% | P0 |
| Bundle Size (optimized) | <2MB | P1 |
| UI Frame Rate | 60fps | P1 |
| Cold Start Time | <3 detik | P1 |
| Battery Usage (1 jam PTT) | <5% | P2 |

#### User Experience Goals

| Metric | Target |
|---|---|
| Customer Satisfaction (CSAT) | >4.5/5 |
| Task Success Rate | >95% |
| Time to First Audio | <5 detik dari app launch |
| Error Rate | <0.1% untuk core features |

---

### 7.4 Feature Requirements

#### 7.4.1 Core Features (MVP — Phase 1)

##### A. Audio Communication System

| ID | Feature | Description | Priority |
|---|---|---|---|
| AC-01 | PTT Button | Push-to-talk dengan haptic feedback, sound effects, dan 3D visual | P0 |
| AC-02 | WebRTC Streaming | P2P audio dengan latensi rendah, Opus codec | P0 |
| AC-03 | Base64 Fallback | Audio streaming via Supabase Broadcast untuk jaringan terbatas | P0 |
| AC-04 | Voice Activity Detection | Auto-mute saat silence, RMS threshold <0.01 selama 1.5 detik | P0 |
| AC-05 | Discussion Mode | echoCancellation + noiseSuppression + autoGainControl | P0 |
| AC-06 | Music/Karaoke Mode | Stereo, Opus 128kbps, tanpa filter | P1 |
| AC-07 | Echo Effect | Built-in delay (250ms) dengan feedback control untuk karaoke | P2 |
| AC-08 | Sound Design | Pre-chirp dual-tone, squelch tail, Roger beep | P1 |
| AC-09 | Full Duplex Mode | Mendengar rekan saat PTT aktif | P2 |
| AC-10 | Audio Buffer Queue | maxQueue control untuk mencegah lag accumulation | P1 |

##### B. Channel Management System

| ID | Feature | Description | Priority |
|---|---|---|---|
| CM-01 | Channel List Modal | Overlay dialog penuh dengan daftar saluran, search, 3D badges | P0 |
| CM-02 | Channel Types | Green (public), Red (restricted), Gray (system) | P0 |
| CM-03 | D-Pad Navigation | Scan up/down channel dengan visual feedback | P0 |
| CM-04 | Channel Presence | Real-time user count per channel via Supabase Presence | P0 |
| CM-05 | Channel Search | Filter channel berdasarkan nama/anggota | P1 |
| CM-06 | Channel Info | Detail channel (nama, info, logo placeholder) | P1 |
| CM-07 | Restricted Access | Peringatan untuk channel terbatas | P1 |
| CM-08 | Pagination | Lazy-load channel list (15 per batch) | P1 |

##### C. User Management System

| ID | Feature | Description | Priority |
|---|---|---|---|
| UM-01 | Google OAuth Login | Sign in via Google account | P0 |
| UM-02 | Guest Mode | Login sebagai tamu tanpa akun | P0 |
| UM-03 | User Profiles | Avatar, display name, callsign, location | P0 |
| UM-04 | Presence Detection | Online/offline/busy status real-time | P0 |
| UM-05 | User List Modal | Daftar user aktif di channel dengan avatar | P0 |
| UM-06 | Speaking Indicator | Megaphone icon saat user sedang transmit | P1 |
| UM-07 | Photo Visibility Control | Toggle tampilan foto (my photo, other photos, in list) | P1 |

##### D. Visual Interface System

| ID | Feature | Description | Priority |
|---|---|---|---|
| VI-01 | 3D Skeuomorphic Design | Realistic radio appearance dengan bevel, shadow, glassmorphism | P0 |
| VI-02 | Theme System | 8 tema (Classic, V1-V6, Monokrom) | P0 |
| VI-03 | LCD Panel | Digital display: channel number (DSEG7), signal bars, username | P0 |
| VI-04 | Aquarium Animation | Interactive fish swimming dengan fisika realistis | P2 |
| VI-05 | Responsive Design | Mobile-first, optimized untuk 320px–414px | P0 |
| VI-06 | Toggle Switch 3D | Power ON/OFF dengan visual track 3D | P0 |
| VI-07 | Progress Bar | Modulator level indicator | P1 |
| VI-08 | Brand Logo 3D | SVG sphere dengan sinyal hijau + TX ripple | P1 |

#### 7.4.2 Advanced Features (Post-MVP — Phase 2)

| ID | Feature | Description | Priority |
|---|---|---|---|
| AD-01 | Channel Admin | Create/delete channels, manage members | P1 |
| AD-02 | User Admin | Kick/ban users, assign roles | P1 |
| AD-03 | Analytics Dashboard | Usage statistics, performance metrics | P2 |
| AD-04 | White-Label Customization | Custom branding via config.ts | P1 |
| AD-05 | Group Calling | Multi-user conference (max 10) | P2 |
| AD-06 | Audio Recording | Record dan playback percakapan | P2 |
| AD-07 | AI Noise Cancellation | Advanced noise suppression | P2 |
| AD-08 | Bluetooth Support | External microphone/speaker | P2 |
| AD-09 | REST API | Integration endpoint untuk sistem lain | P2 |
| AD-10 | Desktop Client | Web/desktop version (Electron/Tauri) | P3 |

---

### 7.5 Technical Architecture

#### 7.5.1 Frontend Stack

```
Framework:     React 18.3 + TypeScript (strict)
Build Tool:    Vite 6.3 + Terser (production obfuscation)
Styling:       Tailwind CSS 4 + Custom CSS Variables (theme system)
State:         Zustand 5 (persisted + volatile state separation)
UI Library:    shadcn/ui (Radix UI primitives) — MUI akan dihapus
Animation:     Motion (Framer Motion) + CSS transforms
Fonts:         DSEG7 (LCD), Outfit/Orbitron (brand), Inter (UI)
```

#### 7.5.2 Backend Stack

```
Auth:          Supabase Auth (Google OAuth + Guest)
Database:      Supabase PostgreSQL (snake_case, RLS policies)
Realtime:      Supabase Realtime (Presence + Broadcast)
Storage:       Supabase Storage (avatars, channel logos)
Edge Functions: Supabase Edge Functions (rate limiting, validation)
```

#### 7.5.3 Audio Pipeline

```
Microphone → MediaStream → MediaRecorder (chunking)
                            ↓
                    ┌──── WebRTC P2P (primary) ────┐
                    │   RTCPeerConnection            │
                    │   → Opus codec                 │
                    │   → STUN/TURN traversal        │
                    └────────────────────────────────┘
                            ↓ (fallback)
                    ┌──── Base64 via Broadcast ─────┐
                    │   Supabase Broadcast channel   │
                    │   → Base64 encoded chunks      │
                    │   → maxQueue control           │
                    └────────────────────────────────┘
                            ↓
                    AudioContext → GainNode → Destination
                    (with optional Echo/Delay for karaoke)
```

#### 7.5.4 Mobile Stack

```
Wrapper:       Capacitor Android 8
Permissions:   RECORD_AUDIO, VIBRATE, MODIFY_AUDIO_SETTINGS, FOREGROUND_SERVICE
Security:      SSL Pinning (*.supabase.co), ProGuard, Terser
Distribution:  Google Play Store + Direct APK
iOS:           Planned (Capacitor iOS, info.plist permissions)
```

#### 7.5.5 Security Architecture

```
Transport:     HTTPS + WSS (Supabase)
Certificate:   SSL Pinning (SHA-256 SPKI) — Android
Audio:         DTLS-SRTP (WebRTC encryption)
Auth:          Supabase Auth + Google OAuth 2.0
Data:          Row Level Security (RLS) — PostgreSQL
Code:          Terser obfuscation + ProGuard (Android)
API Key:       Supabase publishable key (semi-public, RLS protected)
```

---

### 7.6 Design Specifications

#### 7.6.1 Visual Design System

| Element | Specification |
|---------|---------------|
| **Style** | 3D Skeuomorphic + Glassmorphism |
| **Color System** | Theme-based CSS variables (8 themes) |
| **Typography** | DSEG7 (LCD numbers), Outfit (brand), Inter (UI) |
| **Animations** | 60fps, CSS transform-based, Motion library |
| **Icons** | Custom SVG icons (inline) |
| **Spacing** | Tailwind utility classes |
| **Border Radius** | Bezel: 24px, Buttons: full-round, Modal: 8–16px |

#### 7.6.2 Component Specifications

| Component | Width | Height | Key Visual Features |
|-----------|-------|--------|-------------------|
| LCD Panel | 300px | 155px | 5-layer glass, bezel, signal bars, DSEG7 numbers |
| D-Pad Controls | 290px | 150px | SVG molded backing, 3D bevel, rocker capsule |
| PTT Button | 338px | 108px | Double-container 3D, convex glass highlight |
| Channel Modal | 340px max | 350–485px | Uniform modal system, 3D glossy badges |
| User List Modal | 340px max | 350–485px | Avatar circles, presence dots, speaking indicator |
| Settings Panel | Full screen | Full height | Section dividers, custom toggle switches |

#### 7.6.3 Responsive Breakpoints

| Viewport | Layout |
|----------|--------|
| < 700px height | Compact layout, modals 350px height |
| ≥ 700px height | Full layout, modals 485px height |
| Mobile (primary) | 320px–414px width, portrait only |
| Tablet (secondary) | 768px–1024px, centered with device frame |
| Desktop (testing) | Full width, device frame simulation |

---

### 7.7 Testing Requirements

#### 7.7.1 Unit Testing

| Aspect | Target |
|--------|--------|
| **Coverage** | 80% minimum |
| **Framework** | Vitest + React Testing Library |
| **Focus** | Core logic, state management, utilities, audio helpers |
| **Mocking** | Supabase (mocked), WebRTC (mocked), localStorage |

#### 7.7.2 Integration Testing

| Flow | Priority |
|------|----------|
| Audio WebRTC connection & streaming | P0 |
| Auth flow (Google + Guest) | P0 |
| Supabase Realtime (presence + broadcast) | P0 |
| Network failure & recovery | P1 |
| Settings persistence | P1 |

#### 7.7.3 E2E Testing

| Spec | Description |
|------|-------------|
| app-boot | Application startup & initialization |
| channel-scan | Channel navigation & scanning |
| karaoke-ptt | Music mode PTT functionality |
| layout-shift | Visual layout stability (CLS) |
| modulation-simulation | Audio level visualization |
| multi-user-modulation | Multiple user scenarios |
| power-toggle | Power on/off lifecycle |
| ptt-safeguards | PTT safety mechanisms |
| screenshot-test | Visual regression testing |
| settings-flow | Settings panel interactions |
| voice-streaming | Voice transmission end-to-end |

---

### 7.8 Deployment & Distribution

#### 7.8.1 Build Pipeline

```
Source Code → ESLint + Prettier → TypeScript Check → Vitest Unit Tests
     → Vite Build (Terser minification) → Playwright E2E Tests
     → Capacitor Build → Android APK → Deploy
```

#### 7.8.2 Environments

| Environment | Purpose | Config |
|---|---|---|
| Development | Local development | `.env` (gitignored) |
| Staging | Pre-release testing | Vercel preview + staging Supabase |
| Production | Live users | Vercel production + production Supabase |

#### 7.8.3 Distribution Channels

| Channel | Platform | Status |
|---------|----------|--------|
| Google Play Store | Android | Planned (Phase 4) |
| Direct APK | Android | Available (current) |
| Web PWA | All browsers | Available (current) |
| Apple App Store | iOS | Planned (Phase 2) |

---

### 7.9 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebRTC failure on symmetric NAT | High | High | Setup TURN server |
| Supabase rate limiting | Medium | Medium | Edge Functions rate limiter |
| Certificate pinning expiry | Medium | Critical | Calendar reminder + OTA rotation |
| Play Store rejection | Medium | High | Pre-review compliance check |
| Credential leak recurrence | Low | Critical | Git hooks + CI secret scanning |
| Audio latency >150ms | Medium | High | TURN server + optimized codec |
| Battery drain (audio background) | Medium | Medium | VAD + background service optimization |

---

### 7.10 Roadmap Timeline

#### Phase 1: MVP (4–6 Minggu)

| Week | Deliverable |
|------|-------------|
| 1 | Fix all critical findings (security, permissions, credentials) |
| 2 | Remove MUI dependency, add Error Boundary, fix scan interval |
| 3 | Setup TURN server, refactor useAudioStreamer |
| 4 | Migrate channel data to Supabase DB |
| 5 | Performance optimization, bundle size reduction |
| 6 | Final testing, bug fixes, beta preparation |

#### Phase 2: Enhanced (6–8 Minggu)

| Week | Deliverable |
|------|-------------|
| 7–8 | Admin features (channel + user management) |
| 9–10 | Advanced audio features (recording, group calling) |
| 11–12 | iOS development (Capacitor iOS) |
| 13–14 | White-label system for enterprise clients |

#### Phase 3: Scale (8–12 Minggu)

| Week | Deliverable |
|------|-------------|
| 15–18 | Analytics dashboard, monitoring (Sentry) |
| 19–22 | REST API for third-party integration |
| 23–26 | Desktop client (Tauri/Electron), global deployment |

---

### 7.11 Success Metrics Summary

#### Technical KPIs

| KPI | Current | Target (MVP) | Target (Scale) |
|---|---|---|---|
| Audio Latency (WebRTC) | ~200ms | <150ms | <100ms |
| Audio Latency (Fallback) | ~800ms | <500ms | <300ms |
| Bundle Size | ~3.5MB | <2MB | <1.5MB |
| Cold Start | ~5s | <3s | <2s |
| Test Coverage | ~70% | 80% | 90% |
| Uptime | N/A | 99.5% | 99.9% |

#### Business KPIs

| KPI | Target (3 bulan) | Target (6 bulan) | Target (12 bulan) |
|---|---|---|---|
| MAU | 5,000 | 10,000 | 50,000 |
| MRR | $1,000 | $5,000 | $20,000 |
| Enterprise Clients | 1 | 5 | 15 |
| App Rating | 4.0 | 4.5 | 4.7 |

---

## 8. Design System & Theme Specifications

### 8.1 Theme System (8 Themes)

Seluruh token visual disimpan dalam variabel CSS di berkas `src/styles/theme.css` dan dikendalikan melalui kelas selektor tema.

#### A. Classic Theme (`.theme-classic` / `:root`)

- **Device Chassis Background**: `linear-gradient(to bottom, #d5dbe1 0%, #a4b0be 100%)`
- **LCD Background**: `linear-gradient(to bottom, #ff9500 0%, #d87d00 100%)` (Amber Glow)
- **LCD Glow**: `0 0 10px rgba(255, 255, 255, 0.8)`
- **PTT Button (Idle)**: `linear-gradient(to bottom, #2cdb66 0%, #19ba42 100%)`
- **PTT Button (Active)**: `linear-gradient(to bottom, #d62828 0%, #a01010 100%)`

#### B. Glass Crystal V2 (Premium Goldfish - `.theme-v2`)

- **Device Chassis**: Transparent glass-morphic panel (`blur(20px)`) with diamond-cut bevel border
- **LCD Background**: Warm amber/gold
- **Aquarium Content**: Ikan Mas Koki (Goldfish) berenang lambat secara organik
- **D-Pad SCAN/SET & Rocker Buttons**: Sapphire Blue Bold (`#1e40af` -> `#1e3a8a`)

#### C. Glass Rounded (Soft Crystal - `.theme-v3`)

- **Device Chassis Background**: `linear-gradient(135deg, rgba(224,247,250,0.9) 0%, rgba(178,235,242,0.8) 40%, rgba(77,208,225,0.75) 70%, rgba(224,247,250,0.85) 100%)`
- **LCD Background**: Cyan gradient (`#00e5ff → #00b0ff`)
- **Aquarium Content**: Ikan Cupang Biru (Blue Betta) dengan sirip melambai lambat
- **D-Pad SCAN/SET & Rocker Buttons**: Teal/Cyan Bold (`#00838f` -> `#004d40`)

#### D. Dark Glass (Smoked Crystal - `.theme-v4`)

- **Device Chassis Background**: Deep charcoal gradient (`#263238 → #141b1e → #080c0e`)
- **LCD Background**: Neon Emerald Green gradient (`#00c853 → #007c31`)
- **Aquarium Content**: Ikan Neon Tetra kecil berenang berkelompok secara lincah
- **D-Pad SCAN/SET & Rocker Buttons**: Forest Green Bold (`#065f46` -> `#064e3b`)

#### E. Aurora Glass (Color Crystal - `.theme-v5`)

- **Device Chassis Background**: Purple Magenta gradient (`#f3e5f5 → #ce93d8 → #ab47bc`)
- **LCD Background**: Hot Pink/Magenta gradient (`#ff4081 → #e040fb`)
- **Aquarium Content**: Ikan Cupang Pink/Magenta (Pink Betta) berenang anggun
- **D-Pad SCAN/SET & Rocker Buttons**: Pink/Magenta Bold (`#d81b60` -> `#880e4f`)

#### F. Glass Crystal V6 (Live Aquarium - `.theme-v6`)

- **Device Chassis Background**: Ocean Navy gradient (`#03045e 0%, #0077b6 50%, #0096c7 100%`)
- **LCD Background**: Deep Sea Blue gradient (`#03045e 0%, #023e8a 100%`)
- **LCD Glow**: `0 0 15px rgba(0, 180, 216, 0.55)` (Ambient Cyan)
- **Aquarium Content**: Campuran spesies ikan (Goldfish, Betta, Neon Tetra) berenang bersama

#### G. Monokrom (Legacy Retro - `.theme-monokrom`)

- **Device Chassis Background**: Cool slate gray gradient (`#f1f5f9 → #cbd5e1`)
- **LCD Background**: Retro Slate Green gradient (`#94a3b8 → #64748b`)

### 8.2 Component Visual Specifications

#### LCD Panel (`LCDPanel.tsx`)

Komponen utama penampil status radio dengan 5 layer glassmorphism:

1. **Sasis Utama (Outer Chassis)**: Lebar 300px, tinggi 155px, border-radius 24px
2. **3D Gold Bezel Emboss**: Box-shadow bertingkat (highlight + shadow) untuk efek timbul
3. **Inner Screen Container**: rounded-[14px], overflow-hidden untuk clipping
4. **Glass Highlight Overlay**: Gradasi putih transparan di atas 45% area
5. **Glossy Screen Shine**: linear-gradient simulasi kilau kaca fisik

#### D-Pad Controls (`ControlButtons.tsx`)

- **Frame**: 290px × 150px dengan SVG molded backing
- **Scan Button**: 85px × 50px, rounded-l-full
- **Set Button**: 85px × 50px, rounded-r-full
- **Rocker Kapsul**: 60px × 105px, center divider 4px

#### PTT Button (`PTTButton.tsx`)

- **Outer Bezel Socket**: 338px × 108px, border-radius 54px
- **Inner Active Button**: 326px × 96px, border-radius 48px
- **Tactile 3D**: translateY(4px) saat ditekan, convex glass highlight

#### Toggle Switch (`ToggleSwitch.tsx`)

- **Track**: 90px × 36px dengan 3D inset shadow
- **Knob**: 50% width, conic-gradient metallic finish
- **Transition**: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)

#### Channel List Modal (`ChannelListModal.tsx`)

- **Dimensi**: max 340px, tinggi 350px/485px (responsif)
- **3D Glossy Badges**: Dual-layer gradient (reflection + base color)
- **Warna Badge**: Green Dark (#2e7d32), Green Light (#00e676), Red (#ff3333), Gray (#a0a0a0)
- **Scrollbar**: 1px ultra-thin, warna #cbd5e1

#### User List Modal (`UserListModal.tsx`)

- **Avatar**: 44px diameter dengan presence dot 15px
- **Speaking Indicator**: Megaphone icon 20px, animate-pulse
- **Scrollbar**: 1px identik dengan ChannelListModal

### 8.3 Typography System

| Font | Penggunaan | Style |
|------|-----------|-------|
| **DSEG7 Classic Mini Bold** | Angka channel LCD | LED digital, 52px, bold |
| **Outfit/Orbitron** | Brand NextVWT | 14px, bold, letter-spacing wide |
| **Inter** | UI umum, settings, modals | 10px-16px, various weights |
| **Montserrat/Poppins** | Subtitle header | 8px-10px, black weight |

### 8.4 Aquarium Canvas Engine (`AquariumCanvas.tsx`)

Spesifikasi mesin simulasi akuarium ultra-realistis:

#### High-DPI (Retina) Scaling

1. Mendapatkan `devicePixelRatio` perangkat
2. Menskalakan ukuran internal kanvas sebanyak piksel rasio
3. Mempertahankan ukuran CSS kanvas tetap 300px × 155px
4. Penskalaan kuas gambar `ctx.scale(ratio, ratio)`

#### Spesies Ikan & Parameter Visual

1. **Goldfish (Mas Koki)**: Tubuh gemuk oranye-emas (`#ff7f00`), sirip ekor lebar berumbai, gerakan lambat
2. **Blue Betta (Cupang Biru)**: Tubuh biru tua (`#005f73`), sirip ekor melambai sangat lebar (`#0a9396`)
3. **Neon Tetra**: Ukuran sangat kecil (15px), garis biru neon (`#00f5d4`) + ekor merah (`#ff0054`), schooling behavior
4. **Pink Betta (Cupang Pink)**: Tubuh magenta, sirip merah muda lembut melambai lebar

#### Sistem Partikel

- **Gelembung**: Naik ke atas dengan goyangan sinus + squash/stretch elastis + specular highlight
- **Plankton**: 10-15 partikel melayang acak 1-2px, opacity 0.15
- **Rumput Laut**: 12 segmen kurva Bezier, lambaian kontinu terpengaruh gelombang sinus

#### Evasion System (Interaktif)

1. Posisi klik (x,y) ditangkap
2. Gelombang riak air dipancarkan di lokasi sentuhan
3. Ikan dalam radius 80px menghitung vektor menjauh, meningkatkan kecepatan drastis
4. Berangsur-angsur melambat kembali ke kecepatan jelajah normal

---

## 9. Security & Anti-Cloning Specifications

### 9.1 Obfuscation & Minification JavaScript (Terser)

- **Minifier**: Terser (`minify: 'terser'`)
- **Mangling**: Mengaburkan nama variabel dan fungsi tingkat atas (`mangle.toplevel = true`)
- **Pembersihan Debugger/Console**: Otomatis menghapus statement `debugger` dan `console.*` di produksi
- **Sourcemap**: Dinonaktifkan (`sourcemap: false`)

### 9.2 ProGuard Bytecode Obfuscation (Android)

```proguard
-keep class com.getcapacitor.** { *; }
-keep class com.nextvwt.ptt.** { *; }
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
```

### 9.3 SSL Pinning Configuration

**Target Domain**: `*.supabase.co`

**Public Key Pins (SPKI SHA-256)**:
- Let's Encrypt R3
- Let's Encrypt E1
- Cloudflare ECC CA-3
- ISRG Root X1 (backup)

### 9.4 Audio Security

- **Transport**: DTLS-SRTP (WebRTC encryption)
- **Fallback**: HTTPS + WSS (Supabase Broadcast)
- **VAD**: Mute otomatis saat silence untuk mencegah pengiriman data tidak perlu

---

## 10. Audio Streamer Technical Deep Dive

### 10.1 Dual-Path Audio Architecture

```
Path 1: WebRTC P2P (Primary - Low Latency)
  Microphone → MediaStream → RTCPeerConnection → Opus Codec → Peer
  Latency target: <150ms
  Features: VAD, fast track swapping, ICE candidate queuing

Path 2: Base64 Fallback (Secondary - Compatibility)
  Microphone → MediaStream → MediaRecorder → Base64 chunks → Supabase Broadcast
  Latency target: <500ms
  Features: maxQueue control, automatic lag reset
```

### 10.2 Voice Activity Detection (VAD)

- **Analyser Node**: Mengukur RMS volume secara realtime
- **Threshold**: 0.01 (below = silence)
- **Timeout**: 1.5 detik sustained silence → auto-mute
- **Impact**: Menghemat bandwidth seluler secara signifikan

### 10.3 Audio Mode Configuration

#### Discussion Mode
```typescript
{
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 1,       // mono
  sampleRate: 48000,
}
```

#### Music/Karaoke Mode
```typescript
{
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 2,       // stereo
  sampleRate: 48000,
  // SDP modified: stereo=1, sprop-stereo=1, maxaveragebitrate=128000
}
```

### 10.4 Echo/Delay Effect Chain (Karaoke)

```
Microphone → GainNode → DelayNode (250ms) → GainNode (echoFeedback%)
                                                    ↓
                          AudioContext.destination (mix)
```

- **Delay Time**: 250ms (configurable)
- **Feedback**: Controlled by `echoFeedback` setting percentage
- **Bypass**: Automatically disabled in discussion mode

### 10.5 WebRTC Signaling Flow

```
User A (PTT Press)                    Supabase Broadcast                   User B (Listener)
    │                                      │                                    │
    ├── broadcast({ type: 'offer' }) ────> │ ──── onMessage ──────────────────> │
    │                                      │                    setRemoteDescription
    │                                      │                    createAnswer
    │ <──── onMessage <────────────────── │ <── broadcast({ type: 'answer' }) ─┤
    │         setRemoteDescription         │                                    │
    │                                      │                                    │
    ├── broadcast({ type: 'candidate' }) > │ ──── onMessage ──────────────────> │
    │                                      │                    addIceCandidate  │
    │ <──── onMessage <────────────────── │ <── broadcast({ type: 'candidate' })┤
    │         addIceCandidate              │                                    │
    │                                      │                                    │
    ╞══ Audio Track Flow (Opus) ═══════════╪════════════════════════════════════╡
    │         RTCPeerConnection            │         RTCPeerConnection          │
    │         (sender)                     │         (receiver)                 │
```

### 10.6 ICE Candidate Queuing

```typescript
// Kandidat yang datang sebelum setRemoteDescription di-queue:
const candidatesQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

// Saat setRemoteDescription selesai, flush queue:
candidatesQueueRef.current.get(peerId)?.forEach(candidate => {
  pc.addIceCandidate(candidate);
});
candidatesQueueRef.current.delete(peerId);
```

---

## 11. State Management Deep Dive

### 11.1 Zustand Store Architecture

```
usePTTStore (Zustand 5)
├── Persisted State (localStorage - survives reload)
│   ├── channelNumber: number
│   ├── themeText: string
│   ├── user: User | null
│   ├── infoText: string
│   ├── locationText: string
│   ├── audioMode: 'discussion' | 'music'
│   ├── showMyPhoto: boolean
│   ├── showOtherPhotos: boolean
│   ├── showPhotosInList: boolean
│   ├── fastClick: boolean
│   ├── showModulator: boolean
│   ├── showPTT: boolean
│   ├── maxQueue: string
│   └── ...settings
│
└── Volatile State (cleared on reload)
    ├── isPowerOn: boolean
    ├── isConnected: boolean
    ├── isTransmitting: boolean
    ├── isScanning: boolean
    ├── progress: number
    ├── activeTransmitter: object | null
    ├── activeUsers: array
    └── error: string | null
```

### 11.2 Safe Storage Pattern

```typescript
// Robust localStorage read - returns null on parse errors
export function safeGetStorage(): Partial<PTTState> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PTTState>;
  } catch {
    return null; // Quota exceeded, private browsing, corrupted JSON
  }
}

// Robust localStorage write - silent on errors
export function safeSetStorage(partial: Partial<PTTState>): void {
  try {
    const existing = safeGetStorage() ?? {};
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...partial }));
  } catch {
    // Fail silently per Robustness Rule
  }
}
```

### 11.3 Session Lifecycle

1. **`initializeSession()`**: Idempotent - tidak re-run jika session sudah ada
2. **Power OFF**: Seluruh proses active transmisi, audio queues, dan scanning dihentikan seketika
3. **Debounced Reconnect**: Jika `fastClick` false, jeda 800ms sebelum memproses channel baru
4. **Avatar Visibility**: Dikontrol oleh `showMyPhoto`, `showOtherPhotos`, `showPhotosInList`
5. **bgActive**: Saklar untuk menghentikan Aquarium Canvas rendering (hemat CPU/GPU)

---

## 12. E2E Test Specifications

### 12.1 Test Files (11 Playwright Specs)

| Spec File | Description | Key Assertions |
|-----------|-------------|----------------|
| `app-boot.spec.ts` | Application startup & initialization | App renders, default state correct |
| `channel-scan.spec.ts` | Channel navigation via D-Pad | Channel changes, subscribe fires |
| `karaoke-ptt.spec.ts` | Music mode PTT functionality | Audio mode switch, echo enabled |
| `layout-shift.spec.ts` | Visual layout stability (CLS) | CLS < 0.1, no layout jumps |
| `modulation-simulation.spec.ts` | Audio level visualization | Progress bar updates |
| `multi-user-modulation.spec.ts` | Multiple user scenarios | Active users display correctly |
| `power-toggle.spec.ts` | Power on/off lifecycle | State cleanup on power off |
| `ptt-safeguards.spec.ts` | PTT safety mechanisms | Cannot transmit when offline |
| `screenshot-test.spec.ts` | Visual regression testing | Pixel-perfect comparison |
| `settings-flow.spec.ts` | Settings panel interactions | Settings persist correctly |
| `voice-streaming.spec.ts` | Voice transmission end-to-end | Audio chunks transmitted |

### 12.2 Unit Test Coverage (`usePTTStore.test.ts`)

- 20+ test cases dengan Vitest
- Coverage mencakup: channel navigation, power toggle, localStorage persistence, UUID generation, callSign handling
- Supabase di-mock untuk offline testing

---

## 13. Viewport & Mobile Responsive Specifications

### 13.1 Dynamic Viewport Height

- Seluruh kontainer sasis utama menggunakan `h-[100dvh]` (bukan `100vh` atau `min-h-screen`)
- Memastikan aplikasi selalu menempati tepat 100% dari ruang pandang aktif tanpa scrollbar liar

### 13.2 Layout Constraint

- Layout dikunci pada mode portrait dengan lebar kontainer maksimal `w-full max-w-md`
- Elemen kontrol dan visual tetap di area jangkauan satu tangan
- CLS (Cumulative Layout Shift) < 0.1

### 13.3 Top Header Spacing Compression

- Spasi vertikal dipadatkan dari `pt-8` (32px) menjadi `pt-[14px]` (14px)
- Sasis utama panel LCD diangkat mendekati tepi bawah top header
- Breathing room cukup untuk teks berjalan (marquee)

### 13.4 Responsive Breakpoints

| Viewport | Layout |
|----------|--------|
| < 700px height | Compact layout, modals 350px height |
| ≥ 700px height | Full layout, modals 485px height |
| Mobile (primary) | 320px–414px width, portrait only |
| Tablet (secondary) | 768px–1024px, centered with device frame |
| Desktop (testing) | Full width, device frame simulation |

---

**Dokumen ini disusun berdasarkan analisis mendalam terhadap seluruh kode sumber, design specification, audit report, dan arsitektur proyek NextVWT PTT App Prototype.**

*Disiapkan: 7 Juni 2026*

