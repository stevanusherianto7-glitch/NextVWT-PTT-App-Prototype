import type { RealtimeChannel } from '@supabase/supabase-js';

// Keep subscription reference in a shared module to avoid React rendering cycles
// and avoid storing non-serializable objects in Zustand state.
export let activeChannelSubscription: RealtimeChannel | null = null;

export function setActiveChannelSubscription(sub: RealtimeChannel | null) {
  activeChannelSubscription = sub;
}
