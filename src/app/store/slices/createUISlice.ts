import { StateCreator } from 'zustand';
import { PTTState } from '../types';
import { pttRateLimiter } from '../../utils/rateLimiter';
import { activeChannelSubscription, setActiveChannelSubscription } from '../subscription';

export const createUISlice: StateCreator<
  PTTState,
  [],
  [],
  Pick<
    PTTState,
    | 'isPowerOn'
    | 'isConnected'
    | 'isTransmitting'
    | 'isScanning'
    | 'progress'
    | 'error'
    | 'setPower'
    | 'setConnected'
    | 'setTransmitting'
    | 'setScanning'
    | 'setProgress'
    | 'setError'
  >
> = (set, get) => ({
  isPowerOn: true,
  isConnected: false,
  isTransmitting: false,
  isScanning: false,
  progress: 0,
  error: null,

  setPower: (power) => {
    const state = get();
    if (!power) {
      if (activeChannelSubscription) {
        activeChannelSubscription.unsubscribe();
        setActiveChannelSubscription(null);
      }
      set({
        isPowerOn: false,
        isConnected: false,
        isTransmitting: false,
        isScanning: false,
        progress: 0,
      });
      return;
    }
    // Re-establish subscription on power on
    setTimeout(() => get().subscribeToChannel(state.channelNumber), 0);
    set({ isPowerOn: true });
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setTransmitting: (transmitting) => {
    const state = get();
    if (!state.isPowerOn) return;

    if (transmitting && !pttRateLimiter.canProceed()) {
      console.warn('[Rate Limit] PTT transmission toggle ignored due to flood control');
      return;
    }

    if (activeChannelSubscription && state.isConnected) {
      const userMeta = state.user;
      const displayName = state.infoText || userMeta?.user_metadata?.full_name;

      activeChannelSubscription.send({
        type: 'broadcast',
        event: 'ptt_state',
        payload: {
          userId: state.userId,
          displayName: displayName,
          callSign: state.callSign || '2DYUA',
          isTransmitting: transmitting,
        },
      });
    }

    set({ isTransmitting: transmitting, progress: transmitting ? 50 : 0 });
  },

  setScanning: (scanning) => {
    const state = get();
    if (!state.isPowerOn) return;
    set({ isScanning: scanning });
  },

  setProgress: (progress) => {
    const state = get();
    if (!state.isPowerOn) return;
    set({ progress });
  },

  setError: (error) => set({ error }),
});
