import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://yfkvfrlyzdxggamiievt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlma3Zmcmx5emR4Z2dhbWlpZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyNjczNCwiZXhwIjoyMTA0NTAyNzM0fQ.W-XYcsx6417xUwd7kFxPkv5sXgT95ETnUMr4x5k5ZWI"
);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("incidents").update({
    status: "approved", reviewed_by: "Admin", reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}