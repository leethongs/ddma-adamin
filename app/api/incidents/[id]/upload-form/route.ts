import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = params.id + "-" + Date.now() + "-" + file.name;
  const { data, error } = await supabase.storage.from("compensation-forms").upload(fileName, buffer, { contentType: file.type, upsert: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: urlData } = supabase.storage.from("compensation-forms").getPublicUrl(fileName);
  await supabase.from("incidents").update({ compensation_form_url: urlData.publicUrl, updated_at: new Date().toISOString() }).eq("id", params.id);
  return NextResponse.json({ ok: true, url: urlData.publicUrl });
}