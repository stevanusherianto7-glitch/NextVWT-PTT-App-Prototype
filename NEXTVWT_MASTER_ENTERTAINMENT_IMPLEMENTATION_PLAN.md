# NEXTVWT MASTER ENTERTAINMENT IMPLEMENTATION PLAN
## Integrasi Lottie Reaction, Chat Room, dan Fitur Entertainment Lanjutan

**Nama proyek:** NextVWT PTT App Prototype  
**Target dokumen:** Master instruksi kerja dan implementation plan  
**Cakupan:** Lottie Reaction, Chat Room, Smart Presence, Karaoke Queue, Live Stage Karaoke, Song Request, Badge & Level, Channel Theme, Mini Mixer, AI Karaoke Assistant, Admin Panel, Leaderboard  
**Platform awal:** React / Vite / TypeScript / Supabase Realtime  
**Status dokumen:** Siap digunakan sebagai panduan kerja developer atau AI coding agent seperti Antigravity AI

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
5. Live Stage Karaoke
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

create policy "Members can read channel messages"
on public.channel_messages
for select
using (
  exists (
    select 1
    from public.channel_members cm
    where cm.room_id = channel_messages.room_id
    and cm.user_id = auth.uid()::text
  )
);

create policy "Members can insert channel messages"
on public.channel_messages
for insert
with check (
  exists (
    select 1
    from public.channel_members cm
    where cm.room_id = channel_messages.room_id
    and cm.user_id = auth.uid()::text
  )
);
```

Jika NextVWT masih memakai guest user, jangan gunakan `guest-session-id` statis. Buat `device_session_id` unik per instalasi/per browser.

---

### 7.4 File `src/features/chat/types.ts`

```ts
export type ChannelMessageType = "text" | "system" | "reaction";

export interface ChannelMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  message: string;
  message_type: ChannelMessageType;
  created_at: string;
}
```

---

### 7.5 File `src/features/chat/useChannelChat.ts`

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { ChannelMessage } from "./types";

type UseChannelChatProps = {
  roomId: string;
  currentUserId: string;
  currentUserName?: string;
  currentUserAvatar?: string;
};

export function useChannelChat({
  roomId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: UseChannelChatProps) {
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

    async function loadMessages() {
      setLoading(true);

      const { data, error } = await supabase
        .from("channel_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(80);

      if (!mounted) return;

      if (!error && data) {
        setMessages(data as ChannelMessage[]);
      }

      setLoading(false);
    }

    loadMessages();

    const realtimeChannel = supabase
      .channel(`channel-chat:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChannelMessage;

          setMessages((prev) => {
            const exists = prev.some((item) => item.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage].slice(-100);
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(realtimeChannel);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();

      if (!cleanText) return;
      if (!roomId || !currentUserId) return;

      if (cleanText.length > 500) {
        throw new Error("Pesan terlalu panjang. Maksimal 500 karakter.");
      }

      const now = Date.now();
      const cooldownMs = 1200;

      if (now - lastSentAtRef.current < cooldownMs) {
        throw new Error("Terlalu cepat mengirim pesan.");
      }

      lastSentAtRef.current = now;

      const { error } = await supabase.from("channel_messages").insert({
        room_id: roomId,
        sender_id: currentUserId,
        sender_name: currentUserName || "User",
        sender_avatar: currentUserAvatar || null,
        message: cleanText,
        message_type: "text",
      });

      if (error) throw error;
    },
    [roomId, currentUserId, currentUserName, currentUserAvatar]
  );

  return {
    messages,
    loading,
    sendMessage,
  };
}
```

---

### 7.6 File `src/features/chat/ChannelChatPanel.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { useChannelChat } from "./useChannelChat";
import "./channelChat.css";

type ChannelChatPanelProps = {
  roomId: string;
  currentUserId: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onClose?: () => void;
};

export function ChannelChatPanel({
  roomId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onClose,
}: ChannelChatPanelProps) {
  const [text, setText] = useState("");
  const [errorText, setErrorText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { messages, loading, sendMessage } = useChannelChat({
    roomId,
    currentUserId,
    currentUserName,
    currentUserAvatar,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    try {
      setErrorText("");
      const value = text.trim();
      if (!value) return;
      setText("");
      await sendMessage(value);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Gagal mengirim pesan.");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="channel-chat-panel">
      <div className="channel-chat-header">
        <div>
          <h3>Chat Channel</h3>
          <p>Pesan realtime untuk user dalam room ini</p>
        </div>

        {onClose && (
          <button type="button" className="channel-chat-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="channel-chat-body">
        {loading && <div className="channel-chat-muted">Memuat pesan...</div>}

        {!loading && messages.length === 0 && (
          <div className="channel-chat-empty">
            Belum ada pesan. Mulai percakapan di channel ini.
          </div>
        )}

        {messages.map((item) => {
          const isMine = item.sender_id === currentUserId;

          return (
            <div
              key={item.id}
              className={isMine ? "channel-chat-message mine" : "channel-chat-message"}
            >
              {!isMine && (
                <div className="channel-chat-avatar">
                  {item.sender_avatar ? (
                    <img src={item.sender_avatar} alt="" />
                  ) : (
                    <span>{(item.sender_name || "U").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
              )}

              <div className="channel-chat-bubble">
                {!isMine && <div className="channel-chat-name">{item.sender_name || "User"}</div>}

                <div className="channel-chat-text">{item.message}</div>

                <div className="channel-chat-time">
                  {new Date(item.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {errorText && <div className="channel-chat-error">{errorText}</div>}

      <div className="channel-chat-input-area">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan channel..."
          maxLength={500}
        />

        <button type="button" onClick={handleSend}>
          Kirim
        </button>
      </div>
    </div>
  );
}
```

---

### 7.7 File `src/features/chat/ChannelChatButton.tsx`

```tsx
import "./channelChat.css";

type ChannelChatButtonProps = {
  unreadCount?: number;
  onClick: () => void;
};

export function ChannelChatButton({ unreadCount = 0, onClick }: ChannelChatButtonProps) {
  return (
    <button type="button" className="chat-floating-btn" onClick={onClick}>
      Chat
      {unreadCount > 0 && <span className="chat-floating-badge">{unreadCount}</span>}
    </button>
  );
}
```

---

### 7.8 File `src/features/chat/channelChat.css`

```css
.channel-chat-panel {
  position: fixed;
  right: 16px;
  bottom: 86px;
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 140px));
  z-index: 2600;
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.96));
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.65);
}

.channel-chat-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(180deg, #ffffff, #eef5ff);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.channel-chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #0b5a2c;
}

.channel-chat-header p {
  margin: 3px 0 0;
  font-size: 12px;
  color: #64748b;
}

.channel-chat-close {
  border: none;
  background: transparent;
  font-size: 28px;
  color: #64748b;
  cursor: pointer;
}

.channel-chat-body {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  background:
    radial-gradient(circle at 50% 0%, rgba(47, 165, 88, 0.08), transparent 45%),
    linear-gradient(180deg, #f8fafc, #eef2f7);
}

.channel-chat-muted,
.channel-chat-empty {
  margin: 40px auto;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  max-width: 260px;
}

.channel-chat-message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.channel-chat-message.mine {
  justify-content: flex-end;
}

.channel-chat-avatar {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 50%;
  overflow: hidden;
  background: #0b5a2c;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
}

.channel-chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.channel-chat-bubble {
  max-width: 74%;
  padding: 9px 11px 7px;
  border-radius: 16px 16px 16px 5px;
  background: #ffffff;
  color: #0f172a;
  box-shadow:
    0 5px 14px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.channel-chat-message.mine .channel-chat-bubble {
  border-radius: 16px 16px 5px 16px;
  background: linear-gradient(180deg, #18d46a, #0b8f3a);
  color: white;
}

.channel-chat-name {
  font-size: 11px;
  font-weight: 900;
  color: #0b5a2c;
  margin-bottom: 3px;
}

.channel-chat-text {
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.channel-chat-time {
  margin-top: 4px;
  font-size: 10px;
  opacity: 0.7;
  text-align: right;
}

.channel-chat-error {
  padding: 8px 14px;
  font-size: 12px;
  color: #b91c1c;
  background: #fee2e2;
}

.channel-chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
}

.channel-chat-input-area textarea {
  flex: 1;
  min-height: 42px;
  max-height: 96px;
  resize: none;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  padding: 10px 12px;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.channel-chat-input-area textarea:focus {
  border-color: rgba(11, 143, 58, 0.55);
  box-shadow: 0 0 0 3px rgba(11, 143, 58, 0.12);
}

.channel-chat-input-area button {
  border: none;
  border-radius: 14px;
  padding: 0 16px;
  background: linear-gradient(180deg, #18d46a, #0b8f3a);
  color: white;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.42),
    0 8px 18px rgba(11, 143, 58, 0.28);
}

.chat-floating-btn {
  position: fixed;
  right: 18px;
  bottom: 154px;
  z-index: 2500;
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  background: linear-gradient(180deg, #ffffff, #dbeafe);
  color: #0b5a2c;
  font-size: 13px;
  font-weight: 900;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  cursor: pointer;
}

.chat-floating-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 8. Integrasi ke Room/Channel Utama

Cari komponen utama tempat user berada di room/channel. Nama file bisa berbeda, misalnya:

- `App.tsx`
- `RoomScreen.tsx`
- `MainPanel.tsx`
- `ChannelRoom.tsx`
- `PTTScreen.tsx`

Tambahkan integrasi seperti pola berikut:

```tsx
import { useState } from "react";
import { useRoomReactions } from "./features/reactions/useRoomReactions";
import { ReactionOverlay } from "./features/reactions/ReactionOverlay";
import { ReactionPicker } from "./features/reactions/ReactionPicker";
import { ChannelChatPanel } from "./features/chat/ChannelChatPanel";
import { ChannelChatButton } from "./features/chat/ChannelChatButton";

export function RoomScreen() {
  const [showChat, setShowChat] = useState(false);

  const currentRoomId = activeChannel?.id || activeChannel?.name || "default-room";
  const currentUserId = currentUser.id;
  const currentUserName = currentUser.name;
  const currentUserAvatar = currentUser.avatarUrl;

  const { activeReactions, sendReaction } = useRoomReactions({
    roomId: currentRoomId,
    currentUserId,
    currentUserName,
  });

  return (
    <>
      {/* UI utama NextVWT tetap di sini */}

      <ReactionOverlay reactions={activeReactions} />

      <ReactionPicker
        onSend={(reaction) =>
          sendReaction(reaction, activeSinger?.id, activeSinger?.name)
        }
      />

      <ChannelChatButton onClick={() => setShowChat(true)} />

      {showChat && (
        <ChannelChatPanel
          roomId={currentRoomId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
```

Sesuaikan variabel berikut dengan codebase aktual:

```text
activeChannel
currentUser
activeSinger
currentRoomId
currentUserAvatar
```

---

## 9. Instruksi untuk Antigravity AI

Buat skill Antigravity agar agent tidak asal mengubah project.

### 9.1 Buat file skill

Path:

```text
.agent/skills/nextvwt-lottie-chat/SKILL.md
```

Isi:

```md
---
name: nextvwt-lottie-chat
description: Gunakan skill ini saat menambahkan fitur Lottie Reaction Overlay dan Channel Chat Room realtime pada NextVWT.
---

# NextVWT Lottie Reaction & Chat Room Skill

## Tujuan
Tambahkan fitur animasi apresiasi karaoke berbasis Lottie dan chat realtime antar user dalam satu channel/room.

## Aturan Utama
- Jangan mengubah core audio PTT tanpa instruksi khusus.
- Jangan menghapus fitur channel, user list, karaoke module, SET/settings, avatar, atau brand NextVWT.
- Gunakan `lottie-react` untuk animasi.
- Simpan file animasi di `public/animations/`.
- Reaction harus realtime room-wide dan tampil di tengah UI.
- Reaction payload hanya boleh berisi metadata kecil, bukan file animasi.
- Reaction harus memakai whitelist dari `reactionCatalog.ts`.
- Chat room harus menggunakan table `channel_messages`.
- Chat harus realtime hanya untuk room/channel aktif.
- Tambahkan cooldown untuk reaction dan chat.
- Overlay reaction harus `pointer-events: none`.
- Jalankan type-check dan build setelah implementasi.

## File yang Dibuat
- `src/features/reactions/types.ts`
- `src/features/reactions/reactionCatalog.ts`
- `src/features/reactions/useRoomReactions.ts`
- `src/features/reactions/ReactionOverlay.tsx`
- `src/features/reactions/ReactionPicker.tsx`
- `src/features/reactions/roomReaction.css`
- `src/features/chat/types.ts`
- `src/features/chat/useChannelChat.ts`
- `src/features/chat/ChannelChatPanel.tsx`
- `src/features/chat/ChannelChatButton.tsx`
- `src/features/chat/channelChat.css`

## Verifikasi
1. Jalankan `pnpm install`.
2. Jalankan `pnpm type-check`.
3. Jalankan `pnpm build`.
4. Test dua browser/tab dalam room yang sama.
5. Pastikan chat realtime terkirim.
6. Pastikan reaction tampil di tengah UI untuk semua user room.
7. Pastikan tombol PTT tetap bisa digunakan.
```

### 9.2 Prompt untuk Antigravity AI

Gunakan prompt berikut:

```text
Gunakan skill nextvwt-lottie-chat.
Implementasikan fitur Lottie Reaction Overlay dan Channel Chat Room realtime pada NextVWT.
Ikuti implementation plan ini.
Jangan mengubah core audio PTT.
Cari komponen room/channel utama, lalu integrasikan ReactionOverlay, ReactionPicker, ChannelChatButton, dan ChannelChatPanel.
Pastikan pnpm type-check dan pnpm build berhasil.
```

---

## 10. Checklist Testing Manual

### 10.1 Test Lottie Reaction

- [ ] Jalankan aplikasi lokal.
- [ ] Login/masuk sebagai user A di browser pertama.
- [ ] Masuk ke room/channel yang sama sebagai user B di browser kedua.
- [ ] User A klik reaction `Tepuk Tangan`.
- [ ] Animasi muncul di tengah UI user A.
- [ ] Animasi juga muncul di tengah UI user B.
- [ ] Animasi hilang otomatis setelah 2–3 detik.
- [ ] Tombol PTT tetap bisa diklik.
- [ ] User tidak bisa spam reaction terlalu cepat.
- [ ] Jika file Lottie gagal dimuat, fallback visual tetap muncul.

### 10.2 Test Chat Room

- [ ] User A mengirim pesan di channel.
- [ ] User B menerima pesan tanpa refresh.
- [ ] Pesan user sendiri tampil di sisi kanan.
- [ ] Pesan user lain tampil di sisi kiri.
- [ ] Nama pengirim tampil.
- [ ] Waktu pesan tampil.
- [ ] Chat auto-scroll ke pesan terbaru.
- [ ] Pesan lebih dari 500 karakter ditolak.
- [ ] User tidak bisa spam terlalu cepat.
- [ ] Chat bisa ditutup dan dibuka kembali.

### 10.3 Test Room Isolation

- [ ] User A dan B berada di room 229.
- [ ] User C berada di room berbeda.
- [ ] Reaction dari room 229 tidak muncul di room user C.
- [ ] Chat room 229 tidak muncul di room user C.

---

## 11. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Reaction spam | UI penuh animasi | Cooldown 2 detik dan queue limit |
| Chat spam | Database penuh dan room terganggu | Cooldown, limit pesan, moderator control |
| Lottie terlalu besar | UI berat di mobile | Gunakan file JSON kecil dan preload asset penting |
| Overlay menutupi PTT | User sulit berbicara | `pointer-events: none`, ukuran sedang, durasi pendek |
| User luar room ikut akses chat | Kebocoran privasi room | RLS dan validasi membership channel |
| Guest ID statis | Identitas user bentrok | Gunakan session/device ID unik |
| Realtime channel leak | Memory leak | `supabase.removeChannel()` saat unmount |

---

## 12. Rekomendasi Tahapan Pengerjaan

### Tahap 1 — Persiapan

- [ ] Buat branch baru: `feature/lottie-chat-room`.
- [ ] Install `lottie-react`.
- [ ] Buat folder `public/animations/`.
- [ ] Download minimal 3 animasi Lottie: applause, love, fire.
- [ ] Jalankan `pnpm type-check` untuk mengetahui kondisi awal.

### Tahap 2 — Lottie Reaction MVP

- [ ] Buat folder `src/features/reactions/`.
- [ ] Buat `types.ts`.
- [ ] Buat `reactionCatalog.ts`.
- [ ] Buat `useRoomReactions.ts`.
- [ ] Buat `ReactionOverlay.tsx`.
- [ ] Buat `ReactionPicker.tsx`.
- [ ] Buat `roomReaction.css`.
- [ ] Integrasikan ke UI room/channel.
- [ ] Test dua browser/tab.

### Tahap 3 — Chat Room MVP

- [ ] Buat table `channel_messages` di Supabase.
- [ ] Buat folder `src/features/chat/`.
- [ ] Buat `types.ts`.
- [ ] Buat `useChannelChat.ts`.
- [ ] Buat `ChannelChatPanel.tsx`.
- [ ] Buat `ChannelChatButton.tsx`.
- [ ] Buat `channelChat.css`.
- [ ] Integrasikan ke UI room/channel.
- [ ] Test dua browser/tab.

### Tahap 4 — Hardening

- [ ] Tambahkan RLS untuk `channel_messages`.
- [ ] Tambahkan table `channel_members` jika belum ada.
- [ ] Perbaiki guest session ID agar unik.
- [ ] Tambahkan moderation basic.
- [ ] Tambahkan setting user untuk mengaktifkan/nonaktifkan animasi.
- [ ] Tambahkan reduce motion support.

### Tahap 5 — Build dan Review

- [ ] Jalankan `pnpm type-check`.
- [ ] Jalankan `pnpm build`.
- [ ] Perbaiki error sampai bersih.
- [ ] Commit perubahan.
- [ ] Push ke branch.
- [ ] Buat Pull Request atau merge jika sudah stabil.

---

## 13. Git Workflow yang Disarankan

```bash
git checkout -b feature/lottie-chat-room
pnpm add lottie-react
pnpm install
pnpm type-check
pnpm build

git add .
git commit -m "feat: add lottie reactions and channel chat room"
git push origin feature/lottie-chat-room
```

Jika menggunakan worktree:

```bash
git worktree add ../nextvwt-lottie-chat -b feature/lottie-chat-room
cd ../nextvwt-lottie-chat
pnpm install
```

---

## 14. Standar Kualitas Sebelum Merge

Fitur boleh masuk ke branch utama jika:

- [ ] Build berhasil.
- [ ] Type-check berhasil.
- [ ] Tidak ada error console fatal.
- [ ] PTT tetap berjalan.
- [ ] Reaction hanya muncul di room yang sama.
- [ ] Chat hanya muncul di room yang sama.
- [ ] Tidak ada API key atau secret yang ikut commit.
- [ ] `.env` tetap tidak masuk Git.
- [ ] UI tidak menutupi tombol utama.
- [ ] Mobile layout masih layak digunakan.

---

## 15. Catatan Produksi

Untuk versi production, jangan hanya mengandalkan validasi frontend. Tambahkan validasi backend/Supabase policy untuk:

- membership room
- role user
- block/mute user
- rate limit server-side
- audit log moderator
- filter kata kasar
- delete message oleh admin/moderator

Untuk tahap prototype, implementasi client-side + Supabase Realtime sudah cukup untuk menguji UX dan alur fitur.

---

## 16. Kesimpulan

Integrasi **Lottie Reaction Overlay** dan **Chat Room Antar User** sangat layak diterapkan pada NextVWT karena mendukung karakter aplikasi sebagai platform PTT, karaoke, hiburan, dan komunitas realtime.

Prioritas terbaik:

1. Buat reaction realtime yang ringan dan muncul di tengah UI.
2. Buat chat room realtime berbasis `channel_messages`.
3. Pastikan keduanya terisolasi per room/channel.
4. Tambahkan cooldown agar tidak spam.
5. Baru lanjutkan ke RLS, moderation, leaderboard karaoke, dan reaction pack premium.

Dengan implementasi bertahap, fitur ini bisa menjadi pembeda utama NextVWT dibanding aplikasi PTT biasa.

---

# BAGIAN 2 — FITUR ENTERTAINMENT LANJUTAN

# NEXTVWT ENTERTAINMENT FEATURES — INSTRUKSI KERJA & IMPLEMENTATION PLAN

## 1. Tujuan Dokumen

Dokumen ini menjadi panduan kerja untuk menambahkan fitur entertainment lanjutan pada aplikasi **NextVWT**, selain fitur **Lottie Reaction** dan **Chat Room antar user** yang sudah direncanakan sebelumnya.

Fokus pengembangan diarahkan agar NextVWT tidak hanya menjadi aplikasi push-to-talk biasa, tetapi berkembang menjadi platform **radio komunitas digital, karaoke room, live stage, dan ruang interaksi hiburan** yang lebih menarik daripada Indovwt atau aplikasi sejenis.

---

## 2. Prinsip Utama Pengembangan

Pengembangan fitur entertainment wajib mengikuti prinsip berikut:

1. **Tidak mengganggu core PTT**  
   Semua fitur hiburan harus berjalan sebagai layer tambahan, bukan mengubah jalur utama audio push-to-talk.

2. **Realtime dan ringan**  
   Fitur seperti reaction, chat, live stage, dan queue harus memakai event realtime yang ringan.

3. **Room-based experience**  
   Semua fitur harus terikat pada channel/room yang sedang aktif.

4. **User engagement oriented**  
   Fitur harus membuat user ingin bertahan lebih lama, kembali ke room, dan aktif berinteraksi.

5. **Aman dari spam dan abuse**  
   Setiap fitur interaktif wajib memiliki cooldown, limit, dan kontrol moderator.

6. **Siap dikembangkan ke Android Kotlin/Compose**  
   Struktur data dan konsep fitur harus bersih agar mudah diporting ke Android.

---

## 3. Prioritas Fitur Entertainment Lanjutan

Prioritas pengembangan setelah Lottie Reaction dan Chat Room adalah:

| Prioritas | Fitur | Dampak | Kompleksitas |
|---|---|---|---|
| 1 | Live Stage Karaoke | Sangat tinggi | Sedang |
| 2 | Karaoke / Mic Queue | Sangat tinggi | Sedang |
| 3 | Song Request | Tinggi | Sedang |
| 4 | Badge & Level User | Tinggi | Sedang |
| 5 | Channel Theme / Skin | Tinggi | Sedang |
| 6 | Mini Mixer Karaoke | Tinggi | Tinggi |
| 7 | AI Karaoke Assistant | Tinggi | Sedang-Tinggi |
| 8 | Admin Panel Channel | Sangat tinggi | Tinggi |
| 9 | Leaderboard Channel | Sedang-Tinggi | Sedang |
| 10 | Smart Presence | Tinggi | Sedang |

---

# BAGIAN A — LIVE STAGE KARAOKE

## 4. Konsep Fitur

**Live Stage Karaoke** adalah mode tampilan khusus ketika ada user yang sedang karaoke. UI menampilkan user yang sedang tampil seperti berada di panggung mini.

Fitur ini menjadi pembeda utama NextVWT karena user tidak hanya terdengar sedang bernyanyi, tetapi juga mendapat tampilan visual, reaction, dan apresiasi dari room.

## 5. Komponen Utama Live Stage

Live Stage menampilkan:

- Nama penyanyi aktif
- Avatar penyanyi
- Judul lagu
- Durasi tampil
- Jumlah reaction
- Status mic/karaoke
- Antrian penyanyi berikutnya
- Tombol apresiasi cepat

Contoh tampilan konseptual:

```text
┌──────────────────────────────┐
│         LIVE KARAOKE          │
│    🎤 BUDI SEDANG NYANYI      │
│    Lagu: Separuh Aku          │
│    👏 23   ❤️ 12   🔥 8       │
│    Berikutnya: Andi, Sari     │
└──────────────────────────────┘
```

## 6. Struktur Folder

Tambahkan struktur berikut:

```text
src/
  features/
    live-stage/
      types.ts
      useLiveStage.ts
      LiveStagePanel.tsx
      LiveStageMiniCard.tsx
      liveStage.css
```

## 7. Struktur Data

```ts
export type LiveStageStatus = "idle" | "waiting" | "live" | "ended";

export interface LiveStageSession {
  id: string;
  room_id: string;
  singer_id: string;
  singer_name: string;
  singer_avatar?: string;
  song_title?: string;
  status: LiveStageStatus;
  started_at?: string;
  ended_at?: string;
  applause_count: number;
  love_count: number;
  fire_count: number;
  created_at: string;
}
```

## 8. SQL Supabase

```sql
create table public.live_stage_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  singer_id text not null,
  singer_name text not null,
  singer_avatar text,
  song_title text,
  status text not null default 'idle',
  started_at timestamptz,
  ended_at timestamptz,
  applause_count integer not null default 0,
  love_count integer not null default 0,
  fire_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index live_stage_room_status_idx
on public.live_stage_sessions (room_id, status, created_at);
```

## 9. Instruksi Implementasi

1. Buat tabel `live_stage_sessions`.
2. Buat hook `useLiveStage.ts` untuk membaca sesi live aktif berdasarkan `room_id`.
3. Subscribe realtime ke tabel `live_stage_sessions`.
4. Tampilkan `LiveStagePanel` jika ada session dengan status `live`.
5. Hubungkan reaction Lottie ke `applause_count`, `love_count`, dan `fire_count`.
6. Tambahkan tombol moderator untuk `Start Live`, `End Live`, dan `Next Singer`.
7. Pastikan Live Stage tidak menutupi tombol PTT utama.

## 10. Acceptance Criteria

Fitur dianggap berhasil jika:

- Saat user mulai karaoke, panel Live Stage muncul di semua user room.
- Nama dan avatar penyanyi tampil benar.
- Judul lagu dapat ditampilkan.
- Reaction counter bertambah secara realtime.
- Saat sesi selesai, panel hilang atau berubah menjadi status selesai.
- Tidak mengganggu tombol PTT.

---

# BAGIAN B — KARAOKE / MIC QUEUE

## 11. Konsep Fitur

**Karaoke Queue** adalah sistem antrian mic agar user tidak rebutan saat ingin bernyanyi atau berbicara. Fitur ini sangat penting untuk room karaoke karena membuat room lebih tertib.

## 12. Status Antrian

Status user dalam antrian:

```text
waiting     = sedang menunggu giliran
ready       = siap tampil
live        = sedang tampil
skipped     = dilewati
finished    = selesai tampil
cancelled   = batal
```

## 13. Struktur Folder

```text
src/
  features/
    karaoke-queue/
      types.ts
      useKaraokeQueue.ts
      KaraokeQueuePanel.tsx
      QueueJoinButton.tsx
      karaokeQueue.css
```

## 14. SQL Supabase

```sql
create table public.karaoke_queue (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  user_name text not null,
  user_avatar text,
  song_title text,
  queue_number integer not null,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index karaoke_queue_room_status_idx
on public.karaoke_queue (room_id, status, queue_number);
```

## 15. Instruksi Implementasi

1. Buat tabel `karaoke_queue`.
2. Buat tombol `Ikut Antrian`.
3. Saat user klik tombol, sistem memasukkan user ke queue room aktif.
4. Queue number dihitung berdasarkan posisi terakhir di room.
5. Moderator dapat menjalankan user berikutnya.
6. Saat user masuk status `live`, buat atau update `live_stage_sessions`.
7. Saat selesai, ubah status menjadi `finished` dan lanjut ke user berikutnya.

## 16. Acceptance Criteria

- User bisa masuk antrian karaoke.
- User tidak bisa masuk antrian dua kali dalam room yang sama.
- Moderator bisa mengubah status user menjadi `ready`, `live`, `skipped`, atau `finished`.
- Semua user melihat daftar antrian secara realtime.
- Live Stage otomatis mengikuti user yang sedang berstatus `live`.

---

# BAGIAN C — SONG REQUEST

## 17. Konsep Fitur

**Song Request** memungkinkan user dalam room mengusulkan lagu untuk dinyanyikan. User lain bisa melihat dan memberi vote.

## 18. SQL Supabase

```sql
create table public.song_requests (
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
6. Lagu terpilih dapat dikirim ke Live Stage sebagai `song_title`.

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
4. Tampilkan badge di user list, profile modal, dan Live Stage.
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

1. Gunakan data dari reaction, live stage, chat, dan presence.
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
3. Saat user live stage, status menjadi `karaoke`.
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
5. Live Stage Karaoke
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
3. Live Stage Karaoke
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
Live Stage Karaoke
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
3. Live Stage Karaoke
4. Song Request
```

Empat fitur tersebut adalah fondasi agar NextVWT terasa lebih premium, tertib, interaktif, dan berbeda dari Indovwt atau aplikasi walkie-talkie biasa.

---

# PENUTUP MASTER PLAN

Master plan ini menyatukan fitur dasar engagement dan fitur entertainment lanjutan untuk menjadikan NextVWT sebagai aplikasi PTT yang lebih hidup, premium, interaktif, dan berbeda dari aplikasi sejenis.

Prioritas paling aman adalah menyelesaikan fitur realtime ringan terlebih dahulu, yaitu **Lottie Reaction**, **Chat Room**, dan **Smart Presence**, sebelum masuk ke fitur yang lebih kompleks seperti **Karaoke Queue**, **Live Stage**, **Admin Panel**, **AI Assistant**, dan **Mini Mixer Karaoke**.
