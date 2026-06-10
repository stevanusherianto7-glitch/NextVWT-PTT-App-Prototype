# NextVWT Owner Playbook
## Panduan Lengkap Persiapan dari Sisi Pemilik Aplikasi (Owner)

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 9 Juni 2026 |
| **Untuk** | Pemilik / founder / product owner NextVWT |
| **Tujuan** | Daftar tahapan, akun, dokumen, biaya, dan keputusan yang **Anda** siapkan — terpisah dari pekerjaan coding tim developer |

**Dokumen terkait:**
- [NextVWT_PRD_v3.md](./NextVWT_PRD_v3.md) — roadmap produk & backlog teknis
- [Implementasi wajib nextvwt.md](./Implementasi%20wajib%20nextvwt.md) — visi strategis 24 bulan
- [Spesifikasi_Infrastruktur_VPS_NextVWT.md](./Spesifikasi_Infrastruktur_VPS_NextVWT.md) — spesifikasi VPS untuk provider
- [NextVWT_PTT_Audit_Report_v4.md](./NextVWT_PTT_Audit_Report_v4.md) — temuan keamanan wajib ditangani

---

## 0. Memahami Peran Anda sebagai Owner

```text
┌─────────────────────────────────────────────────────────────────┐
│                        ANDA (OWNER)                              │
│  Keputusan produk · Akun & billing · Legal · Budget · Tester    │
│  Mitra pilot · Brand · Domain · Merchant payment · Compliance   │
└────────────────────────────┬────────────────────────────────────┘
                             │ arahkan & validasi
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TIM DEVELOPER / DEVOPS                         │
│  Coding · Migrasi DB · Edge Functions · Integrasi FCM/SFU       │
└─────────────────────────────────────────────────────────────────┘
```

**Yang menjadi tanggung jawab owner (bukan developer):**

| Area | Owner | Developer |
|------|:-----:|:---------:|
| Daftar akun & bayar langganan | ✅ | — |
| Rotasi password di dashboard layanan | ✅ | bantu teknis |
| Keputusan bisnis (harga koin, target pasar) | ✅ | — |
| Dokumen legal (privacy policy, ToS) | ✅ | review teknis |
| Rekrut tester beta | ✅ | — |
| KYC payment gateway | ✅ | — |
| Order VPS ke provider | ✅ | spesifikasi teknis |
| Coding & deploy | — | ✅ |

---

## 1. Peta Tahapan Keseluruhan (0–24 Bulan)

| Fase | Periode | Fokus Owner | Estimasi Biaya Owner |
|------|---------|-------------|----------------------|
| **F0** | Minggu 0 | Keputusan fondasi & vault credential | Rp 0 |
| **F1** | Minggu 1–2 | Keamanan + akun inti (Blok A) | Rp 0 – 500rb |
| **F2** | Bulan 1–3 | Beta tertutup + Firebase + domain | Rp 1 – 3 juta |
| **F3** | Bulan 3–6 | Monetisasi + merchant payment | Rp 2 – 5 juta + fee trx |
| **F4** | Bulan 6–12 | Pilot lapangan + VPS + ROIP | Rp 5 – 15 juta |
| **F5** | Bulan 12–24 | Skala nasional + enterprise | Rp 15 – 50 juta+ |

> Angka di atas perkiraan untuk startup/individu. Tidak termasuk gaji tim developer.

---

## FASE 0 — Keputusan Fondasi (Minggu 0)
### Lakukan sebelum mengeluarkan uang atau menyuruh developer lanjut

### 1.1 Keputusan Produk yang Hanya Owner Bisa Ambil

| # | Keputusan | Pilihan | Rekomendasi PRD v3 |
|---|-----------|---------|-------------------|
| 1 | Target pasar utama tahun pertama | Komunitas / Ojol / SAR / Event / Campuran | Mulai **komunitas + ojol** (persona Pebe + Andi) |
| 2 | Model monetisasi awal | Koin utilitas / Donasi channel / Enterprise / Gratis dulu | **Gratis dulu** 3 bulan beta, lalu koin donasi |
| 3 | Nama domain & brand final | `nextvwt.id` / `.com` / lainnya | Daftarkan sekarang jika belum |
| 4 | Badan usaha untuk payment | Perorangan / PT / CV | **CV/PT** jika target monetisasi bulan 3–6 |
| 5 | ROIP di roadmap? | Ya / Tidak / Nanti | **Nanti** (bulan 6+) kecuali ada mitra ORARI |
| 6 | Siapa yang pegang kunci production? | Owner saja / Dev / Berdua | Owner pegang semua billing & root access |

### 1.2 Siapkan Vault Credential (Hari 1)

Gunakan password manager: **Bitwarden** (gratis) atau **1Password**.

Buat folder `NextVWT Production` dan siapkan tab untuk:

```
□ Supabase (email login, password, project URL, anon key, service role key)
□ Google Cloud Console (email, project ID, OAuth client ID)
□ Firebase Console (linked ke Google Cloud)
□ GitHub (akun org/repo)
□ Metered.ca / Twilio (TURN)
□ Domain registrar (Namecheap, Cloudflare, Pandi, dll.)
□ VPS provider (Biznet Gio / IDCloudHost)
□ Play Console (nanti)
□ Payment gateway (nanti)
```

**Aturan keras:**
- Jangan simpan password di WhatsApp atau screenshot
- Jangan kirim `service_role key` ke developer via chat — gunakan GitHub Secrets atau Supabase invite
- Setelah rotasi credential (Fase 1), catat tanggal rotasi di vault

### 1.3 Checklist Fase 0

```
□ Baca NextVWT_PRD_v3.md (minimal §0, §6, §11)
□ Baca Implementasi wajib nextvwt.md (ringkasan eksekutif + roadmap)
□ Tentukan target pasar tahun pertama
□ Tentukan timeline beta (target tanggal)
□ Buat password manager & folder NextVWT
□ Tentukan siapa tim: developer, designer, legal (jika ada)
□ Siapkan email bisnis: hello@domain-anda.com (profesional untuk Play Store & payment)
```

**Deliverable Fase 0:** Dokumen 1 halaman "Keputusan Produk NextVWT" (boleh tulis di Google Doc) berisi 6 keputusan di §1.1.

---

## FASE 1 — Keamanan & Akun Inti (Minggu 1–2)
### Prioritas mutlak — blocker audit v4

### 2.1 Rotasi Credential (KRITIS — Hari 1–2)

| Langkah | Anda lakukan | Di mana |
|---------|--------------|---------|
| 1 | Login Supabase Dashboard → Settings → API | supabase.com |
| 2 | **Reset** `service_role` key dan `anon` key | Generate new keys |
| 3 | Login Google Cloud Console → Credentials | console.cloud.google.com |
| 4 | **Buat OAuth Client ID baru** (Android + Web jika perlu) | Hapus/revoke yang lama |
| 5 | Update key baru ke developer via **GitHub Secrets** | github.com → repo → Settings → Secrets |
| 6 | Minta developer jalankan BFG hapus `.env` dari git history | Koordinasi dengan dev |
| 7 | Verifikasi `.env` tidak ada di repo publik | Cek GitHub |

**Biaya:** Rp 0  
**Waktu Anda:** ~2–3 jam + koordinasi dev

### 2.2 Akun Wajib — Daftar & Aktivasi

#### A. Supabase (sudah ada — pastikan terpisah dev/prod)

| Item | Action Owner |
|------|--------------|
| Buat project **Production** terpisah dari development | supabase.com → New Project |
| Region | **Singapore** (terdekat Indonesia) |
| Plan | Free dulu, upgrade Pro ($25/bln) saat beta >100 user |
| Billing | Kartu kredit/debit internasional |
| Invite developer | Settings → Team (jangan share service_role via chat) |

#### B. Google Cloud Console

| Item | Action Owner |
|------|--------------|
| Buat project `NextVWT Production` | console.cloud.google.com |
| Aktifkan **Google Identity** / OAuth | APIs & Services → OAuth consent screen |
| Isi consent screen: nama app, logo, privacy policy URL | Wajib untuk production |
| OAuth Android Client | Butuh **SHA-1** dari developer (minta ke dev) |
| Billing | Tidak wajib untuk OAuth saja |

#### C. Metered.ca — TURN Server (sangat disarankan)

| Item | Action Owner |
|------|--------------|
| Daftar akun | metered.ca |
| Buat TURN domain | Dashboard → TURN Server |
| Catat `METERED_DOMAIN` + `METERED_API_KEY` | Masukkan ke Supabase Secrets (minta dev) |
| Free tier | ~50 GB/bulan — cukup untuk beta |

**Alternatif:** Twilio (lebih mahal, lebih enterprise).

#### D. GitHub

| Item | Action Owner |
|------|--------------|
| Pastikan repo **Private** | Settings → Danger Zone |
| Tambah Secrets untuk CI/CD | Settings → Secrets and variables → Actions |
| Anda sebagai owner repo | Jangan transfer ownership ke dev |

### 2.3 Seed Data Awal (Koordinasi dengan Developer)

Anda atau admin perlu login Supabase Dashboard:

```
□ Buat 1 channel resmi (misal: Channel 100 "NextVWT Official")
□ Buat akun NOC / Sys Admin (bukan via nama tampilan "pawon salam")
□ Assign role PJC ke akun Anda sendiri untuk channel uji
□ Jangan bagikan role NOC ke publik
```

### 2.4 Checklist Fase 1

```
KEAMANAN (wajib hijau sebelum lanjut):
□ Credential Supabase dirotasi
□ OAuth Google dirotasi
□ .env dihapus dari git history (konfirmasi dari dev)
□ Repo GitHub private
□ Semua key di password manager

AKUN:
□ Supabase production project aktif
□ Google Cloud project + OAuth consent screen terisi
□ Metered.ca aktif + API key di Supabase Secrets
□ GitHub Secrets terisi

DATA:
□ 1 channel seed di database
□ 1 akun NOC di-seed manual
□ Developer konfirmasi SEC-03 s/d SEC-07 selesai (RLS, moderate-channel, dll.)
```

**Deliverable Fase 1:** Screenshot/log vault credential lengkap + konfirmasi dev "Blok A selesai".

**Estimasi biaya Fase 1:** Rp 0 – Rp 500.000 (jika upgrade Supabase Pro lebih awal)

---

## FASE 2 — Beta Tertutup & Kesiapan Lapangan (Bulan 1–3)
### Tahap 1 PRD v3 — fondasi stabilitas

### 3.1 Akun Baru yang Perlu Dibuka

#### A. Firebase (wajib untuk background Android / FCM)

| Langkah | Detail |
|---------|--------|
| 1 | Login [console.firebase.google.com](https://console.firebase.google.com) |
| 2 | Add project → link ke Google Cloud project yang sama |
| 3 | Add Android app → package name: minta ke developer (`com.nextvwt.ptt` atau sesuai manifest) |
| 4 | Download `google-services.json` → kirim ke developer (bukan commit publik) |
| 5 | Cloud Messaging → pastikan aktif |
| 6 | Spark plan (gratis) cukup untuk beta |

**Yang owner siapkan:** Akun Firebase + download file `google-services.json`  
**Yang developer lakukan:** Integrasi FCM + Foreground Service di Android

#### B. Domain (sangat disarankan)

| Item | Rekomendasi |
|------|-------------|
| Registrar Indonesia | [Pandi.id](https://pandi.id) untuk `.id` |
| Registrar global | Cloudflare Registrar, Namecheap |
| Nama | `nextvwt.id`, `nextvwt.app`, atau varian |
| DNS | Cloudflare (gratis) untuk CDN + SSL |

**DNS records (setelah VPS aktif nanti):**

```
media.domain-anda.com  → A → IP VPS
api.domain-anda.com    → A → IP VPS
app.domain-anda.com    → CNAME → hosting web (jika ada landing page)
```

**Biaya domain:** Rp 150.000 – Rp 350.000 / tahun

#### C. Google Play Console (sebelum distribusi APK ke publik)

| Item | Detail |
|------|--------|
| Biaya pendaftaran | **$25 USD sekali bayar** |
| Persyaratan | Akun Google, kartu kredit |
| Nama developer | Nama Anda atau nama PT/CV |
| Privacy policy URL | **Wajib** — siapkan halaman privacy (§3.4) |
| Internal testing track | Gratis, max 100 tester — mulai dari sini |

#### D. VPS Jakarta (opsional di bulan 1 — wajib jika SFU PoC)

Lihat dokumen lengkap: [Spesifikasi_Infrastruktur_VPS_NextVWT.md](./Spesifikasi_Infrastruktur_VPS_NextVWT.md)

**Yang owner lakukan:**
1. Pilih provider (rekomendasi: Biznet Gio MM 8.4 — 4C/8GB)
2. Kirim §12 Formulir Order dari spesifikasi VPS
3. Minta provider isi checklist §11 (UDP 40000–49999!)
4. Bayar & catat IPv4 publik
5. Berikan akses SSH ke developer (key-based)

**Biaya:** Rp 270.000 – Rp 500.000 / bulan  
**Kapan order:** Saat developer siap deploy SFU PoC (PRD T1-07), biasanya bulan 2–3

### 3.2 Dokumen Legal Minimum (Anda yang siapkan)

| Dokumen | Wajib untuk | Bisa buat dengan |
|---------|-------------|------------------|
| **Privacy Policy** (Kebijakan Privasi) | Play Store, OAuth Google, GDPR/PDP | Template + review hukum |
| **Terms of Service** (Syarat & Ketentuan) | Play Store, channel publik | Template + review hukum |
| **Kebijakan Komunitas** | Channel publik, moderasi | Adaptasi dari NEXTVWT_MODERASI doc |

**Isi minimum Privacy Policy untuk NextVWT:**
- Data yang dikumpulkan: username, audio (real-time, tidak disimpan permanen kecuali laporan), device ID, IP
- Penggunaan mikrofon & background service
- Buffer audio 15 detik untuk laporan pelanggaran (jika fitur aktif)
- Pihak ketiga: Supabase, Google, Firebase, payment gateway
- Hak pengguna: hapus akun, akses data
- Kontak: email bisnis Anda

**Hosting privacy policy:** GitHub Pages gratis, atau Notion public page, atau halaman di domain Anda.

### 3.3 Rekrut & Kelola Tester Beta

| Kriteria | Target |
|----------|--------|
| Jumlah | 10–30 orang untuk closed beta |
| Komposisi | 3 merek HP berbeda (Xiaomi, Samsung, Oppo/Vivo) |
| Lokasi | Minimal 2 kota berbeda |
| Persona | 2 komunitas motor, 2 ojol, 2 satpam/Siskamling |
| Durasi uji | 2–4 minggu per putaran |

**Yang Anda siapkan:**

```
□ Google Form pendaftaran beta tester (nama, HP, operator, kota)
□ Grup WhatsApp/Telegram beta (jangan share credential di sini)
□ Daftar bug & feedback (Google Sheet)
□ Instruksi tester: cara install APK, channel uji, apa yang dilaporkan
□ Kesepakatan: tester sadar ini beta, audio mungkin gagal, data mungkin direset
```

**Skenario uji wajib untuk tester:**

| # | Skenario | KPI |
|---|----------|-----|
| 1 | PTT 2 orang, WiFi, layar menyala | Latensi < 400 ms |
| 2 | PTT 2 orang, 4G, layar terkunci 30 menit | App masih terima TX |
| 3 | 5 orang 1 channel, bergantian PTT | Tidak tabrakan bicara |
| 4 | Ganti channel 10x cepat | Tidak crash |
| 5 | Admin mute user → user tidak bisa PTT | Moderasi jalan |

### 3.4 Brand & Aset Visual (Anda siapkan / komisioner)

| Aset | Ukuran | Untuk |
|------|--------|-------|
| Logo PNG transparan | 512×512 | Play Store, OAuth |
| Feature graphic | 1024×500 | Play Store |
| Screenshot HP | 6–8 layar | Play Store listing |
| Icon adaptive Android | 108×108 dp | APK |
| Deskripsi app ID + EN | 4000 karakter | Play Store |

File logo sudah ada di `kumpulan file png/nextvwt_brand_logo.png` — pastikan resolusi cukup untuk Play Store.

### 3.5 Checklist Fase 2

```
AKUN:
□ Firebase project + google-services.json ke developer
□ Domain terdaftar + DNS di Cloudflare
□ Play Console ($25) — bisa ditunda sampai minggu 6–8
□ VPS dipesan (jika SFU PoC dimulai)

LEGAL:
□ Privacy Policy online (URL aktif)
□ Terms of Service online
□ Kebijakan Komunitas (minimal draft)

BETA:
□ 10–30 tester terdaftar
□ Google Form + Sheet feedback aktif
□ 5 skenario uji didistribusikan ke tester
□ Anda sendiri uji di minimal 2 HP berbeda

BRAND:
□ Logo 512×512 siap
□ 6 screenshot app siap (minta dev build APK)
```

**Deliverable Fase 2:** Laporan beta 1 halaman (berapa tester, bug utama, latensi subjective, layar kunci lulus/tidak).

**Estimasi biaya Fase 2:** Rp 1 – 3 juta (domain + Play Console + VPS 1–2 bulan + Supabase Pro opsional)

---

## FASE 3 — Monetisasi & Diferensiasi (Bulan 3–6)
### Tahap 2 PRD v3 — koin utilitas + QRIS

### 4.1 Persiapan Badan Usaha & Payment Gateway

Payment gateway Indonesia **wajib KYC** — Anda perlu dokumen bisnis.

#### Dokumen yang biasanya diminta Midtrans / Xendit / Duitku

| Dokumen | Perorangan | CV/PT |
|---------|:----------:|:-----:|
| KTP direktur/pemilik | ✅ | ✅ |
| NPWP | ✅ | ✅ NPWP perusahaan |
| NIB (OSS) | ✅ | ✅ |
| Akta pendirian + SK Kemenkumham | — | ✅ |
| Rekening bank atas nama bisnis | ✅ | ✅ rekening perusahaan |
| Email & nomor HP bisnis | ✅ | ✅ |
| URL website/app | ✅ | ✅ |
| Privacy policy URL | ✅ | ✅ |

**Keputusan owner:**

| Keputusan | Rekomendasi |
|-----------|-------------|
| Provider payment | **Midtrans** atau **Xendit** (paling umum di Indonesia) |
| Mode awal | QRIS Dinamis only (tanpa kartu kredit dulu) |
| Harga koin | Contoh: Rp 10.000 = 100 Koin (Anda tentukan) |
| Koin = e-money? | **TIDAK** — koin utilitas in-app saja (ADR-006 PRD v3) |

#### Langkah daftar merchant (Anda lakukan)

```
1. Pilih Midtrans (midtrans.com) atau Xendit (xendit.co)
2. Daftar merchant → lengkapi KYC (3–14 hari kerja)
3. Aktifkan QRIS
4. Catat Server Key + Client Key → vault credential
5. Set webhook URL: https://api.domain-anda.com/payment/webhook (developer setup)
6. Berikan Server Key ke developer via GitHub Secrets
7. Uji transaksi Rp 1.000 sendiri sebelum buka ke publik
```

### 4.2 Keputusan Produk Monetisasi (Owner)

| Item | Contoh | Anda isi |
|------|--------|----------|
| Paket koin terkecil | Rp 5.000 = 50 Koin | _________ |
| Donasi channel minimum | 10 Koin | _________ |
| Harga tema premium | 200 Koin | _________ |
| Badge VIP bulanan | 500 Koin | _________ |
| Apakah ada biaya masuk channel premium? | Ya/Tidak | _________ |

Tulis keputusan ini di Google Doc — developer implementasi ke `channel_settings` dan UI topup.

### 4.3 Konsultasi Hukum (Disarankan)

| Topik | Mengapa |
|-------|---------|
| Koin utilitas vs regulasi BI | Pastikan tidak dianggap e-money ilegal |
| Pajak dari pendapatan app | PPh, PPn jika PT |
| Donasi channel | Apakah perlu izin tertentu |
| Rekaman audio laporan | Consent di privacy policy |

**Biaya konsultasi hukum:** Rp 2 – 10 juta (sekali) — sangat disarankan sebelum buka payment.

### 4.4 Checklist Fase 3

```
BISNIS:
□ Badan usaha terdaftar (CV/PT) atau perorangan siap KYC
□ Rekening bank bisnis aktif
□ NPWP + NIB siap

PAYMENT:
□ Merchant Midtrans/Xendit approved
□ QRIS aktif
□ 1 transaksi uji sukses end-to-end
□ Webhook secret di vault

PRODUK:
□ Tabel harga koin ditetapkan
□ Privacy policy diupdate (sebut payment & data transaksi)
□ Tester beta tahu fitur topup akan hadir

LEGAL:
□ Konsultasi hukum koin utilitas (minimal 1 sesi)
```

**Deliverable Fase 3:** Transaksi QRIS pertama sukses + saldo koin bertambah di app Anda sendiri.

**Estimasi biaya Fase 3:** Rp 2 – 5 juta (pendirian CV opsional + legal + fee payment setup) + 1.5–2.5% per transaksi

---

## FASE 4 — Pilot Lapangan & ROIP (Bulan 6–12)
### Tahap 3 PRD v3

### 5.1 Mitra Pilot — Anda yang Cari & Negosiasi

| Segmen | Mitra ideal | Yang Anda tawarkan | Yang Anda minta |
|--------|-------------|-------------------|-----------------|
| Komunitas motor | Ketua chapter, 50+ member | Channel resmi gratis 6 bulan | Feedback + testimoni |
| Driver ojol | Koordinator base | Channel koordinasi | Uji mode noise Ojol |
| Siskamling/Satpam | RT/RW setempat | 1 channel per lingkungan | Uji background 2 jam |
| Relawan SAR | Unit kota | Channel darurat | Uji emergency override |
| Radio amatir | ORARI lokal | ROIP Monitor Only | Bantuan legal IAR |

**Template outreach (WhatsApp/DM):**

```
Halo [Nama], saya [Anda] dari NextVWT — aplikasi walkie-talkie digital 
buat koordinasi tim di lapangan. Kami cari 1 komunitas untuk uji coba 
gratis 3 bulan. Fitur: PTT real-time, channel khusus, moderasi admin.

Yang kami butuhkan: 10–20 anggota mau install APK beta, uji 2x seminggu, 
kasih feedback jujur.

Apakah Bapak/Ibu tertarik diskusi 15 menit?
```

### 5.2 Infrastruktur — VPS Production

Jika belum di Fase 2, sekarang wajib:

| Item | Spesifikasi | Biaya |
|------|-------------|-------|
| VPS media Jakarta | 4–8 vCPU, 8–16 GB RAM | Rp 400rb–1jt/bln |
| Domain + SSL | Sudah dari Fase 2 | — |
| Monitoring | Uptime Kuma (gratis self-host) | Rp 0 |

Kirim [Spesifikasi_Infrastruktur_VPS_NextVWT.md](./Spesifikasi_Infrastruktur_VPS_NextVWT.md) ke provider.

### 5.3 ROIP (Jika Ada Mitra Radio) — Persiapan Owner

| Item | Owner | Catatan |
|------|-------|---------|
| Mitra dengan **IAR/IKR valid** | Cari via ORARI setempat | Wajib hukum |
| Hardware gateway | Beli Raspberry Pi 4 + kit | ~Rp 1–2 juta |
| Interface radio | Kabel audio + PTT optocoupler | ~Rp 200–500rb |
| Kesepakatan tertulis | MoU dengan komunitas radio | Template dari ORARI |
| Asuransi/tanggung jawab | Klarifikasi siapa pemilik frekuensi | Owner mitra, bukan Anda |

**Jangan aktifkan ROIP two-way** tanpa dokumen IAR diverifikasi.

### 5.4 Checklist Fase 4

```
MITRA:
□ Minimal 1 komunitas pilot signed (informal OK)
□ 20+ user aktif mingguan di pilot
□ Laporan feedback bulanan dari pilot

INFRA:
□ VPS production aktif + domain pointing
□ Uptime monitoring aktif
□ Backup VPS mingguan (snapshot provider)

ROIP (opsional):
□ Mitra ORARI dengan IAR valid
□ Hardware gateway dibeli
□ MoU ditandatangani
□ Mode Monitor Only disepakati untuk pilot

OPERASIONAL:
□ Channel support (WA Business atau email)
□ SOP tangani laporan pelanggaran
□ 1 admin moderasi on-call per channel pilot
```

**Deliverable Fase 4:** Laporan pilot 3 bulan (user aktif, retention, insiden, NPS).

**Estimasi biaya Fase 4:** Rp 5 – 15 juta (VPS 6 bulan + hardware ROIP opsional + operasional)

---

## FASE 5 — Skala Nasional & Enterprise (Bulan 12–24)
### Tahap 4 PRD v3 — owner focus

### 6.1 Yang Anda Siapkan di Fase Ini

| Area | Aktivitas Owner |
|------|-----------------|
| **Enterprise sales** | Pitch deck, pricing korporat, SLA draft |
| **Multi-region infra** | Budget Rp 3–15jt/bulan untuk 2–3 VPS |
| **Tim** | Hire: 1 DevOps, 1 community manager, 1 support |
| **Compliance** | Audit keamanan eksternal (pentest) |
| **Play Store skala** | ASO, iklan, press release |
| **Partnership** | Korporat logistik, security company, event organizer |
| **iOS** | Apple Developer Program ($99/tahun) jika masuk roadmap |

### 6.2 Checklist Fase 5 (High Level)

```
□ 1.000+ MAU (monthly active users)
□ 1 klien enterprise pilot (fleet management)
□ Pentest eksternal selesai
□ Multi-region VPS (Jakarta + 1 kota lain)
□ Tim support < 4 jam response time
□ Play Store rating > 4.0
□ Pendirian PT (jika belum) untuk skala bisnis
```

---

## 7. Master Checklist Akun & Layanan

Gunakan tabel ini sebagai dashboard pribadi. Isi tanggal selesai.

| # | Layanan | URL | Wajib Fase | Biaya | Status | Tanggal |
|---|---------|-----|------------|-------|--------|---------|
| 1 | Supabase | supabase.com | F1 | $0–25/bln | ☐ | |
| 2 | Google Cloud Console | console.cloud.google.com | F1 | $0 | ☐ | |
| 3 | Metered.ca (TURN) | metered.ca | F1 | $0+ | ☐ | |
| 4 | GitHub | github.com | F1 | $0 | ☐ | |
| 5 | Password Manager | bitwarden.com | F0 | $0 | ☐ | |
| 6 | Firebase (FCM) | console.firebase.google.com | F2 | $0 | ☐ | |
| 7 | Domain + Cloudflare DNS | cloudflare.com | F2 | ~Rp 200rb/thn | ☐ | |
| 8 | Google Play Console | play.google.com/console | F2 | $25 sekali | ☐ | |
| 9 | VPS Jakarta | biznetgio.com / idcloudhost.com | F2–F4 | ~Rp 300rb/bln | ☐ | |
| 10 | Midtrans / Xendit | midtrans.com / xendit.co | F3 | fee per trx | ☐ | |
| 11 | Email bisnis | Google Workspace | F2 | ~Rp 150rb/bln | ☐ | |
| 12 | Apple Developer (iOS) | developer.apple.com | F5 | $99/thn | ☐ | |

---

## 8. Master Checklist Dokumen

| # | Dokumen | Wajib Fase | Status | URL/Lokasi |
|---|---------|------------|--------|------------|
| 1 | Keputusan Produk (1 halaman) | F0 | ☐ | |
| 2 | Privacy Policy | F2 | ☐ | |
| 3 | Terms of Service | F2 | ☐ | |
| 4 | Kebijakan Komunitas | F2 | ☐ | |
| 5 | Spesifikasi VPS ke provider | F2–F4 | ☐ | Sudah ada di repo |
| 6 | Form pendaftaran beta tester | F2 | ☐ | |
| 7 | Laporan beta | F2 | ☐ | |
| 8 | Tabel harga koin | F3 | ☐ | |
| 9 | MoU mitra pilot | F4 | ☐ | |
| 10 | MoU mitra ROIP + salinan IAR | F4 | ☐ | |
| 11 | Pitch deck enterprise | F5 | ☐ | |

---

## 9. Anggaran Kumulatif Owner (Perkiraan)

| Fase | Item | Estimasi |
|------|------|----------|
| **F0–F1** | Password manager, rotasi key | Rp 0 |
| **F2** | Domain + Play Console + VPS 2 bln | Rp 1 – 2,5 juta |
| **F2** | Supabase Pro (opsional) | ~Rp 400rb/bln |
| **F3** | Pendirian CV (opsional) | Rp 2 – 5 juta |
| **F3** | Konsultasi hukum | Rp 2 – 5 juta |
| **F4** | VPS 6 bulan + ROIP hardware | Rp 5 – 10 juta |
| **F5** | Infra multi-region + tim | Rp 15 – 50 juta+ |

**Total minimum sampai beta publik (F2):** ~Rp 1,5 – 3 juta + $25  
**Total minimum sampai monetisasi (F3):** ~Rp 5 – 15 juta  
**Total sampai pilot lapangan (F4):** ~Rp 10 – 25 juta

*Tidak termasuk gaji developer/freelancer.*

---

## 10. Kesalahan Umum Owner (Hindari)

| # | Kesalahan | Dampak | Solusi |
|---|-----------|--------|--------|
| 1 | Langsung sewa VPS SFU sebelum beta P2P | Buang Rp 3–6jt | P2P dulu, VPS saat T1-07 |
| 2 | Buka payment gateway tanpa privacy policy | KYC ditolak | F2 legal dulu |
| 3 | Share service_role key via WhatsApp | Database bisa dibobol | GitHub Secrets + vault |
| 4 | Skip rotasi credential | Credential bocor di git history | F1 hari 1 |
| 5 | Tester cuma 1 merek HP | Bug Doze tidak ketahuan | Minimal 3 merek |
| 6 | ROIP two-way tanpa IAR | Risiko hukum frekuensi | Monitor Only dulu |
| 7 | Koin dijual tanpa konsultasi hukum | Risiko regulasi BI | ADR-006, konsultasi legal |
| 8 | Tidak catat keputusan produk | Developer bingung prioritas | Dokumen F0 |
| 9 | Play Store tanpa screenshot asli | Listing ditolak | Build APK dulu |
| 10 | Semua dikerjakan sendiri | Burnout, lambat | Delegasi jelas ke dev |

---

## 11. Timeline Visual — Apa yang Owner Kerjakan Kapan

```text
MINGGU 0          MINGGU 1-2         BULAN 1-3           BULAN 3-6          BULAN 6-12
─────────────────────────────────────────────────────────────────────────────────────
F0: Keputusan     F1: Rotasi key     F2: Firebase        F3: Merchant       F4: Mitra pilot
    Vault cred        Supabase           Domain              payment            VPS prod
    Target pasar      Metered TURN       Play Console        Harga koin         ROIP (opsional)
                      GitHub private     Privacy policy      Konsultasi hukum   MoU komunitas
                      Seed NOC           Rekrut tester
                                         VPS (jika SFU)
─────────────────────────────────────────────────────────────────────────────────────
     ANDA            ANDA + DEV         ANDA + DEV          ANDA (+LEGAL)      ANDA + MITRA
```

---

## 12. Kontak & Eskalasi — Siapa Dihubungi untuk Apa

| Kebutuhan | Siapa | Kapan |
|-----------|-------|-------|
| Bug di app, fitur tidak jalan | Developer | Setiap hari |
| Akun Supabase/Firebase error | Developer + docs resmi | Saat deploy |
| VPS tidak bisa buka UDP | **Sales provider VPS** | Sebelum bayar & setelah masalah |
| KYC payment ditolak | **Support Midtrans/Xendit** | Fase 3 |
| Izin frekuensi ROIP | **ORARI setempat** | Fase 4 |
| Regulasi koin/e-money | **Konsultan hukum** | Sebelum Fase 3 |
| Play Store listing ditolak | **Google Play support** | Saat submit |

---

## 13. Ringkasan — Mulai dari Mana Hari Ini?

Jika Anda bingung mulai dari mana, ikuti urutan ini:

```
HARI INI (F0):
  1. Baca dokumen ini sampai §2
  2. Buat password manager + folder NextVWT
  3. Tulis 1 halaman keputusan produk (§1.1)

MINGGU INI (F1):
  4. Rotasi semua credential Supabase + Google
  5. Pastikan repo GitHub private
  6. Daftar Metered.ca + set TURN
  7. Minta developer selesaikan Blok A keamanan

BULAN DEPAN (F2):
  8. Daftar Firebase + kirim google-services.json ke dev
  9. Beli domain
  10. Tulis Privacy Policy (bisa draft dulu)
  11. Rekrut 10 beta tester
  12. Daftar Play Console ($25)

BULAN 3–6 (F3) — jika beta sukses:
  13. Daftar merchant payment
  14. Konsultasi hukum koin
  15. Tentukan harga koin

BULAN 6+ (F4) — jika ada traksi:
  16. Cari mitra pilot komunitas
  17. Order VPS production
  18. Evaluasi ROIP dengan mitra ORARI
```

---

## 14. Lampiran — Template Email ke Developer

**Subject:** NextVWT — Credential & Prioritas Blok A

```
Halo [Dev],

Saya sudah menyelesaikan rotasi credential:
- Supabase project: [nama project]
- Anon key & service role: sudah di GitHub Secrets
- Google OAuth client ID baru: [xxx].apps.googleusercontent.com
- Metered TURN: API key di Supabase Secrets

Prioritas minggu ini (Blok A PRD v3):
1. SEC-03: Perbaiki RLS moderasi
2. SEC-04: Edge Function moderate-channel
3. SEC-05: Hapus auto-assign PJC "pawon salam"
4. Konfirmasi .env sudah dihapus dari git history

Saya attach vault index credential (tanpa secret) untuk referensi.

Terima kasih,
[Nama Owner]
```

---

*NextVWT Owner Playbook v1.0 · 9 Juni 2026*  
*Dokumen hidup — perbarui kolom Status di §7 & §8 setiap kali menyelesaikan satu tahap.*
