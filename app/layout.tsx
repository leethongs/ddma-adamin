import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DDMA Admin Panel",
  description: "District Disaster Management Authority - Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
