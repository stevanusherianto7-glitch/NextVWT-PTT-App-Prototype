const lastActionAt = new Map<string, number>();
export function assertCooldown(key: string, cooldownMs: number, message: string) {
  const now = Date.now();
  const last = lastActionAt.get(key) ?? 0;
  if (now - last < cooldownMs) throw new Error(message);
  lastActionAt.set(key, now);
}
