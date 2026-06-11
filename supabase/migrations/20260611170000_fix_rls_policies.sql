-- ============================================================
-- NEXTVWT — SECURITY MIGRATION: Fix RLS Policies
-- Tanggal: 11 Juni 2026
-- Severity: CRITICAL (F-01 dari Audit Report)
--
-- MASALAH LAMA: Semua policy pakai USING (true) sehingga
-- siapapun bisa INSERT/UPDATE/DELETE roles, bans, settings.
--
-- FIX: Policy sekarang memeriksa auth.uid() dan role aktif
-- dari channel_roles sebelum mengizinkan operasi write.
-- ============================================================

-- ─── 1. Helper function untuk cek role user di channel ─────────────────────
-- Menggunakan SECURITY DEFINER agar bisa query channel_roles tanpa RLS loop
CREATE OR REPLACE FUNCTION public.get_user_channel_role(p_room_id TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.channel_roles
  WHERE room_id = p_room_id
    AND user_id = auth.uid()::text
  LIMIT 1;
$$;

-- ─── 2. Fix channel_roles policies ─────────────────────────────────────────

-- Hapus policy lama yang terlalu permisif
DROP POLICY IF EXISTS "Admins and PJC can manage roles" ON public.channel_roles;

-- Buat policy baru: hanya moderator yang bisa write roles
CREATE POLICY "Moderators can manage roles"
  ON public.channel_roles
  FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND public.get_user_channel_role(room_id) IN ('noc', 'sys_admin', 'pjc')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.get_user_channel_role(room_id) IN ('noc', 'sys_admin', 'pjc')
  );

-- Policy read tetap terbuka (presence sync membutuhkan ini)
-- Policy "Anyone can read roles" dipertahankan

-- ─── 3. Fix channel_settings policies ──────────────────────────────────────

DROP POLICY IF EXISTS "PJC or SysAdmin can modify settings" ON public.channel_settings;

-- Settings: hanya NOC, sys_admin, dan PJC yang bisa mengubah
CREATE POLICY "Moderators can modify settings"
  ON public.channel_settings
  FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND public.get_user_channel_role(room_id) IN ('noc', 'sys_admin', 'pjc')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.get_user_channel_role(room_id) IN ('noc', 'sys_admin', 'pjc')
  );

-- ─── 4. Fix channel_bans policies ──────────────────────────────────────────

DROP POLICY IF EXISTS "Admins and PJC can manage bans" ON public.channel_bans;

-- Bans: hanya moderator yang bisa ban
CREATE POLICY "Moderators can manage bans"
  ON public.channel_bans
  FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND public.get_user_channel_role(room_id) IN ('noc', 'sys_admin', 'pjc')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.get_user_channel_role(room_id) IN ('noc', 'sys_admin', 'pjc')
  );

-- ─── 5. Fix channel_moderation_logs policies ────────────────────────────────

DROP POLICY IF EXISTS "Only system can insert logs" ON public.channel_moderation_logs;

-- Logs: moderator bisa insert log aksi mereka
CREATE POLICY "Moderators can insert logs"
  ON public.channel_moderation_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.get_user_channel_role(room_id) IN ('noc', 'sys_admin', 'pjc', 'operator')
  );

-- ─── 6. Proteksi user_profiles_extended ─────────────────────────────────────
-- Pastikan user hanya bisa update profil mereka sendiri
DO $$
BEGIN
  -- Drop existing policies jika ada (idempotent)
  DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles_extended;
  DROP POLICY IF EXISTS "Users can read all profiles" ON public.user_profiles_extended;

  -- Re-create dengan benar
  CREATE POLICY "Users can read all profiles"
    ON public.user_profiles_extended
    FOR SELECT
    USING (true);

  CREATE POLICY "Users can update own profile"
    ON public.user_profiles_extended
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "Users can insert own profile"
    ON public.user_profiles_extended
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

EXCEPTION WHEN undefined_table THEN
  -- user_profiles_extended mungkin belum ada, skip
  RAISE NOTICE 'Table user_profiles_extended not found, skipping policies';
END $$;
