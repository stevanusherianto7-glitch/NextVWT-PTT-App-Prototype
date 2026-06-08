import { useEffect, useState } from 'react';
import { getSupabase } from '../../app/utils/supabase';
import type { ChannelRole } from './permissions';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { usePTTStore } from '../../app/store/usePTTStore';

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

        // Auto-assign PJC role jika display name user adalah "pawon salam"
        const storeState = usePTTStore.getState();
        const currentName = storeState.infoText || storeState.user?.user_metadata?.full_name || '';
        const isPawonSalam = currentName.trim().toLowerCase() === 'pawon salam';

        if (isPawonSalam) {
          if (!data || data.role !== 'pjc') {
            const pjcRole = {
              room_id: roomId,
              user_id: userId,
              role: 'pjc' as ChannelRole,
              status: 'active',
              assigned_by: 'system_pjc_auto',
              assigned_at: new Date().toISOString(),
            };

            const { data: upserted, error: upsertError } = await supabaseInstance
              .from('channel_roles')
              .upsert(pjcRole, { onConflict: 'room_id,user_id' })
              .select('role, status')
              .maybeSingle();

            if (!upsertError && upserted) {
              data = upserted;
            } else if (upsertError) {
              console.error('Failed to auto-assign PJC role for pawon salam:', upsertError);
            }
          }
        }

        // Bootstrap: Jika belum ada role apa pun di room ini, angkat user pertama yang masuk sebagai PJC
        if (!data) {
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
