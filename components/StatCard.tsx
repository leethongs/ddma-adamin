import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, icon: Icon, color = "bg-blue-50 text-blue-600", sub }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
