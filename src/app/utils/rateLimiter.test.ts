import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within limit', () => {
    const limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
      blockDurationMs: 2000,
      ignoreTestEnv: true, // Paksa logika berjalan meskipun di dalam vitest env
    });

    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getRemaining()).toBe(2);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getRemaining()).toBe(1);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getRemaining()).toBe(0);
  });

  it('should block requests exceeding limit and recover after block duration', () => {
    const limiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000,
      blockDurationMs: 2000,
      ignoreTestEnv: true,
    });

    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);

    // Request ketiga melebihi batas, harus memicu blokir
    expect(limiter.canProceed()).toBe(false);
    expect(limiter.getRemaining()).toBe(0);

    // Maju waktu dalam periode blokir (1.5 detik) - masih harus diblokir
    vi.advanceTimersByTime(1500);
    expect(limiter.canProceed()).toBe(false);

    // Maju waktu melampaui blockDurationMs (total 2.5 detik) - harus pulih
    vi.advanceTimersByTime(1000);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getRemaining()).toBe(1);
  });

  it('should clear old timestamps outside window', () => {
    const limiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000,
      blockDurationMs: 2000,
      ignoreTestEnv: true,
    });

    expect(limiter.canProceed()).toBe(true);

    // Maju waktu 600ms (masih di dalam window)
    vi.advanceTimersByTime(600);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getRemaining()).toBe(0);

    // Maju waktu 500ms lagi (total 1100ms, request pertama sudah kadaluwarsa)
    vi.advanceTimersByTime(500);
    expect(limiter.getRemaining()).toBe(1);
    expect(limiter.canProceed()).toBe(true);
  });

  it('should reset limiter parameters correctly on reset()', () => {
    const limiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000,
      blockDurationMs: 2000,
      ignoreTestEnv: true,
    });

    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(false);

    limiter.reset();

    expect(limiter.getRemaining()).toBe(2);
    expect(limiter.canProceed()).toBe(true);
  });
});
