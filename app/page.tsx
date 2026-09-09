"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Incident, Alert } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, CheckCircle, XCircle, Clock, Bell, AlertTriangle, Download, BarChart2, Image as ImageIcon, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toPng } from "html-to-image";

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);

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

  const pieData = [
    { name: "Approved", value: stats.approved, color: "#22c55e" },
    { name: "Pending", value: stats.pending, color: "#eab308" },
    { name: "Rejected", value: stats.rejected, color: "#ef4444" }
  ].filter(d => d.value > 0);

  const disasterStats = Object.values(incidents.reduce((acc, inc) => {
    const type = inc.damage_type || "Unknown";
    if (!acc[type]) acc[type] = { name: type, Total: 0, Approved: 0, Pending: 0, Rejected: 0 };
    acc[type].Total++;
    if (inc.status === "approved") acc[type].Approved++;
    else if (inc.status === "rejected") acc[type].Rejected++;
    else acc[type].Pending++;
    return acc;
  }, {} as Record<string, { name: string, Total: number, Approved: number, Pending: number, Rejected: number }>));

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
    link.download = `DDMA_Disaster_Data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportGraphAsImage() {
    if (!chartContainerRef.current) return;
    toPng(chartContainerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `DDMA_Visual_Graphs_${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Failed to export image", err);
        alert("Failed to export image. Please try again.");
      });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Overview Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time pulse of disaster reports and relief efforts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Reports" value={loading ? "..." : stats.total.toString()} icon={FileText} color="bg-blue-50 text-blue-600" />
        <StatCard label="Pending Review" value={loading ? "..." : stats.pending.toString()} icon={Clock} color="bg-yellow-50 text-yellow-600" />
        <StatCard label="Approved Claims" value={loading ? "..." : stats.approved.toString()} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard label="Active Alerts" value={loading ? "..." : alerts.length.toString()} icon={Bell} color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* GRAPH SECTION */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg"><BarChart2 className="text-blue-600"/> Data Visualization</h2>
              <p className="text-sm text-gray-500 mt-0.5">Comprehensive view of claims and distributions</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportGraphToCSV} className="text-xs bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                <FileSpreadsheet size={14} className="text-green-600" /> Data Excel
              </button>
              <button onClick={exportGraphAsImage} className="text-xs bg-blue-600 text-white hover:bg-blue-700 border border-transparent px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                <ImageIcon size={14} /> Download Graph Image
              </button>
            </div>
          </div>
          
          <div ref={chartContainerRef} className="p-6 flex-1 min-h-[400px] flex flex-col lg:flex-row gap-8 bg-white">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Loading charts...</div>
            ) : incidents.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No data available yet.</div>
            ) : (
              <>
                {/* PIE CHART */}
                <div className="flex-1 flex flex-col items-center">
                  <h3 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider text-center">Claim Status Distribution</h3>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* BAR CHART */}
                <div className="flex-[2] flex flex-col">
                  <h3 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider text-center">Victims by Disaster Type</h3>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={disasterStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RECENT INCIDENTS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><Clock size={18} className="text-slate-500"/> Recent Reports</h2>
            <Link href="/incidents" className="text-xs bg-white border border-gray-200 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm">View All</Link>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-8 text-sm text-gray-500 text-center">Loading...</p>
            ) : incidents.length === 0 ? (
              <p className="p-8 text-sm text-gray-500 text-center">No reports yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {incidents.slice(0, 7).map(inc => (
                  <Link key={inc.id} href={`/incidents/${inc.id}`} className="flex flex-col p-4 hover:bg-blue-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="font-bold text-sm text-gray-800">{inc.victim_name}</p>
                      <StatusBadge status={inc.status as any} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] font-bold tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">{inc.damage_type}</span>
                      <span className="text-xs text-gray-400 font-medium">{new Date(inc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
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