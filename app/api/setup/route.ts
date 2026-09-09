import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://yfkvfrlyzdxggamiievt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlma3Zmcmx5emR4Z2dhbWlpZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyNjczNCwiZXhwIjoyMTA0NTAyNzM0fQ.W-XYcsx6417xUwd7kFxPkv5sXgT95ETnUMr4x5k5ZWI"
);
export async function GET() {
  // Seed default settings if missing
  try {
    const { data: existing } = await supabase.from("settings").select("key").limit(1);
    if (existing !== null && existing.length === 0) {
      await supabase.from("settings").upsert([
        { key: "sos_number", value: "1078" },
        { key: "district_name", value: "District Disaster Management Authority" },
        { key: "helpline_info", value: "Available 24x7" },
      ]);
    }
  } catch {}
  await supabase.rpc("exec_sql", { query: "CREATE TABLE IF NOT EXISTS public.subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), endpoint TEXT UNIQUE NOT NULL, keys_auth TEXT NOT NULL, keys_p256dh TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()); GRANT ALL ON public.subscriptions TO anon, authenticated;" });
  return NextResponse.json({ ok: true, message: "Tables ready." });
}