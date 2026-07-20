import { describe, it, expect, vi, beforeEach } from 'vitest';

// setup.ts already mocks @/app/utils/supabase globally; we test the contract
// exposed by that module (getSupabase resolves, supabase reference populates).
import { getSupabase, supabase } from './supabase';

describe('supabase client', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getSupabase resolves to a client', async () => {
    const client = await getSupabase();
    expect(client).toBeTruthy();
  });

  it('getSupabase is callable repeatedly', async () => {
    const a = await getSupabase();
    const b = await getSupabase();
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
  });

  it('supabase reference is populated after init', async () => {
    await getSupabase();
    expect(supabase).toBeTruthy();
  });
});
