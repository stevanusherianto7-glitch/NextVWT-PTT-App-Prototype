# Rincian Biaya Owner NextVWT
## Estimasi Anggaran per Fase (F2 – F4)

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 9 Juni 2026 |
| **Untuk** | Pemilik / founder NextVWT |
| **Mata uang** | IDR (Rupiah) + USD jika berlaku |

**Dokumen terkait:**
- [NextVWT_Owner_Playbook_Persiapan_Lengkap.md](./NextVWT_Owner_Playbook_Persiapan_Lengkap.md) — tahapan persiapan owner
- [NextVWT_PRD_v3.md](./NextVWT_PRD_v3.md) — roadmap produk

---

## Catatan Penting Sebelum Membaca

1. Angka di bawah adalah **perkiraan** — harga aktual bisa berubah tergantung provider dan promo.
2. Biaya ini **ditanggung owner** untuk akun, layanan, legal, dan infrastruktur.
3. **Tidak termasuk** gaji developer, freelancer, atau biaya coding.
4. Tanda **`+`** pada F3 dan F4 berarti **ditambah** ke biaya fase sebelumnya (kumulatif).
5. Banyak layanan punya **tier gratis** yang cukup untuk tahap awal.

---

## Ringkasan Cepat

| Fase | Periode | Estimasi Biaya | Fokus |
|------|---------|----------------|-------|
| **F2** | Bulan 1–3 | **Rp 0,7 – 3 juta** + **$25** | Beta tertutup |
| **F3** | Bulan 3–6 | **+ Rp 2 – 15 juta** | Monetisasi (koin / QRIS) |
| **F4** | Bulan 6–12 | **+ Rp 4 – 15 juta** | Pilot lapangan & server |
| **Kumulatif F2+F3+F4** | Bulan 1–12 | **Rp 8 – 33 juta** | Seluruh tahap awal |

---

## FASE 2 — Beta Tertutup (Bulan 1–3)

**Tujuan:** Aplikasi bisa diuji 10–30 orang secara tertutup. Belum ada fitur bayar. Belum publik luas.

### Tabel Rincian F2

| # | Item | Wajib/Opsional | Biaya | Frekuensi | Keterangan |
|---|------|----------------|-------|-----------|------------|
| 1 | Domain (`.id` / `.com`) | Sangat disarankan | Rp 150.000 – 350.000 | Per tahun | Privacy policy, branding, API nanti |
| 2 | Google Play Console | Wajib (jika via Play Store) | **$25 USD** (~Rp 400.000) | Sekali bayar | Internal testing track, max 100 tester |
| 3 | VPS Jakarta (SFU/MQTT) | Opsional di F2 | Rp 270.000 – 500.000 | Per bulan | Bisa ditunda jika masih WebRTC P2P |
| 4 | Supabase | Wajib | $0 (Free) | Per bulan | Free tier cukup untuk beta kecil |
| 5 | Supabase Pro | Opsional | ~Rp 400.000 ($25) | Per bulan | Jika user beta >100 atau butuh lebih banyak resource |
| 6 | Firebase (FCM) | Wajib (Tahap 1) | **Rp 0** | — | Spark plan gratis |
| 7 | Metered.ca (TURN) | Sangat disarankan | **Rp 0** (free tier) | Per bulan | ~50 GB/bulan gratis; cukup beta |
| 8 | Google Cloud (OAuth) | Wajib | **Rp 0** | — | OAuth login gratis |
| 9 | GitHub | Wajib | **Rp 0** | — | Private repo gratis |
| 10 | Cloudflare DNS | Opsional | **Rp 0** | — | DNS management gratis |
| 11 | Email bisnis (Google Workspace) | Opsional | ~Rp 150.000 | Per bulan | `hello@domain-anda.com` |
| 12 | Password manager (Bitwarden) | Disarankan | **Rp 0** | — | Free tier cukup |

### Skenario Total F2

#### Skenario A — Minimal (budget ketat)

| Item | Biaya |
|------|-------|
| Domain 1 tahun | Rp 250.000 |
| Play Console | Rp 400.000 |
| Layanan gratis (Supabase, Firebase, TURN, GitHub) | Rp 0 |
| **Total F2 Minimal** | **~Rp 650.000** |

> APK bisa didistribusi manual (file APK) tanpa Play Console — hemat $25, tapi kurang praktis untuk tester.

#### Skenario B — Standar (disarankan)

| Item | Biaya |
|------|-------|
| Domain 1 tahun | Rp 250.000 |
| Play Console | Rp 400.000 |
| VPS 2 bulan (SFU PoC) | Rp 600.000 |
| Supabase Free | Rp 0 |
| Firebase + TURN free | Rp 0 |
| **Total F2 Standar** | **~Rp 1.250.000** |

#### Skenario C — Lengkap

| Item | Biaya |
|------|-------|
| Domain 1 tahun | Rp 300.000 |
| Play Console | Rp 400.000 |
| VPS 3 bulan | Rp 900.000 |
| Supabase Pro 2 bulan | Rp 800.000 |
| Email bisnis 2 bulan | Rp 300.000 |
| **Total F2 Lengkap** | **~Rp 2.700.000** |

---

## FASE 3 — Monetisasi (Bulan 3–6)

**Tujuan:** Buka fitur topup koin via QRIS. User bisa bayar untuk donasi channel, badge, tema premium.

**Tanda `+` = ditambah ke biaya F2.**

### Tabel Rincian F3

| # | Item | Wajib/Opsional | Biaya | Frekuensi | Keterangan |
|---|------|----------------|-------|-----------|------------|
| 1 | Pendirian CV | Opsional | Rp 2.000.000 – 5.000.000 | Sekali | Memudahkan KYC merchant; bisa perorangan dulu |
| 2 | Pendirian PT | Opsional | Rp 5.000.000 – 15.000.000 | Sekali | Untuk skala lebih besar / investor |
| 3 | Konsultasi hukum (koin utilitas) | **Sangat disarankan** | Rp 2.000.000 – 5.000.000 | Sekali | Pastikan koin bukan e-money ilegal (regulasi BI) |
| 4 | Review Privacy Policy & ToS | Opsional | Rp 500.000 – 2.000.000 | Sekali | Update dokumen legal untuk payment |
| 5 | Daftar merchant Midtrans | Wajib (jika QRIS) | **Rp 0** setup | — | KYC 3–14 hari kerja |
| 6 | Daftar merchant Xendit | Alternatif | **Rp 0** setup | — | Sama seperti Midtrans |
| 7 | Fee transaksi gateway | Variabel | **1,5% – 2,5%** | Per transaksi | Bukan biaya bulanan; contoh: topup Rp 10.000 → fee ~Rp 200 |
| 8 | Rekening bank bisnis | Wajib (merchant) | Rp 0 – 500.000 | Sekali | Biaya administrasi buka rekening perusahaan |

### Dokumen KYC Payment Gateway (Anda siapkan)

| Dokumen | Perorangan | CV/PT |
|---------|:----------:|:-----:|
| KTP | ✅ | ✅ |
| NPWP | ✅ | ✅ NPWP perusahaan |
| NIB (OSS) | ✅ | ✅ |
| Akta + SK Kemenkumham | — | ✅ |
| Rekening bank | ✅ | ✅ rekening perusahaan |
| Privacy policy URL | ✅ | ✅ |

### Skenario Total F3 (ditambah ke F2)

#### Skenario A — Minimal (perorangan, tanpa CV)

| Item | Biaya |
|------|-------|
| Konsultasi hukum 1 sesi | Rp 2.000.000 |
| Merchant Midtrans (setup) | Rp 0 |
| **Tambahan F3** | **~Rp 2.000.000** |
| **Total kumulatif F2+F3** | **~Rp 2,7 – 5 juta** |

#### Skenario B — Standar (CV + legal)

| Item | Biaya |
|------|-------|
| Pendirian CV | Rp 4.000.000 |
| Konsultasi hukum | Rp 3.000.000 |
| Review dokumen legal | Rp 1.000.000 |
| **Tambahan F3** | **~Rp 8.000.000** |
| **Total kumulatif F2+F3** | **~Rp 9 – 11 juta** |

#### Skenario C — Lengkap (PT + legal penuh)

| Item | Biaya |
|------|-------|
| Pendirian PT | Rp 10.000.000 |
| Konsultasi hukum | Rp 5.000.000 |
| Review + drafting ToS | Rp 2.000.000 |
| **Tambahan F3** | **~Rp 17.000.000** |
| **Total kumulatif F2+F3** | **~Rp 18 – 20 juta** |

### Contoh Fee Transaksi (Bukan Biaya Awal)

| Topup user | Fee 2% (Midtrans) | Anda terima bersih |
|------------|-------------------|-------------------|
| Rp 5.000 | Rp 100 | Rp 4.900 |
| Rp 10.000 | Rp 200 | Rp 9.800 |
| Rp 50.000 | Rp 1.000 | Rp 49.000 |
| Rp 100.000 | Rp 2.000 | Rp 98.000 |

> Fee transaksi **tidak dibayar di muka** — otomatis dipotong setiap kali user topup.

---

## FASE 4 — Pilot Lapangan (Bulan 6–12)

**Tujuan:** Uji coba dengan komunitas sungguhan (ojol, satpam, relawan, radio). Server production + opsional ROIP.

**Tanda `+` = ditambah ke biaya F2 + F3.**

### Tabel Rincian F4

| # | Item | Wajib/Opsional | Biaya | Frekuensi | Keterangan |
|---|------|----------------|-------|-----------|------------|
| 1 | VPS production Jakarta (4C/8GB) | Wajib (channel ramai) | Rp 270.000 – 500.000 | Per bulan | SFU + MQTT — lihat [Spesifikasi VPS](./Spesifikasi_Infrastruktur_VPS_NextVWT.md) |
| 2 | VPS signal node (2C/4GB) | Opsional | Rp 139.000 – 250.000 | Per bulan | Pisah MQTT dari media server |
| 3 | Snapshot / backup VPS | Disarankan | Rp 50.000 – 100.000 | Per bulan | Tergantung provider |
| 4 | Perpanjangan domain | Wajib | Rp 150.000 – 350.000 | Per tahun | Tahun ke-2 |
| 5 | Raspberry Pi 4 (ROIP gateway) | Opsional | Rp 800.000 – 1.200.000 | Sekali | Hanya jika ada mitra radio ORARI |
| 6 | Kit audio + PTT optocoupler | Opsional | Rp 200.000 – 500.000 | Sekali | Interface ke radio HT |
| 7 | Kabel, power supply, case | Opsional | Rp 100.000 – 300.000 | Sekali | Kelengkapan hardware ROIP |
| 8 | Biaya operasional pilot | Disarankan | Rp 500.000 – 5.000.000 | Selama pilot | Hadiah tester, transport, pulsa, dll. |
| 9 | MoU / legal mitra ROIP | Opsional | Rp 500.000 – 2.000.000 | Sekali | Review notaris |
| 10 | Supabase Pro | Opsional | ~Rp 400.000 | Per bulan | Jika user >100 aktif |

### Skenario Total F4 (ditambah ke F2 + F3)

#### Skenario A — Tanpa ROIP (komunitas digital saja)

| Item | Biaya (6 bulan) |
|------|-----------------|
| VPS production 6 bulan | Rp 1.800.000 |
| Operasional komunitas pilot | Rp 2.000.000 |
| Perpanjangan domain | Rp 250.000 |
| **Tambahan F4** | **~Rp 4.050.000** |
| **Total kumulatif F2+F3+F4** | **~Rp 7 – 15 juta** |

#### Skenario B — Dengan VPS ganda + operasional aktif

| Item | Biaya (6 bulan) |
|------|-----------------|
| VPS media 6 bulan | Rp 2.400.000 |
| VPS signal 6 bulan | Rp 900.000 |
| Operasional pilot | Rp 3.000.000 |
| Supabase Pro 6 bulan | Rp 2.400.000 |
| Domain + backup | Rp 500.000 |
| **Tambahan F4** | **~Rp 9.200.000** |
| **Total kumulatif F2+F3+F4** | **~Rp 12 – 20 juta** |

#### Skenario C — Lengkap dengan ROIP

| Item | Biaya (6 bulan) |
|------|-----------------|
| VPS production 6 bulan | Rp 3.000.000 |
| Hardware ROIP (Pi + kit) | Rp 1.500.000 |
| Operasional + komunitas | Rp 5.000.000 |
| Legal MoU mitra ORARI | Rp 1.000.000 |
| Supabase Pro 6 bulan | Rp 2.400.000 |
| **Tambahan F4** | **~Rp 12.900.000** |
| **Total kumulatif F2+F3+F4** | **~Rp 18 – 33 juta** |

---

## Tabel Kumulatif — Total dari Nol

| Skenario | F2 | + F3 | + F4 | **Total 12 Bulan** |
|----------|-----|------|------|---------------------|
| **Minimal** | Rp 650rb | Rp 2 jt | Rp 4 jt | **~Rp 7 juta** |
| **Standar** | Rp 1,25 jt | Rp 8 jt | Rp 9 jt | **~Rp 18 juta** |
| **Lengkap** | Rp 2,7 jt | Rp 17 jt | Rp 13 jt | **~Rp 33 juta** |

```text
Minimal  ████░░░░░░░░░░░░░░░░  ~Rp  7 juta
Standar  ██████████░░░░░░░░░░  ~Rp 18 juta
Lengkap  ████████████████████  ~Rp 33 juta
```

---

## Biaya Bulanan Berjalan (Setelah Semua Fase Aktif)

Setelah F4 berjalan, ini biaya **recurring** yang perlu Anda siapkan setiap bulan:

| Item | Biaya/bulan | Wajib? |
|------|-------------|--------|
| VPS production | Rp 300.000 – 500.000 | ✅ |
| Supabase Pro | Rp 400.000 | Jika >100 user |
| Domain (amortisasi) | ~Rp 25.000 | ✅ |
| Metered TURN (overage) | Rp 0 – 200.000 | Jika lewat free tier |
| Email bisnis | Rp 150.000 | Opsional |
| Fee transaksi | Variabel | Hanya jika ada topup |
| **Total fixed/bulan** | **~Rp 500.000 – 1.300.000** | |

> Belum termasuk gaji tim, marketing, atau support.

---

## Yang GRATIS (Tidak Perlu Dibayar di Awal)

| Layanan | Free Tier | Cukup untuk |
|---------|-----------|-------------|
| Supabase | 500 MB DB, 50K MAU | Beta <100 user |
| Firebase FCM | Unlimited push (Spark) | Background wakeup |
| Metered.ca TURN | ~50 GB/bulan | Beta PTT |
| Google OAuth | Unlimited | Login |
| GitHub | Private repo | Source code |
| Cloudflare DNS | Unlimited records | Domain management |
| Bitwarden | 1 user | Credential vault |

---

## Yang TIDAK Termasuk dalam Anggaran Ini

| Item | Perkiraan | Keterangan |
|------|-----------|------------|
| Gaji developer | Rp 5 – 30 juta/bulan | Tergantung skill & kontrak |
| Designer UI/UX | Rp 2 – 10 juta/proyek | Jika komisioner |
| Iklan & marketing | Rp 1 – 50 juta/bulan | Google Ads, sosmed, influencer |
| Apple Developer (iOS) | $99/tahun (~Rp 1,6 jt) | Fase F5 (tahun 2) |
| Pentest keamanan | Rp 10 – 50 juta | Sebelum enterprise |
| Pajak penghasilan | Variabel | Konsultasi akuntan |

---

## Rekomendasi Budget Berdasarkan Kondisi Anda

| Kondisi Anda | Mulai dengan | Target fase |
|--------------|--------------|-------------|
| Budget < Rp 1 juta | F2 minimal (domain saja, APK manual) | Beta 5–10 orang |
| Budget Rp 1–2 juta | F2 standar (domain + Play Console) | Beta 10–30 orang |
| Budget Rp 5 juta | F2 lengkap + mulai legal F3 | Beta + siap monetisasi |
| Budget Rp 10 juta+ | F2 + F3 standar | Beta + QRIS aktif |
| Budget Rp 20 juta+ | F2 + F3 + F4 | Pilot lapangan penuh |

---

## Checklist Pembayaran per Fase

### F2 — Centang saat sudah dibayar

```
□ Domain tahun ke-1
□ Google Play Console ($25)
□ VPS bulan 1 (jika dipakai)
□ VPS bulan 2 (jika dipakai)
```

### F3 — Centang saat sudah dibayar

```
□ Konsultasi hukum
□ Pendirian CV/PT (jika dipilih)
□ Review Privacy Policy
□ Merchant Midtrans/Xendit approved (gratis setup)
```

### F4 — Centang saat sudah dibayar

```
□ VPS production (per bulan, 6x)
□ Hardware ROIP (jika dipakai)
□ Operasional komunitas pilot
□ Perpanjangan domain tahun ke-2
```

---

## Catatan Kurs

Perhitungan USD → IDR menggunakan perkiraan:

| Mata uang | Nilai taksir (Juni 2026) |
|-----------|--------------------------|
| $1 USD | ~Rp 16.000 |
| $25 USD (Play Console) | ~Rp 400.000 |
| $99 USD (Apple Developer) | ~Rp 1.600.000 |

> Perbarui kurs saat pembayaran aktual.

---

*NextVWT Rincian Biaya Owner v1.0 · 9 Juni 2026*  
*Perbarui dokumen ini setiap kali ada perubahan harga provider atau keputusan budget.*
