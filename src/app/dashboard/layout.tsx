import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import MobileHeader from "@/components/dashboard/MobileHeader";

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
        <MobileHeader />

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
