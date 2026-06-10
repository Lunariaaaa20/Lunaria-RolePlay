"use client";

import React from "react";

type WorldChronicleRow = {
  id: string;

  season_name: string;
  season_day: number;
  season_length: number;

  world_day_name: string;
  weather_name: string;
  moon_phase: string;

  headline: string;
  news_body: string;

  event_title: string;
  event_type: string;
  event_location: string;
  event_mode: string;
  event_requirement: string;
  event_reward_note: string;

  market_mood: string;
  market_warning: string;

  created_by: string;
  last_generated_at: string;
  next_update_at: string;

  created_at: string;
  updated_at: string;
};

type AutoDailyEnginePanelProps = {
  chronicle: WorldChronicleRow | null;
  autoCycleStatus: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getEngineState(autoCycleStatus: string | null) {
  const status = String(autoCycleStatus || "").toLowerCase();

  if (status.includes("menerbitkan") || status.includes("memperbarui")) {
    return {
      label: "Synced",
      title: "Engine Recently Published",
      description:
        "Chronicle dan Relic Exchange baru saja diperbarui oleh Auto Daily Engine.",
      badge:
        "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
      glow: "from-emerald-400/16 via-cyan-300/8 to-transparent",
      dot: "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.85)]",
      icon: "✦",
      marketSync: "Market synchronized",
    };
  }

  if (status.includes("gagal")) {
    return {
      label: "Warning",
      title: "Engine Check Failed",
      description:
        "Auto Daily Engine gagal dicek. Admin bisa refresh halaman atau cek Supabase function.",
      badge: "border-red-300/25 bg-red-400/10 text-red-100",
      glow: "from-red-400/16 via-amber-300/8 to-transparent",
      dot: "bg-red-300 shadow-[0_0_18px_rgba(252,165,165,0.85)]",
      icon: "!",
      marketSync: "Needs attention",
    };
  }

  return {
    label: "Sleeping",
    title: "Engine Waiting for Next Chronicle",
    description:
      "Auto Daily Engine sedang tidur. Chronicle dan market akan bergerak otomatis saat jadwal update berikutnya tiba.",
    badge: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
    glow: "from-cyan-400/16 via-purple-300/8 to-transparent",
    dot: "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)]",
    icon: "☽",
    marketSync: "Waiting for next Chronicle",
  };
}

export default function AutoDailyEnginePanel({
  chronicle,
  autoCycleStatus,
}: AutoDailyEnginePanelProps) {
  const engine = getEngineState(autoCycleStatus);

  return (
    <div className="relative mt-5 overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.07),rgba(168,85,247,0.045),rgba(245,158,11,0.035))] p-5 shadow-[inset_0_0_34px_rgba(255,255,255,0.025)]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${engine.glow}`} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl" />
      <div className="pointer-events-none absolute right-5 top-4 text-6xl opacity-[0.06]">
        {engine.icon}
      </div>
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${engine.dot}`} />
              <p className="text-[9px] font-black uppercase tracking-[0.26em] text-cyan-100">
                Auto Daily Engine
              </p>
            </div>

            <h3 className="mt-3 text-xl font-black text-white">
              {engine.title}
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {engine.description}
            </p>

            {autoCycleStatus ? (
              <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold leading-5 text-slate-300">
                {autoCycleStatus}
              </p>
            ) : null}
          </div>

          <span
            className={`w-fit shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${engine.badge}`}
          >
            {engine.label}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <EngineMiniCard
            label="Current Season"
            value={
              chronicle
                ? `${chronicle.season_name} Day ${chronicle.season_day}/${chronicle.season_length}`
                : "Unknown"
            }
          />

          <EngineMiniCard
            label="Next Chronicle"
            value={formatDate(chronicle?.next_update_at)}
            highlight
          />

          <EngineMiniCard
            label="Market Sync"
            value={engine.marketSync}
          />

          <EngineMiniCard
            label="Current Headline"
            value={chronicle?.headline || "Belum tersedia"}
          />
        </div>
      </div>
    </div>
  );
}

function EngineMiniCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 line-clamp-2 text-sm font-black ${
          highlight ? "text-amber-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
            }
