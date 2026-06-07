import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSecureConfig } from './secureConfig';

const defaultUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const defaultKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder';

export let supabase: SupabaseClient = createClient(defaultUrl, defaultKey);

export async function initializeSecureSupabase(): Promise<void> {
  const config = await getSecureConfig();
  if (config.supabaseUrl && config.supabaseKey) {
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }
}
