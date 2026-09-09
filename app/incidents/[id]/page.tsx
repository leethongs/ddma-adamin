"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Incident } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, MapPin, User, FileText, Upload, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function IncidentDetailPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from("incidents").select("*").eq("id", id).single()
      .then(({ data }) => { setIncident(data); setLoading(false); });
  }, [id]);

  async function handleApprove() {
    setActionLoading(true);
    const res = await fetch("/api/incidents/" + id + "/approve", { method: "POST" });
    if (res.ok) { setMsg("Approved successfully!"); setIncident(prev => prev ? { ...prev, status: "approved" } : prev); }
    else setMsg("Error approving.");
    setActionLoading(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) { setMsg("Enter rejection reason."); return; }
    setActionLoading(true);
    const res = await fetch("/api/incidents/" + id + "/reject", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    });
    if (res.ok) { setMsg("Incident rejected."); setIncident(prev => prev ? { ...prev, status: "rejected", rejection_reason: rejectReason } : prev); setShowRejectModal(false); }
    else setMsg("Error rejecting.");
    setActionLoading(false);
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    const res = await fetch("/api/incidents/" + id + "/upload-form", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) { setMsg("Form uploaded!"); setIncident(prev => prev ? { ...prev, compensation_form_url: data.url } : prev); }
    else setMsg("Upload failed.");
    setUploading(false);
  }

  if (loading) return <div className="p-8"><div className="h-8 w-48 bg-gray-200 rounded animate-pulse" /></div>;
  if (!incident) return <div className="p-8 text-gray-500">Incident not found.</div>;

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/incidents" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Incidents
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{incident.victim_name}</h1>
          <p className="text-gray-500 text-sm mt-1">Filed: {new Date(incident.created_at).toLocaleString("en-IN")}</p>
        </div>
        <StatusBadge status={incident.status} />
      </div>
      {msg && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">{msg}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><User size={16} className="text-orange-500" /> Victim Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{incident.victim_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contact</span><span className="font-medium">{incident.contact_number}</span></div>
            {incident.aadhaar_number && <div className="flex justify-between"><span className="text-gray-500">Aadhaar</span><span className="font-medium">{incident.aadhaar_number}</span></div>}
            {incident.address && <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium text-right">{incident.address}</span></div>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FileText size={16} className="text-orange-500" /> Damage Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{incident.damage_type}</span></div>
            {incident.damage_details && <div><p className="text-gray-500 mb-1">Description</p><p className="text-gray-700 bg-gray-50 rounded-lg p-3">{incident.damage_details}</p></div>}
            {incident.compensation_amount && <div className="flex justify-between"><span className="text-gray-500">Compensation</span><span className="font-bold text-green-600">Rs.{incident.compensation_amount.toLocaleString("en-IN")}</span></div>}
          </div>
        </div>
      </div>
      {incident.latitude && incident.longitude && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> Location</h2>
          <p className="text-sm text-gray-500 mb-3">{incident.location_address ?? (incident.latitude + ", " + incident.longitude)}</p>
          <iframe className="w-full h-56 rounded-lg border border-gray-200" src={"https://www.openstreetmap.org/export/embed.html?bbox=" + (incident.longitude - 0.05) + "," + (incident.latitude - 0.05) + "," + (incident.longitude + 0.05) + "," + (incident.latitude + 0.05) + "&layer=mapnik&marker=" + incident.latitude + "," + incident.longitude} />
        </div>
      )}
      {incident.photo_url && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Photo</h2>
          <img src={incident.photo_url} alt="Incident" className="rounded-xl max-h-72 object-cover border border-gray-200" />
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Upload size={16} className="text-orange-500" /> Compensation Form</h2>
        {incident.compensation_form_url ? (
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-green-500" />
            <a href={incident.compensation_form_url} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">Download Compensation Form</a>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} className="text-sm text-gray-600" />
            <button onClick={handleUpload} disabled={!uploadFile || uploading} className="bg-[#1e3a5f] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 disabled:opacity-50 font-medium">
              {uploading ? "Uploading..." : "Upload Form"}
            </button>
          </div>
        )}
      </div>
      {incident.status !== "approved" && incident.status !== "rejected" && (
        <div className="flex gap-3">
          <button onClick={handleApprove} disabled={actionLoading} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold">
            <CheckCircle size={18} />{actionLoading ? "Processing..." : "Approve Incident"}
          </button>
          <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 font-semibold">
            <XCircle size={18} />Reject
          </button>
        </div>
      )}
      {incident.status === "rejected" && incident.rejection_reason && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm font-medium">Rejection reason: {incident.rejection_reason}</p>
        </div>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Incident</h3>
            <textarea className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 h-28" placeholder="Enter rejection reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} disabled={actionLoading} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50">{actionLoading ? "Rejecting..." : "Confirm Reject"}</button>
              <button onClick={() => setShowRejectModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}