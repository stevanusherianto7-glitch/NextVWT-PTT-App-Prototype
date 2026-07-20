import { useEffect, useState } from 'react';
import { usePTTStore } from '../store/usePTTStore';
import { toast } from 'sonner';
import { getSupabase } from '../utils/supabase';

/**
 * Handles channel-level moderation concerns:
 *  - the moderator "kick" realtime broadcast
 *  - the local ban check on join
 *  - the "wait" status countdown that flips the user back to "active"
 *
 * Extracted from the former useRadioOrchestrator to separate moderation
 * plumbing from audio and reaction logic.
 */
export function useRadioModeration(
  roomId: string,
  userId: string,
  isPowerOn: boolean,
  status: string
) {
  const setIsPowerOn = usePTTStore((state) => state.setPower);
  const [waitTimer, setWaitTimer] = useState<number | null>(null);

  // Countdown for "wait" status → auto flip to active after 30s.
  useEffect(() => {
    if (status === 'wait') {
      if (waitTimer === null) setWaitTimer(30);
    } else {
      setWaitTimer(null);
    }
  }, [status, waitTimer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (waitTimer !== null && waitTimer > 0) {
      interval = setInterval(() => {
        setWaitTimer((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (waitTimer === 0) {
      localStorage.setItem(`channel-status:${roomId}:${userId}`, 'active');
      window.dispatchEvent(new Event('channel-role-changed'));
      setWaitTimer(null);
    }
    return () => clearInterval(interval);
  }, [waitTimer, roomId, userId]);

  // Moderator kick broadcast.
  useEffect(() => {
    if (!roomId || !userId || !isPowerOn) return;

    let mounted = true;
    let channelInstance: import('@supabase/supabase-js').RealtimeChannel | null = null;

    (async () => {
      try {
        const supabaseInstance = await getSupabase();
        if (!mounted) return;

        channelInstance = supabaseInstance.channel(`room:${roomId}:moderation`);
        channelInstance
          .on(
            'broadcast',
            { event: 'kick' },
            (payload: { payload?: { targetUserId?: string } }) => {
              const { targetUserId } = payload.payload || {};
              if (targetUserId === userId) {
                toast.error('Anda telah dikeluarkan (kick/ban) dari channel ini oleh moderator.');
                setIsPowerOn(false);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Realtime kick listener setup failed:', err);
      }
    })();

    return () => {
      mounted = false;
      if (channelInstance) {
        getSupabase().then((sub) => {
          if (channelInstance) sub.removeChannel(channelInstance);
        });
      }
    };
  }, [roomId, userId, isPowerOn, setIsPowerOn]);

  // Ban check on join.
  useEffect(() => {
    if (!roomId || !userId || !isPowerOn) return;

    let mounted = true;

    async function checkBan() {
      try {
        const supabaseInstance = await getSupabase();
        if (!mounted) return;

        const { data, error } = await supabaseInstance
          .from('channel_bans')
          .select('id')
          .eq('room_id', roomId)
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error checking ban list:', error);
          return;
        }

        if (!mounted) return;

        if (data) {
          toast.error('Anda tidak dapat memasuki channel ini karena Anda telah diblokir (banned).');
          setIsPowerOn(false);
        }
      } catch (err) {
        console.error('Ban check failed:', err);
      }
    }

    checkBan();

    return () => {
      mounted = false;
    };
  }, [roomId, userId, isPowerOn, setIsPowerOn]);

  return { waitTimer };
}
