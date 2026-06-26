export type ReactionKind =
  | 'applause'
  | 'love'
  | 'kiss'
  | 'wow'
  | 'fire'
  | 'crown'
  | 'confetti'
  | 'bart'
  | 'fox'
  | 'rocket'
  | 'lightning'
  | 'star3d'
  | 'lion'
  | 'aquarium';
export interface RoomReactionEvent {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  targetUserId?: string;
  targetUserName?: string;
  reaction: ReactionKind;
  intensity?: 1 | 2 | 3;
  createdAt: number;
}
export type ActiveReaction = RoomReactionEvent & { expiresAt: number };
