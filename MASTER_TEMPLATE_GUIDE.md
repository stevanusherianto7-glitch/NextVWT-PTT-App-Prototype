# 📻 NextVWT - Master Ultimate Walkie-Talkie Template Guide

Selamat datang di Panduan Master Ultimate Template. Repositori ini dirancang khusus sebagai arsitektur dasar (*base framework*) modular untuk membangun aplikasi komunikasi Push-to-Talk (PTT) Walkie-Talkie berkinerja tinggi, baik untuk operasional restoran terpadu (seperti Guest ➔ Waiter ➔ Kitchen pada **Pawon Salam Resto** / **Kedai Elvera 57**) maupun proyek komunikasi taktis retail lainnya.

---

## 🏗️ 1. Arsitektur Kode (Codebase Directory Structure)

Template ini menggunakan React + TypeScript + Zustand + Supabase dengan struktur berkas sebagai berikut:

```
├── src/
│   ├── app/
│   │   ├── components/       # Komponen UI Tactile 3D (LCD, PTT, D-Pad, Modals)
│   │   ├── hooks/            # Logika Audio Streamer & WebRTC Signaling
│   │   ├── store/            # State Management Zustand (usePTTStore.ts)
│   │   └── utils/
│   │       ├── config.ts     # 🎛️ BERKAS UTAMA BRANDING & KONFIGURASI TEMPLATE
│   │       ├── constants.ts  # Pembungkus static channels
│   │       └── supabase.ts   # Klien koneksi Supabase
│   └── styles/
│       ├── theme.css         # Token warna 8 Tema Global (Classic, Aurora, V6, dll)
│       └── animations.css    # Animasi taktil ripple gelombang transmisi
```

---

## 🎛️ 2. Kustomisasi Branding & Saluran (White-Labeling)

Untuk membuat aplikasi walkie-talkie baru, Anda hanya perlu memodifikasi berkas [config.ts](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/utils/config.ts):

### A. Mengubah Data Identitas Brand
Ubah objek `BRAND` untuk menyesuaikan teks dan perilaku bawaan aplikasi:
```typescript
export const BRAND: BrandConfig = {
  name: 'PawonSalam-PTT',              // Nama brand utama
  titlePart1: 'PAWON',                 // Bagian 1 logo teks
  titlePart2: 'SALAM',                 // Bagian 2 logo teks
  slogan: 'PAWON SALAM RESTO PTT SYSTEM',
  marqueeTextDefault: 'Sistem PTT Pawon Salam Resto - Komunikasi Lancar Tanpa Batas',
  supabaseRoomPrefix: 'pawonsalam-ch-',// Namespace unik room Supabase
  defaultTheme: 'theme-v6',            // Tema bawaan perangkat
  defaultChannel: 1,                   // Saluran aktif bawaan
};
```

### B. Mengubah Daftar Channel Default
Ubah array `CHANNELS` untuk menyesuaikan kebutuhan divisi operasional restoran Anda:
```typescript
export const CHANNELS: ChannelConfigItem[] = [
  { number: 0, name: 'DUKUNGAN & KASIR', type: 'green', users: [] },
  { number: 1, name: 'DIVISI KITCHEN (DAPUR)', type: 'green', users: [] },
  { number: 2, name: 'DIVISI WAITER (PRAMUSAJI)', type: 'green', users: [] },
  { number: 3, name: 'DIVISI BAR & MINUMAN', type: 'green', users: [] },
  { number: 4, name: 'RESTRICTED ADMIN & OWNER', type: 'red', users: [] }, // Channel Terkunci
];
```

### C. Mengubah Konfigurasi Visual (Opsional)
Ubah `VISUAL_CONFIG` untuk menyesuaikan palet warna, efek bayangan, dan animasi aplikasi Anda:
```typescript
export const VISUAL_CONFIG = {
  colors: {
    primary: '#00C853',      // Warna hijau primary PTT button
    secondary: '#FF9800',    // Warna oranye secondary LCD panel
    accent: '#FF3D00',       // Warna merah accent (danger, TX indicator)
    success: '#22C55E',      // Warna hijau success (progress bar)
  },
  shadows: {
    button3D: '0 6px 0 #000000',  // Efek 3D untuk tombol control
  },
  animation: {
    normal: '300ms',         // Durasi animasi standar
  },
};
```

---

## 🎨 2.1. Contoh Praktis White-Labeling: Pawon Salam Resto PTT

Berikut adalah contoh lengkap bagaimana mengubah NextVWT menjadi aplikasi PTT untuk **Pawon Salam Resto**:

### Langkah 1: Edit `src/app/utils/config.ts`

```typescript
// Branding
export const BRAND: BrandConfig = {
  name: 'PawonSalam-PTT',
  titlePart1: 'PAWON',
  titlePart2: 'SALAM',
  slogan: 'PAWON SALAM RESTO PTT SYSTEM',
  marqueeTextDefault: 'Sistem PTT Pawon Salam Resto - Koordinasi Dapur & Pramusaji Seamless',
  supabaseRoomPrefix: 'pawonsalam-ch-',
  defaultTheme: 'theme-v6',
  defaultChannel: 1,
};

// Channels untuk operasional restoran
export const CHANNELS: ChannelConfigItem[] = [
  { number: 0, name: 'SUPPORT & KASIR (CH-00)', type: 'green', users: [] },
  { number: 1, name: 'KITCHEN MAIN (DAPUR UTAMA)', type: 'green', users: [] },
  { number: 2, name: 'WAITER TEAM A (LANTAI 1)', type: 'green', users: [] },
  { number: 3, name: 'WAITER TEAM B (LANTAI 2)', type: 'green', users: [] },
  { number: 4, name: 'BAR & BEVERAGE (MINUMAN)', type: 'green', users: [] },
  { number: 5, name: 'DELIVERY & PACKAGE', type: 'green', users: [] },
  { number: 99, name: 'ADMIN OWNER (TERKUNCI)', type: 'red', users: [] },
];

// Visual branding khusus Pawon Salam (restoran style)
export const VISUAL_CONFIG = {
  colors: {
    primary: '#D4AF37',      // Warna emas (prestige restoran)
    secondary: '#8B4513',    // Warna cokelat (warm & elegant)
    accent: '#FF6B6B',       // Warna merah muda (softer than NextVWT)
  },
};
```

### Langkah 2: Build & Deploy

```bash
# Build untuk production
npm run build

# Sinkronisasi dengan Android
npx cap sync android

# Buka Android Studio dan build APK
npx cap open android
```

### Langkah 3: Distribusi

Distribusikan file `.apk` ke semua staff Pawon Salam Resto untuk instalasi di perangkat Android mereka.

---

## ⚡ 3. Konfigurasi Backend & Realtime Supabase

Aplikasi ini menggunakan fitur **Supabase Realtime** sebagai tulang punggung pengiriman suara dan koordinasi pengguna tanpa database lag.

### A. Mengaktifkan Supabase Realtime Broadcast & Presence
1. Masuk ke **Supabase Dashboard** proyek Anda.
2. Navigasikan ke menu **Database** ➔ **Publications**.
3. Pastikan publikasi `supabase_realtime` diaktifkan untuk melacak perubahan.
4. Di bagian **Realtime Settings**, pastikan **Broadcast** (untuk pengiriman suara instan) dan **Presence** (untuk pelacakan staf yang sedang online di saluran) dalam kondisi aktif.

### B. Struktur Tabel User Profiles (Pilihan)
Untuk menyimpan nama staf dan penugasan meja (misal: Waiter Meja A1-A9), buat tabel `profiles` menggunakan SQL berikut di Editor SQL Supabase:

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  call_sign text,
  location text,
  avatar_url text,
  role text check (role in ('guest', 'waiter', 'kitchen', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Kebijakan RLS agar pengguna hanya bisa membaca profil lain dan mengupdate profil sendiri
create policy "Allow public read access" on public.profiles for select using (true);
create policy "Allow individual update" on public.profiles for update using (auth.uid() = id);
```

---

## 📶 4. Logika Alur Transmisi & Ketahanan Sistem (Offline Ready)

### A. Alur Hybrid Suara (WebRTC + Base64 Fallback)
1. **WebRTC Peer-to-Peer** *(Utama)*: Digunakan saat koneksi internet stabil. Suara dikirim langsung antar-perangkat secara berkapasitas stereo tinggi (128kbps Opus) menggunakan Server STUN Google bawaan.
2. **Base64 Audio Chunking** *(Fallback)*: Jika WebRTC gagal tersambung (karena firewall restoran atau limitasi NAT), aplikasi otomatis mengirimkan potongan audio base64 berdurasi 255ms melalui Supabase Broadcast (`voice_chunk`) sehingga percakapan tidak terputus.

### B. Ketahanan Terhadap Masalah Jaringan (Zero-Data-Loss)
*   **Penyimpanan Selektif**: Zustand store hanya menyimpan preferensi visual ke `localStorage`. Data live transmisi dibersihkan otomatis saat halaman dimuat ulang guna mencegah status gantung (*stuck*).
*   **Safe Storage Wrapper**: Penulisan dan pembacaan `localStorage` dibungkus blok `try-catch`. Jika memori perangkat penuh, aplikasi tetap berjalan normal menggunakan data di memori sementara.
*   **Pembersihan Power Off**: Menekan sakelar daya fisik (Power Switch) ke posisi OFF secara instan memutuskan koneksi jaringan real-time Supabase dan menghentikan seluruh antrean audio untuk menghemat daya baterai.

---

## 📱 5. Panduan Kompilasi Aplikasi Android (Capacitor)

Untuk mengemas template web ini menjadi aplikasi Android restoran (.apk):

1. **Inisialisasi Capacitor** (jika belum diinisialisasi):
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init [Nama-Aplikasi] [id.co.brand.app] --web-dir=dist
   ```
2. **Tambahkan Platform Android**:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```
3. **Build & Sinkronisasi Kode**:
   Setiap kali Anda mengubah branding di `config.ts`, jalankan perintah berikut:
   ```bash
   npm run build
   npx cap sync android
   ```
4. **Buka Studio Proyek & Compile**:
   ```bash
   npx cap open android
   ```
   Di Android Studio, pilih **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)** untuk membuat berkas instaler restoran Anda.

---

## 🛠️ 6. Pemeliharaan & Pengujian Kualitas Kode (CI/CD Pipeline)

Untuk memastikan kualitas kode template master ini tetap prima sebelum dideploy ke Vercel atau diproduksi:

*   **Format Kode**: `npm run format`
*   **Linting TypeScript**: `npm run lint`
*   **Kompilasi Produksi**: `npm run build`
*   **Uji Fungsi (Unit Test)**: `npm test`

---

## 🔗 7. Integrasi Supabase Mendalam (Database Schema & RLS)

### A. Setup Database Awal (First Time Only)

Buka **SQL Editor** di Supabase Dashboard dan jalankan script berikut untuk membuat infrastruktur database:

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLE: profiles (User Profiles dengan Role-Based Access)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  call_sign TEXT,
  location TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('guest', 'waiter', 'kitchen', 'admin')),
  phone TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Siapa saja bisa baca profil (untuk konteks chat/presence)
CREATE POLICY "Allow public read access" 
  ON public.profiles FOR SELECT USING (true);

-- Policy: User hanya bisa update profil mereka sendiri
CREATE POLICY "Allow individual update" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policy: User baru bisa insert profil mereka sendiri
CREATE POLICY "Allow individual insert" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: voice_messages (Opsional: Simpan riwayat voice chunks)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.voice_messages (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  channel_number INTEGER NOT NULL,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE,
  audio_base64 TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index untuk query cepat by channel
CREATE INDEX idx_voice_messages_channel ON public.voice_messages(channel_number);
CREATE INDEX idx_voice_messages_created ON public.voice_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;

-- Policy: User bisa insert voice message
CREATE POLICY "Allow insert voice messages" 
  ON public.voice_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policy: Siapa saja bisa baca voice messages (grup/channel komunikasi)
CREATE POLICY "Allow read voice messages" 
  ON public.voice_messages FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: channel_logs (Opsional: Audit trail untuk compliance)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.channel_logs (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  channel_number INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,  -- 'join', 'leave', 'transmit_start', 'transmit_end'
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index untuk query cepat
CREATE INDEX idx_channel_logs_channel ON public.channel_logs(channel_number);
CREATE INDEX idx_channel_logs_user ON public.channel_logs(user_id);
CREATE INDEX idx_channel_logs_created ON public.channel_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.channel_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins dapat baca semua logs, regular users hanya log mereka sendiri
CREATE POLICY "Users can view their own logs or admin views all" 
  ON public.channel_logs FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

### B. Konfigurasi Realtime di Supabase Dashboard

1. Buka **Supabase Dashboard** ➔ **Database** ➔ **Publications**
2. Cari publikasi `supabase_realtime`
3. Pastikan tabel berikut ter-check:
   - `profiles` ✓
   - `voice_messages` ✓
   - `channel_logs` ✓

4. Di **Realtime** sidebar, pastikan:
   - **Broadcast** = ON (untuk voice_chunk real-time)
   - **Presence** = ON (untuk pelacakan user online)

### C. Setup Presence Channels di usePTTStore.ts

Aplikasi sudah menggunakan:
```typescript
const channelInstance = supabase.channel(`${BRAND.supabaseRoomPrefix}${channelNum}`, {
  config: {
    presence: {
      key: store.userId || 'anonymous',
    },
  },
});
```

Ini otomatis melacak siapa yang online di setiap channel PTT.

---

## 🎯 8. Kustomisasi Lanjutan: Multi-Store & Multi-Region Deployment

Jika Anda menjalankan **beberapa restoran/toko** dengan Supabase projects berbeda:

### A. Environment Configuration

Edit `.env`:
```bash
# Next VWT Instance
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# Untuk multi-store, buat env files terpisah:
# .env.pawonsalam
# .env.kedaielvera
# .env.kafe-sentosa
```

### B. Build Script untuk Multi-Store

Buat `scripts/build-branded.sh`:

```bash
#!/bin/bash

# Build untuk berbagai brand
declare -a BRANDS=("pawonsalam" "kedaielvera" "kafesentosa")

for brand in "${BRANDS[@]}"
do
  echo "Building for $brand..."
  
  # Load environment
  cp .env.$brand .env
  
  # Update config.ts dengan brand spesifik
  # (Bisa automated dengan script Node.js)
  
  # Build
  npm run build
  
  # Sync dengan Capacitor
  npx cap sync android
  
  # Output ke folder terpisah
  mkdir -p dist/$brand
  cp -r dist/* dist/$brand/
  
  echo "✓ $brand built successfully"
done

echo "All brands built!"
```

---

## 🔐 9. Keamanan & Best Practices

### A. Row Level Security (RLS) Strategy

Rekomendasi kebijakan untuk restauran multi-level:

```sql
-- Admin bisa lakukan apapun
CREATE POLICY "Admin full access" 
  ON public.profiles FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Waiter hanya bisa liat profil kitchen & other waiters, tidak bisa liat admin
CREATE POLICY "Waiter limited view" 
  ON public.profiles FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'waiter' AND
    role IN ('kitchen', 'waiter', 'guest')
  );

-- Kitchen hanya bisa liat waiter & other kitchen, tidak bisa liat admin
CREATE POLICY "Kitchen limited view" 
  ON public.profiles FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'kitchen' AND
    role IN ('waiter', 'kitchen', 'guest')
  );
```

### B. Audio Security

- ✅ Semua voice chunks dienkripsi TLS in-transit (otomatis Supabase HTTPS)
- ✅ Audio data tidak disimpan di server (hanya di-relay real-time)
- ✅ Bisa enable Supabase "Encryption at Rest" untuk extra safety

### C. Rate Limiting

Tambahkan edge function untuk limit transmisi per user:

```sql
-- Rate limit: Maksimal 10 voice chunks per 10 detik per user
CREATE OR REPLACE FUNCTION public.check_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM public.voice_messages
    WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '10 seconds'
  ) >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rate_limit
  BEFORE INSERT ON public.voice_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_rate_limit();
```

---

## 💾 10. Offline-First Architecture & Local Storage

### A. Zustand Store Persistence

Aplikasi sudah menggunakan localStorage untuk:
- Theme preference
- User location
- Audio settings (volume, echo)

Struktur stored:
```typescript
const LS_KEY = 'nextvwt_settings';
// Menyimpan: infoText, locationText, audioMode, pttVolume, dll
```

### B. Offline Voice Queue

Ketika internet down, aplikasi:
1. ✅ Tetap record audio lokal
2. ✅ Queue chunks di memory
3. ✅ Otomatis retry saat internet kembali
4. ✅ Atau fallback ke loopback playback (echo local)

Implementasi di `useAudioStreamer.ts`:
```typescript
// Queue dipertahankan selama session aktif
const audioQueue: AudioChunk[] = [];

// Saat network kembali, kirim ulang
setInterval(() => {
  if (isConnected && audioQueue.length > 0) {
    // Flush queue ke server
    flushAudioQueue();
  }
}, 5000);
```

---

## 🚀 11. Deployment Checklist: From Dev to Production

### A. Pre-Production Verification

```bash
# 1. Clean build
npm run clean
npm run build

# 2. Linting & formatting
npm run lint
npm run format

# 3. Type check
npm run type-check

# 4. Run tests (jika ada)
npm test

# 5. Manual browser test
npm run dev
# Test: Login → Join Channel → PTT → Receive → Theme change
```

### B. Android APK Production Build

```bash
# 1. Ensure Capacitor synced
npx cap sync android

# 2. Open Android Studio
npx cap open android

# 3. In Android Studio:
#    - Build ➔ Build Bundle(s)/APK(s) ➔ Build APK(s)
#    - Select Release variant
#    - Sign with keystore (jika ada)

# 4. APK location:
#    android/app/build/outputs/apk/release/app-release.apk

# 5. Optimize APK:
#    - Min SDK: 21 (Android 5.0+)
#    - Target SDK: 34+ (latest)
```

### C. Supabase Project Hardening

1. ✅ Enable MFA untuk admin Supabase account
2. ✅ Setup RLS untuk semua tabel
3. ✅ Enable Postgres Backup (automatic daily)
4. ✅ Setup monitoring & alerting
5. ✅ Review auth policies regularly

---

## 🐛 12. Troubleshooting & Common Issues

### Issue 1: Audio tidak terdengar

**Gejala**: Tombol PTT berfungsi tapi tidak ada suara dari penerima

**Solusi**:
```bash
# 1. Check microphone permission (Android)
- Settings ➔ Apps ➔ Permissions ➔ Microphone

# 2. Check browser console
npm run dev
# Open DevTools (F12) → Console tab
# Lihat pesan error dari useAudioStreamer

# 3. Test WebRTC connectivity
# Check if STUN server accessible
# Default: stun:stun.l.google.com:19302

# 4. Fallback ke Base64 mode
# Cek di usePTTStore.ts line 240: broadcastVoiceChunk()
```

### Issue 2: Supabase realtime tidak update

**Gejala**: Presence tidak update, user list kosong

**Solusi**:
```typescript
// Check di browser console:
supabase.channel('ptt-room-1').subscribe(status => {
  console.log('Channel status:', status);
});

// Verify di Supabase Dashboard:
// Database ➔ Publications ➔ Check supabase_realtime is enabled
```

### Issue 3: Build gagal dengan "Module not found"

**Gejala**: `npm run build` error: "Cannot find module 'xyz'"

**Solusi**:
```bash
# 1. Clear node_modules & reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Check TypeScript config
npx tsc --noEmit

# 3. Verify import paths
# Make sure all relative imports are correct
```

### Issue 4: Android APK terlalu besar (> 100 MB)

**Gejala**: APK size excessive, slow download

**Solusi**:
```bash
# 1. Enable code splitting di vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'zustand', '@supabase/supabase-js'],
      }
    }
  }
}

# 2. Minimize assets
# Use image optimization, remove unused fonts

# 3. Enable minification (already enabled)
```

---

## 📞 13. Support & Community Resources

### A. Dokumentasi Official

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Zustand**: https://github.com/pmndrs/zustand
- **Supabase**: https://supabase.com/docs
- **Capacitor**: https://capacitorjs.com/docs

### B. Debugging Tools

```bash
# Chrome DevTools untuk web
F12 dalam browser Chrome

# Supabase Studio untuk database/realtime
Dashboard → Studio (bawaan)

# Android Studio Logcat untuk Android
npx cap open android ➔ View ➔ Tool Windows ➔ Logcat
```

### C. Performance Monitoring

```typescript
// Tambahkan di App.tsx untuk monitor
console.time('Audio encode');
// ... audio processing ...
console.timeEnd('Audio encode');

// Check browser Performance tab (DevTools → Performance)
```

---

## 🎓 14. Advanced Customization: Branding Lengkap

Untuk kontrol penuh atas branding, edit file-file ini:

### A. Warna & Typography (CSS)

**File**: `src/styles/theme.css`

```css
/* Override untuk brand Pawon Salam */
:root {
  --color-primary: #D4AF37;      /* Gold */
  --color-secondary: #8B4513;    /* Brown */
  --color-accent: #FF6B6B;       /* Soft Red */
  
  --font-family-heading: 'Poppins', sans-serif;
  --font-family-body: 'Roboto', sans-serif;
  
  --shadow-3d-button: 0 6px 0 rgba(0,0,0,0.4);
}

.theme-pawonsalam {
  --color-primary: #D4AF37;
}

.theme-kedaielvera {
  --color-primary: #FF8C42;
}
```

### B. Logo & Assets

**Lokasi**: `public/` folder

```
public/
├── logo.png                 (48x48 min untuk modal)
├── nextvwt_brand_logo.png  (main logo)
├── favicon.ico             (browser tab icon)
└── splash-screens/         (Android splash screens)
    ├── mdpi.png
    ├── hdpi.png
    └── xhdpi.png
```

### C. Themes (8 variants)

**File**: `src/styles/theme.css`

Tersedia themes:
- `theme-classic` (NextVWT default)
- `theme-v1` hingga `theme-v6` (variants)
- `theme-monokrom` (grayscale)

Customize di `RadioLayout.tsx` line 55-66.

---

## 📊 15. Analytics & Monitoring (Opsional)

Jika ingin track usage:

```typescript
// Tambahkan di store/usePTTStore.ts
import { analytics } from '../utils/analytics';

// Track transmit
const broadcastVoiceChunk = (base64Chunk: string) => {
  analytics.logEvent('transmit_start', {
    channel: channelNumber,
    duration: base64Chunk.length,
  });
};

// Track channel switch
const setChannelNumber = (num: number) => {
  analytics.logEvent('channel_switch', {
    from: channelNumber,
    to: num,
  });
};
```

Service options:
- Google Analytics 4 (GA4)
- Mixpanel
- LogRocket (untuk session replay)

---

## ✅ 16. Final Checklist: Production Ready

Sebelum deploy ke production, pastikan:

### Code Quality
- [ ] `npm run lint` → 0 errors
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run build` → Success
- [ ] `npm test` → All pass

### Branding
- [ ] Logo updated di `public/`
- [ ] config.ts updated dengan brand info
- [ ] Channel list sesuai organisasi
- [ ] Color scheme tested di semua theme

### Backend
- [ ] Supabase project created
- [ ] RLS policies configured
- [ ] Realtime enabled
- [ ] Backup scheduled

### Deployment
- [ ] APK signed & optimized
- [ ] Tested di minimal 3 devices
- [ ] Network tested (WiFi + Cellular)
- [ ] Battery drain tested (> 4 hours usage)
- [ ] Offline functionality tested

### Documentation
- [ ] MASTER_TEMPLATE_GUIDE.md reviewed
- [ ] config.ts documented
- [ ] Team trained on customization
- [ ] Backup plan documented

---

**Selamat! Aplikasi Anda siap untuk production! 🚀**

Untuk pertanyaan atau issues, lihat **Section 12: Troubleshooting** atau hubungi developer team Anda.
