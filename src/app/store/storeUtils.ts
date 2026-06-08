import { PTTState } from './types';

// ─── Local Storage Key ────────────────────────────────────────────────────────
const LS_KEY = 'nextvwt_settings';

/**
 * Membaca data secara aman dari localStorage.
 * Mengembalikan null jika ada kesalahan parsing atau pengecualian keamanan (misal, private browsing).
 */
export function safeGetStorage(): Partial<PTTState> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PTTState>;
  } catch {
    return null;
  }
}

/**
 * Menulis data secara aman ke localStorage dengan menggabungkan status yang ada.
 * Gagal secara senyap jika penyimpanan penuh atau diblokir.
 */
export function safeSetStorage(partial: Partial<PTTState>): void {
  try {
    const existing = safeGetStorage() ?? {};
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...partial }));
  } catch {
    // Quota exceeded atau private-browsing diblokir – gagal secara senyap
  }
}

/**
 * Pembuat UUID v4 standar RFC4122 dengan fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Memetakan nomor saluran integer secara deterministik ke format UUID v4 yang valid.
 */
export function getChannelUUID(channelNum: number): string {
  const padded = channelNum.toString().padStart(12, '0');
  return `00000000-0000-4000-8000-${padded}`;
}

/**
 * Pembuat tanda panggilan (call sign) acak 5 karakter alfanumerik huruf besar.
 */
export function generateRandomCallSign(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Hanya kunci-kunci ini yang dipertahankan di localStorage (state runtime volatil dikecualikan)
export const PERSISTED_KEYS: Array<keyof PTTState> = [
  'infoText',
  'locationText',
  'channelNumber',
  'callSign',
  'showMyPhoto',
  'showOtherPhotos',
  'showPhotosInList',
  'fastClick',
  'showModulator',
  'showPTT',
  'maxQueue',
  'audioMode',
  'pttSize',
  'pttBottom',
  'togglePtt',
  'pttVolume',
  'vibrateOnStart',
  'toneOnStartEnd',
  'bgActive',
  'fullDuplex',
  'themeText',
  'builtInEcho',
  'isKaraokePlayerOpen',
  'echoFeedback',
  'profilePhotoOption',
  'customPhotoUrl',
  'hasCompletedOnboarding',
  'lastFeedbackTime',
];

/**
 * Memfilter state untuk hanya mengambil properti yang persisten.
 */
export function pickPersistedState(state: Partial<PTTState>): Partial<PTTState> {
  const result: Partial<PTTState> = {};
  for (const key of PERSISTED_KEYS) {
    if (key in state) {
      // @ts-expect-error dynamic key access
      result[key] = state[key];
    }
  }
  return result;
}
