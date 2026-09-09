"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertSeverity } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Bell, Plus, ToggleLeft, ToggleRight, MapPin, Pencil, Trash2, X, Check } from "lucide-react";

const severities: AlertSeverity[] = ["low", "medium", "high", "critical"];
const severityBorder: Record<string, string> = { low: "border-l-gray-400", medium: "border-l-yellow-400", high: "border-l-orange-500", critical: "border-l-red-500" };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Alert>>({});
  const [form, setForm] = useState({ title: "", message: "", severity: "medium" as AlertSeverity, affected_area: "" });

  useEffect(() => {
    supabase.from("alerts").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setAlerts(data ?? []); setLoading(false); });
  }, []);

  async function handleCreate() {
    if (!form.title || !form.message) return;
    setSaving(true);
    const { data } = await supabase.from("alerts").insert([{ ...form, is_active: true, created_by: "Admin" }]).select().single();
    if (data) setAlerts(prev => [data, ...prev]);
    setShowForm(false);
    setForm({ title: "", message: "", severity: "medium", affected_area: "" });
      await fetch("/api/alerts/broadcast", { method: "POST", body: JSON.stringify({ title: form.title, message: form.message }) });
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this alert?")) return;
    await fetch("/api/alerts/" + id, { method: "DELETE" });
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  async function handleEdit(id: string) {
    setSaving(true);
    await fetch("/api/alerts/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...editForm } : a));
    setEditingId(null);
    setEditForm({});
    setSaving(false);
  }

  async function toggleAlert(id: string, current: boolean) {
    await fetch("/api/alerts/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
  }

  function startEdit(alert: Alert) {
    setEditingId(alert.id);
    setEditForm({ title: alert.title, message: alert.message, severity: alert.severity, affected_area: alert.affected_area });
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Disaster Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and broadcast alerts to field officers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 font-semibold text-sm">
          <Plus size={16} /> New Alert
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Create New Alert</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Title *</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="e.g. Heavy Rainfall Warning" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Severity</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value as AlertSeverity }))}>{severities.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
            <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium mb-1 block">Message *</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 h-24" placeholder="Alert message..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Affected Area</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="e.g. Eastern District" value={form.affected_area} onChange={e => setForm(p => ({ ...p, affected_area: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !form.title || !form.message} className="bg-[#1e3a5f] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">{saving ? "Creating..." : "Create Alert"}</button>
            <button onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white border border-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400"><Bell size={40} className="mx-auto mb-3 opacity-30" /><p>No alerts yet.</p></div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={"bg-white rounded-xl border border-gray-200 border-l-4 p-5 shadow-sm " + (severityBorder[alert.severity] ?? "border-l-gray-400")}>
              {editingId === alert.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.title ?? ""} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" />
                    <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.severity ?? "medium"} onChange={e => setEditForm(p => ({ ...p, severity: e.target.value as AlertSeverity }))}>{severities.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 h-20" value={editForm.message ?? ""} onChange={e => setEditForm(p => ({ ...p, message: e.target.value }))} placeholder="Message" />
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.affected_area ?? ""} onChange={e => setEditForm(p => ({ ...p, affected_area: e.target.value }))} placeholder="Affected area" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(alert.id)} disabled={saving} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"><Check size={14} />Save</button>
                    <button onClick={() => { setEditingId(null); setEditForm({}); }} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50"><X size={14} />Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-800">{alert.title}</p>
                      <StatusBadge status={alert.severity} />
                      {!alert.is_active && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    {alert.affected_area && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={11} />{alert.affected_area}</p>}
                    <p className="text-xs text-gray-300 mt-2">{new Date(alert.created_at).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleAlert(alert.id, alert.is_active)} className={"flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors " + (alert.is_active ? "bg-green-50 text-green-700 hover:bg-gray-100 hover:text-gray-600" : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600")}>
                      {alert.is_active ? <><ToggleRight size={14} />Active</> : <><ToggleLeft size={14} />Inactive</>}
                    </button>
                    <button onClick={() => startEdit(alert)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(alert.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}