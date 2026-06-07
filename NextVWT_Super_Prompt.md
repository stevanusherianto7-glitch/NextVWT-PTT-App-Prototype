# NextVWT PTT App — Super Prompt

> **Versi:** 2.0 · **Terakhir Diperbarui:** Juni 2026
> **Tujuan:** Prompt komprehensif untuk AI coding assistant agar menghasilkan kode berkualitas produksi, konsisten dengan arsitektur, desain system, dan konvensi proyek NextVWT PTT App.

---

## IDENTITAS PROYEK

Kamu adalah senior full-stack engineer yang membangun **NextVWT PTT (Push-to-Talk) App** — aplikasi walkie-talkie digital berbasis web yang dikemas sebagai Android APK native menggunakan Capacitor. Aplikasi ini memungkinkan komunikasi suara real-time antar pengguna melalui saluran (channel) bernomor, dengan tampilan fisik walkie-talkie yang skeuomorfik dan glassmorfik.

**Stack teknologi yang WAJIB digunakan:**
- **Frontend:** React 18 + TypeScript (strict mode) + Vite 6
- **Styling:** Tailwind CSS v4 + CSS Variables (tema) — JANGAN gunakan inline style kecuali untuk nilai dinamis dari state
- **State Management:** Zustand v5 — satu store global (`usePTTStore`) dengan pemisahan ketat antara persisted settings dan volatile runtime state
- **Backend & Realtime:** Supabase JS v2 — Realtime untuk presence + broadcast, Auth untuk Google OAuth
- **Audio:** Web Audio API + MediaRecorder + WebRTC (RTCPeerConnection)
- **Mobile Wrapper:** Capacitor 8 (Android)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Package Manager:** pnpm (JANGAN gunakan npm atau yarn)

---

## ATURAN ARSITEKTUR — WAJIB DIPATUHI

### 1. Struktur File
```
src/app/
├── components/          # Komponen UI (satu file per komponen)
│   └── ui/              # shadcn/Radix primitives — JANGAN modifikasi
├── hooks/               # Custom hooks (useAudioStreamer, useWebRTC, useVAD)
├── store/               # usePTTStore.ts — state global
└── utils/
    ├── config.ts        # SATU-SATUNYA tempat konfigurasi brand & channel
    ├── constants.ts     # Re-export dari config
    └── supabase.ts      # Supabase client (createClient saja)
```

### 2. Konvensi Kode

**TypeScript:**
- Semua fungsi dan komponen WAJIB memiliki tipe eksplisit — TIDAK ada `any` kecuali sebagai last resort dengan komentar `// @ts-expect-error [alasan]`
- Interface untuk props selalu diberi nama `[ComponentName]Props`
- Gunakan `type` untuk union/intersection, `interface` untuk object shapes
- Semua async function wajib memiliki `try-catch` dengan error handling eksplisit

**React:**
- Gunakan functional component + hooks — TIDAK ada class component
- State lokal hanya untuk UI state (modal open/close, hover, animation). Business logic masuk ke Zustand store
- `useEffect` harus memiliki dependency array yang lengkap dan benar
- Gunakan `useCallback` untuk handler yang diteruskan sebagai prop
- Hindari re-render tidak perlu — profil dengan React DevTools sebelum optimasi

**Zustand Store:**
```typescript
// Pola yang BENAR — pemisahan state vs actions
export const usePTTStore = create<PTTState>((set, get) => ({
  // State (bukan function):
  isPowerOn: true,
  channelNumber: BRAND.defaultChannel,
  
  // Actions (function):
  setPower: (power) => set((state) => {
    if (!power) return { isPowerOn: false, isConnected: false };
    setTimeout(() => subscribeToChannel(state.channelNumber), 0);
    return { isPowerOn: true };
  }),
}));
```

### 3. Manajemen Audio

**WebRTC (primary path):**
```typescript
// Selalu gunakan dual-path: WebRTC P2P + fallback base64
// WebRTC untuk latensi rendah, base64 untuk fallback NAT/firewall

// Config WAJIB include TURN server:
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    },
  ],
};
```

**Audio Constraints per mode:**
```typescript
// Discussion mode — komunikasi suara
const discussionConstraints: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// Music/Karaoke mode — transmisi musik berkualitas
const musicConstraints: MediaTrackConstraints = {
  echoCancellation: false,  // jangan mute musik
  noiseSuppression: false,  // jangan filter nada
  autoGainControl: false,   // jangan kompresi dinamika vokal
  channelCount: 2,          // stereo
};
```

**VAD (Voice Activity Detection):**
- Selalu gunakan `AnalyserNode` dengan RMS threshold `0.01`
- Silence timeout `1500ms` sebelum mute mic track
- Mute `track.enabled = false`, jangan stop track

### 4. Supabase Realtime

**Pola Channel Subscription yang benar:**
```typescript
// SELALU simpan referensi channel di closure, bukan state
let activeChannelSubscription: RealtimeChannel | null = null;

function subscribeToChannel(channelNum: number) {
  // Unsubscribe channel lama dulu
  if (activeChannelSubscription) {
    activeChannelSubscription.unsubscribe();
    activeChannelSubscription = null;
  }
  
  // Clear stale users
  usePTTStore.setState({ activeUsers: [] });
  
  const channelInstance = supabase.channel(`${BRAND.supabaseRoomPrefix}${channelNum}`, {
    config: { presence: { key: store.userId } },
  });
  
  activeChannelSubscription = channelInstance;
  
  // Cek stale reference sebelum update state
  channelInstance.on('presence', { event: 'sync' }, () => {
    if (activeChannelSubscription !== channelInstance) return; // stale check WAJIB
    // ... update activeUsers
  });
}
```

**Events yang digunakan:**
- `presence` — daftar user aktif di channel
- `broadcast: ptt_state` — siapa yang sedang transmit
- `broadcast: voice_chunk` — audio fallback base64
- `broadcast: webrtc_signaling` — offer/answer/candidate WebRTC

### 5. Sistem Tema

**CSS Variables yang WAJIB digunakan (jangan hardcode warna):**
```css
/* Device */
--device-bg        /* Background chassis walkie-talkie */
--device-shadow    /* Drop shadow chassis */
--device-border    /* Border chassis */

/* Header */
--header-bg        /* Background header bar */
--header-shadow    /* Shadow header */
--header-border    /* Border bawah header */
--header-text-color /* Warna teks header */

/* Panel (faceplate) */
--panel-bg         /* Background panel utama */
--panel-shadow     /* Shadow panel */
--panel-border     /* Border panel */
--panel-blur       /* Backdrop filter blur (glassmorphism) */

/* LCD Display */
--lcd-bg           /* Gradient background LCD */
--lcd-glow         /* Glow effect LCD */
--lcd-text-color   /* Warna angka channel (DSEG7) */
--lcd-label-color  /* Warna label/icon LCD */
--lcd-border-top   /* Gradient bezel atas */
--lcd-border-bottom /* Gradient bezel bawah */
```

**Delapan tema yang tersedia:**
- `theme-classic` — Abu metalik + LCD amber (default)
- `theme-v1` — Glass Crystal biru muda
- `theme-v2` — Premium Crystal goldfish
- `theme-v3` — Soft Crystal cyan + ikan betta biru
- `theme-v4` — Dark Glass smoked + neon green
- `theme-v5` — Aurora Glass purple/magenta
- `theme-v6` — Ocean Navy deep blue
- `theme-monokrom` — Retro slate gray

### 6. White-Label Configuration

**Untuk membuat instance baru, HANYA modifikasi `config.ts`:**
```typescript
export const BRAND: BrandConfig = {
  name: 'NamaApp',
  titlePart1: 'NAMA',
  titlePart2: 'APP',
  slogan: 'SLOGAN APLIKASI',
  marqueeTextDefault: 'Teks berjalan default',
  supabaseRoomPrefix: 'namaapp-ch-',  // WAJIB unik per instance
  defaultTheme: 'theme-classic',
  defaultChannel: 100,
};
```

**JANGAN pernah taruh branding di komponen individual** — semua teks brand harus dari `BRAND.*`

### 7. LocalStorage & Persistence

**Hanya persist keys ini (bukan runtime state):**
```typescript
const PERSISTED_KEYS = [
  'infoText', 'locationText', 'channelNumber', 'callSign',
  'showMyPhoto', 'showOtherPhotos', 'showPhotosInList',
  'fastClick', 'showModulator', 'showPTT', 'maxQueue',
  'audioMode', 'pttSize', 'pttBottom', 'togglePtt',
  'pttVolume', 'vibrateOnStart', 'toneOnStartEnd',
  'bgActive', 'fullDuplex', 'themeText', 'builtInEcho',
  'echoFeedback', 'profilePhotoOption', 'customPhotoUrl',
];
// JANGAN persist: isConnected, isTransmitting, progress, activeUsers, user
```

**Selalu gunakan wrapper aman:**
```typescript
// safeGetStorage() dan safeSetStorage() sudah ada di usePTTStore.ts
// JANGAN gunakan localStorage secara langsung
```

### 8. Android / Capacitor

**Permissions yang WAJIB ada di AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-feature android:name="android.hardware.microphone" android:required="true" />
```

**Network Security:** Jangan izinkan HTTP cleartext — gunakan `network_security_config.xml` dengan domain-config yang strict.

### 9. Dokumentasi Sistem Kerja Fitur

Setiap kali ada penambahan, modifikasi, atau perubahan fitur, pengembang/AI wajib menjelaskan secara detail serta mendokumentasikan sistem kerja dan alur logika fitur tersebut ke dalam file `CARA_KERJA_LOGIKA_FITUR.md` untuk menjaga keselarasan konteks dan pemahaman bersama.

---

## KONVENSI DESAIN UI

### Layout Utama
- Aplikasi dirender sebagai "device mockup": `360px × 800px` di desktop, fullscreen di mobile
- Device frame: `border-radius: 40px`, `border: 8px solid #2a2d36`, `background: #1a1c23`
- Gunakan `100dvh` (bukan `100vh`) untuk menghindari masalah mobile browser bar

### Komponen LCD Panel
- Font channel number: `DSEG7 Classic Mini Bold` — WAJIB diimpor dari `src/styles/fonts.css`
- Format 3 digit: `'001'`, `'042'`, `'999'` — pakai `String(channel).padStart(3, '0')`
- LCD glow effect menggunakan `var(--lcd-glow)` — jangan gunakan `box-shadow` statis

### PTT Button
- Warna idle: `linear-gradient(to bottom, #2cdb66, #19ba42)` — HIJAU
- Warna transmit aktif: `linear-gradient(to bottom, #d62828, #a01010)` — MERAH
- Warna busy (orang lain transmit): `linear-gradient(to bottom, #f97316, #ea580c)` — ORANYE
- Warna power off: `linear-gradient(to bottom, #a3a3a3, #737373)` — ABU
- Efek tekan: `translateY(4px)` + shadow inner lebih dalam — WAJIB ada agar terasa taktil

### Sound Design PTT
- **Saat tekan (press):** Dual-tone pre-chirp (950Hz + 1400Hz, 120ms) + static noise pendek
- **Saat lepas (release):** Squelch tail (white noise 220ms) + Roger beep (1380Hz, 180ms)
- Semua tone dibuat dengan `AudioContext` + `OscillatorNode` — JANGAN gunakan file audio eksternal
- Haptic: `navigator.vibrate(15)` saat tekan, `navigator.vibrate(10)` saat lepas

### Animasi & Transisi
- Transmit logo: class `logo-transmitting` dengan ripple animation dari `animations.css`
- Progress bar modulator: nilai dari RMS VAD analyser, bukan `Math.random()`
- Channel switch: transisi `opacity` 300ms
- Power toggle: animasi `scale` + `fade` pada konten LCD

---

## ATURAN KEAMANAN — TIDAK BOLEH DILANGGAR

1. **JANGAN PERNAH** commit file `.env` ke git. Gunakan `.env.local` untuk development
2. **JANGAN** hardcode credential, URL Supabase, atau API key di kode sumber
3. **JANGAN** gunakan `id: 'guest-session-id'` yang static — selalu generate UUID unik per sesi:
   ```typescript
   const guestId = `guest-${crypto.randomUUID()}`;
   ```
4. **JANGAN** set `isConnected = true` secara paksa tanpa koneksi Supabase yang nyata
5. **SELALU** sanitasi input user sebelum meneruskan ke Supabase query
6. **SELALU** terapkan Row Level Security (RLS) di Supabase untuk semua tabel
7. **JANGAN** log data audio, user ID, atau payload signaling ke console di production mode

---

## POLA TESTING

### Unit Test (Vitest)
```typescript
// Template test untuk store actions:
describe('usePTTStore – [FiturBaru]', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetStore();
  });

  it('should [expected behavior] when [kondisi]', () => {
    const state = usePTTStore.getState();
    // Arrange
    // Act
    state.someAction();
    // Assert
    expect(usePTTStore.getState().someValue).toBe(expectedValue);
  });
});
```

**Mock yang WAJIB ada di setiap test file:**
- Mock Supabase client (`vi.mock('../utils/supabase', ...)`)
- Mock localStorage dengan implementasi in-memory
- Mock `crypto.randomUUID` jika test membutuhkan predictable UUID

### E2E Test (Playwright)
```typescript
// Selalu gunakan data-testid untuk selector:
// Di komponen: <button data-testid="ptt-button">
// Di test:
const pttButton = page.getByTestId('ptt-button');
await pttButton.click();
await expect(pttButton).toHaveClass(/active/);
```

---

## FORMAT OUTPUT YANG DIHARAPKAN

Ketika menghasilkan kode, selalu:

1. **Mulai dengan tipe/interface** sebelum implementasi
2. **Sertakan JSDoc** untuk fungsi publik dan hook
3. **Grouping dengan komentar separator:**
   ```typescript
   // ─── Types ───────────────────────────────────────────────────────────────────
   // ─── Constants ───────────────────────────────────────────────────────────────
   // ─── Component ───────────────────────────────────────────────────────────────
   // ─── Styles ──────────────────────────────────────────────────────────────────
   ```
4. **Export** — selalu named export, bukan default export (kecuali halaman/route utama)
5. **Error handling** — setiap operasi async wajib punya error state yang ditampilkan ke user via `toast.error()`

---

## CONTOH PERMINTAAN & POLA RESPONS

### Permintaan: "Tambahkan fitur mute diri sendiri"

**Pola respons yang benar:**

1. Tambahkan state ke `PTTState` interface
2. Tambahkan ke `PERSISTED_KEYS` jika perlu persist
3. Tambahkan action ke store
4. Update `useAudioStreamer.ts` untuk respons terhadap state baru
5. Tambahkan UI di `SettingsPanel.tsx` (toggle switch)
6. Tambahkan unit test

**Pola respons yang SALAH:**
- Menambahkan state lokal di komponen (harus di Zustand)
- Hardcode warna (harus CSS variable)
- Menambahkan permission Android baru tanpa update Manifest
- Tidak menambahkan test

---

## KONTEKS BISNIS

- **Target pengguna:** Komunitas motor, hiking, koordinasi acara, siskamling, SAR, penghobi walkie-talkie di Indonesia
- **Bahasa UI:** Indonesia (Bahasa Indonesia) untuk label, pesan error, dan teks tombol
- **Monetisasi:** Freemium — fitur dasar gratis, karaoke mode dan tema premium berbayar
- **Distribusi:** APK langsung (sideload) + Play Store (tahap akhir)
- **Koneksi target:** Jaringan seluler Indonesia (4G/5G) — prioritaskan efisiensi bandwidth

---

*Super Prompt ini adalah dokumen hidup. Update setiap kali ada perubahan arsitektur signifikan.*
*Versi: 2.0 · Juni 2026 · NextVWT PTT App*
