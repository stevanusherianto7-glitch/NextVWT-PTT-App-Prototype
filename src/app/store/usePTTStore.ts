import { create } from 'zustand';
import { PTTState, WebRTCSignalingPayload } from './types';
import { getSupabase } from '../utils/supabase';
import { checkIfNewUser } from '../utils/constants';
export type { AppUser, ChannelItem, WebRTCSignalingPayload, GuestUser, PTTState } from './types';
import { BRAND } from '../utils/config';

import {
  safeGetStorage,
  safeSetStorage,
  generateUUID,
  getChannelUUID,
  generateRandomCallSign,
  PERSISTED_KEYS,
  pickPersistedState,
} from './storeUtils';

export {
  safeGetStorage,
  safeSetStorage,
  generateUUID,
  getChannelUUID,
  generateRandomCallSign,
  PERSISTED_KEYS,
  pickPersistedState,
};

interface PresenceMeta {
  userId?: string;
  displayName?: string;
  callSign?: string;
  location?: string;
  avatarUrl?: string;
  createdAt?: string;
}

interface PttStatePayload {
  userId: string;
  displayName: string;
  callSign: string;
  isTransmitting: boolean;
  isNewUser?: boolean;
}

import { activeChannelSubscription, setActiveChannelSubscription } from './subscription';
// ─── Supabase Channel Subscription ───────────────────────────────────────────

function subscribeToChannel(channelNum: number, retryCount = 0) {
  (async () => {
    try {
      if (activeChannelSubscription) {
        activeChannelSubscription.unsubscribe();
        setActiveChannelSubscription(null);
      }

      // Clear active users list immediately on channel change to prevent showing stale users
      usePTTStore.setState({ activeUsers: [] });

      // Optimistic connection state for smooth fallback and instant UX
      usePTTStore.setState({ isConnected: true });

      const store = usePTTStore.getState();
      const supabase = await getSupabase();
      const channelInstance = supabase.channel(`${BRAND.supabaseRoomPrefix}${channelNum}`, {
        config: {
          presence: {
            key: store.userId || 'anonymous',
          },
        },
      });
      setActiveChannelSubscription(channelInstance);

      channelInstance
        .on('presence', { event: 'sync' }, () => {
          if (activeChannelSubscription !== channelInstance) return;
          const presenceState = channelInstance.presenceState();
          const rawList = Object.values(presenceState).flat() as unknown as PresenceMeta[];

          // Deduplicate by userId to ensure each active user only has one entry in the list
          const uniqueUsersMap = new Map<string, any>();
          rawList.forEach((p) => {
            if (p && typeof p === 'object' && p.userId) {
              uniqueUsersMap.set(p.userId, {
                userId: p.userId,
                displayName: p.displayName || 'Anonim',
                callSign: p.callSign || '2DYUA',
                location: p.location || 'BANDUNG, JABAR',
                avatarUrl: p.avatarUrl || '',
                isNewUser: checkIfNewUser(p.createdAt),
              });
            }
          });
          const users = Array.from(uniqueUsersMap.values());
          usePTTStore.setState({ activeUsers: users });
        })
        .on('broadcast', { event: 'ptt_state' }, ({ payload }: { payload: PttStatePayload }) => {
          if (activeChannelSubscription !== channelInstance) return;
          if (payload.isTransmitting) {
            usePTTStore.setState({
              activeTransmitter: {
                userId: payload.userId,
                displayName: payload.displayName,
                callSign: payload.callSign,
                isNewUser: payload.isNewUser,
              },
            });
          } else {
            const currentTx = usePTTStore.getState().activeTransmitter;
            if (currentTx && currentTx.userId === payload.userId) {
              usePTTStore.setState({ activeTransmitter: null });
            }
          }
        })
        .on(
          'broadcast',
          { event: 'voice_chunk' },
          ({ payload }: { payload: { userId: string; base64: string } }) => {
            if (activeChannelSubscription !== channelInstance) return;
            const state = usePTTStore.getState();
            // Ignore our own broadcasted voice chunks to avoid feedback loop
            if (payload.userId !== state.userId && state.onVoiceChunkReceived) {
              state.onVoiceChunkReceived(payload.base64);
            }
          }
        )
        .on(
          'broadcast',
          { event: 'webrtc_signaling' },
          ({ payload }: { payload: WebRTCSignalingPayload }) => {
            if (activeChannelSubscription !== channelInstance) return;
            const state = usePTTStore.getState();
            if (payload.senderUserId !== state.userId && state.onWebRTCSignalingReceived) {
              state.onWebRTCSignalingReceived(payload);
            }
          }
        )
        .on(
          'broadcast',
          { event: 'hang_up' },
          ({ payload }: { payload: { targetUserId: string; moderatorName?: string } }) => {
            if (activeChannelSubscription !== channelInstance) return;
            const state = usePTTStore.getState();

            // If we are the target and currently transmitting, force-stop our transmission
            if (payload.targetUserId === state.userId && state.isTransmitting) {
              console.warn(`[Hang Up] Transmission interrupted by moderator${payload.moderatorName ? ` (${payload.moderatorName})` : ''}`);
              usePTTStore.setState({ isTransmitting: false, progress: 0 });
            }

            // If the target matches the current active transmitter, clear it for all listeners
            const currentTx = state.activeTransmitter;
            if (currentTx && currentTx.userId === payload.targetUserId) {
              usePTTStore.setState({ activeTransmitter: null, progress: 0 });
            }
          }
        );

      channelInstance.subscribe((status: string) => {
        if (activeChannelSubscription !== channelInstance) return;
        const isSubscribed = status === 'SUBSCRIBED';
        if (isSubscribed) {
          usePTTStore.setState({ isConnected: true });
        }

        if (status === 'CHANNEL_ERROR' && retryCount < 3) {
          const timeout = Math.pow(2, retryCount) * 1000;
          console.warn(
            `[Supabase] Channel error. Retrying in ${timeout}ms (attempt ${retryCount + 1})...`
          );
          setTimeout(() => subscribeToChannel(channelNum, retryCount + 1), timeout);
          return;
        }

        if (isSubscribed) {
          const currentStore = usePTTStore.getState();
          const userMeta = currentStore.user;
          const displayName = currentStore.infoText || userMeta?.user_metadata?.full_name || 'Pebe Herianto';
          const location = currentStore.locationText;

          // Only track presence if the channel is actually subscribed on the backend
          if (status === 'SUBSCRIBED') {
            const avatarUrl =
              currentStore.profilePhotoOption === 'google'
                ? userMeta?.user_metadata?.avatar_url || ''
                : currentStore.customPhotoUrl;

            channelInstance.track({
              userId: currentStore.userId,
              displayName: displayName,
              callSign: currentStore.callSign || '2DYUA',
              location: location,
              avatarUrl: avatarUrl,
              createdAt: userMeta?.created_at,
            });
          }
        }
      });
    } catch (err) {
      console.error('Supabase room connection error:', err);
      // Graceful Degradation: keep optimistic connection for smooth fallback
      usePTTStore.setState({
        isConnected: true,
        error: 'Connection failed — operating in offline mode',
      });
    }
  })();
}

import { createAuthSlice } from './slices/createAuthSlice';
import { createUISlice } from './slices/createUISlice';
import { createChannelSlice } from './slices/createChannelSlice';
import { createSettingsSlice } from './slices/createSettingsSlice';
import { createWebRTCSlice } from './slices/createWebRTCSlice';

// ─── Store ────────────────────────────────────────────────────────────────────
export const usePTTStore = create<PTTState>()((set, get, store) => ({
  ...createAuthSlice(set, get, store),
  ...createUISlice(set, get, store),
  ...createChannelSlice(set, get, store),
  ...createSettingsSlice(set, get, store),
  ...createWebRTCSlice(set, get, store),

  subscribeToChannel: (channelNum: number) => {
    subscribeToChannel(channelNum, 0);
  },
}));
