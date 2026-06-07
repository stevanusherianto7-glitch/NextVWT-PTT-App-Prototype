export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface TurnProvider {
  getIceServers(): Promise<IceServer[]>;
}
