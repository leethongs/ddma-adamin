"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Incident } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Trash2, Download } from "lucide-react";
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
      .then(({ data }) => {
        setIncidents(data ?? []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this incident report? This action cannot be undone.")) return;
    await supabase.from("incidents").delete().eq("id", id);
    setIncidents(prev => prev.filter(inc => inc.id !== id));
  }

  function exportToCSV() {
    const headers = [
      "ID", "Date Reported", "Status", "Victim Name", "Contact Number", 
      "Aadhaar Number", "Address", "Damage Type", "Damage Details", 
      "Compensation Amount", "Rejection Reason", "Latitude", "Longitude", "Photos"
    ];

    const rows = filteredIncidents.map(inc => {
      const date = new Date(inc.created_at).toLocaleString("en-IN");
      const escape = (text: string | null | undefined) => `"${(text || "").toString().replace(/"/g, '""')}"`;
      
      return [
        inc.id,
        escape(date),
        inc.status,
        escape(inc.victim_name),
        `"=""${inc.contact_number || ""}"""`,
        `"=""${inc.aadhaar_number || ""}"""`,
        escape(inc.address),
        escape(inc.damage_type),
        escape(inc.damage_details),
        inc.compensation_amount || "0",
        escape(inc.rejection_reason),
        inc.latitude || "",
        inc.longitude || "",
        escape(inc.photo_url)
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DDMA_Incidents_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.victim_name.toLowerCase().includes(search.toLowerCase()) || 
                          inc.contact_number.includes(search) || 
                          inc.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inc.status === statusFilter;
    const matchesType = typeFilter === "All" || inc.damage_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incidents</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and review disaster reports from citizens.</p>
        </div>
        <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm">
          <Download size={18} /> Export as Excel (CSV)
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by name, contact, or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white capitalize">
          {statuses.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white">
          {damageTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Victim / Contact</th>
                <th className="p-4 font-semibold">Damage Type</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Date Reported</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading incidents...</td></tr>
              ) : filteredIncidents.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No incidents found matching your criteria.</td></tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{inc.victim_name}</p>
                      <p className="text-sm text-gray-500">{inc.contact_number}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold uppercase">{inc.damage_type}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700 line-clamp-1 max-w-[200px]" title={inc.address}>{inc.address}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700">{new Date(inc.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={inc.status as any} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/incidents/${inc.id}`} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                          Review
                        </Link>
                        <button onClick={() => handleDelete(inc.id)} className="bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 px-2 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}