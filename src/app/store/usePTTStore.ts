import { create } from 'zustand';
import { PTTState, WebRTCSignalingPayload } from './types';
import { getSupabase } from '../utils/supabase';
export type { AppUser, ChannelItem, WebRTCSignalingPayload, GuestUser, PTTState } from './types';
import { BRAND } from '../utils/config';

const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const isDummyKey =
  !supabaseKey ||
  supabaseKey === 'your-supabase-key' ||
  supabaseKey === 'placeholder' ||
  supabaseKey.includes('placeholder') ||
  supabaseKey.includes('your-') ||
  supabaseKey.length < 20;

// ─── Local Storage Key ────────────────────────────────────────────────────────
const LS_KEY = 'nextvwt_settings';

// Robust localStorage read – returns null on parse errors or security exceptions
export function safeGetStorage(): Partial<PTTState> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PTTState>;
  } catch {
    return null;
  }
}

// Robust localStorage write – silent on quota/security errors
export function safeSetStorage(partial: Partial<PTTState>): void {
  try {
    const existing = safeGetStorage() ?? {};
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...partial }));
  } catch {
    // Quota exceeded or private-browsing blocked – fail silently per Robustness Rule
  }
}

// ─── UUID Utilities ───────────────────────────────────────────────────────────
// Robust RFC4122 v4 UUID generator with fallback
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Map channel integers deterministically to syntactically valid UUID v4 format
export function getChannelUUID(channelNum: number): string {
  const padded = channelNum.toString().padStart(12, '0');
  return `00000000-0000-4000-8000-${padded}`;
}

// Generate random 5-character alphanumeric uppercase call sign
export function generateRandomCallSign(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ─── Persisted Settings Keys ──────────────────────────────────────────────────
// Only these keys are persisted to localStorage (volatile runtime state is excluded)
export const PERSISTED_KEYS: Array<keyof PTTState> = [
  'infoText',
  'locationText',
  'channelNumber',
  'callSign',
  'showMyPhoto',
  'showOtherPhotos',
  'showPhotosInList',
  'fastClick',
  'showModulator',
  'showPTT',
  'maxQueue',
  'audioMode',
  'pttSize',
  'pttBottom',
  'togglePtt',
  'pttVolume',
  'vibrateOnStart',
  'toneOnStartEnd',
  'bgActive',
  'fullDuplex',
  'themeText',
  'builtInEcho',
  'isKaraokePlayerOpen',
  'echoFeedback',
  'profilePhotoOption',
  'customPhotoUrl',
];

export function pickPersistedState(state: Partial<PTTState>): Partial<PTTState> {
  const result: Partial<PTTState> = {};
  for (const key of PERSISTED_KEYS) {
    if (key in state) {
      // @ts-expect-error dynamic key access
      result[key] = state[key];
    }
  }
  return result;
}

interface PresenceMeta {
  userId?: string;
  displayName?: string;
  callSign?: string;
  location?: string;
  avatarUrl?: string;
}

interface PttStatePayload {
  userId: string;
  displayName: string;
  callSign: string;
  isTransmitting: boolean;
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
          const users = rawList
            .filter((p) => p && typeof p === 'object')
            .map((p) => ({
              userId: p.userId || 'unknown',
              displayName: p.displayName || 'Anonim',
              callSign: p.callSign || '2DYUA',
              location: p.location || 'BANDUNG, JABAR',
              avatarUrl: p.avatarUrl || '',
            }));
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
        );

      channelInstance.subscribe((status: string) => {
        if (activeChannelSubscription !== channelInstance) return;
        const isSubscribed = isDummyKey ? true : status === 'SUBSCRIBED';
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
          const displayName = currentStore.infoText || userMeta?.user_metadata?.full_name;
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
            });
          }
        }
      });
    } catch (err) {
      console.error('Supabase room connection error:', err);
      // Graceful Degradation: mark offline but don't crash
      usePTTStore.setState({
        isConnected: false,
        error: 'Connection failed – operating in offline mode',
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
