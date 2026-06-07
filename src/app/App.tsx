import { useEffect } from 'react';
import { usePTTStore, generateUUID } from './store/usePTTStore';
import { Toaster } from './components/ui/sonner';
import { getSupabase } from './utils/supabase';
import type { Subscription } from '@supabase/supabase-js';

import { LoginGate } from './components/LoginGate';
import { RadioLayout } from './components/RadioLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { initializeSession, user, setUser, infoText, updateSettings, signInWithGoogle } =
    usePTTStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    let authSubscription: Subscription | null = null;

    getSupabase().then((supabase) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const currentStore = usePTTStore.getState();
        if (currentStore.user?.isGuest && !session?.user) {
          return; // Prevent overwriting guest session with null from delayed getSession
        }
        const u = session?.user || null;
        setUser(u);
        if (u) {
          const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';
          updateSettings({ infoText: name });
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentStore = usePTTStore.getState();
        if (currentStore.user?.isGuest && !session?.user) {
          return;
        }
        const u = session?.user || null;
        setUser(u);
        if (u) {
          const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';
          updateSettings({ infoText: name });
        }
      });
      authSubscription = subscription;
    });

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [setUser, updateSettings]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-[#1a1c23] flex items-center justify-center sm:p-4 select-none overflow-auto">
        {user === null ? (
          <div
            className="w-full h-[100dvh] sm:w-[360px] sm:h-[800px] bg-white sm:rounded-[40px] overflow-hidden relative sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:border-[8px] sm:border-[#2a2d36] flex-shrink-0 flex flex-col"
            style={{
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.1)',
            }}
          >
            <LoginGate
              onLogin={signInWithGoogle}
              onGuestLogin={() => {
                const guestId = `guest-${generateUUID()}`;
                const shortId = guestId.slice(-4).toUpperCase();
                setUser({
                  id: guestId,
                  isGuest: true,
                  email: `${guestId}@guest.nextvwt.local`,
                  user_metadata: {
                    full_name: infoText || `Tamu ${shortId}`,
                  },
                  app_metadata: {
                    provider: 'guest',
                  },
                  aud: 'authenticated',
                  created_at: new Date().toISOString(),
                });
              }}
            />
          </div>
        ) : (
          <RadioLayout />
        )}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
