export type KaraokeQueueStatus =
  | 'waiting'
  | 'ready'
  | 'live'
  | 'skipped'
  | 'finished'
  | 'cancelled';
export interface KaraokeQueueItem {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  song_title?: string;
  queue_number: number;
  status: KaraokeQueueStatus;
  created_at: string;
  updated_at: string;
}
