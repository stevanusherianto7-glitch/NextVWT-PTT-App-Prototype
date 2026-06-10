# NextVWT PTT App — Premium Design Specifications

Dokumen ini mendefinisikan spesifikasi desain visual, token kegayaan, tata letak, komponen UI, serta integrasi aset biner dan tipografi untuk aplikasi NextVWT PTT.

---

## 🏗️ 1. Tata Letak & Geometri Ikon Mode (Layout & Geometry)

Lencana mode (`voice`, `operator`, `moderator`) diposisikan secara absolut menindih sudut kanan bawah dari foto profil pengguna di dalam komponen [UserListModal.tsx](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/components/UserListModal.tsx).

* **Dimensi Avatar**: Lingkaran berdiameter `52px` (`w-[52px] h-[52px]`).
* **Dimensi Lencana**: Tinggi dan lebar `21px` (`w-[21px] h-[21px]`).
* **Pemosisian (Positioning)**:
  * Kelas CSS: `absolute -bottom-[1px] -right-[1px]`
  * Jenis Penskalaan Gambar: `object-contain`
  * Dragging: `draggable={false}` (menonaktifkan interaksi seret browser).

---

## 🎨 2. Transparansi & Bayangan Ikon Mode (Transparency & Drop Shadow)

Untuk menjaga estetika antarmuka yang bersih dan premium, lencana mode dirender secara transparan tanpa pembungkus latar belakang warna putih.

* **Transparansi Latar Belakang (Transparent Background)**:
  * Ikon biner berekstensi `.png` dirender secara langsung di atas gambar avatar tanpa tag pembungkus `div` berwarna solid.
* **Efek Bayangan (Drop Shadow)**:
  * Properti CSS: `drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.35)]`
  * **Tujuan Desain**: Memberikan kontras tinggi dan kedalaman taktil (3D depth) agar ikon tetap terlihat jelas dan bersih baik di atas avatar berwarna gelap, terang, maupun foto profil khusus.

---

## 🔬 3. Pemrosesan Aset & Eliminasi Halo Putih (Asset Processing & Edge Cleaning)

Aset asli dari ikon mode berdimensi besar (`1254x1254` piksel) memiliki latar belakang gradasi off-white/abu-abu terang dan tidak transparan. Pemotongan langsung (color keying) biasa menyisakan piksel pembiasan putih di sekeliling ikon (*white halo*). Masalah ini diselesaikan menggunakan teknik persiapan tekstur standar industri:

### A. Alur Algoritma Pembersihan (Cleaning Pipeline)
1. **BFS Flood-Fill (Ambang Batas 238)**:
   * Menggunakan algoritma penelusuran BFS dari empat sudut gambar untuk mengidentifikasi seluruh piksel latar belakang off-white. Piksel yang memiliki nilai RGB $\ge 238$ dikelompokkan sebagai area latar belakang.
2. **BFS Color Dilation (Dilasi Warna Tepi - 15 Langkah)**:
   * Melakukan propagasi (perambatan) warna dari piksel depan (foreground) ke area piksel latar belakang (background) di sekeliling batas tepi sebanyak 15 piksel.
   * Ini memastikan piksel-piksel di luar batas gambar memiliki warna yang sama dengan bagian dalam tepi ikon (bukan warna putih latar belakang).
3. **Penyusunan Masker Alpha (Alpha Mask Composition)**:
   * Membuat saluran alpha biner di mana piksel luar (background) diberi nilai `0` (transparan penuh) dan piksel dalam (foreground) diberi nilai `255` (opaque penuh).
4. **Penskalaan Turun (Lanczos Downsampling)**:
   * Gambar RGBA berukuran `1254x1254` diturunkan skalanya menjadi `64x64` menggunakan penyaringan **Lanczos**.
   * Karena warna tepi telah didilatasi dengan warna ikon asli, piksel semi-transparan hasil perataan filter tidak mengandung campuran warna putih. Hasil akhirnya adalah tepi ikon yang sangat halus, tajam, dan bebas halo warna putih saat diletakkan di atas latar belakang apa pun.

---

## 🏷️ 4. Tipe Mode & Aset (Mode Types & Assets)

Aplikasi mengenali tiga mode fungsional pengguna dengan pemetaan warna dan aset sebagai berikut:

| Mode | Keterangan Mode | Nama Berkas Aset | Kode Warna Dominan | Representasi Visual |
| :--- | :--- | :--- | :--- | :--- |
| **`voice`** | Pengguna dengan hak suara aktif | `icon_voice.png` | `#1a7595` / `#1c799a` (Blue) | Desain mikrofon/speaker walkie-talkie biru pekat |
| **`operator`** | Operator otomatis saluran | `icon_operator_otomatis.png`| `#808080` (Grayscale Gray) | Konsol operator/headset abu-abu solid |
| **`moderator`** | Staf/PJC moderasi saluran | `icon_moderator.png` | `#fea316` / `#fea011` (Orange Gold) | Desain mahkota/staf moderasi emas |

---

## 💻 5. Integrasi React & TypeScript

Konfigurasi pemetaan ikon di dalam berkas [UserListModal.tsx](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/components/UserListModal.tsx) diimplementasikan sebagai berikut:

```typescript
import iconVoice from '../../assets/icon_voice.png';
import iconOperator from '../../assets/icon_operator_otomatis.png';
import iconModerator from '../../assets/icon_moderator.png';

/** Jenis mode pengguna */
type UserMode = 'voice' | 'operator' | 'moderator';

/** Pemetaan Ikon per Mode */
const MODE_ICONS: Record<UserMode, string> = {
  voice: iconVoice,
  operator: iconOperator,
  moderator: iconModerator,
};

/** Pemetaan Label Tooltip */
const MODE_LABELS: Record<UserMode, string> = {
  voice: 'Voice',
  operator: 'Operator',
  moderator: 'Moderator',
};
```

### Logika Penentuan Mode
Peran mode saat ini ditentukan secara dinamis (deterministik) berdasarkan nilai hash dari nama tampilan pengguna:

```typescript
function getUserMode(username: string): UserMode {
  let hash = 7;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) | 0;
  }
  const modes: UserMode[] = ['voice', 'operator', 'moderator'];
  return modes[Math.abs(hash) % modes.length];
}
```

### Potongan Kode Render UI (JSX)
```tsx
{/* Mode icon badge at bottom-right */}
{(() => {
  const mode = getUserMode(profile.userId || profile.displayName);
  return (
    <img
      src={MODE_ICONS[mode]}
      alt={MODE_LABELS[mode]}
      title={MODE_LABELS[mode]}
      className="absolute -bottom-[1px] -right-[1px] w-[21px] h-[21px] object-contain drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.35)]"
      draggable={false}
    />
  );
})()}
```

---

## 🔤 6. Spesifikasi Tipografi Brand Premium (Outfit Mixed Weights)

Untuk memberikan citra merek (branding) yang dinamis, modern, premium, dan sangat eye-catching (meniru merek walkie-talkie komersial elit seperti Motorola atau Garmin), jenis huruf utama untuk nama brand **NextVWT** menggunakan Google Font **Outfit** dengan konsep **Mixed Weights & Signal Accents**.

### A. Pengaturan Font Global (`src/styles/fonts.css`)
Font diimpor secara dinamis melalui Google Fonts API bersama dengan font pendukung:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Orbitron:wght@400;700;900&display=swap');
```

### B. Implementasi & Parameter Kegayaan (Typography Styling)

1. **Header Sasis Walkie-Talkie ([RadioLayout.tsx](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/components/RadioLayout.tsx))**:
   * **Font Family**: `'Outfit', sans-serif`
   * **Ukuran Font**: `16px` (`text-[16px]`)
   * **Ketebalan (Weights)**: 
     * **Next**: `font-medium` (500) - berwarna sesuai sasis default (`var(--header-text-color)`).
     * **VWT**: `font-black` (900) - berwarna hijau sinyal/emerald (`#00C853`).
   * **Jarak Antar Huruf (Tracking)**: `wide` (`tracking-wide`) untuk keterbacaan yang kokoh.

2. **Gerbang Masuk Aplikasi ([LoginGate.tsx](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/components/LoginGate.tsx))**:
   * **Font Family**: `'Outfit', sans-serif`
   * **Ukuran Font**: `24px` (`text-2xl`)
   * **Ketebalan (Weights)**:
     * **Next**: `font-medium` (500) - berwarna putih bersih (`text-white`).
     * **VWT**: `font-black` (900) - berwarna hijau sinyal/emerald (`#00C853`).
   * **Jarak Antar Huruf (Tracking)**: `wide` (`tracking-wide`) untuk memberikan kesan visual yang modern, berwibawa, dan premium saat pertama kali aplikasi dibuka.

3. **Logo Premium Dialog Modal ([ChannelListModal.css](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/components/ChannelListModal.css))**:
   * **Font Family**: `'Outfit', sans-serif`
   * **Ukuran Font**: `clamp(20px, 4.5vw, 24px)`
   * **Ketebalan (Weights)**:
     * **Next** (`.logo-next`): `font-weight: 500` dengan gradasi metalik perak-putih bersih (`linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)`).
     * **VWT** (`.logo-vwt`): `font-weight: 900` dengan gradasi mint-to-emerald (`linear-gradient(180deg, #a7f3d0 0%, #00C853 45%, #007c31 100%)`).
   * **Jarak Antar Huruf (Tracking)**: `0.045em` untuk Next, `0.02em` untuk VWT.
   * **Efek Gradasi 3D & Bayangan**: Menggunakan `-webkit-background-clip: text` dan bayangan bertumpuk `text-shadow` dengan rona hijau untuk menegaskan kedalaman taktil 3D.

---

## 🛡️ 7. Fitur Moderasi — Spesifikasi Desain & Fungsionalitas

Fitur moderasi memungkinkan pengguna dengan peran tertentu untuk mengontrol status dan hak transmisi pengguna lain di dalam channel yang sama. Seluruh antarmuka moderasi diakses melalui **User List Modal** → klik profil user → **Zoomed Avatar Modal**.

### A. Hak Akses Moderasi (Permission Model)

Panel moderasi hanya ditampilkan jika pengguna yang login memiliki salah satu peran berikut:

| Peran | Kode Internal | Dapat Memoderasi |
| :--- | :--- | :--- |
| **Network Operations Center** | `noc` | ✅ Semua peran di bawahnya |
| **System Administrator** | `sys_admin` | ✅ `pjc`, `operator`, `guest` |
| **Penanggung Jawab Channel** | `pjc` | ✅ `operator`, `guest` |
| **Operator** | `operator` | ✅ Akses panel moderasi (mode & hang up) |
| **Guest** | `guest` | ❌ Tidak dapat memoderasi |

Logika penentuan hak:
```typescript
const canModerate =
  localRole === 'operator' ||
  localRole === 'pjc' ||
  localRole === 'sys_admin' ||
  localRole === 'noc';
```

Peran disimpan secara lokal per channel di `localStorage` dengan format key:
```
channel-role:ptt-room-{channelNumber}:{userId}
```

---

### B. Panel Moderasi — Mode Moderasi Jalur

Panel ini menampilkan grid tombol 2 kolom × 3 baris untuk mengatur status/kondisi transmisi user target.

**Tata Letak Grid (`grid-cols-2 gap-1.5`)**:

| Kolom 1 | Kolom 2 |
| :--- | :--- |
| 🟢 **Voice** (Normal) | 🔴 **Silent** (Mute) |
| 🟡 **Controlled** | 🔵 **Wait (Antri)** |
| 🟣 **Wait Ctrl** | ⚡ **Hang Up** |

#### Deskripsi Setiap Mode

| Mode | Ikon Aset | Fungsi | Warna Aktif |
| :--- | :--- | :--- | :--- |
| **Voice** | `icon_voice.png` | Status default — user dapat transmit dan menerima | `emerald-50` / `emerald-700` |
| **Silent** | `icon_silent.png` | Mute — user tidak dapat transmit (hanya mendengar) | `red-50` / `red-700` |
| **Controlled** | `icon_controlled.png` | Terkontrol — transmisi diatur oleh moderator | `amber-50` / `amber-700` |
| **Wait (Antri)** | `icon_wait.png` | Antrian — user menunggu giliran transmit | `blue-50` / `blue-700` |
| **Wait Ctrl** | `icon_wait_controlled.png` | Kombinasi antri + terkontrol | `indigo-50` / `indigo-700` |
| **Hang Up** | SVG petir inline | Memutus paksa transmisi user target | `red-50` / `red-700` |

#### Styling Tombol Mode

```
Tidak aktif : bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100
Aktif       : bg-{color}-50 border-{color}-500/30 text-{color}-700 shadow-sm
```

Setiap tombol berukuran `px-2.5 py-1.5`, border `rounded-lg`, font `text-[11px] font-semibold`, dengan ikon berukuran `w-3.5 h-3.5`.

---

### C. Panel Moderasi — Peran / Jabatan Jalur

Grid tombol 3 kolom × 1 baris untuk mengubah peran/jabatan user target di channel.

**Tata Letak Grid (`grid-cols-3 gap-1.5`)**:

| Kolom 1 | Kolom 2 | Kolom 3 |
| :--- | :--- | :--- |
| **Guest** | **Operator** | **Moderator** |

#### Styling Tombol Peran

```
Tidak aktif : bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100
Aktif       : bg-{color}-50/100 border-{color}-500/30 text-{color}-700 shadow-sm
```

Tombol berukuran `py-1`, border `rounded-lg`, font `text-[10px] font-semibold`. Tombol Operator dan Moderator menyertakan ikon kecil `w-3.5 h-3.5` di samping label.

---

### D. Heading Label Moderasi

Kedua heading panel moderasi diposisikan rata tengah:

```
text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center
```

* **"Mode Moderasi Jalur"** — di atas grid mode (margin bawah `mb-2`)
* **"Peran / Jabatan Jalur"** — di atas grid peran (margin atas `mt-3.5`, margin bawah `mb-2`)

---

### E. Fitur Hang Up — Mekanisme & Alur Data

**Tujuan**: Memungkinkan moderator/operator menyela dan menghentikan transmisi PTT user lain secara instan.

#### Alur Fungsional

```
[Moderator klik ⚡ Hang Up]
        │
        ▼
  hangUpUser(targetUserId)          ← createUISlice.ts
        │
        ├─► Broadcast 'hang_up' event via Supabase Realtime Channel
        │     payload: { targetUserId, moderatorName }
        │
        ├─► Optimistic: clear activeTransmitter lokal (jika cocok)
        │
        └─► Optimistic: stop own transmission (jika target === self)
        
        
  [Semua klien di channel menerima broadcast]
        │
        ▼
  subscribeToChannel() listener     ← usePTTStore.ts
        │
        ├─► Jika targetUserId === userId saya & sedang transmit:
        │     → isTransmitting = false, progress = 0
        │
        └─► Jika activeTransmitter.userId === targetUserId:
              → activeTransmitter = null, progress = 0
```

#### Payload Broadcast

```typescript
// Event: 'hang_up'
{
  type: 'broadcast',
  event: 'hang_up',
  payload: {
    targetUserId: string,    // ID user yang transmisinya dihentikan
    moderatorName: string,   // Nama moderator yang melakukan hang up
  }
}
```

#### Implementasi Store (Zustand)

**Action** — `hangUpUser` di [createUISlice.ts](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/store/slices/createUISlice.ts):
```typescript
hangUpUser: (targetUserId: string) => {
  // 1. Guard: abaikan jika power off
  // 2. Broadcast 'hang_up' event via activeChannelSubscription
  // 3. Optimistic: clear activeTransmitter jika cocok
  // 4. Optimistic: stop own transmission jika target === self
}
```

**Listener** — di [usePTTStore.ts](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/src/app/store/usePTTStore.ts) `subscribeToChannel()`:
```typescript
.on('broadcast', { event: 'hang_up' }, ({ payload }) => {
  // 1. Jika target === userId saya → force-stop transmission
  // 2. Jika target === activeTransmitter → clear transmitter display
})
```

#### Ikon Hang Up (SVG Petir / Flash)

Ikon menggunakan SVG inline dengan path petir (lightning bolt):
```tsx
<svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
  <path d="M7 2v11h3v9l7-12h-4l4-8z" />
</svg>
```

---

### F. Lencana Mode di Avatar (Badge Overlay)

Saat status user berubah melalui moderasi, lencana ikon mode ditampilkan di sudut kanan bawah avatar user pada daftar user list. Aturan tampil:

| Mode | Lencana Tampil? | Keterangan |
| :--- | :--- | :--- |
| `voice` | ❌ Tidak | Default — tidak perlu lencana (bersih) |
| `operator` | ✅ Ya | Ikon operator abu-abu |
| `moderator` | ✅ Ya | Ikon mahkota emas |
| `silent` | ✅ Ya | Ikon mute merah |
| `controlled` | ✅ Ya | Ikon kontrol kuning |
| `wait` | ✅ Ya | Ikon antri biru |
| `wait_controlled` | ✅ Ya | Ikon antri+kontrol ungu |

Styling lencana: `w-[21px] h-[21px] object-contain drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.35)]` — tanpa background placeholder, langsung transparan di atas avatar.

---

### G. Dimensi Modal

| Komponen | Lebar Maks | Catatan |
| :--- | :--- | :--- |
| User List Modal | `max-w-[340px]` | Container daftar user dengan scrollbar |
| Zoomed Avatar / Profil Modal | `max-w-[340px]` | Modal overlay berisi avatar, info, dan panel moderasi |
| Tinggi User List | `400px` (default), `535px` (layar ≥ 700px) | Responsif berdasarkan tinggi viewport |
