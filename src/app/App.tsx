import { useEffect } from 'react';
import { usePTTStore } from './store/usePTTStore';
import { Toaster } from './components/ui/sonner';
import { supabase } from './utils/supabase';
import { LoginGate } from './components/LoginGate';
import { RadioLayout } from './components/RadioLayout';
import type { User } from '@supabase/supabase-js';

export default function App() {
  const { initializeSession, user, setUser, infoText, updateSettings, signInWithGoogle } =
    usePTTStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Handle Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      const u = session?.user || null;
      setUser(u);
      if (u) {
        const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';
        updateSettings({ infoText: name });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, updateSettings]);

  return (
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
              setUser({
                id: 'guest-session-id',
                email: 'guest@nextvwt.local',
                user_metadata: {
                  full_name: infoText || 'Pebe Herianto',
                },
                app_metadata: {
                  provider: 'guest',
                },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
              } as User);
            }}
          />
        </div>
      ) : (
        <RadioLayout />
      )}
      <Toaster />
    </div>
  );
}
