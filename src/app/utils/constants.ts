import { CHANNELS } from './config';

export interface ChannelItem {
  number: number;
  name: string;
  type: 'green' | 'red' | 'gray';
  users: string[];
}

export const STATIC_CHANNELS: ChannelItem[] = CHANNELS;

export function getChannelUserCount(channelNum: number): number {
  const ch = STATIC_CHANNELS.find((c) => c.number === channelNum);
  if (ch) {
    return ch.users ? ch.users.length : 0;
  }
  if (channelNum === 100) return 27; // Matches original mockup
  // Deterministic user count computation for other channels
  const hash = (channelNum * 13 + 7) % 37;
  return hash + 2;
}
