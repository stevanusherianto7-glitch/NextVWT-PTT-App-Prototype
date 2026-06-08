import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || "https://tqixjycrxhjmpyffhxvg.supabase.co";
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("Connecting to Supabase at:", url);

const supabase = createClient(url, key);

async function run() {
  const dummyUserId = "pawon-salam-manual-id";
  const roomId = "ptt-room-1";

  console.log(`Setting role 'pjc' for user 'pawon salam' (ID: ${dummyUserId}) in room '${roomId}'...`);

  const { data, error } = await supabase
    .from("channel_roles")
    .upsert({
      room_id: roomId,
      user_id: dummyUserId,
      role: "pjc",
      status: "active",
      assigned_by: "manual_script",
      assigned_at: new Date().toISOString()
    }, { onConflict: "room_id,user_id" })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error setting role:", error);
    return;
  }

  console.log("Success! Role in database:", data);
}

run();
