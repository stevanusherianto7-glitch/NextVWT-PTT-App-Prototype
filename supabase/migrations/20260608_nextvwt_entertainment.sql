-- NEXTVWT ENTERTAINMENT CORE TABLES
-- Tanggal: 8 Juni 2026

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

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  actor_id text not null,
  action text not null,
  target_user_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.channel_members enable row level security;
alter table public.channel_messages enable row level security;
alter table public.karaoke_queue enable row level security;
alter table public.song_requests enable row level security;
alter table public.song_request_votes enable row level security;
alter table public.channel_themes enable row level security;
alter table public.channel_feature_flags enable row level security;
alter table public.user_profiles_extended enable row level security;
alter table public.user_badges enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Setup RLS Policies
-- Permissive read/write policies for development & prototype mode
create policy "Anyone can read channel members" on public.channel_members for select using (true);
create policy "Anyone can insert/update channel members" on public.channel_members for all using (true);

create policy "Anyone can read channel messages" on public.channel_messages for select using (true);
create policy "Anyone can insert channel messages" on public.channel_messages for insert with check (true);

create policy "Anyone can read karaoke queue" on public.karaoke_queue for select using (true);
create policy "Anyone can manage karaoke queue" on public.karaoke_queue for all using (true);

create policy "Anyone can read song requests" on public.song_requests for select using (true);
create policy "Anyone can manage song requests" on public.song_requests for all using (true);

create policy "Anyone can read votes" on public.song_request_votes for select using (true);
create policy "Anyone can vote" on public.song_request_votes for insert with check (true);

create policy "Anyone can read channel themes" on public.channel_themes for select using (true);
create policy "Anyone can manage channel themes" on public.channel_themes for all using (true);

create policy "Anyone can read feature flags" on public.channel_feature_flags for select using (true);
create policy "Anyone can manage feature flags" on public.channel_feature_flags for all using (true);

create policy "Anyone can read extended profiles" on public.user_profiles_extended for select using (true);
create policy "Anyone can manage extended profiles" on public.user_profiles_extended for all using (true);

create policy "Anyone can read badges" on public.user_badges for select using (true);
create policy "Anyone can manage badges" on public.user_badges for all using (true);

create policy "Anyone can read audit logs" on public.admin_audit_logs for select using (true);
create policy "Only system can insert audit logs" on public.admin_audit_logs for insert with check (true);
