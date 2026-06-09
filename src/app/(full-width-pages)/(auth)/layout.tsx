import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050611] text-slate-100">
      <ThemeProvider>{children}</ThemeProvider>
    </div>
  );
}
