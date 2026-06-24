# NEXTVWT — Sistem Moderasi Channel 5 Level
**Status Implementasi:** ✅ Core selesai · 🟡 RLS perlu diperbaiki  
**Diperbarui:** Juni 2026

---

## 1. Status Implementasi Saat Ini

| Komponen | Status | File |
|----------|--------|------|
| Permissions engine | ✅ Selesai | `src/features/moderation/permissions.ts` |
| Unit tests (24 test) | ✅ Selesai | `src/features/moderation/permissions.test.ts` |
| Hook useChannelRole | ✅ Selesai | `src/features/moderation/useChannelRole.ts` |
| Hook useChannelSettings | ✅ Selesai | `src/features/moderation/useChannelSettings.ts` |
| Hook useModerationActions | ✅ Selesai | `src/features/moderation/useModerationActions.ts` |
| UI ChannelManagePanel | ✅ Selesai | `src/features/moderation/ChannelManagePanel.tsx` |
| UI ChannelMemberList | ✅ Selesai | `src/features/moderation/ChannelMemberList.tsx` |
| UI ChannelSettingsPanel | ✅ Selesai | `src/features/moderation/ChannelSettingsPanel.tsx` |
| UI ModerationLogPanel | ✅ Selesai | `src/features/moderation/ModerationLogPanel.tsx` |
| Database schema | ✅ Migration siap | `supabase/migrations/20260608201500_create_moderation_tables.sql` |
| RLS policies | 🔴 Perlu diperbaiki | `USING (true)` → perlu `auth.role() = 'service_role'` |
| Edge Function server-side | ❌ Belum dibuat | Perlu `supabase/functions/moderate-channel/` |
| Auto-assign fix | 🔴 Perlu dihapus | Logika "pawon salam" di `useChannelRole.ts` |

---

## 2. Hierarki 5 Level

### Level 1 — N.O.C (Network Operations Center)
- Kewenangan: **Semua** — override semua level
- Cakupan: **Global** — semua channel
- Assignment: Manual via Supabase Dashboard (seed script)
- Eksklusif: Angkat/copot Sys Admin, konfigurasi global platform

### Level 2 — Sys Admin
- Kewenangan: Semua kecuali kewenangan NOC
- Cakupan: **Global** — semua channel
- Assignment: Oleh NOC
- Eksklusif: Buat/hapus channel, angkat/copot PJC, platform ban

### Level 3 — PJC (Penanggung Jawab Channel)
- Kewenangan: Moderasi penuh di channel yang ditugaskan
- Cakupan: **Per-channel**
- Assignment: Oleh Sys Admin atau NOC
- Eksklusif: Kelola settings channel, angkat/copot Operator, buat pengumuman

### Level 4 — Operator Otomatis
- Kewenangan: Lihat panel admin + kelola karaoke queue
- Cakupan: **Per-channel**
- Assignment: Oleh PJC, Sys Admin, atau NOC
- Dapat dipromosi otomatis berdasarkan kriteria (join_count, tx_time)

### Level 5 — User Biasa / Tamu (Guest)
- Kewenangan: PTT, Chat, Reaction (tergantung setting channel)
- Tamu: tidak punya akun — UUID unik per sesi
- User terdaftar: punya akun Google, bisa punya role Operator/PJC

---

## 3. Matriks Kewenangan Lengkap

| Aksi | guest | operator | pjc | sys_admin | noc |
|------|:-----:|:--------:|:---:|:---------:|:---:|
| Transmit PTT | ✅* | ✅ | ✅ | ✅ | ✅ |
| Kirim Chat | ✅* | ✅ | ✅ | ✅ | ✅ |
| Kirim Reaction | ✅* | ✅ | ✅ | ✅ | ✅ |
| Lihat panel admin | ❌ | ✅ | ✅ | ✅ | ✅ |
| Kelola karaoke queue | ❌ | ✅ | ✅ | ✅ | ✅ |
| Mute user | ❌ | ❌ | ✅ | ✅ | ✅ |
| Block PTT user | ❌ | ❌ | ✅ | ✅ | ✅ |
| Block chat user | ❌ | ❌ | ✅ | ✅ | ✅ |
| Kick user | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ban user dari channel | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit nama/setting channel | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ganti tema channel | ❌ | ❌ | ✅ | ✅ | ✅ |
| Angkat/copot Operator | ❌ | ❌ | ✅ | ✅ | ✅ |
| Lihat log moderasi | ❌ | ❌ | ✅ | ✅ | ✅ |
| Buat/hapus channel | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ban platform-wide | ❌ | ❌ | ❌ | ✅ | ✅ |
| Angkat/copot PJC | ❌ | ❌ | ❌ | ✅ | ✅ |
| Angkat/copot Sys Admin | ❌ | ❌ | ❌ | ❌ | ✅ |

*Tergantung setting `allow_guest_ptt/chat/reaction` di channel

---

## 4. Status User yang Bisa Ditetapkan

| Status | Efek | Bisa Ditetapkan Oleh |
|--------|------|---------------------|
| `active` | Normal | — (default) |
| `muted` | Blokir PTT + Chat | Operator ke atas |
| `ptt_blocked` | Blokir PTT saja | PJC ke atas |
| `chat_blocked` | Blokir Chat saja | PJC ke atas |
| `suspended` | Blokir semua aksi | PJC ke atas |
| `banned` | Blokir permanen dari channel | PJC ke atas |

---

## 5. Issue Aktif yang Perlu Diselesaikan

### 🔴 RLS Policies Terlalu Permisif

Migration saat ini menggunakan `USING (true)` untuk semua write operation. Ini berarti siapapun bisa langsung memanipulasi tabel moderasi via Supabase REST API.

**Perbaikan yang diperlukan di `20260608201500_create_moderation_tables.sql`:**

```sql
-- Ganti policy write yang permisif:
DROP POLICY IF EXISTS "Admins and PJC can manage roles" ON public.channel_roles;
CREATE POLICY "Write only via service_role" ON public.channel_roles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Update only via service_role" ON public.channel_roles
  FOR UPDATE USING (auth.role() = 'service_role');
```

Semua write moderasi harus melewati Edge Function `moderate-channel` yang menggunakan `SUPABASE_SERVICE_ROLE_KEY`.

### 🟡 Hapus Auto-Assign PJC via Nama Tampilan

Di `useChannelRole.ts`, ada logika berbahaya:
```typescript
// HAPUS blok ini:
const isPawonSalam = currentName.trim().toLowerCase() === 'pawon salam';
if (isPawonSalam) { /* assign PJC */ }
```

Gunakan seed script di Supabase Dashboard untuk assign role initial.

---

## 6. Cara Menggunakan Komponen Moderasi

```typescript
// Di RadioLayout atau LCDPanel — tampilkan tombol kelola channel:
import { ChannelManagePanel } from '@/features/moderation/ChannelManagePanel';
import { canPerformAction } from '@/features/moderation/permissions';
import { useChannelRole } from '@/features/moderation/useChannelRole';

function RadioLayout() {
  const { role } = useChannelRole(roomId, userId);
  const [showPanel, setShowPanel] = useState(false);

  // Tampilkan tombol hanya jika punya akses
  const canManage = canPerformAction(role, 'VIEW_ADMIN_PANEL');

  return (
    <>
      {canManage && (
        <button onClick={() => setShowPanel(true)}>⚙️ Kelola Channel</button>
      )}
      {showPanel && (
        <ChannelManagePanel
          roomId={roomId}
          userId={userId}
          initialChannelName={channelName}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
}
```

---

*NEXTVWT_MODERASI_CHANNEL_HIRARKI.md · v2.0 · Juni 2026*
