"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type PlayerRow = Record<string, unknown>;

type RankedPlayer = {
  id: string;
  name: string;
  rank: string;
  pathway: string;
  race: string;
  status: string;
  common: number;
  uncommon: number;
  dangerous: number;
  special: number;
  silver: number;
  points: number;
  scoreSource: "Quest Points" | "Total Points" | "Silver Fallback";
};

const pointRules = [
  { label: "Common", value: "10 pts", color: "text-emerald-300" },
  { label: "Uncommon", value: "25 pts", color: "text-sky-300" },
  { label: "Dangerous", value: "60 pts", color: "text-red-300" },
  { label: "Special", value: "120 pts", color: "text-amber-300" },
];

function getText(row: PlayerRow, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function getNumber(row: PlayerRow, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function calculateQuestPoints(player: {
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

function mapPlayer(row: PlayerRow): RankedPlayer {
  const common = getNumber(row, [
    "common_quest",
    "common_quests",
    "common",
    "quest_common",
    "completed_common",
  ]);

  const uncommon = getNumber(row, [
    "uncommon_quest",
    "uncommon_quests",
    "uncommon",
    "quest_uncommon",
    "completed_uncommon",
  ]);

  const dangerous = getNumber(row, [
    "dangerous_quest",
    "dangerous_quests",
    "dangerous",
    "quest_dangerous",
    "completed_dangerous",
  ]);

  const special = getNumber(row, [
    "special_quest",
    "special_quests",
    "special",
    "quest_special",
    "completed_special",
  ]);

  const silver = getNumber(row, ["silver", "currency", "balance"]);

  const calculatedPoints = calculateQuestPoints({
    common,
    uncommon,
    dangerous,
    special,
  });

  const explicitPoints = getNumber(row, [
    "total_points",
    "points",
    "leaderboard_points",
    "score",
  ]);

  let points = calculatedPoints;
  let scoreSource: RankedPlayer["scoreSource"] = "Quest Points";

  if (explicitPoints > 0) {
    points = explicitPoints;
    scoreSource = "Total Points";
  }

  if (points <= 0 && silver > 0) {
    points = silver;
    scoreSource = "Silver Fallback";
  }

  return {
    id: getText(row, ["id", "player_id"], crypto.randomUUID()),
    name: getText(row, ["character_name", "name", "username"], "Unknown Adventurer"),
    rank: getText(row, ["guild_rank", "rank"], "Initiate"),
    pathway: getText(row, ["pathway", "class"], "Unknown"),
    race: getText(row, ["race"], "Unknown"),
    status: getText(row, ["status"], "active"),
    common,
    uncommon,
    dangerous,
    special,
    silver,
    points,
    scoreSource,
  };
}

function getTopTheme(rank: number) {
  if (rank === 1) {
    return {
      title: "Demon King Throne",
      icon: "♛",
      badge: "TOP 1",
      className:
        "border-amber-400/45 bg-gradient-to-br from-red-950/85 via-black to-amber-950/45 shadow-[0_0_65px_rgba(245,158,11,0.20)]",
      glow: "bg-amber-400/25",
      text: "text-amber-300",
      chip: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    };
  }

  if (rank === 2) {
    return {
      title: "Celestial Knight Seat",
      icon: "◆",
      badge: "TOP 2",
      className:
        "border-sky-300/35 bg-gradient-to-br from-slate-950 via-blue-950/50 to-black shadow-[0_0_50px_rgba(96,165,250,0.16)]",
      glow: "bg-sky-300/20",
      text: "text-sky-300",
      chip: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    };
  }

  return {
    title: "Arcane Noble Crown",
    icon: "✦",
    badge: "TOP 3",
    className:
      "border-violet-300/35 bg-gradient-to-br from-violet-950/75 via-black to-amber-950/25 shadow-[0_0_50px_rgba(168,85,247,0.16)]",
    glow: "bg-violet-300/20",
    text: "text-violet-300",
    chip: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  };
}

export default function LunariaLeaderboardPage() {
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPlayers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.from("players").select("*");

    if (error) {
      setPlayers([]);
      setIsLoading(false);
      setErrorMessage(`Gagal membaca leaderboard: ${error.message}`);
      return;
    }

    const mappedPlayers = ((data as PlayerRow[] | null) || [])
      .map(mapPlayer)
      .filter((player) => player.status.toLowerCase() !== "inactive")
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.special !== a.special) return b.special - a.special;
        if (b.dangerous !== a.dangerous) return b.dangerous - a.dangerous;
        if (b.uncommon !== a.uncommon) return b.uncommon - a.uncommon;
        if (b.common !== a.common) return b.common - a.common;
        return b.silver - a.silver;
      });

    setPlayers(mappedPlayers);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlayers();

    const channel = supabase
      .channel("lunaria-leaderboard-players")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => {
          loadPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const topThree = players.slice(0, 3);

  const totalPoints = useMemo(() => {
    return players.reduce((sum, player) => sum + player.points, 0);
  }, [players]);

  const totalQuests = useMemo(() => {
    return players.reduce(
      (sum, player) =>
        sum +
        player.common +
        player.uncommon +
        player.dangerous +
        player.special,
      0
    );
  }, [players]);

  const totalSilver = useMemo(() => {
    return players.reduce((sum, player) => sum + player.silver, 0);
  }, [players]);

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[32px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_55px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-amber-300">
          Lunaria Quest Ranking
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Ranking otomatis dari data player Supabase. Top 1, Top 2, dan Top
              3 mendapat visual eksklusif yang tidak dijual di Cosmetic Shop.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPlayers}
            disabled={isLoading}
            className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? "Syncing..." : "Refresh Ranking"}
          </button>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[24px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading leaderboard data...</p>
        </section>
      ) : null}

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

      {topThree.length ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {topThree.map((player, index) => {
            const rank = index + 1;
            const theme = getTopTheme(rank);

            return (
              <article
                key={player.id}
                className={`relative overflow-hidden rounded-[34px] border p-6 ${theme.className} ${
                  rank === 1 ? "xl:col-span-12" : "xl:col-span-6"
                }`}
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl ${theme.glow}`}
                />
                <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:36px_36px]" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/20 bg-black/35 text-4xl">
                      <span className="absolute inset-0 rounded-[28px] bg-white/5 blur-xl" />
                      <span className="relative">{theme.icon}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${theme.chip}`}
                        >
                          {theme.badge}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          {theme.title}
                        </span>
                      </div>

                      <h2 className="mt-3 text-3xl font-black text-white">
                        {player.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {player.rank} • {player.pathway} • {player.race}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className={`text-5xl font-black ${theme.text}`}>
                      {player.points}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {player.scoreSource}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <QuestMini label="Common" value={player.common} />
                  <QuestMini label="Uncommon" value={player.uncommon} />
                  <QuestMini label="Dangerous" value={player.dangerous} />
                  <QuestMini label="Special" value={player.special} />
                  <QuestMini label="Silver" value={player.silver} suffix="S" />
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 text-slate-400">
          <p className="text-sm font-bold">
            Belum ada player aktif di leaderboard.
          </p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="rounded-[32px] border border-amber-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)] xl:col-span-4">
          <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
            Ranking Summary
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Guild Performance
          </h2>

          <div className="mt-6 space-y-4">
            <SummaryBox
              label="Active Ranked Players"
              value={String(players.length)}
            />
            <SummaryBox
              label="Total Completed Quests"
              value={String(totalQuests)}
            />
            <SummaryBox label="Total Guild Points" value={String(totalPoints)} />
            <SummaryBox label="Total Guild Silver" value={`${totalSilver}S`} />
          </div>
        </aside>

        <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)] xl:col-span-8">
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
              Data akan ikut berubah saat admin update player di Admin Panel.
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
                  <th className="px-4 py-2">Silver</th>
                  <th className="px-4 py-2">Points</th>
                </tr>
              </thead>

              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] text-sm"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          index === 0
                            ? "border-amber-400/25 bg-amber-500/10 text-amber-300"
                            : index === 1
                            ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
                            : index === 2
                            ? "border-violet-400/25 bg-violet-400/10 text-violet-300"
                            : "border-white/10 bg-white/[0.04] text-slate-300"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-black text-white">{player.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {player.race}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{player.rank}</td>
                    <td className="px-4 py-4 text-slate-300">
                      {player.pathway}
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      C {player.common} / U {player.uncommon} / D{" "}
                      {player.dangerous} / S {player.special}
                    </td>
                    <td className="px-4 py-4 font-black text-amber-300">
                      {player.silver}S
                    </td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <p className="font-black text-emerald-300">
                        {player.points}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                        {player.scoreSource}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function QuestMini({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">
        {value}
        {suffix}
      </p>
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
