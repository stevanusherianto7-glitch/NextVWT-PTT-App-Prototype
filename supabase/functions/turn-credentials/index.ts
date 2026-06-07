import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { MeteredProvider } from "./providers/metered.ts";
import { TwilioProvider } from "./providers/twilio.ts";
import { StaticProvider } from "./providers/static.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified in-memory rate limiting map for MVP
// Key: user_id, Value: { count: number, resetTime: number }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify User Session (Auth Required)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Rate Limiting (10 requests / 10 minutes per user)
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    const userRate = rateLimitMap.get(user.id);

    if (userRate && now < userRate.resetTime) {
      if (userRate.count >= 10) {
        console.warn(JSON.stringify({
          event: 'TURN_CREDENTIALS_RATELIMIT',
          user_id: user.id,
          status: 'failed',
          reason: 'Too many requests'
        }));
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      userRate.count++;
    } else {
      rateLimitMap.set(user.id, { count: 1, resetTime: now + tenMinutes });
    }

    // 3. Determine Provider
    const providerName = Deno.env.get('TURN_PROVIDER')?.toLowerCase() || 'metered';
    let provider;

    switch (providerName) {
      case 'twilio':
        provider = new TwilioProvider();
        break;
      case 'static':
        provider = new StaticProvider();
        break;
      case 'metered':
      default:
        provider = new MeteredProvider();
        break;
    }

    // 4. Fetch Credentials
    let iceServers;
    try {
      iceServers = await provider.getIceServers();
    } catch (providerError) {
      console.error(`[TURN_ERROR] Provider ${providerName} failed:`, providerError.message || providerError);
      // Fallback to static if main provider fails
      const staticProvider = new StaticProvider();
      iceServers = await staticProvider.getIceServers();
    }

    const latency = Date.now() - startTime;
    
    // 5. Observability Logging
    console.log(JSON.stringify({
      event: 'TURN_CREDENTIALS_REQUEST',
      user_id: user.id,
      provider: providerName,
      status: 'success',
      latency_ms: latency
    }));

    return new Response(JSON.stringify({ iceServers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(JSON.stringify({
      event: 'TURN_CREDENTIALS_REQUEST',
      status: 'failed',
      latency_ms: latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
