interface SecureConfig {
  supabaseUrl: string;
  supabaseKey: string;
  turnUsername: string;
  turnCredential: string;
  turnUrls: string[];
}

let cachedConfig: SecureConfig | null = null;

const APP_VERSION = '1.0.0';

/**
 * Device fingerprint untuk tracking dan abuse prevention
 */
async function getDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '0',
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory?.toString() || '0',
  ];

  const encoder = new TextEncoder();
  const data = encoder.encode(components.join('|'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex.slice(0, 32);
}

/**
 * Fetch konfigurasi dari endpoint yang terproteksi
 * daripada menyimpan semua di VITE_ environment variables
 */
export async function getSecureConfig(): Promise<SecureConfig> {
  if (cachedConfig) return cachedConfig;

  // Fallback ke environment variables untuk development
  const fallback: SecureConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    turnUsername: import.meta.env.VITE_TURN_USERNAME || '',
    turnCredential: import.meta.env.VITE_TURN_CREDENTIAL || '',
    turnUrls: import.meta.env.VITE_TURN_URL
      ? [import.meta.env.VITE_TURN_URL]
      : ['stun:stun.l.google.com:19302'],
  };

  // Di production, fetch dari secure endpoint
  if (import.meta.env.PROD) {
    try {
      const deviceId = await getDeviceFingerprint();
      const response = await fetch('/api/turn-credentials', {
        headers: {
          'X-App-Version': APP_VERSION,
          'X-Device-Id': deviceId,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as SecureConfig;
        cachedConfig = {
          supabaseUrl: data.supabaseUrl,
          supabaseKey: data.supabaseKey,
          turnUsername: data.turnUsername,
          turnCredential: data.turnCredential,
          turnUrls: data.turnUrls,
        };
        return cachedConfig;
      }
    } catch {
      // Fallback ke environment variables
    }
  }

  cachedConfig = fallback;
  return cachedConfig;
}

export function getCachedConfig(): SecureConfig | null {
  return cachedConfig;
}
