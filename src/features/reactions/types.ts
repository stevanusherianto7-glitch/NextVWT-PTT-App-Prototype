export type ReactionKind = 'applause' | 'love' | 'wow' | 'fire' | 'crown' | 'confetti';
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
