# Dokumentasi Logika Fitur & Alur Kerja - NextVWT PTT App

Dokumen ini menjelaskan alur logika, mekanisme interaksi, dan tata cara kerja fitur-fitur utama pada aplikasi **NextVWT (Next Virtual Walkie Talkie)**.

---

## 🔐 1. Alur Login & Akses (Login Gate)

Saat aplikasi pertama kali dibuka, sistem akan mengecek status autentikasi pengguna (`user` state di Zustand). Jika belum masuk, aplikasi akan menampilkan gerbang masuk (**LoginGate**).

### A. Masuk dengan Google (Google OAuth)
1. **Proses Klik**: Ketika pengguna menekan tombol **"Masuk dengan Google"**, fungsi `signInWithGoogle()` pada `createAuthSlice.ts` dipicu.
2. **Autentikasi Supabase**: Aplikasi memanggil API OAuth Supabase:
   ```typescript
   supabase.auth.signInWithOAuth({
     provider: 'google',
     options: { redirectTo: `${window.location.origin}/` }
   });
   ```
3. **Pengalihan Gmail**: Pengguna dialihkan langsung ke halaman akses akun Gmail milik Google untuk otorisasi.
4. **Callback & Sinkronisasi**: Setelah sukses, Google mengarahkan kembali ke aplikasi. Listener `onAuthStateChange` menangkap sesi baru, menyimpan objek `user` ke store, mengambil nama dari metadata Google (`full_name`), dan menyetelnya sebagai username (`infoText`).

### B. Masuk sebagai Tamu (Guest Mode)
1. **Proses Klik**: Jika pengguna menekan tombol **"Masuk sebagai Tamu"**, fungsi callback `onGuestLogin` dipicu.
2. **Generasi Identitas**: Aplikasi secara otomatis membuat akun tamu lokal (tanpa password):
   - `userId` dibuat menggunakan RFC4122 v4 UUID generator (`guest-<UUID>`).
   - Email diset menjadi format unik: `guest-<UUID>@guest.nextvwt.local`.
   - Nama tampilan diset default ke `Tamu <4-Digit-Terakhir-UUID>` jika `infoText` kosong.
   - Provider diset ke `'guest'`.
3. **Bypass Redirect**: Pengguna langsung masuk ke halaman utama radio walkie-talkie tanpa pengalihan eksternal.

---

## 🔌 2. Logika Tombol Power (Power Switch)

Perilaku sasis radio dikendalikan oleh sakelar daya (`isPowerOn` state di Zustand).

### A. Saat Power Dinonaktifkan (OFF)
Ketika sakelar digeser ke posisi OFF (`isPowerOn === false`):
1. **Layar LCD Mati Total**: Seluruh konten internal di dalam `<LCDPanel />` diberi kelas `opacity-0` (membuatnya tidak terlihat) setelah transisi durasi `300ms`. Kontainer LCD berubah menjadi hitam redup.
2. **Signal Bar Kosong & Silang Merah**: Karena status offline dipaksakan, bar sinyal di-reset ke `0` (kosong, warna putih default latar). Tanda silang merah `×` muncul di sisi kiri bar sinyal jika terputus.
3. **Penutupan Layanan Aktif**:
   - Perekaman suara dihentikan secara paksa (`stopRecording()`).
   - Antrian audio pemutaran suara langsung dibersihkan (`flushAudioQueue()`).
   - Pemutar Karaoke (jika sedang terbuka) ditutup otomatis.
4. **Penguncian Kontrol Fisik**:
   - Tombol **PTT** dinonaktifkan (`pointer-events-none` pada pembungkus absolut).
   - Tombol arah **UP (▲) / DOWN (▼)** dan tombol **SCAN** dikunci (tidak bisa ditekan).
   - Klik daftar pengguna pada LCD tidak merespons.
   - Tombol **SET** tetap dapat diakses untuk mengubah pengaturan perangkat meskipun mati.

### B. Saat Power Diaktifkan (ON)
Ketika sakelar digeser ke posisi ON (`isPowerOn === true`):
1. **Inisialisasi Ulang LCD**: Konten LCD memudar kembali (`opacity-100`) dengan visual menyala (glow) sesuai tema aktif.
2. **Koneksi Ulang**: Aplikasi mengaktifkan kembali pemantauan kehadiran (Supabase Presence) dan menyambungkan kembali koneksi real-time ke saluran saat ini.
3. **Pembukaan Kunci Kontrol**: Seluruh kontrol fisik walkie-talkie (PTT, UP, DOWN, SCAN, Volume) dapat digunakan kembali secara normal.

---

## 📶 3. Logika Layar LCD & Status Koneksi

Layar LCD merupakan pusat informasi visual transceiver.

### A. Signal Strength Simulator & Latency Tooltip
- **Kondisi Online**: Bar sinyal berfluktuasi secara dinamis antara 1 hingga 4 bar setiap 5 detik menggunakan interval acak untuk menyimulasikan kekuatan jaringan asli:
  - **4 Bar**: Hijau mantap (Latensi rendah: 25ms - 40ms).
  - **3 Bar**: Hijau (Latensi sedang: 45ms - 70ms).
  - **2 Bar**: Kuning (Latensi tinggi: 75ms - 120ms).
  - **1 Bar**: Merah (Koneksi kritis: 125ms - 225ms).
- **Kondisi Offline**: Sinyal di-set ke `0` bar (putih kosong) dan ikon silang merah `×` muncul di sebelahnya.
- **Latency Tooltip**: Klik pada area bar sinyal akan menampilkan balon informasi latensi (misal: `Latency: 45ms` atau `Latency: Offline`) selama 3 detik.

### B. Indikator Status (Badge)
- **Badge OFFLINE**: Muncul di tengah atas LCD dengan warna merah mencolok (`#E53935`) saat koneksi terputus.
- **Badge BUSY**: Muncul dengan warna oranye (`#f97316`) apabila ada pengguna lain di saluran yang sama sedang mentransmisikan suara (`isReceiving === true`).

---

## 🎤 4. Mekanisme PTT (Push-To-Talk) & Parrot Echo (CH 100)

NextVWT mengimplementasikan transmisi suara real-time berbasis potongan audio (audio chunks) 20ms.

### A. Logika Transmisi Suara
- **Momentary (Tekan & Tahan)**: Menahan tombol PTT (atau Spacebar) akan mengaktifkan perekam suara (`startRecording()`) dan menyiarkan status `isTransmitting: true` ke seluruh anggota di channel via Supabase Broadcast. Melepas tombol menghentikan siaran.
- **Toggle (Klik Sekali)**: Klik sekali untuk mulai mengudara (tombol berubah merah) dan klik sekali lagi untuk melepas (kembali hijau).

### B. Parrot Echo Test (Khusus Saluran 100)
Channel 100 digunakan sebagai saluran uji coba modulasi lokal tanpa mengirim data ke internet:
1. **Penahanan PTT**: Saat pengguna menekan PTT di CH 100, potongan suara yang ditangkap microphone disimpan secara lokal ke dalam array memori buffer (`echoChunksRef.current`) alih-alih disiarkan ke server.
2. **Pelepasan PTT**: Setelah PTT dilepas, aplikasi menunggu jeda natural selama `350ms`.
3. **Playback Gema**: Aplikasi memutar kembali seluruh potongan suara yang direkam tadi secara berurutan (`playAudioChunk`), memungkinkan pengguna mendengarkan gema kualitas suaranya sendiri untuk tes modulasi.

---

## ⚙️ 5. Panel Pengaturan (Settings Panel - SET)

Pengguna dapat menekan tombol **SET** untuk membuka panel setelan penuh.

### A. Sinkronisasi Profil & Foto
- **Username & Lokasi**: Kolom teks yang terhubung langsung ke Zustand dan diperbarui secara real-time pada kehadiran Supabase (Supabase Presence) di channel.
- ** segmented Photo Source Control**:
  - **Foto Google**: Menampilkan avatar asli dari Google OAuth. Hanya aktif jika login via Google.
  - **Unggah Galeri**: Membuka dialog file pemilih gambar lokal, mengompres ukuran menjadi 120x140px (JPEG, kualitas 75%) dalam format Base64, dan menyimpannya sebagai foto profil kustom.

### B. Mode Audio & Efek Echo
- **Mode Diskusi**: Audio diatur untuk suara vokal jernih standar.
- **Mode Musik & Karaoke**: Audio dioptimalkan untuk transmisi fidelitas tinggi (Hi-Fi) dan membuka akses ke:
  - **Built-in Echo (Software)**: Efek gema suara lokal terintegrasi.
  - **Echo Level**: Slider intensitas persentase gema (0% - 100%).
  - **Pemutar Karaoke**: Membuka panel pemutar musik terapung untuk bernyanyi bersama rekan.

### C. Ganti Tema Perangkat
Pengguna dapat memilih salah satu dari 8 tema casing radio (Classic, Glass Crystal V1-V5, Live Aquarium V6, dan Monokrom). Tema ini mengubah seluruh warna variabel CSS (`--device-bg`, `--lcd-bg`, dsb) di root dokumen secara instan.

---

## 💾 6. Robustness & Persistence (Offline Recovery)

- **Penyimpanan Lokal**: Seluruh nilai pengaturan penting (username, lokasi, tema, volume, dll.) disimpan secara otomatis ke `localStorage` di bawah kunci `nextvwt_settings`.
- **Pemulihan Otomatis**: Saat aplikasi di-refresh, fungsi `initializeSession()` membaca cache lokal dan memulihkan seluruh konfigurasi ke keadaan semula sebelum reload, termasuk status onboarding (`hasCompletedOnboarding`).
