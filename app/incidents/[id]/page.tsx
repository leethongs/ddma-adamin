"use client";
import { useEffect, useState } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { Incident } from "@/lib/types";
import { ArrowLeft, MapPin, Phone, User, Calendar, FileText, CheckCircle, XCircle, Maximize2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function IncidentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [compAmount, setCompAmount] = useState("");
  const [showApprove, setShowApprove] = useState(false);

  useEffect(() => {
    supabase.from("incidents").select("*").eq("id", id).single().then(({ data }) => {
      setIncident(data);
      setLoading(false);
    });
  }, [id]);

  async function handleApprove() {
    await fetch("/api/incidents/" + id + "/approve", { method: "POST", body: JSON.stringify({ amount: compAmount }) });
    window.location.reload();
  }

  async function handleReject() {
    await fetch("/api/incidents/" + id + "/reject", { method: "POST", body: JSON.stringify({ reason: rejectReason }) });
    window.location.reload();
  }

  async function uploadForm(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/api/incidents/" + id + "/upload-form", { method: "POST", body: formData });
    window.location.reload();
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!incident) return <div className="p-8">Incident not found</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/incidents" className="text-gray-400 hover:text-gray-800 transition-colors"><ArrowLeft /></Link>
          <h1 className="text-2xl font-bold text-gray-800">Incident Details</h1>
        </div>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-mono">{id}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Victim Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><User className="text-gray-400" /><div><p className="text-xs text-gray-500 uppercase">Full Name</p><p className="font-semibold text-gray-800">{incident.victim_name}</p></div></div>
              <div className="flex items-center gap-3"><Phone className="text-gray-400" /><div><p className="text-xs text-gray-500 uppercase">Contact</p><p className="font-semibold text-gray-800">{incident.contact_number}</p></div></div>
              <div className="flex items-center gap-3"><FileText className="text-gray-400" /><div><p className="text-xs text-gray-500 uppercase">Aadhaar</p><p className="font-semibold text-gray-800">{incident.aadhaar_number || "N/A"}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="text-gray-400" /><div><p className="text-xs text-gray-500 uppercase">Date Reported</p><p className="font-semibold text-gray-800">{new Date(incident.created_at).toLocaleDateString()}</p></div></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Damage Report</h2>
            <div className="mb-4">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold uppercase">{incident.damage_type}</span>
            </div>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{incident.damage_details || "No details provided."}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Location</h2>
              {incident.latitude && incident.longitude && (
                <a href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`} target="_blank" rel="noopener noreferrer" className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                  <ExternalLink size={16} /> Open in Google Maps
                </a>
              )}
            </div>
            <p className="text-gray-700 flex items-start gap-2 mb-4"><MapPin className="text-red-500 flex-shrink-0" /> {incident.address}</p>
            {incident.latitude && incident.longitude ? (
              
          {incident.video_url && (
            <div className="mt-8 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Incident Video</h3>
              <video src={incident.video_url} controls className="w-full max-w-2xl rounded-xl border border-slate-200 shadow-sm" />
            </div>
          )}

          <iframe className="w-full h-64 rounded-xl border border-gray-200" src={`https://www.openstreetmap.org/export/embed.html?bbox=${incident.longitude-0.01},${incident.latitude-0.01},${incident.longitude+0.01},${incident.latitude+0.01}&layer=mapnik&marker=${incident.latitude},${incident.longitude}`} />
            ) : (
              <div className="w-full h-64 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">No GPS coordinates available</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Photo Evidence</h2>
            {incident.photo_url ? (
              <div className="grid grid-cols-2 gap-3">
                {incident.photo_url.split(",").map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative group block overflow-hidden cursor-zoom-in rounded-xl bg-slate-100 border border-slate-200">
                    <img src={url} alt={`Damage ${i+1}`} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold flex items-center gap-2"><Maximize2 size={20} /></p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="w-full h-48 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">No photos uploaded</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Status & Actions</h2>
            
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase mb-1">Current Status</p>
              <div className="font-bold text-lg uppercase tracking-wider text-blue-700">{incident.status.replace("_", " ")}</div>
            </div>

            {incident.status === "pending" || incident.status === "under_review" ? (
              <div className="space-y-3">
                {!showApprove && !showReject ? (
                  <>
                    <button onClick={() => setShowApprove(true)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"><CheckCircle size={18}/> Approve Claim</button>
                    <button onClick={() => setShowReject(true)} className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"><XCircle size={18}/> Reject Claim</button>
                  </>
                ) : showApprove ? (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <label className="block text-sm font-bold text-green-900 mb-2">Compensation Amount (Rs)</label>
                    <input type="number" value={compAmount} onChange={e=>setCompAmount(e.target.value)} className="w-full border-green-300 rounded-lg p-2 mb-3" placeholder="e.g. 50000" />
                    <div className="flex gap-2">
                      <button onClick={handleApprove} className="flex-1 bg-green-600 text-white rounded-lg py-2 font-bold">Confirm</button>
                      <button onClick={() => setShowApprove(false)} className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <label className="block text-sm font-bold text-red-900 mb-2">Reason for Rejection</label>
                    <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} className="w-full border-red-300 rounded-lg p-2 mb-3 resize-none h-20" placeholder="Explain why..." />
                    <div className="flex gap-2">
                      <button onClick={handleReject} className="flex-1 bg-red-600 text-white rounded-lg py-2 font-bold">Confirm</button>
                      <button onClick={() => setShowReject(false)} className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 font-bold">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ) : incident.status === "approved" ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-green-800">
                  <p className="text-sm font-bold">Approved Amount: Rs. {incident.compensation_amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Official Form (PDF)</label>
                  {incident.compensation_form_url ? (
                    <a href={incident.compensation_form_url} target="_blank" className="block text-center w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg font-bold">View Uploaded Form</a>
                  ) : (
                    <div>
                      <input type="file" id="formUpload" className="hidden" accept=".pdf" onChange={uploadForm} />
                      <label htmlFor="formUpload" className="cursor-pointer block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold">Upload Form (PDF)</label>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-800">
                <p className="text-xs uppercase font-bold mb-1">Rejection Reason:</p>
                <p className="text-sm">{incident.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}