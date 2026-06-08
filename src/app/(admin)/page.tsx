"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const topPlayers = [
  { rank: 1, name: "Aether Veyl", theme: "Demon King Throne", points: 1280, icon: "♛" },
  { rank: 2, name: "Qin Shi Huang", theme: "Moonlit Royal Knight", points: 1045, icon: "◆" },
  { rank: 3, name: "Anila van Haldegar", theme: "Arcane Star Seeker", points: 890, icon: "✦" },
];

const questStats = [
  { label: "Common", value: "128", points: "10 pts" },
  { label: "Uncommon", value: "74", points: "25 pts" },
  { label: "Dangerous", value: "21", points: "60 pts" },
  { label: "Special", value: "9", points: "120 pts" },
];

const shortcuts = [
  { title: "Adventurer ID", href: "/profile", icon: "🪪" },
  { title: "Cosmetic Shop", href: "/buttons", icon: "✦" },
  { title: "Fortune Hall", href: "/calendar", icon: "🎲" },
  { title: "Admin Panel", href: "/basic-tables", icon: "⚜" },
];

export default function LunariaDashboard() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const updateClock = () => {
      setTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen rounded-[28px] border border-amber-500/20 bg-[#050611] p-5 text-slate-100 shadow-[0_0_60px_rgba(245,158,11,0.08)]">
      <section className="rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-black via-slate-950 to-violet-950 p-6 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
              Lunaria RolePlay Guild System
            </p>
            <h1 className="text-4xl font-black text-white">
              Guild Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Command center untuk registrasi adventurer, ID card, leaderboard,
              cosmetic premium, fortune hall, dan currency RP komunitas Lunaria.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-400/25 bg-black/35 p-5 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
              Real-Time Guild Clock
            </p>
            <p className="mt-3 text-4xl font-black tabular-nums text-white">
              {time}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Adventurer activity monitor
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-amber-400/20 bg-black/40 p-3 text-sm text-amber-200">
          ✦ Guild Notice: Registration approval uses admin access code. Top leaderboard effects are exclusive. Cosmetic purchases use RP currency only. ✦
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {questStats.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {item.label} Quest
            </p>
            <p className="mt-3 text-4xl font-black text-amber-300">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-slate-400">{item.points} each</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-[28px] border border-amber-400/20 bg-black/35 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
                Top Adventurers
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Quest Leaderboard
              </h2>
            </div>
            <Link
              href="/line-chart"
              className="rounded-full border border-amber-400/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300"
            >
              View
            </Link>
          </div>

          <div className="space-y-4">
            {topPlayers.map((player) => (
              <div
                key={player.rank}
                className="flex items-center justify-between rounded-3xl border border-amber-400/20 bg-gradient-to-r from-slate-950 via-black to-amber-950/30 p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-2xl text-amber-300">
                    {player.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Top {player.rank} • {player.theme}
                    </p>
                    <p className="mt-1 text-lg font-black text-white">
                      {player.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-300">
                    {player.points}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Points
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 rounded-[28px] border border-violet-400/20 bg-black/35 p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
            Guild Economy
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Currency Control
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Total Silver Flow</p>
              <p className="mt-2 text-3xl font-black text-amber-300">12,450 S</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Cosmetic Sales</p>
              <p className="mt-2 text-3xl font-black text-emerald-300">86 Items</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Fortune Hall Risk</p>
              <p className="mt-2 text-3xl font-black text-red-300">Controlled</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {shortcuts.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-400/30 hover:bg-amber-500/10"
          >
            <p className="text-3xl">{item.icon}</p>
            <p className="mt-4 text-lg font-black text-white">{item.title}</p>
            <p className="mt-2 text-sm text-slate-400">
              Open {item.title} module.
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
