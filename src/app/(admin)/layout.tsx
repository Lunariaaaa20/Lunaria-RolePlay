"use client";

import LunariaPageGuard from "@/components/auth/LunariaPageGuard";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <LunariaPageGuard>
      <div className="min-h-screen bg-[#050611] text-slate-100 xl:flex">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.12),transparent_32%),linear-gradient(135deg,#050611,#070812_45%,#02030a)]" />
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:52px_52px]" />

        <AppSidebar />
        <Backdrop />

        <div
          className={`relative z-10 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />

          <main className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </LunariaPageGuard>
  );
}
