import { StateCreator } from 'zustand';
import { PTTState } from '../types';
import { getSupabase } from '../../utils/supabase';

export const createAuthSlice: StateCreator<
  PTTState,
  [],
  [],
  Pick<
    PTTState,
    | 'user'
    | 'activeTransmitter'
    | 'activeUsers'
    | 'setUser'
    | 'signInWithGoogle'
    | 'signInWithFacebook'
    | 'signInWithTikTok'
    | 'signOut'
  >
> = (set, _get) => ({
  user: null,
  activeTransmitter: null,
  activeUsers: [],

  setUser: (user) => set({ user }),

  signInWithGoogle: async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    } catch (err) {
      console.error('Google Sign In Error', err);
      set({ error: 'Failed to initialize Google Sign In' });
    }
  },

  signInWithFacebook: async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    } catch (err) {
      console.error('Facebook Sign In Error', err);
      set({ error: 'Failed to initialize Facebook Sign In' });
    }
  },

  signInWithTikTok: async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'tiktok' as any,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    } catch (err) {
      console.error('TikTok Sign In Error', err);
      set({ error: 'Failed to initialize TikTok Sign In' });
    }
  },

  signOut: async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
      set({ user: null });
    } catch (err) {
      console.error('Sign Out Error', err);
    }
  },
});
