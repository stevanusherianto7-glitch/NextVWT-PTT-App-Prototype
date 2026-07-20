// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { AccessToken } from "https://esm.sh/livekit-server-sdk@2.10.0";

const ALLOWED_ORIGINS = [
  'http://localhost:5188',
  'http://localhost:4173',
  'https://nextvwt.vercel.app',
  'https://nextvwt.id',
  'https://www.nextvwt.id',
  'https://app.nextvwt.id',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
];

function handleCors(req: Request): Response | { headers: Record<string, string> } {
  const origin = req.headers.get('Origin');

  if (!origin) {
    return {
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin',
      },
    };
  }

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    },
  };
}

serve(async (req: Request) => {
  const corsResult = handleCors(req);

  if (corsResult instanceof Response) {
    return corsResult;
  }
  const corsHeaders = corsResult.headers;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY') ?? '';
    const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET') ?? '';

    if (!livekitApiKey || !livekitApiSecret) {
      return new Response(
        JSON.stringify({ error: 'LiveKit tidak dikonfigurasi di server (LIVEKIT_API_KEY/SECRET kosong)' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verify user session (auth required — token tidak boleh diberikan ke anon)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse body: room (channel number) + identity opsional
    const body = await req.json().catch(() => ({}));
    const { room, channel, identity } = body as {
      room?: string;
      channel?: number;
      identity?: string;
    };

    // room diisi dari `room` eksplisit, atau `ptt-room-{channel}`
    const roomName =
      room ||
      (typeof channel === 'number' ? `ptt-room-${channel}` : null);

    if (!roomName) {
      return new Response(
        JSON.stringify({ error: 'Field "room" atau "channel" wajib diisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Identity: gunakan id user (atau override bila diberikan & aman)
    const participantIdentity = identity || user.id;

    // 3. Mint LiveKit access token (server-side — secret TIDAK ke client)
    const at = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: participantIdentity,
      name: user.email || participantIdentity,
      ttl: '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true, // audio track (PTT)
      canSubscribe: true,
      canPublishData: false, // moderasi tetap di Supabase, bukan LiveKit Data API (AD-2)
    });

    const jwt = await at.toJwt();

    return new Response(
      JSON.stringify({ token: jwt, room: roomName, identity: participantIdentity }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server Error';
    console.error('[livekit-token] error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
