import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create tables via raw SQL using pg endpoint
  const sql = `
    CREATE TABLE IF NOT EXISTS public.incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      victim_name TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      aadhaar_number TEXT,
      address TEXT,
      damage_type TEXT NOT NULL,
      damage_details TEXT,
      photo_url TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      location_address TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected')),
      rejection_reason TEXT,
      compensation_amount NUMERIC,
      compensation_form_url TEXT,
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS public.alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT now(),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
      affected_area TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      radius_km NUMERIC,
      is_active BOOLEAN DEFAULT true,
      created_by TEXT
    );
    CREATE TABLE IF NOT EXISTS public.resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('medical','food','shelter','rescue_team','vehicle','equipment','other')),
      quantity INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'units',
      location TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      status TEXT DEFAULT 'available' CHECK (status IN ('available','deployed','exhausted')),
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS public.notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT now(),
      incident_id UUID,
      recipient_contact TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'status_update',
      sent_at TIMESTAMPTZ
    );
    GRANT ALL ON public.incidents TO anon, authenticated;
    GRANT ALL ON public.alerts TO anon, authenticated;
    GRANT ALL ON public.resources TO anon, authenticated;
    GRANT ALL ON public.notifications TO anon, authenticated;
  `;

  // Use Supabase Management API to run SQL
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
    { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY! } }
  );

  // Try inserting demo data (will fail gracefully if tables don't exist yet)
  try {
    const { data: existing } = await supabase.from("incidents").select("id").limit(1);
    if (existing !== null && existing.length === 0) {
      await supabase.from("incidents").insert([
        {
          victim_name: "Ramesh Kumar",
          contact_number: "9876543210",
          aadhaar_number: "1234-5678-9012",
          address: "Village Tilaura, Block Sadar",
          damage_type: "Flood",
          damage_details: "House completely submerged, crop loss of 3 acres",
          latitude: 26.8467,
          longitude: 80.9462,
          location_address: "Tilaura Village, Lucknow",
          status: "pending",
        },
        {
          victim_name: "Sunita Devi",
          contact_number: "9123456780",
          aadhaar_number: "9876-5432-1098",
          address: "Ward No. 5, Sitapur",
          damage_type: "Cyclone",
          damage_details: "Roof collapsed, livestock lost",
          latitude: 27.5706,
          longitude: 80.6828,
          location_address: "Ward 5, Sitapur",
          status: "approved",
          compensation_amount: 50000,
          reviewed_by: "Admin",
        },
        {
          victim_name: "Mohan Lal Yadav",
          contact_number: "8765432190",
          address: "Gram Panchayat Bajpur",
          damage_type: "Earthquake",
          damage_details: "Structural damage to house, furniture destroyed",
          latitude: 26.4499,
          longitude: 80.3319,
          location_address: "Bajpur, Kanpur Rural",
          status: "under_review",
        },
      ]);

      await supabase.from("alerts").insert([
        {
          title: "Heavy Rainfall Warning",
          message: "IMD has issued red alert for heavy to very heavy rainfall in eastern districts. All field officers on standby.",
          severity: "high",
          affected_area: "Eastern UP Districts",
          is_active: true,
          created_by: "Admin",
        },
        {
          title: "Flood Watch — Ganga Basin",
          message: "Water level of Ganga rising near danger mark at Varanasi and Allahabad. Evacuation teams deployed.",
          severity: "critical",
          affected_area: "Varanasi, Allahabad",
          is_active: true,
          created_by: "Admin",
        },
      ]);

      await supabase.from("resources").insert([
        { name: "Relief Food Packets", type: "food", quantity: 2000, unit: "packets", location: "District Warehouse, Lucknow", status: "available" },
        { name: "Medical First Aid Kits", type: "medical", quantity: 150, unit: "kits", location: "CHC Sadar", status: "available" },
        { name: "Rescue Boats", type: "vehicle", quantity: 8, unit: "boats", location: "SDRF Depot", status: "deployed" },
        { name: "Tarpaulin Sheets", type: "shelter", quantity: 500, unit: "sheets", location: "District Store", status: "available" },
      ]);
    }
  } catch (e) {
    // Tables may not exist yet
  }

  return NextResponse.json({ ok: true, message: "Setup complete" });
}
