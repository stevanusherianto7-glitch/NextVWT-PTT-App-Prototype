# NEXTVWT — DRAFT FITUR MODERASI CHANNEL BERDASARKAN HIRARKI

## 1. Tujuan Fitur

Fitur moderasi channel dibuat untuk memastikan setiap channel di NextVWT memiliki sistem pengelolaan yang tertib, aman, dan terstruktur. Sistem ini mengatur siapa yang berwenang mengelola channel, mengatur akses user, menangani tamu, mengontrol fitur PTT, chat, reaction, karaoke queue, song request, theme, serta mencatat seluruh aktivitas moderasi.

Moderasi channel bersifat **room-based**, artinya setiap channel memiliki pengelolaan sendiri. Seorang user dapat menjadi **PJC** di satu channel, tetapi hanya menjadi **User Biasa** di channel lain. Namun role tertinggi seperti **N.O.C** dan **Sys Admin** berlaku secara global di seluruh sistem.

---

## 2. Hirarki Moderasi

```text
1. N.O.C
   ↓
2. Sys Admin
   ↓
3. PJC / Penanggung Jawab Channel
   ↓
4. Operator Otomatis / Anggota Tetap Channel
   ↓
5. User Biasa / Tamu / Guest
```

---

## 3. Definisi Peran

### 3.1 N.O.C

**N.O.C** adalah pemegang kontrol tertinggi dalam sistem NextVWT. Role ini dimiliki oleh pemilik/pengelola utama sistem.

Wewenang N.O.C:

```text
- Mengakses seluruh channel.
- Membuat, menghapus, mengunci, dan membuka channel.
- Menunjuk atau mencabut Sys Admin.
- Menunjuk atau mencabut PJC.
- Mengambil alih semua channel jika terjadi masalah.
- Melihat log moderasi global.
- Mengatur konfigurasi sistem utama.
- Mengatur fitur global seperti TURN, PTT, chat, reaction, karaoke, theme, dan keamanan.
- Melakukan suspend global terhadap user bermasalah.
```

Batasan utama:

```text
- N.O.C tidak boleh dibatasi oleh PJC, Operator, Guest, atau Sys Admin.
- Role N.O.C tidak boleh diubah oleh role lain.
```

---

### 3.2 Sys Admin

**Sys Admin** adalah administrator sistem yang membantu N.O.C menjaga stabilitas teknis dan operasional aplikasi.

Wewenang Sys Admin:

```text
- Mengelola channel secara global.
- Membantu membuat dan mengatur channel.
- Menunjuk atau mengganti PJC atas izin N.O.C.
- Melihat log moderasi seluruh channel.
- Mengatur konfigurasi teknis channel.
- Melakukan mute, kick, ban, lock room, dan unlock room.
- Mengatur fitur channel seperti chat, reaction, karaoke queue, dan theme.
- Menangani pelanggaran berat.
```

Batasan Sys Admin:

```text
- Tidak bisa mengubah role N.O.C.
- Tidak bisa membatasi akses N.O.C.
- Tidak boleh menghapus channel permanen tanpa otorisasi N.O.C jika aturan produksi mewajibkan approval.
```

---

### 3.3 PJC / Penanggung Jawab Channel

**PJC** adalah pengelola utama di satu channel tertentu. PJC bertanggung jawab atas ketertiban channel yang dikelolanya.

Wewenang PJC:

```text
- Mengelola channel yang menjadi tanggung jawabnya.
- Menyetujui anggota tetap channel.
- Mengatur Operator Otomatis.
- Mengatur password channel jika channel bersifat terbatas.
- Mengaktifkan atau menonaktifkan fitur chat.
- Mengaktifkan atau menonaktifkan reaction.
- Mengatur karaoke queue dan song request.
- Melakukan mute, kick, atau suspend sementara pada user di channel tersebut.
- Mengatur tema/skin channel.
- Melihat log aktivitas channel miliknya.
```

Batasan PJC:

```text
- Tidak bisa menghapus channel tanpa izin N.O.C/Sys Admin.
- Tidak bisa mengatur channel lain.
- Tidak bisa mencabut akses N.O.C atau Sys Admin.
- Tidak bisa mengubah konfigurasi global aplikasi.
- Tidak bisa mengubah user dengan role setara atau lebih tinggi.
```

---

### 3.4 Operator Otomatis / Anggota Tetap Channel

**Operator Otomatis** adalah anggota tetap channel yang dipercaya untuk membantu menjaga aktivitas channel, tetapi tidak memiliki wewenang penuh seperti PJC.

Istilah “Operator Otomatis” dipakai untuk user yang sudah menjadi warga tetap channel dan sistem otomatis memberi akses lebih tinggi dibanding tamu.

Wewenang Operator Otomatis:

```text
- Masuk channel tanpa perlu persetujuan ulang.
- Menggunakan PTT sesuai aturan channel.
- Menggunakan chat dan reaction jika diaktifkan.
- Masuk antrian karaoke.
- Membantu melaporkan user bermasalah.
- Menggunakan fitur channel yang hanya dibuka untuk anggota tetap.
- Bisa diberi akses terbatas untuk skip antrian atau bantu moderasi ringan jika PJC mengizinkan.
```

Batasan Operator Otomatis:

```text
- Tidak bisa menghapus user.
- Tidak bisa mengubah password channel.
- Tidak bisa mengganti PJC.
- Tidak bisa mengatur theme channel kecuali diberi permission khusus.
- Tidak bisa mengunci atau membuka channel.
- Tidak bisa mengubah konfigurasi utama channel.
```

---

### 3.5 User Biasa / Tamu / Guest

**User Biasa** adalah pengguna yang masuk sebagai tamu ke channel. Aksesnya paling terbatas.

Wewenang User Biasa:

```text
- Masuk channel publik.
- Mendengar percakapan.
- Menggunakan PTT jika channel mengizinkan.
- Mengirim chat jika chat dibuka untuk tamu.
- Mengirim reaction jika reaction dibuka untuk tamu.
- Mengajukan request menjadi anggota tetap.
```

Batasan User Biasa:

```text
- Tidak bisa mengatur channel.
- Tidak bisa melihat panel admin.
- Tidak bisa mengelola user lain.
- Bisa dibatasi PTT-nya.
- Bisa dibatasi chat-nya.
- Bisa dikeluarkan oleh PJC, Sys Admin, atau N.O.C.
```

---

## 4. Struktur Role Teknis

Gunakan role berikut di codebase:

```ts
export type ChannelRole =
  | "noc"
  | "sys_admin"
  | "pjc"
  | "operator"
  | "guest";
```

Tambahkan juga status kontrol user:

```ts
export type ChannelUserStatus =
  | "active"
  | "muted"
  | "ptt_blocked"
  | "chat_blocked"
  | "suspended"
  | "banned";
```

---

## 5. Matriks Hak Akses

| Fitur | N.O.C | Sys Admin | PJC | Operator | Guest |
|---|---:|---:|---:|---:|---:|
| Masuk semua channel | ✅ | ✅ | ❌ | ❌ | ❌ |
| Buat channel | ✅ | ✅ | ⚠️ izin | ❌ | ❌ |
| Hapus channel | ✅ | ⚠️ izin | ❌ | ❌ | ❌ |
| Lock/unlock channel | ✅ | ✅ | ✅ channel sendiri | ❌ | ❌ |
| Ganti PJC | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tambah anggota tetap | ✅ | ✅ | ✅ | ❌ | ❌ |
| Jadikan operator | ✅ | ✅ | ✅ | ❌ | ❌ |
| Kick user | ✅ | ✅ | ✅ channel sendiri | ❌ | ❌ |
| Ban user dari channel | ✅ | ✅ | ✅ channel sendiri | ❌ | ❌ |
| Mute user | ✅ | ✅ | ✅ | ⚠️ opsional | ❌ |
| Blokir PTT user | ✅ | ✅ | ✅ | ❌ | ❌ |
| Blokir chat user | ✅ | ✅ | ✅ | ❌ | ❌ |
| Atur chat/reaction | ✅ | ✅ | ✅ | ❌ | ❌ |
| Atur karaoke queue | ✅ | ✅ | ✅ | ⚠️ opsional | ❌ |
| Atur theme/skin channel | ✅ | ✅ | ✅ | ❌ | ❌ |
| Lihat log channel | ✅ semua | ✅ semua | ✅ channel sendiri | ❌ | ❌ |
| Lihat panel admin | ✅ | ✅ | ✅ | ⚠️ mini panel | ❌ |

---

## 6. Fitur Pengelolaan Channel di Tiap Channel

Setiap channel wajib memiliki menu **Kelola Channel**. Menu ini hanya muncul untuk role:

```text
- N.O.C
- Sys Admin
- PJC
- Operator Otomatis (dengan batasan menu/mini panel)
```

Isi menu **Kelola Channel**:

```text
1. Info Channel
2. Daftar Anggota
3. Role & Akses
4. Moderasi User
5. Pengaturan PTT
6. Pengaturan Chat
7. Pengaturan Reaction
8. Pengaturan Karaoke Queue
9. Pengaturan Song Request
10. Theme / Skin Channel
11. Password / Akses Channel
12. Log Aktivitas Channel
```

---

### 6.1 Info Channel

Berisi:

```text
- Nomor channel
- Nama channel
- Deskripsi channel
- Status channel: public/private/password/locked/hidden
- PJC aktif
- Jumlah anggota tetap
- Jumlah tamu online
- Theme aktif
```

---

### 6.2 Daftar Anggota

Fitur:

```text
- Lihat semua anggota tetap.
- Lihat tamu yang sedang online.
- Tambah user menjadi anggota tetap.
- Hapus user dari anggota tetap.
- Ubah role user.
- Tandai user sebagai operator.
```

---

### 6.3 Role & Akses

Fitur:

```text
- Tetapkan PJC.
- Tetapkan Operator.
- Turunkan Operator menjadi user biasa.
- Batasi hak guest.
- Batasi hak operator.
```

---

### 6.4 Moderasi User

Aksi moderasi:

```text
- Mute user sementara.
- Blokir PTT user.
- Blokir chat user.
- Kick user dari channel.
- Ban user dari channel.
- Unban user.
- Reset pelanggaran user.
```

Durasi moderasi:

```text
5 menit
15 menit
1 jam
24 jam
Permanen
```

---

### 6.5 Pengaturan PTT

Fitur:

```text
- PTT untuk semua user.
- PTT hanya anggota tetap.
- PTT hanya operator dan PJC.
- Guest hanya bisa dengar.
- Cooldown PTT per user.
- Maksimal durasi bicara.
```

Contoh aturan:

```text
Guest maksimal bicara 15 detik.
Operator maksimal bicara 60 detik.
PJC tanpa batas khusus.
```

---

### 6.6 Pengaturan Chat

Fitur:

```text
- Chat aktif/nonaktif.
- Guest boleh chat / tidak.
- Slow mode chat.
- Filter kata kasar.
- Hapus pesan.
- Pin pesan admin.
```

---

### 6.7 Pengaturan Reaction

Fitur:

```text
- Reaction aktif/nonaktif.
- Guest boleh kirim reaction / tidak.
- Cooldown reaction.
- Batasi reaction tertentu.
- Matikan animasi berat untuk mode hemat.
```

---

### 6.8 Pengaturan Karaoke Queue

Fitur:

```text
- Aktif/nonaktif antrian karaoke.
- Guest boleh ikut antrian / tidak.
- Operator boleh bantu skip / tidak.
- PJC bisa atur urutan.
- Maksimal durasi tampil.
- Mode otomatis next queue.
```

Karena fitur **Live Stage Karaoke** sudah dihapus, status karaoke cukup memakai:

```text
waiting
ready
active
skipped
finished
cancelled
```

---

### 6.9 Pengaturan Song Request

Fitur:

```text
- Aktif/nonaktif request lagu.
- Guest boleh request / tidak.
- Vote lagu.
- Hapus request.
- Tandai lagu sudah dipakai.
```

---

### 6.10 Theme / Skin Channel

Fitur:

```text
- Pilih theme channel.
- Upload logo channel.
- Pilih warna aksen.
- Pilih background.
- Reset theme ke default.
```

Contoh theme:

```text
Classic Radio
Green Crystal
Dark Premium
Gold Karaoke
Aquarium Skin
Gaming Neon
Community Skin
```

---

### 6.11 Password / Akses Channel

Mode channel:

```text
public      = semua user bisa masuk
private     = hanya anggota tetap
password    = masuk dengan password
locked      = channel dikunci sementara
hidden      = tidak muncul di daftar publik
```

---

### 6.12 Log Aktivitas Channel

Log yang disimpan:

```text
- User masuk channel.
- User keluar channel.
- User diangkat menjadi operator.
- User diturunkan role.
- User di-mute.
- User di-kick.
- User di-ban.
- Setting channel berubah.
- Chat dihapus.
- Theme diganti.
- Queue diubah.
```

---

## 7. Struktur Database Supabase

### 7.1 Tabel `channel_roles`

```sql
create table if not exists public.channel_roles (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  role text not null default 'guest',
  status text not null default 'active',
  assigned_by text,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  unique(room_id, user_id)
);

create index if not exists channel_roles_room_idx
on public.channel_roles(room_id);

create index if not exists channel_roles_user_idx
on public.channel_roles(user_id);
```

---

### 7.2 Tabel `channel_settings`

```sql
create table if not exists public.channel_settings (
  room_id text primary key,
  channel_name text not null,
  channel_description text,
  channel_mode text not null default 'public',
  channel_password_hash text,
  pjc_user_id text,
  theme_key text not null default 'green-crystal',

  allow_guest_ptt boolean not null default true,
  allow_guest_chat boolean not null default true,
  allow_guest_reaction boolean not null default true,
  allow_guest_queue boolean not null default false,
  allow_guest_song_request boolean not null default true,

  chat_enabled boolean not null default true,
  reaction_enabled boolean not null default true,
  karaoke_queue_enabled boolean not null default true,
  song_request_enabled boolean not null default true,

  ptt_cooldown_seconds integer not null default 2,
  guest_max_ptt_seconds integer not null default 15,
  member_max_ptt_seconds integer not null default 60,

  slow_mode_seconds integer not null default 0,

  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### 7.3 Tabel `channel_bans`

```sql
create table if not exists public.channel_bans (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  reason text,
  banned_by text not null,
  banned_at timestamptz not null default now(),
  expires_at timestamptz,
  unique(room_id, user_id)
);

create index if not exists channel_bans_room_user_idx
on public.channel_bans(room_id, user_id);
```

---

### 7.4 Tabel `channel_moderation_logs`

```sql
create table if not exists public.channel_moderation_logs (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  actor_id text not null,
  actor_role text not null,
  target_user_id text,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists channel_moderation_logs_room_idx
on public.channel_moderation_logs(room_id, created_at desc);
```

---

## 8. Logika Permission di Codebase

Buat file:

```text
src/features/moderation/permissions.ts
```

Isi awal:

```ts
export type ChannelRole = "noc" | "sys_admin" | "pjc" | "operator" | "guest";

export type ModerationAction =
  | "VIEW_ADMIN_PANEL"
  | "MANAGE_CHANNEL"
  | "MANAGE_ROLES"
  | "MANAGE_SETTINGS"
  | "MUTE_USER"
  | "KICK_USER"
  | "BAN_USER"
  | "BLOCK_PTT"
  | "BLOCK_CHAT"
  | "MANAGE_QUEUE"
  | "MANAGE_THEME"
  | "VIEW_LOGS";

const roleRank: Record<ChannelRole, number> = {
  guest: 1,
  operator: 2,
  pjc: 3,
  sys_admin: 4,
  noc: 5,
};

export function isHigherRole(actor: ChannelRole, target: ChannelRole) {
  return roleRank[actor] > roleRank[target];
}

export function canModerateRole(actor: ChannelRole, target: ChannelRole) {
  if (actor === "noc") return target !== "noc";
  if (actor === "sys_admin") return target !== "noc" && target !== "sys_admin";
  if (actor === "pjc") return target === "operator" || target === "guest";
  return false;
}

export function canPerformAction(role: ChannelRole, action: ModerationAction) {
  const permissions: Record<ChannelRole, ModerationAction[]> = {
    noc: [
      "VIEW_ADMIN_PANEL",
      "MANAGE_CHANNEL",
      "MANAGE_ROLES",
      "MANAGE_SETTINGS",
      "MUTE_USER",
      "KICK_USER",
      "BAN_USER",
      "BLOCK_PTT",
      "BLOCK_CHAT",
      "MANAGE_QUEUE",
      "MANAGE_THEME",
      "VIEW_LOGS",
    ],
    sys_admin: [
      "VIEW_ADMIN_PANEL",
      "MANAGE_CHANNEL",
      "MANAGE_ROLES",
      "MANAGE_SETTINGS",
      "MUTE_USER",
      "KICK_USER",
      "BAN_USER",
      "BLOCK_PTT",
      "BLOCK_CHAT",
      "MANAGE_QUEUE",
      "MANAGE_THEME",
      "VIEW_LOGS",
    ],
    pjc: [
      "VIEW_ADMIN_PANEL",
      "MANAGE_SETTINGS",
      "MUTE_USER",
      "KICK_USER",
      "BAN_USER",
      "BLOCK_PTT",
      "BLOCK_CHAT",
      "MANAGE_QUEUE",
      "MANAGE_THEME",
      "VIEW_LOGS",
    ],
    operator: ["VIEW_ADMIN_PANEL", "MANAGE_QUEUE"],
    guest: [],
  };

  return permissions[role].includes(action);
}
```

---

## 9. Struktur Folder Fitur Moderasi

```text
src/
  features/
    moderation/
      types.ts
      permissions.ts
      useChannelRole.ts
      useChannelSettings.ts
      useModerationActions.ts
      ChannelManagePanel.tsx
      ChannelMemberList.tsx
      ChannelRoleEditor.tsx
      ChannelSettingsPanel.tsx
      ModerationLogPanel.tsx
      moderation.css
```

---

## 10. Hook Role Channel

File:

```text
src/features/moderation/useChannelRole.ts
```

Contoh:

```ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { ChannelRole } from "./permissions";

export function useChannelRole(roomId: string, userId: string) {
  const [role, setRole] = useState<ChannelRole>("guest");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !userId) return;

    let mounted = true;

    async function loadRole() {
      setLoading(true);

      const { data } = await supabase
        .from("channel_roles")
        .select("role,status")
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!mounted) return;

      setRole((data?.role as ChannelRole) || "guest");
      setStatus(data?.status || "active");
      setLoading(false);
    }

    loadRole();

    const channel = supabase
      .channel(`channel-role:${roomId}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channel_roles",
          filter: `room_id=eq.${roomId}`,
        },
        () => loadRole()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  return {
    role,
    status,
    loading,
  };
}
```

---

## 11. Hook Aksi Moderasi

File:

```text
src/features/moderation/useModerationActions.ts
```

Contoh:

```ts
import { supabase } from "../../lib/supabase";
import type { ChannelRole } from "./permissions";
import { canPerformAction, canModerateRole } from "./permissions";

type ModerationContext = {
  roomId: string;
  actorId: string;
  actorRole: ChannelRole;
};

export function useModerationActions({
  roomId,
  actorId,
  actorRole,
}: ModerationContext) {
  async function logAction(
    action: string,
    targetUserId?: string,
    detail?: Record<string, unknown>
  ) {
    await supabase.from("channel_moderation_logs").insert({
      room_id: roomId,
      actor_id: actorId,
      actor_role: actorRole,
      target_user_id: targetUserId || null,
      action,
      detail: detail || {},
    });
  }

  async function setUserRole(
    targetUserId: string,
    targetCurrentRole: ChannelRole,
    nextRole: ChannelRole
  ) {
    if (!canPerformAction(actorRole, "MANAGE_ROLES")) {
      throw new Error("Anda tidak memiliki izin mengubah role.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa mengubah user dengan role lebih tinggi/setara.");
    }

    await supabase.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      role: nextRole,
      status: "active",
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    await logAction("SET_USER_ROLE", targetUserId, {
      nextRole,
      previousRole: targetCurrentRole,
    });
  }

  async function muteUser(targetUserId: string, minutes = 15) {
    if (!canPerformAction(actorRole, "MUTE_USER")) {
      throw new Error("Anda tidak memiliki izin mute user.");
    }

    const expiresAt = new Date(Date.now() + minutes * 60_000).toISOString();

    await supabase.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "muted",
      expires_at: expiresAt,
    });

    await logAction("MUTE_USER", targetUserId, { minutes, expiresAt });
  }

  async function blockPTT(targetUserId: string, minutes = 15) {
    if (!canPerformAction(actorRole, "BLOCK_PTT")) {
      throw new Error("Anda tidak memiliki izin blokir PTT.");
    }

    const expiresAt = new Date(Date.now() + minutes * 60_000).toISOString();

    await supabase.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "ptt_blocked",
      expires_at: expiresAt,
    });

    await logAction("BLOCK_PTT", targetUserId, { minutes, expiresAt });
  }

  async function kickUser(targetUserId: string) {
    if (!canPerformAction(actorRole, "KICK_USER")) {
      throw new Error("Anda tidak memiliki izin kick user.");
    }

    await logAction("KICK_USER", targetUserId);

    await supabase.channel(`room:${roomId}:moderation`).send({
      type: "broadcast",
      event: "kick",
      payload: {
        roomId,
        targetUserId,
        actorId,
        createdAt: Date.now(),
      },
    });
  }

  async function banUser(targetUserId: string, reason?: string) {
    if (!canPerformAction(actorRole, "BAN_USER")) {
      throw new Error("Anda tidak memiliki izin ban user.");
    }

    await supabase.from("channel_bans").upsert({
      room_id: roomId,
      user_id: targetUserId,
      reason: reason || null,
      banned_by: actorId,
      banned_at: new Date().toISOString(),
    });

    await logAction("BAN_USER", targetUserId, { reason });

    await kickUser(targetUserId);
  }

  return {
    setUserRole,
    muteUser,
    blockPTT,
    kickUser,
    banUser,
  };
}
```

---

## 12. Integrasi ke PTT

Sebelum user bisa menekan PTT, cek role dan status.

```ts
function canUsePTT(params: {
  role: ChannelRole;
  status: string;
  allowGuestPTT: boolean;
}) {
  const { role, status, allowGuestPTT } = params;

  if (status === "muted") return false;
  if (status === "ptt_blocked") return false;
  if (status === "banned") return false;

  if (role === "guest" && !allowGuestPTT) return false;

  return true;
}
```

Di tombol PTT:

```tsx
const pttAllowed = canUsePTT({
  role,
  status,
  allowGuestPTT: channelSettings.allow_guest_ptt,
});

<PTTButton
  disabled={!pttAllowed}
  onPress={pttAllowed ? startPTT : undefined}
/>
```

---

## 13. Integrasi ke Chat

```ts
function canUseChat(params: {
  role: ChannelRole;
  status: string;
  allowGuestChat: boolean;
}) {
  const { role, status, allowGuestChat } = params;

  if (status === "muted") return false;
  if (status === "chat_blocked") return false;
  if (status === "banned") return false;

  if (role === "guest" && !allowGuestChat) return false;

  return true;
}
```

---

## 14. Integrasi ke Reaction

```ts
function canUseReaction(params: {
  role: ChannelRole;
  status: string;
  allowGuestReaction: boolean;
}) {
  const { role, status, allowGuestReaction } = params;

  if (status === "muted") return false;
  if (status === "banned") return false;

  if (role === "guest" && !allowGuestReaction) return false;

  return true;
}
```

---

## 15. UI Panel Kelola Channel

Contoh struktur panel:

```tsx
export function ChannelManagePanel() {
  return (
    <div className="channel-manage-panel">
      <header>
        <h2>Kelola Channel</h2>
        <p>Atur anggota, akses, fitur, dan keamanan channel.</p>
      </header>

      <nav className="manage-tabs">
        <button>Info</button>
        <button>Anggota</button>
        <button>Role</button>
        <button>Moderasi</button>
        <button>PTT</button>
        <button>Chat</button>
        <button>Reaction</button>
        <button>Karaoke</button>
        <button>Theme</button>
        <button>Log</button>
      </nav>

      <section>
        {/* Render tab aktif */}
      </section>
    </div>
  );
}
```

---

## 16. Diagram Logika Moderasi

```text
User masuk channel
        ↓
Cek channel_bans
        ↓
Jika banned → tolak masuk / keluar otomatis
        ↓
Load channel_roles
        ↓
Jika tidak ada role → guest
        ↓
Load channel_settings
        ↓
Terapkan akses:
- PTT
- Chat
- Reaction
- Queue
- Song Request
        ↓
Jika role PJC/SysAdmin/NOC
        ↓
Tampilkan Kelola Channel
```

---

## 17. Flow Aksi Moderasi

```text
PJC klik user
        ↓
Pilih aksi: mute / block PTT / kick / ban
        ↓
Frontend cek permission
        ↓
Supabase update channel_roles atau channel_bans
        ↓
Catat ke channel_moderation_logs
        ↓
Realtime broadcast ke room
        ↓
Client target menerima efek:
- muted
- PTT disabled
- chat disabled
- keluar dari room jika kick/ban
```

---

## 18. Catatan Penting Produksi

Untuk produksi, jangan hanya mengandalkan validasi frontend. Wajib tambahkan:

```text
- RLS Supabase.
- Validasi role di Edge Function.
- Moderation log yang tidak bisa dihapus oleh PJC.
- Proteksi agar PJC tidak bisa mengatur N.O.C/Sys Admin.
- Proteksi agar user tidak bisa mengubah role sendiri.
- Proteksi agar guest tidak bisa akses admin panel lewat manipulasi UI.
```

---

## 19. Rekomendasi Implementasi Bertahap

### Tahap 1 — Database & Role Dasar

```text
- Buat tabel channel_roles.
- Buat tabel channel_settings.
- Buat tabel channel_bans.
- Buat tabel channel_moderation_logs.
- Buat permissions.ts.
- Buat useChannelRole.ts.
```

### Tahap 2 — Integrasi Akses PTT, Chat, Reaction

```text
- Integrasikan canUsePTT sebelum tombol PTT aktif.
- Integrasikan canUseChat sebelum user bisa mengirim chat.
- Integrasikan canUseReaction sebelum reaction terkirim.
- Tampilkan pesan alasan jika user dibatasi.
```

### Tahap 3 — Panel Kelola Channel

```text
- Buat ChannelManagePanel.tsx.
- Buat ChannelMemberList.tsx.
- Buat ChannelRoleEditor.tsx.
- Buat ChannelSettingsPanel.tsx.
- Buat ModerationLogPanel.tsx.
```

### Tahap 4 — Hardening Produksi

```text
- Tambahkan RLS.
- Tambahkan validasi role server-side.
- Tambahkan audit log immutable.
- Tambahkan proteksi anti self-role-edit.
- Tambahkan validasi agar PJC hanya mengatur channel miliknya.
```

---

## 20. Kesimpulan Draft

Sistem moderasi channel NextVWT harus dibuat bertingkat, dengan **N.O.C** sebagai kontrol tertinggi, **Sys Admin** sebagai administrator sistem, **PJC** sebagai penanggung jawab channel, **Operator Otomatis** sebagai anggota tetap yang membantu menjaga aktivitas channel, dan **User Biasa** sebagai tamu dengan akses terbatas.

Setiap channel wajib memiliki fitur **Kelola Channel** agar PJC dapat mengatur anggota, akses, chat, reaction, karaoke queue, theme, password, serta moderasi user tanpa mengganggu core PTT. Dengan sistem ini, NextVWT akan lebih siap digunakan sebagai aplikasi komunitas realtime yang tertib, aman, dan scalable.
