import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { ErrorBoundary } from './app/components/ErrorBoundary.tsx';
import './styles/index.css';
import { usePTTStore } from './app/store/usePTTStore.ts';
import { runIntegrityCheck } from './app/utils/integrity.ts';
import { getSupabase } from './app/utils/supabase.ts';
import { performSecurityAudit } from './app/utils/appSecurity.ts';

// ─── Window augmentation untuk E2E test store access ─────────────────────────
// Mengekspos usePTTStore ke window.__store__ agar Playwright dapat berinteraksi
// langsung dengan state tanpa harus melalui UI. HANYA aktif di non-production.
declare global {
  interface Window {
    __store__: typeof usePTTStore | undefined;
  }
}

async function bootstrap() {
  if (typeof window !== 'undefined') {
    // Expose store ke window HANYA di non-production (dev & test environment)
    // Di production: obfuscator menghapus ini via dead code elimination
    if (!import.meta.env.PROD) {
      window.__store__ = usePTTStore;
    }

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
    try {
      await getSupabase();
    } catch (err) {
      console.error('Failed to initialize secure Supabase client:', err);
    }
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    createRoot(rootEl).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  }
}

bootstrap();

// Register Service Worker for PWA (Option B) - Only in Production to prevent HMR caching issues in dev mode
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}
