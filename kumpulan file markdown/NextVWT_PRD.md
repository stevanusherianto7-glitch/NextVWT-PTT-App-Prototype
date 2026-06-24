# Product Requirements Document (PRD)
# NextVWT — Virtual Walkie-Talkie PTT App

| | |
|---|---|
| **Versi Dokumen** | 2.0 |
| **Status** | Pre-Beta — Sistem Moderasi Selesai |
| **Diperbarui** | Juni 2026 |
| **Platform Target** | Android (iOS roadmap Q3 2026) |
| **Skor Kesiapan Produksi** | 92 / 100 |

---

## 1. Deskripsi Produk

**NextVWT (Next Virtual Walkie-Talkie)** adalah aplikasi komunikasi Push-to-Talk berbasis internet yang menghadirkan pengalaman walkie-talkie fisik dalam aplikasi Android. Pengguna bergabung ke channel bernomor, berbicara real-time, dan menikmati antarmuka walkie-talkie skeuomorfik dengan 8 tema visual premium.

**Proposisi Nilai:**
> *"Walkie-talkie profesional di saku Anda — tanpa frekuensi radio, tanpa jarak batas."*

---

## 2. Target Pengguna & Persona

| Persona | Segmen | Kebutuhan Utama |
|---------|--------|----------------|
| Pebe — Ketua Komunitas Motor | Komunitas, 25–40 th | PTT group, channel tetap, haptic |
| Pak Rudi — Koordinator Siskamling | Keamanan warga, 40–55 th | Mudah dipakai, 1 tombol tekan |
| Dewi — Panitia Event Musik | Profesional event, 25–35 th | Audio kualitas tinggi, karaoke mode |
| Hendra — Penghobi Radio Amatir | Hobbyist, 30–45 th | Callsign, LCD realistis, channel scan |

---

## 3. Fitur yang Sudah Diimplementasikan

### Core PTT
- [x] Push-to-Talk real-time via WebRTC P2P
- [x] Fallback audio via Supabase Realtime (base64)
- [x] VAD (Voice Activity Detection) — auto-mute saat silence
- [x] Half-duplex dengan busy indicator
- [x] Full-duplex mode (opsional)
- [x] Toggle vs Push-hold mode
- [x] Roger beep + squelch tail + pre-chirp sound design
- [x] Haptic feedback

### Channel Management
- [x] Channel 0–999 dengan navigation
- [x] Presence tracking (user aktif per channel)
- [x] Channel scan
- [x] Channel list modal
- [x] User list modal

### Audio Engine
- [x] WebRTC P2P + fallback base64
- [x] TURN server multi-provider (Metered, Twilio, Static)
- [x] Discussion mode (echo cancel + noise suppress)
- [x] Music/Karaoke mode (stereo Opus 128kbps)
- [x] Built-in echo/reverb effect
- [x] Progress bar dari RMS analyzer (bukan random)

### Sistem Moderasi 5 Level ✅ BARU
- [x] Permissions engine (canModerateRole, canPerformAction)
- [x] 24 unit tests permissions
- [x] useChannelRole — real-time via Postgres Changes
- [x] useChannelSettings — 15+ konfigurasi per channel
- [x] useModerationActions — mute, block, kick, ban, setRole
- [x] ChannelManagePanel UI
- [x] Database schema + migrasi

### UX & Visual
- [x] 8 tema visual (classic, v1–v6, monokrom)
- [x] LCD panel dengan font DSEG7
- [x] Karaoke player floating
- [x] Error Boundary
- [x] Skeleton loading
- [x] Animasi micro-interaction

### Infrastruktur
- [x] Android Capacitor 8
- [x] Certificate pinning (SHA-256, expiry 2028)
- [x] CI/CD pipeline (GitHub Actions + Android signing)
- [x] Rate limiter (PTT, channel switch, broadcast)
- [x] Store Zustand 5 slices
- [x] Google OAuth + Guest login (UUID unik)

---

## 4. Fitur yang Belum Diimplementasikan (Roadmap)

### Sprint Berikutnya (prioritas)
- [ ] Perbaiki RLS policies moderasi
- [ ] Edge Function `moderate-channel` server-side validation
- [ ] Hapus auto-assign PJC via nama tampilan
- [ ] Migration SQL entertainment lengkap

### Q3 2026
- [ ] Chat Room real-time per channel
- [ ] Lottie Reactions (6 tipe)
- [ ] Karaoke Queue management UI
- [ ] Song Request + voting
- [ ] Smart Presence (8 status)

### Q4 2026 dan seterusnya
- [ ] Admin Panel global (NOC & Sys Admin)
- [ ] Badge & Level system
- [ ] Leaderboard
- [ ] iOS Capacitor version
- [ ] Play Store listing
- [ ] End-to-end enkripsi audio

---

## 5. Non-Functional Requirements

| Metrik | Target | Status |
|--------|--------|--------|
| Audio latency E2E | < 300ms di 4G | 🟡 Belum diukur produksi |
| Crash rate | < 0.5% per sesi | ✅ Error Boundary aktif |
| App startup time | < 3 detik | 🟡 Belum diukur |
| Bundle size (initial) | < 500KB gzip | 🟡 Belum diukur |
| Android SDK minimum | 21 (Android 5.0) | ✅ |
| Certificate pinning | SHA-256, expiry 2028 | ✅ |
| Zero credential leak | Tidak ada hardcode | 🔴 `.env` masih di git history |

---

## 6. Risiko Aktif

| Risiko | Dampak | Mitigasi |
|--------|--------|---------|
| Credential bocor di git | 🔴 Sangat Tinggi | Rotasi + BFG hari ini |
| RLS permisif di DB | 🔴 Tinggi | Perbaiki ke service_role only |
| TURN tidak terkonfigurasi | 🟡 Tinggi | Setup Metered.ca + env var |
| WebRTC gagal di NAT Indonesia | 🟡 Tinggi | TURN wajib sebelum beta |
| Auto-PJC via nama tampilan | 🟡 Sedang | Hapus logika, seed manual |

---

*PRD v2.0 · NextVWT PTT App · Juni 2026*
