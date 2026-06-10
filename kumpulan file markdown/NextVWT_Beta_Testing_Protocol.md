# NextVWT Beta Testing Protocol
## Protokol Uji Tertutup (Closed Beta) — Panduan Owner & Tester

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 9 Juni 2026 |
| **Tipe beta** | Closed Beta (10–30 tester) |
| **Durasi** | 2–4 minggu per putaran |
| **Prasyarat** | [Blok A Keamanan](./NextVWT_Blok_A_Keamanan_Runbook.md) selesai |

**Dokumen terkait:**
- [NextVWT_Owner_Playbook_Persiapan_Lengkap.md](./NextVWT_Owner_Playbook_Persiapan_Lengkap.md) §3.3
- [NextVWT_Privacy_Policy_dan_ToS_Draft.md](./NextVWT_Privacy_Policy_dan_ToS_Draft.md)
- [NextVWT_PRD_v3.md](./NextVWT_PRD_v3.md) §8 KPI

---

## 1. Tujuan Beta

| Tujuan | Metrik keberhasilan |
|--------|---------------------|
| Verifikasi PTT real-time stabil | Latensi subjektif < 1 detik di 4G |
| Verifikasi moderasi berfungsi | Mute/ban efektif 100% skenario uji |
| Verifikasi background survival | App terima TX setelah layar kunci 30+ menit |
| Identifikasi bug kritis | 0 crash blocker saat akhir beta |
| Umpan balik UX | Skor kepuasan tester ≥ 3.5/5 |

---

## 2. Prasyarat Sebelum Memulai Beta

### 2.1 Checklist Owner (wajib)

```
□ Blok A keamanan selesai (lihat Runbook)
□ Privacy Policy sudah online (minimal draft)
□ Channel uji disiapkan: Channel [100] "NextVWT Beta"
□ Akun NOC/Admin owner sudah di-seed
□ TURN server dikonfigurasi (Metered.ca)
□ APK beta di-build & diuji internal oleh developer dulu
□ Google Form feedback + Google Sheet bug tracker siap
□ Grup WA/Telegram beta tester dibuat
```

### 2.2 Spesifikasi Build Beta

| Item | Nilai |
|------|-------|
| Package name | `com.nextvwt.ptt` |
| Versi | `0.1.0-beta.1` (increment per putaran) |
| Distribusi | Play Console Internal Testing **atau** APK sideload |
| Channel uji resmi | **100** (default) |
| Channel uji alternatif | 101, 102 (untuk skenario multi-channel) |

---

## 3. Kriteria Tester

### 3.1 Profil Ideal (rekrut 10–30 orang)

| Kriteria | Target |
|----------|--------|
| Jumlah total | 10–30 tester |
| Merek HP | Minimal 3 merek berbeda: **Xiaomi, Samsung, Oppo/Vivo** |
| Operator | Minimal 2: Telkomsel + (XL atau Indihome/WiFi) |
| Kota | Minimal 2 kota berbeda |
| Persona | 2 komunitas, 2 ojol/driver, 2 umum |
| Usia | 18+ |
| Bersedia | Install APK, uji 2x/minggu, isi form feedback |

### 3.2 Kriteria Penolakan

- Tidak punya Android 8+
- Tidak bersedia install dari sumber luar Play Store (jika sideload)
- Konflik kepentingan dengan kompetitor langsung

### 3.3 Google Form Pendaftaran (template pertanyaan)

```
1. Nama lengkap
2. Nomor WhatsApp aktif
3. Merek & model HP (contoh: Xiaomi Redmi Note 12)
4. Versi Android (Settings → About Phone)
5. Operator utama (Telkomsel / XL / Indihome / lainnya)
6. Kota domisili
7. Profesi / komunitas (ojol / motor / satpam / umum)
8. Pernah pakai app PTT/walkie-talkie digital? (Ya/Tidak, sebutkan)
9. Bersedia uji minimal 2x seminggu selama 3 minggu? (Ya/Tidak)
10. Email Google (jika pakai login Google)
```

---

## 4. Onboarding Tester

### 4.1 Pesan Sambutan (kirim via WA grup)

```
📻 Selamat datang di NextVWT Closed Beta!

Anda terpilih sebagai beta tester. Terima kasih sudah membantu 
menyempurnakan aplikasi walkie-talkie digital ini.

⚠️ PERHATIAN:
• Ini adalah BETA — mungkin ada bug, crash, atau audio putus
• Jangan gunakan untuk komunikasi darurat nyawa
• Jangan bagikan APK ke orang luar grup ini
• Data beta mungkin direset tanpa pemberitahuan

📋 LANGKAH INSTAL:
1. [Link Play Console Internal Testing ATAU lampiran APK]
2. Buka app → login Guest atau Google
3. Masuk Channel 100 "NextVWT Beta"
4. Baca skenario uji di pin grup
5. Laporkan bug via Google Form: [LINK FORM]

Channel uji: 100
Admin beta: @[NAMA OWNER]

Selamat mencoba! 🎙️
```

### 4.2 Instruksi Instal

**Opsi A — Play Console Internal Testing (disarankan):**
```
1. Owner kirim link internal testing dari Play Console
2. Tester buka link di HP Android
3. Accept invitation → Install dari Play Store
```

**Opsi B — APK Sideload:**
```
1. Download APK dari link yang owner bagikan
2. Settings → Security → Allow install from unknown sources
3. Install APK
4. Buka NextVWT
```

---

## 5. Skenario Uji Wajib

Setiap tester wajib menjalankan **semua skenario** dan melaporkan hasilnya.

### Skenario 1 — PTT Dasar (2 orang, WiFi)

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Tester A & B masuk Channel 100 | Keduanya terlihat di user list |
| 2 | Tester A tekan & tahan PTT, bicara "tes satu dua" | — |
| 3 | Tester B dengarkan | Audio jelas, latensi < 1 detik |
| 4 | Tester B jawab dengan PTT | A mendengar dengan jelas |
| 5 | Catat | Merek HP, operator, latensi (1-5), masalah? |

**Lulus:** ✅ Audio bolak-balik jelas · **Gagal:** ❌ Tidak ada suara / echo parah / delay > 2 detik

---

### Skenario 2 — PTT di 4G (layar menyala)

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Matikan WiFi, gunakan data seluler 4G | — |
| 2 | Ulangi Skenario 1 | Audio tetap jalan |
| 3 | Catat operator & sinyal | — |

**Lulus:** ✅ PTT jalan di 4G · **Gagal:** ❌ Tidak connect / audio putus-putus

---

### Skenario 3 — Background Survival (kritis)

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Tester A buka app, masuk Channel 100 | — |
| 2 | Tester A kunci layar HP, tunggu **30 menit** | App tetap di background |
| 3 | Tester B kirim PTT ke Channel 100 | — |
| 4 | Tester A buka layar | A mendengar/menerima transmisi B |
| 5 | Ulangi dengan layar kunci **2 jam** (opsional, tester dedicated) | App masih terima TX |

**Lulus:** ✅ Terima TX setelah 30 min layar kunci · **Gagal:** ❌ App mati / tidak terima apa pun

> Catat merek HP — Xiaomi/Oppo sering agresif kill background.

---

### Skenario 4 — Multi-User (3–5 orang, channel sibuk)

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | 3–5 tester masuk Channel 100 bersamaan | Semua terlihat |
| 2 | Dua tester tekan PTT bersamaan | Salah satu dapat "BUSY" / antrean |
| 3 | Bergantian bicara 5 menit | Tidak crash, tidak audio tumpang tindih parah |
| 4 | 1 tester keluar channel | Presence update |

**Lulus:** ✅ Tidak crash, busy indicator jalan · **Gagal:** ❌ Crash / dua suara bersamaan tanpa kontrol

---

### Skenario 5 — Moderasi Admin

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Owner (NOC) mute Tester A dari panel moderasi | — |
| 2 | Tester A coba PTT | Tidak bisa transmit / dihentikan |
| 3 | Owner unmute Tester A | A bisa PTT lagi |
| 4 | Owner kick Tester B | B keluar dari channel |
| 5 | Tester B coba masuk lagi | Sesuai setting (boleh/tidak jika di-ban) |

**Lulus:** ✅ Semua aksi moderasi efektif · **Gagal:** ❌ Mute tidak bekerja / guest bisa ban admin

---

### Skenario 6 — Channel Switch & Stabilitas

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Pindah channel 100 → 101 → 102 → kembali 100 | Tidak crash |
| 2 | Lakukan 10x pergantian channel cepat | App stabil |
| 3 | PTT setelah switch channel | Audio jalan |

**Lulus:** ✅ Tidak crash · **Gagal:** ❌ Freeze / white screen

---

### Skenario 7 — Karaoke Mode (opsional)

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Aktifkan mode Music/Karaoke di Settings | — |
| 2 | PTT sambil mode aktif | Audio stereo / efek aktif |
| 3 | Floating player muncul (jika ada) | Tidak ganggu PTT |

**Lulus:** ✅ Mode aktif tanpa crash PTT · **Gagal:** ❌ Audio mati total

---

## 6. Form Laporan Bug (Google Form — template field)

```
=== INFORMASI TESTER ===
Nama:
Merek & model HP:
Versi Android:
Operator:
Versi app (lihat Settings/About):
Tanggal & jam kejadian:

=== SKENARIO ===
Skenario nomor (1-7):
Channel yang digunakan:

=== DESKRIPSI BUG ===
Apa yang Anda lakukan? (langkah-langkah)
Apa yang diharapkan?
Apa yang terjadi sebenarnya?
Seberapa sering (selalu / kadang / sekali)?

=== TINGKAT KEGAWATAN ===
□ Blocker — app tidak bisa dipakai sama sekali
□ Major — fitur utama gagal tapi app masih jalan
□ Minor — masalah kecil / kosmetik
□ Saran — bukan bug, tapi saran perbaikan

=== LAMPIRAN ===
Screenshot / screen recording (opsional):
Link:
```

---

## 7. Kriteria Lulus / Tidak Lulus Beta

### 7.1 Kriteria Lulus (siap ke Open Beta / Play Store terbatas)

| Metrik | Target |
|--------|--------|
| Skenario 1 (PTT dasar) lulus | ≥ 90% tester |
| Skenario 2 (4G) lulus | ≥ 80% tester |
| Skenario 3 (background 30 min) lulus | ≥ 70% tester (target PRD: 98.5% di produksi) |
| Skenario 4 (multi-user) lulus | ≥ 80% tester |
| Skenario 5 (moderasi) lulus | 100% |
| Crash blocker terbuka | 0 |
| Skor kepuasan tester (1-5) | ≥ 3.5 rata-rata |

### 7.2 Kriteria Gagal (perlu perbaikan sebelum lanjut)

- Lebih dari 2 crash blocker
- PTT tidak jalan untuk > 30% tester
- Bypass moderasi ditemukan (security)
- Background survival gagal di semua merek HP

### 7.3 Keputusan Putaran Beta

| Hasil | Tindakan |
|-------|----------|
| **LULUS** | Lanjut open beta / Play Store production track |
| **LULUS BERSYARAT** | Perbaiki isu major, putaran beta ke-2 (1 minggu) |
| **GAGAL** | Kembali ke development, jadwalkan beta ulang |

---

## 8. Jadwal Putaran Beta (template 3 minggu)

| Minggu | Aktivitas Owner | Aktivitas Tester |
|--------|-----------------|------------------|
| **Minggu 0** | Rekrut, kirim APK, onboarding | Install app |
| **Minggu 1** | Monitor grup, triage bug harian | Skenario 1, 2, 5 |
| **Minggu 2** | Release beta.2 jika ada fix | Skenario 3, 4, 6 |
| **Minggu 3** | Kumpulkan feedback, keputusan lulus/gagal | Skenario 7 + form akhir |
| **Minggu 4** | Laporan beta 1 halaman | — |

---

## 9. Triage Bug — Prioritas Perbaikan

| Prioritas | Definisi | SLA perbaikan |
|-----------|----------|---------------|
| **P0 Blocker** | App crash, PTT total mati, security bypass | 24 jam |
| **P1 Major** | Background gagal, moderasi partial, audio 1 arah | 3 hari |
| **P2 Minor** | UI glitch, tema, teks salah | 1 minggu |
| **P3 Saran** | Enhancement | Backlog |

**Owner** bertanggung jawab triage awal setiap pagi — tandai P0/P1 di Google Sheet, escalate ke developer.

---

## 10. Template Laporan Beta (Owner — 1 halaman)

```
=== LAPORAN CLOSED BETA NextVWT ===
Putaran: beta.1 / beta.2
Periode: [TANGGAL MULAI] – [TANGGAL SELESAI]
Jumlah tester: ___ / 30 target

HASIL SKENARIO:
  S1 PTT dasar:        ___% lulus
  S2 PTT 4G:           ___% lulus
  S3 Background 30min: ___% lulus
  S4 Multi-user:       ___% lulus
  S5 Moderasi:         ___% lulus
  S6 Channel switch:   ___% lulus

BUG:
  P0 Blocker: ___ (list)
  P1 Major:   ___ (list)
  P2 Minor:   ___ (list)

SKOR KEPUASAN: ___/5 (rata-rata)

DISTRIBUSI HP:
  Xiaomi: ___ tester
  Samsung: ___ tester
  Oppo/Vivo: ___ tester
  Lainnya: ___ tester

KEPUTUSAN: □ LULUS  □ LULUS BERSYARAT  □ GAGAL

LANGKAH BERIKUTNYA:
_________________________________
```

---

## 11. Etika & Batasan Beta

- Tester **tidak dibayar** kecuali Anda sepakat hadiah (pulsa, voucher) — cantumkan di grup
- Jangan bagikan APK di luar grup beta
- Jangan rekam audio tester lain tanpa izin
- Komunikasi beta bukan untuk keadaan darurat nyawa
- Owner wajib respon bug P0 dalam 24 jam

---

## 12. Checklist Cepat Owner — Hari Pertama Beta

```
□ Kirim APK / link Play Console ke grup
□ Pin skenario uji 1-6 di grup WA
□ Pin link Google Form bug report
□ Pastikan owner online di Channel 100 sebagai admin
□ Monitor setiap 2 jam hari pertama
□ Catat tester yang belum install (follow up)
□ Sore hari 1: cek apakah minimal 2 tester sudah PTT berhasil
```

---

*NextVWT Beta Testing Protocol v1.0 · 9 Juni 2026*
