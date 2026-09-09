import Link from 'next/link';
import { Incident } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { Eye, MapPin, Phone } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  loading?: boolean;
}

const damageTypeLabels: Record<string, string> = {
  flood: 'Flood',
  earthquake: 'Earthquake',
  cyclone: 'Cyclone',
  fire: 'Fire',
  landslide: 'Landslide',
  drought: 'Drought',
  other: 'Other',
};

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 w-full"></div>
        </td>
      ))}
    </tr>
  );
}

export default function IncidentTable({ incidents, loading = false }: IncidentTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Victim</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Contact</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Damage Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Location</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : incidents.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                No incidents found
              </td>
            </tr>
          ) : (
            incidents.map((incident) => (
              <tr
                key={incident.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{incident.victim_name}</div>
                  <div className="text-xs text-gray-400">{incident.aadhaar_number}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone size={12} />
                    {incident.contact_number}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-700">{damageTypeLabels[incident.damage_type] || incident.damage_type}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-600 max-w-[160px] truncate">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{incident.location_address || incident.address}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={incident.status} size="sm" />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(incident.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium rounded-md px-3 py-1.5 transition-colors"
                    style={{ background: '#eff6ff', color: '#2563eb' }}
                  >
                    <Eye size={13} />
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
