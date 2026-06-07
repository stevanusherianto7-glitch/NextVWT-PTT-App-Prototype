# Laporan Audit Menyeluruh — NextVWT PTT App Prototype

> **Tanggal Audit:** 7 Juni 2026
> **Auditor:** Analisis Otomatis via Claude (Anthropic)
> **Versi Proyek:** 0.0.1 (Prototype Phase)
> **Stack Utama:** React 18 + Zustand + Supabase Realtime + WebRTC + Capacitor Android 8

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Gambaran Arsitektur](#2-gambaran-arsitektur)
3. [Temuan Kritis — Keamanan](#3-temuan-kritis--keamanan)
4. [Temuan Tinggi](#4-temuan-tinggi)
5. [Temuan Sedang](#5-temuan-sedang)
6. [Temuan Rendah & Catatan Kualitas Kode](#6-temuan-rendah--catatan-kualitas-kode)
7. [Kekuatan & Hal yang Sudah Baik](#7-kekuatan--hal-yang-sudah-baik)
8. [Roadmap Rekomendasi](#8-roadmap-rekomendasi)
9. [Ringkasan Skor](#9-ringkasan-skor)

---

## 1. Ringkasan Eksekutif

NextVWT PTT App Prototype adalah aplikasi Push-to-Talk (walkie-talkie digital) berbasis web yang dibungkus dalam Android APK menggunakan Capacitor. Aplikasi menggunakan Supabase Realtime untuk presence dan signaling, WebRTC untuk transmisi audio peer-to-peer, dan React + Zustand untuk state management.

**Skor Kesiapan Produksi: 65 / 100**

Secara arsitektur, prototipe ini menunjukkan fondasi yang cukup solid dengan implementasi audio yang matang (VAD, dual-mode, fallback base64). Namun terdapat **empat temuan kritis** yang wajib diselesaikan sebelum distribusi publik, terutama terkait kebocoran kredensial dan izin Android yang hilang.

| Kategori | Jumlah Temuan |
|---|---|
| 🔴 Kritis | 4 |
| 🟡 Tinggi | 3 |
| 🟠 Sedang | 4 |
| 🔵 Rendah | 5 |

---

## 2. Gambaran Arsitektur

### 2.1 Struktur Proyek

```
nextvwt-ptt-app-prototype/
├── src/
│   ├── app/
│   │   ├── components/        # UI components (RadioLayout, PTTButton, LCDPanel, dll.)
│   │   │   └── ui/            # shadcn/Radix UI components (50+ files)
│   │   ├── hooks/
│   │   │   └── useAudioStreamer.ts   # WebRTC + VAD + MediaRecorder (400+ baris)
│   │   ├── store/
│   │   │   └── usePTTStore.ts        # Zustand global state + Supabase subscription
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
├── .env                       # ⚠️ CREDENTIAL — seharusnya tidak ter-commit
├── capacitor.config.ts
└── package.json
```

### 2.2 Alur Data Utama

```
Pengguna → LoginGate → Supabase Auth (Google OAuth / Guest)
                ↓
           RadioLayout
                ↓
    usePTTStore (Zustand)
    ├── Supabase Realtime Channel (presence, ptt_state broadcast)
    ├── WebRTC Signaling (via Supabase broadcast)
    └── useAudioStreamer
        ├── MediaRecorder (mic capture)
        ├── VAD (Voice Activity Detection)
        ├── RTCPeerConnection (audio streaming)
        └── AudioContext (playback + echo + karaoke)
```

### 2.3 Dependensi Utama

| Paket | Versi | Fungsi |
|---|---|---|
| `react` | 18.3.1 | UI framework |
| `zustand` | ^5.0.14 | State management |
| `@supabase/supabase-js` | ^2.107.0 | Auth + Realtime |
| `@capacitor/android` | ^8.4.0 | Android wrapper |
| `motion` | 12.23.24 | Animasi |
| `@mui/material` | 7.3.5 | ⚠️ Tidak digunakan aktif |
| `@radix-ui/*` | 1.x–2.x | UI primitives (shadcn) |
| `react-router` | 7.13.0 | Routing |
| `vite` | 6.3.5 | Build tool |

---

## 3. Temuan Kritis — Keamanan

### 🔴 KRITIS-01: Credential Bocor ke Git History

**File:** `.env`
**Dampak:** Sangat Tinggi — data sensitif sudah tersebar, tidak bisa "di-unseen"

File `.env` ter-commit ke repositori dan berisi kredensial nyata yang dapat dieksploitasi:

```dotenv
# Bocor ke git:
VITE_SUPABASE_URL=https://tqixjycrxhjmpyffhxvg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

Meskipun `publishable key` Supabase bersifat semi-publik (digunakan di frontend), kebocoran URL project + key secara bersamaan memungkinkan penyerang untuk:

- Mengakses Supabase Realtime channel secara langsung
- Melakukan brute-force atau enumeration terhadap data tabel yang RLS-nya lemah
- Menyalahgunakan Google OAuth Client ID untuk phishing attack

**Rekomendasi:**

```bash
# 1. Rotasi semua credential sekarang di dashboard masing-masing

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

**File:** `android/app/src/main/AndroidManifest.xml`
**Dampak:** Tinggi — fitur inti aplikasi tidak berfungsi di Android

`AndroidManifest.xml` hanya mendaftarkan satu permission:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Permission yang **wajib ada** namun hilang:

| Permission | Dibutuhkan untuk |
|---|---|
| `RECORD_AUDIO` | Akses mikrofon — fitur inti PTT |
| `VIBRATE` | Haptic feedback saat PTT (vibrateOnStart) |
| `MODIFY_AUDIO_SETTINGS` | Kontrol audio mode di Android |
| `FOREGROUND_SERVICE` | Transmisi audio saat app di background |

**Rekomendasi:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Tambahkan sebelum <application> -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <!-- Deklarasi fitur (opsional, mempengaruhi Play Store filter) -->
    <uses-feature android:name="android.hardware.microphone" android:required="true" />
    
    <application ...>
```

---

### 🔴 KRITIS-03: Logika `isDummyKey` Memalsukan Status Koneksi

**File:** `src/app/store/usePTTStore.ts` (baris ~55–70)
**Dampak:** Tinggi — menyesatkan pengguna dan evaluator

```typescript
// Kode bermasalah saat ini:
const isDummyKey =
  !supabaseKey ||
  supabaseKey.startsWith('sb_publishable_') ||  // ← key ASLI juga memenuhi kondisi ini!
  supabaseKey.includes('placeholder') ||
  supabaseKey === '';

// ...
if (isDummyKey) {
  usePTTStore.setState({ isConnected: true }); // ← BERBAHAYA
}
```

Masalahnya: prefix `sb_publishable_` adalah format key **asli** Supabase yang baru. Artinya bahkan dengan key nyata, `isDummyKey` akan bernilai `true` dan otomatis menyetel `isConnected = true` tanpa koneksi backend yang sesungguhnya.

**Rekomendasi:**

```typescript
// Ganti logika isDummyKey dengan deteksi yang lebih presisi:
const isDummyKey =
  !supabaseKey ||
  supabaseKey === 'your-supabase-key' ||
  supabaseKey.includes('placeholder') ||
  supabaseKey.length < 20;

// Hapus blok auto-set isConnected:
// if (isDummyKey) { usePTTStore.setState({ isConnected: true }); } // HAPUS INI
```

---

### 🔴 KRITIS-04: Guest Login dengan Identitas Hardcoded Global

**File:** `src/app/App.tsx` (baris ~45–57)
**Dampak:** Sedang-Tinggi — semua tamu berbagi identitas yang sama

```typescript
// Kode bermasalah:
onGuestLogin={() => {
  setUser({
    id: 'guest-session-id',       // ← SAMA untuk semua tamu di seluruh dunia
    email: 'guest@nextvwt.local', // ← SAMA untuk semua tamu
    user_metadata: {
      full_name: infoText || 'Pebe Herianto',  // ← nama pribadi hardcoded
    },
    app_metadata: { provider: 'guest' },
    // ...
  } as User);
}}
```

Semua pengguna tamu akan memiliki `userId = 'guest-session-id'` yang identik, menyebabkan konflik di Supabase Presence, pesan PTT yang salah atribusi, dan potensi penyalahgunaan.

**Rekomendasi:**

```typescript
onGuestLogin={() => {
  const guestId = `guest-${crypto.randomUUID()}`;  // UUID unik per sesi
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

## 4. Temuan Tinggi

### 🟡 TINGGI-01: Tidak Ada TURN Server — WebRTC Gagal di Banyak Jaringan

**File:** `src/app/hooks/useAudioStreamer.ts` (baris ~30–33)

```typescript
const RTC_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],  // STUN saja
};
```

STUN server hanya membantu menemukan IP publik. Di belakang NAT simetris (umum pada jaringan seluler Indonesia — Telkomsel, XL, Indosat), WebRTC P2P akan **gagal total** tanpa TURN server sebagai relay. Koneksi akan fall-back ke transport base64 yang lebih lambat dan boros data.

**Rekomendasi:**

```typescript
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: process.env.VITE_TURN_USERNAME,
      credential: process.env.VITE_TURN_CREDENTIAL,
    },
  ],
};
```

Opsi TURN server: Twilio Network Traversal Service (berbayar, terkelola), Coturn self-hosted (gratis), atau Metered.ca (free tier tersedia).

---

### 🟡 TINGGI-02: Konflik Dependensi — MUI + Radix Sekaligus

**File:** `package.json`

Aplikasi mengimpor dua sistem UI besar yang saling tumpang tindih:

- **Material UI:** `@mui/material@7.3.5`, `@mui/icons-material@7.3.5`, `@emotion/react`, `@emotion/styled` — total ~400KB gzip
- **Radix UI + shadcn:** 30+ paket `@radix-ui/*` — total ~150KB gzip

Berdasarkan analisis kode sumber, **MUI tidak digunakan di mana pun** dalam komponen aktif. Semua komponen menggunakan shadcn/Radix.

**Dampak bundle yang tidak perlu:** +400KB transfer size, waktu load lebih lambat, konflik CSS-in-JS vs Tailwind.

**Rekomendasi:**

```bash
# Hapus dependensi MUI yang tidak dipakai:
pnpm remove @mui/material @mui/icons-material @emotion/react @emotion/styled @popperjs/core
```

---

### 🟡 TINGGI-03: Data Pengguna Riil Hardcoded di Source Code

**File:** `src/app/utils/config.ts` (array `CHANNELS`)

27 username pengguna nyata (contoh: `Pebri Haryanto`, `pak_rudi_rt`, `sar_team_1`) disimpan langsung di kode sumber. Ini bermasalah karena:

- Mengekspos daftar pengguna ke siapapun yang mengakses kode
- Tidak bisa dimodifikasi tanpa rebuild dan redeploy
- Tidak scalable untuk penambahan channel atau pengguna baru
- Melanggar prinsip pemisahan data dari kode

**Rekomendasi:** Migrasi ke tabel Supabase:

```sql
-- Schema yang disarankan:
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

## 5. Temuan Sedang

### 🟠 SEDANG-01: Tidak Ada React Error Boundary

**Dampak:** Crash satu komponen (misalnya `useAudioStreamer` gagal init) menyebabkan seluruh layar putih tanpa pesan error atau tombol recovery.

**Rekomendasi:**

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
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <h2>Terjadi kesalahan</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
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

- WebRTC peer connection management
- VAD (Voice Activity Detection)
- MediaRecorder chunking
- AudioContext playback
- Echo/delay effect chain
- Volume sync dari store

Ini melanggar Single Responsibility Principle dan membuat unit testing hampir tidak mungkin.

**Rekomendasi refactor:**

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

**Rekomendasi:**

1. Perpanjang expiration ke `2028-01-01` sebagai langkah sementara
2. Tambahkan pin backup dari intermediate CA cadangan
3. Catat tanggal review di kalender tim (6 bulan sebelum expiry)
4. Pertimbangkan OTA key rotation via remote config

---

### 🟠 SEDANG-04: Build Artifact Ter-commit ke Repositori

**Temuan:** Folder `dist/`, `android/.gradle/`, `android/app/build/`, dan file `nextvwt.apk` ikut masuk ke dalam ZIP meskipun `.gitignore` sudah mendaftarkannya.

**Dampak:** Ukuran repositori membengkak, git history kotor, APK debug ter-distribusi tanpa kontrol.

**Rekomendasi:**

```bash
# Hapus artifact dari tracking:
git rm -r --cached dist/ android/.gradle/ android/app/build/ nextvwt.apk
git commit -m "chore: remove build artifacts from tracking"
```

---

## 6. Temuan Rendah & Catatan Kualitas Kode

### 🔵 RENDAH-01: Scanning Channel Tidak Memiliki Delay yang Tepat

**File:** `src/app/components/RadioLayout.tsx`

```typescript
// Interval scan terlalu cepat (300ms per channel):
const interval = setInterval(() => {
  channelUp();
}, 300);
```

Setiap `channelUp()` memicu `subscribeToChannel()` baru. Dengan 300ms interval, ini akan membuat ratusan koneksi Supabase dalam hitungan detik.

**Rekomendasi:** Gunakan debounce, atau hanya scan channel yang terdaftar di `STATIC_CHANNELS`, bukan increment satu per satu.

---

### 🔵 RENDAH-02: `setProgress` Menggunakan `Math.random()` — Nilai Modulator Tidak Realistis

**File:** `src/app/components/RadioLayout.tsx`

```typescript
const interval = setInterval(() => {
  setProgress(Math.floor(Math.random() * 70) + 30); // 30–100 acak
}, 100);
```

Progress bar modulator menampilkan nilai acak yang tidak mencerminkan level audio sebenarnya. Ini kurang informatif dibanding analisis RMS yang sudah ada di VAD.

**Rekomendasi:** Sambungkan nilai `rms` dari VAD analyser ke progress bar untuk representasi level suara yang nyata.

---

### 🔵 RENDAH-03: `any` Type di Beberapa Tempat Kritis

**File:** `src/app/hooks/useAudioStreamer.ts`

```typescript
const handleSignaling = useCallback(async (payload: any) => { // ← any
const vadIntervalRef = useRef<any>(null);                       // ← any
```

**Rekomendasi:** Definisikan interface `WebRTCSignalingPayload` dan gunakan `ReturnType<typeof setInterval>` untuk interval ref.

---

### 🔵 RENDAH-04: Tidak Ada Rate Limiting pada Broadcast Transmisi

**File:** `src/app/store/usePTTStore.ts` — `broadcastVoiceChunk()`

Tidak ada throttling pada pengiriman chunk audio. Jika `MediaRecorder` menghasilkan chunk lebih cepat dari 255ms (karena kondisi sistem), Supabase bisa menerima flood broadcast dari satu user.

**Rekomendasi:** Tambahkan `maxChunksPerSecond` limiter di `broadcastVoiceChunk`.

---

### 🔵 RENDAH-05: Nama Default Hardcoded ('Pebe Herianto')

**File:** `src/app/store/usePTTStore.ts`

```typescript
const DEFAULT_SETTINGS = {
  infoText: 'Pebe Herianto',   // ← nama pribadi pengembang sebagai default
  locationText: 'BANDUNG, JAWA BARAT',
```

**Rekomendasi:** Gunakan placeholder generik seperti `'Pengguna Baru'` atau kosong `''`.

---

## 7. Kekuatan & Hal yang Sudah Baik

### ✅ Implementasi Audio WebRTC yang Matang

`useAudioStreamer.ts` mengimplementasikan:

- **Dual-path audio:** WebRTC P2P untuk real-time + fallback base64 via Supabase broadcast
- **VAD (Voice Activity Detection):** Menggunakan `AnalyserNode` dengan RMS threshold untuk mute otomatis saat silence — menghemat bandwidth mobile
- **Fast PTT track swapping:** Mengganti track di `RTCPeerConnection` tanpa renegotiasi, mengurangi latency
- **Role-based offer/answer:** UUID comparison untuk mencegah offer duplikat antar peer
- **ICE candidate queuing:** Kandidat yang datang sebelum `setRemoteDescription` di-queue dengan benar

### ✅ State Management yang Bersih

`usePTTStore.ts` dengan Zustand menerapkan:

- **Persisted keys** yang terpisah dari volatile runtime state
- **`safeGetStorage` / `safeSetStorage`** dengan try-catch untuk offline resilience
- **Idempotent `initializeSession`** — tidak re-run jika session sudah ada
- **Offline recovery** — settings dipulihkan dari localStorage saat startup

### ✅ Testing Coverage yang Baik

- **Unit tests:** 20+ test case di `usePTTStore.test.ts` dengan Vitest, mencakup channel navigation, power toggle, localStorage persistence, UUID generation, dan callSign handling
- **E2E tests:** 11 Playwright specs (app-boot, channel-scan, karaoke-ptt, layout-shift, modulation-simulation, multi-user-modulation, power-toggle, ptt-safeguards, screenshot-test, settings-flow, voice-streaming)
- Supabase di-mock dengan baik untuk offline testing

### ✅ Arsitektur White-Label Siap

`config.ts` dirancang sebagai single source of truth untuk branding:

- Nama, warna, slogan, channel prefix bisa diganti tanpa menyentuh komponen
- 8 tema CSS (classic, v1–v6, monokrom) sudah siap
- Dokumentasi inline yang jelas tentang cara white-label untuk klien baru

### ✅ Audio Mode Dua-Jalur yang Tepat

- **Discussion mode:** `echoCancellation: true`, `noiseSuppression: true`, `autoGainControl: true` — optimal untuk komunikasi suara
- **Music/Karaoke mode:** Semua filter dinonaktifkan, stereo channel, Opus 128kbps — optimal untuk transmisi musik
- Built-in echo/delay effect untuk mode karaoke dengan `echoFeedback` yang bisa dikonfigurasi

### ✅ TLS Certificate Pinning Android

`network_security_config.xml` mengimplementasikan SHA-256 pinning untuk domain Supabase dengan 4 pin (Let's Encrypt R3, E1, Cloudflare ECC CA-3, ISRG Root X1) — ini praktik keamanan yang jarang ditemukan di prototipe.

### ✅ PTT Button dengan UX Detail yang Baik

- Sound design otentik (pre-chirp dual-tone + squelch tail + Roger beep)
- Haptic feedback via `navigator.vibrate()`
- Keyboard Spacebar support untuk desktop
- Toggle mode vs Push-to-Hold yang bisa dikonfigurasi
- Animasi 3D press dengan CSS transform yang halus

---

## 8. Roadmap Rekomendasi

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

## 9. Ringkasan Skor

| Dimensi | Skor | Catatan |
|---|---|---|
| **Keamanan** | 40/100 | Credential bocor, izin Android hilang |
| **Arsitektur** | 75/100 | Solid secara umum, perlu refactor monolith |
| **Kualitas Kode** | 70/100 | TypeScript cukup ketat, beberapa `any` |
| **Testing** | 80/100 | Unit + E2E baik, perlu mock WebRTC |
| **UX & Audio** | 85/100 | Detail audio sangat baik |
| **Kesiapan Mobile** | 50/100 | Manifest tidak lengkap, belum iOS |
| **Skalabilitas** | 55/100 | Data statis, tidak ada TURN, tidak ada rate limit |
| **Dokumentasi** | 70/100 | Design spec ada, API docs kurang |

**Skor Keseluruhan: 65 / 100**

Prototipe ini menunjukkan potensi produk yang kuat dan implementasi teknis audio yang jarang terlihat di tahap prototipe. Dengan menyelesaikan temuan kritis dalam Fase 1 dan 2, skor dapat meningkat ke **80+/100** dan aplikasi siap untuk beta testing terbatas.

---

*Laporan ini dibuat berdasarkan analisis statis kode sumber. Audit dinamis (runtime behavior, load testing, penetration testing) direkomendasikan sebelum peluncuran produksi.*

*Disiapkan: 7 Juni 2026*
