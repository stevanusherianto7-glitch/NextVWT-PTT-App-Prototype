import { describe, it, expect } from 'vitest';
import { resolveRoomId } from './roomId';

describe('resolveRoomId', () => {
  it('returns default for null/undefined', () => {
    expect(resolveRoomId(null)).toBe('room:default');
    expect(resolveRoomId(undefined)).toBe('room:default');
  });

  it('prefers id', () => {
    expect(resolveRoomId({ id: 5 })).toBe('room:5');
  });

  it('falls back to number', () => {
    expect(resolveRoomId({ number: 12 })).toBe('room:12');
  });

  it('falls back to name', () => {
    expect(resolveRoomId({ name: 'CH-7' })).toBe('room:ch-7');
  });

  it('trims, lowercases and dashes spaces', () => {
    expect(resolveRoomId({ name: 'Main Channel ' })).toBe('room:main-channel');
  });

  it('handles string id', () => {
    expect(resolveRoomId({ id: 'ABC' })).toBe('room:abc');
  });

  it('handles null id but valid number', () => {
    expect(resolveRoomId({ id: null, number: 3 })).toBe('room:3');
  });
});
