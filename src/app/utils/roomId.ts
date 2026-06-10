export type ChannelLike = {
  id?: string | number | null;
  number?: string | number | null;
  name?: string | null;
};
export function resolveRoomId(channel?: ChannelLike | null): string {
  if (!channel) return 'room:default';
  const raw = channel.id ?? channel.number ?? channel.name ?? 'default';
  return `room:${String(raw).trim().toLowerCase().replace(/\s+/g, '-')}`;
}
