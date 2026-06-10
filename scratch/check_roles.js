import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || "https://tqixjycrxhjmpyffhxvg.supabase.co";
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("Connecting to Supabase at:", url);

const supabase = createClient(url, key);

async function run() {
  const { data: roles, error } = await supabase
    .from("channel_roles")
    .select("*")
    .limit(100);

  if (error) {
    console.error("Error reading channel_roles:", error);
    return;
  }

  console.log("Current channel_roles in DB:", roles);

  // Check channel_settings to see if there is any mention
  const { data: settings } = await supabase
    .from("channel_settings")
    .select("*")
    .limit(50);
  console.log("Current channel_settings in DB:", settings);

  // Check channel_moderation_logs to see if there is any user info
  const { data: logs } = await supabase
    .from("channel_moderation_logs")
    .select("*")
    .limit(50);
  console.log("Current moderation logs in DB:", logs);
}

run();
