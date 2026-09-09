import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yfkvfrlyzdxggamiievt.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlma3Zmcmx5emR4Z2dhbWlpZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyNjczNCwiZXhwIjoyMTA0NTAyNzM0fQ.W-XYcsx6417xUwd7kFxPkv5sXgT95ETnUMr4x5k5ZWI";

export async function GET() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Ensure tables exist — no seed data
  const checks = await Promise.all([
    supabase.from("incidents").select("id").limit(1),
    supabase.from("alerts").select("id").limit(1),
    supabase.from("resources").select("id").limit(1),
    supabase.from("notifications").select("id").limit(1),
  ]);

  return NextResponse.json({ ok: true, message: "Tables ready. No seed data." });
}