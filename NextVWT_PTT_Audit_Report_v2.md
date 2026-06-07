# Laporan Audit Menyeluruh v2 — NextVWT PTT App Prototype
# Analisis Komparatif & Temuan Baru

> **Tanggal Audit:** 7 Juni 2026
> **Versi yang Diaudit:** Clone 2 (Iterasi kedua setelah perbaikan)
> **Referensi Audit Sebelumnya:** NextVWT_PTT_Audit_Report.md (Clone 1)
> **Skor Sebelumnya (v1):** 65 / 100
> **Skor Saat Ini (v2):** 78 / 100 **(+13 poin)**

---

## Ringkasan Eksekutif

Versi kedua ini menunjukkan kemajuan yang **sangat signifikan**. Delapan dari sebelas temuan kritis dan tinggi dari audit pertama telah diperbaiki, termasuk penambahan Android permissions, refactor arsitektur hooks, Error Boundary, penghapusan MUI, dan implementasi awal TURN server. CI/CD pipeline juga telah ditingkatkan secara substansial dengan dukungan Android signing dan frozen lockfile.

Namun **satu temuan kritis yang sama** dari v1 masih belum tertangani: `.env` yang berisi kredensial nyata masih ter-commit ke repositori. Ini harus menjadi prioritas utama sebelum distribusi ke siapapun. Selain itu, audit v2 menemukan **tiga temuan baru** yang diintroduksi oleh perubahan di iterasi ini — terutama terkait `appSecurity.ts` yang memberikan false sense of security.

---

## Perbandingan Status Perbaikan (v1 → v2)

| ID | Temuan | Status v1 | Status v2 |
|---|---|---|---|
| KRITIS-01 | Credential bocor di `.env` | 🔴 Belum | 🔴 **Masih belum** |
| KRITIS-02 | Izin Android hilang | 🔴 Belum | ✅ Sepenuhnya diperbaiki |
| KRITIS-03 | `isDummyKey` memalsukan koneksi | 🔴 Belum | ✅ Diperbaiki sebagian |
| KRITIS-04 | Guest login ID hardcoded | 🔴 Belum | ✅ Sepenuhnya diperbaiki |
| TINGGI-01 | Tidak ada TURN server | 🟡 Belum | 🟠 Ditambahkan, belum terkonfigurasi |
| TINGGI-02 | Konflik MUI + Radix | 🟡 Belum | ✅ MUI dihapus |
| TINGGI-03 | Data channel hardcoded | 🟡 Belum | 🟡 Masih belum |
| SEDANG-01 | Tidak ada Error Boundary | 🟠 Belum | ✅ Sepenuhnya diperbaiki |
| SEDANG-02 | `useAudioStreamer` monolitik | 🟠 Belum | ✅ Direfactor ke 3 hooks |
| SEDANG-03 | Certificate pinning expired | 🟠 Belum | ✅ Diperpanjang ke 2028 |
| SEDANG-04 | Build artifact ter-commit | 🟠 Belum | ✅ CI/CD pipeline diperbaiki |

**Baru di v2 (belum ada di v1):**

| ID | Temuan Baru | Severity |
|---|---|---|
| BARU-01 | `appSecurity.ts` — false sense of security | 🟡 Tinggi |
| BARU-02 | Hard crash saat security violation (false positive risk) | 🟡 Tinggi |
| BARU-03 | JavaScript obfuscation di build pipeline | 🟠 Sedang |

---

## 1. Temuan yang Masih Terbuka dari v1

### 🔴 KRITIS-01: Credential Masih Bocor di `.env` (Tidak Berubah)

**File:** `.env` (root proyek)
**Dampak:** Sangat Tinggi — kredensial masih terbuka di git history

```dotenv
# Masih ter-commit di repositori:
VITE_SUPABASE_URL=https://tqixjycrxhjmpyffhxvg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable__uPRzhQpHd6coAx9TISEGQ_k65Ai_eP
VITE_GOOGLE_CLIENT_ID=573176982412-r3r5bao0piov4tnhcsnkvjpooft0avmu.apps.googleusercontent.com
```

Ini adalah temuan yang sama persis dari audit v1. Meski ada file `.env.example` yang ditambahkan (kemajuan positif), file `.env` asli dengan kredensial nyata **masih ada dan belum dirotasi**.

**Perhatian tambahan di v2:** File `.env` sekarang berisi lebih banyak informasi sensitif termasuk `VITE_PROJECT_SIGNATURE`, `VITE_LICENSE_KEY`, dan URL repositori GitHub — menambah attack surface.

**Tindakan wajib (hari ini):**

```bash
# LANGKAH 1: Rotasi SEMUA credential sekarang
# - Supabase: Dashboard → Settings → API → Generate new key
# - Google Cloud: Console → APIs & Services → OAuth Credentials → Delete & recreate

# LANGKAH 2: Hapus dari git history (gunakan BFG Repo Cleaner)
java -jar bfg.jar --delete-files .env repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force

# LANGKAH 3: Pastikan .gitignore sudah benar
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore: remove .env from tracking"
```

---

### 🟠 TINGGI-01 (Residual): TURN Server Ditambahkan tapi Belum Terkonfigurasi

**File:** `src/app/hooks/useWebRTC.ts`

Kode `useWebRTC.ts` sudah mengimpor `getSecureConfig()` untuk ephemeral TURN credentials — ini adalah pola yang sangat baik. Namun berdasarkan inspeksi, `VITE_TURN_URL`, `VITE_TURN_USERNAME`, dan `VITE_TURN_CREDENTIAL` belum diisi di `.env`.

```typescript
// useWebRTC.ts — pola yang benar sudah ada:
export const fetchTurnCredentials = async () => {
  const config = await getSecureConfig();
  ephemeralTurnCreds = {
    username: config.turnUsername,  // ← masih placeholder
    credential: config.turnCredential,
  };
};
```

**Akibat:** WebRTC akan tetap gagal di jaringan NAT simetris (umum di 4G Indonesia) tanpa TURN server aktif. Fallback ke base64 akan digunakan, yang lebih boros bandwidth.

**Rekomendasi:** Daftarkan akun di [Metered.ca](https://www.metered.ca) (free tier: 50GB/bulan) atau deploy Coturn self-hosted, lalu isi credential di Supabase Secrets.

---

### 🟡 TINGGI-03: Data Channel Masih Hardcoded di `config.ts`

Tidak ada perubahan dari v1. Daftar channel (termasuk 27 nama pengguna nyata seperti `Pebri Haryanto`, `paul_rudi_rt`) masih disimpan di kode sumber.

---

## 2. Temuan Baru di v2

### 🟡 BARU-01: `appSecurity.ts` — False Sense of Security

**File:** `src/app/utils/appSecurity.ts`
**Dampak:** Tinggi — memberikan kesan perlindungan yang tidak ada

File `appSecurity.ts` memperkenalkan mekanisme "anti-cloning" yang sayangnya tidak memberikan perlindungan nyata dan justru menambah risiko:

**Masalah 1 — IS_SIGNING_HASH_CONFIGURED = false:**
```typescript
export const IS_SIGNING_HASH_CONFIGURED = false; // ← Artinya signing check tidak pernah aktif
```
Flag ini selalu `false`, yang berarti pemeriksaan integritas APK tidak pernah benar-benar berjalan.

**Masalah 2 — Mock signing verification:**
```typescript
const mockActualHash = 'MOCK_CURRENT_HASH_DARI_NATIVE_PLUGIN'; // ← Placeholder literal
if (mockActualHash !== EXPECTED_SIGNING_HASH) { // Selalu true → INVALID_SIGNATURE selalu muncul
```
Jika `IS_SIGNING_HASH_CONFIGURED` diset `true`, kode ini akan selalu memutuskan bahwa APK "tidak valid" karena membandingkan string placeholder dengan hash asli.

**Masalah 3 — Domain whitelist statis:**
```typescript
const allowedDomains = ['localhost', '127.0.0.1', 'nextvwt.vercel.app', 'nextvwt.id'];
```
Domain whitelist di-hardcode dalam bundle JavaScript yang dapat dibaca siapapun. Penyerang cukup membuka DevTools → Sources → cari domain list → tahu persis domain mana yang diizinkan.

**Masalah 4 — Deteksi emulator tidak reliable:**
```typescript
const standardEmulatorResolution = screen.width === 1080 && screen.height === 1920;
```
Banyak HP fisik nyata (Samsung A-series, Xiaomi entry-level) memiliki resolusi 1080×1920. Ini bisa memblokir pengguna legitimate.

**Masalah 5 — DevTools detection tidak reliable:**
```typescript
const devToolsOpen = window.outerWidth - window.innerWidth > threshold;
```
Pengguna dengan monitor ultrawide atau split-screen secara rutin memiliki selisih > 160px — ini bukan indikator DevTools.

**Rekomendasi:**
- Hapus atau nonaktifkan `performSecurityAudit()` hingga implementasinya benar
- Jangan gunakan client-side code sebagai mekanisme DRM — semua client-side code bisa dibaca
- Jika butuh perlindungan: gunakan server-side license validation via Supabase Edge Function

---

### 🟡 BARU-02: Hard Crash saat Security Violation — Risiko False Positive

**File:** `src/app/App.tsx` (baris ~14–19)

```typescript
useEffect(() => {
  const audit = performSecurityAudit();
  if (audit.blocked) {
    throw new Error(           // ← Hard crash!
      `SECURITY_VIOLATION: Aplikasi terindikasi dimodifikasi secara ilegal. ${audit.issues.join(', ')}`
    );
  }
}, []);
```

Ada tiga masalah serius di sini:

**Pertama**, `performSecurityAudit()` adalah fungsi `async` yang mengembalikan `Promise<{score, issues, blocked}>`. Namun kode ini memanggilnya tanpa `await` — artinya `audit` adalah Promise object, bukan hasil audit. `audit.blocked` akan selalu `undefined` (falsy), sehingga crash tidak pernah terpicu. Bug logika yang mengakibatkan security check tidak pernah berjalan.

**Kedua**, jika suatu hari ini diperbaiki dengan `await`, crash yang terpicu akan mengaktifkan `ErrorBoundary` di atas, tapi pesan errornya mengandung `SECURITY_VIOLATION` yang bisa membingungkan pengguna legitimate yang terkena false positive (resolusi ultrawide, jaringan korporat dengan domain berbeda, dll).

**Ketiga**, crash saat startup adalah pengalaman pengguna yang sangat buruk — pengguna tidak mendapat penjelasan yang memadai.

**Rekomendasi:**
```typescript
// Ganti hard crash dengan graceful degradation:
useEffect(() => {
  performSecurityAudit().then((audit) => {
    if (audit.blocked && import.meta.env.PROD) {
      // Log ke monitoring, tapi jangan crash user
      console.error('[Security] Potential security issue detected', audit.issues);
      // Opsional: kirim ke Sentry/monitoring
    }
  });
}, []);
```

---

### 🟠 BARU-03: JavaScript Obfuscation di Build Pipeline

**File:** `package.json` (devDependencies)

```json
"rollup-plugin-javascript-obfuscator": "^1.0.4"
```

Package ini memperkenalkan beberapa masalah:

**Ukuran dan performa:** Obfuscation biasanya menambah ukuran bundle 20-40% dan memperlambat JavaScript execution karena menghasilkan kode yang sulit dioptimasi oleh V8/JavaScriptCore.

**Debugging production:** Obfuscated code membuat error messages dan stack traces menjadi tidak dapat dibaca, mempersulit debugging issue produksi.

**Keamanan semu:** Obfuscation bukan enkripsi. Tool seperti `de4js` atau `javascript-obfuscator` online dapat membalikkan sebagian besar obfuscation dalam hitungan detik. Seorang penyerang yang termotivasi tidak akan terhambat oleh obfuscation.

**Rekomendasi:** Hapus obfuscation plugin. Jika tujuannya melindungi logika bisnis, pindahkan logika sensitif ke Supabase Edge Functions (server-side, tidak dapat diakses client).

---

## 3. Analisis Mendalam Perbaikan yang Berhasil

### ✅ Refactor Hooks — Kualitas Arsitektur Meningkat Drastis

Pemisahan `useAudioStreamer.ts` menjadi tiga hook terpisah adalah perbaikan arsitektur yang paling signifikan di v2:

| Hook | Ukuran | Tanggung Jawab | Test Coverage |
|---|---|---|---|
| `useVAD.ts` | 87 baris | Voice Activity Detection | ✅ Ada |
| `useWebRTC.ts` | 265 baris | Peer connection, signaling, TURN | ✅ Ada |
| `useAudioPlayback.ts` | 156 baris | Audio context, buffer, playback | ✅ Ada |
| `useAudioStreamer.ts` | 376 baris | Orchestrator yang mengkomposisi | - |

Setiap hook memiliki unit test terpisah, yang merupakan praktik yang sangat baik. Coverage report menunjukkan file-file ini memiliki coverage yang baik.

### ✅ Implementasi Error Boundary yang Proper

`ErrorBoundary.tsx` diimplementasikan sebagai React class component dengan:
- `getDerivedStateFromError` untuk menangkap error
- `componentDidCatch` untuk logging
- Fallback UI yang informatif dengan tombol "Coba lagi"
- TypeScript interface yang proper

Ini sudah diterapkan dengan benar di `App.tsx` sebagai wrapper terluar.

### ✅ CI/CD Pipeline yang Matang

`ci-cd.yml` sekarang mencakup:
- Node.js 20 LTS (upgrade dari 18 EOL)
- pnpm 9 dengan `--frozen-lockfile` (reproducible builds)
- Format check + lint + type check sebelum test
- Unit test + integration test + E2E (Playwright + Cypress)
- Android signing dengan keystore dari GitHub Secrets
- AAB (App Bundle) + APK build artifacts
- Playwright report upload saat failure

### ✅ AndroidManifest.xml Sekarang Lengkap

```xml
<!-- v2 — Semua permission yang diperlukan sudah ada: -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-feature android:name="android.hardware.microphone" android:required="true" />
```

### ✅ Guest Login dengan UUID Unik

```typescript
// v2 — App.tsx:
onGuestLogin={() => {
  const guestId = `guest-${generateUUID()}`;  // UUID unik per sesi
  const shortId = guestId.slice(-4).toUpperCase();
  setUser({
    id: guestId,
    isGuest: true,
    email: `${guestId}@guest.nextvwt.local`,
    user_metadata: {
      full_name: infoText || `Tamu ${shortId}`,
    },
    // ...
  });
}}
```

Ini persis perbaikan yang direkomendasikan di audit v1.

---

## 4. Analisis Coverage Test

Coverage report di folder `/coverage` menunjukkan test untuk tiga hook baru:

| File | Statement Coverage | Branch Coverage |
|---|---|---|
| `useAudioPlayback.ts` | ~68% | ~64% |
| `useVAD.ts` | ~96% | ~93% |
| `useWebRTC.ts` | ~77% | ~67% |

Coverage `useVAD.ts` yang mencapai 96% sangat baik. `useWebRTC.ts` di 77% masih bisa ditingkatkan, khususnya untuk branch ICE candidate queuing dan error handling saat peer connection gagal.

**Yang perlu ditambahkan:**
- Test untuk skenario TURN credential fetch yang gagal (fallback ke STUN only)
- Test untuk ICE candidate queue saat `setRemoteDescription` belum dipanggil
- Test untuk `useWebRTC` cleanup saat komponen unmount

---

## 5. Skor per Dimensi (v1 vs v2)

| Dimensi | Skor v1 | Skor v2 | Perubahan |
|---|---|---|---|
| **Keamanan** | 40/100 | 48/100 | +8 (masih rendah karena credential bocor) |
| **Arsitektur** | 75/100 | 88/100 | +13 (refactor hooks, Error Boundary) |
| **Kualitas Kode** | 70/100 | 78/100 | +8 (TypeScript lebih ketat) |
| **Testing** | 80/100 | 87/100 | +7 (3 hook test files baru) |
| **UX & Audio** | 85/100 | 85/100 | = (tidak berubah) |
| **Kesiapan Mobile** | 50/100 | 82/100 | +32 (manifest lengkap, CI/CD Android) |
| **Skalabilitas** | 55/100 | 62/100 | +7 (TURN ditambahkan, channel masih static) |
| **DevOps/CI** | 55/100 | 80/100 | +25 (pipeline matang) |
| **Skor Keseluruhan** | **65/100** | **78/100** | **+13** |

---

## 6. Roadmap Rekomendasi Lanjutan

### Prioritas 0 — Hari Ini (Tidak Bisa Ditunda)

| Tindakan | Estimasi |
|---|---|
| Rotasi Supabase + Google OAuth credential | 30 menit |
| Hapus `.env` dari git history (BFG) | 1 jam |
| Nonaktifkan `performSecurityAudit()` sementara | 15 menit |

### Prioritas 1 — Minggu Ini

| Tindakan | Estimasi |
|---|---|
| Setup TURN server (Metered.ca free tier) | 2 jam |
| Isi `VITE_TURN_URL/USERNAME/CREDENTIAL` di environment | 30 menit |
| Fix `performSecurityAudit()` — tambahkan `await` | 15 menit |
| Ganti hard crash security violation dengan graceful logging | 1 jam |
| Hapus `rollup-plugin-javascript-obfuscator` | 10 menit |

### Prioritas 2 — 1-2 Minggu

| Tindakan | Estimasi |
|---|---|
| Migrasi data channel dari `config.ts` ke Supabase DB | 1-2 hari |
| Tambahkan test branch coverage untuk `useWebRTC.ts` | 4 jam |
| Implementasi proper server-side license validation | 1-2 hari |
| Konfigurasi Sentry untuk error monitoring produksi | 2 jam |

### Prioritas 3 — Pra-Produksi

| Tindakan | Estimasi |
|---|---|
| Penetration testing formal | 1 minggu |
| iOS version (Capacitor + Safari WebRTC) | 1 minggu |
| Play Store listing preparation | 3-5 hari |
| End-to-end encryption audio | 1-2 minggu |

---

## 7. Rekomendasi Strategis Terbaik

Berdasarkan analisis menyeluruh kedua versi, berikut lima rekomendasi strategis terpenting:

**1. Selesaikan credential leak sekarang.** Ini satu-satunya blocker absolut. Semua perbaikan lain tidak berarti jika kredensial Supabase masih bisa diakses siapapun yang mengkloning repo.

**2. Lepas appSecurity.ts atau implementasikan dengan benar.** Dalam kondisi saat ini, modul ini memberikan false sense of security yang lebih berbahaya daripada tidak ada security check sama sekali. Security yang tidak berfungsi lebih buruk dari tidak ada security — karena menghilangkan kewaspadaan.

**3. Setup TURN server sebelum beta testing.** Di Indonesia, mayoritas jaringan seluler (Telkomsel, XL, Indosat) menggunakan NAT simetris. Tanpa TURN server, 40-60% koneksi WebRTC akan gagal dan jatuh ke fallback base64 yang lambat dan boros data.

**4. Migrasi channel data ke Supabase sebagai MVP berikutnya.** Ini membuka jalan untuk fitur-fitur yang dibutuhkan produksi: channel moderation, user management, channel analytics, dan white-label multi-tenant yang lebih mudah.

**5. Pertahankan momentum testing.** Coverage test yang sudah baik di `useVAD.ts` (96%) adalah standar yang harus dipertahankan dan diterapkan ke semua file baru. Ini adalah aset jangka panjang yang akan sangat membantu saat refactor lebih lanjut.

---

*Laporan ini dibuat berdasarkan analisis statis kode sumber Clone 2. Audit dinamis (runtime behavior, penetration testing) direkomendasikan sebelum peluncuran produksi.*

*NextVWT PTT App — Audit v2 · 7 Juni 2026*
