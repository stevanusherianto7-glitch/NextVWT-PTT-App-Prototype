import { useEffect, useState } from 'react';
import { getSupabase } from '../../app/utils/supabase';
import type { ChannelRole } from './permissions';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { CHANNELS, BRAND } from '../../app/utils/config';

export function useChannelRole(roomId: string, userId: string) {
  const [role, setRole] = useState<ChannelRole>('guest');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !userId) {
      setRole('guest');
      setStatus('active');
      setLoading(false);
      return;
    }

    let mounted = true;
    let channel: RealtimeChannel | null = null;

    async function loadAndSubscribe() {
      try {
        setLoading(true);
        const supabaseInstance = await getSupabase();

        if (!mounted) return;

        // Load current role
        const { data: initialData, error } = await supabaseInstance
          .from('channel_roles')
          .select('role, status')
          .eq('room_id', roomId)
          .eq('user_id', userId)
          .maybeSingle();

        let data = initialData;

        if (error) {
          console.error('Error fetching channel role:', error);
        }

        // Bootstrap: Jika belum ada role apa pun di room ini, angkat user pertama yang masuk sebagai PJC
        if (!data) {
          // Validasi room_id adalah channel yang terdaftar
          const prefix = BRAND.supabaseRoomPrefix || 'ptt-room-';
          if (roomId.startsWith(prefix)) {
            const chNumStr = roomId.substring(prefix.length);
            const chNum = parseInt(chNumStr, 10);
            const channelExists = CHANNELS.some((ch) => ch.number === chNum);

            if (channelExists) {
              const { count, error: countError } = await supabaseInstance
                .from('channel_roles')
                .select('id', { count: 'exact', head: true })
                .eq('room_id', roomId);

              if (!countError && count === 0) {
                const defaultRole = {
                  room_id: roomId,
                  user_id: userId,
                  role: 'pjc' as ChannelRole,
                  status: 'active',
                  assigned_by: 'system',
                  assigned_at: new Date().toISOString(),
                };

                const { data: inserted } = await supabaseInstance
                  .from('channel_roles')
                  .insert(defaultRole)
                  .select('role, status')
                  .maybeSingle();

                if (inserted) {
                  data = inserted;
                }
              }
            } else {
              console.warn(`[Bootstrap PJC] Room ${roomId} is not a valid registered channel number.`);
            }
          }
        }

        if (!mounted) return;

        setRole((data?.role as ChannelRole) || 'guest');
        setStatus(data?.status || 'active');
        setLoading(false);

        // Setup realtime subscription
        channel = supabaseInstance
          .channel(`channel-role:${roomId}:${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'channel_roles',
              filter: `room_id=eq.${roomId}`,
            },
            async (payload) => {
              const newRecord = payload.new as {
                user_id?: string;
                role?: string;
                status?: string;
              } | null;
              const oldRecord = payload.old as { user_id?: string } | null;

              if (newRecord && newRecord.user_id === userId) {
                if (mounted) {
                  setRole((newRecord.role as ChannelRole) || 'guest');
                  setStatus(newRecord.status || 'active');
                }
              } else if (
                payload.eventType === 'DELETE' &&
                oldRecord &&
                oldRecord.user_id === userId
              ) {
                if (mounted) {
                  setRole('guest');
                  setStatus('active');
                }
              } else {
                // If it affects this user or we need to be sure, do a quick refetch
                const { data: refetch } = await supabaseInstance
                  .from('channel_roles')
                  .select('role, status')
                  .eq('room_id', roomId)
                  .eq('user_id', userId)
                  .maybeSingle();
                if (mounted) {
                  setRole((refetch?.role as ChannelRole) || 'guest');
                  setStatus(refetch?.status || 'active');
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error loading or subscribing to channel role:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAndSubscribe();

    return () => {
      mounted = false;
      if (channel) {
        getSupabase().then((sub) => {
          sub.removeChannel(channel!);
        });
      }
    };
  }, [roomId, userId]);

  return {
    role,
    status,
    loading,
  };
}
