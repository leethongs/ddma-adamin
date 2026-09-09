"use client";
import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Settings, Save, Check } from "lucide-react";

interface Setting { key: string; value: string; }

const settingLabels: Record<string, { label: string; desc: string; type: string }> = {
  sos_number:    { label: "SOS Helpline Number", desc: "Phone number shown on the public SOS button", type: "tel" },
  district_name: { label: "District Name", desc: "Full authority name shown in header", type: "text" },
  helpline_info: { label: "Helpline Info Text", desc: "Short note shown in footer (e.g. Available 24x7)", type: "text" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    supabaseAdmin.from("settings").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      (data as Setting[] ?? []).forEach(s => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  async function handleSave(key: string) {
    setSaving(key);
    await supabaseAdmin.from("settings").upsert([{ key, value: settings[key], updated_at: new Date().toISOString() }]);
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Settings size={22} className="text-orange-500" />Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure public PWA content — changes appear instantly on the citizen app</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(settingLabels).map(([key, { label, desc, type }]) => (
            <div key={key} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-0.5">{label}</label>
              <p className="text-xs text-gray-400 mb-3">{desc}</p>
              <div className="flex gap-3">
                <input type={type} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={settings[key] ?? ""} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))} />
                <button onClick={() => handleSave(key)} disabled={saving === key}
                  className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors " + (saved === key ? "bg-green-600 text-white" : "bg-[#1e3a5f] text-white hover:bg-blue-900 disabled:opacity-50")}>
                  {saved === key ? <><Check size={14} />Saved!</> : saving === key ? "Saving..." : <><Save size={14} />Save</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
        <strong>Tip:</strong> The SOS number appears as a large red button on the citizen app. Changes take effect immediately without redeployment.
      </div>
    </div>
  );
}