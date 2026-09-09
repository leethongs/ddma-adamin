"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Bell, Package, Shield, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidents", icon: FileText },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/resources", label: "Resources", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-[#1e3a5f] text-white flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 rounded-lg p-2"><Shield size={22} className="text-white" /></div>
          <div>
            <p className="font-bold text-sm leading-tight">DDMA</p>
            <p className="text-[10px] text-blue-300 leading-tight">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={"flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors " + (active ? "bg-orange-500 text-white" : "text-blue-200 hover:bg-blue-800 hover:text-white")}>
              <Icon size={18} />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-blue-800 text-xs text-blue-400 text-center">Admin Panel v1.0</div>
    </aside>
  );
}