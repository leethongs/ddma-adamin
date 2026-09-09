import { IncidentStatus, AlertSeverity } from "@/lib/types";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: IncidentStatus | AlertSeverity | string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
