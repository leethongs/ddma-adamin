"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Resource, ResourceType, ResourceStatus } from "@/lib/types";
import { Package, Plus, Pencil, Trash2, X, Check } from "lucide-react";

const types: ResourceType[] = ["medical","food","shelter","rescue_team","vehicle","equipment","other"];
const statuses: ResourceStatus[] = ["available","deployed","exhausted"];
const typeColors: Record<string, string> = { medical: "bg-red-50 text-red-700", food: "bg-green-50 text-green-700", shelter: "bg-blue-50 text-blue-700", rescue_team: "bg-purple-50 text-purple-700", vehicle: "bg-yellow-50 text-yellow-700", equipment: "bg-orange-50 text-orange-700", other: "bg-gray-100 text-gray-600" };
const statusColors: Record<string, string> = { available: "bg-green-100 text-green-700", deployed: "bg-blue-100 text-blue-700", exhausted: "bg-red-100 text-red-600" };

const emptyForm = { name: "", type: "food" as ResourceType, quantity: 0, unit: "units", location: "", status: "available" as ResourceStatus, notes: "" };

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resource>>({});
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    supabase.from("resources").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setResources(data ?? []); setLoading(false); });
  }, []);

  async function handleCreate() {
    if (!form.name) return;
    setSaving(true);
    const { data } = await supabase.from("resources").insert([form]).select().single();
    if (data) setResources(prev => [data, ...prev]);
    setShowForm(false);
    setForm(emptyForm);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    await fetch("/api/resources/" + id, { method: "DELETE" });
    setResources(prev => prev.filter(r => r.id !== id));
  }

  async function handleEdit(id: string) {
    setSaving(true);
    await fetch("/api/resources/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...editForm } : r));
    setEditingId(null);
    setEditForm({});
    setSaving(false);
  }

  function startEdit(r: Resource) {
    setEditingId(r.id);
    setEditForm({ name: r.name, type: r.type, quantity: r.quantity, unit: r.unit, location: r.location, status: r.status, notes: r.notes });
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
          <p className="text-gray-500 text-sm mt-1">Track relief materials, teams and equipment</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 font-semibold text-sm"><Plus size={16} /> Add Resource</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-gray-800">{resources.length}</p><p className="text-sm text-gray-500">Total Resources</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-blue-600">{resources.filter(r => r.status === "deployed").length}</p><p className="text-sm text-gray-500">Deployed</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-red-600">{resources.filter(r => r.status === "exhausted").length}</p><p className="text-sm text-gray-500">Exhausted</p></div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add New Resource</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Name *</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="e.g. Food Packets" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Type</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ResourceType }))}>{types.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}</select></div>
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Status</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ResourceStatus }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Quantity</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} /></div>
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Unit</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="packets, kits..." value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500 font-medium mb-1 block">Location</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Storage location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !form.name} className="bg-[#1e3a5f] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">{saving ? "Saving..." : "Add Resource"}</button>
            <button onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><Package size={40} className="mx-auto mb-3 opacity-30" /><p>No resources added yet.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left">Resource</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Quantity</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  {editingId === r.id ? (
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.name ?? ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" />
                        <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.type ?? "food"} onChange={e => setEditForm(p => ({ ...p, type: e.target.value as ResourceType }))}>{types.map(t => <option key={t} value={t}>{t.replace("_"," ")}</option>)}</select>
                        <input type="number" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.quantity ?? 0} onChange={e => setEditForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} />
                        <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.unit ?? ""} onChange={e => setEditForm(p => ({ ...p, unit: e.target.value }))} placeholder="Unit" />
                        <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 md:col-span-2" value={editForm.location ?? ""} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} placeholder="Location" />
                        <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={editForm.status ?? "available"} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as ResourceStatus }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(r.id)} disabled={saving} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"><Check size={14} />Save</button>
                        <button onClick={() => { setEditingId(null); setEditForm({}); }} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50"><X size={14} />Cancel</button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-5 py-4 font-medium text-gray-800">{r.name}</td>
                      <td className="px-5 py-4"><span className={"text-xs px-2.5 py-0.5 rounded-full font-medium capitalize " + (typeColors[r.type] ?? "bg-gray-100 text-gray-600")}>{r.type.replace("_", " ")}</span></td>
                      <td className="px-5 py-4 text-gray-600">{r.quantity} {r.unit}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{r.location ?? "—"}</td>
                      <td className="px-5 py-4"><span className={"text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize " + (statusColors[r.status] ?? "bg-gray-100")}>{r.status}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400" value={r.status} onChange={async e => {
                            const newStatus = e.target.value as ResourceStatus;
                            await fetch("/api/resources/" + r.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
                            setResources(prev => prev.map(res => res.id === r.id ? { ...res, status: newStatus } : res));
                          }}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                          <button onClick={() => startEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}