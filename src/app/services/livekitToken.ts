import { getSupabase } from '../utils/supabase';

export interface LiveKitTokenResult {
  token: string;
  room: string;
  identity: string;
}

/**
 * Minta LiveKit access token dari Supabase Edge Function (server-side mint).
 *
 * Token TIDAK di-generate di client — `LIVEKIT_API_SECRET` hanya ada di server.
 * Identity diambil dari user terautentikasi; jangan terima identity arbitrer
 * dari client (bisa spoof). Lihat PRD §7.2 AD-1.
 *
 * @param channel nomor channel (akan jadi room `ptt-room-{channel}`)
 */
export async function fetchLiveKitToken(channel: number): Promise<LiveKitTokenResult> {
  const supabase = await getSupabase();

  const { data, error } = await supabase.functions.invoke('livekit-token', {
    body: { channel },
  });

  if (error) {
    throw new Error(`Gagal mint token LiveKit: ${error.message}`);
  }

  const result = data as Partial<LiveKitTokenResult> | null;
  if (!result || !result.token || !result.room) {
    throw new Error('Response token LiveKit tidak valid');
  }

  return result as LiveKitTokenResult;
}
