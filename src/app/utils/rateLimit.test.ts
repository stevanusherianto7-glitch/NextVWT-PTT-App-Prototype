import { describe, it, expect } from 'vitest';
import { assertCooldown } from './rateLimit';

describe('assertCooldown', () => {
  it('passes on first call and records timestamp', () => {
    expect(() => assertCooldown('k1', 1000, 'too fast')).not.toThrow();
  });

  it('throws if called again within cooldown', () => {
    assertCooldown('k2', 10_000, 'too fast');
    expect(() => assertCooldown('k2', 10_000, 'too fast')).toThrow('too fast');
  });

  it('allows call again after cooldown elapses', () => {
    vi.useFakeTimers();
    assertCooldown('k3', 50, 'too fast');
    vi.advanceTimersByTime(60);
    expect(() => assertCooldown('k3', 50, 'too fast')).not.toThrow();
    vi.useRealTimers();
  });

  it('different keys are independent', () => {
    assertCooldown('a', 10_000, 'x');
    expect(() => assertCooldown('b', 10_000, 'x')).not.toThrow();
  });
});
