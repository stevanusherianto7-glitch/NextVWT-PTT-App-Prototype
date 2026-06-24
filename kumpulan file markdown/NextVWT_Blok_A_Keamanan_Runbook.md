# NextVWT Blok A — Runbook Keamanan
## Panduan Eksekusi SEC-01 s/d SEC-08 (Wajib Sebelum Beta Publik)

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 9 Juni 2026 |
| **Estimasi total** | 12–16 jam kerja (owner ~3 jam + developer ~10 jam) |
| **Sumber** | [NextVWT_PTT_Audit_Report_v4.md](./NextVWT_PTT_Audit_Report_v4.md) · [NextVWT_PRD_v3.md](./NextVWT_PRD_v3.md) §6.1 |

**Dokumen terkait:**
- [NextVWT_Owner_Playbook_Persiapan_Lengkap.md](./NextVWT_Owner_Playbook_Persiapan_Lengkap.md) — Fase 1 owner
- [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) — rilis Android

---

## 0. Ringkasan Blok A

| ID | Item | Owner | Developer | Estimasi |
|----|------|:-----:|:---------:|----------|
| SEC-01 | Rotasi credential Supabase + Google OAuth | ✅ | bantu | 90 menit |
| SEC-02 | Hapus `.env` dari git history | koordinasi | ✅ | 30 menit |
| SEC-03 | Perbaiki RLS moderasi → `service_role` only | — | ✅ | 2 jam |
| SEC-04 | Edge Function `moderate-channel` | — | ✅ | 8 jam |
| SEC-05 | Hapus auto-PJC "pawon salam" | — | ✅ | 30 menit |
| SEC-06 | Validasi `room_id` bootstrap PJC | — | ✅ | 1 jam |
| SEC-07 | Perbaiki CORS Edge Function TURN | — | ✅ | 1 jam |
| SEC-08 | Seed channel + akun NOC manual | ✅ | bantu | 1 jam |

### Definition of Done (Blok A)

```
✅ Tidak ada credential aktif yang masih valid di git history
✅ Tamu anonim TIDAK bisa INSERT/UPDATE/DELETE tabel moderasi via REST API
✅ Semua write moderasi melewati Edge Function moderate-channel
✅ Tidak ada bypass PJC via nama tampilan atau room_id palsu
✅ TURN credentials berfungsi dari origin production
✅ Minimal 1 channel + 1 akun NOC ter-seed di database production
```

---

## SEC-01 — Rotasi Credential Supabase & Google OAuth

**Temuan audit:** KRITIS-01  
**Siapa:** **Owner** (dashboard) + Developer (update secrets)

### Langkah Owner

#### A. Supabase

```
1. Login https://supabase.com/dashboard
2. Pilih project PRODUCTION (bukan dev jika terpisah)
3. Settings → API
4. Klik "Reset" atau generate ulang:
   - anon / publishable key
   - service_role key  ← SANGAT RAHASIA
5. Catat key baru di password manager (Bitwarden)
6. JANGAN kirim service_role via WhatsApp/email biasa
```

#### B. Google Cloud OAuth

```
1. Login https://console.cloud.google.com
2. APIs & Services → Credentials
3. Buat OAuth 2.0 Client ID BARU (Android):
   - Package name: com.nextvwt.ptt
   - SHA-1: minta ke developer (dari signing key)
4. Revoke / hapus client ID lama yang pernah bocor
5. OAuth consent screen → pastikan Privacy Policy URL terisi
6. Catat Client ID baru di password manager
```

#### C. Serahkan ke Developer (cara aman)

```
□ GitHub → repo → Settings → Secrets and variables → Actions
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
   - VITE_GOOGLE_CLIENT_ID
   - SUPABASE_SERVICE_ROLE_KEY (hanya untuk CI/deploy, bukan client app)

□ Supabase → Edge Functions → Secrets
   - SUPABASE_SERVICE_ROLE_KEY
   - TURN_PROVIDER, METERED_DOMAIN, METERED_API_KEY (lihat SEC-08 bawah)
```

### Verifikasi SEC-01

| Cek | Cara | Hasil |
|-----|------|-------|
| App masih login | Buka app dengan key baru | ✅ Login berhasil |
| Key lama invalid | Coba key lama di REST call | ❌ 401 rejected |
| Vault terupdate | Password manager lengkap | ✅ |

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## SEC-02 — Hapus `.env` dari Git History

**Temuan audit:** KRITIS-01 (lanjutan)  
**Siapa:** **Developer** (eksekusi) · Owner (verifikasi)

### Prasyarat

- [ ] SEC-01 selesai — credential sudah dirotasi (key lama tidak masalah lagi)
- [ ] Semua anggota tim punya salinan `.env` lokal dari vault, bukan dari git
- [ ] `.gitignore` sudah mencantumkan `.env` ✅ (sudah benar di repo)

### Langkah Developer

```bash
# Opsi A — BFG Repo-Cleaner (disarankan)
# Download bfg.jar dari https://rtyley.github.io/bfg-repo-cleaner/

# 1. Clone mirror
git clone --mirror git@github.com:ORG/NextVWT.git nextvwt-mirror.git
cd nextvwt-mirror.git

# 2. Hapus .env dari seluruh history
java -jar bfg.jar --delete-files .env .

# 3. Bersihkan
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Force push (KOORDINASI OWNER DULU)
git push --force
```

```bash
# Opsi B — git filter-repo (alternatif)
pip install git-filter-repo
git filter-repo --path .env --invert-paths
git push --force
```

### ⚠️ Peringatan Owner

- Force push mengubah history — semua collaborator harus re-clone
- Backup repo dulu sebelum force push
- Setelah push, rotasi ulang SEMUA secret (langkah SEC-01) jika ada keraguan

### Verifikasi SEC-02

```bash
# Cari .env di history — harus kosong
git log --all --full-history -- .env

# Cek GitHub — file .env tidak muncul di commit manapun
```

Atau gunakan: https://github.com/search?q=repo%3AORG%2FNextVWT+.env

| Cek | Hasil |
|-----|-------|
| `git log -- .env` kosong | ☐ |
| GitHub search tidak menemukan secret | ☐ |
| Tim sudah re-clone | ☐ |

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## SEC-03 — Perbaiki RLS Policies Moderasi

**Temuan audit:** V4-01  
**Siapa:** **Developer**  
**File terdampak:** `supabase/migrations/20260608201500_create_moderation_tables.sql`

### Masalah

Policy `FOR ALL USING (true)` pada `channel_roles`, `channel_settings`, `channel_bans` memungkinkan siapapun menulis langsung ke database moderasi.

### Langkah Developer

**1. Buat migration baru** (jangan edit migration lama yang sudah ter-deploy):

`supabase/migrations/20260609120000_fix_moderation_rls.sql`

```sql
-- SEC-03: Hapus policy permisif, write hanya via service_role

-- channel_roles
DROP POLICY IF EXISTS "Admins and PJC can manage roles" ON public.channel_roles;
CREATE POLICY "Roles insert service role only" ON public.channel_roles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Roles update service role only" ON public.channel_roles
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Roles delete service role only" ON public.channel_roles
  FOR DELETE USING (auth.role() = 'service_role');
-- SELECT policy "Anyone can read roles" tetap boleh (read-only publik)

-- channel_settings
DROP POLICY IF EXISTS "PJC or SysAdmin can modify settings" ON public.channel_settings;
CREATE POLICY "Settings write service role only" ON public.channel_settings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Settings update service role only" ON public.channel_settings
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Settings delete service role only" ON public.channel_settings
  FOR DELETE USING (auth.role() = 'service_role');

-- channel_bans
DROP POLICY IF EXISTS "Admins and PJC can manage bans" ON public.channel_bans;
CREATE POLICY "Bans insert service role only" ON public.channel_bans
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Bans update service role only" ON public.channel_bans
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Bans delete service role only" ON public.channel_bans
  FOR DELETE USING (auth.role() = 'service_role');

-- channel_moderation_logs: write juga service_role only
CREATE POLICY "Logs insert service role only" ON public.channel_moderation_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

**2. Deploy migration:**

```bash
supabase db push
# atau via Supabase Dashboard → SQL → run migration
```

### Verifikasi SEC-03

```bash
# Test sebagai anon — harus GAGAL insert ke channel_bans
curl -X POST 'https://<project>.supabase.co/rest/v1/channel_bans' \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"room_id":"ptt-room-999","user_id":"fake","reason":"test"}'
# Expected: 401 atau 403 atau RLS violation
```

| Cek | Hasil |
|-----|-------|
| Anon insert channel_bans → ditolak | ☐ |
| Anon insert channel_roles → ditolak | ☐ |
| Anon SELECT channel_roles → masih boleh (read) | ☐ |

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## SEC-04 — Edge Function `moderate-channel`

**Temuan audit:** V4-01 (lanjutan)  
**Siapa:** **Developer**  
**Estimasi:** 6–8 jam

### Tujuan

Semua aksi moderasi write (mute, ban, setRole, kick log, dll.) harus melalui server yang memvalidasi `canPerformAction` — bukan langsung dari client Supabase.

### Spesifikasi Minimum

**Endpoint:** `POST /functions/v1/moderate-channel`

**Request body:**

```json
{
  "action": "ban" | "unban" | "mute" | "unmute" | "set_role" | "kick" | "update_settings",
  "room_id": "ptt-room-100",
  "target_user_id": "uuid-target",
  "actor_user_id": "uuid-actor",
  "payload": {}
}
```

**Validasi server-side wajib:**
1. Verifikasi JWT actor (Supabase Auth)
2. Lookup role actor di `channel_roles`
3. Jalankan logika setara `canPerformAction()` dari `permissions.ts`
4. Eksekusi write dengan `SUPABASE_SERVICE_ROLE_KEY`
5. Insert audit log ke `channel_moderation_logs`
6. Return `{ success: true }` atau `{ error: "forbidden" }`

### Langkah Developer

```
□ Buat supabase/functions/moderate-channel/index.ts
□ Port logic dari permissions.ts (atau share types)
□ Update useModerationActions.ts → panggil Edge Function, bukan supabase.from().insert()
□ Deploy: supabase functions deploy moderate-channel
□ Test: user guest coba ban → harus ditolak server
□ Test: PJC ban guest → harus sukses
```

### Verifikasi SEC-04

| Skenario | Expected |
|----------|----------|
| Guest panggil API ban | 403 Forbidden |
| Operator ban guest | 200 OK + log tercatat |
| Guest bypass client, panggil REST langsung | RLS block (SEC-03) |
| PJC mute member via app | 200 OK |

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## SEC-05 — Hapus Auto-Assign PJC "pawon salam"

**Temuan audit:** V4-02  
**Siapa:** **Developer**  
**File:** `src/features/moderation/useChannelRole.ts`

### Langkah Developer

```typescript
// HAPUS seluruh blok berikut (sekitar baris 44–69):
const isPawonSalam = currentName.trim().toLowerCase() === 'pawon salam';
if (isPawonSalam) { ... }
```

Opsional: hapus juga `scratch/register_pawon_salam.js` jika tidak dipakai.

### Verifikasi SEC-05

```
1. Login sebagai guest
2. Ubah nama tampilan menjadi "Pawon Salam"
3. Masuk channel 100
4. Cek role di channel_roles → harus tetap "guest", BUKAN "pjc"
```

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## SEC-06 — Validasi room_id Bootstrap PJC

**Temuan audit:** V4-03  
**Siapa:** **Developer**  
**File:** `src/features/moderation/useChannelRole.ts`

### Masalah

User pertama di `room_id` baru otomatis jadi PJC — termasuk room_id palsu yang tidak terdaftar.

### Langkah Developer

**Opsi A — Validasi channel terdaftar (jika tabel `channels` ada):**

```typescript
// Sebelum bootstrap PJC, tambahkan:
const { data: channelExists } = await supabaseInstance
  .from('channels')
  .select('id')
  .eq('supabase_room_id', roomId)
  .maybeSingle();

if (!channelExists) {
  return; // Room tidak valid — jangan bootstrap
}
```

**Opsi B — Nonaktifkan bootstrap otomatis sepenuhnya (lebih aman untuk beta):**

```typescript
// Hapus seluruh logika "first join = PJC"
// Semua role assignment via SEC-04 moderate-channel atau seed manual
```

Rekomendasi PRD v3: **Opsi B untuk beta**, Opsi A jika tabel channels sudah lengkap.

### Verifikasi SEC-06

```
1. Guest masuk channel 999 (belum di-seed)
2. Role harus "guest" — BUKAN auto-PJC
3. Hanya user yang di-seed manual yang punya role PJC/NOC
```

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## SEC-07 — Perbaiki CORS Edge Function TURN

**Temuan audit:** V4-04  
**Siapa:** **Developer**  
**File:** `supabase/functions/turn-credentials/index.ts`

### Cek kondisi saat ini

File sudah punya `ALLOWED_ORIGINS` — pastikan mencakup **semua origin production**:

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://nextvwt.vercel.app',
  'https://nextvwt.id',
  'https://www.nextvwt.id',
  'https://app.nextvwt.id',        // tambah jika dipakai
  'capacitor://localhost',          // Capacitor Android/iOS
  'http://localhost',               // Capacitor Android dev
];
```

### Langkah Developer

```
□ Tambah origin Capacitor ke ALLOWED_ORIGINS
□ Jangan gunakan '*' sebagai fallback
□ Jika origin tidak dikenal → return 403, bukan fallback ke localhost
□ Deploy: supabase functions deploy turn-credentials
□ Test dari app Android: WebRTC harus dapat TURN credentials
```

**Perbaikan fallback yang tidak aman:**

```typescript
// GANTI ini:
const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

// MENJADI ini:
if (!ALLOWED_ORIGINS.includes(origin)) {
  return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
const allowedOrigin = origin;
```

### Verifikasi SEC-07

| Skenario | Expected |
|----------|----------|
| Request dari localhost:5173 | 200 + ICE servers |
| Request dari capacitor://localhost | 200 + ICE servers |
| Request dari origin random | 403 |

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## SEC-08 — Seed Channel & Akun NOC

**Siapa:** **Owner** (Dashboard) + Developer (SQL script)

### Langkah Owner — Supabase Dashboard

```
1. Login Supabase Dashboard → Table Editor

2. Seed channel (jika tabel channels ada):
   - id: 100
   - name: "NextVWT Official"
   - supabase_room_id: "ptt-room-100"

3. Buat / identifikasi akun NOC Anda:
   - Login ke app dengan akun Google Anda
   - Catat user_id (UUID) dari auth.users

4. Insert role NOC manual (via SQL Editor dengan service role):
```

```sql
-- Ganti <YOUR_USER_UUID> dengan UUID akun Anda
INSERT INTO public.channel_roles (room_id, user_id, role, status)
VALUES ('ptt-room-100', '<YOUR_USER_UUID>', 'noc', 'active')
ON CONFLICT (room_id, user_id) DO UPDATE SET role = 'noc', status = 'active';
```

### Langkah Owner — TURN Secrets

```
Supabase Dashboard → Edge Functions → Secrets:

TURN_PROVIDER=metered
METERED_DOMAIN=<dari dashboard Metered.ca>
METERED_API_KEY=<dari dashboard Metered.ca>
```

### Verifikasi SEC-08

| Cek | Hasil |
|-----|-------|
| Channel 100 ada / room ptt-room-100 aktif | ☐ |
| Akun owner punya role `noc` di channel_roles | ☐ |
| TURN_PROVIDER terkonfigurasi | ☐ |
| App bisa fetch TURN credentials (lihat network tab) | ☐ |

**Status:** ☐ Belum · ☐ Selesai — Tanggal: __________

---

## Checklist Final Blok A

Centang semua sebelum nyatakan beta siap:

```
KEAMANAN:
□ SEC-01  Credential dirotasi
□ SEC-02  .env dihapus dari git history
□ SEC-03  RLS moderasi diperbaiki
□ SEC-04  Edge Function moderate-channel aktif
□ SEC-05  Auto-PJC pawon salam dihapus
□ SEC-06  Bootstrap PJC aman
□ SEC-07  CORS TURN diperbaiki
□ SEC-08  Channel + NOC di-seed

VERIFIKASI INTEGRASI:
□ Login Google + Guest masih berfungsi
□ PTT 2 user masih berfungsi
□ Moderasi mute/ban via app masih berfungsi
□ Tamu tidak bisa bypass moderasi via REST API

SIGN-OFF:
□ Owner sign-off — Tanggal: __________ Tanda tangan: __________
□ Developer sign-off — Tanggal: __________ Nama: __________
```

---

## Setelah Blok A — Langkah Berikutnya

1. Lanjut ke [NextVWT_Beta_Testing_Protocol.md](./NextVWT_Beta_Testing_Protocol.md)
2. Publish [Privacy Policy draft](./NextVWT_Privacy_Policy_dan_ToS_Draft.md) ke web
3. Rencanakan Audit v5 setelah verifikasi semua item di atas

---

*NextVWT Blok A Keamanan Runbook v1.0 · 9 Juni 2026*
