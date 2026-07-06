"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import MobileHeader from "@/components/dashboard/MobileHeader";
import VpnBanner from "@/components/dashboard/VpnBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Messages pages manage their own full-height layout
  const isMessagesRoute = pathname?.startsWith("/dashboard/messages");

  return (
    <div
      className="bg-brand-dark flex relative"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      {/* Permanent Left Sidebar — desktop only */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Main App Container */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden lg:pl-64">
        {/* Mobile Header — hidden on messages route */}
        {!isMessagesRoute && <MobileHeader />}

        {/* VPN Banner */}
        <VpnBanner />

        {/* Page content */}
        <div
          className={`flex-1 min-h-0 w-full relative ${isMessagesRoute ? "" : "overflow-y-auto pb-20 lg:pb-0"}`}
        >
          {children}
        </div>
      </div>

      {/* Right Sidebar — hidden on messages route */}
      {!isMessagesRoute && <RightSidebar />}

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
