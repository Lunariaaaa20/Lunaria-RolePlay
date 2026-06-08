"use client";

import React, { useMemo } from "react";

const adventurers = [
  {
    id: "ADV-003",
    name: "Anila van Haldegar",
    rank: "Warden",
    pathway: "Shadow",
    common: 15,
    uncommon: 5,
    dangerous: 3,
    special: 1,
    silver: 76,
  },
  {
    id: "ADV-002",
    name: "Qin Shi Huang",
    rank: "Seeker",
    pathway: "Warrior",
    common: 9,
    uncommon: 7,
    dangerous: 2,
    special: 0,
    silver: 42,
  },
  {
    id: "ADV-001",
    name: "Aether Veyl",
    rank: "Initiate",
    pathway: "Mystic",
    common: 12,
    uncommon: 4,
    dangerous: 1,
    special: 0,
    silver: 10,
  },
  {
    id: "ADV-004",
    name: "Vesper Lune",
    rank: "Seeker",
    pathway: "Nature",
    common: 8,
    uncommon: 3,
    dangerous: 1,
    special: 0,
    silver: 35,
  },
  {
    id: "ADV-005",
    name: "Denia Nocturne",
    rank: "Initiate",
    pathway: "Shadow",
    common: 6,
    uncommon: 2,
    dangerous: 0,
    special: 0,
    silver: 22,
  },
];

const pointRules = [
  { label: "Common", value: "10 pts", color: "text-emerald-300" },
  { label: "Uncommon", value: "25 pts", color: "text-sky-300" },
  { label: "Dangerous", value: "60 pts", color: "text-red-300" },
  { label: "Special", value: "120 pts", color: "text-amber-300" },
];

function calculatePoints(player: {
  common: number;
  uncommon: number;
  dangerous: number;
  special: number;
}) {
  return (
    player.common * 10 +
    player.uncommon * 25 +
    player.dangerous * 60 +
    player.special * 120
  );
}

function getTopTheme(rank: number) {
  if (rank === 1) {
    return {
      title: "Demon King Throne",
      icon: "♛",
      className:
        "border-amber-400/40 bg-gradient-to-br from-red-950/80 via-black to-amber-950/40 shadow-[0_0_55px_rgba(245,158,11,0.20)]",
      glow: "bg-amber-400/20",
      text: "text-amber-300",
    };
  }

  if (rank === 2) {
    return {
      title: "Moonlit Royal Knight",
      icon: "◆",
      className:
        "border-sky-300/30 bg-gradient-to-br from-slate-950 via-blue-950/45 to-black shadow-[0_0_45px_rgba(96,165,250,0.16)]",
      glow: "bg-sky-300/20",
      text: "text-sky-300",
    };
  }

  return {
    title: "Arcane Star Seeker",
    icon: "✦",
    className:
      "border-violet-300/30 bg-gradient-to-br from-violet-950/70 via-black to-amber-950/25 shadow-[0_0_45px_rgba(168,85,247,0.16)]",
    glow: "bg-violet-300/20",
    text: "text-violet-300",
  };
}

export default function LunariaLeaderboardPage() {
  const rankedPlayers = useMemo(() => {
    return [...adventurers]
      .map((player) => ({
        ...player,
        points: calculatePoints(player),
      }))
      .sort((a, b) => b.points - a.points);
  }, []);

  const topThree = rankedPlayers.slice(0, 3);
  const totalPoints = rankedPlayers.reduce((sum, player) => sum + player.points, 0);
  const totalQuests = rankedPlayers.reduce(
    (sum, player) =>
      sum + player.common + player.uncommon + player.dangerous + player.special,
    0
  );

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          Lunaria Quest Ranking
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Ranking otomatis berdasarkan jumlah quest selesai. Top 1, Top 2,
              dan Top 3 mendapat visual eksklusif yang tidak tersedia di
              Cosmetic Shop.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
            Exclusive Top Effect
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pointRules.map((rule) => (
          <div
            key={rule.label}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {rule.label} Quest
            </p>
            <p className={`mt-3 text-3xl font-black ${rule.color}`}>
              {rule.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {topThree.map((player, index) => {
          const rank = index + 1;
          const theme = getTopTheme(rank);

          return (
            <div
              key={player.id}
              className={`relative overflow-hidden rounded-[32px] border p-6 ${theme.className} ${
                rank === 1 ? "xl:col-span-12" : "xl:col-span-6"
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${theme.glow}`}
              />

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/20 bg-black/35 text-4xl">
                    {theme.icon}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                      Top {rank} • {theme.title}
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-white">
                      {player.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {player.rank} • {player.pathway}
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className={`text-5xl font-black ${theme.text}`}>
                    {player.points}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                    Total Points
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <QuestMini label="Common" value={player.common} />
                <QuestMini label="Uncommon" value={player.uncommon} />
                <QuestMini label="Dangerous" value={player.dangerous} />
                <QuestMini label="Special" value={player.special} />
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-[32px] border border-amber-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)] xl:col-span-4">
          <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
            Ranking Summary
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Guild Performance
          </h2>

          <div className="mt-6 space-y-4">
            <SummaryBox label="Active Ranked Players" value={String(rankedPlayers.length)} />
            <SummaryBox label="Total Completed Quests" value={String(totalQuests)} />
            <SummaryBox label="Total Guild Points" value={String(totalPoints)} />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)] xl:col-span-8">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
                Full Ranking
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Adventurer Leaderboard Table
              </h2>
            </div>

            <p className="text-sm text-slate-400">
              Data masih static. Setelah Supabase aktif, ranking akan otomatis.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Guild Rank</th>
                  <th className="px-4 py-2">Pathway</th>
                  <th className="px-4 py-2">Quest Record</th>
                  <th className="px-4 py-2">Points</th>
                </tr>
              </thead>

              <tbody>
                {rankedPlayers.map((player, index) => (
                  <tr
                    key={player.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] text-sm"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-black text-white">
                      {player.name}
                    </td>
                    <td className="px-4 py-4 text-slate-300">{player.rank}</td>
                    <td className="px-4 py-4 text-slate-300">{player.pathway}</td>
                    <td className="px-4 py-4 text-slate-400">
                      C {player.common} / U {player.uncommon} / D{" "}
                      {player.dangerous} / S {player.special}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 font-black text-emerald-300">
                      {player.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function QuestMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-amber-300">{value}</p>
    </div>
  );
}
