export type PresenceStatus =
  | 'online'
  | 'speaking'
  | 'karaoke'
  | 'listening'
  | 'muted'
  | 'afk'
  | 'weak_connection'
  | 'moderator'
  | 'admin';
export interface RoomPresencePayload {
  userId: string;
  name: string;
  avatarUrl?: string;
  status: PresenceStatus;
  channelRole?: string;
  lastActiveAt: number;
  connectionQuality?: 'good' | 'fair' | 'weak';
}
