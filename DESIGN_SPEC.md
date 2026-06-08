# NextVWT PTT App - Design Specification & Technical UI Specifications

Dokumen ini mendefinisikan seluruh spesifikasi desain visual, token kegayaan, tata letak, komponen UI, hingga logika pergerakan animasi untuk aplikasi NextVWT PTT Walkie-Talkie.

---

## 🏗️ 1. Project Architecture & File Stack

- **Frontend**: React (v18.3) + TypeScript + Vite + Tailwind CSS.
- **Database & Realtime**: Supabase (Single Source of Truth, postgresql snake_case).
- **State Management**: Zustand dengan persistensi `localStorage`.
- **Deployment & CI/CD**: Vercel & GitHub Actions (Conventional Commits enforcement).

---

## 🎨 2. Design System & Global Themes (8 Themes)

Seluruh token visual disimpan dalam variabel CSS di berkas `src/styles/theme.css` dan dikendalikan melalui kelas selektor tema.

### A. Classic Theme (`.theme-classic` / `:root`)

- **Device Chassis Background**: `linear-gradient(to bottom, #d5dbe1 0%, #a4b0be 100%)`
- **Device Border**: `1px solid #c8d1db`
- **LCD Background**: `linear-gradient(to bottom, #ff9500 0%, #d87d00 100%)` (Amber Glow)
- **LCD Glow**: `0 0 10px rgba(255, 255, 255, 0.8)`
- **LCD Text (Channel Number)**: `#ffffff`
- **LCD Label & Icons**: `#1a1a1a`
- **PTT Button (Idle)**: `linear-gradient(to bottom, #2cdb66 0%, #19ba42 100%)`
- **PTT Button (Active)**: `linear-gradient(to bottom, #d62828 0%, #a01010 100%)`
- **D-Pad Base Background**: `linear-gradient(to bottom, #ffffff, #e8ebf0)`

### B. Glass Crystal V1 (`.theme-v1`)

- **Device Chassis Background**: Semi-transparent light blue gradient.
- **LCD Background**: Amber gradient (`#ff9500 → #d87d00`).
- **LCD Text**: `#ffffff` (Putih).
- **LCD Label**: `#1a1a1a` (Abu-abu gelap).

### C. Glass Crystal V2 (Premium Goldfish - `.theme-v2`)

- **Device Chassis**: Transparent glass-morphic panel (`blur(20px)`) with diamond-cut bevel border and *smooth gradient sasis* (no diagonal glossy lines).
- **LCD Background**: Warm amber/gold.
- **LCD Text**: `#ffffff` (Putih).
- **LCD Label**: `#ffffff` (Putih kontras tinggi).
- **Aquarium Content**: Ikan Mas Koki (Goldfish) berenang lambat secara organik.
- **D-Pad SCAN/SET & Rocker Buttons**: Sapphire Blue Bold (`#1e40af` -> `#1e3a8a`) with semi-transparent white borders.

### D. Glass Rounded (Soft Crystal - `.theme-v3`)

- **Device Chassis Background**: `linear-gradient(135deg, rgba(224,247,250,0.9) 0%, rgba(178,235,242,0.8) 40%, rgba(77,208,225,0.75) 70%, rgba(224,247,250,0.85) 100%)` (smooth gradient, no diagonal glossy lines).
- **LCD Background**: Cyan gradient (`#00e5ff → #00b0ff`).
- **LCD Text**: `#ffffff` (Putih).
- **LCD Label**: `#ffffff` (Putih).
- **Aquarium Content**: Ikan Cupang Biru (Blue Betta) dengan sirip melambai lambat.
- **D-Pad SCAN/SET & Rocker Buttons**: Teal/Cyan Bold (`#00838f` -> `#004d40`) with semi-transparent white borders.

### E. Dark Glass (Smoked Crystal - `.theme-v4`)

- **Device Chassis Background**: Deep charcoal gradient (`#263238 → #141b1e → #080c0e`) (smooth gradient, no diagonal glossy lines).
- **LCD Background**: Neon Emerald Green gradient (`#00c853 → #007c31`).
- **LCD Text**: `#ffffff` (Putih).
- **LCD Label**: `#ffffff` (Putih).
- **Aquarium Content**: Ikan Neon Tetra kecil berenang berkelompok secara lincah.
- **D-Pad SCAN/SET & Rocker Buttons**: Forest Green Bold (`#065f46` -> `#064e3b`) with semi-transparent neon green borders.

### F. Aurora Glass (Color Crystal - `.theme-v5`)

- **Device Chassis Background**: Purple Magenta gradient (`#f3e5f5 → #ce93d8 → #ab47bc`) (smooth gradient, no diagonal glossy lines).
- **LCD Background**: Hot Pink/Magenta gradient (`#ff4081 → #e040fb`).
- **LCD Text**: `#ffffff` (Putih).
- **LCD Label**: `#ffffff` (Putih).
- **Aquarium Content**: Ikan Cupang Pink/Magenta (Pink Betta) berenang anggun.
- **D-Pad SCAN/SET & Rocker Buttons**: Pink/Magenta Bold (`#d81b60` -> `#880e4f`) with semi-transparent white borders.

### G. Glass Crystal V6 (Live Aquarium - `.theme-v6`)

- **Device Chassis Background**: Ocean Navy gradient (`#03045e 0%, #0077b6 50%, #0096c7 100%`).
- **LCD Background**: Deep Sea Blue gradient (`#03045e 0%, #023e8a 100%`).
- **LCD Glow**: `0 0 15px rgba(0, 180, 216, 0.55)` (Ambient Cyan).
- **LCD Text**: `#ffffff` (Putih).
- **LCD Label**: `#90e0ef` (Cyan muda).
- **Aquarium Content**: Campuran spesies ikan (Goldfish, Betta, Neon Tetra) berenang bersama.

### H. Monokrom (Legacy Retro - `.theme-monokrom`)

- **Device Chassis Background**: Cool slate gray gradient (`#f1f5f9 → #cbd5e1`).
- **LCD Background**: Retro Slate Green gradient (`#94a3b8 → #64748b`).
- **LCD Text**: `#ffffff` (Putih).
- **LCD Label**: `#1a1a1a` (Abu-abu gelap).

---

## 📱 3. Component UI Specifications

### A. LCD Display Panel Component (`LCDPanel.tsx`)

Komponen utama penampil status radio. Menggunakan styling kaca (glassmorphism) bertingkat yang diatur dalam struktur elemen berikut:

#### 1. Sasis Utama (Outer Chassis Container)

- **Dimensi Fisik**: Lebar tetap `300px`, tinggi tetap `155px`, `border-radius: 24px` (`rounded-3xl`), margin horizontal otomatis (`mx-auto`), padding `p-[10px]` untuk bingkai.
- **Latar Belakang & Efek Sinar**:
  - Warna Backlight: Menggunakan variabel `--lcd-bg` (berupa `linear-gradient` vertikal) pada kontainer layar dalam.
  - Ambient Glow: Menggunakan variabel `--lcd-glow` (misal `.theme-v6` memakai `0 0 15px rgba(0, 180, 216, 0.55), 2px 2px 4px rgba(0, 0, 0, 0.3)`).
- **Bezel Tepi 3D Emas Bebas Bocor**:
  - Dibuat menggunakan paduan `linear-gradient(135deg, ...)` warna emas/tembaga (`--lcd-border-top` ke `--lcd-border-bottom`) sebagai background sasis utama dengan padding `10px`, menghilangkan garis join border diagonal browser agar bebas bocor.

#### 2. Lapisan Efek Kedalaman Bezel & Kaca (Depth & Glass Layers)

- **3D Gold Bezel Emboss Overlay**:
  - Elemen: `div` absolute dengan penempatan `inset-0` dan `border-radius: 24px` (`rounded-3xl`).
  - Efek Bayangan: `box-shadow: inset 0 0 0 1.5px rgba(0,0,0,0.28), inset 0 3.5px 6px rgba(255,255,255,0.55), inset 0 -3.5px 6px rgba(0,0,0,0.55), inset 0 0 14px rgba(0,0,0,0.22)`.
- **Inner Screen Container (Kontainer Layar Dalam)**:
  - Elemen: `div` dengan `rounded-[14px]` dan `overflow-hidden` untuk memotong elemen di dalamnya (seperti AquariumCanvas).
- **3D Inner Border/Glass Highlight Overlay**:
  - Elemen: `div` absolute pengisi penuh `inset-0` dengan `border-radius: 14px`.
  - Efek Bayangan: `box-shadow: inset 0 0 0 2px rgba(255,255,255,0.45), inset 0 0 12px rgba(0,0,0,0.65)`.
- **Glossy Screen Shine Overlay**:
  - Elemen: `div` absolute di bagian atas layar `h-[45%]` dengan gradasi `linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)` untuk simulasi kilau kaca fisik.

#### 3. Konten Baris Atas (Top Status Bar)

- **Struktur Tata Letak**: Flexbox horizontal (`flex items-start justify-between`), padding dalam `p-3` (`12px`) untuk menyelaraskan status.
- **Bagian Informasi Username (Kiri)**:
  - Wadah: Flexbox horizontal (`flex items-center gap-1.5 pt-1`).
  - Ikon Kepala Username (`usernameIcon`): Tinggi `48px`, lebar `46px`, `object-contain`, pergeseran margin `-mt-2 -ml-1` (`margin-top: -8px`, `margin-left: -4px`), filter bayangan `filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.2))`.
  - Teks Username: Ukuran `16px` (`text-base`), tebal `semibold` (600), margin-left `-ml-1` (`-4px`), lebar maksimal `110px` (`max-w-[110px]`), pemotongan teks otomatis jika melebihi batas (`truncate`). Warna teks diatur menggunakan variabel `color: var(--lcd-label-color)`.
- **Bagian Batang Sinyal (Kanan)**:
  - Wadah: Flexbox horizontal penyelarasan bawah (`flex items-end h-[28px] relative gap-1 mt-1 mr-1 cursor-pointer select-none`).
  - Ikon Silang Sinyal Offline: Tampil jika offline, warna merah `#d32f2f`, font `bold` / `black`, diposisikan secara absolute di `left: -8px` (`-left-2`), `top: 0`, filter bayangan `drop-shadow(1px 1px 0px rgba(255,255,255,0.6))`.
  - Tooltip Latensi: Muncul di atas batang sinyal ketika diklik, posisi absolute `bottom-full right-0 mb-1.5` (`margin-bottom: 6px`), padding `px-2 py-0.5` (`8px horizontal, 2px vertical`), latar belakang hitam `#000000`, teks putih `#ffffff` berukuran `10px`, bergaris tepi tipis dengan bayangan `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -1px rgba(0,0,0,0.3)`.
  - Batang Sinyal (4 Bars): Lebar masing-masing batang `10.5px` (gap antar batang `0.5px`). Tinggi batang ke-n dihitung dengan rumus: `bar * 6 + 3` px (Bar 1: `9px`, Bar 2: `15px`, Bar 3: `21px`, Bar 4: `27px`).
    - Garis tepi batang: `1.5px solid #000000` (menambah ketegasan outline).
    - Bayangan 3D batang: `box-shadow: inset 1.5px 2px 1px rgba(255,255,255,0.7), inset -1.5px -1.5px 1px rgba(0,0,0,0.5)` (efek ekstrusi 3D beveled lebih tajam).
    - Gradasi Warna Aktif (4-3 batang): `linear-gradient(to bottom, #c6ffc2 0%, #00ff55 45%, #008f1f 100%)` (Neon Green super-vibrant).
    - Gradasi Warna Aktif (2 batang): `linear-gradient(to bottom, #fff3a1 0%, #ffcc00 45%, #b88600 100%)` (Golden Yellow super-vibrant).
    - Gradasi Warna Aktif (1 batang): `linear-gradient(to bottom, #ffc4c4 0%, #ff1133 45%, #a80000 100%)` (Intense Crimson Red super-vibrant).
    - Gradasi Warna Inaktif (Kosong): `linear-gradient(to bottom, #ffffff 0%, #e5e5e5 50%, #cccccc 100%)`.

#### 4. Lencana Status Mengambang (Floating Badges)

Diposisikan melayang absolute di tengah atas (`left-1/2 -translate-x-1/2 top-3` / `top: 12px`):

- **Lencana Offline**:
  - Latar Belakang: `#E53935` (Merah), garis tepi `1px solid #d32f2f`, `box-shadow: 0 2px 4px rgba(0,0,0,0.3)`.
  - Ikon SVG: `width: 12px`, `height: 12px`, `stroke-width: 3`, warna putih.
  - Teks: Ukuran `10px`, warna putih, tebal `bold` (700), huruf kapital.
- **Lencana Busy**:
  - Latar Belakang: `#f97316` (Oranye), garis tepi `1px solid #ea580c`, `box-shadow: 0 2px 4px rgba(0,0,0,0.3)`.
  - Teks: Ukuran `10px`, warna putih, tebal `bold` (700), huruf kapital, berkedip (`animate-pulse`).

#### 5. Konten Baris Bawah (Channel & Staf Count)

- **Struktur Tata Letak**: Wadah pembungkus horizontal (`flex justify-between items-end pb-2 px-1 mt-auto`), menggunakan padding-bottom `pb-2` (8px) untuk mencegah angka channel menempel pada bingkai/bezel bawah layar LCD.
- **Wadah Label & Nomor Channel (Kiri)**:
  - Wadah: Flexbox horizontal (`flex items-end gap-1 w-[115px]`).
  - Label **CH**: Posisi `relative`, `font-size: 20px`, tebal `bold`, `padding-bottom: 5px`, warna teks `var(--lcd-label-color)`.
  - Angka Channel (3 digit): Posisi `relative`, `font-family: 'DSEG7', monospace` (LED digital), `font-size: 52px`, tebal `bold`, `line-height: 0.75`, `margin-left: -2px`, `padding-bottom: 5px`, text-glow `text-shadow: var(--lcd-glow)`. Warna teks dipaksa putih bersih melalui variabel `color: var(--lcd-text-color)` (nilai `#ffffff` di semua tema).
- **Wadah Staf/User Count (Kanan)**:
  - Wadah: Flexbox horizontal (`flex items-end gap-2 mr-1 relative transition-[opacity,transform] duration-150 cursor-pointer hover:opacity-75 active:scale-95`), `padding-bottom: 5px`.
  - Ikon Kepala Kembar (`twinHeadsIcon`): Tinggi `48px`, lebar `46px`, `object-contain`, filter bayangan `filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.2))`.
  - Nomor Jumlah Staf (2 digit): Wadah pembungkus lebar `24px` (`w-[24px]`) dengan perataan kanan (`flex justify-end`) agar angka lurus sejajar di bawah signal bar di pojok kanan atas LCD. Ukuran font `24px` (`text-2xl`), tebal `medium` (500), `line-height: none`, warna teks `var(--lcd-label-color)`, bayangan teks `text-shadow: 1px 1px 1px rgba(255,255,255,0.3)`.

### B. D-Pad Control Buttons Component (`ControlButtons.tsx`)

Papan kontrol utama yang diposisikan secara absolute di atas pelat belakang cetakan D-pad untuk menjamin keselarasan simetris tanpa adanya pergeseran browser (Layout Shifts).

- **Ukuran Frame Utama**: `290px` (Lebar) × `150px` (Tinggi), margin atas `6px` (`mt-1.5`) di dalam komponen `ControlButtons.tsx`, dibungkus dalam flexbox wrapper bermargin `mt-1 mb-0.5` di `RadioLayout.tsx` untuk optimalisasi kompresi tinggi sasis.
- **Molded Backing Base SVG**:
  - Digambar menggunakan path SVG viewBox `0 0 290 150` agar muat presisi di dalam kontainer utama.
  - Path: `d="M 100 30 A 48.75 48.75 0 0 1 190 30 L 245 30 A 45 45 0 0 1 245 120 L 190 120 A 48.75 48.75 0 0 1 100 120 L 45 120 A 45 45 0 0 1 45 30 Z"`
  - Menggunakan koordinat integer presisi (`100`, `190`, `245`, `45`) dengan radius lengkungan tengah `48.75` untuk menyentuh tepat batas atas `y=0` dan bawah `y=150`.
  - Memiliki filter `dpad-inset-shadow` yang dioptimalkan dengan pergeseran diagonal (`dx="1.5" dy="2"` untuk highlight top-left, dan `dx="-2" dy="-2.5"` untuk shadow bottom-right) serta peningkatan opacity shadow menjadi `0.45` untuk memberikan efek cembung/timbul yang kontras. Seluruh visual 3D bevel ditangani secara internal oleh filter SVG ini untuk mencegah kebocoran visual (leak/menganga) di sekeliling tepi pelat cetakan.
- **Scan Button (Kiri)**:
  - Posisi: `left: 15px`, `top: 50px`.
  - Ukuran: `85px` (Lebar) × `50px` (Tinggi).
  - Tepi luar melingkar penuh (`rounded-l-full`), tepi dalam agak kotak (`rounded-r-[6px]`).
  - Memiliki kelas `overflow-hidden` untuk memotong kliping border/shadow yang berlebih.
- **Set Button (Kanan)**:
  - Posisi: `left: 190px` (menyisakan margin kanan tepat `15px`).
  - Ukuran: `85px` (Lebar) × `50px` (Tinggi).
  - Tepi luar melingkar penuh (`rounded-r-full`), tepi dalam agak kotak (`rounded-l-[6px]`).
  - Memiliki kelas `overflow-hidden` agar simetris dengan tombol Scan.
- **Up/Down Buttons Container (Rocker Kapsul Tengah)**:
  - Posisi: `left: 115px`, `top: 22.5px` (celah jarak renggang ke Scan dan Set disetel simetris masing-masing tepat `15px`).
  - Ukuran: `60px` (Lebar) × `105px` (Tinggi), `border-radius: rounded-full`, padding `p-1`.
  - **Up Button**: Tinggi `48px`, `rounded-t-full`.
  - **Down Button**: Tinggi `48px`, `rounded-b-full`.
  - **Center Divider Line (Pivot)**: Garis horizontal absolute tebal `4px`, `opacity: 0.4`, warna hitam, dipasang tepat di tengah (`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`) untuk menyimulasikan poros ayun rocker fisik.
- **Efek Bayangan Tombol D-Pad (SCAN/SET)**:
  - Posisi Normal (Idle): Memiliki bayangan ekstrusi 3D solid hitam setebal `2.5px` (`box-shadow: 0 2.5px 0 #000000, var(--btn-shadow)`) agar tombol terlihat timbul namun tetap rata menghadap tegak lurus ke pengguna.
  - Posisi Ditekan (Pressed): Menggunakan translasi turun `translateY(2px)` dengan `box-shadow: inset 0 3px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.1)`.

### C. PTT Button Component (`PTTButton.tsx`)

Tombol kirim suara berukuran besar di bagian bawah. Menggunakan double-container 3D tactile feedback:

#### 1. Soket Bingkai Luar (Outer Bezel Socket Container)

- **Ukuran Sasis**: Lebar `338px`, tinggi `108px`, `border-radius: 54px` (lingkaran penuh).
- **Posisi Dinamis & Skala**:
  - Transformasi: `translateY(${yOffset}px) scale(${scaleFactor})` (laju skala berkisar antara `0.75 + (pttSize/100) * 0.5` yang memetakan ke `0.9` pada ukuran 30 dan `1.25` pada ukuran 100).
  - Kecepatan transisi transformasi: `transition: transform 0.12s ease-out, box-shadow 0.06s ease-in-out`.
- **Latar Belakang**: `rgba(0, 0, 0, 0.12)` (parit sasis berwarna abu-abu sangat lembut).
- **Efek Bayangan Soket (Trench Shadow Depth)**:
  - Kondisi Ditekan (Depressed): `box-shadow: inset 0 3px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 0 10px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.08)`.
  - Kondisi Idle: `box-shadow: inset 0 6px 10px rgba(0,0,0,0.45), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 0 14px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.12)`. Ditambahkan _outer drop shadow_ pada parit luar untuk memperdalam efek 3D tombol yang masuk ke dalam sasis.

#### 2. Tombol Fisik Utama (Inner Active Button)

- **Dimensi**: Lebar `326px`, tinggi `96px`, `border-radius: 48px` (pill-shape).
- **Posisi & Efek Tekanan**:
  - Pergeseran vertikal saat ditekan: `isDepressed ? 'translateY(4px)' : 'translateY(0)'` dengan transisi `transition: transform 0.06s ease-in-out, box-shadow 0.06s ease-in-out`.
- **Garis Tepi (Border) & Warna Latar (Gradients)**:
  - **Power Off**: `1px solid #666666`, latar belakang `linear-gradient(to bottom, #a3a3a3 0%, #737373 100%)`.
  - **Busy (RX Busy)**: `1px solid #c2410c`, latar belakang `linear-gradient(to bottom, #f97316 0%, #ea580c 100%)`.
  - **Transmitting (TX Active)**: `1px solid #730e0e`, latar belakang `linear-gradient(to bottom, #d62828 0%, #a01010 100%)`.
  - **Idle (Power On)**: `1px solid #149c35`, latar belakang `linear-gradient(to bottom, #2cdb66 0%, #19ba42 100%)`.
- **Efek Bayangan Tombol (Tactile 3D Shadows)**:
  - **Depressed**: `box-shadow: inset 0 8px 12px rgba(0, 0, 0, 0.85), inset 0 -2px 3px rgba(0, 0, 0, 0.2)`.
  - **Busy**: `box-shadow: inset 0 3px 6px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 10px rgba(249, 115, 22, 0.4)`.
  - **Transmitting**: `box-shadow: inset 0 3px 6px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)`.
  - **Idle**: `box-shadow: inset 0 3px 6px rgba(255, 255, 255, 0.8), 0 4px 10px rgba(44, 219, 102, 0.4)`.
- **Teks PTT / BUSY**:
  - Kegayaan: Warna `#ffffff`, `font-size: 44px`, `font-weight: 800` (extra bold), `letter-spacing: 3px`.
  - Bayangan Teks (Active/Busy): `text-shadow: 0 0 12px rgba(255, 255, 255, 0.6)`.
  - Bayangan Teks (Idle): `text-shadow: 1px 1px 2px rgba(0,0,0,0.3)`.
- **Convex Glass Highlight Overlay**:
  - Elemen: `div` absolute di `top-0.5 left-2 right-2` (`top: 2px, left: 8px, right: 8px`), tinggi `34px`, `border-radius: 34px`.
  - Latar Belakang: `linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.0) 100%)`.
  - Opacity: `isActive && !isDepressed ? 0.6 : isDepressed ? 0.2 : 1` (transisi `transition-opacity duration-300`).

### D. Toggle Switch Component (`ToggleSwitch.tsx`)

Slide switch daya utama (ON/OFF) di pojok kanan atas header. Menggunakan styling track 3D terbenam:

#### 1. Jalur Slide (Track Container)

- **Dimensi**: Lebar tetap `90px` (dikendalikan variabel `--width`), tinggi `36px` (`calc(var(--width) / 2.5)`), `border-radius: var(--width)` (`90px`), `border: 1px solid #aeb8c3`, latar belakang `#cbd2d9`.
- **Efek Bayangan Kedalaman (Inset & Drop Shadows)**:
  - Bayangan Masuk: `box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.7), inset 0 -3px 6px rgba(255, 255, 255, 0.9), inset 4px 0 8px rgba(0, 0, 0, 0.4), inset -4px 0 8px rgba(0, 0, 0, 0.4)`.
  - Bayangan Keluar: `0 2px 2px rgba(255, 255, 255, 0.8), 0 -1px 2px rgba(0, 0, 0, 0.2)`.

#### 2. Latar Status Jalur (Left & Right Indicators)

- **Dimensi**: Lebar `40%` dari track, tinggi `60%`. Efek bayangan bersama: `box-shadow: inset 0 0 1px rgba(0,0,0,0.5), inset 0 4px 6px rgba(0,0,0,0.6)`.
- **Indikator Kiri (Status ON - Hijau)**:
  - Posisi: `left: 10%`, `border-radius: 100px 0 0 100px`.
  - Latar Belakang: `linear-gradient(180deg, HSL(150deg 95% 40%) 10%, HSL(130deg 90% 45%) 60%, HSL(130deg 90% 30%))`.
- **Indikator Kanan (Status OFF - Merah)**:
  - Posisi: `right: 10%`, `border-radius: 0 100px 100px 0`.
  - Latar Belakang: `linear-gradient(180deg, #d32f2f 10%, #b71c1c 60%, #7f0000)`.

#### 3. Knob Slider Utama (Toggle Button)

- **Dimensi**: Lebar `50%` (`45px`), tinggi `90%` (`32.4px`).
- **Latar Belakang**: `linear-gradient(to bottom, #ffffff 0%, #e4e9f0 40%, #c4cdd6 100%)`, `border: 1px solid #aeb8c3`.
- **Bayangan Knob**: `box-shadow: inset 0 3px 5px rgba(255,255,255,1), inset 0 -3px 5px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.5), 0 8px 12px rgba(0, 0, 0, 0.3)`.
- **Groove Garis Tactile (2 garis vertikal)**:
  - Dua alur (`::before` & `::after`) dipasang di `top: 15%`, lebar `15%`, tinggi `70%`, `border-radius: 100px`, warna `#ffffff`, `box-shadow: inset 1px 1px 2px rgba(0,0,0,0.3), 1px 1px 1px rgba(255,255,255,0.8)`. Posisi horizontal masing-masing di `left: 25%` dan `right: 25%`.
- **Posisi Transisi Dinamis**:
  - OFF: `left: 5%` (`4.5px`).
  - ON (checked): `left: 45%` (`40.5px`).
  - Transisi gerakan: `transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)`.

### E. Brand Logo & Header Section (`RadioLayout.tsx`)

Spesifikasi visual logo 3D bulat dan identitas brand di bagian atas perangkat:

#### 1. Logo NextVWT 3D Bulat (Logo Sphere)

- **Dimensi**: Tinggi `55px`, lebar otomatis (`w-auto`), posisi `relative z-20`, transisi `transition-all duration-300`, bayangan `filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25))`.
- **Vektor Sinyal Melingkar (3 Arus Arsitektur Hijau)**:
  - **Sinyal Luar**: Path `d="M 22 77 A 38 38 0 1 1 78 77"`.
    - Bayangan (Shadow): `stroke: #0a2e1a`, `stroke-width: 6`, `opacity: 0.5`, `transform: translate(1px, 1.2px)`.
    - Isi (Fill): `stroke: #34D399` (Hijau muda), `stroke-width: 6`.
    - Kilau (Glow): `stroke: #a7f3d0` (Soft Green), `stroke-width: 1.5`, `opacity: 0.65`, `transform: translate(-0.6px, -0.7px)`.
  - **Sinyal Tengah**: Path `d="M 29 71 A 28 28 0 1 1 71 71"`.
    - Bayangan (Shadow): `stroke: #064e3b`, `stroke-width: 6`, `opacity: 0.5`, `transform: translate(1px, 1.2px)`.
    - Isi (Fill): `stroke: #10B981` (Hijau medium), `stroke-width: 6`.
    - Kilau (Glow): `stroke: #6ee7b7`, `stroke-width: 1.5`, `opacity: 0.65`, `transform: translate(-0.6px, -0.7px)`.
  - **Sinyal Dalam**: Path `d="M 36 65 A 18 18 0 1 1 64 65"`.
    - Bayangan (Shadow): `stroke: #003a17`, `stroke-width: 6`, `opacity: 0.5`, `transform: translate(1px, 1.2px)`.
    - Isi (Fill): `stroke: #00C853` (Hijau pekat), `stroke-width: 6`.
    - Kilau (Glow): `stroke: #69f0ae`, `stroke-width: 1.5`, `opacity: 0.65`, `transform: translate(-0.6px, -0.7px)`.
- **Bola Tengah 3D (3D Sphere)**:
  - Bola dasar: `cx: 50, cy: 50, r: 11`.
  - Bayangan bola: `fill: #1a0000`, `opacity: 0.45`, `transform: translate(1.2px, 1.5px)`.
  - Gradasi Radial Bola 3D (`nextvwtSphere3D`): `cx="32%" cy="30%" r="68%"`.
    - Stop 0%: `#ffffff`, `opacity: 0.95`.
    - Stop 18%: `#ff6b6b` (Merah muda).
    - Stop 50%: `#cc0000` (Merah terang).
    - Stop 80%: `#800000` (Merah maroon).
    - Stop 100%: `#3d0000` (Merah pekat gelap).
  - Garis tepi bola: `stroke: #ff4444`, `stroke-width: 0.8`, `opacity: 0.4`.
  - Kilau cahaya bola (Specular Highlight): Oval `cx: 46.5, cy: 45.5, rx: 3.2, ry: 2.2`, warna putih `#ffffff`, `opacity: 0.7`, rotasi `rotate(-25, 46.5, 45.5)`.

#### 2. Gelombang Pemancar Logo (TX Broadcast Ripple)

Hanya muncul ketika status mengirim suara (`isTransmitting === true`):

- **Wadah Absolute**: `absolute inset-0`, tinggi/lebar ripple `75px × 75px` (`logo-transmitting-bg`), efek pulsasi radial membesar dengan transisi lambat.

#### 3. Teks Brand & Marquee

- **Nama Brand (NextVWT)**: Font `Outfit`/`Orbitron`, ukuran `14px`, tebal `bold`, `letter-spacing: wide`, warna `var(--header-text-color)`.
- **Status Bar Marquee**:
  - Wadah: Lebar `120px`, tinggi `16px`, margin-top `2px` (`mt-0.5`), `overflow-hidden`, `whitespace-nowrap`.
  - Teks Berjalan: Kecepatan animasi marquee, ukuran font `10px`, tebal `semibold`, warna `var(--header-text-color)`, `opacity: 0.65`.

### F. Progress Bar Component (`ProgressBar.tsx`)

- **Ukuran**: `100%` lebar dalam panel, tinggi `10px`, `rounded-full`.
- **Glow Fill**: Gradien hijau neon dengan bayangan bersinar (`box-shadow: 0 0 10px rgba(74,222,128,0.5)`).

### G. User List Modal Component (`UserListModal.tsx`)

Modal overlay daftar pengguna/staf aktif yang diposisikan di bawah LCD Display Panel untuk menyelaraskan alur visual perangkat.

- **Sasis Utama (Outer Container)**:
  - Dimensi: Lebar penuh s.d maksimum `340px` (`w-full max-w-[340px]`), margin-top negatif `-mt-[14px]` untuk menyelaraskan batas atas modal tepat berimpit di bawah header bar tanpa kebocoran warna transparan, padding bawah `16px` (`pb-4`).
  - Latar Belakang & Garis Tepi: Warna latar putih (`#ffffff`), border kiri, kanan, dan bawah `1px solid #d1d5db` (`border-gray-300`).
  - Bentuk Bezel: Sudut bawah membulat `16px` (`rounded-b-2xl`).
  - Tata Letak: Flexbox vertikal (`flex flex-col`), tinggi responsif (tinggi `350px` pada layar `<700px`, tinggi `485px` pada layar $\ge 700px$).
  - Animasi transisi masuk: `animate-in fade-in duration-200`.
- **Area Gulir List (Scrollable Area)**:
  - Latar Belakang: `#fafbfc`, dengan pembagi baris abu-abu tipis (`divide-y divide-gray-100`).
  - Custom Scrollbar: Lebar `-webkit-scrollbar` `1px`, warna thumb `#cbd5e1`, Firefox memakai `scrollbar-width: thin`.
- **Baris Server Utama (Server Row)**:
  - Wadah: Flexbox horizontal, padding `16px` horizontal, `10px` vertikal, background `#f4f7f6`, border-bottom `1px solid #f3f4f6`.
  - Ikon Server: Lingkaran diameter `44px` (`w-11 h-11`), gradasi `linear-gradient(to bottom right, #fbbf24, #f59e0b)` (`from-amber-400 to-amber-500`), dengan shadow-inner dan ikon bintang SVG kuning `24px × 24px` di tengah.
  - Teks Server: Judul `"Server"` (font-size `14px`, tebal `500` / `medium`, warna `#111827`), subtitle `"SERVER NextVWT"` (font-size `10px`, tebal `400`, warna `#6b7280`, huruf kapital, tracking wide).
- **Baris Detail Pengguna (User Row)**:
  - Wadah: Flexbox horizontal, padding `16px` horizontal, `10px` vertikal.
  - Warna Latar: Default `#fafbfc`, border-bottom `1px solid rgba(209, 213, 219, 0.7)` (`border-gray-300/70`).
  - Efek Hover & Aktif: `hover:bg-white`, `active:bg-gray-100` dengan transisi warna.
  - Foto Avatar Pengguna:
    - Ukuran: Lingkaran `44px × 44px` (`w-11 h-11`), `shrink-0`.
    - Render Gambar: `object-cover`, border tipis `1px solid rgba(255,255,255,0.2)`, drop shadow `0 2px 4px rgba(0,0,0,0.15)`.
    - Fallback Karakter Nama (Initial Letter): Background warna deterministik (`#3F51B5`, `#E91E63`, dll), teks putih, font-size `17px`, tebal `600`, shadow dalam `inset 0 1.5px 3px rgba(255,255,255,0.4)`.
    - Lencana Status Aktif (Presence Dot): Melayang di kanan-bawah avatar, diameter `15px`, background biru `#0088cc`, border putih `1.5px`, bayangan halus, memuat SVG silhouette putih.
  - Nama & Teks Identitas:
    - Nama Tampilan: `text-[14px] font-medium text-gray-800 truncate leading-snug`.
    - Baris Callsign & Lokasi: Font-size `11px`, margin-top `2px`, tebal `500`, leading-none.
      - Callsign: warna biru `#0088cc`, tebal `500`, tracking wide.
      - Lokasi: warna abu-abu `#6b7280`, tebal `400` (normal), huruf kapital.
  - Ikon Megaphone Pembicara Aktif (Speaking Indicator):
    - Tampil hanya saat `isSpeaking === true` (transmisi aktif lokal atau simulasi penerimaan acak).
    - Kegayaan: Ikon SVG Toa `20px × 20px` berwarna abu-abu `#6b7280` dengan efek berkedip (`animate-pulse`).

### H. Channel List Modal Component (`ChannelListModal.tsx`)

Overlay dialog penuh untuk menampilkan semua daftar saluran (static channels) yang tersedia di NextVWT.

- **Lapisan Tirai Belakang (Backdrop Overlay)**:
  - Posisi: Absolute pengisi penuh `inset-0`, warna latar hitam transparan `rgba(0, 0, 0, 0.6)` (`bg-black/60`), flexbox memusatkan konten (`items-center justify-center`), padding `16px` (`p-4`), z-index `50`.
- **Wadah Dialog Modal (Modal Container)**:
  - Dimensi: Lebar penuh s.d maksimum `340px` (`w-full max-w-[340px]`), tinggi maksimum `80%` dari viewport, border-radius `8px` (`rounded-lg`).
  - Latar Belakang & Bayangan: Putih (`#ffffff`), border `1px solid #d1d5db` (`border-gray-300`), bayangan `shadow-2xl`.
  - Animasi transisi masuk: `animate-in fade-in zoom-in-95 duration-100`.
  - Tata Letak: Flexbox vertikal (`flex flex-col`), overflow tersembunyi (`overflow-hidden`).
- **Header Dialog**:
  - Wadah: Flexbox vertikal, items-center, padding `16px` (`p-4`), border-bottom `1px solid #e5e7eb` (`border-gray-200`), relative.
  - Tombol Silang Tutup (Close Button): Absolute `top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer`. Memuat SVG silang `20px × 20px` dengan stroke-width `2.5`.
  - Logo Brand Dialog (NextVWT Center Grid):
    - Teks "NEXT" & "VWT": Ukuran `30px` s.d `34px`, font-weight `900` (`font-black`), tracking-tighter, warna hijau `#22c55e`. Memiliki text-shadow bertingkat 3D: `1px 1px 0px #16a34a, 2px 2px 0px #15803d, 2px 2px 4px rgba(0,0,0,0.5)`.
    - Bola 3D Mini: Tinggi `36px` s.d `42px`, translate vertikal `2px` (`translate-y-[2px]`), filter `drop-shadow(0 2px 4px rgba(0,0,0,0.15))`.
      - Warna Bola (Radial Gradient - id `#glossyRedModal`): `cx="35%" cy="35%" r="65%"`.
        - Stop 0%: `#ffffff`
        - Stop 25%: `#ff1a1a`
        - Stop 70%: `#b30000`
        - Stop 100%: `#4a0000`
      - Bayangan Bawah Bola: `<circle cx="50" cy="50" r="10" fill="#2d0a0a" transform="translate(0.8, 1)" opacity="0.4" />`
      - Tiga Garis Arus Hijau (stroke-width: `5.5`, d-path lingkaran parsial):
        - Sinyal Luar: stroke `#34D399` (shadow `#0c351c` translate `0.8, 1`, highlight `#ffffff` opacity `0.7` translate `-0.5, -0.6` stroke-width `1.2`).
        - Sinyal Tengah: stroke `#10B981` (shadow `#083818` translate `0.8, 1`, highlight `#ffffff` opacity `0.7` translate `-0.5, -0.6` stroke-width `1.2`).
        - Sinyal Dalam: stroke `#00C853` (shadow `#0a3c10` translate `0.8, 1`, highlight `#ffffff` opacity `0.7` translate `-0.5, -0.6` stroke-width `1.2`).
  - Subtitle Header: Teks `"NEXT VIRTUAL WALKIE TALKIE"` berukuran `8px`, warna merah `#b81f25`, font-weight `850`, tracking `0.22em`, font-family `Montserrat/Poppins`.
- **Kolom Pencarian (Search Input)**:
  - Wadah: Padding `12px` (`p-3`), background abu-abu terang `#f9fafb` (`bg-gray-50`), border-bottom `1px solid #f3f4f6`.
  - Kolom Input: Lebar penuh, border `1px solid #d1d5db`, rounded `6px`, px `12px`, py `6px` (`py-1.5`), text-xs, outline-none, focus border `#3b82f6`, font-weight `600`.
- **Daftar Saluran Gulir (Scrollable Channel List)**:
  - Wadah: `flex-1 overflow-y-auto bg-white divide-y divide-gray-200`.
  - Tombol Pilihan Saluran (Channel Row Item):
    - flex items-center, hover:bg-gray-50, active:bg-gray-100, transition, cursor-pointer.
    - Lencana Nomor Channel (3 Digit Badge):
      - Lebar tetap `55px`, padding vertikal `10px`, text color putih (`#ffffff`), font-size `14px` (`text-sm`), tebal `bold` (700).
      - Molded 3D Bezel Borders:
        - Highlight Top-Left: `border-t-[2.5px] border-l-[2.5px] border-t-white/45 border-l-white/45`.
        - Shadow Bottom-Right: `border-r-[2.5px] border-b-[2.5px] border-r-black/55 border-b-black/55`.
        - Inner Shadow: `shadow-[inset_1px_1px_0px_rgba(255,255,255,0.4)]`.
        - Text Shadow: `1px 1px 1px rgba(0,0,0,0.8)`.
      - **Efek Glossy 3D Multi-Layer**: Dua layer gradien bertumpuk per badge:
        - Layer 1 (Overlay Refleksi): `linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 48%, transparent 52%, rgba(0,0,0,0.08) 100%)`.
        - Layer 2 (Warna Dasar): Gradien vertikal pekat sesuai tipe saluran.
      - Warna Gradasi Latar Saluran (CSS Classes):
        - `.badge-green-dark` — Saluran Hijau Utama (CH 000 & 100): `#2e7d32` → `#155724`.
        - `.badge-green-light` — Saluran Hijau Biasa (CH 001 - 099): `#00e676` → `#009933`.
        - `.badge-red` — Saluran Merah Terbatas: `#ff3333` → `#b30000`.
        - `.badge-gray-dark` — Saluran Default/Lainnya & "Selanjutnya": `#a0a0a0` → `#505050`.
    - Nama & Keterangan Pengguna Saluran:
      - Wadah: `ml-3 pr-3 flex-1 min-w-0 py-1`.
      - Nama Saluran: `text-xs font-bold text-black truncate`.
      - Jumlah/Daftar Anggota: `text-[10px] text-gray-500 font-semibold truncate mt-0.5 uppercase`. (Format: `"[Jumlah] PENGGUNA • [Daftar nama]"` / `"0 PENGGUNA"`. Khusus Saluran 0 tertulis `"WWW.NEXTVWT.ID"`).
- **Overlay Konfirmasi Akses Saluran (Active Channel Overlay)**:
  - Dimensi Dialog: Lebar penuh `w-full max-w-[340px]`, overlay `p-0`, rounded `8px` (`rounded-lg`), `shadow-2xl`, border `#f3f4f6`.
  - Pilihan Tombol:
    - `"Menuju Channel [Number]"`: px `20px`, py `18px`, hover:bg-gray-50, active:bg-gray-100, text `16px`, warna `#1f2937`, tebal `500` (`font-medium`), border-bottom `1px solid #f3f4f6`.
    - `"Info Channel [Number]"`: px `20px`, py `18px`, hover:bg-gray-50, active:bg-gray-100, text `16px`, warna `#1f2937`, tebal `500`.
- **Overlay Peringatan Terbatas (Restricted Warning Overlay)**:
  - Dimensi Dialog: Lebar penuh `w-full max-w-[340px]`, overlay `p-0`, rounded `16px` (`rounded-2xl`), `shadow-2xl`, padding `24px` (`p-6`).
  - Judul: `"Channel [Number] terbatas"`, font-size `17px`, tebal `bold` (700), warna `#1f2937`.
  - Deskripsi: `"Channel ini terbatas hanya untuk anggota channel"`, font-size `14px`, warna `#4b5563`, leading-relaxed, mt `10px`.
  - Tombol Tutup: `text-[15px] font-bold text-[#0c62a8] hover:text-[#0b5490] px-6 py-2 cursor-pointer focus:outline-none`.
- **Overlay Informasi Detail Saluran (Info Channel Overlay)**:
  - Dimensi Dialog: Lebar penuh `w-full max-w-[340px]`, overlay `p-0`, rounded `16px`, padding `20px` (`p-5`), border `#f3f4f6`.
  - Judul Header: flex items-center gap `8px`, padding bottom `10px`. Ikon info SVG warna biru `#0c62a8` tebal `2.5`, judul `"Channel [Number]"` (font `16px`, tebal `bold`).
  - Render Bola Logo 3D: Tinggi `75px` w-auto, area ini disiapkan untuk upload logo channel di kemudian hari.
  - Detail Row (Nama & Info) — Layout Kompak:
    - Baris Nama: border-top `1px solid #f3f4f6`, py `4px` (`py-1`), text `14px`. Label `"Nama"` (lebar `56px`, font-bold, text-gray-400), Nilai Nama (font-bold, text-gray-800).
    - Baris Info: border-top & border-bottom `1px solid #f3f4f6`, py `4px` (`py-1`), text `14px`. Label `"Info"` (lebar `56px`, font-bold, text-gray-400), Nilai Info (font-semibold, text-gray-700).
  - Tombol Tutup: `text-[15px] font-bold text-[#0c62a8] hover:text-[#0b5490] px-6 py-0.5 cursor-pointer focus:outline-none`, mt `6px` (`mt-1.5`).

### I. Settings Panel Component (`SettingsPanel.tsx`)

Panel layar penuh yang diposisikan absolute di atas kontainer utama.

- **Header Bar Atas**:
  - Ukuran: Tinggi `55px`, padding `px-4`, background `white`, border-bottom `1px solid #cbd5e1`, shadow `0 2px 4px rgba(0,0,0,0.05)`.
  - Tombol Kembali: Ikon chevron kembali (`stroke-width: 2.5`), warna `#0066cc`.
  - Judul Header: `"Pengaturan"`, font `16px` (`text-[16px]`), tebal `bold`.
- **Formulir Gulir (Scrollable Body)**:
  - Pembatas Seksi (Section Divider): Latar belakang `#e2e8f0`, py `4px`, px `12px`, font-size `11px`, tebal `bold` (700), warna teks `#475569`, huruf besar.
  - Baris Item: Latar belakang `white`, padding `12px` s.d `16px`, border-bottom `1px solid #e2e8f0`.
- **Seksi Editor Foto Profil (Akun)**:
  - Casing Foto: Kotak tegak persegi panjang `120px` × `140px`, border `#cbd5e1`, latar belakang `#e0e0e0`, shadow-inner.
  - Kontrol Sumber Foto (Segmented Switch): Lebar maks `240px`, latar `#f3f4f6`, rounded-lg.
    - Tombol tab "Foto Google": Latar putih (`bg-white`), text indigo `#4f46e5`, shadow-sm jika aktif; jika tidak login Google disetel disable dengan opacity `40%`.
    - Tombol tab "Unggah Galeri": Menggunakan React `useRef` untuk memicu dialog pemilihan file secara langsung tanpa menampilkan tombol unggah tambahan di bawahnya.
- **Toggle Switch Kustom**:
  - Dimensi: Lebar `50px`, tinggi `25px`, rounded `12.5px`, latar `#c7c7c7` (Unchecked).
  - Knob Bulat: Diameter `25px`, latar gradien logam melingkar (conic-gradient), bayangan `2px 1px 3px rgba(8,8,8,0.3)`.
  - Animasi Checked: Bergeser ke kanan `25px` (`translateX(100%)`) dengan durasi `0.3s`, warna latar belakang switch berubah menjadi `#cbd5e1`.

_Catatan: Rincian spesifikasi desain lengkap untuk komponen panel pengaturan, user list modal, dan channel list modal telah dipisahkan ke dalam berkas khusus [DESIGN_SPEC_MODALS_PANELS.md](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/DESIGN_SPEC_MODALS_PANELS.md)._

---

## 🐟 4. Aquarium Canvas Simulation Engine (`AquariumCanvas.tsx`)

Merupakan mesin visual simulasi akuarium 4K ultra-realistic yang memanfaatkan HTML5 Canvas 2D berkinerja tinggi.

### A. High-DPI (Retina) Scaling

Untuk mencegah visual ikan bergerigi pada layar resolusi tinggi:

1. Mendapatkan `devicePixelRatio` perangkat (biasanya `2` atau `3` pada ponsel cerdas).
2. Menskalakan ukuran internal kanvas (`canvas.width` dan `canvas.height`) sebanyak piksel rasio tersebut.
3. Mempertahankan ukuran CSS kanvas tetap `300px × 155px` (`style.width` dan `style.height`).
4. Melakukan penskalaan kuas gambar `ctx.scale(ratio, ratio)`.

### B. Perilaku & Fisika Pergerakan Ikan

- **Steering Force**: Pergerakan ikan dihitung berbasis vektor posisi, kecepatan, dan percepatan. Menggunakan algoritma wandering acak dengan batasan radius belok halus agar ikan tidak berputar secara patah.
- **Wiggling Tail (Kibasan Ekor)**: Digambar menggunakan kurva Bezier kompleks. Kibasan ekor dihasilkan oleh parameter dinamis:
  $$\theta = \sin(\text{time} \times \text{speed}) \times \text{maxAngle}$$
  Kecepatan kibasan ekor berbanding lurus dengan kecepatan laju berenang ikan.
- **3D Depth & Bayangan**:
  Ikan digambar dengan drop shadow internal kanvas untuk menciptakan kedalaman air (efek 3D):
  `ctx.shadowColor = 'rgba(0,0,0,0.55)'`, `ctx.shadowBlur = 10`, `ctx.shadowOffsetX = 8`.

### C. Spesies Ikan & Parameter Visual

1. **Goldfish (Mas Koki - Tema V2 & V6)**: Tubuh gemuk oranye-emas (`#ff7f00`), sirip ekor lebar berumbai transparan, gerakan lambat berputar.
2. **Blue Betta (Cupang Biru - Tema V3 & V6)**: Tubuh biru tua langsing (`#005f73`), sirip ekor melambai sangat lebar (`#0a9396` transparan), lambaian lembut.
3. **Neon Tetra (Tema V4 & V6)**: Ukuran sangat kecil (panjang 15px), tubuh bergaris biru neon (`#00f5d4`) dan ekor merah (`#ff0054`), berenang cepat secara bergerombol (_schooling behavior_).
4. **Pink Betta (Cupang Pink - Tema V5 & V6)**: Tubuh magenta anggun, sirip merah muda lembut melambai lebar.

### D. Sistem Partikel

- **Elastisitas Gelembung (Bubble Wobble)**:
  Gelembung udara naik ke atas dengan kecepatan acak dan goyangan sinus horizontal. Agar gelembung tampak realistis elastis, diameter gelembung disimulasikan menggunakan distorsi elips (_squash & stretch_):
  $$\text{scaleX} = 1 + \sin(\text{phase}) \times 0.08, \quad \text{scaleY} = 1 - \sin(\text{phase}) \times 0.08$$
  Gelembung juga memiliki titik kilau cahaya (_specular highlight_) di pojok kiri atas lingkaran gelembung.
- **Plankton & Mikro-Partikel**: 10-15 partikel plankton melayang acak berukuran 1px - 2px dengan opacity sangat tipis (`0.15`) untuk menyimulasikan kedalaman air alami.
- **Rumput Laut (Water Plant)**:
  Digambar di bagian bawah kanvas dengan tinggi bervariasi. Memiliki **12 segmen kurva** agar lambaian tanaman terlihat meliuk kontinu dan lembut, terpengaruh gelombang sinus arus global.

### E. Evasion System (Sentuhan Interaktif)

Ketika pengguna mengeklik/mengetuk area LCD Panel:

1. Posisi klik `(x, y)` ditangkap.
2. Gelombang riak air lingkaran (`ripple`) dipancarkan di lokasi sentuhan.
3. Seluruh ikan dalam radius `80px` akan menghitung vektor menjauh dari pusat sentuhan, meningkatkan kecepatan laju mereka secara drastis (efek terkejut), lalu berangsur-angsur melambat kembali ke kecepatan jelajah normal.

---

## 🔄 5. State Management & Offline Robustness

Aplikasi menggunakan Zustand store (`src/app/store/usePTTStore.ts`) yang dilengkapi fitur ketahanan jaringan (offline-ready):

1. **Persistensi Data Selektif**:
   Hanya data konfigurasi statis (seperti `channelNumber`, `themeText`, `user`) yang disimpan ke `localStorage`. Data runtime dinamis (seperti `isTransmitting`, `isScanning`, `progress`) dibersihkan dari penyimpanan lokal untuk mencegah status mengambang/stuck saat reload.
2. **Safe Storage Wrapper**:
   Membungkus akses `localStorage` dengan penanganan pengecualian (try-catch) sehingga jika penyimpanan lokal penuh atau rusak (corrupted JSON), aplikasi tidak akan memicu layar putih kosong (white screen crash), melainkan melakukan pemulihan fallback ke konfigurasi default.
3. **Pembersihan Otomatis Saat Power Off**:
   Jika slide daya WALKIE-TALIE dimatikan, seluruh proses active transmisi, audio queues, dan pemindaian (scanning) akan langsung dihentikan seketika untuk menghemat memori dan baterai perangkat.
4. **Pengaturan Waktu Tunggu Saluran (Debounced Reconnect Delay)**:
   Ketika `fastClick` dinonaktifkan (bernilai `false`), aplikasi menerapkan jeda debounce sambungan sebesar `800ms` sebelum memproses pendaftaran/langganan channel baru di Supabase. Ini berfungsi untuk mencegah pengiriman permintaan berulang-ulang yang dapat membebani server saat pemindaian cepat atau rotasi cepat tombol D-pad.
5. **Logika Visibilitas Avatar Pengguna**:
   Avatar foto dikontrol oleh tiga variabel setelan: `showMyPhoto` (untuk profil lokal), `showOtherPhotos` (untuk profil rekan), dan `showPhotosInList` (secara global). Jika salah satu bernilai `false`, avatar visual disembunyikan dan otomatis kembali menggunakan tampilan teks inisial berlatar warna dinamis.
6. **Optimasi Aktivitas Animasi Layar (bgActive)**:
   Saklar `bgActive` di pengaturan tampilan mengontrol jalannya rendering ikan di `AquariumCanvas.tsx`. Jika dinonaktifkan, siklus pembaruan animasi canvas distop guna menghemat konsumsi CPU/GPU pada perangkat berspesifikasi rendah.

---

## 🔊 6. Audio Streamer, WebRTC & Active Queue Management

Sistem streaming audio diimplementasikan via React Hook (`src/app/hooks/useAudioStreamer.ts`) dengan kemampuan perutean dinamis:

1. **Active Audio Buffer Queue (maxQueue)**:
   Saat menggunakan fallback transmisi berbasis Base64, akumulasi keterlambatan (latency) dicegah menggunakan parameter `maxQueue`. Jika ukuran antrean segmen audio melampaui nilai batas (`maxQueue`), sistem secara otomatis mereset waktu pemutaran langsung ke kondisi saat ini (`currentTime = now + 0.05`) untuk menghindari lag suara yang menumpuk.
2. **Duplex Mode (fullDuplex)**:
   Pengaturan `fullDuplex` mengontrol interaksi transmisi dua arah. Jika diaktifkan, pengguna dapat mendengar suara rekan pemancar lain secara realtime meskipun local PTT sedang aktif ditekan (transmitting). Jika dinonaktifkan, mode half-duplex murni diterapkan dengan mematikan decoder output saat PTT aktif.
3. **Built-in Hardware Echo & Feedback Delay**:
   Pada mode audio musik (`audioMode === 'music'`), jika saklar `builtInEcho` aktif, perutean audio menyuntikkan node delay (`DelayNode`) dengan waktu tunda `250ms` yang dicampur kembali via `GainNode` sesuai persentase `echoFeedback` dari pengaturan, mensimulasikan efek gema karaoke tanpa mengorbankan kualitas audio aslinya.
4. **Voice Activity Detection (VAD)**:
   Untuk menghemat data internet seluler, pengiriman paket audio melalui peer connection WebRTC disaring menggunakan modul VAD. Sistem akan membungkam microphone track secara otomatis jika volume RMS berada di bawah ambang batas `0.01` selama lebih dari `1.5` detik.

---

## 🔤 7. Typography System

- **DSEG7 Classic Mini Bold**: Digunakan khusus untuk angka channel digital LCD agar memberikan nuansa walkie-talkie retro-modern yang autentik.
- **Outfit**: Digunakan untuk teks judul brand **NextVWT** dan teks status utama.
- **Inter**: Digunakan untuk elemen antarmuka umum seperti detail pengguna, modal daftar nama staf/anggota tim, dan panel pengaturan.

---

## 📱 8. Viewport & Mobile Responsive Specifications

Untuk memastikan antarmuka Walkie-Talkie tidak terpotong di perangkat seluler (mobile browser) akibat bilah navigasi dinamis (dynamic toolbar/URL bar):

1. **Dynamic Viewport Height (`100dvh`)**:
   - Seluruh kontainer sasis utama (`App.tsx` dan `RadioLayout.tsx`) wajib menggunakan tinggi dinamis `h-[100dvh]` sebagai pengganti `min-h-screen` atau `100vh`.
   - Ini memastikan aplikasi selalu menempati tepat 100% dari ruang pandang aktif tanpa memicu scrollbar vertikal liar saat bilah alamat browser seluler bergeser.
2. **Layout Constraint**:
   - Layout dikunci pada mode portrait dengan lebar kontainer maksimal `w-full max-w-md` atau proporsi fisik sasis, memastikan elemen kontrol dan visual tetap berada di area jangkauan satu tangan (one-hand operation area) dan bebas dari Layout Shift (CLS < 0.1).
3. **Top Header Spacing Compression**:
   - Spasi vertikal antara top bar header (area logo dan power toggle) dan sasis utama panel LCD dipadatkan dengan mengubah padding-top kontainer utama dari `pt-8` (32px) menjadi `pt-[14px]` (14px). Ini mengangkat sasis utama panel LCD ke atas mendekati tepi bawah top header, menghasilkan visual yang lebih padat (compact) sambil tetap memberikan breathing room yang cukup untuk teks berjalan (marquee) di atas.
4. **Skeuomorphic Shadow Enhancements**:
   - Tepi bawah top header diperkuat dengan bayangan dalam (`inset 0 -12px 20px -6px rgba(0, 0, 0, 0.45)`) dan highlight atas (`inset 0 3px 6px rgba(255,255,255,0.4)`) untuk memberikan efek cembung (convex) yang menonjol keluar.
   - Sasis utama panel LCD (themed faceplate container) bagian atas, samping, dan bawah dikelilingi oleh bayangan dalam yang seragam dan sangat halus (`inset 0 3px 4px rgba(0,0,0,0.4)`, `inset 0 -3px 4px rgba(0,0,0,0.4)`, `inset 3px 0 4px rgba(0,0,0,0.3)`, `inset -3px 0 4px rgba(0,0,0,0.3)`) berpadu dengan subpixel top highlight (`inset 0 1.5px 2px rgba(255,255,255,0.95)`) di dalam 3D Faceplate Outer Highlight and Shadow Overlay untuk efek lubang bevel (inset recess) yang bersih dan rata.
5. **Faceplate & LCD Spacing Compression**:
   - Tinggi vertikal sasis faceplate utama dipadatkan untuk menghasilkan spasi visual dengan tombol PTT dengan mengurangi padding bawah sasis (`pb-7` ke `pb-3`), margin wrapper tombol kontrol (`mt-2 mb-2` ke `mt-1 mb-0.5`), dan margin top D-Pad (`mt-4` ke `mt-1.5`).
   - Bagian bawah LCD Panel dinaikkan sedikit dengan menambahkan padding bawah (`pb-0` ke `pb-2`) agar baris indikator channel tidak menempel rapat pada bezel bawah.

## 🛡️ 9. Security & Anti-Cloning Specifications (Option C)

Untuk mencegah kloning aplikasi, reverse engineering, dan pembajakan komunikasi data, sistem dilengkapi dengan lapisan proteksi berikut:

### A. Obfuscation & Minification JavaScript (Terser)
- **Minifier**: Terser (`minify: 'terser'`).
- **Mangling**: Mengaburkan nama variabel dan fungsi tingkat atas (`mangle.toplevel = true`).
- **Pembersihan Debugger/Console**: Secara otomatis menghapus statement `debugger` dan pemanggilan `console.*` pada versi produksi untuk menghalangi proses reverse engineering log perilaku runtime.
- **Sourcemap**: Dinonaktifkan (`sourcemap: false`) untuk mencegah pemetaan kembali kode terkompilasi ke kode asli.

### B. ProGuard Bytecode Obfuscation & Shrinking (Android Native)
- **Minification**: Diaktifkan di build gradle Android (`minifyEnabled true`) menggunakan aturan optimasi default (`proguard-android-optimize.txt`).
- **Bridge Protection**: Menjaga integritas refleksi jembatan komunikasi JavaScript-to-Native Capacitor:
  ```proguard
  -keep class com.getcapacitor.** { *; }
  -keep class com.nextvwt.ptt.** { *; }
  -keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
  -keepattributes JavascriptInterface
  -keepclassmembers class * {
      @android.webkit.JavascriptInterface <methods>;
  }
  ```

### C. System-Wide SSL Pinning (Android Network Security)
- **Target Domain**: `*.supabase.co` (Single Source of Truth).
- **Public Key Pinning (SPKI SHA-256)**: Menetapkan sidik jari kunci publik dari sertifikat SSL target (Let's Encrypt R3/E1, Cloudflare ECC, dan ISRG Root X1 sebagai backup) secara deklaratif di `network_security_config.xml`.
- **MitM Protection**: Menjamin seluruh WebView fetch request dan Supabase Realtime WebSocket client langsung menolak koneksi jika lalu lintas dialihkan melalui proxy tidak dikenal (sertifikat tidak cocok), mencegah pencurian API Key Supabase.

## 📱 10. Progressive Web App (PWA) Specifications (Option B)

Aplikasi dilengkapi dengan spesifikasi Progressive Web App (PWA) mandiri (standalone) yang dikonfigurasi secara kustom tanpa dependensi eksternal, menjamin kecepatan memuat instan (instant loading) dan ketahanan saat offline.

### A. Web App Manifest (`public/manifest.json`)
* **Metadata Aplikasi**:
  - `name`: `"NextVWT Walkie Talkie"`
  - `short_name`: `"NextVWT"`
  - `description`: `"Next Virtual Walkie Talkie - Real-time PTT communication platform"`
  - `start_url`: `"./index.html"`
  - `display`: `"standalone"`
  - `orientation`: `"portrait"`
  - `theme_color`: `"#0c62a8"`
  - `background_color`: `"#0a1423"`
* **Icons Configuration**:
  - Menyertakan ikon ukuran `192x192` (`pwa-192x192.png`) dan `512x512` (`pwa-512x512.png`) dengan tipe `image/png`.
  - Mendefinisikan properti `purpose: "any"` dan `purpose: "maskable"` pada ikon untuk adaptasi tampilan launcher OS Android/iOS.

### B. Service Worker Caching Strategy (`public/sw.js`)
* **Strategi Precaching**:
  - Menyimpan aset utama aplikasi (`./`, `index.html`, `pwa-192x192.png`, `pwa-512x512.png`) ke dalam cache statis (`nextvwt-static-v1`) saat instalasi.
* **Strategi Runtime Caching**:
  - **Static Assets (JS, CSS, Images, Fonts)**: Menggunakan strategi **Cache-First (Stale-While-Revalidate)**. Aset dimuat instan dari cache lokal, lalu diperbarui di latar belakang jika ada versi baru di server.
  - **API & WebSocket / Realtime Traffic**: Menggunakan strategi **Network-Only** dengan pembatasan bypass cache untuk menjamin komunikasi audio realtime dan WebRTC tidak pernah terhambat oleh interceptor service worker.
* **Offline Fallback**:
  - Ketika koneksi terputus total, service worker menyajikan berkas cache statis lokal agar aplikasi tidak menampilkan layar "No Internet" bawaan browser, melainkan langsung merender UI casing radio dalam kondisi *Offline Mode* dengan indikator silang merah pada LCD sinyal.

### C. Registration (`src/main.tsx`)
* Registrasi service worker dipicu secara asinkron saat halaman selesai dimuat (`window.onload`) untuk menghindari hambatan pada pemuatan kritis awal (Critical Rendering Path).

---

## 📝 11. Riwayat Perubahan Dokumen (Changelog)

| Versi | Tanggal | Deskripsi Perubahan | Penulis |
| :--- | :--- | :--- | :--- |
| **v2.1.0** | 2026-06-06 | Menambahkan spesifikasi viewport dinamis (`100dvh`) untuk ketahanan mobile browser (Seksi 8). | Senior System Architect |
| **v2.2.0** | 2026-06-06 | Memperbarui titik transisi D-Pad menjadi integer bulat (`100`, `190`), radius (`48.75`), serta penyesuaian gap simetris `15px` (Seksi 3.B). | Senior System Architect |
| **v2.3.0** | 2026-06-06 | Penyesuaian kedalaman parit PTT menggunakan latar belakang `rgba(0, 0, 0, 0.12)` dan sepasang bayangan dalam atas-bawah (`inset 0 6px 10px`, `inset 0 -4px 8px`) (Seksi 3.C.1). | Senior System Architect |
| **v2.4.0** | 2026-06-06 | Pengurangan spasi vertikal layout (D-Pad margin-top ke `mt-2`, padding-bottom sasis ke `pb-7`, PTT ke `bottom-[72px]`) (Seksi 3.B & 8). | Senior System Architect |
| **v2.5.0** | 2026-06-06 | Pemadatan spasi vertikal top header (padding-top kontainer utama dari `pt-8` ke `pt-[14px]`) untuk mendekatkan sasis utama panel LCD ke top bar header (Seksi 8). | Senior System Architect |
| **v2.6.0** | 2026-06-06 | Penyelesaian kebocoran warna bingkai LCD atas (padding gradient bezel) dan penguatan efek skeuomorphic (gloss, shadow, bevel) di seluruh antarmuka (Seksi 3.A & 8). | Senior System Architect |
| **v2.7.0** | 2026-06-06 | Penguatan bayangan dalam (inner shadow) sisi samping/atas sasis faceplate utama dan tepi bawah top header untuk visual 3D skeuomorphic lebih cembung/inset (Seksi 8). | Senior System Architect |
| **v2.8.0** | 2026-06-06 | Penyempurnaan & pelembutan bayangan dalam sasis faceplate utama (mengganti bayangan atas yang tebal/kasar dengan bayangan setebal 3px/4px yang seragam menyamai karakter tepi bawah) (Seksi 8). | Senior System Architect |
| **v2.9.0** | 2026-06-06 | Peningkatan visual batang sinyal LCD (lebar 10.5px, border 1.5px solid #000000, gradasi warna neon super-vibrant, dan inner 3D highlights dipertebal) serta perapatan gap antar batang menjadi 0.5px (Seksi 3.A.3). | Senior System Architect |
| **v3.0.0** | 2026-06-06 | Implementasi D-Pad Bezel Plate 3D Convex Bevel & Shadow menggunakan filter SVG diagonal yang disempurnakan (highlight white & shadow black) secara internal guna mencegah kebocoran visual (leak) di sekeliling tepi pelat cetakan (Seksi 3.B). | Senior System Architect |
| **v3.1.0** | 2026-06-06 | Penerapan Opsi C: JS Terser Obfuscation (mangle toplevel, drop console/debugger, no sourcemap), ProGuard Android bytecode shrinking & bridge reflection protection, serta deklarasi SSL Pinning (*.supabase.co) via networkSecurityConfig untuk proteksi anti-cloning & MitM (Seksi 9). | Senior System Architect |
| **v3.2.0** | 2026-06-07 | Kompresi tinggi sasis sasis faceplate utama (pb-7 -> pb-3, mt-2 mb-2 -> mt-1 mb-0.5, mt-4 -> mt-1.5) untuk membuat spasi dengan tombol PTT, serta penyelarasan jarak bottom row LCD Panel (pb-0 -> pb-2) agar tidak menempel ke bezel bawah (Seksi 3.A, 3.B, & 8). | Senior System Architect |
| **v3.3.0** | 2026-06-08 | Implementasi PWA Opsi B: PWA Kustom Manual (Service Worker + Manifest di public) dengan strategi Cache-First untuk aset statis dan Network-Only untuk WebSocket/Realtime (Seksi 10). | Senior System Architect |
