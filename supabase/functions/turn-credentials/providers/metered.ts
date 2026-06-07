import { IceServer, TurnProvider } from '../types.ts';

export class MeteredProvider implements TurnProvider {
  async getIceServers(): Promise<IceServer[]> {
    const domain = Deno.env.get('METERED_DOMAIN');
    const apiKey = Deno.env.get('METERED_API_KEY');

    if (!domain || !apiKey) {
      throw new Error('METERED_DOMAIN or METERED_API_KEY is missing');
    }

    const response = await fetch(`https://${domain}/api/v1/turn/credentials?apiKey=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Metered API failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data as IceServer[];
  }
}
