export type SongRequestStatus = 'open' | 'selected' | 'done' | 'removed';
export interface SongRequest {
  id: string;
  room_id: string;
  requester_id: string;
  requester_name: string;
  song_title: string;
  artist_name?: string;
  youtube_url?: string;
  vote_count: number;
  status: SongRequestStatus;
  created_at: string;
}
