# Panduan Rilis Android & Konfigurasi CI/CD NextVWT

Dokumen ini menjelaskan langkah-langkah untuk menyiapkan kunci penandatanganan Android (keystore), mengunggah rahasia penandatanganan ke GitHub Secrets, dan mengoperasikan pipa CI/CD otomatis untuk mempublikasikan biner aplikasi NextVWT PTT.

---

## 1. Membuat Android Release Keystore Baru

Untuk merilis aplikasi di Google Play Store, Anda memerlukan berkas keystore untuk menandatangani biner (.aab / .apk). Jika Anda belum memilikinya, Anda dapat membuatnya dengan utilitas Java `keytool` melalui terminal:

```bash
keytool -genkey -v -keystore nextvwt-release-key.keystore -alias nextvwt-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Catatan Keamanan Penting:**
- Amankan file `nextvwt-release-key.keystore` ini di tempat yang aman dan jangan sampai hilang! Kehilangan berkas ini membuat Anda tidak dapat memperbarui aplikasi Anda di Google Play Store di masa depan.
- **JANGAN PERNAH** meng-commit berkas `.keystore` atau `.jks` ke repositori Git publik.

---

## 2. Mengonversi Keystore ke Format Base64

GitHub Actions tidak dapat mengakses file lokal dari komputer Anda secara langsung. Oleh karena itu, kita harus menyandikan (encode) berkas keystore biner tersebut menjadi format string teks Base64 untuk disimpan di repositori secara aman.

### Cara Konversi di Windows (PowerShell):
Jalankan perintah berikut di PowerShell untuk menyalin teks Base64 keystore langsung ke clipboard Anda:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("nextvwt-release-key.keystore")) | clip
```

### Cara Konversi di macOS / Linux:
Jalankan perintah berikut di Terminal untuk menyalin teks Base64 keystore ke clipboard Anda:
```bash
base64 -i nextvwt-release-key.keystore | pbcopy
```
*(Atau jika perintah di atas tidak menyalin apa pun, simpan ke file teks:* `base64 nextvwt-release-key.keystore > keystore_base64.txt`*)*

---

## 3. Mendaftarkan Variabel Rahasia di GitHub Secrets

Setelah menyalin teks Base64, daftarkan rahasia tersebut ke repositori GitHub Anda:
1. Buka halaman repositori GitHub aplikasi Anda.
2. Klik tab **Settings** di bagian atas kanan.
3. Di panel sebelah kiri, pilih **Secrets and variables** -> **Actions**.
4. Klik tombol hijau **New repository secret**.
5. Tambahkan 4 rahasia berikut:

| Nama Secret | Deskripsi / Nilai |
| :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Teks string Base64 dari file keystore yang telah Anda salin sebelumnya. |
| `ANDROID_KEYSTORE_PASSWORD` | Kata sandi (password) dari keystore Anda. |
| `ANDROID_KEY_ALIAS` | Nama alias yang Anda buat (misalnya: `nextvwt-key-alias`). |
| `ANDROID_KEY_PASSWORD` | Kata sandi untuk alias kunci tersebut. |

---

## 4. Memantau Pipeline & Mengunduh Biner

Setiap kali Anda melakukan `git push` ke cabang utama (`main` atau `master`), pipeline CI/CD di GitHub Actions akan berjalan otomatis:
1. Masuk ke halaman repositori di GitHub.
2. Buka tab **Actions**.
3. Pilih workflow run yang sedang berjalan untuk melihat proses build real-time.
4. Setelah build berhasil diselesaikan:
   - Di bagian bawah halaman ringkasan run tersebut, Anda akan menemukan bagian **Artifacts**.
   - Unduh file `app-release-bundle` (berisi file `.aab` rilis untuk Google Play) dan `app-release-apk` (berisi file `.apk` rilis untuk instalasi langsung).

---

## 5. Rencana Pemulihan & Rollback (Rollback Plan)

### A. Jika Pipeline CI/CD Gagal saat Build
Apabila proses build gagal pada langkah pengujian, linting, atau kegagalan Gradle:
1. **Analisis Log:** Buka tab **Actions** di GitHub, klik langkah yang berwarna merah untuk melihat error detail.
2. **Koreksi Lokal:** Lakukan perbaikan bug secara lokal, jalankan perintah pemeliharaan lokal (`npm run lint`, `npm test`) untuk memastikan kode sudah bersih.
3. **Commit Atomik Baru:** Buat commit perbaikan atomik dengan Conventional Commit:
   ```bash
   git commit -am "fix: resolve linter syntax errors in dynamic config"
   git push origin main
   ```

### B. Jika Rilis Biner di Produksi Bermasalah (Rollback Versi Google Play)
Google Play Store tidak mengizinkan pengunggahan biner dengan `versionCode` yang sama atau lebih rendah. Jika biner rilis Anda memiliki bug kritis di tingkat pengguna:
1. **Perbaikan Kode:** Selesaikan bug kritis tersebut di repositori lokal.
2. **Naikkan Versi Aplikasi:** Buka file [build.gradle](file:///c:/Users/ASUS/Downloads/NextVWT%20PTT%20App%20Prototype%20-%20Clone/android/app/build.gradle) dan ubah nilai `versionCode` serta `versionName` di dalam blok `defaultConfig`:
   ```groovy
   versionCode 2         // Naikkan dari 1 menjadi 2
   versionName "1.0.1"   // Naikkan dari 1.0 menjadi 1.0.1
   ```
3. **Push & Build Ulang:** Commit perubahan versi tersebut dengan Conventional Commit:
   ```bash
   git commit -am "chore: bump version to 1.0.1 for release hotfix"
   git push origin main
   ```
4. **Deploy Hotfix:** Unduh biner baru `.aab` dari tab Artifacts GitHub Actions dan unggah ke jalur rilis Google Play Console untuk menimpa versi bermasalah.
