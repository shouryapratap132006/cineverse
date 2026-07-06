import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import BottomNav from "@/components/dashboard/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-dark flex relative">
      {/* Permanent Left Sidebar — desktop only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main App Container */}
      <div className="flex-grow w-full lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden h-14 bg-slate-950/80 border-b border-white/5 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
          <span className="font-display font-extrabold text-sm tracking-wider text-white">
            Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
          </span>
          <div className="w-7 h-7 rounded-full bg-brand-purple/20 flex items-center justify-center text-[10px] font-bold text-brand-purple border border-brand-purple/30">
            C
          </div>
        </div>

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <div className="flex-grow w-full relative pb-20 lg:pb-0">
          {children}
        </div>
      </div>

      {/* Global Right Sidebar */}
      <RightSidebar />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
