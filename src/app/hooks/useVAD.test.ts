/**
 * src/app/hooks/useVAD.test.ts
 * Unit tests untuk Voice Activity Detection hook
 *
 * Strategy: Mock audioContext module karena AudioContext tidak tersedia di jsdom.
 * initGlobalAudioContext() di-mock per-test untuk mengembalikan fake AudioContext.
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
import { initGlobalAudioContext } from '../utils/audioContext';

// ─── Mock audioContext module ─────────────────────────────────────────────────
// useVAD calls initGlobalAudioContext() at runtime — mock it so tests can
// inject a controlled fake AudioContext without a real Web Audio API.
// vi.mock is hoisted by Vitest and runs before any imports.
vi.mock('../utils/audioContext', () => ({
  initGlobalAudioContext: vi.fn(),
  __resetAudioContextForTest: vi.fn(),
}));

// ─── Mock Supabase (offline-capable) ─────────────────────────────────────────
vi.mock('../utils/supabase', () => {
  const mockSupabase = {
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
  };
  return {
    supabase: mockSupabase,
    getSupabase: vi.fn(() => Promise.resolve(mockSupabase)),
  };
});

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
let mockAnalyserData: Float32Array;
let mockAnalyserNode: {
  fftSize: number;
  getFloatTimeDomainData: ReturnType<typeof vi.fn>;
};
let mockAudioContext: {
  createMediaStreamSource: ReturnType<typeof vi.fn>;
  createAnalyser: ReturnType<typeof vi.fn>;
  state: string;
  resume: ReturnType<typeof vi.fn>;
};

const setupAudioMocks = (rmsValue = 0.05) => {
  // RMS = sqrt(mean(x^2)) — fill buffer with constant so RMS equals rmsValue
  mockAnalyserData = new Float32Array(512).fill(rmsValue);

  mockAnalyserNode = {
    fftSize: 512,
    getFloatTimeDomainData: vi.fn((arr: Float32Array) => {
      arr.set(mockAnalyserData);
    }),
  };

  const mockSource = { connect: vi.fn() };

  mockAudioContext = {
    createMediaStreamSource: vi.fn(() => mockSource),
    createAnalyser: vi.fn(() => mockAnalyserNode),
    state: 'running',
    resume: vi.fn(() => Promise.resolve()),
  };

  // Wire fake context into the mocked module function
  vi.mocked(initGlobalAudioContext).mockReturnValue(mockAudioContext as unknown as AudioContext);
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
    setupAudioMocks(0.05);

    usePTTStore.setState({ progress: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
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

    expect(initGlobalAudioContext).toHaveBeenCalled();
    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(stream);
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    expect(mockAnalyserNode.fftSize).toBe(512);
    expect(result.current.vadAnalyserRef.current).toBe(mockAnalyserNode);
  });

  it('should update store progress when audio is active (above threshold)', () => {
    setupAudioMocks(0.05);

    const { result } = renderHook(() => useVAD(0.01));
    const track = createMockTrack();
    const stream = createMockStream(track);

    usePTTStore.setState({ isTransmitting: true });

    act(() => {
      result.current.startVAD(stream, track);
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    const progress = usePTTStore.getState().progress;
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('should mute track after silence timeout exceeds threshold', () => {
    setupAudioMocks(0.001);

    const { result } = renderHook(() => useVAD(0.01, 300));
    const track = createMockTrack();
    const stream = createMockStream(track);

    expect(track.enabled).toBe(true);

    act(() => {
      result.current.startVAD(stream, track);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(track.enabled).toBe(false);
    expect(result.current.isVADSpeakingRef.current).toBe(false);
  });

  it('should unmute track when audio resumes after silence', () => {
    setupAudioMocks(0.001);

    const { result } = renderHook(() => useVAD(0.01, 200));
    const track = createMockTrack();
    const stream = createMockStream(track);

    act(() => {
      result.current.startVAD(stream, track);
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(track.enabled).toBe(false);

    mockAnalyserData = new Float32Array(512).fill(0.05);
    mockAnalyserNode.getFloatTimeDomainData.mockImplementation((arr: Float32Array) => {
      arr.set(mockAnalyserData);
    });

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

    expect(result.current.vadAnalyserRef.current).not.toBeNull();

    act(() => {
      result.current.stopVAD();
    });

    expect(result.current.vadAnalyserRef.current).toBeNull();
    expect(usePTTStore.getState().progress).toBe(0);
  });

  it('should handle gracefully when AudioContext is not available', () => {
    // Simulasikan browser lama: initGlobalAudioContext returns null
    vi.mocked(initGlobalAudioContext).mockReturnValue(null as unknown as AudioContext);

    const { result } = renderHook(() => useVAD());
    const track = createMockTrack();
    const stream = createMockStream(track);

    expect(() => {
      act(() => {
        result.current.startVAD(stream, track);
      });
    }).not.toThrow();

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
