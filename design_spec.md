# NextVWT PTT App — Moderation Mode Icon Design Specification

Dokumen ini mendefinisikan spesifikasi teknis dan visual untuk ikon penanda mode pengguna/staf (`voice`, `operator`, `moderator`) yang dipasang sebagai lencana (badge) di atas foto profil/avatar anggota pada aplikasi NextVWT PTT.

---

## 🏗️ 1. Tata Letak & Geometri (Layout & Geometry)

Lencana mode diposisikan secara absolut menindih sudut kanan bawah dari foto profil pengguna di dalam komponen `UserListModal.tsx`.

* **Dimensi Avatar**: Lingkaran berdiameter `52px` (`w-[52px] h-[52px]`).
* **Dimensi Lencana**: Tinggi dan lebar `21px` (`w-[21px] h-[21px]`).
* **Pemosisian (Positioning)**:
  * Kelas CSS: `absolute -bottom-[1px] -right-[1px]`
  * Jenis Penskalaan Gambar: `object-contain`
  * Dragging: `draggable={false}` (menonaktifkan interaksi seret browser).

---

## 🎨 2. Transparansi & Bayangan (Transparency & Drop Shadow)

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
