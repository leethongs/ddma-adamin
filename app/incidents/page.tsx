"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Incident } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Trash2 } from "lucide-react";
import Link from "next/link";

const statuses = ["all", "pending", "under_review", "approved", "rejected"];
const damageTypes = ["All", "Flood", "Cyclone", "Earthquake", "Landslide", "Fire", "Drought", "Other"];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    supabase.from("incidents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setIncidents(data ?? []); setLoading(false); });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this incident? This cannot be undone.")) return;
    await fetch("/api/incidents/" + id + "/delete", { method: "DELETE" });
    setIncidents(prev => prev.filter(i => i.id !== id));
  }

  const filtered = incidents.filter(i => {
    const matchSearch = i.victim_name.toLowerCase().includes(search.toLowerCase()) ||
      i.contact_number.includes(search) || (i.location_address ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchType = typeFilter === "All" || i.damage_type.toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Incidents</h1>
        <p className="text-gray-500 text-sm mt-1">All disaster incident reports</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Search by name, contact, location..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace("_", " ")}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {damageTypes.map(t => <option key={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No incidents found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left">Victim Details</th>
                <th className="px-5 py-3 text-left">Damage Type</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Date Filed</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(inc => (
                <tr key={inc.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4"><p className="font-medium text-gray-800">{inc.victim_name}</p><p className="text-xs text-gray-400">{inc.contact_number}</p></td>
                  <td className="px-5 py-4 text-gray-600 capitalize">{inc.damage_type}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{inc.location_address ?? (inc.latitude ? inc.latitude.toFixed(4) + ", " + inc.longitude?.toFixed(4) : "—")}</td>
                  <td className="px-5 py-4"><StatusBadge status={inc.status} /></td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(inc.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={"/incidents/" + inc.id} className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 font-medium">View →</Link>
                      <button onClick={() => handleDelete(inc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">{filtered.length} record(s) shown</p>
    </div>
  );
}