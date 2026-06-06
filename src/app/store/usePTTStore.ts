import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { User, RealtimeChannel } from '@supabase/supabase-js';
import { BRAND } from '../utils/config';

const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const isDummyKey =
  !supabaseKey ||
  supabaseKey.startsWith('sb_publishable_') ||
  supabaseKey.includes('placeholder') ||
  supabaseKey === '';

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

// ─── State Interface ──────────────────────────────────────────────────────────
export interface PTTState {
  isPowerOn: boolean;
  isConnected: boolean;
  isTransmitting: boolean;
  isScanning: boolean;
  progress: number;
  channelNumber: number;
  channelId: string; // UUID v4 format
  userId: string; // UUID v4 format
  error: string | null;

  // Auth State
  user: User | null;
  activeTransmitter: { userId: string; displayName: string; callSign: string } | null;
  activeUsers: Array<{
    userId: string;
    displayName: string;
    callSign: string;
    location: string;
    avatarUrl?: string;
  }>;

  // Settings State
  infoText: string;
  locationText: string;
  showMyPhoto: boolean;
  showOtherPhotos: boolean;
  showPhotosInList: boolean;
  fastClick: boolean;
  showModulator: boolean;
  showPTT: boolean;
  maxQueue: string;
  audioMode: 'discussion' | 'music';
  pttSize: number;
  pttBottom: number;
  togglePtt: boolean;
  pttVolume: number;
  vibrateOnStart: boolean;
  toneOnStartEnd: boolean;
  bgActive: boolean;
  fullDuplex: boolean;
  themeText: string;
  builtInEcho: boolean;
  isKaraokePlayerOpen: boolean;
  echoFeedback: number;
  profilePhotoOption: 'google' | 'custom';
  customPhotoUrl: string;

  // Actions
  setPower: (power: boolean) => void;
  setConnected: (connected: boolean) => void;
  setTransmitting: (transmitting: boolean) => void;
  setScanning: (scanning: boolean) => void;
  setProgress: (progress: number) => void;
  setChannelNumber: (numOrFn: number | ((prev: number) => number)) => void;
  setError: (err: string | null) => void;
  initializeSession: () => void;
  updateSettings: (settings: Partial<PTTState>) => void;
  setUser: (user: User | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setKaraokePlayerOpen: (open: boolean) => void;

  // Control actions
  channelUp: () => void;
  channelDown: () => void;
  toggleScan: () => void;

  // Audio actions
  onVoiceChunkReceived: ((base64Chunk: string) => void) | null;
  setOnVoiceChunkReceived: (callback: ((base64Chunk: string) => void) | null) => void;
  broadcastVoiceChunk: (base64Chunk: string) => void;

  // WebRTC signaling actions
  onWebRTCSignalingReceived: ((payload: any) => void) | null;
  setOnWebRTCSignalingReceived: (callback: ((payload: any) => void) | null) => void;
  broadcastWebRTCSignaling: (payload: any) => void;
}

// ─── Persisted Settings Keys ──────────────────────────────────────────────────
// Only these keys are persisted to localStorage (volatile runtime state is excluded)
const PERSISTED_KEYS: Array<keyof PTTState> = [
  'infoText',
  'locationText',
  'channelNumber',
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

function pickPersistedState(state: Partial<PTTState>): Partial<PTTState> {
  const result: Partial<PTTState> = {};
  for (const key of PERSISTED_KEYS) {
    if (key in state) {
      // @ts-expect-error dynamic key access
      result[key] = state[key];
    }
  }
  return result;
}

// ─── Default Settings ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  infoText: 'Pebe Herianto',
  locationText: 'BANDUNG, JAWA BARAT',
  showMyPhoto: true,
  showOtherPhotos: true,
  showPhotosInList: true,
  fastClick: true,
  showModulator: true,
  showPTT: true,
  maxQueue: '99999',
  audioMode: 'music' as const,
  pttSize: 30,
  pttBottom: 50,
  togglePtt: true,
  pttVolume: 70,
  vibrateOnStart: true,
  toneOnStartEnd: true,
  bgActive: true,
  fullDuplex: false,
  themeText: BRAND.defaultTheme,
  builtInEcho: true,
  isKaraokePlayerOpen: false,
  echoFeedback: 35,
  profilePhotoOption: 'custom' as const,
  customPhotoUrl: '',
};

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

// ─── Supabase Channel Subscription ───────────────────────────────────────────
// Keep subscription reference in closure to avoid React rendering cycles
let activeChannelSubscription: RealtimeChannel | null = null;

function subscribeToChannel(channelNum: number) {
  try {
    if (activeChannelSubscription) {
      activeChannelSubscription.unsubscribe();
      activeChannelSubscription = null;
    }

    // Clear active users list immediately on channel change to prevent showing stale users
    usePTTStore.setState({ activeUsers: [] });

    // Instantly set isConnected to true for prototype evaluation on dummy keys
    if (isDummyKey) {
      usePTTStore.setState({ isConnected: true });
    }

    const store = usePTTStore.getState();
    const channelInstance = supabase.channel(`${BRAND.supabaseRoomPrefix}${channelNum}`, {
      config: {
        presence: {
          key: store.userId || 'anonymous',
        },
      },
    });
    activeChannelSubscription = channelInstance;

    channelInstance
      .on('presence', { event: 'sync' }, () => {
        if (activeChannelSubscription !== channelInstance) return;
        const presenceState = channelInstance.presenceState();
        const rawList = Object.values(presenceState).flat() as unknown as PresenceMeta[];
        const users = rawList.map((p) => ({
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
      .on('broadcast', { event: 'webrtc_signaling' }, ({ payload }: { payload: any }) => {
        if (activeChannelSubscription !== channelInstance) return;
        const state = usePTTStore.getState();
        if (payload.senderUserId !== state.userId && state.onWebRTCSignalingReceived) {
          state.onWebRTCSignalingReceived(payload);
        }
      });

    channelInstance.subscribe((status: string) => {
      if (activeChannelSubscription !== channelInstance) return;
      const isSubscribed = isDummyKey ? true : status === 'SUBSCRIBED';
      usePTTStore.setState({ isConnected: isSubscribed });

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
            callSign: location.split(',')[0]?.trim() || '2DYUA',
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
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const usePTTStore = create<PTTState>((set) => ({
  isPowerOn: true,
  isConnected: false,
  isTransmitting: false,
  isScanning: false,
  progress: 0,
  channelNumber: BRAND.defaultChannel,
  channelId: getChannelUUID(BRAND.defaultChannel),
  userId: '',
  error: null,

  // Auth State
  user: null,
  activeTransmitter: null,
  activeUsers: [],

  // Merge defaults – initializeSession will overlay with localStorage cache
  ...DEFAULT_SETTINGS,

  onVoiceChunkReceived: null,
  setOnVoiceChunkReceived: (callback) => set({ onVoiceChunkReceived: callback }),
  setKaraokePlayerOpen: (open) => set({ isKaraokePlayerOpen: open }),
  broadcastVoiceChunk: (base64Chunk) => {
    const state = usePTTStore.getState();
    if (activeChannelSubscription && state.isConnected && state.isPowerOn) {
      activeChannelSubscription.send({
        type: 'broadcast',
        event: 'voice_chunk',
        payload: {
          userId: state.userId,
          base64: base64Chunk,
        },
      });
    }
  },

  onWebRTCSignalingReceived: null,
  setOnWebRTCSignalingReceived: (callback) => set({ onWebRTCSignalingReceived: callback }),
  broadcastWebRTCSignaling: (payload) => {
    const state = usePTTStore.getState();
    if (activeChannelSubscription && state.isConnected && state.isPowerOn) {
      activeChannelSubscription.send({
        type: 'broadcast',
        event: 'webrtc_signaling',
        payload,
      });
    }
  },

  setPower: (power) =>
    set((state) => {
      if (!power) {
        if (activeChannelSubscription) {
          activeChannelSubscription.unsubscribe();
          activeChannelSubscription = null;
        }
        return {
          isPowerOn: false,
          isConnected: false,
          isTransmitting: false,
          isScanning: false,
          progress: 0,
        };
      }
      // Re-establish subscription on power on
      setTimeout(() => subscribeToChannel(state.channelNumber), 0);
      return { isPowerOn: true };
    }),

  setConnected: (connected) => set({ isConnected: connected }),

  setTransmitting: (transmitting) =>
    set((state) => {
      if (!state.isPowerOn) return {};

      if (activeChannelSubscription && state.isConnected) {
        const userMeta = state.user;
        const displayName = state.infoText || userMeta?.user_metadata?.full_name;
        const location = state.locationText;

        activeChannelSubscription.send({
          type: 'broadcast',
          event: 'ptt_state',
          payload: {
            userId: state.userId,
            displayName: displayName,
            callSign: location.split(',')[0]?.trim() || '2DYUA',
            isTransmitting: transmitting,
          },
        });
      }

      return { isTransmitting: transmitting, progress: transmitting ? 50 : 0 };
    }),

  setScanning: (scanning) =>
    set((state) => {
      if (!state.isPowerOn) return {};
      return { isScanning: scanning };
    }),

  setProgress: (progress) =>
    set((state) => {
      if (!state.isPowerOn) return {};
      return { progress };
    }),

  setChannelNumber: (numOrFn) =>
    set((state) => {
      if (!state.isPowerOn) return {};
      const nextVal = typeof numOrFn === 'function' ? numOrFn(state.channelNumber) : numOrFn;
      const clamped = Math.max(0, Math.min(999, nextVal));

      // Subscribe to the new channel
      setTimeout(() => subscribeToChannel(clamped), 0);
      // Persist channel selection for offline recovery
      safeSetStorage({ channelNumber: clamped });

      return {
        channelNumber: clamped,
        channelId: getChannelUUID(clamped),
      };
    }),

  setError: (err) => set({ error: err }),

  initializeSession: () =>
    set((state) => {
      if (state.userId) return {}; // Already initialized

      const newUserId = generateUUID();

      // --- Offline Recovery: restore settings from localStorage cache ---
      const cached = safeGetStorage();
      const restored: Partial<PTTState> = {};

      if (cached) {
        for (const key of PERSISTED_KEYS) {
          if (key in cached && (cached as Record<string, unknown>)[key] !== undefined) {
            // @ts-expect-error dynamic key assignment
            restored[key] = (cached as Record<string, unknown>)[key];
          }
        }
      }

      // Establish initial connection using restored or default channel
      const channelToJoin = (restored.channelNumber as number) ?? state.channelNumber;
      setTimeout(() => subscribeToChannel(channelToJoin), 0);

      return {
        userId: newUserId,
        ...restored,
        // Derive channelId from restored channel number
        channelId: getChannelUUID(channelToJoin),
      };
    }),

  updateSettings: (settings) =>
    set((state) => {
      const next = { ...state, ...settings };
      // Delta-sync: only write settings-relevant keys to localStorage
      safeSetStorage(pickPersistedState(settings));

      // Delta-sync: updates active presence tracking if settings change
      if (next.isConnected && activeChannelSubscription) {
        const userMeta = next.user;
        const displayName = next.infoText || userMeta?.user_metadata?.full_name;
        const location = next.locationText;
        const avatarUrl =
          next.profilePhotoOption === 'google'
            ? userMeta?.user_metadata?.avatar_url || ''
            : next.customPhotoUrl;

        activeChannelSubscription
          .track({
            userId: next.userId,
            displayName: displayName,
            callSign: location.split(',')[0]?.trim() || '2DYUA',
            location: location,
            avatarUrl: avatarUrl,
          })
          .catch((err) => {
            console.warn('Failed to update presence metadata on settings update:', err);
          });
      }

      return next;
    }),

  setUser: (user) => set({ user }),

  signInWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message || 'Gagal masuk dengan Google' });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, activeTransmitter: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message || 'Gagal keluar akun' });
    }
  },

  channelUp: () =>
    set((state) => {
      if (!state.isPowerOn) return {};
      const nextVal = state.channelNumber >= 999 ? 0 : state.channelNumber + 1;

      setTimeout(() => subscribeToChannel(nextVal), 0);
      safeSetStorage({ channelNumber: nextVal });

      return {
        channelNumber: nextVal,
        channelId: getChannelUUID(nextVal),
      };
    }),

  channelDown: () =>
    set((state) => {
      if (!state.isPowerOn) return {};
      const nextVal = state.channelNumber <= 0 ? 999 : state.channelNumber - 1;

      setTimeout(() => subscribeToChannel(nextVal), 0);
      safeSetStorage({ channelNumber: nextVal });

      return {
        channelNumber: nextVal,
        channelId: getChannelUUID(nextVal),
      };
    }),

  toggleScan: () =>
    set((state) => {
      if (!state.isPowerOn) return {};
      return { isScanning: !state.isScanning };
    }),
}));
