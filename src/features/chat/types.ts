export type ChannelMessageType = 'text' | 'system' | 'reaction';
export interface ChannelMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  message: string;
  message_type: ChannelMessageType;
  created_at: string;
}
