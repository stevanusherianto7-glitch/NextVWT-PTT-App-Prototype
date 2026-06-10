# Laporan Audit Menyeluruh — NextVWT PTT App v4
# Analisis Empat Iterasi + Status Sistem Moderasi

> **Tanggal Audit:** 9 Juni 2026  
> **Versi Diaudit:** Clone terbaru (Iterasi ke-4)  
> **Trajectory:** v1: 65 → v2: 78 → v3: 87 → **v4: 92 / 100**  
> **Highlight:** Sistem moderasi 5 level terimplementasi penuh — fitur terbesar sejauh ini

---

## Ringkasan Eksekutif

Iterasi ke-4 adalah pencapaian terbesar dalam sejarah proyek ini. Sistem moderasi channel 5 level (N.O.C → Sys Admin → PJC → Operator → User Biasa) telah diimplementasikan **end-to-end**: dari migration SQL, permissions engine, hooks Supabase Realtime, hingga komponen UI dengan CSS khusus. Ditambah `storeUtils.ts` yang menghapus circular import — salah satu debt teknis terakhir dari arsitektur store.

Satu blocker kritis yang sama masih bertahan sejak v1: `.env` dengan credential nyata masih ter-commit. Namun ada catatan positif — `.gitignore` sekarang **sudah mencantumkan `.env`** dengan benar; artinya ini adalah masalah git history dari commit lama, bukan konfigurasi yang salah.

Tiga temuan baru yang perlu diperhatikan: RLS policies di migration yang terlalu permisif (`USING (true)` untuk semua operasi), logika auto-assign PJC berdasarkan nama tampilan "pawon salam" yang rawan manipulasi, dan schema entertainment yang masih berupa stub.

---

## Trajectory Kualitas — Empat Iterasi

| Iterasi | Skor | Highlight Perubahan |
|---------|------|---------------------|
| v1 | 65/100 | Prototipe awal — banyak temuan kritis |
| v2 | 78/100 | Android manifest, Error Boundary, hooks refactor, MUI dihapus |
| v3 | 87/100 | Store slices, TURN Edge Function, appSecurity diperbaiki |
| **v4** | **92/100** | **Sistem moderasi lengkap, storeUtils, themeCatalog, `member` role ditambahkan** |

---

## Status Seluruh Temuan (4 Iterasi)

| ID | Temuan | v1 | v2 | v3 | v4 |
|----|--------|----|----|----|-----|
| KRITIS-01 | Credential `.env` bocor ke git | 🔴 | 🔴 | 🔴 | 🔴 **Masih** |
| KRITIS-02 | Izin Android hilang | 🔴 | ✅ | ✅ | ✅ |
| KRITIS-03 | isDummyKey auto-connect palsu | 🔴 | ✅ | ✅ | ✅ |
| KRITIS-04 | Guest login ID hardcoded | 🔴 | ✅ | ✅ | ✅ |
| TINGGI-01 | Tidak ada TURN server | 🟡 | 🟠 | ✅ | ✅ |
| TINGGI-02 | Konflik MUI + Radix | 🟡 | ✅ | ✅ | ✅ |
| TINGGI-03 | Data channel hardcoded | 🟡 | 🟡 | 🟠 | 🟠 sebagian |
| SEDANG-01 | Tidak ada Error Boundary | 🟠 | ✅ | ✅ | ✅ |
| SEDANG-02 | useAudioStreamer monolitik | 🟠 | ✅ | ✅ | ✅ |
| SEDANG-03 | Certificate pinning expired | 🟠 | ✅ | ✅ | ✅ |
| SEDANG-04 | Build artifact ter-commit | 🟠 | ✅ | ✅ | ✅ |
| V3-01 | Migration SQL stub kosong (entertainment) | — | — | 🔴 | 🔴 **Masih** |
| V3-02 | CORS wildcard Edge Function | — | — | 🟡 | 🟡 **Masih** |
| V3-03 | Rate limiter in-memory Edge Function | — | — | 🟡 | ✅ (turn_rate_limits tabel) |
| V3-04 | `debugger` di integrity.ts | — | — | 🟠 | ✅ Dihapus |
| V3-05 | Feature modules — types only | — | — | 🟠 | 🟠 Sebagian (moderation ✅) |
| BARU-01 v2 | appSecurity false sense | — | 🟡 | ✅ | ✅ |
| **V4-01** | **RLS policies terlalu permisif** | — | — | — | 🔴 **Baru** |
| **V4-02** | **Auto-assign PJC berdasarkan nama tampilan** | — | — | — | 🟡 **Baru** |
| **V4-03** | **Bootstrap PJC first-join bisa dimanipulasi** | — | — | — | 🟡 **Baru** |
| **V4-04** | **CORS wildcard masih di Edge Function** | — | — | 🟡 | 🟡 **Masih** |
| **V4-05** | **themeCatalog hanya 3 tema dari 8** | — | — | — | 🟠 **Baru** |

---

## Temuan Baru di v4

### 🔴 V4-01: RLS Policies Terlalu Permisif — `USING (true)` untuk Semua Operasi

**File:** `supabase/migrations/20260608201500_create_moderation_tables.sql` (baris 89–102)

```sql
-- Ini yang terpasang saat ini:
CREATE POLICY "Admins and PJC can manage roles" ON public.channel_roles
  FOR ALL USING (true); -- ← Siapapun bisa INSERT/UPDATE/DELETE!

CREATE POLICY "PJC or SysAdmin can modify settings" ON public.channel_settings
  FOR ALL USING (true); -- ← Sama, tidak ada pembatasan

CREATE POLICY "Admins and PJC can manage bans" ON public.channel_bans
  FOR ALL USING (true); -- ← Tamu bisa ban siapapun!
```

`USING (true)` pada policy `FOR ALL` berarti **siapapun yang punya akses ke Supabase** — termasuk tamu anonim — bisa melakukan INSERT, UPDATE, dan DELETE pada tabel-tabel moderasi ini langsung via Supabase client tanpa melalui aplikasi.

Validasi kewenangan saat ini hanya ada di client-side (fungsi `canPerformAction`, `canModerateRole` di `permissions.ts`). Ini bisa di-bypass sepenuhnya dengan request langsung ke Supabase REST API.

**Perbaikan yang diperlukan:**

```sql
-- Hapus policies lama yang terlalu permisif, ganti dengan:

-- channel_roles: hanya service_role atau user yang berwenang bisa write
DROP POLICY IF EXISTS "Admins and PJC can manage roles" ON public.channel_roles;
CREATE POLICY "Role management via service role only" ON public.channel_roles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Role management update via service role" ON public.channel_roles
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Role management delete via service role" ON public.channel_roles
  FOR DELETE USING (auth.role() = 'service_role');

-- channel_settings: hanya service_role yang bisa write
DROP POLICY IF EXISTS "PJC or SysAdmin can modify settings" ON public.channel_settings;
CREATE POLICY "Settings write via service role" ON public.channel_settings
  FOR ALL USING (auth.role() = 'service_role');

-- channel_bans: hanya service_role
DROP POLICY IF EXISTS "Admins and PJC can manage bans" ON public.channel_bans;
CREATE POLICY "Bans via service role only" ON public.channel_bans
  FOR ALL USING (auth.role() = 'service_role');
```

Semua write ke tabel moderasi harus melewati **Edge Function `moderate-channel`** (yang menggunakan `SUPABASE_SERVICE_ROLE_KEY`), bukan langsung dari client.

---

### 🟡 V4-02: Auto-Assign PJC Berdasarkan Nama Tampilan "pawon salam"

**File:** `src/features/moderation/useChannelRole.ts` (baris 44–69)

```typescript
// Siapapun yang mengubah infoText menjadi "pawon salam" akan otomatis mendapat role PJC:
const currentName = storeState.infoText || storeState.user?.user_metadata?.full_name || '';
const isPawonSalam = currentName.trim().toLowerCase() === 'pawon salam';

if (isPawonSalam) {
  // ... upsert role 'pjc'
}
```

Nama tampilan (`infoText`) adalah setting yang **bisa diubah bebas oleh siapapun** dari Settings Panel. Logika ini berarti setiap tamu yang mengganti namanya menjadi "Pawon Salam" akan otomatis mendapat role PJC di semua channel yang mereka masuki.

Ini kemungkinan adalah workaround sementara untuk testing, namun sangat berbahaya di produksi.

**Perbaikan:**
```typescript
// Hapus blok isPawonSalam sepenuhnya.
// Untuk assign NOC/PJC awal: gunakan Supabase Dashboard atau seed script
// dengan service role key — bukan berdasarkan nama tampilan.
```

---

### 🟡 V4-03: Bootstrap PJC First-Join Bisa Dimanipulasi

**File:** `src/features/moderation/useChannelRole.ts` (baris 73–96)

```typescript
// User pertama yang masuk ke channel baru otomatis jadi PJC:
const { count } = await supabaseInstance
  .from('channel_roles')
  .select('id', { count: 'exact', head: true })
  .eq('room_id', roomId);

if (!countError && count === 0) {
  // Insert sebagai PJC
}
```

Masalahnya: channel `room_id` di NextVWT dibangun dari string seperti `ptt-room-100`. Siapapun bisa membuat `room_id` baru yang belum ada di database (misalnya `ptt-room-100-admin-clone`) dan mendapat role PJC di "channel" tersebut. Tidak ada validasi bahwa `room_id` harus merupakan channel yang terdaftar di tabel `channels`.

**Perbaikan:**
```typescript
// Sebelum bootstrap, validasi room_id adalah channel yang terdaftar:
const { data: channelExists } = await supabaseInstance
  .from('channels')
  .select('id')
  .eq('supabase_room_id', roomId)
  .maybeSingle();

if (!channelExists) return; // Room tidak valid, jangan bootstrap PJC
```

---

### 🟠 V4-05: themeCatalog.ts Hanya Mendaftar 3 dari 8 Tema

**File:** `src/features/themes/themeCatalog.ts`

```typescript
// Hanya 3 tema terdaftar, padahal CSS mendefinisikan 8:
export const THEME_CATALOG = [
  { key: 'green-crystal', label: 'Green Crystal', accentColor: '#00c853' },
  { key: 'gold-karaoke', label: 'Gold Karaoke', accentColor: '#facc15' },
  { key: 'gaming-neon', label: 'Gaming Neon', accentColor: '#00e5ff' },
] as const;
```

CSS di `src/styles/theme.css` mendefinisikan 8 tema (classic, v1–v6, monokrom). `themeCatalog.ts` hanya mendaftarkan 3 tema baru dengan nama berbeda, tidak sinkron dengan key tema yang digunakan di CSS.

**Perbaikan:** Sinkronisasi key di `themeCatalog.ts` dengan class yang ada di `theme.css`.

---

## Kekuatan Besar v4

### ✅ Sistem Moderasi End-to-End Terimplementasi

Ini adalah pencapaian terbesar di v4. Seluruh stack moderasi sudah ada:

**Permissions Engine** (`permissions.ts`):
- `canModerateRole(actor, target)` — validasi hierarki
- `canPerformAction(role, action)` — 12 aksi moderasi
- `canUsePTT/canUseChat/canUseReaction` — kontrol akses fitur
- **24 unit tests** yang komprehensif di `permissions.test.ts`

**Database** (`20260608201500_create_moderation_tables.sql`):
- `channel_roles` — role per user per room dengan status dan expiry
- `channel_settings` — 15+ konfigurasi per channel
- `channel_bans` — ban tracking dengan expiry
- `channel_moderation_logs` — audit trail lengkap

**Hooks**:
- `useChannelRole` — role + status real-time via Postgres Changes
- `useChannelSettings` — settings channel dengan updateSettings
- `useModerationActions` — 10 fungsi moderasi (mute, unmute, blockPTT, blockChat, kick, ban, unban, setUserRole, dll.)

**UI Components**:
- `ChannelManagePanel` — panel utama dengan 4 tab (Info, Anggota, Pengaturan, Log)
- `ChannelMemberList` — daftar anggota aktif
- `ChannelSettingsPanel` — toggle-toggle konfigurasi channel
- `ModerationLogPanel` — log moderasi
- CSS khusus `moderation.css` dengan styling premium

### ✅ Circular Import Store Dibereskan

`storeUtils.ts` berisi `safeGetStorage`, `safeSetStorage`, `generateUUID`, `getChannelUUID`, dan `generateRandomCallSign` — semua utility yang sebelumnya ada di `usePTTStore.ts` dan menyebabkan circular import dengan slices. Ini perbaikan arsitektur yang elegan.

### ✅ Rate Limiter TURN Sekarang Persistent

Tabel `turn_rate_limits` di database menggantikan Map in-memory di Edge Function. State rate limiting sekarang bertahan melampaui cold starts.

### ✅ App.tsx Security Audit Sudah Benar

```typescript
// v4 — pattern yang benar dengan async/await:
performSecurityAudit()
  .then((audit) => {
    if (audit.blocked && import.meta.env.PROD) {
      console.error('[Security] Potential security issue detected:', audit.issues.join(', '));
    }
  })
  .catch((err) => console.error('[Security] Error:', err));
```

Tidak ada hard crash, tidak ada false positive blocking, security log hanya di production mode.

### ✅ `member` Role Ditambahkan ke Hirarki

`channel_settings` di migration mencantumkan `member_max_ptt_seconds` — menunjukkan ada diferensiasi antara `member` (user terdaftar) dan `guest` (tamu). Ini selaras dengan rencana PRD untuk 5 level hirarki yang lengkap.

---

## Skor Per Dimensi

| Dimensi | v1 | v2 | v3 | v4 |
|---------|----|----|----|-----|
| **Keamanan** | 40 | 48 | 60 | 65 (RLS permisif drag skor) |
| **Arsitektur** | 75 | 88 | 95 | **98** (circular import resolved) |
| **Kualitas Kode** | 70 | 78 | 88 | **92** |
| **Testing** | 80 | 87 | 87 | **93** (24 test moderasi baru) |
| **Fitur Moderasi** | 0 | 0 | 10 | **95** 🚀 |
| **UX & Audio** | 85 | 85 | 90 | **90** |
| **Kesiapan Mobile** | 50 | 82 | 92 | **92** |
| **Skalabilitas** | 55 | 62 | 78 | **82** |
| **DevOps/CI** | 55 | 80 | 92 | **92** |
| **Skor Keseluruhan** | **65** | **78** | **87** | **92** |

---

## Rekomendasi Prioritas

### 🔴 Hari Ini — Blocker Absolut

1. **Rotasi credential + hapus dari git history** (90 menit)
   ```bash
   # Rotasi di dashboard, lalu:
   java -jar bfg.jar --delete-files .env .
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   git push --force
   ```

2. **Perbaiki RLS policies** (2 jam)
   - Ganti semua `FOR ALL USING (true)` dengan `FOR ALL USING (auth.role() = 'service_role')`
   - Semua write moderasi harus via Edge Function dengan service role key

### 🟡 Minggu Ini — Keamanan Moderasi

3. **Hapus logika auto-assign PJC via nama tampilan** (30 menit)
   - Hapus blok `isPawonSalam` di `useChannelRole.ts`
   - Buat seed script untuk assign role NOC/PJC awal via Supabase Dashboard

4. **Tambahkan validasi room_id di bootstrap PJC** (1 jam)
   - Cek bahwa room_id ada di tabel channels sebelum bootstrap

5. **Perbaiki CORS wildcard di Edge Function** (1 jam)
   - Ganti `Access-Control-Allow-Origin: *` dengan allowed origins spesifik

### 🟠 Sprint Berikutnya — Kelengkapan

6. **Sinkronisasi themeCatalog.ts dengan 8 tema di theme.css** (2 jam)

7. **Buat migration SQL lengkap untuk entertainment** (4 jam)
   - Isi `20260608_nextvwt_entertainment.sql` dengan DDL nyata
   - Tabel: channel_messages, karaoke_queue, song_requests, reactions

8. **Implementasi fitur Chat** sebagai entertainment feature pertama (17 jam)

9. **Buat Edge Function `moderate-channel`** untuk validasi server-side (8 jam)
   - Validasi kewenangan di server, bukan hanya client

---

## Checklist Siap Beta Testing

- [ ] `.env` dihapus dari git history
- [ ] Credential Supabase + Google OAuth dirotasi
- [ ] RLS policies diperbaiki (service_role only untuk write)
- [ ] Auto-assign PJC via nama tampilan dihapus
- [ ] CORS wildcard Edge Function diperbaiki
- [ ] TURN_PROVIDER dikonfigurasi di Supabase Secrets
- [ ] Minimal 1 channel seed di database
- [ ] NOC account di-seed manual via Supabase Dashboard
- [x] AndroidManifest.xml lengkap
- [x] Certificate pinning aktif
- [x] CI/CD pipeline berjalan
- [x] Error Boundary aktif
- [x] Rate limiter TURN persistent
- [x] Sistem moderasi terimplementasi
- [x] 24+ unit tests permissions

---

## Addendum Dokumentasi (9 Juni 2026)

> **Status:** Addendum ini ditambahkan setelah audit v4 diterbitkan, mengacu pada rekonsiliasi dokumen produk & strategi. **Temuan teknis §2–§9 di atas tidak diubah** — masih menggambarkan kondisi codebase per tanggal audit v4.

### A.1 Dokumen Pelengkap (Post-Audit v4)

| Dokumen | Peran | Hubungan dengan Audit v4 |
|---------|-------|--------------------------|
| [NextVWT_PRD_v3.md](./NextVWT_PRD_v3.md) | PRD aktif — roadmap, ADR, backlog terintegrasi | Mengadopsi temuan v4 ke Blok A (SEC-*) & Tahap 1–4 |
| [Implementasi wajib nextvwt.md](./Implementasi%20wajib%20nextvwt.md) | Visi arsitektur target 24 bulan | Mengisi gap strategis yang tidak dicakup v4 |
| [NextVWT_Owner_Playbook_Persiapan_Lengkap.md](./NextVWT_Owner_Playbook_Persiapan_Lengkap.md) | Tahapan persiapan owner (akun, legal, beta) | Operasionalisasi rekomendasi prioritas §Rekomendasi |
| [NextVWT_Rincian_Biaya_Owner.md](./NextVWT_Rincian_Biaya_Owner.md) | Breakdown biaya F2/F3/F4 | Anggaran untuk menutup temuan & roadmap |
| [Spesifikasi_Infrastruktur_VPS_NextVWT.md](./Spesifikasi_Infrastruktur_VPS_NextVWT.md) | Spesifikasi VPS SFU/MQTT | Infrastruktur untuk TINGGI-01 (TURN) & Tahap 1 SFU |

### A.2 Penjelasan Skor — Dua Dimensi

Audit v4 menggunakan **skor tunggal 92/100** untuk kesiapan **prototipe yang sudah di-code**. PRD v3 memperkenalkan pemisahan skor:

| Dimensi | Skor (per 9 Jun 2026) | Sumber |
|---------|----------------------|--------|
| **Skor Prototipe** (fitur ter-code) | **92/100** | Audit v4 — tidak berubah |
| **Skor Keamanan** | **65/100** | Audit v4 §Skor Per Dimensi — RLS permisif menahan skor |
| **Skor Keselarasan Strategi 24 Bulan** | **~38/100** | PRD v3 §5 — MQTT/SFU/FCM/payment/ROIP belum di-code |
| **Skor Beta-Ready** (checklist §Checklist) | **~55/100** | 8 blocker checklist belum terpenuhi |

> **Kesimpulan addendum:** Skor 92/100 **tidak** berarti siap produksi nasional atau beta publik. Lihat checklist §Checklist Siap Beta Testing — 8 item blocker masih terbuka.

### A.3 Temuan Strategis (Di Luar Scope Audit v4)

Audit v4 fokus pada **codebase iterasi ke-4**. Analisis pasca-audit mengidentifikasi gap yang tidak tercatat sebagai temuan v4:

| Area | Status Codebase | Dokumen Referensi |
|------|-----------------|-------------------|
| Android Foreground Service + FCM | ~10% | Implementasi Wajib §2, PRD v3 T1-01/T1-02 |
| Floor control authoritative (MQTT/server) | ~15% | Implementasi Wajib §6, PRD v3 T1-04 |
| WebRTC SFU (bukan P2P mesh) | Tidak ada | PRD v3 T1-07, Spesifikasi VPS |
| Payment / koin / QRIS | 0% | PRD v3 Tahap 2 |
| ROIP bridge | 0% | Implementasi Wajib §5 |
| Trust score + audio report buffer | 0% | PRD v3 T1-09, T2-10 |

Temuan ini **bukan regresi** dari v4 — memang di luar scope audit iterasi codebase.

### A.4 Status Temuan v4 — Snapshot Pasca-Addendum

| ID | Status per 9 Jun 2026 | Catatan |
|----|----------------------|---------|
| KRITIS-01 | 🔴 **Masih open** | Lihat Owner Playbook F1 |
| V4-01 | 🔴 **Masih open** | PRD v3 SEC-03, SEC-04 |
| V4-02 | 🟡 **Masih open** | PRD v3 SEC-05 |
| V4-03 | 🟡 **Masih open** | PRD v3 SEC-06 |
| V4-04 | 🟡 **Masih open** | PRD v3 SEC-07 |
| V4-05 | 🟠 **Masih open** | PRD v3 T1-10 |
| V3-01 | 🔴 **Masih open** | PRD v3 T1-11 |

**Tidak ada perubahan kode** antara publikasi audit v4 dan addendum ini. Status temuan diasumsikan identik hingga commit perbaikan Blok A.

### A.5 Kapan Audit v5 Diperlukan

Audit v5 wajib diterbitkan setelah:

1. **Blok A selesai** (SEC-01 s/d SEC-08) — verifikasi ulang KRITIS-01, V4-01 s/d V4-04
2. **Atau** perubahan kode signifikan (FGS, SFU PoC, payment webhook)

Audit v5 harus mencakup: re-score keamanan, verifikasi temuan v4, gap strategis terbaru, dan checklist beta PRD v3 §11.

### A.6 Hierarki Dokumen (Mana yang Mengacu ke Mana)

```text
Implementasi wajib nextvwt.md     ← visi & arsitektur target (24 bln)
         │
         ▼
NextVWT_PRD_v3.md                 ← PRD aktif (backlog, ADR, KPI)
         │
    ┌────┴────┐
    ▼         ▼
Audit v4   Owner Playbook + Rincian Biaya + Spesifikasi VPS
(arsip       (operasional owner)
 codebase
 9 Jun 2026)
```

---

*Audit v4 · NextVWT PTT App · 9 Juni 2026*  
*Empat iterasi: 65 → 78 → 87 → 92/100*  
*Addendum dokumentasi: 9 Juni 2026 — temuan teknis v4 tidak diubah; lihat PRD v3 untuk roadmap aktif*
