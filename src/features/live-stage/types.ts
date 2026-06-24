export type LiveStageStatus = 'idle' | 'waiting' | 'live' | 'ended';
export interface LiveStageSession {
  id: string;
  room_id: string;
  singer_id: string;
  singer_name: string;
  singer_avatar?: string;
  song_title?: string;
  status: LiveStageStatus;
  started_at?: string;
  ended_at?: string;
  applause_count: number;
  love_count: number;
  fire_count: number;
  created_at: string;
}
