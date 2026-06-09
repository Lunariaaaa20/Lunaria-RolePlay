"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

type LunariaSession = {
  role: "player" | "admin";
  playerId?: string;
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
  loginAt?: string;
};

function getStoredSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const sessionSession = sessionStorage.getItem("lunaria_session");
  const localSession = localStorage.getItem("lunaria_session");

  const rawSession = sessionSession || localSession;

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as LunariaSession;
  } catch {
    localStorage.removeItem("lunaria_session");
    sessionStorage.removeItem("lunaria_session");
    return null;
  }
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<LunariaSession | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const refreshSession = () => {
    setSession(getStoredSession());
  };

  useEffect(() => {
    refreshSession();

    const handleStorage = () => {
      refreshSession();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const accountName = useMemo(() => {
    if (!session) return "Guest";
    if (session.role === "admin") return "Guild Admin";
    return session.characterName || session.username || "Adventurer";
  }, [session]);

  const accountRole = useMemo(() => {
    if (!session) return "No Active Session";
    if (session.role === "admin") return "Lunaria Control";
    return `${session.rank || "Adventurer"} • ${session.pathway || "Player"}`;
  }, [session]);

  const initials = useMemo(() => {
    if (session?.role === "admin") return "GA";

    const source = session?.characterName || session?.username || "Guest";
    return source
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [session]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("lunaria_session");
      sessionStorage.removeItem("lunaria_session");

      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore storage error
    }

    setSession(null);
    setIsOpen(false);

    window.location.replace("/logout");
  };

  const accountLink = session?.role === "admin" ? "/basic-tables" : "/profile";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          refreshSession();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-white/[0.04] px-3 py-2 text-slate-200 shadow-[0_0_28px_rgba(245,158,11,0.08)] transition hover:border-amber-400/35 hover:bg-amber-500/10"
        aria-label="Open account menu"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15 text-sm font-black text-amber-300">
          {initials}
        </span>

        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-[140px] truncate text-sm font-black text-white">
            {accountName}
          </span>
          <span className="mt-0.5 block max-w-[140px] truncate text-xs text-slate-500">
            {accountRole}
          </span>
        </span>

        <svg
          className={`hidden h-4 w-4 text-slate-500 transition-transform duration-200 sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-[99999] mt-4 w-[310px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[28px] border border-amber-400/20 bg-[#070812] shadow-[0_0_70px_rgba(0,0,0,0.70)]">
          <div className="border-b border-white/10 bg-gradient-to-r from-black via-slate-950 to-violet-950/60 p-5">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
              Lunaria Account
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15 text-lg font-black text-amber-300">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-black text-white">
                  {accountName}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {accountRole}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3">
            {session ? (
              <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Session Type
                </p>
                <p
                  className={`mt-2 text-sm font-black uppercase tracking-[0.14em] ${
                    session.role === "admin"
                      ? "text-amber-300"
                      : "text-emerald-300"
                  }`}
                >
                  {session.role === "admin" ? "Admin Access" : "Player Access"}
                </p>
              </div>
            ) : (
              <div className="mb-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                <p className="text-sm font-bold text-red-200">
                  No active Lunaria session detected.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Link
                href={accountLink}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-amber-400/25 hover:bg-amber-500/10 hover:text-amber-300"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
                  {session?.role === "admin" ? "♛" : "⚜"}
                </span>
                {session?.role === "admin" ? "Open Admin Panel" : "Open ID Card"}
              </Link>

              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-sky-300"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-300">
                  ◆
                </span>
                Guild Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-left text-sm font-bold text-red-200 transition hover:border-red-300/40 hover:bg-red-400/15"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/25 bg-red-400/10 text-red-300">
                  ⏻
                </span>
                Logout
              </button>

              <Link
                href="/logout"
                className="flex w-full items-center gap-3 rounded-2xl border border-red-400/20 bg-black/25 px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-red-300 transition hover:border-red-300/40 hover:bg-red-400/10"
              >
                Force Logout
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/35 p-4">
            <p className="text-xs leading-5 text-slate-500">
              Logout akan menghapus session dari perangkat ini dan mengarahkan
              kembali ke Access Gate.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
