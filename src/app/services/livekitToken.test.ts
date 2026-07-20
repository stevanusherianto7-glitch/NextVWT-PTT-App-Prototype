/**
 * src/app/services/livekitToken.test.ts
 * Unit tests untuk fetchLiveKitToken (client-side helper).
 *
 * Verifikasi:
 *  1. Memanggil Edge Function `livekit-token` dengan body { channel }.
 *  2. Mengembalikan { token, room, identity } saat response valid.
 *  3. Melempar error bila `functions.invoke` mengembalikan error.
 *  4. Melempar error bila response tidak memiliki token/room.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock('../utils/supabase', () => {
  const mockSupabase = {
    functions: { invoke: mockInvoke },
  };
  return {
    getSupabase: vi.fn(() => Promise.resolve(mockSupabase)),
  };
});

import { fetchLiveKitToken } from './livekitToken';

describe('fetchLiveKitToken', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('memanggil livekit-token dengan channel yang benar', async () => {
    mockInvoke.mockResolvedValue({
      data: { token: 'jwt-abc', room: 'ptt-room-7', identity: 'user-123' },
      error: null,
    });

    const result = await fetchLiveKitToken(7);

    expect(mockInvoke).toHaveBeenCalledWith('livekit-token', { body: { channel: 7 } });
    expect(result.token).toBe('jwt-abc');
    expect(result.room).toBe('ptt-room-7');
    expect(result.identity).toBe('user-123');
  });

  it('melempar error bila functions.invoke mengembalikan error', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Unauthorized' },
    });

    await expect(fetchLiveKitToken(1)).rejects.toThrow(/Gagal mint token LiveKit/);
  });

  it('melempar error bila response tidak punya token', async () => {
    mockInvoke.mockResolvedValue({
      data: { room: 'ptt-room-1' },
      error: null,
    });

    await expect(fetchLiveKitToken(1)).rejects.toThrow(/tidak valid/);
  });
});
