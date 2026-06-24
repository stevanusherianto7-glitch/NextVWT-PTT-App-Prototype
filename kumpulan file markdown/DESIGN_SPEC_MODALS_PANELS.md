# NextVWT PTT App - Modals & Panels UI Design Specifications

Dokumen ini merinci secara khusus aspek kegayaaan visual, penempatan, ukuran, margin, font, transisi animasi, serta struktur tata letak untuk komponen **Settings Panel**, **User List Modal**, dan **Channel List Modal** pada aplikasi NextVWT.

---

## ⚙️ 1. Settings Panel Component (`SettingsPanel.tsx`)

Settings Panel adalah panel layar penuh/modal kontrol tempat pengguna mengonfigurasi profil, lokasi, akun Google, tampilan, audio, dan tema perangkat.

### A. Dimensi & Tata Letak Dasar (Container)

- **Dimensi Fisik**: Mengisi penuh layar (`w-full h-full`), menggunakan tata letak flexbox vertikal (`flex flex-col`).
- **Latar Belakang**: Warna abu-abu terang `#f0f0f0` dengan pemilih teks dinonaktifkan (`select-none`) dan warna teks default hitam (`text-black`).

### B. Header Bar Atas

- **Dimensi**: Tinggi tetap `55px` (`h-[55px]`), flexbox horizontal (`flex items-center px-4`), z-index `20` dengan posisi `relative`.
- **Garis Tepi & Bayangan**:
  - Border bawah: `1px solid #cbd5e1`
  - Drop shadow: `0 2px 4px rgba(0,0,0,0.05)`
- **Elemen Internal**:
  1. **Tombol Kembali (Back Button)**:
     - Ikon: SVG Chevron kiri (`polyline points="15 18 9 12 15 6"`), stroke-width `2.5`, ukuran `20px × 20px`.
     - Warna: Biru link `#0066cc`.
  2. **Logo Mini 3D**:
     - Dimensi: Tinggi `40px` (`h-[40px]`), lebar proporsional (`w-auto`), drop-shadow `0 2px 4px rgba(0,0,0,0.15)`.
     - Detail Logo: Bola 3D merah glossy (Radial Gradient `#glossyRedSettingsBar`) berselubung 3 garis lengkung sinyal hijau 3D.
  3. **Judul Header**: Teks `"Pengaturan"` berukuran `16px` (`text-[16px]`), tebal `bold`, warna hitam, dengan tracking-wide.

### C. Pembagian Seksi Form (Form Sections)

Formulir bergulir (`flex-1 overflow-y-auto w-full pb-8`) dibagi menjadi beberapa seksi yang dibatasi oleh pembatas visual abu-abu gelap:

- **Gaya Pembatas (Section Header)**: Latar belakang abu-abu gelap `#e2e8f0`, padding vertikal `4px` (`py-1`), padding horizontal `12px` (`px-3`), ukuran font `11px`, tebal `bold` (700), warna teks `#475569`, huruf kapital (`uppercase`), dan tracking-wider.
- **Gaya Baris Isi (Row Item)**: Latar belakang putih bersih (`bg-white`), padding `16px` (`p-4`) atau `12px` (`p-3`), border bawah tipis `1px solid #e2e8f0` (border-gray-200).

### D. Rincian Fitur Seksi Utama

#### 1. Seksi Info & Lokasi

- **Input Box**: Lebar penuh, border abu-abu `#d1d5db`, rounded `4px`, padding `8px horizontal, 4px vertical`, font-size `14px` (text-sm), bg-white, text-black. Focus border `#3b82f6` (biru).
- **Tombol Shortcut Modal (Phrase / Lokasi)**:
  - Gaya: Padding `8px` (p-2), background `#f3f4f6` (hover `#e5e7eb`), border `#cbd5e1`, rounded `4px`.
  - Ikon: SVG dokumen (Phrase) atau SVG kaca pembesar (Lokasi) berukuran `18px × 18px`.

#### 2. Seksi Akun (Profile Photo Editor)

- **Casing Foto Profil**: Kotak tegak persegi panjang ukuran `120px` (Lebar) × `140px` (Tinggi), border abu-abu `#cbd5e1`, latar belakang `#e0e0e0`, shadow-inner untuk sensasi kedalaman lubang cetakan foto. Foto profil disetel `object-cover` untuk pengisian penuh.
- **Segmented Photo Source Control**:
  - Wadah: Lebar maksimal `240px`, latar abu-abu `#f3f4f6` (p-1 rounded-lg), jarak bawah `12px` (mb-3).
  - Tombol Tab "Foto Google":
    - Gaya: `flex-1 py-1.5 px-2`, font-size `10px`, font-bold, rounded-md, transisi warna.
    - Status Aktif: Latar putih (`bg-white`), warna teks indigo `#4f46e5` (text-indigo-600), shadow-sm.
    - Status Inaktif: Warna teks abu-abu `#6b7280`.
    - Status Dinonaktifkan (jika bukan login Google): Opacity `40%`, cursor-not-allowed.
  - Tombol Tab "Unggah Galeri" (Single Trigger):
    - Gaya: Identik dengan tab Google.
    - Logika Interaksi (Opsi A): Klik pada tab ini akan langsung memicu dialog pemilih file sistem operasi secara programatis via React `useRef` ke `<input type="file" className="hidden" />` tersembunyi.
- **Tombol Keluar Akun Google**:
  - Latar Belakang: Gradien perak solid `linear-gradient(to bottom, #ffffff 0%, #cbd5e1 100%)`.
  - Garis Tepi & Bayangan: Border `#94a3b8`, bayangan `0 2px 4px rgba(148, 163, 184, 0.2)`. Hover mempertebal bayangan.

#### 3. Toggle Switch & Range Slider Specifications

Seluruh switch biner di panel pengaturan menggunakan kegayaan toggle kustom:

- **Dimensi Switch**: Lebar `50px`, tinggi `25px`, rounded `12.5px`, latar abu-abu `#c7c7c7` (Unchecked).
- **Knob Bulat (Thumb)**: Diameter `25px`, rounded `50%`. Latar belakang gradien logam melingkar (conic-gradient):
  `conic-gradient(rgb(104, 104, 104), white, rgb(104, 104, 104), white, rgb(104, 104, 104))`
  Bayangan knob: `2px 1px 3px rgba(8, 8, 8, 0.3)`.
- **Efek Aktif (Checked)**:
  - Latar Belakang Switch: Berubah menjadi abu-abu logam hangat `#cbd5e1` disertai bayangan dalam.
  - Pergeseran Knob: Bergerak ke kanan sejauh `25px` (`transform: translateX(100%)`) dengan durasi transisi `0.3s`.
- **Range Slider (Volume/Feedback/PTT Sliders)**:
  - Jalur Slider: Tinggi `4px`, background abu-abu perak `#d5dbe1`.
  - Knob Slider: Lingkaran diameter `18px`, warna perak mengkilap (chrome finish) dengan drop-shadow halus.

---

## 👥 2. User List Modal Component (`UserListModal.tsx`)

User List Modal menampilkan daftar staf atau anggota tim aktif yang berada di channel/room yang sama secara realtime.

### A. Sasis Luar, Penempatan & Keseragaman Dimensi

- **Penempatan**: Diposisikan tepat di bawah sasis utama LCD Display Panel untuk menyelaraskan alur visual fisik. Margin-top negatif `-32px` (`-mt-8`) merapatkan jarak bezel.
- **Keseragaman Dimensi (Acuan Utama Modal)**: 
  Dimensi fisik `UserListModal` dijadikan sebagai acuan baku ukuran bagi seluruh modal utama di aplikasi:
  - **Lebar**: `w-full max-w-[340px]`
  - **Tinggi**: `400px` pada layar biasa, responsif memanjang hingga `535px` pada layar tinggi ($\ge 700px$).
  - **Penyelarasan Global**: Seluruh modal lain (ChannelListModal, Phrase Modal, User Guide Modal, Province Selector Modal, City Selector Modal, Theme Selector Modal) menggunakan class global `.app-uniform-modal` di `theme.css` yang mewarisi ukuran ini secara identik.
  
### B. Desain Baris Detail Pengguna (User Row)

- **Wadah Baris**: Flexbox horizontal (`flex items-center gap-3`), padding horizontal `16px`, padding vertikal `10px`. Latar default abu-abu sangat muda `#fafbfc` (hover: `#ffffff`, active: `#f3f4f6`). Border bawah tipis `#d1d5db/70`.
- **Avatar Lingkaran**:
  - Ukuran: Diameter `44px` (`w-11 h-11`), `object-cover`, border putih halus, drop shadow `0 2px 4px rgba(0,0,0,0.15)`.
  - Inisial Nama (Fallback): Teks inisial berukuran `17px`, font-bold, warna latar deterministik (indigo, pink, teal, amber, dll) dengan inner shadow `inset 0 1.5px 3px rgba(255,255,255,0.4)`.
  - **Logika Visibilitas Foto**: Diintegrasikan secara dinamis dengan setelan `showMyPhoto` (untuk akun lokal), `showOtherPhotos` (untuk akun rekan), dan `showPhotosInList` (secara global). Jika salah satu dinonaktifkan, avatar gambar disembunyikan dan otomatis jatuh kembali (*fallback*) menggunakan inisial nama.
- **Presence Badge (Dot Status Aktif)**:
  - Ukuran: Diameter `15px`, melayang absolute di sudut kanan-bawah lingkaran avatar.
  - Gaya: Latar biru elektrik `#0088cc`, border putih tebal `1.5px`, memuat silhouette SVG siluet kepala mini berwarna putih di dalamnya.
- **Speaking Indicator (Megaphone)**:
  - Tampil di sebelah kanan nama jika pengguna tersebut sedang mentransmisikan suara (`isSpeaking === true`).
  - Gaya: Ikon SVG Megaphone berwarna abu-abu `#6b7280` berukuran `20px × 20px` dengan animasi kedip lambat (`animate-pulse`).

---

## 📻 3. Channel List Modal Component (`ChannelListModal.tsx`)

Channel List Modal adalah overlay dialog penuh untuk menyeleksi saluran walkie-talkie statis.

### A. Tirai Latar Belakang (Backdrop Overlay)

- **Gaya**: Latar belakang hitam transparan dengan opacity 60% (`bg-black/60`), z-index `50`, mengisi penuh layar (`inset-0`).
- **Perilaku**: Flexbox memusatkan modal di tengah (`items-center justify-center`), padding horizontal `16px` (`px-4`).
- **Jarak Vertikal dari Bezel**: Padding atas `8px` (`pt-2`) dan padding bawah `12px` (`pb-3`) — cukup tipis agar modal hampir memenuhi layar tanpa menempel langsung pada bezel perangkat.

### B. Kontainer Dialog (Modal Box)

- **Dimensi**: Mewarisi kelas `.app-uniform-modal` dengan lebar maksimal `340px` (`w-full max-w-[340px]`) dan tinggi responsif `400px` / `535px` agar seragam dengan modal lainnya, `overflow-hidden`.
- **Tepi & Bayangan**: Border `1px solid #d1d5db`, rounded `8px` (`rounded-lg`), drop shadow pekat `shadow-2xl`.
- **Animasi Transisi Masuk**: Efek membesar memudar halus `animate-in fade-in zoom-in-95 duration-100`.

### C. Header Brand Dialog

- **Struktur**: Flexbox vertikal, padding `16px`, border bawah `1px solid #e5e7eb`.
- **Logo NextVWT 3D Bulat (Mini)**:
  - Bola 3D Tengah: Tinggi `36px`, radial-gradient merah glossy (`#ffffff -> #ff1a1a -> #b30000 -> #4a0000`).
  - 3 Garis Gelombang Sinyal Hijau 3D (Mint, Emerald, Bold Green) yang mengelilingi bola.
- **Teks Slogan**: `"NEXT VIRTUAL WALKIE TALKIE"` berukuran `9px` s.d `10px`, warna merah `#e53935`, font-weight `900` (`font-black`), tracking lebar `0.18em`, mt `6px`.

### D. Bilah Pencarian & Baris Saluran (Channel Item Row)

- **Bilah Pencarian**: Input text-xs, border `#d1d5db`, rounded `6px`, padding horizontal `12px`, padding vertikal `6px`, focus outline biru.
- **Lencana Nomor Channel 3D Glossy (Badge)**:
   - Dimensi: Lebar tetap `55px`, padding vertikal `10px`, font-size `14px` (`text-sm`), tebal `bold` (700), warna teks putih, text-shadow `1px 1px 1px rgba(0,0,0,0.8)`.
   - Tepi 3D Timbul (Molded Bezel):
     - Highlight Top-Left: `border-t-[2.5px] border-l-[2.5px] border-t-white/45 border-l-white/45`.
     - Shadow Bottom-Right: `border-r-[2.5px] border-b-[2.5px] border-r-black/55 border-b-black/55`.
     - Bayangan Dalam: `shadow-[inset_1px_1px_0px_rgba(255,255,255,0.4)]`.
   - **Efek Glossy 3D Multi-Layer**: Setiap badge menerapkan dua layer gradien bertumpuk:
     - **Layer 1 (Overlay Refleksi)**: `linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 48%, transparent 52%, rgba(0,0,0,0.08) 100%)` — mensimulasikan pantulan cahaya kaca pada tombol fisik.
     - **Layer 2 (Warna Dasar)**: Gradien vertikal warna pekat sesuai tipe saluran.
   - Gradasi Warna Lencana (Berdasarkan Tipe Saluran, CSS Classes):
     - `.badge-green-dark` — Hijau Utama (CH 000 & 100): `#2e7d32` → `#155724`.
     - `.badge-green-light` — Hijau Biasa (CH 001 - 099): `#00e676` → `#009933`.
     - `.badge-red` — Merah Terbatas: `#ff3333` → `#b30000`.
     - `.badge-gray-dark` — Default/Abu-abu & "Selanjutnya": `#a0a0a0` → `#505050`.

### E. Scrollbar (Unified 1px — Seragam dengan UserListModal)

Kedua modal utama (ChannelListModal & UserListModal) menggunakan scrollbar ultra-tipis **1px** yang identik:

- **Webkit** (Chrome, Edge, Capacitor Android WebView):
  - `-webkit-scrollbar` width: `1px`
  - `-webkit-scrollbar-track` background: `transparent`
  - `-webkit-scrollbar-thumb` background: `#cbd5e1` (slate-300)
- **Firefox**: `scrollbar-width: thin`, `scrollbar-color: #cbd5e1 transparent`
- **ChannelListModal**: Didefinisikan di `ChannelListModal.css` (selector `.channel-modal-content .overflow-y-auto`)
- **UserListModal**: Didefinisikan via inline `<style>` di `UserListModal.tsx` (class `.custom-scrollbar`)

### F. Area List Saluran (Scrollable Channel List)

- **Container**: `flex-1 overflow-y-auto bg-white text-left divide-y divide-gray-200` — **tanpa bottom padding** agar tidak menyisakan area putih kosong di bagian bawah modal.
- **Tombol "Selanjutnya.."**: Pagination lazy-load (`visibleCount + 15`) dengan badge abu-abu kosong di sisi kiri dan teks `"Selanjutnya.."` di sisi kanan.

### G. Sub-Modal Overlay (Seragam 340px)

Semua sub-modal overlay di dalam ChannelListModal menggunakan lebar yang **seragam** dengan modal induknya:

| Sub-Modal | Lebar | Overlay Padding | Rounded | Z-Index |
|---|---|---|---|---|
| **Action Menu** (Menuju/Info Channel) | `w-full max-w-[340px]` | `p-0` | `rounded-lg` | `z-55` |
| **Restricted Channel** (Terbatas) | `w-full max-w-[340px]` | `p-0` | `rounded-2xl` | `z-60` |
| **Info Channel** (Detail) | `w-full max-w-[340px]` | `p-0` | `rounded-2xl` | `z-60` |

- **Backdrop**: `bg-black/60`, `absolute inset-0`, `flex items-center justify-center`.
- **Animasi**: `animate-in fade-in zoom-in-95 duration-100`.

### H. Info Channel Modal — Layout Kompak (Ruang untuk Logo Channel)

Area konten Info Channel dipadatkan secara vertikal agar menyisakan ruang yang cukup lebar di bagian atas untuk keperluan upload/tampilan logo channel di kemudian hari:

- **Area Logo/Ikon** (atas): `py-4`, SVG sinyal tinggi `75px` — area ini akan digantikan oleh gambar logo channel.
- **Baris Nama**: `py-1` (4px), border-top `border-gray-100`, font `14px` bold, label `"Nama"` abu-abu `w-14`.
- **Baris Info**: `py-1` (4px), border-top & border-bottom `border-gray-100`, font `14px` semibold.
- **Tombol Tutup**: Margin atas `mt-1.5` (6px), padding vertikal `py-0.5` (2px), font `15px` bold, warna biru `#0c62a8`.
- **Container Padding**: `p-5` (20px) pada modal box.


---

## 🛡️ 4. Channel Manage & Moderation Panel Component (`ChannelManagePanel.tsx`)

Channel Manage & Moderation Panel adalah dashboard khusus yang digunakan oleh operator, Penanggung Jawab Channel (PJC), System Admin, atau N.O.C untuk memantau status, mengelola perizinan channel, dan menegakkan moderasi secara realtime.

### A. Dimensi & Tata Letak Dasar (Container)

- **Penempatan**: Berfungsi sebagai overlay modal penuh di dalam sasis faceplate utama, sejajar di atas konten utama.
- **Dimensi Fisik**: Mewarisi kelas `.moderation-container` dengan keseragaman dimensi modal utama:
  - **Lebar**: `w-full max-w-[340px]`
  - **Tinggi**: Mengisi penuh kontainer vertikal (`height: 100%`), `overflow-hidden`.
  - **Paddings**: `padding: 1.25rem 0.65rem` — dipadatkan dari `1rem` awal untuk memaksimalkan area horizontal aktif bagi elemen navigasi tab agar bebas dari pemotongan (truncation).
- **Latar Belakang**: Degradasi warna putih ke perak keabu-abuan (`linear-gradient(180deg, #ffffff 0%, #f7f9fb 100%)`) dengan border abu-abu tebal `2px solid #9ca3af` (border-gray-400) dan rounded `22px`.

### B. Header Bar Panel (`moderation-header`)

- **Struktur**: Flexbox horizontal (`flex justify-between items-center pb-2`), border bawah tipis `1px solid rgba(0, 0, 0, 0.08)`.
- **Judul**: Teks `"Kelola Channel"` berukuran `1.1rem` (`font-size`), tebal `850` (ultra-bold), tracking-wider, kapital penuh, warna gelap `#111827`. Didampingi ikon `Shield` berwarna hijau zamrud (`text-emerald-400`, `h-5 w-5`).
- **Tombol Tutup (Close Button)**: Lingkaran diameter `2.25rem` (`w-9 h-9`), background transparan abu-abu perak, border tipis, memutar `90deg` dengan transisi hover berwarna merah destruktif (`rgba(220, 38, 38, 0.1)`).

### C. Navigasi Tab Mengambang (`moderation-tabs`)

Navigasi atas membagi panel menjadi 4 area kontrol yang disusun sejajar secara horizontal:

- **Tata Letak Baris Tab**: Flexbox horizontal (`flex`), dengan `gap: 0.2rem` (3px) dan padding kontainer `0.15rem` (2.4px). Background abu-abu muda `#f1f5f9` (slate-100), rounded `12px`, border tipis.
- **Tombol Tab (`.moderation-tab-btn`)**:
  - Sifat Flex: `flex: 1` (membagi ruang secara merata), `white-space: nowrap`.
  - Spasi & Teks: Padding `0.4rem 0.15rem`, ukuran font `0.6rem`, font-bold (`700`), kapital penuh, warna default `#64748b` (slate-500).
  - Jarak Ikon & Teks: `gap: 0.15rem !important` (2.4px) dengan tinggi/lebar ikon Lucide `12px × 12px` (`h-3 w-3`) untuk mencegah tab terpotong atau meluap keluar batas sasis.
- **Status Tab Aktif (`active`)**:
  - Warna Teks: Hijau zamrud gelap `#047857` (emerald-700).
  - Latar Belakang: Putih bersih `#ffffff`, border `1px solid #10b981` (emerald-500), drop shadow halus `0 1px 3px rgba(0, 0, 0, 0.08)`.

### D. Struktur Panel Konten Kontrol

#### 1. Tab Detail & Otorisasi ("INFO")
- **Detail Saluran**: Kartu kaca putih `.moderation-glass-card` menampilkan nama channel, nomor ID room, deskripsi, mode saluran (aktif/senyap), dan warna tema sasis.
- **Otorisasi Lokal**: Menampilkan lencana peran aktif pengguna di room tersebut (`noc`, `sys_admin`, `pjc`, `operator`, `guest`) dengan gradasi warna premium (misalnya peran PJC menggunakan latar ungu lembut `#7c3aed` dengan kemilau beveled 3D) dan status moderasi aktif.

#### 2. Tab Pengelolaan Pengguna ("ANGGOTA")
- **Struktur List**: Menampilkan daftar anggota aktif di room (Online) dan tab filter anggota yang ter-ban (Banned).
- **Aksi Moderasi (Aksi Tactile)**: Klik pada user memicu dialog modal lembar aksi yang menyajikan opsi kontrol:
  - **Ubah Peran**: Dropdown pilihan pangkat yang dibatasi oleh hirarki otoritas (misalnya PJC hanya bisa memoderasi operator & guest).
  - **Mute / Unmute**: Mematikan suara user (berdurasi 15m, 1j, 24j, permanen).
  - **Blokir / Buka Blokir PTT**: Mencegah transmisi suara.
  - **Blokir / Buka Blokir Chat**: Mematikan akses chat room.
  - **Kick**: Mengeluarkan user secara realtime dengan mematikan daya radio mereka secara paksa.
  - **Ban / Unban**: Memasukkan ke daftar hitam permanen.

#### 3. Tab Batasan Saluran ("SETELAN")
Menyediakan slider dan toggle pengaturan room yang disinkronkan secara realtime:
- **Batasan Slow Mode**: Slider rentang durasi cooldown jeda transmisi (`0s`, `5s`, `10s`, `30s`, `60s`).
- **Maksimum Durasi PTT**: Slider pembatas panjang bicara terus-menerus (`15s`, `30s`, `60s`, `120s`).
- **Toggle Perizinan Fitur**: Switch biner kustom perak untuk mengaktifkan/menonaktifkan chat tamu, reaction tamu, dan transmisi PTT tamu.

#### 4. Tab Riwayat Audit ("LOG")
- **Konten Log**: Menampilkan daftar audit log immutable yang diurutkan secara kronologis terbalik (paling baru di atas).
- **Gaya Baris Log**: Latar belakang abu-abu pudar `#f8fafc`, border tipis `#e2e8f0`, memuat label aksi berwarna tebal (mis. `BAN_USER`, `MUTE_USER`) beserta timestamp dan rincian parameter metadata (seperti durasi atau alasan).

