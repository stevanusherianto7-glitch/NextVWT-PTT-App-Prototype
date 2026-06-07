/**
 * src/app/hooks/useVAD.test.ts
 * Unit tests untuk Voice Activity Detection hook
 *
 * Strategy: Mock AudioContext API karena tidak tersedia di jsdom (Vitest env)
 * Tests memverifikasi:
 *   1. startVAD menginisialisasi analyser dan memulai polling interval
 *   2. VAD mute microphone track saat silence terdeteksi
 *   3. VAD unmute track saat audio kembali aktif
 *   4. stopVAD membersihkan semua resource dan mereset progress store
 *   5. Graceful handling jika AudioContext tidak tersedia
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVAD } from './useVAD';
import { usePTTStore } from '../store/usePTTStore';

// ─── Mock Supabase (offline-capable) ─────────────────────────────────────────
vi.mock('../utils/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      track: vi.fn(() => Promise.resolve()),
      send: vi.fn(() => Promise.resolve()),
      subscribe: vi.fn((cb) => {
        cb?.('SUBSCRIBED');
        return { unsubscribe: vi.fn() };
      }),
      unsubscribe: vi.fn(),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
    })),
  },
}));

// ─── Mock localStorage ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => {
      store[k] = v;
    }),
    removeItem: vi.fn((k: string) => {
      delete store[k];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// ─── Mock Web Audio API ───────────────────────────────────────────────────────
// jsdom tidak mengimplementasikan AudioContext, jadi kita mock seluruhnya
let mockAnalyserData: Float32Array;
let mockAnalyserNode: {
  fftSize: number;
  getFloatTimeDomainData: ReturnType<typeof vi.fn>;
};
let mockAudioContext: {
  createMediaStreamSource: ReturnType<typeof vi.fn>;
  createAnalyser: ReturnType<typeof vi.fn>;
};

const setupAudioMocks = (rmsValue = 0.05) => {
  // Buat buffer dengan RMS sesuai rmsValue yang diinginkan
  // RMS = sqrt(sum(x^2) / n) → untuk nilai tetap: setiap sample = rmsValue
  mockAnalyserData = new Float32Array(512).fill(rmsValue);

  mockAnalyserNode = {
    fftSize: 512,
    getFloatTimeDomainData: vi.fn((arr: Float32Array) => {
      arr.set(mockAnalyserData);
    }),
  };

  const mockSource = {
    connect: vi.fn(),
  };

  mockAudioContext = {
    createMediaStreamSource: vi.fn(() => mockSource),
    createAnalyser: vi.fn(() => mockAnalyserNode),
  };

  // Expose ke window agar hook bisa menemukannya
  // KRITIS: Gunakan mockImplementation agar bisa di-'new' sebagai constructor
  Object.defineProperty(globalThis, 'AudioContext', {
    value: vi.fn().mockImplementation(function () {
      return mockAudioContext;
    }),
    writable: true,
    configurable: true,
  });
};

// ─── Mock MediaStreamTrack ────────────────────────────────────────────────────
function createMockTrack(): MediaStreamTrack {
  return {
    enabled: true,
    kind: 'audio',
    id: 'mock-track-id',
  } as unknown as MediaStreamTrack;
}

function createMockStream(track: MediaStreamTrack): MediaStream {
  return {
    getAudioTracks: vi.fn(() => [track]),
  } as unknown as MediaStream;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('useVAD', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    setupAudioMocks(0.05); // default: audio aktif (RMS di atas threshold 0.01)

    // Reset store progress
    usePTTStore.setState({ progress: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should initialize with correct default refs', () => {
    const { result } = renderHook(() => useVAD());

    expect(result.current.vadAnalyserRef.current).toBeNull();
    expect(result.current.isVADSpeakingRef.current).toBe(true);
    expect(result.current.startVAD).toBeInstanceOf(Function);
    expect(result.current.stopVAD).toBeInstanceOf(Function);
  });

  it('should create AudioContext and start VAD interval when startVAD is called', () => {
    const { result } = renderHook(() => useVAD());
    const track = createMockTrack();
    const stream = createMockStream(track);

    act(() => {
      result.current.startVAD(stream, track);
    });

    // AudioContext harus diinisialisasi
    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(stream);
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    expect(mockAnalyserNode.fftSize).toBe(512);

    // Analyser ref harus ter-set
    expect(result.current.vadAnalyserRef.current).toBe(mockAnalyserNode);
  });

  it('should update store progress when audio is active (above threshold)', () => {
    // RMS = 0.05 → scaledProgress = min(100, round(0.05 * 400)) = 20
    setupAudioMocks(0.05);

    const { result } = renderHook(() => useVAD(0.01));
    const track = createMockTrack();
    const stream = createMockStream(track);

    act(() => {
      result.current.startVAD(stream, track);
    });

    // Advance timer untuk memicu checkVAD interval (100ms)
    act(() => {
      vi.advanceTimersByTime(150);
    });

    const progress = usePTTStore.getState().progress;
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('should mute track after silence timeout exceeds threshold', () => {
    // RMS = 0.001 → di bawah threshold 0.01 → silence detected
    setupAudioMocks(0.001);

    const { result } = renderHook(() => useVAD(0.01, 300)); // 300ms silence timeout
    const track = createMockTrack();
    const stream = createMockStream(track);

    expect(track.enabled).toBe(true);

    act(() => {
      result.current.startVAD(stream, track);
    });

    // Advance melewati silence timeout (300ms) + beberapa interval (100ms each)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Track harus di-mute karena silence terdeteksi
    expect(track.enabled).toBe(false);
    expect(result.current.isVADSpeakingRef.current).toBe(false);
  });

  it('should unmute track when audio resumes after silence', () => {
    // Mulai dengan silence
    setupAudioMocks(0.001);

    const { result } = renderHook(() => useVAD(0.01, 200));
    const track = createMockTrack();
    const stream = createMockStream(track);

    act(() => {
      result.current.startVAD(stream, track);
    });

    // Advance melewati silence timeout → mute
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(track.enabled).toBe(false);

    // Simulasikan audio kembali aktif — ganti data analyser
    mockAnalyserData = new Float32Array(512).fill(0.05);
    mockAnalyserNode.getFloatTimeDomainData.mockImplementation((arr: Float32Array) => {
      arr.set(mockAnalyserData);
    });

    // Advance lagi → unmute
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(track.enabled).toBe(true);
    expect(result.current.isVADSpeakingRef.current).toBe(true);
  });

  it('should clear interval and reset progress when stopVAD is called', () => {
    const { result } = renderHook(() => useVAD());
    const track = createMockTrack();
    const stream = createMockStream(track);

    act(() => {
      result.current.startVAD(stream, track);
    });

    // Pastikan analyser ter-set
    expect(result.current.vadAnalyserRef.current).not.toBeNull();

    act(() => {
      result.current.stopVAD();
    });

    // Refs harus dibersihkan
    expect(result.current.vadAnalyserRef.current).toBeNull();

    // Store progress harus direset ke 0
    expect(usePTTStore.getState().progress).toBe(0);
  });

  it('should handle gracefully when AudioContext is not available', () => {
    // Hapus AudioContext dari window untuk simulasi browser lama
    Object.defineProperty(globalThis, 'AudioContext', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'webkitAudioContext', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useVAD());
    const track = createMockTrack();
    const stream = createMockStream(track);

    // Tidak boleh throw error
    expect(() => {
      act(() => {
        result.current.startVAD(stream, track);
      });
    }).not.toThrow();

    // Analyser ref tetap null karena AudioContext tidak ada
    expect(result.current.vadAnalyserRef.current).toBeNull();
  });

  it('should handle multiple stopVAD calls idempotently', () => {
    const { result } = renderHook(() => useVAD());
    const track = createMockTrack();
    const stream = createMockStream(track);

    act(() => {
      result.current.startVAD(stream, track);
      result.current.stopVAD();
      result.current.stopVAD(); // Panggil dua kali → tidak boleh error
      result.current.stopVAD(); // Panggil tiga kali → tidak boleh error
    });

    expect(result.current.vadAnalyserRef.current).toBeNull();
    expect(usePTTStore.getState().progress).toBe(0);
  });
});
