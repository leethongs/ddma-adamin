"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Incident, Alert } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, CheckCircle, XCircle, Clock, Bell, AlertTriangle } from "lucide-react";
import Link from "next/link";

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

  const total = incidents.length;
  const pending = incidents.filter(i => i.status === "pending").length;
  const approved = incidents.filter(i => i.status === "approved").length;
  const rejected = incidents.filter(i => i.status === "rejected").length;
  const under_review = incidents.filter(i => i.status === "under_review").length;
  const recent = incidents.slice(0, 8);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">District Disaster Management Authority — Overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Incidents" value={total} icon={FileText} color="bg-blue-50 text-blue-600" />
        <StatCard label="Pending Review" value={pending} icon={Clock} color="bg-yellow-50 text-yellow-600" />
        <StatCard label="Under Review" value={under_review} icon={AlertTriangle} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Approved" value={approved} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} color="bg-red-50 text-red-600" />
        <StatCard label="Active Alerts" value={alerts.length} icon={Bell} color="bg-orange-50 text-orange-600" />
      </div>

      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Active Alerts</h2>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-center gap-4 p-4 rounded-xl border-l-4 bg-white shadow-sm ${
                alert.severity === "critical" ? "border-red-500" :
                alert.severity === "high" ? "border-orange-500" :
                alert.severity === "medium" ? "border-yellow-500" : "border-gray-400"
              }`}>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{alert.title}</p>
                  <p className="text-sm text-gray-500">{alert.message}</p>
                  {alert.affected_area && <p className="text-xs text-gray-400 mt-1">{alert.affected_area}</p>}
                </div>
                <StatusBadge status={alert.severity} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Recent Incidents</h2>
          <Link href="/incidents" className="text-sm text-orange-500 hover:underline font-medium">View all →</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {recent.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>No incidents reported yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Victim</th>
                  <th className="px-4 py-3 text-left">Damage Type</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map(inc => (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{inc.victim_name}<br /><span className="text-xs text-gray-400">{inc.contact_number}</span></td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{inc.damage_type}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{inc.location_address ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(inc.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <Link href={"/incidents/" + inc.id} className="text-orange-500 hover:underline font-medium text-xs">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}