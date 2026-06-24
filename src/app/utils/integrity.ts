const INTEGRITY_KEY = 'nvt_integrity_v1';

/**
 * Verifikasi integrity script di DOM
 * Deteksi jika ada script yang di-inject oleh attacker
 */
export function checkDOMIntegrity(): boolean {
  const scripts = document.querySelectorAll('script[src]');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const src = script.getAttribute('src') || '';
    // Hanya boleh load script dari origin sendiri
    if (src && !src.startsWith(window.location.origin) && !src.startsWith('/')) {
      console.error('[SECURITY] External script detected:', src);
      return false;
    }
  }
  return true;
}

/**
 * Verifikasi bahwa app berjalan di domain yang authorized
 */
export function checkDomainAuthorization(): boolean {
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    'nextvwt.vercel.app',
    'nextvwt.id',
    'www.nextvwt.id',
  ];

  const hostname = window.location.hostname;
  return allowedDomains.some((domain) => hostname === domain || hostname.endsWith('.' + domain));
}

/**
 * Deteksi DevTools terbuka
 */
export function detectDevTools(): boolean {
  const threshold = 160;
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    return true;
  }

  return false;
}

/**
 * Anti-tampering: Verifikasi bahwa fungsi kritis belum di-override
 */
export function checkFunctionIntegrity(): boolean {
  const checks = [
    () => typeof crypto.randomUUID === 'function',
    () => typeof fetch === 'function',
    () => typeof navigator.mediaDevices?.getUserMedia === 'function',
    () => typeof RTCPeerConnection === 'function',
  ];

  return checks.every((check) => {
    try {
      return check();
    } catch {
      return false;
    }
  });
}

/**
 * Master integrity check — jalankan saat app start
 */
export function runIntegrityCheck(): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (!checkDomainAuthorization()) {
    violations.push('DOMAIN_MISMATCH');
  }

  if (!checkDOMIntegrity()) {
    violations.push('EXTERNAL_SCRIPT');
  }

  if (!checkFunctionIntegrity()) {
    violations.push('FUNCTION_TAMPERED');
  }

  // Simpan status integrity
  try {
    sessionStorage.setItem(
      INTEGRITY_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        passed: violations.length === 0,
        violations,
      })
    );
  } catch {
    // Ignore storage errors
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
