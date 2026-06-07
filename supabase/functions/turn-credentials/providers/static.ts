import { IceServer, TurnProvider } from '../types.ts';

export class StaticProvider implements TurnProvider {
  async getIceServers(): Promise<IceServer[]> {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
  }
}
