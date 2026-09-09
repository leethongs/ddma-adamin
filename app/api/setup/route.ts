import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yfkvfrlyzdxggamiievt.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlma3Zmcmx5emR4Z2dhbWlpZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyNjczNCwiZXhwIjoyMTA0NTAyNzM0fQ.W-XYcsx6417xUwd7kFxPkv5sXgT95ETnUMr4x5k5ZWI";

export async function GET() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { data: existing } = await supabase.from("incidents").select("id").limit(1);
    if (existing !== null && existing.length === 0) {
      await supabase.from("incidents").insert([
        {
          victim_name: "Ramesh Kumar", contact_number: "9876543210",
          aadhaar_number: "1234-5678-9012", address: "Village Tilaura, Block Sadar",
          damage_type: "Flood", damage_details: "House submerged, crop loss of 3 acres",
          latitude: 26.8467, longitude: 80.9462, location_address: "Tilaura Village, Lucknow",
          status: "pending",
        },
        {
          victim_name: "Sunita Devi", contact_number: "9123456780",
          aadhaar_number: "9876-5432-1098", address: "Ward No. 5, Sitapur",
          damage_type: "Cyclone", damage_details: "Roof collapsed, livestock lost",
          latitude: 27.5706, longitude: 80.6828, location_address: "Ward 5, Sitapur",
          status: "approved", compensation_amount: 50000, reviewed_by: "Admin",
        },
        {
          victim_name: "Mohan Lal Yadav", contact_number: "8765432190",
          address: "Gram Panchayat Bajpur", damage_type: "Earthquake",
          damage_details: "Structural damage to house, furniture destroyed",
          latitude: 26.4499, longitude: 80.3319, location_address: "Bajpur, Kanpur Rural",
          status: "under_review",
        },
      ]);

      await supabase.from("alerts").insert([
        { title: "Heavy Rainfall Warning", message: "IMD red alert for heavy rainfall in eastern districts. All field officers on standby.", severity: "high", affected_area: "Eastern UP Districts", is_active: true, created_by: "Admin" },
        { title: "Flood Watch - Ganga Basin", message: "Water level of Ganga rising near danger mark at Varanasi and Allahabad. Evacuation teams deployed.", severity: "critical", affected_area: "Varanasi, Allahabad", is_active: true, created_by: "Admin" },
      ]);

      await supabase.from("resources").insert([
        { name: "Relief Food Packets", type: "food", quantity: 2000, unit: "packets", location: "District Warehouse, Lucknow", status: "available" },
        { name: "Medical First Aid Kits", type: "medical", quantity: 150, unit: "kits", location: "CHC Sadar", status: "available" },
        { name: "Rescue Boats", type: "vehicle", quantity: 8, unit: "boats", location: "SDRF Depot", status: "deployed" },
        { name: "Tarpaulin Sheets", type: "shelter", quantity: 500, unit: "sheets", location: "District Store", status: "available" },
      ]);
    }
  } catch (e) {}

  return NextResponse.json({ ok: true, message: "Setup complete" });
}