import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import { usePTTStore } from './app/store/usePTTStore.ts';
import { runIntegrityCheck } from './app/utils/integrity.ts';
import { initializeSecureSupabase } from './app/utils/supabase.ts';
import { performSecurityAudit } from './app/utils/appSecurity.ts';

async function bootstrap() {
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__store__ = usePTTStore;

    // Run security and DOM integrity audits on boot (SEC-02)
    const integrity = runIntegrityCheck();
    if (!integrity.passed) {
      console.warn('[SECURITY WARNING] Application integrity checks failed:', integrity.violations);
    }

    // Run app security audits (SEC-10)
    try {
      const audit = await performSecurityAudit();
      if (audit.blocked) {
        console.error(
          '[SECURITY BLOCK] Application blocked due to critical security violations:',
          audit.issues
        );
      } else if (audit.score < 100) {
        console.warn(
          '[SECURITY WARNING] App security audit warnings detected:',
          audit.score,
          audit.issues
        );
      }
    } catch (err) {
      console.error('Failed to execute security audit:', err);
    }

    // Initialize secure dynamic config (SEC-05)
    try {
      await initializeSecureSupabase();
    } catch (err) {
      console.error('Failed to initialize secure Supabase client:', err);
    }
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    createRoot(rootEl).render(<App />);
  }
}

bootstrap();
