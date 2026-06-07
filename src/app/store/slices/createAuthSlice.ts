import { StateCreator } from 'zustand';
import { PTTState } from '../types';
import { getSupabase } from '../../utils/supabase';

export const createAuthSlice: StateCreator<
  PTTState,
  [],
  [],
  Pick<PTTState, 'user' | 'activeTransmitter' | 'activeUsers' | 'setUser' | 'signInWithGoogle' | 'signOut'>
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
