"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Incident, Alert } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, CheckCircle, XCircle, Clock, Bell, AlertTriangle, Download, BarChart2 } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: inc }, { data: al }] = await Promise.all([
        supabase.from("incidents").select("*").order("created_at", { ascending: false }),
        supabase.from("alerts").select("*").eq("is_active", true),
      ]);
      setIncidents(inc ?? []);
      setAlerts(al ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === "pending" || i.status === "under_review").length,
    approved: incidents.filter(i => i.status === "approved").length,
    rejected: incidents.filter(i => i.status === "rejected").length,
  };

  // Compute graph statistics
  const disasterStats = Object.values(incidents.reduce((acc, inc) => {
    const type = inc.damage_type || "Unknown";
    if (!acc[type]) acc[type] = { name: type, Total: 0, Approved: 0, Pending: 0, Rejected: 0 };
    acc[type].Total++;
    if (inc.status === "approved") acc[type].Approved++;
    else if (inc.status === "rejected") acc[type].Rejected++;
    else acc[type].Pending++;
    return acc;
  }, {} as Record<string, { name: string, Total: number, Approved: number, Pending: number, Rejected: number }>));

  // Sort by total descending
  disasterStats.sort((a, b) => b.Total - a.Total);

  function exportGraphToCSV() {
    const headers = ["Disaster Type", "Total Reports", "Approved", "Pending/Review", "Rejected"];
    const rows = disasterStats.map(stat => [
      `"${stat.name}"`, stat.Total, stat.Approved, stat.Pending, stat.Rejected
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DDMA_Disaster_Statistics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Overview Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time pulse of disaster reports and relief efforts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Reports" value={loading ? "..." : stats.total.toString()} icon={FileText} color="bg-blue-50 text-blue-600" />
        <StatCard label="Pending Review" value={loading ? "..." : stats.pending.toString()} icon={Clock} color="bg-yellow-50 text-yellow-600" />
        <StatCard label="Approved Claims" value={loading ? "..." : stats.approved.toString()} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard label="Active Alerts" value={loading ? "..." : alerts.length.toString()} icon={Bell} color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRAPH SECTION */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><BarChart2 size={18} className="text-blue-600"/> Disaster Statistics</h2>
              <p className="text-xs text-gray-500 mt-0.5">Victim count by disaster type</p>
            </div>
            <button onClick={exportGraphToCSV} className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors">
              <Download size={14} /> Export Graph
            </button>
          </div>
          <div className="p-5 flex-1 min-h-[350px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
            ) : disasterStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">No data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disasterStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pending" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT INCIDENTS SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Recent Reports</h2>
            <Link href="/incidents" className="text-sm text-blue-600 font-semibold hover:underline">View All</Link>
          </div>
          <div className="p-2 flex-1">
            {loading ? (
              <p className="p-4 text-sm text-gray-500 text-center">Loading...</p>
            ) : incidents.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">No reports yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {incidents.slice(0, 5).map(inc => (
                  <Link key={inc.id} href={`/incidents/${inc.id}`} className="block p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm text-gray-800">{inc.victim_name}</p>
                      <StatusBadge status={inc.status as any} />
                    </div>
                    <p className="text-xs text-gray-500 flex justify-between">
                      <span className="font-medium text-blue-600 uppercase">{inc.damage_type}</span>
                      <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}