# Cara Kerja Logika Fitur — NextVWT PTT App
**Versi:** 4.0 · **Diperbarui:** Juni 2026 · Mencakup Sistem Moderasi 5 Level

Dokumen ini menjelaskan arsitektur teknis, alur logika, state management, dan integrasi layanan NextVWT secara mendalam. Diperbarui untuk mencerminkan kondisi codebase terkini termasuk sistem moderasi yang telah terimplementasi.

---

## I. Peta Arsitektur & Struktur File

### 1.1 Store Zustand — 5 Slice Architecture

```
usePTTStore.ts (komposisi)
├── storeUtils.ts              safeGetStorage, safeSetStorage, generateUUID, getChannelUUID
├── subscription.ts            activeChannelSubscription (di luar state — non-serializable)
├── types.ts                   PTTState, AppUser, GuestUser
└── slices/
    ├── createAuthSlice.ts     user, setUser, signInWithGoogle, signOut
    ├── createChannelSlice.ts  channelNumber, channelUp/Down, subscribeToChannel, fetchChannels
    ├── createSettingsSlice.ts semua 20+ setting persisten (pttVolume, theme, audioMode, dll.)
    ├── createUISlice.ts       isKaraokePlayerOpen, modal states, UI flags
    └── createWebRTCSlice.ts   WebRTC signaling actions
```

**Aturan penting:** Tidak ada utility (`generateUUID`, `safeSetStorage`, dll.) di dalam slice atau usePTTStore langsung — semua ada di `storeUtils.ts` untuk menghindari circular import.

### 1.2 Audio Pipeline

```
PTTButton (tekan)
  → usePTTStore.setTransmitting(true)
  → useAudioStreamer.startTransmit()
      ├── useVAD.start()          Aktivasi AnalyserNode + RMS threshold 0.01
      ├── useWebRTC.connect()     Offer/answer + ICE candidates (STUN + TURN)
      └── useAudioPlayback.init() AudioContext + GainNode untuk playback
  → audioAnalyzer.startStreamAnalyzer() → progress bar (RMS nyata, bukan random)

PTTButton (lepas)
  → useAudioStreamer.stopTransmit()
  → Roger beep tone (1380Hz, 180ms) + squelch tail noise
  → useVAD.stop() + useWebRTC.cleanup()
```

### 1.3 Moderasi Channel

```
ChannelManagePanel (dibuka oleh user role >= operator)
  ├── useChannelRole(roomId, userId)      Role efektif + real-time via Postgres Changes
  ├── useChannelSettings(roomId)          15+ konfigurasi channel dari Supabase
  └── useModerationActions({roomId, actorId, actorRole})
        ├── setUserRole()                 Validasi canModerateRole + canPerformAction
        ├── muteUser(targetId, minutes)   Update status → broadcast FORCE_MUTE
        ├── blockPTT/blockChat()          Granular blocking per fitur
        ├── kickUser()                    Broadcast 'kick' via Supabase Realtime
        └── banUser()                     Insert channel_bans + kick
```

---

## II. Alur Koneksi & Realtime

### 2.1 Siklus Subscribe Channel

```
subscribeToChannel(channelNum)
  1. Unsubscribe channel lama (jika ada)
  2. usePTTStore.setState({ activeUsers: [], isConnected: false })
  3. Build roomId = `${BRAND.supabaseRoomPrefix}${channelNum}`
  4. supabase.channel(roomId, { presence: { key: userId } })
  5. .on('presence', 'sync') → update activeUsers (cek stale ref!)
  6. .on('broadcast', 'ptt_state') → update activeTransmitter
  7. .on('broadcast', 'voice_chunk') → useAudioPlayback fallback
  8. .on('broadcast', 'webrtc_signaling') → useWebRTC offer/answer/ice
  9. .on('broadcast', 'FORCE_MUTE') → stop transmit jika targetUserId === myId
  10. .on('broadcast', 'FORCE_KICK') → pindah ke defaultChannel jika targetUserId === myId
  11. .subscribe() → setState({ isConnected: true })
```

### 2.2 TURN Server — Multi-Provider

```
useWebRTC.connect()
  → secureConfig.getSecureConfig()
      → fetch('/functions/v1/turn-credentials', { Authorization: bearerToken })
          → Edge Function validasi auth
          → Pilih provider (TURN_PROVIDER env var):
              MeteredProvider: fetch api.metered.ca/v1/iceServers
              TwilioProvider: POST api.twilio.com/Accounts/.../Tokens
              StaticProvider: return hardcoded STUN + TURN
          → Fallback ke StaticProvider jika provider utama gagal
          → Return { iceServers }
  → new RTCPeerConnection({ iceServers })
```

---

## III. Sistem Moderasi 5 Level

### 3.1 Hirarki Role

| Level | Role | Rank | Cakupan |
|-------|------|------|---------|
| 1 | `noc` | 5 | Global semua channel |
| 2 | `sys_admin` | 4 | Global semua channel |
| 3 | `pjc` | 3 | Channel yang ditugaskan |
| 4 | `operator` | 2 | Channel yang ditugaskan |
| 5 | `guest` | 1 | Akses dasar |

### 3.2 Matriks Kewenangan Kunci

| Aksi | guest | operator | pjc | sys_admin | noc |
|------|:-----:|:--------:|:---:|:---------:|:---:|
| VIEW_ADMIN_PANEL | ❌ | ✅ | ✅ | ✅ | ✅ |
| MANAGE_QUEUE | ❌ | ✅ | ✅ | ✅ | ✅ |
| MUTE_USER | ❌ | ❌ | ✅ | ✅ | ✅ |
| KICK_USER | ❌ | ❌ | ✅ | ✅ | ✅ |
| BAN_USER | ❌ | ❌ | ✅ | ✅ | ✅ |
| MANAGE_SETTINGS | ❌ | ❌ | ✅ | ✅ | ✅ |
| MANAGE_ROLES | ❌ | ❌ | ✅ | ✅ | ✅ |
| MANAGE_CHANNEL | ❌ | ❌ | ❌ | ✅ | ✅ |

### 3.3 Status User

User bisa memiliki salah satu status berikut:
- `active` — normal
- `muted` — tidak bisa PTT dan Chat
- `ptt_blocked` — tidak bisa PTT saja
- `chat_blocked` — tidak bisa Chat saja
- `suspended` — sementara diblokir semua aksi
- `banned` — diblokir permanen dari channel

### 3.4 Alur Mute User

```
PJC tap [Mute 15 menit] di ChannelMemberList
  → useModerationActions.muteUser(targetId, targetRole, 15)
      → canPerformAction(actorRole, 'MUTE_USER') → true
      → canModerateRole(actorRole, targetRole) → true
      → supabase.from('channel_roles').upsert({ status: 'muted', expires_at: +15mnt })
      → logAction('MUTE_USER', targetId, { minutes: 15 })
  → Di target device:
      subscribeToChannel listener 'FORCE_MUTE'
        → usePTTStore.setState({ isTransmitting: false, isMuted: true })
        → toast.error("Anda dibisukan: [alasan]")
        → PTTButton berubah abu-abu, ikon 🔇
```

---

## IV. Channel Settings yang Bisa Dikonfigurasi PJC

| Setting | Default | Deskripsi |
|---------|---------|-----------|
| `allow_guest_ptt` | true | Apakah tamu bisa transmit |
| `allow_guest_chat` | true | Apakah tamu bisa chat |
| `allow_guest_reaction` | true | Apakah tamu bisa reaction |
| `allow_guest_queue` | false | Apakah tamu bisa join karaoke queue |
| `chat_enabled` | true | Aktifkan fitur chat di channel |
| `reaction_enabled` | true | Aktifkan fitur reaction |
| `karaoke_queue_enabled` | true | Aktifkan karaoke queue |
| `ptt_cooldown_seconds` | 2 | Jeda minimal antara transmisi |
| `guest_max_ptt_seconds` | 15 | Durasi maksimal transmisi tamu |
| `member_max_ptt_seconds` | 60 | Durasi maksimal transmisi anggota |
| `slow_mode_seconds` | 0 | Mode lambat chat (0 = nonaktif) |
| `channel_mode` | public | public/private/password/locked/hidden |
| `theme_key` | green-crystal | Tema visual channel |

---

## V. Fitur Sound Design PTT

```
Saat tekan (press):
  → Dual-tone pre-chirp: OscillatorNode 950Hz + 1400Hz, 120ms
  → Static noise pendek (WhiteNoise + GainNode)
  → navigator.vibrate(15)

Saat lepas (release):
  → Squelch tail: WhiteNoise 220ms dengan fade-out
  → Roger beep: OscillatorNode 1380Hz, 180ms
  → navigator.vibrate(10)
```

Semua tone dibuat secara programatik via `AudioContext` — tidak ada file audio eksternal.

---

## VI. Daftar Issue Aktif (Juni 2026)

| ID | Issue | Priority | File |
|----|-------|----------|------|
| ENV-01 | `.env` credential di git history | 🔴 KRITIS | `.env` |
| RLS-01 | RLS policies permisif `USING (true)` | 🔴 KRITIS | `20260608201500_create_moderation_tables.sql` |
| SEC-01 | Auto-PJC via nama "pawon salam" | 🟡 TINGGI | `useChannelRole.ts` |
| SEC-02 | Bootstrap PJC first-join tidak validasi room_id | 🟡 TINGGI | `useChannelRole.ts` |
| CORS-01 | CORS wildcard di TURN Edge Function | 🟡 TINGGI | `turn-credentials/index.ts` |
| FEAT-01 | Migration SQL entertainment masih stub | 🟠 SEDANG | `20260608_nextvwt_entertainment.sql` |
| FEAT-02 | themeCatalog 3 tema vs theme.css 8 tema | 🟠 SEDANG | `features/themes/themeCatalog.ts` |
| FEAT-03 | Chat, Reactions, Karaoke Queue belum diimplementasi | 🟠 SEDANG | `features/` |

---

*Dokumen ini diperbarui setiap ada perubahan arsitektur signifikan.*  
*NextVWT PTT App · CARA_KERJA_LOGIKA_FITUR.md · v4.0 · Juni 2026*
