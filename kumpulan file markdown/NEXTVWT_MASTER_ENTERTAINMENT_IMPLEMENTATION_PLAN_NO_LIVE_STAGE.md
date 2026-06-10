# NEXTVWT MASTER ENTERTAINMENT IMPLEMENTATION PLAN
## Integrasi Lottie Reaction, Chat Room, dan Fitur Entertainment Lanjutan

**Nama proyek:** NextVWT PTT App Prototype  
**Target dokumen:** Master instruksi kerja dan implementation plan  
**Cakupan:** Lottie Reaction, Chat Room, Smart Presence, Karaoke Queue, Song Request, Badge & Level, Channel Theme, Mini Mixer, AI Karaoke Assistant, Admin Panel, Leaderboard  
**Platform awal:** React / Vite / TypeScript / Supabase Realtime  
**Status dokumen:** Siap digunakan sebagai panduan kerja developer atau AI coding agent seperti Antigravity AI

> **Update permintaan terbaru:** fitur **Live Stage Karaoke** dihapus dari scope. Karaoke tetap didukung melalui **Karaoke Queue**, **Song Request**, **Reaction**, dan **Smart Presence** tanpa membuat panel panggung/live-stage terpisah.

---

## Ringkasan Master Plan

Dokumen ini merupakan gabungan dari dua dokumen implementasi NextVWT:

1. **Integrasi Lottie Reaction dan Chat Room Antar User**  
   Fokus pada dua fitur realtime inti: animasi apresiasi karaoke berbasis Lottie dan chat antar user dalam satu channel/room.

2. **Entertainment Features Implementation Plan**  
   Fokus pada fitur lanjutan agar NextVWT berkembang menjadi platform komunitas hiburan realtime, bukan hanya aplikasi push-to-talk biasa.

Urutan implementasi yang disarankan:

```text
Phase 1 — Engagement Core
1. Lottie Reaction
2. Chat Room
3. Smart Presence

Phase 2 — Karaoke Experience
4. Karaoke Queue
6. Song Request

Phase 3 — Identity & Retention
7. Badge & Level User
8. Leaderboard Channel
9. Channel Theme / Skin

Phase 4 — Power Features
10. Admin Panel Channel
11. AI Karaoke Assistant
12. Mini Mixer Karaoke
```

---

# BAGIAN 1 — LOTTIE REACTION DAN CHAT ROOM

# Instruksi Kerja & Implementation Plan
## Integrasi Lottie Reaction dan Chat Room Antar User — NextVWT

**Nama proyek:** NextVWT PTT App Prototype  
**Target fitur:** Animasi apresiasi karaoke berbasis Lottie dan chat realtime antar user dalam satu channel/room  
**Platform awal:** React / Vite / TypeScript / Supabase Realtime  
**Status dokumen:** Siap digunakan sebagai panduan kerja developer atau AI coding agent seperti Antigravity AI

---

## 1. Ringkasan Tujuan

Dokumen ini menjelaskan rencana kerja teknis untuk menambahkan dua fitur realtime pada aplikasi NextVWT:

1. **Lottie Reaction Overlay**  
   User dapat mengirim animasi apresiasi seperti tepuk tangan, love, fire, crown, confetti, atau wow ketika ada user lain sedang karaoke. Animasi muncul di tengah UI dan terlihat oleh semua user yang tergabung dalam channel/room yang sama.

2. **Channel Chat Room**  
   User yang tergabung dalam channel/room yang sama dapat saling mengirim pesan teks realtime. Chat ini terpisah dari sistem audio PTT agar tidak mengganggu jalur komunikasi suara.

Kedua fitur harus dibuat ringan, aman, realtime, dan tidak merusak fitur utama NextVWT seperti PTT, channel, user list, SET/settings, karaoke/music module, dan tampilan skeuomorphic/glass crystal.

---

## 2. Prinsip Implementasi

### 2.1 Prinsip untuk Lottie Reaction

- Reaction bersifat **ephemeral**, yaitu tampil sebentar lalu hilang otomatis.
- Reaction tidak perlu disimpan permanen di database pada tahap awal.
- Payload realtime harus kecil.
- Jangan mengirim file Lottie JSON melalui payload realtime.
- Asset animasi harus disimpan lokal di aplikasi, misalnya di `public/animations/`.
- Reaction harus memakai whitelist dari `reactionCatalog.ts`.
- Harus ada cooldown agar user tidak spam.
- Overlay harus memakai `pointer-events: none` agar tidak mengganggu tombol PTT.
- Animasi muncul di tengah UI, durasi ideal 2–3 detik.

### 2.2 Prinsip untuk Chat Room

- Chat bersifat realtime dan tersimpan di database.
- Pesan hanya ditampilkan untuk user yang berada dalam room/channel yang sama.
- Chat tidak boleh digabung dengan jalur audio PTT.
- Chat harus memiliki limit panjang pesan.
- Harus ada cooldown anti-spam.
- UI chat harus bisa dibuka/tutup atau diminimize.
- Chat harus tetap ringan pada perangkat mobile.

---

## 3. Arsitektur Umum

```text
NextVWT Client
   ├── PTT Audio Core
   ├── Karaoke Module
   ├── Lottie Reaction Overlay
   └── Channel Chat Panel

Supabase
   ├── Realtime Broadcast untuk reaction
   ├── Database table channel_messages
   └── Realtime postgres_changes untuk chat
```

### 3.1 Alur Reaction Lottie

```text
User klik reaction
        ↓
Client validasi cooldown
        ↓
Client broadcast event reaction ke room realtime
        ↓
Semua user dalam room menerima event
        ↓
ReactionOverlay menampilkan animasi Lottie di tengah UI
        ↓
Animasi hilang otomatis setelah durasi tertentu
```

### 3.2 Alur Chat Room

```text
User mengetik pesan
        ↓
Client validasi panjang pesan dan cooldown
        ↓
Pesan disimpan ke table channel_messages
        ↓
Supabase Realtime mengirim INSERT event ke user dalam room
        ↓
ChannelChatPanel menampilkan pesan terbaru
```

---

## 4. Struktur Folder yang Disarankan

Tambahkan struktur berikut pada project NextVWT:

```text
src/
  features/
    reactions/
      types.ts
      reactionCatalog.ts
      useRoomReactions.ts
      ReactionOverlay.tsx
      ReactionPicker.tsx
      roomReaction.css

    chat/
      types.ts
      useChannelChat.ts
      ChannelChatPanel.tsx
      ChannelChatButton.tsx
      channelChat.css

public/
  animations/
    applause.json
    heart-burst.json
    fire-burst.json
    crown-glow.json
    confetti.json
    wow-star.json
```

Jika project sudah memiliki struktur `components/`, fitur ini tetap lebih baik dipisahkan ke `features/` agar mudah dirawat.

---

## 5. Dependency yang Perlu Ditambahkan

Gunakan `lottie-react` untuk menampilkan animasi Lottie pada React/Vite.

```bash
pnpm add lottie-react
```

Jika project belum memiliki TypeScript sebagai dependency dev yang eksplisit:

```bash
pnpm add -D typescript
```

Setelah install:

```bash
pnpm install
pnpm type-check
pnpm build
```

---

## 6. Implementasi Fitur Lottie Reaction

### 6.1 File `src/features/reactions/types.ts`

```ts
export type ReactionKind =
  | "applause"
  | "love"
  | "wow"
  | "fire"
  | "crown"
  | "confetti";

export interface RoomReactionEvent {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  targetUserId?: string;
  targetUserName?: string;
  reaction: ReactionKind;
  intensity?: 1 | 2 | 3;
  createdAt: number;
}

export type ActiveReaction = RoomReactionEvent & {
  expiresAt: number;
};
```

---

### 6.2 File `src/features/reactions/reactionCatalog.ts`

```ts
import type { ReactionKind } from "./types";

export const REACTION_CATALOG: Record<
  ReactionKind,
  {
    label: string;
    durationMs: number;
    asset: string;
  }
> = {
  applause: {
    label: "Tepuk Tangan",
    durationMs: 2600,
    asset: "/animations/applause.json",
  },
  love: {
    label: "Love",
    durationMs: 2400,
    asset: "/animations/heart-burst.json",
  },
  wow: {
    label: "Wow",
    durationMs: 2200,
    asset: "/animations/wow-star.json",
  },
  fire: {
    label: "Fire",
    durationMs: 2500,
    asset: "/animations/fire-burst.json",
  },
  crown: {
    label: "Superstar",
    durationMs: 2800,
    asset: "/animations/crown-glow.json",
  },
  confetti: {
    label: "Confetti",
    durationMs: 3000,
    asset: "/animations/confetti.json",
  },
};

export function isAllowedReaction(value: string): value is ReactionKind {
  return Object.prototype.hasOwnProperty.call(REACTION_CATALOG, value);
}
```

---

### 6.3 File `src/features/reactions/useRoomReactions.ts`

> Catatan: sesuaikan path `supabase` dengan struktur project kamu. Misalnya `../../lib/supabase` atau `../../services/supabase`.

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { REACTION_CATALOG, isAllowedReaction } from "./reactionCatalog";
import type { ActiveReaction, ReactionKind, RoomReactionEvent } from "./types";

type UseRoomReactionsProps = {
  roomId: string;
  currentUserId: string;
  currentUserName?: string;
};

export function useRoomReactions({
  roomId,
  currentUserId,
  currentUserName,
}: UseRoomReactionsProps) {
  const [activeReactions, setActiveReactions] = useState<ActiveReaction[]>([]);
  const lastSentAtRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const realtimeChannel = supabase.channel(`room:${roomId}:reactions`, {
      config: {
        broadcast: { self: true },
      },
    });

    channelRef.current = realtimeChannel;

    realtimeChannel.on("broadcast", { event: "reaction" }, ({ payload }) => {
      const event = payload as RoomReactionEvent;

      if (!event || event.roomId !== roomId) return;
      if (!isAllowedReaction(event.reaction)) return;

      const duration = REACTION_CATALOG[event.reaction].durationMs;

      setActiveReactions((prev) => [
        ...prev.slice(-4),
        {
          ...event,
          expiresAt: Date.now() + duration,
        },
      ]);
    });

    realtimeChannel.subscribe();

    return () => {
      channelRef.current = null;
      supabase.removeChannel(realtimeChannel);
    };
  }, [roomId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setActiveReactions((prev) => prev.filter((item) => item.expiresAt > now));
    }, 300);

    return () => window.clearInterval(timer);
  }, []);

  const sendReaction = useCallback(
    async (
      reaction: ReactionKind,
      targetUserId?: string,
      targetUserName?: string
    ) => {
      if (!roomId || !currentUserId) return;
      if (!isAllowedReaction(reaction)) return;

      const now = Date.now();
      const cooldownMs = 2000;

      if (now - lastSentAtRef.current < cooldownMs) {
        throw new Error("Tunggu sebentar sebelum mengirim reaction lagi.");
      }

      lastSentAtRef.current = now;

      const payload: RoomReactionEvent = {
        id: crypto.randomUUID(),
        roomId,
        senderId: currentUserId,
        senderName: currentUserName || "User",
        targetUserId,
        targetUserName,
        reaction,
        intensity: 1,
        createdAt: now,
      };

      const channel = channelRef.current;

      if (!channel) {
        throw new Error("Realtime reaction channel belum siap.");
      }

      await channel.send({
        type: "broadcast",
        event: "reaction",
        payload,
      });
    },
    [roomId, currentUserId, currentUserName]
  );

  return {
    activeReactions,
    sendReaction,
  };
}
```

---

### 6.4 File `src/features/reactions/ReactionOverlay.tsx`

```tsx
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { REACTION_CATALOG } from "./reactionCatalog";
import type { ActiveReaction } from "./types";
import "./roomReaction.css";

type ReactionOverlayProps = {
  reactions: ActiveReaction[];
};

export function ReactionOverlay({ reactions }: ReactionOverlayProps) {
  const latest = reactions[reactions.length - 1];
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    if (!latest) return;

    const meta = REACTION_CATALOG[latest.reaction];
    let cancelled = false;

    fetch(meta.asset)
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [latest?.id]);

  if (!latest) return null;

  const meta = REACTION_CATALOG[latest.reaction];

  return (
    <div className="reaction-overlay" aria-live="polite">
      <div className="reaction-center-card">
        <div className="reaction-badge">{meta.label}</div>

        <div className="reaction-lottie-box">
          {animationData ? (
            <Lottie animationData={animationData} loop={false} autoplay />
          ) : (
            <div className={`reaction-fallback reaction-${latest.reaction}`}>
              {meta.label}
            </div>
          )}
        </div>

        <div className="reaction-caption">
          <strong>{latest.senderName || "Seseorang"}</strong>
          {" mengirim "}
          <strong>{meta.label}</strong>
          {latest.targetUserName ? (
            <>
              {" untuk "}
              <strong>{latest.targetUserName}</strong>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

---

### 6.5 File `src/features/reactions/ReactionPicker.tsx`

```tsx
import { REACTION_CATALOG } from "./reactionCatalog";
import type { ReactionKind } from "./types";
import "./roomReaction.css";

type ReactionPickerProps = {
  onSend: (reaction: ReactionKind) => void;
};

export function ReactionPicker({ onSend }: ReactionPickerProps) {
  return (
    <div className="reaction-picker">
      {(Object.keys(REACTION_CATALOG) as ReactionKind[]).map((key) => (
        <button
          key={key}
          type="button"
          className="reaction-picker-btn"
          onClick={() => onSend(key)}
        >
          {REACTION_CATALOG[key].label}
        </button>
      ))}
    </div>
  );
}
```

---

### 6.6 File `src/features/reactions/roomReaction.css`

```css
.reaction-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.reaction-center-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: reactionFadeInOut 2.8s ease forwards;
}

.reaction-badge {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.68);
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
}

.reaction-lottie-box {
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 18px 35px rgba(0, 0, 0, 0.25));
}

.reaction-fallback {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 900;
  color: white;
}

.reaction-applause {
  background: radial-gradient(circle, #4fd1ff 0%, #1976d2 100%);
}

.reaction-love {
  background: radial-gradient(circle, #ff84c1 0%, #d81b60 100%);
}

.reaction-wow {
  background: radial-gradient(circle, #ffd54f 0%, #ff8f00 100%);
}

.reaction-fire {
  background: radial-gradient(circle, #ff9a3c 0%, #e53935 100%);
}

.reaction-crown {
  background: radial-gradient(circle, #fff176 0%, #fbc02d 100%);
}

.reaction-confetti {
  background: radial-gradient(circle, #9fa8da 0%, #5e35b1 100%);
}

.reaction-caption {
  padding: 8px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  color: #111827;
  font-size: 14px;
  text-align: center;
  max-width: 320px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.reaction-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.reaction-picker-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  background: linear-gradient(180deg, #ffffff, #dbeafe);
  color: #0b5a2c;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

@keyframes reactionFadeInOut {
  0% {
    opacity: 0;
    transform: scale(0.82);
  }
  15% {
    opacity: 1;
    transform: scale(1);
  }
  85% {
    opacity: 1;
    transform: scale(1.04);
  }
  100% {
    opacity: 0;
    transform: scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reaction-center-card {
    animation: none;
  }
}
```

---

## 7. Implementasi Fitur Chat Room Antar User

### 7.1 SQL Table Supabase

Jalankan SQL berikut di Supabase SQL Editor:

```sql
create table if not exists public.channel_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  sender_id text not null,
  sender_name text,
  sender_avatar text,
  message text not null,
  message_type text not null default 'text',
  created_at timestamptz not null default now()
);

create index if not exists channel_messages_room_id_created_at_idx
on public.channel_messages (room_id, created_at);
```

Untuk tahap prototype, table ini cukup. Untuk production, aktifkan RLS dan validasi membership room.

---

### 7.2 Optional Table `channel_members`

Jika ingin keamanan room lebih kuat, buat table membership:

```sql
create table if not exists public.channel_members (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create index if not exists channel_members_room_user_idx
on public.channel_members (room_id, user_id);
```

---

### 7.3 RLS Dasar untuk Production

> Catatan: policy ini cocok jika user menggunakan Supabase Auth. Jika masih memakai guest mode, perlu strategi session/device ID khusus.

```sql
alter table public.channel_messages enable row level security;


create table public.song_request_votes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.song_requests(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique(request_id, user_id)
);
```

## 19. Instruksi Implementasi

1. Buat panel `SongRequestPanel`.
2. User dapat mengisi judul lagu dan penyanyi.
3. Opsional: user dapat menempel link YouTube.
4. User lain dapat vote lagu.
5. Penyanyi atau moderator dapat memilih lagu dari daftar request.
6. Lagu terpilih dapat dikirim ke item Karaoke Queue aktif sebagai `song_title`.

## 20. Acceptance Criteria

- User bisa request lagu.
- User lain bisa vote satu kali untuk satu request.
- Lagu dengan vote terbanyak tampil di atas.
- Moderator bisa menandai request sebagai `selected`, `done`, atau `removed`.

---

# BAGIAN D — BADGE & LEVEL USER

## 21. Konsep Fitur

Badge dan level membuat user merasa dihargai. Sistem ini meningkatkan engagement karena user memiliki identitas dan pencapaian.

## 22. Contoh Badge

```text
Penyanyi Favorit
Raja Karaoke
Pendengar Setia
Top Applause
Top Fire
Moderator Aktif
User Online Terlama
Room Supporter
```

## 23. SQL Supabase

```sql
create table public.user_profiles_extended (
  user_id text primary key,
  display_name text,
  avatar_url text,
  level_name text not null default 'Bronze',
  experience_points integer not null default 0,
  total_applause integer not null default 0,
  total_fire integer not null default 0,
  total_karaoke_sessions integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  badge_key text not null,
  badge_label text not null,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_key)
);
```

## 24. Instruksi Implementasi

1. Tambahkan sistem XP sederhana.
2. Tambahkan XP saat user aktif chat, karaoke, atau mendapat reaction.
3. Tambahkan badge otomatis berdasarkan milestone.
4. Tampilkan badge di user list, profile modal, chat, dan Karaoke Queue.
5. Jangan terlalu banyak memberi badge agar tetap terasa bernilai.

## 25. Acceptance Criteria

- User memiliki level.
- User bisa mendapat badge.
- Badge tampil di profil/user list.
- Reaction atau karaoke session dapat menambah statistik user.

---

# BAGIAN E — CHANNEL THEME / SKIN

## 26. Konsep Fitur

Channel Theme membuat setiap channel memiliki identitas visual sendiri. Ini cocok dengan arah desain NextVWT yang ingin tampil premium, skeuomorphic, glass crystal, dan komunitas.

## 27. Contoh Theme

```text
Classic Radio
Green Crystal
Dark Premium
Gold Karaoke
Community Skin
Parpol Skin
Police Radio Style
Gaming Neon
```

## 28. SQL Supabase

```sql
create table public.channel_themes (
  room_id text primary key,
  theme_key text not null default 'green-crystal',
  logo_url text,
  banner_url text,
  accent_color text,
  background_url text,
  updated_at timestamptz not null default now()
);
```

## 29. Instruksi Implementasi

1. Buat daftar theme bawaan dalam `themeCatalog.ts`.
2. Tambahkan pengaturan theme pada admin channel.
3. Simpan theme aktif di `channel_themes`.
4. Saat user masuk room, load theme berdasarkan `room_id`.
5. Terapkan CSS variable untuk warna dan background.

## 30. Acceptance Criteria

- Setiap channel bisa memiliki theme berbeda.
- Theme berubah tanpa merusak layout utama.
- Admin dapat memilih theme.
- Theme tersimpan dan tampil kembali saat room dibuka.

---

# BAGIAN F — MINI MIXER KARAOKE

## 31. Konsep Fitur

Mini Mixer Karaoke adalah panel kontrol audio ringan untuk user yang memakai mic, soundcard, mixer portable, atau karaoke YouTube floating.

## 32. Kontrol Awal

```text
Mic Volume
Music Volume
Monitor Volume
Echo Level
Noise Gate Toggle
Karaoke Mode Toggle
Audio Preset
```

## 33. Preset Awal

```text
Normal
Radio
Karaoke Echo
Studio Soft
Outdoor Loud
```

## 34. Instruksi Implementasi

1. Jangan ubah core PTT terlebih dahulu.
2. Buat panel UI `MiniMixerPanel.tsx`.
3. Simpan setting lokal di localStorage.
4. Terapkan efek audio secara bertahap melalui Web Audio API.
5. Mulai dari kontrol volume dan preset visual dulu.
6. Setelah stabil, baru tambahkan echo/reverb ringan.

## 35. Risiko

Fitur ini menyentuh audio pipeline, sehingga risikonya tinggi:

- delay audio
- echo berlebihan
- feedback suara
- CPU tinggi di perangkat rendah
- konflik dengan WebRTC / MediaRecorder

## 36. Acceptance Criteria Tahap Awal

- Panel mixer tampil.
- Setting tersimpan lokal.
- Toggle karaoke mode bekerja.
- Tidak merusak PTT.
- Tidak menambah delay signifikan.

---

# BAGIAN G — AI KARAOKE ASSISTANT

## 37. Konsep Fitur

AI Karaoke Assistant adalah fitur AI ringan untuk membantu admin atau user membuat suasana room lebih menarik.

## 38. Fungsi Awal

```text
Rekomendasi lagu sesuai suasana room
Buat kata-kata MC pembuka
Buat pantun karaoke
Buat komentar apresiasi sopan
Bantu membuat tema acara karaoke malam ini
```

## 39. Arsitektur

```text
Frontend NextVWT
   ↓
Backend AI Route
   ↓
AI Provider API
   ↓
Response kembali ke UI
```

## 40. Instruksi Implementasi

1. Jangan panggil API key dari frontend.
2. Buat backend route `/api/ai/karaoke-assistant`.
3. Buat UI `AiKaraokeAssistantPanel.tsx`.
4. Tambahkan prompt sistem khusus NextVWT.
5. Batasi output agar singkat dan sopan.
6. Tambahkan rate limit.

## 41. Contoh Prompt Sistem

```text
Kamu adalah AI Karaoke Assistant untuk aplikasi NextVWT. Bantu admin dan user membuat suasana room karaoke menjadi seru, sopan, dan ramah komunitas. Jangan membuat konten kasar, menghina, atau provokatif. Jawab singkat dan siap dipakai di room.
```

## 42. Acceptance Criteria

- User bisa meminta ide MC, pantun, atau rekomendasi lagu.
- API key tidak muncul di frontend.
- Output AI sopan dan relevan dengan karaoke.
- Fitur tidak mengganggu PTT.

---

# BAGIAN H — ADMIN PANEL CHANNEL

## 43. Konsep Fitur

Admin Panel Channel adalah pusat kontrol untuk pemilik/moderator channel.

## 44. Fungsi Minimal

```text
Mute user
Kick user
Lock room
Set password room
Atur moderator
Hapus chat
Atur mode karaoke
Atur antrian mic
Atur theme channel
Aktif/nonaktif reaction
Aktif/nonaktif chat
```

## 45. SQL Supabase

```sql
create table public.channel_roles (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(room_id, user_id)
);
```

## 46. Instruksi Implementasi

1. Buat role: `owner`, `admin`, `moderator`, `member`, `muted`, `banned`.
2. Tambahkan helper `canModerateRoom()`.
3. Panel admin hanya tampil untuk role tertentu.
4. Semua aksi penting harus validasi role.
5. Jangan hanya mengandalkan UI hiding; tetap perlu validasi backend/RLS.

## 47. Acceptance Criteria

- Admin bisa melihat panel kontrol.
- Member biasa tidak bisa melihat/mengakses panel.
- Admin bisa mute/kick user.
- Admin bisa mengatur fitur room.
- Semua perubahan tersinkron realtime.

---

# BAGIAN I — LEADERBOARD CHANNEL

## 48. Konsep Fitur

Leaderboard meningkatkan kompetisi sehat dan membuat user ingin aktif.

## 49. Jenis Leaderboard

```text
Top Singer Mingguan
Top Applause
Top Fire
Top Listener
Top Active User
Top Moderator
Top Channel Aktif
```

## 50. Instruksi Implementasi

1. Gunakan data dari reaction, chat, dan presence.
2. Hitung leaderboard mingguan.
3. Tampilkan di modal khusus.
4. Batasi hanya top 10 agar ringan.
5. Reset mingguan atau simpan history.

## 51. Acceptance Criteria

- Leaderboard tampil per room.
- Data diperbarui realtime atau periodik.
- User bisa melihat ranking mingguan.
- Ranking tidak membebani UI utama.

---

# BAGIAN J — SMART PRESENCE

## 52. Konsep Fitur

Smart Presence membuat status user lebih informatif daripada sekadar online/offline.

## 53. Status User

```text
online
speaking
karaoke
listening
muted
afk
weak_connection
moderator
admin
```

## 54. Instruksi Implementasi

1. Perluas payload presence room.
2. Saat user PTT, status menjadi `speaking`.
3. Saat user status menjadi `karaoke`.
4. Saat tidak aktif beberapa menit, status menjadi `afk`.
5. Jika reconnect sering, tampilkan `weak_connection`.

## 55. Acceptance Criteria

- User list menampilkan status yang benar.
- Status berubah realtime.
- Status tidak membuat presence payload terlalu besar.
- Status membantu admin memahami aktivitas room.

---

# 56. Urutan Implementasi Final

Rekomendasi urutan kerja paling aman:

```text
Phase 1 — Engagement Core
1. Lottie Reaction
2. Chat Room
3. Smart Presence

Phase 2 — Karaoke Experience
4. Karaoke Queue
6. Song Request

Phase 3 — Identity & Retention
7. Badge & Level User
8. Leaderboard Channel
9. Channel Theme / Skin

Phase 4 — Power Features
10. Admin Panel Channel
11. AI Karaoke Assistant
12. Mini Mixer Karaoke
```

---

# 57. Prompt Antigravity AI

Gunakan prompt berikut di Antigravity AI saat mulai implementasi:

```text
Gunakan konteks project NextVWT. Saya ingin menambahkan fitur entertainment lanjutan setelah Lottie Reaction dan Chat Room.

Prioritas implementasi:
1. Smart Presence
2. Karaoke Queue
4. Song Request
5. Badge & Level User
6. Channel Theme / Skin
7. Admin Panel Channel

Jangan mengubah core audio PTT tanpa instruksi khusus.
Gunakan struktur folder modular di src/features/.
Pastikan semua fitur berbasis room_id/channel aktif.
Tambahkan TypeScript types, hook React, komponen UI, dan CSS terpisah.
Gunakan Supabase untuk database dan realtime jika sudah tersedia di project.
Tambahkan anti-spam dan validasi role untuk fitur interaktif.
Jalankan pnpm type-check dan pnpm build setelah perubahan.
```

---

# 58. Checklist Testing Umum

Sebelum fitur dianggap selesai, lakukan pengujian berikut:

```text
[ ] Test 2 browser/tab dalam room yang sama
[ ] Test user berbeda dalam channel sama
[ ] Test user di channel berbeda tidak menerima event
[ ] Test realtime update berjalan
[ ] Test fitur tidak menutupi tombol PTT
[ ] Test reconnect room
[ ] Test guest user dan registered user
[ ] Test spam/cooldown
[ ] Test role admin/moderator/member
[ ] Test mobile viewport
[ ] Test build production
```

---

# 59. Risiko Utama dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Terlalu banyak fitur sekaligus | Project sulit stabil | Implementasi bertahap per phase |
| UI terlalu ramai | User terganggu | Gunakan modal, minimize, dan mode on/off |
| Spam reaction/chat/queue | Room tidak nyaman | Cooldown, rate limit, moderator control |
| Audio PTT terganggu | Fitur utama rusak | Jangan sentuh audio core di tahap awal |
| Database membesar | Query lambat | Index, limit data, cleanup periodik |
| Role mudah dibypass | Keamanan lemah | RLS dan validasi server-side |
| Guest identity bentrok | Presence kacau | Gunakan unique device/session id |

---

# 60. Kesimpulan

Fitur paling kuat untuk membuat NextVWT unggul dari aplikasi sejenis adalah kombinasi:

```text
Lottie Reaction
Chat Room
Smart Presence
Karaoke Queue
Karaoke Display
Song Request
Badge & Level
Channel Theme
Admin Panel
AI Karaoke Assistant
```

Dengan urutan implementasi yang benar, NextVWT dapat berkembang dari aplikasi PTT biasa menjadi **platform komunitas hiburan realtime** yang memiliki identitas visual, sistem interaksi sosial, dan pengalaman karaoke yang lebih hidup.

Prioritas setelah Lottie Reaction dan Chat Room adalah:

```text
1. Smart Presence
2. Karaoke Queue
4. Song Request
```

Empat fitur tersebut adalah fondasi agar NextVWT terasa lebih premium, tertib, interaktif, dan berbeda dari Indovwt atau aplikasi walkie-talkie biasa.

---

# PENUTUP MASTER PLAN

Master plan ini menyatukan fitur dasar engagement dan fitur entertainment lanjutan untuk menjadikan NextVWT sebagai aplikasi PTT yang lebih hidup, premium, interaktif, dan berbeda dari aplikasi sejenis.

Prioritas paling aman adalah menyelesaikan fitur realtime ringan terlebih dahulu, yaitu **Lottie Reaction**, **Chat Room**, dan **Smart Presence**, sebelum masuk ke fitur yang lebih kompleks seperti **Karaoke Queue**, **Karaoke Display**, **Admin Panel**, **AI Assistant**, dan **Mini Mixer Karaoke**.


---

# BAGIAN 3 — IMPLEMENTASI TERPADU CODEBASE ENTERTAINMENT

Bagian ini melengkapi dokumen master plan dengan rancangan logika fitur, struktur codebase, kontrak data, alur realtime, dan contoh implementasi yang dapat langsung dijadikan acuan developer atau AI coding agent. Prinsip dasarnya: fitur entertainment menjadi **lapisan tambahan berbasis room_id** di atas PTT Core, sehingga audio push-to-talk tetap stabil dan tidak ikut berubah ketika fitur hiburan ditambahkan.

### 60.1 Keputusan Scope Tanpa Live Stage Karaoke

Fitur **Live Stage Karaoke** tidak digunakan. Logika karaoke dibuat lebih sederhana agar tidak mengubah bentuk layout UI original NextVWT:

```text
User ikut antrian karaoke
        ↓
Admin/moderator mengubah status menjadi ready / active
        ↓
User aktif ditandai pada Karaoke Queue + Smart Presence
        ↓
Reaction tetap bisa dikirim ke user aktif
        ↓
Song Request dapat dipilih sebagai lagu pada item queue aktif
        ↓
Setelah selesai, status berubah menjadi finished dan queue maju ke user berikutnya
```

Dengan pendekatan ini, tidak ada overlay panggung besar, tidak ada tabel `live_stage_sessions`, dan tidak ada folder `src/features/live-stage/`.

## 61. Diagram Visual Arsitektur Implementasi

![NextVWT Entertainment Visual Diagram](./nextvwt_entertainment_visual_diagram.png)

Diagram di atas menggambarkan hubungan antara **Main Radio UI**, fitur engagement, karaoke experience, admin control, Supabase Realtime, database, dan fitur lanjutan seperti AI Assistant, Badge, Leaderboard, dan Mini Mixer.

## 62. Prinsip Integrasi Final

```text
PTT Core              = jalur utama komunikasi suara, tidak disentuh pada fase awal.
Entertainment Layer   = fitur sosial, reaction, chat, queue, theme, badge.
Room Isolation Key    = semua query dan realtime wajib memakai room_id.
Realtime Strategy     = broadcast untuk ephemeral event, postgres_changes untuk data persist.
Security Strategy     = RLS + role validation + cooldown + rate limit.
UI Strategy           = overlay, drawer, modal, atau mini-card; tidak mengubah bentuk layout radio original.
```

## 63. Struktur Folder Final yang Direkomendasikan

```text
src/
  app/
    hooks/
      useEntertainmentRoom.ts
      useFeatureFlags.ts
    store/
      usePTTStore.ts
      useEntertainmentStore.ts
    utils/
      roomId.ts
      rateLimit.ts
      safeStorage.ts
      time.ts

  features/
    reactions/
      types.ts
      reactionCatalog.ts
      useRoomReactions.ts
      ReactionOverlay.tsx
      ReactionPicker.tsx
      QuickReactionButton.tsx
      roomReaction.css

    chat/
      types.ts
      useChannelChat.ts
      ChannelChatPanel.tsx
      ChannelChatButton.tsx
      channelChat.css

    presence/
      types.ts
      useSmartPresence.ts
      PresenceBadge.tsx
      presenceUtils.ts

    karaoke-queue/
      types.ts
      useKaraokeQueue.ts
      KaraokeQueuePanel.tsx
      QueueJoinButton.tsx
      queueActions.ts
      karaokeQueue.css

    karaoke-queue/
      types.ts
      useKaraokeQueue.ts
      KaraokeQueuePanel.tsx
      KaraokeQueueMiniCard.tsx
      karaokeQueueActions.ts
      karaokeQueue.css

    song-request/
      types.ts
      useSongRequests.ts
      SongRequestPanel.tsx
      SongRequestButton.tsx
      songRequest.css

    badges/
      types.ts
      badgeCatalog.ts
      xpRules.ts
      useUserProgress.ts
      BadgeStrip.tsx
      LevelProgress.tsx

    leaderboard/
      types.ts
      useLeaderboard.ts
      LeaderboardPanel.tsx
      leaderboard.css

    themes/
      types.ts
      themeCatalog.ts
      useChannelTheme.ts
      ChannelThemePicker.tsx
      channelTheme.css

    admin/
      types.ts
      useChannelRole.ts
      useAdminActions.ts
      AdminPanel.tsx
      admin.css

    ai-assistant/
      types.ts
      useAiKaraokeAssistant.ts
      AiKaraokeAssistantPanel.tsx
      aiAssistant.css

    mini-mixer/
      types.ts
      mixerPresets.ts
      useMiniMixer.ts
      MiniMixerPanel.tsx
      miniMixer.css

supabase/
  migrations/
    20260608_nextvwt_entertainment.sql
```

## 64. Logika Kerja Sistem Secara Menyeluruh

### 64.1 Alur Masuk Room

```text
User membuka channel
        ↓
resolveRoomId(activeChannel)
        ↓
load channel theme + role + feature flags
        ↓
subscribe presence room
        ↓
subscribe chat, queue, song request
        ↓
render Main Radio UI + tombol reaction/chat/karaoke tanpa mengubah layout asli
```

### 64.2 Alur Reaction

```text
User klik QuickReactionButton
        ↓
cek cooldown lokal 2 detik
        ↓
validasi reaction dalam whitelist
        ↓
broadcast ke channel room:{roomId}:reactions
        ↓
client dalam room menerima event
        ↓
ReactionOverlay tampil 2–3 detik
        ↓
jika ada karaoke_queue aktif, counter reaction bisa ditambahkan ke database
```

### 64.3 Alur Chat Room

```text
User membuka chat drawer
        ↓
load 80 pesan terakhir dari channel_messages
        ↓
subscribe postgres_changes INSERT room_id aktif
        ↓
user kirim pesan
        ↓
validasi panjang pesan, cooldown, role muted/banned
        ↓
insert channel_messages
        ↓
semua user room menerima pesan realtime
```

### 64.4 Alur Karaoke Queue dan Karaoke Display

```text
User klik Ikut Antrian
        ↓
cek apakah user sudah waiting/ready/live di room yang sama
        ↓
insert karaoke_queue status waiting
        ↓
moderator klik Start / Next Singer
        ↓
queue item berubah menjadi live
        ↓
karaoke_queue dibuat/diupdate status live
        ↓
KaraokeQueueMiniCard tampil di semua client room
        ↓
reaction counter dan durasi tampil berjalan realtime
        ↓
moderator klik Finish
        ↓
queue item menjadi finished, karaoke_queue menjadi ended
```

### 64.5 Alur Theme / Skin Channel

```text
Admin membuka Channel Theme Picker
        ↓
admin memilih theme_key
        ↓
upsert channel_themes berdasarkan room_id
        ↓
client room menerima perubahan realtime
        ↓
CSS variables diterapkan pada root container
        ↓
UI berubah tema tanpa mengubah layout asli
```

## 65. SQL Migration Final

Buat file:

```text
supabase/migrations/20260608_nextvwt_entertainment.sql
```

Isi:

```sql
-- NEXTVWT ENTERTAINMENT CORE TABLES

create table if not exists public.channel_members (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  display_name text,
  avatar_url text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create index if not exists channel_members_room_user_idx
on public.channel_members (room_id, user_id);

create table if not exists public.channel_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  sender_id text not null,
  sender_name text,
  sender_avatar text,
  message text not null,
  message_type text not null default 'text',
  created_at timestamptz not null default now()
);

create index if not exists channel_messages_room_id_created_at_idx
on public.channel_messages (room_id, created_at desc);

create table if not exists public.karaoke_queue (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  user_name text not null,
  user_avatar text,
  song_title text,
  queue_number integer not null,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(room_id, user_id, status)
);

create index if not exists karaoke_queue_room_status_idx
on public.karaoke_queue (room_id, status, queue_number);


create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  requester_id text not null,
  requester_name text not null,
  song_title text not null,
  artist_name text,
  youtube_url text,
  vote_count integer not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists song_requests_room_status_idx
on public.song_requests (room_id, status, vote_count desc, created_at desc);

create table if not exists public.song_request_votes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.song_requests(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique(request_id, user_id)
);

create table if not exists public.channel_themes (
  room_id text primary key,
  theme_key text not null default 'green-crystal',
  logo_url text,
  banner_url text,
  accent_color text,
  background_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.channel_feature_flags (
  room_id text primary key,
  reactions_enabled boolean not null default true,
  chat_enabled boolean not null default true,
  karaoke_queue_enabled boolean not null default true,
  karaoke_queue_enabled boolean not null default true,
  song_request_enabled boolean not null default true,
  leaderboard_enabled boolean not null default true,
  ai_assistant_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles_extended (
  user_id text primary key,
  display_name text,
  avatar_url text,
  level_name text not null default 'Bronze',
  experience_points integer not null default 0,
  total_applause integer not null default 0,
  total_fire integer not null default 0,
  total_love integer not null default 0,
  total_chat_messages integer not null default 0,
  total_karaoke_sessions integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  badge_key text not null,
  badge_label text not null,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_key)
);

create table if not exists public.channel_roles (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  actor_id text not null,
  action text not null,
  target_user_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## 66. Supabase RLS dan Policy Produksi

Untuk produksi, aktifkan RLS minimal pada tabel chat, queue, song request, theme, dan role.

```sql
alter table public.channel_messages enable row level security;
alter table public.karaoke_queue enable row level security;
alter table public.song_requests enable row level security;
alter table public.song_request_votes enable row level security;
alter table public.channel_themes enable row level security;
alter table public.channel_feature_flags enable row level security;
alter table public.channel_roles enable row level security;

create policy "channel members can read messages"
on public.channel_messages
for select
using (
  exists (
    select 1 from public.channel_members cm
    where cm.room_id = channel_messages.room_id
    and cm.user_id = auth.uid()::text
  )
);

create policy "channel members can insert messages"
on public.channel_messages
for insert
with check (
  exists (
    select 1 from public.channel_members cm
    where cm.room_id = channel_messages.room_id
    and cm.user_id = auth.uid()::text
    and cm.role not in ('muted', 'banned')
  )
);

create policy "channel members can read queue"
on public.karaoke_queue
for select
using (
  exists (
    select 1 from public.channel_members cm
    where cm.room_id = karaoke_queue.room_id
    and cm.user_id = auth.uid()::text
  )
);

create policy "members can join queue as self"
on public.karaoke_queue
for insert
with check (
  user_id = auth.uid()::text
  and exists (
    select 1 from public.channel_members cm
    where cm.room_id = karaoke_queue.room_id
    and cm.user_id = auth.uid()::text
    and cm.role not in ('muted', 'banned')
  )
);
```

Catatan: jika masih memakai guest mode, RLS perlu disesuaikan dengan `device_session_id` atau token session server-side. Jangan memakai `guest-session-id` statis karena akan membuat identitas user saling bertabrakan.

## 67. Utility Dasar Codebase

### 67.1 `src/app/utils/roomId.ts`

```ts
export type ChannelLike = {
  id?: string | number | null;
  number?: string | number | null;
  name?: string | null;
};

export function resolveRoomId(channel?: ChannelLike | null): string {
  if (!channel) return "room:default";
  const raw = channel.id ?? channel.number ?? channel.name ?? "default";
  return `room:${String(raw).trim().toLowerCase().replace(/\s+/g, "-")}`;
}
```

### 67.2 `src/app/utils/rateLimit.ts`

```ts
const lastActionAt = new Map<string, number>();

export function assertCooldown(key: string, cooldownMs: number, message: string) {
  const now = Date.now();
  const last = lastActionAt.get(key) ?? 0;

  if (now - last < cooldownMs) {
    throw new Error(message);
  }

  lastActionAt.set(key, now);
}
```

### 67.3 `src/app/utils/time.ts`

```ts
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function safeTime(value?: string | null): string {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
```

## 68. Entertainment Store

### `src/app/store/useEntertainmentStore.ts`

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EntertainmentPanel =
  | "none"
  | "chat"
  | "queue"
  | "song-request"
  | "leaderboard"
  | "admin"
  | "theme"
  | "mixer"
  | "ai";

type EntertainmentState = {
  activePanel: EntertainmentPanel;
  reactionEnabled: boolean;
  chatEnabled: boolean;
  reduceMotion: boolean;
  setActivePanel: (panel: EntertainmentPanel) => void;
  closePanel: () => void;
  setReduceMotion: (value: boolean) => void;
};

export const useEntertainmentStore = create<EntertainmentState>()(
  persist(
    (set) => ({
      activePanel: "none",
      reactionEnabled: true,
      chatEnabled: true,
      reduceMotion: false,
      setActivePanel: (panel) => set({ activePanel: panel }),
      closePanel: () => set({ activePanel: "none" }),
      setReduceMotion: (value) => set({ reduceMotion: value }),
    }),
    {
      name: "nextvwt-entertainment-store",
      partialize: (state) => ({
        reactionEnabled: state.reactionEnabled,
        chatEnabled: state.chatEnabled,
        reduceMotion: state.reduceMotion,
      }),
    }
  )
);
```

## 69. Hook Integrasi Room Utama

### `src/app/hooks/useEntertainmentRoom.ts`

```ts
import { resolveRoomId, type ChannelLike } from "../utils/roomId";
import { useRoomReactions } from "../../features/reactions/useRoomReactions";
import { useSmartPresence } from "../../features/presence/useSmartPresence";
import { useChannelTheme } from "../../features/themes/useChannelTheme";
import { useChannelRole } from "../../features/admin/useChannelRole";

type UseEntertainmentRoomProps = {
  activeChannel?: ChannelLike | null;
  currentUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  isSpeaking: boolean;
  isKaraoke: boolean;
};

export function useEntertainmentRoom({
  activeChannel,
  currentUser,
  isSpeaking,
  isKaraoke,
}: UseEntertainmentRoomProps) {
  const roomId = resolveRoomId(activeChannel);

  const reactions = useRoomReactions({
    roomId,
    currentUserId: currentUser.id,
    currentUserName: currentUser.name,
  });

  const presence = useSmartPresence({
    roomId,
    currentUser,
    isSpeaking,
    isKaraoke,
  });

  const theme = useChannelTheme({ roomId });
  const role = useChannelRole({ roomId, userId: currentUser.id });

  return {
    roomId,
    reactions,
    presence,
    theme,
    role,
  };
}
```

## 70. Smart Presence Implementation

### 70.1 `src/features/presence/types.ts`

```ts
export type PresenceStatus =
  | "online"
  | "speaking"
  | "karaoke"
  | "listening"
  | "muted"
  | "afk"
  | "weak_connection"
  | "moderator"
  | "admin";

export interface RoomPresencePayload {
  userId: string;
  name: string;
  avatarUrl?: string;
  status: PresenceStatus;
  channelRole?: string;
  lastActiveAt: number;
  connectionQuality?: "good" | "fair" | "weak";
}
```

### 70.2 `src/features/presence/useSmartPresence.ts`

```ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { PresenceStatus, RoomPresencePayload } from "./types";

type Props = {
  roomId: string;
  currentUser: { id: string; name: string; avatarUrl?: string };
  isSpeaking: boolean;
  isKaraoke: boolean;
};

function getStatus(isSpeaking: boolean, isKaraoke: boolean): PresenceStatus {
  if (isKaraoke) return "karaoke";
  if (isSpeaking) return "speaking";
  return "online";
}

export function useSmartPresence({ roomId, currentUser, isSpeaking, isKaraoke }: Props) {
  const [users, setUsers] = useState<RoomPresencePayload[]>([]);

  const payload = useMemo<RoomPresencePayload>(() => ({
    userId: currentUser.id,
    name: currentUser.name,
    avatarUrl: currentUser.avatarUrl,
    status: getStatus(isSpeaking, isKaraoke),
    lastActiveAt: Date.now(),
    connectionQuality: "good",
  }), [currentUser.id, currentUser.name, currentUser.avatarUrl, isSpeaking, isKaraoke]);

  useEffect(() => {
    if (!roomId || !currentUser.id) return;

    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<RoomPresencePayload>();
        const list = Object.values(state).flat();
        setUsers(list);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(payload);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUser.id]);

  useEffect(() => {
    const channel = supabase.getChannels().find((item) => item.topic === `realtime:presence:${roomId}`);
    if (!channel) return;
    channel.track(payload);
  }, [payload, roomId]);

  return { users, onlineCount: users.length };
}
```

### 70.3 `src/features/presence/PresenceBadge.tsx`

```tsx
import type { PresenceStatus } from "./types";
import "./presence.css";

const LABELS: Record<PresenceStatus, string> = {
  online: "Online",
  speaking: "On Air",
  karaoke: "Karaoke",
  listening: "Listening",
  muted: "Muted",
  afk: "AFK",
  weak_connection: "Weak",
  moderator: "Mod",
  admin: "Admin",
};

type Props = { status: PresenceStatus };

export function PresenceBadge({ status }: Props) {
  return <span className={`presence-badge presence-${status}`}>{LABELS[status]}</span>;
}
```

## 71. Karaoke Queue Implementation

### 71.1 `src/features/karaoke-queue/types.ts`

```ts
export type KaraokeQueueStatus =
  | "waiting"
  | "ready"
  | "live"
  | "skipped"
  | "finished"
  | "cancelled";

export interface KaraokeQueueItem {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  song_title?: string;
  queue_number: number;
  status: KaraokeQueueStatus;
  created_at: string;
  updated_at: string;
}
```

### 71.2 `src/features/karaoke-queue/useKaraokeQueue.ts`

```ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { assertCooldown } from "../../app/utils/rateLimit";
import type { KaraokeQueueItem, KaraokeQueueStatus } from "./types";

type Props = {
  roomId: string;
  currentUser: { id: string; name: string; avatarUrl?: string };
};

export function useKaraokeQueue({ roomId, currentUser }: Props) {
  const [items, setItems] = useState<KaraokeQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const activeItems = useMemo(
    () => items.filter((item) => ["waiting", "ready", "live"].includes(item.status)),
    [items]
  );

  const myQueueItem = useMemo(
    () => activeItems.find((item) => item.user_id === currentUser.id),
    [activeItems, currentUser.id]
  );

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("karaoke_queue")
      .select("*")
      .eq("room_id", roomId)
      .in("status", ["waiting", "ready", "live"])
      .order("queue_number", { ascending: true });

    if (!error && data) setItems(data as KaraokeQueueItem[]);
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    loadQueue();

    const channel = supabase
      .channel(`karaoke-queue:${roomId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "karaoke_queue",
        filter: `room_id=eq.${roomId}`,
      }, loadQueue)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, loadQueue]);

  const joinQueue = useCallback(async (songTitle?: string) => {
    assertCooldown(`join-queue:${roomId}:${currentUser.id}`, 3000, "Tunggu sebentar sebelum masuk antrian lagi.");
    if (myQueueItem) throw new Error("Anda sudah berada dalam antrian.");

    const nextNumber = activeItems.length > 0
      ? Math.max(...activeItems.map((item) => item.queue_number)) + 1
      : 1;

    const { error } = await supabase.from("karaoke_queue").insert({
      room_id: roomId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatarUrl ?? null,
      song_title: songTitle ?? null,
      queue_number: nextNumber,
      status: "waiting",
    });

    if (error) throw error;
  }, [roomId, currentUser, myQueueItem, activeItems]);

  const updateQueueStatus = useCallback(async (id: string, status: KaraokeQueueStatus) => {
    const { error } = await supabase
      .from("karaoke_queue")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }, []);

  return {
    items: activeItems,
    loading,
    myQueueItem,
    joinQueue,
    updateQueueStatus,
    refresh: loadQueue,
  };
}
```

### 71.3 `src/features/karaoke-queue/QueueJoinButton.tsx`

```tsx
import { useState } from "react";
import "./karaokeQueue.css";

type Props = {
  disabled?: boolean;
  onJoin: (songTitle?: string) => Promise<void>;
};

export function QueueJoinButton({ disabled, onJoin }: Props) {
  const [songTitle, setSongTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleJoin() {
    setBusy(true);
    try {
      await onJoin(songTitle.trim() || undefined);
      setSongTitle("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="queue-join-box">
      <input
        value={songTitle}
        onChange={(event) => setSongTitle(event.target.value)}
        placeholder="Judul lagu opsional..."
      />
      <button type="button" disabled={disabled || busy} onClick={handleJoin}>
        {busy ? "Memproses..." : "Ikut Antrian"}
      </button>
    </div>
  );
}
```

## 72. Song Request Implementation

### 73.1 `src/features/song-request/types.ts`

```ts
export type SongRequestStatus = "open" | "selected" | "done" | "removed";

export interface SongRequest {
  id: string;
  room_id: string;
  requester_id: string;
  requester_name: string;
  song_title: string;
  artist_name?: string;
  youtube_url?: string;
  vote_count: number;
  status: SongRequestStatus;
  created_at: string;
}
```

### 73.2 `src/features/song-request/useSongRequests.ts`

```ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { assertCooldown } from "../../app/utils/rateLimit";
import type { SongRequest } from "./types";

export function useSongRequests(roomId: string, currentUser: { id: string; name: string }) {
  const [requests, setRequests] = useState<SongRequest[]>([]);

  const loadRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .eq("room_id", roomId)
      .eq("status", "open")
      .order("vote_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) setRequests(data as SongRequest[]);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    loadRequests();

    const channel = supabase
      .channel(`song-requests:${roomId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "song_requests",
        filter: `room_id=eq.${roomId}`,
      }, loadRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, loadRequests]);

  const createRequest = useCallback(async (input: {
    songTitle: string;
    artistName?: string;
    youtubeUrl?: string;
  }) => {
    assertCooldown(`song-request:${roomId}:${currentUser.id}`, 5000, "Tunggu sebentar sebelum request lagu lagi.");

    const cleanTitle = input.songTitle.trim();
    if (!cleanTitle) throw new Error("Judul lagu wajib diisi.");

    const { error } = await supabase.from("song_requests").insert({
      room_id: roomId,
      requester_id: currentUser.id,
      requester_name: currentUser.name,
      song_title: cleanTitle,
      artist_name: input.artistName?.trim() || null,
      youtube_url: input.youtubeUrl?.trim() || null,
    });

    if (error) throw error;
  }, [roomId, currentUser.id, currentUser.name]);

  const vote = useCallback(async (request: SongRequest) => {
    assertCooldown(`song-vote:${request.id}:${currentUser.id}`, 1500, "Terlalu cepat vote.");

    const { error: voteError } = await supabase.from("song_request_votes").insert({
      request_id: request.id,
      user_id: currentUser.id,
    });

    if (voteError) throw voteError;

    const { error: updateError } = await supabase
      .from("song_requests")
      .update({ vote_count: request.vote_count + 1 })
      .eq("id", request.id);

    if (updateError) throw updateError;
  }, [currentUser.id]);

  return { requests, createRequest, vote, refresh: loadRequests };
}
```

## 74. Badge, Level, dan XP

### 74.1 `src/features/badges/xpRules.ts`

```ts
export type XpEvent =
  | "chat_sent"
  | "reaction_sent"
  | "reaction_received"
  | "karaoke_finished"
  | "queue_joined"
  | "daily_active";

export const XP_RULES: Record<XpEvent, number> = {
  chat_sent: 1,
  reaction_sent: 1,
  reaction_received: 2,
  karaoke_finished: 20,
  queue_joined: 3,
  daily_active: 5,
};

export function getLevelName(xp: number): string {
  if (xp >= 5000) return "Diamond";
  if (xp >= 2000) return "Platinum";
  if (xp >= 750) return "Gold";
  if (xp >= 250) return "Silver";
  return "Bronze";
}
```

### 74.2 `src/features/badges/badgeCatalog.ts`

```ts
export const BADGE_CATALOG = {
  first_karaoke: { label: "Debut Karaoke", description: "Selesai karaoke pertama." },
  top_applause: { label: "Top Applause", description: "Sering mendapat tepuk tangan." },
  loyal_listener: { label: "Pendengar Setia", description: "Aktif mendengar di room." },
  active_chatter: { label: "Ramein Room", description: "Aktif chat sopan." },
  fire_performer: { label: "Panggung Panas", description: "Banyak mendapat fire reaction." },
} as const;

export type BadgeKey = keyof typeof BADGE_CATALOG;
```

### 74.3 `src/features/badges/useUserProgress.ts`

```ts
import { useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { getLevelName, XP_RULES, type XpEvent } from "./xpRules";

export function useUserProgress(userId: string) {
  const addXp = useCallback(async (event: XpEvent) => {
    const xp = XP_RULES[event];

    const { data } = await supabase
      .from("user_profiles_extended")
      .select("experience_points")
      .eq("user_id", userId)
      .maybeSingle();

    const nextXp = (data?.experience_points ?? 0) + xp;

    await supabase.from("user_profiles_extended").upsert({
      user_id: userId,
      experience_points: nextXp,
      level_name: getLevelName(nextXp),
      updated_at: new Date().toISOString(),
    });
  }, [userId]);

  return { addXp };
}
```

## 75. Channel Theme / Skin Implementation

### 75.1 `src/features/themes/types.ts`

```ts
export type ChannelThemeKey =
  | "classic-radio"
  | "green-crystal"
  | "dark-premium"
  | "gold-karaoke"
  | "community-skin"
  | "parpol-skin"
  | "police-radio"
  | "gaming-neon";

export interface ChannelThemeDefinition {
  key: ChannelThemeKey;
  label: string;
  accentColor: string;
  background: string;
  pttGradient: string;
  lcdGradient: string;
}
```

### 75.2 `src/features/themes/themeCatalog.ts`

```ts
import type { ChannelThemeDefinition } from "./types";

export const THEME_CATALOG: ChannelThemeDefinition[] = [
  {
    key: "classic-radio",
    label: "Classic Radio",
    accentColor: "#22c55e",
    background: "linear-gradient(180deg, #f8fafc, #cbd5e1)",
    pttGradient: "linear-gradient(180deg, #2cdb66, #19ba42)",
    lcdGradient: "linear-gradient(180deg, #aeb8c3, #64748b)",
  },
  {
    key: "green-crystal",
    label: "Green Crystal",
    accentColor: "#00c853",
    background: "linear-gradient(145deg, #e8fff2, #b7f7d2)",
    pttGradient: "linear-gradient(180deg, #43f59e, #008746)",
    lcdGradient: "linear-gradient(180deg, #002b1c, #00c875)",
  },
  {
    key: "gold-karaoke",
    label: "Gold Karaoke",
    accentColor: "#facc15",
    background: "linear-gradient(145deg, #fff7cc, #d6a000)",
    pttGradient: "linear-gradient(180deg, #ffe066, #d6a000)",
    lcdGradient: "linear-gradient(180deg, #684000, #ffdc45)",
  },
  {
    key: "gaming-neon",
    label: "Gaming Neon",
    accentColor: "#00e5ff",
    background: "linear-gradient(145deg, #0f172a, #1e1b4b)",
    pttGradient: "linear-gradient(180deg, #00e5ff, #2563eb)",
    lcdGradient: "linear-gradient(180deg, #020617, #0891b2)",
  },
];

export function getThemeDefinition(key?: string) {
  return THEME_CATALOG.find((theme) => theme.key === key) ?? THEME_CATALOG[1];
}
```

### 75.3 `src/features/themes/useChannelTheme.ts`

```ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getThemeDefinition } from "./themeCatalog";

export function useChannelTheme({ roomId }: { roomId: string }) {
  const [themeKey, setThemeKey] = useState("green-crystal");

  useEffect(() => {
    if (!roomId) return;

    async function loadTheme() {
      const { data } = await supabase
        .from("channel_themes")
        .select("theme_key")
        .eq("room_id", roomId)
        .maybeSingle();

      if (data?.theme_key) setThemeKey(data.theme_key);
    }

    loadTheme();

    const channel = supabase
      .channel(`channel-theme:${roomId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "channel_themes",
        filter: `room_id=eq.${roomId}`,
      }, loadTheme)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const theme = useMemo(() => getThemeDefinition(themeKey), [themeKey]);

  return { themeKey, theme };
}
```

## 76. Admin Role dan Action

### 76.1 `src/features/admin/types.ts`

```ts
export type ChannelRole = "owner" | "admin" | "moderator" | "member" | "muted" | "banned";

export function canModerateRoom(role?: ChannelRole | null): boolean {
  return role === "owner" || role === "admin" || role === "moderator";
}

export function canManageRoom(role?: ChannelRole | null): boolean {
  return role === "owner" || role === "admin";
}
```

### 76.2 `src/features/admin/useChannelRole.ts`

```ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { ChannelRole } from "./types";

export function useChannelRole({ roomId, userId }: { roomId: string; userId: string }) {
  const [role, setRole] = useState<ChannelRole>("member");

  useEffect(() => {
    if (!roomId || !userId) return;

    async function loadRole() {
      const { data } = await supabase
        .from("channel_roles")
        .select("role")
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .maybeSingle();

      setRole((data?.role as ChannelRole) ?? "member");
    }

    loadRole();
  }, [roomId, userId]);

  return { role };
}
```

### 76.3 `src/features/admin/useAdminActions.ts`

```ts
import { supabase } from "../../lib/supabase";
import { canManageRoom, canModerateRoom, type ChannelRole } from "./types";

export function useAdminActions(roomId: string, actorId: string, actorRole: ChannelRole) {
  async function audit(action: string, targetUserId?: string, payload: Record<string, unknown> = {}) {
    await supabase.from("admin_audit_logs").insert({
      room_id: roomId,
      actor_id: actorId,
      action,
      target_user_id: targetUserId ?? null,
      payload,
    });
  }

  async function setUserRole(targetUserId: string, role: ChannelRole) {
    if (!canManageRoom(actorRole)) throw new Error("Tidak punya akses mengatur role.");

    const { error } = await supabase.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      role,
    });

    if (error) throw error;
    await audit("set_user_role", targetUserId, { role });
  }

  async function muteUser(targetUserId: string) {
    if (!canModerateRoom(actorRole)) throw new Error("Tidak punya akses mute user.");
    await setUserRole(targetUserId, "muted");
  }

  async function updateFeatureFlags(flags: Record<string, boolean>) {
    if (!canManageRoom(actorRole)) throw new Error("Tidak punya akses fitur channel.");

    const { error } = await supabase.from("channel_feature_flags").upsert({
      room_id: roomId,
      ...flags,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    await audit("update_feature_flags", undefined, flags);
  }

  return { setUserRole, muteUser, updateFeatureFlags };
}
```

## 77. Leaderboard Implementation

### 77.1 `src/features/leaderboard/types.ts`

```ts
export interface LeaderboardItem {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
  metric: "xp" | "applause" | "fire" | "karaoke" | "chat";
}
```

### 77.2 `src/features/leaderboard/useLeaderboard.ts`

```ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { LeaderboardItem } from "./types";

export function useLeaderboard(metric: LeaderboardItem["metric"] = "xp") {
  const [items, setItems] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    async function load() {
      const column = metric === "xp"
        ? "experience_points"
        : metric === "applause"
          ? "total_applause"
          : metric === "fire"
            ? "total_fire"
            : metric === "karaoke"
              ? "total_karaoke_sessions"
              : "total_chat_messages";

      const { data, error } = await supabase
        .from("user_profiles_extended")
        .select("user_id, display_name, avatar_url, experience_points, total_applause, total_fire, total_karaoke_sessions, total_chat_messages")
        .order(column, { ascending: false })
        .limit(10);

      if (!error && data) {
        setItems(data.map((row: any, index: number) => ({
          user_id: row.user_id,
          display_name: row.display_name || "User",
          avatar_url: row.avatar_url,
          score: row[column] ?? 0,
          rank: index + 1,
          metric,
        })));
      }
    }

    load();
  }, [metric]);

  return { items };
}
```

## 78. AI Karaoke Assistant Implementation

### 78.1 Frontend Hook `src/features/ai-assistant/useAiKaraokeAssistant.ts`

```ts
import { useState } from "react";

export function useAiKaraokeAssistant() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  async function askAssistant(prompt: string) {
    const clean = prompt.trim();
    if (!clean) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai/karaoke-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: clean }),
      });

      if (!response.ok) throw new Error("AI Assistant gagal merespons.");
      const data = await response.json();
      setAnswer(data.answer || "");
    } finally {
      setLoading(false);
    }
  }

  return { loading, answer, askAssistant };
}
```

### 78.2 Backend Route Contoh `api/ai/karaoke-assistant.ts`

```ts
type RequestBody = { prompt?: string };

export default async function handler(req: Request, env: Record<string, string>) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const body = (await req.json()) as RequestBody;
  const prompt = body.prompt?.trim();

  if (!prompt || prompt.length > 500) {
    return new Response(JSON.stringify({ error: "Prompt tidak valid." }), { status: 400 });
  }

  const systemPrompt = `Kamu adalah AI Karaoke Assistant untuk aplikasi NextVWT.
Bantu admin dan user membuat suasana room karaoke menjadi seru, sopan, dan ramah komunitas.
Jangan membuat konten kasar, menghina, provokatif, atau mengandung SARA.
Jawab singkat, praktis, dan siap dipakai di room.`;

  // Ganti bagian ini dengan AI provider backend yang dipakai.
  // API key wajib berada di server environment, bukan frontend.
  const answer = `Ide singkat: ${prompt}. Buat suasana tetap ramah, beri apresiasi ke penyanyi, dan ajak user memberi reaction.`;

  return new Response(JSON.stringify({ answer, systemPromptUsed: false }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

## 79. Mini Mixer Karaoke Implementation Tahap Aman

Tahap awal hanya menyimpan preset dan volume lokal. Jangan langsung memodifikasi WebRTC audio track sebelum PTT stabil.

### 79.1 `src/features/mini-mixer/types.ts`

```ts
export type MixerPreset = "normal" | "radio" | "karaoke-echo" | "studio-soft" | "outdoor-loud";

export interface MiniMixerSettings {
  micVolume: number;
  musicVolume: number;
  monitorVolume: number;
  echoLevel: number;
  noiseGateEnabled: boolean;
  karaokeModeEnabled: boolean;
  preset: MixerPreset;
}
```

### 79.2 `src/features/mini-mixer/mixerPresets.ts`

```ts
import type { MiniMixerSettings, MixerPreset } from "./types";

export const DEFAULT_MIXER_SETTINGS: MiniMixerSettings = {
  micVolume: 80,
  musicVolume: 65,
  monitorVolume: 50,
  echoLevel: 0,
  noiseGateEnabled: true,
  karaokeModeEnabled: false,
  preset: "normal",
};

export const MIXER_PRESETS: Record<MixerPreset, Partial<MiniMixerSettings>> = {
  normal: { micVolume: 80, musicVolume: 65, echoLevel: 0 },
  radio: { micVolume: 90, musicVolume: 35, echoLevel: 0 },
  "karaoke-echo": { micVolume: 82, musicVolume: 72, echoLevel: 35, karaokeModeEnabled: true },
  "studio-soft": { micVolume: 70, musicVolume: 55, echoLevel: 15 },
  "outdoor-loud": { micVolume: 95, musicVolume: 75, echoLevel: 5 },
};
```

### 79.3 `src/features/mini-mixer/useMiniMixer.ts`

```ts
import { useEffect, useState } from "react";
import type { MiniMixerSettings, MixerPreset } from "./types";
import { DEFAULT_MIXER_SETTINGS, MIXER_PRESETS } from "./mixerPresets";

const STORAGE_KEY = "nextvwt-mini-mixer-settings";

export function useMiniMixer() {
  const [settings, setSettings] = useState<MiniMixerSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_MIXER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_MIXER_SETTINGS;
    } catch {
      return DEFAULT_MIXER_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function update<K extends keyof MiniMixerSettings>(key: K, value: MiniMixerSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function applyPreset(preset: MixerPreset) {
    setSettings((prev) => ({ ...prev, ...MIXER_PRESETS[preset], preset }));
  }

  return { settings, update, applyPreset };
}
```

## 80. Integrasi ke Main Radio Screen Tanpa Mengubah Layout Asli

Pola terbaik adalah menambahkan tombol cepat kecil di sisi kanan atau bawah LCD seperti rancangan visual sebelumnya. Jangan mengubah ukuran LCD, D-Pad, SCAN/SET, atau PTT.

### `src/features/entertainment/EntertainmentOverlay.tsx`

```tsx
import { ReactionOverlay } from "../reactions/ReactionOverlay";
import { QuickReactionButton } from "../reactions/QuickReactionButton";
import { ChannelChatButton } from "../chat/ChannelChatButton";
import { ChannelChatPanel } from "../chat/ChannelChatPanel";
import { KaraokeQueueMiniCard } from "../karaoke-queue/KaraokeQueueMiniCard";
import { useEntertainmentStore } from "../../app/store/useEntertainmentStore";

type Props = {
  roomId: string;
  currentUser: { id: string; name: string; avatarUrl?: string };
  reactions: any;
  karaokeQueue: any;
};

export function EntertainmentOverlay({ roomId, currentUser, reactions, karaokeQueue }: Props) {
  const { activePanel, setActivePanel, closePanel } = useEntertainmentStore();

  return (
    <>
      <ReactionOverlay reactions={reactions.activeReactions} />

      <div className="quick-action-dock" aria-label="Quick entertainment actions">
        <QuickReactionButton onClick={() => reactions.sendReaction("applause")} />
        <ChannelChatButton onClick={() => setActivePanel("chat")} />
      </div>

      {karaokeQueue?.session && (
        <KaraokeQueueMiniCard
          session={karaokeQueue.session}
          elapsedSeconds={karaokeQueue.elapsedSeconds}
        />
      )}

      {activePanel === "chat" && (
        <ChannelChatPanel
          roomId={roomId}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
          currentUserAvatar={currentUser.avatarUrl}
          onClose={closePanel}
        />
      )}
    </>
  );
}
```

### CSS Dock Tambahan

```css
.quick-action-dock {
  position: absolute;
  right: -54px;
  top: 185px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 30;
}

.quick-action-dock button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.45);
  background: linear-gradient(180deg, #f8fafc, #cbd5e1);
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.8),
    inset 0 -3px 5px rgba(0,0,0,0.28),
    0 6px 14px rgba(0,0,0,0.28);
  cursor: pointer;
}

@media (max-width: 480px) {
  .quick-action-dock {
    right: 14px;
    top: 142px;
  }
}
```

## 81. Visual UX Placement Rules

```text
Reaction Button  : tombol bulat kecil, ikon emoji/star, dekat sisi LCD agar mudah dijangkau.
Chat Button      : tombol bulat kecil, ikon bubble, berada di bawah Reaction Button.
Queue Button     : boleh masuk panel karaoke/modal, bukan tombol utama permanen.
Karaoke Display Card  : overlay mini di atas/bawah LCD, auto-hide jika tidak live.
Admin Panel      : hanya dari menu SET atau More, tidak tampil untuk member biasa.
Mini Mixer       : drawer/modal, tidak berada di layar utama terus-menerus.
AI Assistant     : modal ringan, hanya aktif bila dibuka user/admin.
```

## 82. Checklist Implementasi Per Phase

### Phase 1 — Engagement Core

```text
[ ] Tambahkan folder reactions
[ ] Tambahkan folder chat
[ ] Tambahkan folder presence
[ ] Tambahkan useEntertainmentRoom
[ ] Tambahkan quick-action-dock tanpa mengubah layout asli
[ ] Test 2 browser dalam room sama
[ ] Test room isolation
```

### Phase 2 — Karaoke Experience

```text
[ ] Tambahkan karaoke_queue table
[ ] Tambahkan karaoke_queue table
[ ] Tambahkan song_requests table
[ ] Buat QueueJoinButton
[ ] Buat KaraokeQueuePanel
[ ] Buat KaraokeQueueMiniCard
[ ] Hubungkan reaction counter ke karaoke display
```

### Phase 3 — Identity & Retention

```text
[ ] Tambahkan user_profiles_extended
[ ] Tambahkan user_badges
[ ] Tambahkan themeCatalog
[ ] Tambahkan leaderboard panel
[ ] Tambahkan XP saat chat/karaoke/reaction
```

### Phase 4 — Power Features

```text
[ ] Tambahkan channel_roles
[ ] Tambahkan admin audit log
[ ] Tambahkan admin action hooks
[ ] Tambahkan AI assistant backend route
[ ] Tambahkan mini mixer local setting
[ ] Jangan ubah audio pipeline sampai semua phase sebelumnya stabil
```

## 83. Prompt Final untuk Antigravity AI / AI Coding Agent

```text
Gunakan dokumen NEXTVWT MASTER ENTERTAINMENT IMPLEMENTATION PLAN sebagai sumber utama.
Implementasikan fitur entertainment NextVWT secara bertahap dengan struktur modular di src/features/.

Prioritas phase:
1. Lottie Reaction, Chat Room, Smart Presence.
2. Karaoke Queue, Song Request.
3. Badge & Level, Leaderboard, Channel Theme.
4. Admin Panel, AI Karaoke Assistant, Mini Mixer.

Aturan keras:
- Jangan mengubah core audio PTT.
- Jangan mengubah bentuk layout original radio UI.
- Tambahkan tombol reaction dan chat sebagai overlay/dock kecil.
- Semua fitur wajib memakai room_id.
- Semua realtime subscription wajib cleanup saat unmount.
- Gunakan Supabase Realtime Broadcast untuk reaction ephemeral.
- Gunakan postgres_changes untuk chat, queue, stage, request, theme.
- Tambahkan cooldown, validation, role check, dan RLS production notes.
- Jalankan pnpm type-check dan pnpm build setelah implementasi.
```

## 84. Kesimpulan Teknis Final

Dengan tambahan implementasi ini, dokumen tidak hanya menjadi rencana fitur, tetapi sudah menjadi **blueprint kerja codebase**. Struktur yang disarankan menjaga agar NextVWT tetap stabil sebagai aplikasi PTT, sementara fitur hiburan berjalan sebagai layer tambahan yang dapat diaktifkan, dimatikan, dikembangkan, atau dipindahkan ke Android Kotlin/Compose tanpa merusak arsitektur utama.
