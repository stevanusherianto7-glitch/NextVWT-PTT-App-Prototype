# Dokumen Cara Kerja Logika Fitur Moderasi PTT

Dokumen ini menjelaskan alur logika dan implementasi teknis untuk 3 jenis sanksi moderasi utama pada aplikasi NextVWT PTT: **Silent (Muted)**, **Wait**, dan **Controlled**.

---

## 1. Status: Silent (Muted)

Status ini ditujukan untuk memblokir total akses interaksi (baik bicara maupun mendengar) seorang pengguna dalam sebuah *channel*.

- **Logika UI PTT Button**:
  Aplikasi mendeteksi `status === 'muted'`. Saat terdeteksi, *prop* `isMuted` diteruskan ke komponen `<PTTButton>`. Warna tombol dipaksa berubah menjadi gradasi abu-abu (`#a3a3a3` hingga `#737373`), meniru visual saat radio sedang dalam posisi *Power Off*.
- **Logika Audio (Tuli)**:
  Aplikasi menolak merender audio masuk dari pengguna lain. Pada `RadioLayout.tsx`, logika `setOnVoiceChunkReceived` ditambahkan filter kondisi:
  `if (isPowerOn && channel !== 100 && status !== 'muted') { playAudioChunk(base64); }`
  Jika `status` adalah `muted`, eksekusi memutar audio dilewati secara otomatis (sehingga pengguna tersebut tidak mendengar apa pun).
- **Logika Transmisi (Bungkam)**:
  Fungsi penekanan tombol ditolak (dicegat oleh *variable* `pttAllowed` yang akan bernilai `false` karena mengecualikan status `muted`). Jika tombol tetap ditekan paksa, pesan *toast error* akan muncul.

---

## 2. Status: Wait (Cooldown)

Status ini berfungsi sebagai penundaan paksa (*cooldown*) selama waktu tertentu (30 detik) sebelum pengguna diizinkan untuk berbicara lagi.

- **Logika Timer & State**:
  Ketika *Role Listener* menangkap perubahan `status === 'wait'`, komponen `<RadioLayout>` akan menginisialisasi *state* `waitTimer` bernilai `30`.
  Sebuah efek interval (`setInterval`) memotong nilai timer ini sebesar `-1` setiap detiknya.
- **Logika UI PTT Button**:
  Nilai `waitTimer` ini diteruskan sebagai *prop* `waitCountdown`. Jika `waitCountdown` bernilai angka, tombol PTT berubah menjadi gradasi warna oranye (menandakan tombol sedang sibuk / tidak siap). Tulisan "PTT" di tengah tombol ditimpa dengan angka sisa *countdown*.
- **Logika Transmisi**:
  Serupa dengan *Silent*, `pttAllowed` bernilai `false` jika `status === 'wait'`.
- **Logika Pemulihan Otomatis (Auto-Release)**:
  Saat `waitTimer` mencapai angka `0`, sistem akan mengeksekusi dua baris perintah:
  1. `localStorage.setItem('channel-status:...', 'active')`
  2. Memicu *event* `channel-role-changed`.
  Hal ini mengembalikan status pengguna menjadi normal (`active`) secara independen dari *backend*, memulihkan tombol hijau cerah, dan membuka akses berbicara kembali.

---

## 3. Status: Controlled (Monitor-Only)

Status ini digunakan saat lingkungan sedang diatur ketat (seperti presentasi atau *briefing* komando). Pengguna dilarang memotong atau ikut bicara, tetapi **diwajibkan mendengarkan** arahan dari atasan.

- **Logika UI PTT Button**:
  Tidak ada *flag* UI khusus yang dilemparkan. Karena `isMuted` adalah `false` dan `waitCountdown` adalah `null`, `<PTTButton>` dirender dengan tampilan hijau standar. Hal ini menjaga estetika layar agar tidak terlihat seperti sedang dihukum berat.
- **Logika Audio (Mendengar Aktif)**:
  Logika blokir suara tidak berlaku pada status ini. Fungsi `playAudioChunk()` tetap memutar *buffer audio* yang masuk dari transmisi pengguna lain secara *real-time*.
- **Logika Transmisi (Diintersep/Ditolak)**:
  Tembok penghalang diletakkan pada logika *onclick* tombol. Karena `pttAllowed` mengecualikan status `controlled`, setiap penekanan PTT yang diinisiasi pengguna akan ditolak sesaat sebelum *AudioRecording* dimulai, memunculkan *toast notification* yang menginformasikan bahwa PTT mereka sedang diblokir karena status yang diawasi.
