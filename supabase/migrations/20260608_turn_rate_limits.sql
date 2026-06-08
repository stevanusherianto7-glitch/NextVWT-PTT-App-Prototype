-- Create table for persistent TURN server credentials rate limiting
CREATE TABLE IF NOT EXISTS turn_rate_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 1,
  reset_time BIGINT NOT NULL
);

-- Enable RLS to prevent public access
ALTER TABLE turn_rate_limits ENABLE ROW LEVEL SECURITY;

-- Note: Only the service_role (supabaseAdmin with Service Role Key) has access/write permissions
-- because we intentionally do not define any public RLS policies for turn_rate_limits.
