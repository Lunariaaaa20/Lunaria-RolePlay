"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type GuildLog = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "amber" | "emerald" | "red" | "sky" | "violet";
  icon: string;
};

type RegistrationRow = {
  id: string;
  character_name: string;
  race: string;
  pathway: string;
  status: string;
  created_at: string;
};

type AccessLogRow = {
  id: string;
  action: string;
  access_code: string | null;
  created_at: string;
  players?: {
    character_name: string;
  } | null;
};

type CurrencyLogRow = {
  id: string;
  type: string;
  silver_change: number;
  reason: string;
  created_at: string;
  players?: {
    character_name: string;
  } | null;
};

type FortuneLogRow = {
  id: string;
  mode: string;
  detail: string;
  result: string;
  silver_change: number;
  created_at: string;
  players?: {
    character_name: string;
  } | null;
};

const toneMap: Record<GuildLog["tone"], string> = {
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  red: "border-red-400/25 bg-red-400/10 text-red-300",
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-300",
};

function formatTime(value: string) {
  if (!value) return "-";

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<GuildLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = useMemo(() => {
    return logs.length > 9 ? "9+" : String(logs.length);
  }, [logs.length]);

  const fetchGuildLogs = async () => {
    setIsLoading(true);

    const [registrationResult, accessResult, currencyResult, fortuneResult] =
      await Promise.all([
        supabase
          .from("registration_requests")
          .select("id, character_name, race, pathway, status, created_at")
          .order("created_at", { ascending: false })
          .limit(6),

        supabase
          .from("access_logs")
          .select("id, action, access_code, created_at, players(character_name)")
          .order("created_at", { ascending: false })
          .limit(6),

        supabase
          .from("currency_logs")
          .select(
            "id, type, silver_change, reason, created_at, players(character_name)"
          )
          .order("created_at", { ascending: false })
          .limit(6),

        supabase
          .from("fortune_logs")
          .select(
            "id, mode, detail, result, silver_change, created_at, players(character_name)"
          )
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

    const registrationLogs: GuildLog[] =
      (registrationResult.data as RegistrationRow[] | null)?.map((item) => ({
        id: `registration-${item.id}`,
        title:
          item.status === "pending"
            ? `${item.character_name} submitted Registration`
            : `${item.character_name} registration ${item.status}`,
        detail: `${item.race} • ${item.pathway} • ${item.status}`,
        time: item.created_at,
        tone:
          item.status === "approved"
            ? "emerald"
            : item.status === "rejected"
            ? "red"
            : "amber",
        icon: item.status === "approved" ? "✓" : "✦",
      })) || [];

    const accessLogs: GuildLog[] =
      (accessResult.data as AccessLogRow[] | null)?.map((item) => ({
        id: `access-${item.id}`,
        title: `${item.players?.character_name || "Adventurer"} approved`,
        detail: `Access code generated • ${item.access_code || "Hidden"}`,
        time: item.created_at,
        tone: "emerald",
        icon: "⚜",
      })) || [];

    const currencyLogs: GuildLog[] =
      (currencyResult.data as CurrencyLogRow[] | null)?.map((item) => ({
        id: `currency-${item.id}`,
        title: `${item.players?.character_name || "Adventurer"} currency update`,
        detail: `${item.type} • ${
          item.silver_change >= 0 ? "+" : ""
        }${item.silver_change}S • ${item.reason || "No note"}`,
        time: item.created_at,
        tone: item.silver_change >= 0 ? "sky" : "violet",
        icon: "S",
      })) || [];

    const fortuneLogs: GuildLog[] =
      (fortuneResult.data as FortuneLogRow[] | null)?.map((item) => ({
        id: `fortune-${item.id}`,
        title: `${item.players?.character_name || "Adventurer"} used Fortune Hall`,
        detail: `${item.mode} • ${item.result} • ${
          item.silver_change >= 0 ? "+" : ""
        }${item.silver_change}S`,
        time: item.created_at,
        tone: item.silver_change >= 0 ? "emerald" : "red",
        icon: "✺",
      })) || [];

    const merged = [
      ...registrationLogs,
      ...accessLogs,
      ...currencyLogs,
      ...fortuneLogs,
    ]
      .sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      )
      .slice(0, 12);

    setLogs(merged);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGuildLogs();
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          fetchGuildLogs();
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-300 shadow-[0_0_25px_rgba(15,23,42,0.35)] transition hover:border-amber-400/30 hover:text-amber-300"
        aria-label="Guild Report Log"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 22a2.75 2.75 0 0 0 2.63-2h-5.26A2.75 2.75 0 0 0 12 22Z"
            fill="currentColor"
          />
          <path
            d="M19 17.5H5l1.65-2.38V10.4A5.35 5.35 0 0 1 12 5a5.35 5.35 0 0 1 5.35 5.4v4.72L19 17.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M12 3V2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>

        {logs.length > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-black bg-amber-400 px-1 text-[10px] font-black text-black">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-[99999] mt-4 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[28px] border border-amber-400/20 bg-[#070812] shadow-[0_0_60px_rgba(0,0,0,0.55)]">
          <div className="border-b border-white/10 bg-gradient-to-r from-black via-slate-950 to-violet-950/50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                  Guild Report Log
                </p>
                <h3 className="mt-2 text-xl font-black text-white">
                  Player Activity
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Registration, approval, currency, cosmetic, and fortune updates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div className="max-h-[440px] overflow-y-auto p-3">
            {isLoading ? (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm font-bold text-sky-200">
                Loading guild reports...
              </div>
            ) : null}

            {!isLoading && logs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                Belum ada report log. Aktivitas akan muncul setelah registration,
                approval, currency update, atau fortune hall berjalan.
              </div>
            ) : null}

            <div className="space-y-3">
              {logs.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-amber-400/25 hover:bg-white/[0.06]"
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${
                        toneMap[item.tone]
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {item.detail}
                      </p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        {formatTime(item.time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/30 p-3">
            <button
              type="button"
              onClick={fetchGuildLogs}
              className="w-full rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500/20"
            >
              Refresh Guild Log
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
      }
