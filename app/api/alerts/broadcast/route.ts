import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  "https://yfkvfrlyzdxggamiievt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlma3Zmcmx5emR4Z2dhbWlpZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyNjczNCwiZXhwIjoyMTA0NTAyNzM0fQ.W-XYcsx6417xUwd7kFxPkv5sXgT95ETnUMr4x5k5ZWI"
);

webpush.setVapidDetails(
  "mailto:admin@ddma.gov",
  "BExP0izqIA9PZNJSuI-YVJ4gv0GXONMPNp-t0RL3LnzJm73Trqr9-5zGDI95cQLZGg7KO03sz1VVYKH7Qc1qJzY",
  "riLcm8YoHfhp9k-gkHSCpzIhs3OHJjKShP_jlXPFqBE"
);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { data: subs } = await supabase.from("subscriptions").select("*");
    
    if (subs && subs.length > 0) {
      const promises = subs.map(sub => 
        webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { auth: sub.keys_auth, p256dh: sub.keys_p256dh }
        }, JSON.stringify(payload)).catch(e => {
          if (e.statusCode === 410 || e.statusCode === 404) {
            supabase.from("subscriptions").delete().eq("id", sub.id).then();
          }
        })
      );
      await Promise.all(promises);
    }
    return NextResponse.json({ ok: true, sent: subs?.length ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}