import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-dark flex relative">
      {/* Permanent Left Sidebar (Hidden on mobile, need drawer on mobile or standard layout) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main App Container */}
      <div className="flex-grow w-full lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile Navbar Header */}
        <div className="lg:hidden h-14 bg-slate-950/80 border-b border-white/5 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <span className="font-display font-extrabold text-sm tracking-wider text-white">
            Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
          </span>
          {/* We can add a simple profile avatar or slide out trigger */}
          <div className="w-6.5 h-6.5 rounded-full bg-brand-purple/20 flex items-center justify-center text-[10px] font-bold text-brand-purple">
            C
          </div>
        </div>

        {/* Dynamic page children content */}
        <div className="flex-grow w-full relative">
          {children}
        </div>
      </div>
    </div>
  );
}
