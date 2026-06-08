import { StateCreator } from 'zustand';
import { PTTState, ChannelItem } from '../types';
import { BRAND, CHANNELS, fetchChannels as fetchChannelsFromConfig } from '../../utils/config';
import { getChannelUUID, safeSetStorage } from '../storeUtils';
import { channelSwitchRateLimiter } from '../../utils/rateLimiter';

export const createChannelSlice: StateCreator<
  PTTState,
  [],
  [],
  Pick<
    PTTState,
    | 'channelNumber'
    | 'channelId'
    | 'channels'
    | 'setChannelNumber'
    | 'channelUp'
    | 'channelDown'
    | 'toggleScan'
    | 'fetchChannels'
  >
> = (set, get) => ({
  channelNumber: BRAND.defaultChannel,
  channelId: getChannelUUID(BRAND.defaultChannel),
  channels: CHANNELS as ChannelItem[],

  fetchChannels: async () => {
    try {
      const dbChannels = await fetchChannelsFromConfig();
      set({ channels: dbChannels as ChannelItem[] });
    } catch (err) {
      console.warn('Failed to fetch channels in store:', err);
    }
  },

  setChannelNumber: (numOrFn) => {
    const state = get();
    if (!state.isPowerOn) return;
    if (!channelSwitchRateLimiter.canProceed()) {
      console.warn('[Rate Limit] Channel switch ignored due to flood control');
      return;
    }

    const nextVal = typeof numOrFn === 'function' ? numOrFn(state.channelNumber) : numOrFn;
    const clamped = Math.max(0, Math.min(999, nextVal));

    // Subscribe to the new channel (Fast Click configures immediate or debounced delay reconnect)
    const delay = state.fastClick ? 0 : 800;
    setTimeout(() => state.subscribeToChannel(clamped), delay);

    // Persist channel selection for offline recovery
    safeSetStorage({ channelNumber: clamped });

    set({
      channelNumber: clamped,
      channelId: getChannelUUID(clamped),
    });
  },

  channelUp: () => {
    const state = get();
    state.setChannelNumber(state.channelNumber >= 999 ? 0 : state.channelNumber + 1);
  },
  channelDown: () => {
    const state = get();
    state.setChannelNumber(state.channelNumber <= 0 ? 999 : state.channelNumber - 1);
  },
  toggleScan: () => get().setScanning(!get().isScanning),
});
