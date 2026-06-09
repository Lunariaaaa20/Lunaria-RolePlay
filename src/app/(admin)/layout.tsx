"use client";

import LunariaPageGuard from "@/components/auth/LunariaPageGuard";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[248px]"
    : "lg:ml-[82px]";

  return (
    <LunariaPageGuard>
      <div className="min-h-screen bg-[#04050d] text-slate-100 xl:flex">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.14),transparent_34%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.06),transparent_35%),linear-gradient(135deg,#04050d,#070713_45%,#02030a)]" />

        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:54px_54px]" />

        <div className="pointer-events-none fixed left-[10%] top-[12%] z-0 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl" />
        <div className="pointer-events-none fixed bottom-[5%] right-[8%] z-0 h-96 w-96 rounded-full bg-violet-500/8 blur-3xl" />

        <AppSidebar />
        <Backdrop />

        <div
          className={`relative z-10 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <main className="mx-auto max-w-[1540px] p-4 md:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </LunariaPageGuard>
  );
}
