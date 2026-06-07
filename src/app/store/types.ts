import type { User } from '@supabase/supabase-js';

export interface GuestUser {
  id: string;
  isGuest: true;
  email?: string;
  user_metadata: { full_name: string; avatar_url?: string };
  app_metadata: { provider: string };
  aud: string;
  created_at: string;
}

export type AppUser = User | GuestUser;

export interface ChannelItem {
  number: number;
  name: string;
  type: 'green' | 'red' | 'gray';
  users: string[];
}

export interface WebRTCSignalingPayload {
  senderUserId: string;
  targetUserId?: string;
  type: 'offer' | 'answer' | 'candidate';
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}
