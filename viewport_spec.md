# Panduan Spesifikasi Viewport & Layout (NextVWT Android/PWA)

Dokumen ini mencatat konfigurasi viewport dan aturan layout yang digunakan pada proyek NextVWT PTT App. Spesifikasi ini sangat penting untuk memastikan tampilan web-hybrid terasa seperti aplikasi native ketika dibungkus dengan Capacitor atau Cordova pada perangkat Android.

---

## 1. Konfigurasi Meta Viewport

Konfigurasi di berkas `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### Penjelasan Parameter:
*   **`width=device-width`**: Menyesuaikan lebar viewport web dengan lebar layar fisik perangkat.
*   **`initial-scale=1.0`**: Memulai zoom halaman pada tingkat 100% saat pertama kali dimuat.
*   **`maximum-scale=1.0` & `user-scalable=no`**: Mencegah pengguna memperbesar/memperkecil layar (*pinch-to-zoom* atau *double-tap zoom*). Ini wajib digunakan agar interaksi web-hybrid terasa kokoh layaknya aplikasi native.
*   **`viewport-fit=cover`**: Menginstruksikan halaman untuk memanfaatkan seluruh area layar termasuk area di bawah lekukan kamera (*notch/safe area*) dan bar navigasi.

---

## 2. Aturan CSS Pendukung Native Look & Feel

Untuk mencegah perilaku default browser seluler yang merusak pengalaman aplikasi native (seperti *bounce scroll*, *rubber-banding*, atau *pull-to-refresh*), aturan CSS berikut dipasang pada elemen `html` dan `body`:

```css
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none; /* Mencegah efek bounce-scroll berantai */
  position: fixed;           /* Mengunci posisi layar agar tidak bergeser */
  touch-action: manipulation; /* Menghilangkan delay 300ms saat tombol diklik di ponsel */
}

#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  overscroll-behavior: none;
}
```

---

## 3. Dimensi Kontainer Utama (Responsive Layout)

Aplikasi NextVWT menggunakan tata letak dinamis tergantung pada ukuran layar:

### A. Tampilan Mobile / Native App (di bawah breakpoint `sm`):
*   **Lebar (Width):** `w-full` (`100%`)
*   **Tinggi (Height):** `h-dvh` (Menggunakan *Dynamic Viewport Height* agar tinggi kontainer menyesuaikan secara dinamis saat bar URL browser seluler muncul/sembunyi).

### B. Tampilan Tablet / Desktop (di atas breakpoint `sm`):
Untuk mensimulasikan bingkai ponsel fisik saat dibuka di peramban desktop, kontainer dikunci pada rasio aspek:
*   **Lebar (Width):** `sm:w-[360px]`
*   **Tinggi (Height):** `sm:h-[800px]`
*   **Efek Tambahan:** `sm:rounded-[40px]`, `sm:border-[8px] sm:border-[#2a2d36]`, `sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)]` untuk menggambar mockup bodi fisik ponsel.
