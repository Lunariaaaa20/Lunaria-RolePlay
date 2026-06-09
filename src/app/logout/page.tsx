"use client";

import React, { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    try {
      localStorage.removeItem("lunaria_session");
      sessionStorage.removeItem("lunaria_session");

      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore storage error
    }

    setTimeout(() => {
      window.location.replace("/signin");
    }, 700);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050611] px-4 text-slate-100">
      <section className="w-full max-w-md rounded-[32px] border border-amber-400/20 bg-black/45 p-6 text-center shadow-[0_0_60px_rgba(245,158,11,0.12)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
          Lunaria Logout
        </p>

        <h1 className="mt-4 text-2xl font-black text-white">
          Clearing Session
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Menghapus session admin/player dari perangkat ini. Kamu akan diarahkan
          kembali ke Access Gate.
        </p>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-amber-400/60" />
        </div>
      </section>
    </main>
  );
}
