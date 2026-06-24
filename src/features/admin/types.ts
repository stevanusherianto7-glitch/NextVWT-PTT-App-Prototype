export type ChannelRole = 'owner' | 'admin' | 'moderator' | 'member' | 'muted' | 'banned';
export function canModerateRoom(role?: ChannelRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'moderator';
}
export function canManageRoom(role?: ChannelRole | null): boolean {
  return role === 'owner' || role === 'admin';
}
