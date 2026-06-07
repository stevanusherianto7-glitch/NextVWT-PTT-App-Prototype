import { Capacitor } from '@capacitor/core';

// SHA-256 hash dari signing certificate (isi setelah pertama kali sign)
const EXPECTED_SIGNING_HASH =
  '8F:3A:C4:DE:0F:7B:1A:E2:B4:C5:9E:8F:7D:6E:5D:4C:3B:2A:1A:0B:C9:D8:E7:F6:A5:B4:C3:D2:E1:F0:9A:8B';

interface CapacitorAppPlugin {
  getInstaller?: () => Promise<{ value: string | null }>;
}

interface CapacitorGlobal {
  Plugins?: {
    App?: CapacitorAppPlugin;
  };
}

interface CustomWindow extends Window {
  Capacitor?: CapacitorGlobal;
}

/**
 * Get installer package name (Android only)
 */
async function getInstallerPackageName(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const capWindow = window as unknown as CustomWindow;
      if (capWindow.Capacitor?.Plugins?.App?.getInstaller) {
        capWindow.Capacitor.Plugins.App.getInstaller()
          .then((res) => resolve(res.value))
          .catch(() => resolve(null));
      } else {
        resolve(null);
      }
    } catch {
      resolve(null);
    }
  });
}

/**
 * Verifikasi bahwa APK di-install dari Play Store / source yang authorized
 */
export async function verifyInstallationSource(): Promise<{
  legitimate: boolean;
  source: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { legitimate: true, source: 'web' };
  }

  try {
    const installer = await getInstallerPackageName();

    const legitimateSources = [
      'com.android.vending', // Google Play Store
      'com.google.android.feedback', // Play Store internal
      'com.sec.android.app.samsungapps', // Samsung Galaxy Store
    ];

    return {
      legitimate: installer ? legitimateSources.includes(installer) : false,
      source: installer || 'unknown_sideloaded',
    };
  } catch {
    return { legitimate: false, source: 'error' };
  }
}

/**
 * Deteksi emulator / virtual device
 */
export function detectEmulator(): boolean {
  if (!Capacitor.isNativePlatform()) return false;

  const userAgent = navigator.userAgent;
  const isGenericUserAgent = /sdk|emulator|simulator|generic/i.test(userAgent);
  const lowHardwareConcurrency =
    navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
  const standardEmulatorResolution = screen.width === 1080 && screen.height === 1920;
  const hasNoTouchPoints = navigator.maxTouchPoints === 0;

  const indicators = [
    isGenericUserAgent,
    lowHardwareConcurrency,
    standardEmulatorResolution,
    hasNoTouchPoints,
  ];

  // Jika 3+ indikator positif, kemungkinan emulator
  return indicators.filter(Boolean).length >= 3;
}

/**
 * Master security check
 */
export async function performSecurityAudit(): Promise<{
  score: number;
  issues: string[];
  blocked: boolean;
}> {
  const issues: string[] = [];
  let score = 100;

  // 1. Domain check (Hanya jika web platform)
  if (!Capacitor.isNativePlatform()) {
    const allowedDomains = ['localhost', '127.0.0.1', 'nextvwt.vercel.app', 'nextvwt.id'];
    const hostname = window.location.hostname;
    const isAllowed = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );
    if (!isAllowed) {
      issues.push('UNAUTHORIZED_DOMAIN');
      score -= 30;
    }
  }

  // 2. Installation source (Android only)
  if (Capacitor.isNativePlatform()) {
    const install = await verifyInstallationSource();
    // Jika dideploy lokal untuk debugging/development oleh developer, kita tidak block
    if (!install.legitimate && import.meta.env.PROD) {
      issues.push('SIDELOADED_APK');
      score -= 20;
    }
  }

  // 3. Emulator detection (Android only, block jika prod)
  if (detectEmulator() && import.meta.env.PROD) {
    issues.push('POSSIBLE_EMULATOR');
    score -= 15;
  }

  // 4. DevTools check
  const threshold = 160;
  const devToolsOpen =
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold;
  if (devToolsOpen && import.meta.env.PROD) {
    issues.push('DEVTOOLS_OPEN');
    score -= 10;
  }

  // 5. HTTPS check
  const isHttps = window.location.protocol === 'https:';
  const isLocal =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isHttps && !isLocal) {
    issues.push('NO_HTTPS');
    score -= 25;
  }

  // 6. Signing Certificate hash check (Android dummy simulation)
  if (Capacitor.isNativePlatform() && import.meta.env.PROD) {
    // Di native platform, simulasi check signing hash certificate.
    // Jika tidak valid, kurangi score.
    const currentSigningHash = EXPECTED_SIGNING_HASH; // Dalam production asli, fetch via Native Plugin
    if (currentSigningHash !== EXPECTED_SIGNING_HASH) {
      issues.push('INVALID_SIGNATURE');
      score -= 40;
    }
  }

  return {
    score: Math.max(0, score),
    issues,
    blocked: score < 50, // Block jika skor < 50
  };
}
