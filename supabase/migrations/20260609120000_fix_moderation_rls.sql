-- NEXTVWT — DATABASE MIGRATION SYSTEM MODERASI SEC-03
-- Tanggal: 10 Juni 2026
-- Mengamankan tabel moderasi agar penulisan hanya dapat dilakukan oleh service_role

-- 1. Tabel channel_roles
DROP POLICY IF EXISTS "Admins and PJC can manage roles" ON public.channel_roles;

CREATE POLICY "Roles insert service role only" ON public.channel_roles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Roles update service role only" ON public.channel_roles
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Roles delete service role only" ON public.channel_roles
  FOR DELETE USING (auth.role() = 'service_role');

-- 2. Tabel channel_settings
DROP POLICY IF EXISTS "PJC or SysAdmin can modify settings" ON public.channel_settings;

CREATE POLICY "Settings insert service role only" ON public.channel_settings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Settings update service role only" ON public.channel_settings
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Settings delete service role only" ON public.channel_settings
  FOR DELETE USING (auth.role() = 'service_role');

-- 3. Tabel channel_bans
DROP POLICY IF EXISTS "Admins and PJC can manage bans" ON public.channel_bans;

CREATE POLICY "Bans insert service role only" ON public.channel_bans
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Bans update service role only" ON public.channel_bans
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Bans delete service role only" ON public.channel_bans
  FOR DELETE USING (auth.role() = 'service_role');

-- 4. Tabel channel_moderation_logs
DROP POLICY IF EXISTS "Only system can insert logs" ON public.channel_moderation_logs;

CREATE POLICY "Logs insert service role only" ON public.channel_moderation_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
