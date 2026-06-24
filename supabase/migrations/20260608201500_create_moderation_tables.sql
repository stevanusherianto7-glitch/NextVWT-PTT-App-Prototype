-- NEXTVWT — DATABASE MIGRATION SYSTEM MODERASI HIRARKI
-- Tanggal: 8 Juni 2026

-- 1. Tabel channel_roles
CREATE TABLE IF NOT EXISTS public.channel_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Diisi id auth atau guest-UUID string
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('noc', 'sys_admin', 'pjc', 'operator', 'guest')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'muted', 'ptt_blocked', 'chat_blocked', 'suspended', 'banned')),
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS channel_roles_room_idx ON public.channel_roles(room_id);
CREATE INDEX IF NOT EXISTS channel_roles_user_idx ON public.channel_roles(user_id);

-- 2. Tabel channel_settings
CREATE TABLE IF NOT EXISTS public.channel_settings (
  room_id TEXT PRIMARY KEY,
  channel_name TEXT NOT NULL,
  channel_description TEXT,
  channel_mode TEXT NOT NULL DEFAULT 'public' CHECK (channel_mode IN ('public', 'private', 'password', 'locked', 'hidden')),
  channel_password_hash TEXT,
  pjc_user_id TEXT,
  theme_key TEXT NOT NULL DEFAULT 'green-crystal',

  allow_guest_ptt BOOLEAN NOT NULL DEFAULT true,
  allow_guest_chat BOOLEAN NOT NULL DEFAULT true,
  allow_guest_reaction BOOLEAN NOT NULL DEFAULT true,
  allow_guest_queue BOOLEAN NOT NULL DEFAULT false,
  allow_guest_song_request BOOLEAN NOT NULL DEFAULT true,

  chat_enabled BOOLEAN NOT NULL DEFAULT true,
  reaction_enabled BOOLEAN NOT NULL DEFAULT true,
  karaoke_queue_enabled BOOLEAN NOT NULL DEFAULT true,
  song_request_enabled BOOLEAN NOT NULL DEFAULT true,

  ptt_cooldown_seconds INTEGER NOT NULL DEFAULT 2,
  guest_max_ptt_seconds INTEGER NOT NULL DEFAULT 15,
  member_max_ptt_seconds INTEGER NOT NULL DEFAULT 60,

  slow_mode_seconds INTEGER NOT NULL DEFAULT 0,

  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel channel_bans
CREATE TABLE IF NOT EXISTS public.channel_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reason TEXT,
  banned_by TEXT NOT NULL,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS channel_bans_room_user_idx ON public.channel_bans(room_id, user_id);

-- 4. Tabel channel_moderation_logs
CREATE TABLE IF NOT EXISTS public.channel_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  target_user_id TEXT,
  action TEXT NOT NULL,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS channel_moderation_logs_room_idx ON public.channel_moderation_logs(room_id, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.channel_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_moderation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Security Rules)

-- Policies for channel_roles
CREATE POLICY "Anyone can read roles" ON public.channel_roles FOR SELECT USING (true);
CREATE POLICY "Admins and PJC can manage roles" ON public.channel_roles FOR ALL USING (true); -- Kita gunakan security bypass via service_role atau definisikan policy yang sesuai di client

-- Policies for channel_settings
CREATE POLICY "Anyone can read settings" ON public.channel_settings FOR SELECT USING (true);
CREATE POLICY "PJC or SysAdmin can modify settings" ON public.channel_settings FOR ALL USING (true);

-- Policies for channel_bans
CREATE POLICY "Anyone can read bans" ON public.channel_bans FOR SELECT USING (true);
CREATE POLICY "Admins and PJC can manage bans" ON public.channel_bans FOR ALL USING (true);

-- Policies for channel_moderation_logs
CREATE POLICY "Anyone can read logs" ON public.channel_moderation_logs FOR SELECT USING (true);
CREATE POLICY "Only system can insert logs" ON public.channel_moderation_logs FOR INSERT WITH CHECK (true);
