import { Incident } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
        <tr>
          <th className="px-5 py-3 text-left">Victim</th>
          <th className="px-5 py-3 text-left">Damage Type</th>
          <th className="px-5 py-3 text-left">Location</th>
          <th className="px-5 py-3 text-left">Status</th>
          <th className="px-5 py-3 text-left">Date</th>
          <th className="px-5 py-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {incidents.map(inc => (
          <tr key={inc.id} className="hover:bg-gray-50">
            <td className="px-5 py-3 font-medium text-gray-800">
              {inc.victim_name}
              <br /><span className="text-xs text-gray-400">{inc.contact_number}</span>
            </td>
            <td className="px-5 py-3 text-gray-600 capitalize">{inc.damage_type}</td>
            <td className="px-5 py-3 text-gray-500 text-xs">{inc.location_address ?? "—"}</td>
            <td className="px-5 py-3"><StatusBadge status={inc.status} /></td>
            <td className="px-5 py-3 text-gray-400 text-xs">{new Date(inc.created_at).toLocaleDateString("en-IN")}</td>
            <td className="px-5 py-3">
              <Link href={"/incidents/" + inc.id} className="text-orange-500 hover:underline font-medium text-xs">View →</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}