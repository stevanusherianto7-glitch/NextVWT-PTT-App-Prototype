# Product Requirements Document (PRD)
# NextVWT — Virtual Walkie-Talkie PTT App

| | |
|---|---|
| **Versi Dokumen** | 3.0 |
| **Status** | Pre-Beta — Rekonsiliasi Strategi & Prototipe |
| **Diperbarui** | 9 Juni 2026 |
| **Platform Target** | Android (iOS roadmap Q3 2027) |
| **Skor Prototipe Saat Ini** | 92 / 100 *(audit v4 — fitur yang sudah ada)* |
| **Keselarasan Strategi 24 Bulan** | ~35–40% *(Tahap 1 fondasi)* |

**Dokumen induk terkait:**
- [Implementasi wajib nextvwt.md](./Implementasi%20wajib%20nextvwt.md) — arsitektur target, roadmap 0–24 bulan, KPI, template codebase
- [NextVWT_PTT_Audit_Report_v4.md](./NextVWT_PTT_Audit_Report_v4.md) — audit teknis iterasi ke-4
- [NextVWT_PRD.md](./NextVWT_PRD.md) — PRD v2.0 (arsitektur prototipe saat ini)

---

## 0. Ringkasan Eksekutif

PRD v3.0 merekonsiliasi tiga sumber kebenaran produk:

1. **PRD v2.0** — status fitur prototipe yang sudah berjalan (WebRTC P2P + Supabase Realtime + moderasi 5 level).
2. **Implementasi wajib nextvwt.md** — visi platform komunikasi lapangan Indonesia (MQTT + SFU + FCM + payment lokal + ROIP).
3. **Audit v4** — temuan keamanan, debt teknis, dan checklist kesiapan beta.

**Keputusan produk inti:** NextVWT tidak lagi didefinisikan hanya sebagai "walkie-talkie digital", melainkan sebagai **platform komunikasi hybrid nasional** untuk pekerja lapangan, komunitas, dan instansi — dengan monetisasi non-destruktif (koin utilitas, donasi channel, enterprise).

**Keputusan arsitektur inti:** Pengembangan berjalan dalam **dua fase** (lihat §4). Fase A mempertahankan stack prototipe yang stabil; Fase B mengadopsi arsitektur target secara bertahap tanpa menghentikan rilis beta.

---

## 1. Deskripsi Produk & Visi

**NextVWT (Next Virtual Walkie-Talkie)** adalah aplikasi komunikasi Push-to-Talk berbasis internet yang menghadirkan pengalaman walkie-talkie fisik dalam aplikasi Android. Pengguna bergabung ke channel bernomor, berbicara real-time, dan menikmati antarmuka walkie-talkie skeuomorfik dengan 8 tema visual premium.

### Proposisi Nilai

> *"Walkie-talkie profesional di saku Anda — tangguh di jalanan Indonesia, tanpa frekuensi radio, tanpa jarak batas."*

### Positioning Pasar Indonesia

Karakteristik pasar menuntut aplikasi yang:

- Tangguh di ponsel kelas menengah (low-to-mid end)
- Hemat kuota data dan tidak menguras baterai drastis
- Stabil di jaringan seluler fluktuatif (urban & rural)
- Bebas iklan interstitial yang mengganggu komunikasi darurat
- Mendukung monetisasi mikrotransaksi lokal dan infrastruktur enterprise

### Diferensiasi Kompetitif

| Aspek | Kompetitor Global | Aplikasi Lokal | NextVWT (Target) |
|-------|-------------------|----------------|------------------|
| Background survival Android | Lemah | Bervariasi | FGS + FCM + panduan vendor |
| Noise cancellation lapangan | Generik | Minimal | 5 mode adaptif + RNNoise |
| Pembayaran lokal | Tidak ada | Terbatas | QRIS + koin utilitas |
| Radio analog bridge | Tidak ada | Tidak ada | ROIP legal-by-design |
| Moderasi suara | Minimal | Manual | 5 level + trust score + laporan audio |

---

## 2. Target Pengguna & Persona

### Persona Existing (PRD v2.0)

| Persona | Segmen | Kebutuhan Utama |
|---------|--------|----------------|
| Pebe — Ketua Komunitas Motor | Komunitas, 25–40 th | PTT group, channel tetap, haptic |
| Pak Rudi — Koordinator Siskamling | Keamanan warga, 40–55 th | Mudah dipakai, 1 tombol tekan |
| Dewi — Panitia Event Musik | Profesional event, 25–35 th | Audio kualitas tinggi, karaoke mode |
| Hendra — Penghobi Radio Amatir | Hobbyist, 30–45 th | Callsign, LCD realistis, channel scan |

### Persona Baru (Implementasi Wajib)

| Persona | Segmen | Kebutuhan Utama | Prioritas Fitur |
|---------|--------|-----------------|-----------------|
| Andi — Driver Ojol | Gig economy, 20–35 th | PTT saat berkendara, noise motor, background siaga | Mode Ojol, FGS, latensi rendah |
| Siti — Kurir Logistik | Logistik, 22–40 th | Koordinasi tim gudang, hemat kuota | Codec adaptif, presence |
| Bambang — Relawan SAR | Bencana/SAR, 25–55 th | Prioritas darurat, jaringan buruk | Emergency override, Codec2 fallback |
| Joko — Satpam/Koordinator Lapangan | Keamanan swasta, 30–50 th | Floor control ketat, audit log | Floor arbitrator, moderasi |
| Rina — Admin Komunitas Radio | ORARI/RAPI, 35–60 th | Bridge analog-digital legal | ROIP Monitor Only, IAR gatekeeping |

---

## 3. Arsitektur Sistem — Dua Fase

### 3.1 Fase A — Prototipe Saat Ini (Baseline, Q2–Q3 2026)

Arsitektur yang **sudah berjalan** di codebase:

```text
[Client Capacitor/WebView]
        │
        ├── Signaling & Presence ──► Supabase Realtime (broadcast + presence)
        ├── Floor Control ─────────► Cooperative client-side (ptt_state, activeTransmitter)
        ├── Media ─────────────────► WebRTC P2P mesh (RTCPeerConnection per peer)
        ├── Fallback Audio ────────► Supabase Realtime base64 chunks
        ├── TURN ──────────────────► Edge Function turn-credentials (Metered/Twilio/Static)
        └── Auth ──────────────────► Supabase Auth (Google OAuth + Guest UUID)
```

**Keterbatasan Fase A yang harus diakui di PRD:**
- Floor control tidak authoritative — tabrakan PTT simultan masih mungkin
- P2P mesh tidak skalabel untuk channel >5–8 user aktif
- Tidak ada survival background Android (Doze mematikan koneksi)
- Noise cancellation = constraint browser + VAD, bukan pipeline AI

### 3.2 Fase B — Arsitektur Target (Q3 2026 – Q2 2028)

Arsitektur yang **didefinisikan** di Implementasi Wajib:

```text
[Client Android Native/Capacitor]
        │
        ├── Signaling Plane ───────► MQTT over TLS :8883 (presence, metadata, floor control)
        ├── Media Plane ───────────► WebRTC SFU (Janus / Mediasoup / Pion) + SRTP
        ├── Push Plane ────────────► FCM high-priority wakeup + WorkManager
        ├── Payment Plane ─────────► Node/Edge webhook + ledger koin (QRIS)
        └── ROIP Plane ────────────► Bridge server + gateway hardware (GPIO/TOT/COR)
```

**Pemisahan tanggung jawab:**

| Plane | Protokol | Fungsi |
|-------|----------|--------|
| Signaling | MQTT TLS | Presence, channel switch, `REQUEST_FLOOR` / `RELEASE_FLOOR` |
| Media | WebRTC SFU | Audio real-time, Opus default, Codec2 fallback |
| Push | FCM | Wakeup dari deep sleep, transmisi darurat |
| Payment | HTTPS + HMAC webhook | Topup koin, donasi channel |
| ROIP | WebRTC + MQTT + GPIO | Bridge radio analog VHF/UHF |

### 3.3 Architecture Decision Records (ADR)

| ID | Keputusan | Status | Alasan |
|----|-----------|--------|--------|
| ADR-001 | Floor arbitrator pertama via **Supabase Edge Function**, MQTT menyusul | **Disetujui** | Minimalkan risiko migrasi besar; validasi server-side segera |
| ADR-002 | SFU diwajibkan saat channel >8 listener simultan | **Disetujui** | P2P mesh O(n²) tidak layak skala |
| ADR-003 | Pertahankan Supabase untuk auth, DB, moderasi | **Disetujui** | Investasi moderasi v4 tidak dibuang |
| ADR-004 | Codec2 fallback ditunda ke Tahap 4 (12–24 bln) | **Disetujui** | Kompleksitas native binding tinggi; Opus + TURN cukup untuk beta |
| ADR-005 | ROIP sebagai produk gateway terpisah, bukan fitur in-app penuh | **Proposed** | Hardware + regulasi Kemenkomdigi memerlukan tim khusus |
| ADR-006 | Koin utilitas = ledger tertutup, **bukan e-money BI** | **Disetujui** | Compliance regulasi pembayaran |
| ADR-007 | RNNoise via WASM di Fase B awal; JNI native menyusul | **Proposed** | Lebih cepat di Capacitor WebView |

---

## 4. Fitur yang Sudah Diimplementasikan (Baseline v4)

> Inventaris ini disalin dari PRD v2.0 dan diverifikasi audit v4. Checkbox `[x]` = ada di codebase runtime.

### 4.1 Core PTT
- [x] Push-to-Talk real-time via WebRTC P2P
- [x] Fallback audio via Supabase Realtime (base64)
- [x] VAD (Voice Activity Detection) — auto-mute saat silence (`useVAD.ts`)
- [x] Half-duplex dengan busy indicator (cooperative, bukan server-arbitrated)
- [x] Full-duplex mode (opsional)
- [x] Toggle vs Push-hold mode
- [x] Roger beep + squelch tail + pre-chirp sound design
- [x] Haptic feedback
- [x] Rate limiter PTT & broadcast (`rateLimit.ts`)

### 4.2 Channel Management
- [x] Channel 0–999 dengan navigation
- [x] Presence tracking (user aktif per channel)
- [x] Channel scan
- [x] Channel list modal
- [x] User list modal

### 4.3 Audio Engine (Fase A)
- [x] WebRTC P2P + fallback base64
- [x] TURN server multi-provider (Metered, Twilio, Static)
- [x] Discussion mode (browser echo cancel + noise suppress)
- [x] Music/Karaoke mode (stereo Opus 128kbps)
- [x] Built-in echo/reverb effect
- [x] Progress bar dari RMS analyzer

### 4.4 Sistem Moderasi 5 Level
- [x] Permissions engine (`canModerateRole`, `canPerformAction`, `canUsePTT`, `canUseChat`, `canUseReaction`)
- [x] 24 unit tests permissions
- [x] `useChannelRole` — real-time via Postgres Changes
- [x] `useChannelSettings` — 15+ konfigurasi per channel
- [x] `useModerationActions` — mute, block, kick, ban, setRole
- [x] `ChannelManagePanel`, `ChannelMemberList`, `ChannelSettingsPanel`, `ModerationLogPanel`
- [x] Database schema + migrasi (`20260608201500_create_moderation_tables.sql`)
- [x] Enforce mute pada transmisi (`RadioLayout.tsx`)
- [x] Kick via realtime broadcast + listener
- [x] `member` role + `member_max_ptt_seconds` di settings

### 4.5 UX & Visual
- [x] 8 tema visual CSS (classic, v1–v6, monokrom)
- [x] LCD panel dengan font DSEG7
- [x] Karaoke player floating (`FloatingKaraokePlayer.tsx`)
- [x] Error Boundary
- [x] Skeleton loading
- [x] Animasi micro-interaction
- [ ] `themeCatalog.ts` sinkron 8 tema *(audit V4-05: hanya 3 terdaftar)*

### 4.6 Infrastruktur
- [x] Android Capacitor 8
- [x] Certificate pinning (SHA-256, expiry 2028)
- [x] CI/CD pipeline (GitHub Actions + Android signing)
- [x] Store Zustand 5 slices + `storeUtils.ts` (circular import resolved)
- [x] Google OAuth + Guest login (UUID unik)
- [x] `FOREGROUND_SERVICE` permission declared *(service belum diimplementasi)*
- [x] Rate limiter TURN persistent (`turn_rate_limits` tabel)

### 4.7 Entertainment (Partial)
- [x] Karaoke / music mode audio
- [x] Floating karaoke player (YouTube embed)
- [x] E2E test karaoke+PTT (`e2e/karaoke-ptt.spec.ts`)
- [ ] Karaoke queue — types only (`src/features/karaoke-queue/types.ts`)
- [ ] Song request — types only
- [ ] Lottie reactions — types only
- [ ] Chat room — types only
- [ ] Smart presence — types only

---

## 5. Gap Analysis — Pilar Strategis vs Codebase

| Pilar | Target (Implementasi Wajib) | Status | Kematangan |
|-------|----------------------------|--------|------------|
| Android background survival | FGS mikrofon + FCM + keep-alive adaptif | PARTIAL | ~10% |
| AI noise cancellation | VAD→HPF→AGC→RNNoise→5 mode | PARTIAL | ~25% |
| Payment / wallet koin | QRIS + webhook HMAC + ledger | NOT STARTED | 0% |
| ROIP bridge | GPIO, TOT, COR, legal gatekeeping | NOT STARTED | 0% |
| Floor control authoritative | MQTT + priority queue + emergency | PARTIAL | ~15% |
| Arsitektur MQTT+SFU+FCM | Pemisahan 3 plane | PARTIAL | ~35% |
| Moderasi komunitas | Roles + trust score + audio report | PARTIAL | ~70% |
| Entertainment | Queue, chat, reactions, presence | PARTIAL | ~30% |

---

## 6. Backlog Produk — Roadmap Terintegrasi

### 6.1 Blok A — Blocker & Keamanan (Minggu 1–2) 🔴

> Sumber: Audit v4 temuan KRITIS + V4-01 s/d V4-04. **Wajib sebelum beta publik.**

| ID | Item | Estimasi | Referensi Audit |
|----|------|----------|-----------------|
| SEC-01 | Rotasi credential Supabase + Google OAuth | 90 menit | KRITIS-01 |
| SEC-02 | Hapus `.env` dari git history (BFG) | 30 menit | KRITIS-01 |
| SEC-03 | Perbaiki RLS moderasi → `service_role` only untuk write | 2 jam | V4-01 |
| SEC-04 | Edge Function `moderate-channel` — validasi server-side | 8 jam | V4-01, rekomendasi audit |
| SEC-05 | Hapus auto-assign PJC via nama "pawon salam" | 30 menit | V4-02 |
| SEC-06 | Validasi `room_id` terdaftar sebelum bootstrap PJC | 1 jam | V4-03 |
| SEC-07 | Perbaiki CORS wildcard di Edge Function TURN | 1 jam | V4-04 |
| SEC-08 | Seed minimal 1 channel + akun NOC manual via Dashboard | 1 jam | Checklist beta |

**Acceptance Criteria Blok A:**
- Tidak ada credential aktif di git history
- Tamu anonim tidak bisa INSERT/UPDATE/DELETE tabel moderasi via REST API langsung
- Semua aksi moderasi write melewati Edge Function dengan audit log

### 6.2 Tahap 1 — Fondasi Stabilitas (Bulan 0–3)

> Sumber: Implementasi Wajib §8 Tahap 1 + gap audit.

| ID | Item | Prioritas | KPI Terkait |
|----|------|-----------|-------------|
| T1-01 | Android Foreground Service (`MICROPHONE` + `DATA_SYNC`) + notifikasi "Siaga Channel" | P0 | Background survival >98.5% |
| T1-02 | Integrasi FCM high-priority + WorkManager wakeup | P0 | Background survival |
| T1-03 | UI panduan battery optimization per vendor (Xiaomi/Oppo/Samsung/Vivo) | P1 | Background survival |
| T1-04 | Floor Arbitrator server-side (Edge Function, token grant/deny) | P0 | Latensi + collision-free PTT |
| T1-05 | Antrean floor control + feedback "Menunggu Giliran" | P1 | UX half-duplex |
| T1-06 | Emergency override token (role NOC/komando bencana) | P1 | Prioritas darurat |
| T1-07 | Proof-of-concept WebRTC SFU untuk channel >8 user | P1 | Skalabilitas |
| T1-08 | Instrumentasi metrik: latensi PTT E2E, startup, crash, baterai idle | P0 | Semua KPI |
| T1-09 | Audio report buffer 15 detik + endpoint laporan pelanggaran | P1 | Moderasi §7 |
| T1-10 | Sinkronisasi `themeCatalog.ts` dengan 8 tema CSS | P2 | V4-05 |
| T1-11 | Migration entertainment SQL lengkap (bukan stub) | P1 | V3-01 |

**Acceptance Criteria Tahap 1:**
- Latensi PTT E2E <400 ms di 4G/Wi-Fi (terukur, bukan estimasi)
- App survival >98.5% setelah layar kunci 2 jam (uji 5 merek utama)
- Konsumsi baterai idle <1.5%/jam
- Tidak ada tabrakan PTT simultan pada channel dengan floor arbitrator aktif

### 6.3 Tahap 2 — Diferensiasi Produk & Finansial (Bulan 3–6)

| ID | Item | Prioritas |
|----|------|-----------|
| T2-01 | Integrasi RNNoise (WASM) — versi awal noise suppression | P0 |
| T2-02 | Mode peredam: Normal, Ojol/Jalan Raya, Hujan/Angin | P1 |
| T2-03 | Mode Keramaian + Mode Darurat (Emergency) | P2 |
| T2-04 | Custom HPF <150 Hz pada mic path | P2 |
| T2-05 | Ledger koin utilitas (migration SQL ACID) | P0 |
| T2-06 | Integrasi Payment Gateway lokal (QRIS Dinamis) | P0 |
| T2-07 | Edge Function `payment-webhook` + verifikasi HMAC-SHA256 | P0 |
| T2-08 | UI topup koin + donasi channel | P1 |
| T2-09 | Badge VIP / item kosmetik digital (tema, pin) | P2 |
| T2-10 | Trust score global + enforcement lintas channel | P1 |
| T2-11 | Entertainment Phase 1: Chat room real-time | P1 |
| T2-12 | Entertainment Phase 1: Lottie reactions (6 tipe) | P2 |
| T2-13 | Smart presence (8 status) | P2 |

**Acceptance Criteria Tahap 2:**
- Payment webhook success rate >99.9%, processing <2 detik
- Mode Ojol terukur mengurangi noise motor pada sample audio benchmark
- Trust score menurunkan akses otomatis setelah 3 laporan valid

### 6.4 Tahap 3 — Ekosistem ROIP & Penetrasi Lapangan (Bulan 6–12)

| ID | Item | Prioritas |
|----|------|-----------|
| T3-01 | ROIP Bridge Mode Monitor Only (Rx Only) | P0 |
| T3-02 | ROIP Mode Two-Way Controlled (role-gated PTT ke radio fisik) | P1 |
| T3-03 | Upload & verifikasi dokumen IAR/IKR (legal gatekeeping) | P0 |
| T3-04 | TOT 60 detik + COR busy detection + audit trail ROIP | P0 |
| T3-05 | Gateway software untuk Raspberry Pi / Orange Pi | P1 |
| T3-06 | Pilot project: komunitas relawan, ojol, satpam | P1 |
| T3-07 | Optimasi konsumsi baterai per vendor ponsel | P1 |
| T3-08 | Karaoke queue + song request + voting UI | P2 |
| T3-09 | Migrasi signaling ke MQTT (ganti Supabase broadcast) | P1 |

### 6.5 Tahap 4 — Skalabilitas Nasional & Enterprise (Bulan 12–24)

| ID | Item | Prioritas |
|----|------|-----------|
| T4-01 | Deployment server multi-region Indonesia (latensi <100 ms) | P0 |
| T4-02 | Codec2 native binding + fallback otomatis (packet loss >40%) | P1 |
| T4-03 | ROIP Emergency Bridge mode (SAR/bencana) | P1 |
| T4-04 | Enterprise Fleet Management dashboard | P1 |
| T4-05 | Dashboard operator korporat | P2 |
| T4-06 | API terbuka integrasi PTT perangkat keras / HT Android | P2 |
| T4-07 | Admin Panel global (NOC & Sys Admin) | P1 |
| T4-08 | iOS Capacitor version | P2 |
| T4-09 | Play Store listing + compliance review | P1 |
| T4-10 | End-to-end enkripsi audio (opsional enterprise) | P3 |

---

## 7. Spesifikasi Fungsional Detail (Pilar Strategis)

### 7.1 Floor Control & Prioritas Bicara

**Behavior wajib (Fase B / Tahap 1 implementasi awal via Edge Function):**

1. Client kirim `REQUEST_FLOOR` → server cek `FLOOR_STATUS_FREE`
2. Jika kosong → `FLOOR_GRANTED`, kunci channel atas user tersebut
3. Jika sibuk → `FLOOR_DENIED` + masuk `FLOOR_QUEUE` + UI "Menunggu Giliran"
4. `RELEASE_FLOOR` → lepas kunci → grant ke user berikutnya di antrean

**Hierarki prioritas:**

| Rank | Role | Hak |
|------|------|-----|
| 1 | Emergency Override | Potong siapapun yang sedang bicara |
| 2 | Channel Owner | Prioritas setelah emergency |
| 3 | Admin & Operator | Pengelola harian |
| 4 | Verified Member | Anggota terverifikasi / berlangganan |
| 5 | Guest | Tanpa prioritas; cooldown antar-PTT |

**Mapping ke moderasi existing:** `noc` / `sys_admin` → emergency-capable; `pjc` → owner-equivalent per channel; `operator` → operator; `member` → verified; `guest` → guest.

### 7.2 Pipeline Audio Target

```text
Mikrofon → VAD → HPF (<150Hz) → AGC → RNNoise → AEC → Opus/Codec2 → SFU
```

**5 mode adaptif:** Normal · Ojol/Jalan Raya · Hujan/Angin · Keramaian · Darurat (agresif, intelligibility > naturalness).

### 7.3 Wallet Koin Utilitas

- Unit: **Koin** (bukan rupiah, bukan e-money independen)
- Use case: donasi channel, badge, pin, tema premium, aktivasi VIP
- Alur: App → create invoice → QRIS → webhook HMAC → kredit ledger → notifikasi app
- Audit: setiap transaksi tercatat; webhook gagal signature → reject + security log

### 7.4 ROIP Bridge

| Mode | Arah | Siapa Bisa TX ke Radio Fisik |
|------|------|------------------------------|
| Monitor Only | Analog → Digital | Tidak ada (Rx only) |
| Two-Way Controlled | Dua arah | Admin, Operator, instansi terverifikasi |
| Emergency Bridge | Fully bridged | Komando pusat (manual activation) |

**Safeguard wajib:** IAR/IKR verified · TOT 60s · COR busy check · audit trail per transmisi.

### 7.5 Moderasi & Trust

**Sudah ada:** mute, kick, ban, block PTT/chat, moderation logs, 15+ channel settings.

**Belum ada (wajib Tahap 1–2):**
- Rolling audio buffer 15 detik terenkripsi untuk laporan
- Trust score global (turun otomatis setelah mute/report valid lintas channel)
- Ban berdasarkan device fingerprint + IP (selain user_id)
- Server-side enforcement 100% (bukan hanya client `permissions.ts`)

---

## 8. Non-Functional Requirements & KPI

### 8.1 Metrik Produk (Merged PRD v2 + Implementasi Wajib)

| Metrik | Target PRD v3 | Sumber | Status |
|--------|---------------|--------|--------|
| Audio latency E2E | **<400 ms** (4G/Wi-Fi normal) | Implementasi Wajib §9 | 🟡 Belum diukur |
| Audio latency aspirational | <300 ms | PRD v2 | 🟡 Stretch goal |
| Background survival rate | **>98.5%** (layar kunci >2 jam) | Implementasi Wajib §9 | 🔴 FGS belum ada |
| Baterai idle | **<1.5%/jam** | Implementasi Wajib §9 | 🔴 Belum diukur |
| Payment webhook success | **>99.9%**, processing **<2 detik** | Implementasi Wajib §9 | ⬜ N/A |
| ROIP TOT compliance | **100%** auto-shutdown di 60s | Implementasi Wajib §9 | ⬜ N/A |
| Crash rate | <0.5% per sesi | PRD v2 | ✅ Error Boundary |
| App startup time | <3 detik | PRD v2 | 🟡 Belum diukur |
| Bundle size (initial) | <500 KB gzip | PRD v2 | 🟡 Belum diukur |
| Android SDK minimum | API 21 (Android 5.0) | PRD v2 | ✅ |
| Certificate pinning | SHA-256, expiry 2028 | PRD v2 | ✅ |
| Zero credential leak | Tidak ada di git | PRD v2 + Audit | 🔴 Masih di history |

### 8.2 Skor Kesiapan — Definisi Ulang PRD v3

| Skor | Arti | Nilai Saat Ini |
|------|------|----------------|
| **Skor Prototipe** | Kesiapan fitur yang sudah di-code (audit v4) | **92/100** |
| **Skor Keamanan** | RLS, credential, server-side enforcement | **65/100** |
| **Skor Strategi 24 Bulan** | Keselarasan dengan Implementasi Wajib | **~38/100** |
| **Skor Beta-Ready** | Checklist §10 terpenuhi | **~55/100** |

> PRD v3 tidak lagi menggunakan skor tunggal 92/100 sebagai indikator kesiapan produksi nasional.

---

## 9. Risiko & Mitigasi

### 9.1 Risiko Aktif (Audit v4 + Strategi)

| ID | Risiko | Dampak | Probabilitas | Mitigasi | Owner |
|----|--------|--------|--------------|----------|-------|
| R-01 | Credential bocor di git history | 🔴 Sangat Tinggi | Tinggi | Rotasi + BFG *(Blok A)* | DevOps |
| R-02 | RLS `USING (true)` — bypass moderasi | 🔴 Sangat Tinggi | Tinggi | SEC-03, SEC-04 | Backend |
| R-03 | Auto-PJC manipulasi nama/room_id | 🟡 Tinggi | Sedang | SEC-05, SEC-06 | Backend |
| R-04 | Architecture drift (2 dokumen, 2 arsitektur) | 🟡 Tinggi | Sedang | PRD v3 ADR, phased migration | Arsitek |
| R-05 | P2P tidak skalabel channel ramai | 🟡 Tinggi | Tinggi | T1-07 SFU PoC | Media |
| R-06 | Doze/vendor kill background PTT | 🔴 Sangat Tinggi | Tinggi | T1-01, T1-02, T1-03 | Android |
| R-07 | WebRTC gagal NAT Indonesia | 🟡 Tinggi | Sedang | TURN wajib + monitor | Infra |
| R-08 | ROIP pelanggaran frekuensi | 🔴 Sangat Tinggi | Rendah (pre-ROIP) | Legal gatekeeping, Monitor Only first | Compliance |
| R-09 | Koin utilitas dianggap e-money ilegal | 🟡 Tinggi | Rendah | ADR-006, konsultasi hukum BI | Legal |
| R-10 | CORS wildcard Edge Function | 🟡 Sedang | Sedang | SEC-07 | Backend |

### 9.2 Risiko Teknis Arsitektur Migrasi

| Risiko | Mitigasi |
|--------|----------|
| Migrasi MQTT+SFU menghentikan development 3+ bulan | ADR-001: Edge Function floor dulu; MQTT incremental |
| Dua stack signaling paralel (Supabase + MQTT) | Feature flag per channel; sunset Supabase broadcast setelah parity test |
| RNNoise latency di WebView | Benchmark WASM; fallback ke native plugin jika >50 ms added latency |

---

## 10. Compliance & Regulasi

| Area | Ketentuan | Implementasi PRD v3 |
|------|-----------|---------------------|
| Pembayaran | Koin = utilitas in-app, bukan e-money BI | ADR-006, legal review sebelum T2-05 |
| Spektrum radio | ROIP wajib IAR/IKR, TOT, audit trail | T3-03, T3-04 |
| Privasi audio laporan | Buffer 15 detik terenkripsi, consent, retention policy | T1-09, kebijakan privasi |
| GDPR/PDP Indonesia | Data lokasi ROIP, device ID ban | Dokumen privasi + minimal collection |
| Play Store | Foreground service justification, mic permission | T1-01 dokumentasi use case |

---

## 11. Checklist Kesiapan Beta

### Blocker (wajib ✅ sebelum beta publik)

- [ ] SEC-01: Credential dirotasi
- [ ] SEC-02: `.env` dihapus dari git history
- [ ] SEC-03: RLS moderasi diperbaiki
- [ ] SEC-04: Edge Function `moderate-channel` aktif
- [ ] SEC-05: Auto-PJC "pawon salam" dihapus
- [ ] SEC-06: Validasi room_id bootstrap PJC
- [ ] SEC-07: CORS Edge Function diperbaiki
- [ ] TURN_PROVIDER dikonfigurasi di Supabase Secrets
- [ ] Minimal 1 channel + NOC account di-seed manual

### Highly Recommended (beta terbatas / closed beta)

- [ ] T1-01: Foreground Service aktif
- [ ] T1-04: Floor arbitrator server-side
- [ ] T1-08: Instrumentasi latensi terpasang
- [ ] T1-11: Migration entertainment lengkap

### Sudah Terpenuhi ✅

- [x] AndroidManifest.xml lengkap
- [x] Certificate pinning aktif
- [x] CI/CD pipeline berjalan
- [x] Error Boundary aktif
- [x] Rate limiter TURN persistent
- [x] Sistem moderasi UI + hooks terimplementasi
- [x] 24+ unit tests permissions

---

## 12. Struktur Codebase Target

> Referensi lengkap: Implementasi Wajib §10.1. Di bawah ini roadmap direktori target terintegrasi dengan struktur saat ini.

```text
NextVWT/  (repo saat ini — React/Capacitor)
├── src/
│   ├── app/                    # UI, hooks audio, store (ADA)
│   ├── features/
│   │   ├── moderation/         # ADA — lengkap
│   │   ├── payment/            # BARU — Tahap 2
│   │   ├── roip/               # BARU — Tahap 3 (config UI only)
│   │   ├── chat/               # types → implement Tahap 2
│   │   ├── reactions/          # types → implement Tahap 2
│   │   ├── karaoke-queue/      # types → implement Tahap 3
│   │   └── song-request/       # types → implement Tahap 3
│   └── ...
├── android/
│   └── app/src/main/java/      # BARU: PttForegroundService, FcmService
├── supabase/
│   ├── functions/
│   │   ├── turn-credentials/   # ADA
│   │   ├── moderate-channel/   # BARU — Blok A
│   │   └── payment-webhook/    # BARU — Tahap 2
│   └── migrations/             # LEDGER, entertainment, trust_score
└── server/                     # OPSIONAL — ROIP bridge, floor MQTT (Tahap 3+)
```

---

## 13. Definisi Selesai (Definition of Done) per Fase

| Fase | DoD |
|------|-----|
| **Blok A** | Semua item SEC-* ✅; penetration test manual REST moderasi gagal; checklist §11 blocker hijau |
| **Tahap 1** | KPI latensi & survival terukur di laporan; floor arbitrator di production; FGS notifikasi aktif |
| **Tahap 2** | 1 transaksi QRIS end-to-end sukses; RNNoise mode Ojol pada device nyata; trust score aktif |
| **Tahap 3** | 1 pilot ROIP Monitor Only 30 hari tanpa insiden frekuensi; MQTT signaling parity dengan Supabase |
| **Tahap 4** | 2 region deployment; Codec2 fallback teruji di jaringan 2G simulasi; 1 klien enterprise pilot |

---

## 14. Changelog dari PRD v2.0

| Aspek | PRD v2.0 | PRD v3.0 |
|-------|----------|----------|
| Positioning | Walkie-talkie digital | Platform komunikasi lapangan Indonesia |
| Arsitektur | WebRTC P2P + Supabase (final) | Dua fase: prototipe → MQTT+SFU+FCM |
| Persona | 4 persona komunitas/event | +5 persona lapangan (ojol, SAR, satpam, dll.) |
| Roadmap | Q3/Q4 2026 entertainment only | 4 tahap 0–24 bulan terintegrasi |
| KPI | 5 metrik dasar | 10 metrik + survival rate + payment + ROIP |
| Keamanan | 5 risiko | 10 risiko + temuan audit v4 |
| Skor | 92/100 tunggal | 4 dimensi skor terpisah |
| Payment/ROIP | Tidak disebut | Pilar produk penuh |
| ADR | Tidak ada | 7 keputusan arsitektur |
| Referensi | Mandiri | Link ke Implementasi Wajib + Audit v4 |

---

## 15. Lampiran — Traceability Matrix

| Requirement ID | Sumber | Implementasi Saat Ini | Target Fase |
|----------------|--------|----------------------|-------------|
| REQ-PTT-01 | PRD v2 | WebRTC P2P ✅ | Maintain → SFU T1-07 |
| REQ-FC-01 | Impl. Wajib §6.2 | Cooperative busy ⚠️ | T1-04, T1-05 |
| REQ-BG-01 | Impl. Wajib §2.1 | Permission only ❌ | T1-01, T1-02 |
| REQ-AUD-01 | Impl. Wajib §3 | VAD only ⚠️ | T2-01–T2-04 |
| REQ-PAY-01 | Impl. Wajib §4 | None ❌ | T2-05–T2-08 |
| REQ-ROIP-01 | Impl. Wajib §5 | None ❌ | T3-01–T3-05 |
| REQ-MOD-01 | PRD v2 + Audit v4 | UI+hooks ✅, RLS ❌ | SEC-03, SEC-04 |
| REQ-TRUST-01 | Impl. Wajib §7 | None ❌ | T2-10 |
| REQ-REPORT-01 | Impl. Wajib §7 | None ❌ | T1-09 |
| REQ-ENT-01 | PRD v2 roadmap | Karaoke only ⚠️ | T2-11, T3-08 |
| REQ-SEC-01 | Audit v4 KRITIS-01 | ❌ | SEC-01, SEC-02 |
| REQ-SEC-02 | Audit v4 V4-01 | ❌ | SEC-03, SEC-04 |

---

*PRD v3.0 · NextVWT PTT App · 9 Juni 2026*  
*Menggabungkan: PRD v2.0 + Implementasi Wajib NextVWT + Audit v4*
