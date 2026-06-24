# NextVWT — Privacy Policy & Terms of Service (Draft)
## Template Hukum untuk Play Store, OAuth Google & Payment Gateway

| | |
|---|---|
| **Versi** | 1.0 (DRAFT) |
| **Tanggal** | 9 Juni 2026 |
| **Status** | ⚠️ DRAFT — wajib direview pengacara sebelum publikasi |
| **Bahasa** | Indonesia (utama) |

**Petunjuk penggunaan:**
1. Ganti semua placeholder `[...]` dengan data Anda
2. Publish ke URL publik (mis. `https://nextvwt.id/privacy` dan `/terms`)
3. Masukkan URL ke Google Play Console & OAuth consent screen
4. Konsultasikan lawyer sebelum monetisasi (Tahap F3)

---

# BAGIAN A — KEBIJAKAN PRIVASI (PRIVACY POLICY)

**Terakhir diperbarui:** [TANGGAL PUBLIKASI]

## 1. Pendahuluan

Selamat datang di **NextVWT** ("Aplikasi", "kami"). Aplikasi ini dikembangkan oleh **[NAMA BADAN USAHA / NAMA PERORANGAN]** ("Pengembang"), beralamat di **[ALAMAT]**.

Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan aplikasi NextVWT — platform komunikasi Push-to-Talk (PTT) berbasis internet.

Dengan menggunakan Aplikasi, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini. Jika tidak setuju, harap tidak menggunakan Aplikasi.

**Kontak privasi:** [EMAIL PRIVASI, mis. privacy@nextvwt.id]

---

## 2. Data yang Kami Kumpulkan

### 2.1 Data yang Anda Berikan Langsung

| Data | Tujuan |
|------|--------|
| Nama tampilan / callsign | Identitas di channel PTT |
| Akun Google (jika login Google) | Autentikasi — email, nama, foto profil dari Google |
| Laporan pelanggaran (teks) | Moderasi komunitas |

### 2.2 Data yang Dikumpulkan Otomatis

| Data | Tujuan |
|------|--------|
| ID pengguna unik (UUID) | Identifikasi akun, moderasi, ban |
| ID perangkat | Keamanan, pencegahan penyalahgunaan |
| Alamat IP | Keamanan, moderasi, audit log |
| Status channel & presence | Menampilkan siapa yang online di channel |
| Log aktivitas moderasi | Audit trail (mute, kick, ban) |
| Data kinerja app (crash log) | Perbaikan bug |

### 2.3 Data Audio

| Jenis | Penyimpanan | Durasi |
|-------|-------------|--------|
| **Audio PTT real-time** | Ditransmisikan langsung antar pengguna via WebRTC | **Tidak disimpan permanen** di server kami |
| **Buffer laporan pelanggaran** | Disimpan lokal di perangkat Anda, diunggah hanya jika Anda menekan "Laporkan" | Maksimal **15 detik** sebelum laporan; dihapus setelah diproses |
| **Rekaman tidak dibuat** untuk channel publik | — | — |

> Kami **tidak** merekam atau menyimpan percakapan PTT Anda secara rutin. Audio hanya diproses secara real-time untuk komunikasi.

### 2.4 Data yang TIDAK Kami Kumpulkan

- Kontak telepon (kecuali Anda memberikan izin eksplisit di masa depan)
- Lokasi GPS presisi (kecuali fitur darurat diaktifkan dengan izin Anda)
- Isi pesan di luar fitur yang tersedia di Aplikasi

---

## 3. Izin Perangkat

Aplikasi NextVWT memerlukan izin berikut:

| Izin Android | Alasan |
|--------------|--------|
| **Mikrofon** | Fitur inti Push-to-Talk — mengirim suara saat tombol PTT ditekan |
| **Internet** | Koneksi ke server signaling dan relay audio |
| **Foreground Service (Mikrofon)** | Menjaga koneksi PTT aktif saat layar terkunci agar Anda tetap menerima transmisi |
| **Notifikasi** | Memberitahu status channel, panggilan masuk, dan aktivitas penting |
| **Bluetooth** (opsional) | Dukungan headset/PTT button eksternal |

Anda dapat menolak izin, namun fitur terkait tidak akan berfungsi.

---

## 4. Bagaimana Kami Menggunakan Data

Kami menggunakan data Anda untuk:

1. Menyediakan layanan komunikasi PTT real-time
2. Mengelola keanggotaan channel dan sistem moderasi
3. Mencegah penyalahgunaan, spam, dan pelanggaran kebijakan komunitas
4. Memproses laporan pelanggaran (termasuk cuplikan audio jika Anda melaporkan)
5. Memproses transaksi koin utilitas (jika fitur pembayaran aktif)
6. Meningkatkan kinerja dan keamanan Aplikasi
7. Mematuhi kewajiban hukum

Kami **tidak** menjual data pribadi Anda kepada pihak ketiga.

---

## 5. Pihak Ketiga & Penyedia Layanan

Kami menggunakan layanan pihak ketiga berikut:

| Penyedia | Fungsi | Kebijakan Privasi |
|----------|--------|-------------------|
| **Supabase** (Singapura/AS) | Database, autentikasi, realtime signaling | https://supabase.com/privacy |
| **Google** | Login OAuth, Firebase Cloud Messaging | https://policies.google.com/privacy |
| **Metered.ca / Twilio** | Relay audio WebRTC (TURN server) | Sesuai penyedia |
| **[Payment Gateway, mis. Midtrans]** | Pemrosesan pembayaran QRIS *(jika aktif)* | Sesuai penyedia |

Data Anda mungkin diproses di server di luar Indonesia. Kami memastikan penyedia memiliki standar keamanan yang memadai.

---

## 6. Koin Utilitas & Pembayaran

*(Bagian ini aktif jika fitur topup koin diimplementasikan)*

- **Koin** adalah mata uang utilitas dalam aplikasi, bukan e-money atau alat pembayaran yang diatur Bank Indonesia
- Koin hanya dapat digunakan di dalam Aplikasi NextVWT
- Koin tidak dapat ditarik ke rekening bank atau ditransfer ke pengguna lain sebagai uang tunai
- Transaksi pembayaran diproses oleh payment gateway berlisensi; kami tidak menyimpan data kartu kredit/debit Anda

---

## 7. Penyimpanan & Keamanan Data

- Data disimpan di server cloud dengan enkripsi in-transit (TLS/HTTPS)
- Audio PTT real-time dienkripsi via WebRTC (DTLS-SRTP)
- Kredensial dan secret key disimpan aman di server, tidak di dalam aplikasi
- Kami menerapkan kontrol akses dan audit log untuk tindakan moderasi
- Tidak ada sistem yang 100% aman — gunakan Aplikasi dengan bijak

**Retensi data:**

| Data | Retensi |
|------|---------|
| Akun aktif | Selama akun aktif |
| Log moderasi | [12 bulan / sesuai kebutuhan hukum] |
| Buffer audio laporan | Dihapus setelah laporan diproses (maks. 30 hari) |
| Akun dihapus | Data dihapus dalam 30 hari setelah permintaan |

---

## 8. Hak Anda (PDP Indonesia & Praktik Umum)

Anda berhak untuk:

1. **Akses** — meminta salinan data pribadi Anda
2. **Koreksi** — memperbaiki data yang tidak akurat
3. **Penghapusan** — meminta penghapusan akun dan data
4. **Penarikan persetujuan** — mencabut izin (dapat membatasi fungsi app)
5. **Pengaduan** — mengajukan keluhan ke [EMAIL] atau otoritas terkait

Untuk menggunakan hak ini, hubungi: **[EMAIL PRIVASI]**

---

## 9. Anak di Bawah Umur

Aplikasi ini ditujukan untuk pengguna berusia **13 tahun ke atas** (atau 17+ jika diwajibkan regulasi setempat). Kami tidak dengan sengaja mengumpulkan data dari anak di bawah batas usia tersebut. Jika Anda mengetahui anak di bawah umur menggunakan Aplikasi, hubungi kami.

---

## 10. Perubahan Kebijakan

Kami dapat memperbarui Kebijakan Privasi ini. Perubahan material akan diberitahukan melalui Aplikasi atau email. Tanggal "Terakhir diperbarui" di bagian atas akan diperbarui.

---

## 11. Kontak

**[NAMA BADAN USAHA / NAMA PENGEMBANG]**  
Alamat: [ALAMAT LENGKAP]  
Email: [EMAIL KONTAK]  
Email privasi: [EMAIL PRIVASI]

---

---

# BAGIAN B — SYARAT & KETENTUAN (TERMS OF SERVICE)

**Terakhir diperbarui:** [TANGGAL PUBLIKASI]

## 1. Penerimaan Syarat

Dengan mengunduh, menginstal, atau menggunakan NextVWT ("Aplikasi"), Anda ("Pengguna") setuju terikat oleh Syarat & Ketentuan ini. Jika tidak setuju, jangan gunakan Aplikasi.

Pengembang: **[NAMA BADAN USAHA]** · [ALAMAT]

---

## 2. Deskripsi Layanan

NextVWT adalah aplikasi komunikasi Push-to-Talk berbasis internet yang memungkinkan pengguna bergabung ke channel bernomor dan berkomunikasi secara real-time. Fitur dapat mencakup moderasi channel, mode karaoke, koin utilitas, dan fitur lain yang diperbarui dari waktu ke waktu.

---

## 3. Akun & Pendaftaran

3.1. Anda dapat menggunakan Aplikasi sebagai Tamu (Guest) atau dengan akun Google.  
3.2. Anda bertanggung jawab menjaga keamanan akun Anda.  
3.3. Satu pengguna tidak boleh membuat banyak akun untuk menghindari moderasi (ban evasion).  
3.4. Kami berhak menangguhkan atau menghapus akun yang melanggar syarat ini.

---

## 4. Aturan Penggunaan

Anda **dilarang** menggunakan Aplikasi untuk:

- Ujaran kebencian, pelecehan, ancaman kekerasan, atau konten ilegal
- Spam suara, jamming channel, atau gangguan komunikasi sengaja
- Menyamar sebagai orang lain atau instansi resmi
- Mencoba bypass moderasi, ban, atau sistem keamanan
- Menyebarkan malware atau melakukan serangan ke infrastruktur
- Komersialisasi tanpa izin tertulis dari Pengembang
- Aktivitas yang melanggar hukum Republik Indonesia

---

## 5. Channel & Moderasi

5.1. Channel dapat bersifat publik atau terkelola oleh Admin/Operator.  
5.2. Pemilik dan moderator channel berwenang melakukan mute, kick, dan ban sesuai kebijakan komunitas.  
5.3. Tim NextVWT (NOC/Sys Admin) berwenang atas seluruh channel untuk penegakan kebijakan global.  
5.4. Keputusan moderasi bersifat final, kecuali ada banding yang ditinjau oleh tim kami.  
5.5. Lihat **[Kebijakan Komunitas](#bagian-c--kebijakan-komunitas-ringkas)** di bawah.

---

## 6. Koin Utilitas & Pembayaran

*(Aktif jika fitur monetisasi diimplementasikan)*

6.1. Koin adalah mata uang virtual dalam aplikasi, bukan deposit atau e-money.  
6.2. Koin tidak dapat ditukar dengan uang tunai.  
6.3. Pembelian koin bersifat final kecuali diwajibkan oleh hukum.  
6.4. Harga dan paket koin dapat berubah dengan pemberitahuan.  
6.5. Pengembang tidak bertanggung jawab atas kesalahan transfer yang disebabkan kesalahan pengguna.

---

## 7. Hak Kekayaan Intelektual

7.1. Aplikasi, logo, desain, dan kode adalah milik Pengembang.  
7.2. Anda tidak boleh menyalin, memodifikasi, atau mendistribusikan Aplikasi tanpa izin.  
7.3. Konten yang Anda siarkan (suara) tetap milik Anda, namun Anda memberi kami lisensi terbatas untuk memprosesnya demi penyediaan layanan.

---

## 8. Penafian & Batasan Tanggung Jawab

8.1. Aplikasi disediakan **"sebagaimana adanya"** tanpa jaminan uptime 100%.  
8.2. NextVWT **bukan** pengganti komunikasi darurat resmi (112, 119, radio SAR berlisensi).  
8.3. Kami tidak bertanggung jawab atas kegagalan komunikasi akibat jaringan operator, perangkat, atau force majeure.  
8.4. Tanggung jawab maksimal kami terbatas pada jumlah yang Anda bayarkan dalam 12 bulan terakhir (jika ada).

---

## 9. Penghentian Layanan

Kami dapat menghentikan atau membatasi akses Anda kapan saja jika melanggar syarat ini, dengan atau tanpa pemberitahuan. Anda dapat berhenti menggunakan Aplikasi dengan menghapusnya dari perangkat.

---

## 10. Hukum yang Berlaku

Syarat ini diatur oleh hukum **Republik Indonesia**. Sengketa diselesaikan melalui musyawarah terlebih dahulu, kemudian melalui pengadilan di **[KOTA DOMISILI, mis. Jakarta]**.

---

## 11. Perubahan Syarat

Kami dapat memperbarui Syarat ini. Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan.

---

## 12. Kontak

Email: [EMAIL KONTAK]  
Alamat: [ALAMAT]

---

---

# BAGIAN C — KEBIJAKAN KOMUNITAS (RINGKAS)

*Dapat dipublish terpisah di `/community` atau digabung di `/terms`*

## Prinsip Utama

NextVWT adalah ruang komunikasi suara. Bersikaplah seperti Anda menggunakan radio di ruang publik — sopan, relevan, dan menghormati orang lain.

## Yang Dilakukan

- Tekan PTT hanya saat ingin berbicara; lepas saat selesai
- Patuhi instruksi moderator channel
- Laporkan pelanggaran melalui fitur laporan (bukan main hakim sendiri)
- Hormati antrian bicara (floor control) jika channel sibuk

## Yang Tidak Boleh

- Menyiarkan musik/bising terus-menerus (audio jamming)
- Ujaran SARA, bullying, atau konten seksual
- Spam PTT (menekan tombol berulang tanpa bicara bermakna)
- Mencoba mendapatkan hak admin dengan manipulasi nama atau bug
- Menjual/mempromosikan produk tanpa izin moderator

## Konsekuensi

| Pelanggaran | Tindakan |
|-------------|----------|
| Ringan (pertama kali) | Peringatan / mute sementara |
| Sedang (berulang) | Kick dari channel |
| Berat (SARA, ancaman, ilegal) | Ban permanen + laporan jika diperlukan |
| Lintas channel | Penurunan trust score, pembatasan akses global |

## Laporan Pelanggaran

Jika Anda mendengar pelanggaran, gunakan tombol **Laporkan** dalam 15 detik setelah kejadian. Cuplikan audio akan dikirim ke tim moderasi untuk ditinjau.

---

## Checklist Publikasi Owner

```
□ Ganti semua placeholder [NAMA], [EMAIL], [ALAMAT], [DOMAIN]
□ Review oleh pengacara / konsultan hukum (disarankan sebelum payment)
□ Publish ke URL publik:
   - https://[DOMAIN]/privacy
   - https://[DOMAIN]/terms
   - https://[DOMAIN]/community (opsional)
□ Masukkan URL privacy ke Google Play Console
□ Masukkan URL privacy ke Google OAuth consent screen
□ Masukkan URL ke form KYC payment gateway (saat F3)
□ Simpan tanggal publikasi di header dokumen
```

---

*NextVWT Privacy Policy & ToS Draft v1.0 · 9 Juni 2026*  
*⚠️ Ini adalah template, bukan nasihat hukum. Konsultasikan profesional hukum sebelum publikasi.*
