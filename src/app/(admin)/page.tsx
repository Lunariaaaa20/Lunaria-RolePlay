"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PlayerRow = Record<string, unknown>;

type DashboardPlayer = {
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

type CurrencyLogRow = {
  id: string;
  silver_change: number;
  type?: string;
  reason?: string;
  created_at?: string;
};

type PlayerCosmeticRow = {
  id: string;
};

type FortuneLogRow = {
  id: string;
  silver_change: number;
};

const questStatsStatic = [
  { label: "Common", points: "10 pts", color: "text-emerald-300" },
  { label: "Uncommon", points: "25 pts", color: "text-sky-300" },
  { label: "Dangerous", points: "60 pts", color: "text-red-300" },
  { label: "Special", points: "120 pts", color: "text-amber-300" },
];

const shortcuts = [
  { title: "Adventurer ID", href: "/profile", icon: "🪪" },
  { title: "Cosmetic Shop", href: "/buttons", icon: "✦" },
  { title: "Fortune Hall", href: "/calendar", icon: "🎲" },
  { title: "Admin Panel", href: "/basic-tables", icon: "⚜" },
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

function mapPlayer(row: PlayerRow): DashboardPlayer {
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

  const questPoints = calculateQuestPoints({
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

  let points = questPoints;
  let scoreSource: DashboardPlayer["scoreSource"] = "Quest Points";

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
      theme: "Demon King Throne",
      icon: "♛",
      className:
        "border-amber-400/25 bg-gradient-to-r from-red-950/50 via-black to-amber-950/40",
      iconClass: "border-amber-400/30 bg-amber-500/10 text-amber-300",
      pointsClass: "text-amber-300",
    };
  }

  if (rank === 2) {
    return {
      theme: "Celestial Knight Seat",
      icon: "◆",
      className:
        "border-sky-400/20 bg-gradient-to-r from-blue-950/40 via-black to-slate-950",
      iconClass: "border-sky-400/30 bg-sky-500/10 text-sky-300",
      pointsClass: "text-sky-300",
    };
  }

  return {
    theme: "Arcane Noble Crown",
    icon: "✦",
    className:
      "border-violet-400/20 bg-gradient-to-r from-violet-950/50 via-black to-amber-950/20",
    iconClass: "border-violet-400/30 bg-violet-500/10 text-violet-300",
    pointsClass: "text-violet-300",
  };
}

export default function LunariaDashboard() {
  const [time, setTime] = useState("--:--:--");
  const [players, setPlayers] = useState<DashboardPlayer[]>([]);
  const [currencyLogs, setCurrencyLogs] = useState<CurrencyLogRow[]>([]);
  const [cosmeticSales, setCosmeticSales] = useState(0);
  const [fortuneLogs, setFortuneLogs] = useState<FortuneLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const rankedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.special !== a.special) return b.special - a.special;
      if (b.dangerous !== a.dangerous) return b.dangerous - a.dangerous;
      if (b.uncommon !== a.uncommon) return b.uncommon - a.uncommon;
      if (b.common !== a.common) return b.common - a.common;
      return b.silver - a.silver;
    });
  }, [players]);

  const topPlayers = rankedPlayers.slice(0, 3);

  const totalQuestStats = useMemo(() => {
    return {
      common: players.reduce((sum, player) => sum + player.common, 0),
      uncommon: players.reduce((sum, player) => sum + player.uncommon, 0),
      dangerous: players.reduce((sum, player) => sum + player.dangerous, 0),
      special: players.reduce((sum, player) => sum + player.special, 0),
    };
  }, [players]);

  const questStats = [
    {
      label: "Common",
      value: totalQuestStats.common,
      points: questStatsStatic[0].points,
      color: questStatsStatic[0].color,
    },
    {
      label: "Uncommon",
      value: totalQuestStats.uncommon,
      points: questStatsStatic[1].points,
      color: questStatsStatic[1].color,
    },
    {
      label: "Dangerous",
      value: totalQuestStats.dangerous,
      points: questStatsStatic[2].points,
      color: questStatsStatic[2].color,
    },
    {
      label: "Special",
      value: totalQuestStats.special,
      points: questStatsStatic[3].points,
      color: questStatsStatic[3].color,
    },
  ];

  const totalSilver = useMemo(() => {
    return players.reduce((sum, player) => sum + player.silver, 0);
  }, [players]);

  const totalCurrencyFlow = useMemo(() => {
    if (!currencyLogs.length) return totalSilver;

    return currencyLogs.reduce(
      (sum, log) => sum + Math.abs(Number(log.silver_change) || 0),
      0
    );
  }, [currencyLogs, totalSilver]);

  const fortuneRisk = useMemo(() => {
    const negativeLogs = fortuneLogs.filter((log) => Number(log.silver_change) < 0);
    const positiveLogs = fortuneLogs.filter((log) => Number(log.silver_change) > 0);

    if (!fortuneLogs.length) return "Standby";
    if (negativeLogs.length >= positiveLogs.length) return "Controlled";
    return "Watch";
  }, [fortuneLogs]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("*");

    if (playerError) {
      setPlayers([]);
      setIsLoading(false);
      setErrorMessage(`Gagal membaca player dashboard: ${playerError.message}`);
      return;
    }

    const mappedPlayers = ((playerData as PlayerRow[] | null) || [])
      .map(mapPlayer)
      .filter((player) => player.status.toLowerCase() !== "inactive");

    const { data: currencyData } = await supabase
      .from("currency_logs")
      .select("id, silver_change, type, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: cosmeticData } = await supabase
      .from("player_cosmetics")
      .select("id");

    const { data: fortuneData } = await supabase
      .from("fortune_logs")
      .select("id, silver_change")
      .order("created_at", { ascending: false })
      .limit(50);

    setPlayers(mappedPlayers);
    setCurrencyLogs((currencyData as CurrencyLogRow[] | null) || []);
    setCosmeticSales(((cosmeticData as PlayerCosmeticRow[] | null) || []).length);
    setFortuneLogs((fortuneData as FortuneLogRow[] | null) || []);
    setIsLoading(false);
  };

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

  useEffect(() => {
    loadDashboardData();

    const playersChannel = supabase
      .channel("lunaria-dashboard-players")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const cosmeticsChannel = supabase
      .channel("lunaria-dashboard-cosmetics")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_cosmetics",
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const fortuneChannel = supabase
      .channel("lunaria-dashboard-fortune")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fortune_logs",
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(cosmeticsChannel);
      supabase.removeChannel(fortuneChannel);
    };
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
          ✦ Guild Notice: Registration approval uses admin access code. Top
          leaderboard effects are exclusive. Cosmetic purchases use RP currency
          only. ✦
        </div>
      </section>

      {errorMessage ? (
        <section className="mt-6 rounded-[24px] border border-red-400/25 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="mt-6 rounded-[24px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Syncing dashboard data...</p>
        </section>
      ) : null}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {questStats.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {item.label} Quest
            </p>
            <p className={`mt-3 text-4xl font-black ${item.color}`}>
              {item.value}
            </p>
            <p className="mt-2 text-sm text-slate-400">{item.points} each</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-[28px] border border-amber-400/20 bg-black/35 p-6 xl:col-span-7">
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
              className="rounded-full border border-amber-400/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500/10"
            >
              View
            </Link>
          </div>

          <div className="space-y-4">
            {topPlayers.length ? (
              topPlayers.map((player, index) => {
                const rank = index + 1;
                const theme = getTopTheme(rank);

                return (
                  <div
                    key={player.id}
                    className={`flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between ${theme.className}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl ${theme.iconClass}`}
                      >
                        {theme.icon}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          Top {rank} • {theme.theme}
                        </p>
                        <p className="mt-1 text-lg font-black text-white">
                          {player.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {player.rank} • {player.pathway}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className={`text-2xl font-black ${theme.pointsClass}`}>
                        {player.points}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {player.scoreSource}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
                Belum ada player aktif.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-violet-400/20 bg-black/35 p-6 xl:col-span-5">
          <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
            Guild Economy
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Currency Control
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Total Silver Flow</p>
              <p className="mt-2 text-3xl font-black text-amber-300">
                {totalCurrencyFlow.toLocaleString("id-ID")}S
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Cosmetic Sales</p>
              <p className="mt-2 text-3xl font-black text-emerald-300">
                {cosmeticSales} Items
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Fortune Hall Risk</p>
              <p
                className={`mt-2 text-3xl font-black ${
                  fortuneRisk === "Controlled"
                    ? "text-emerald-300"
                    : fortuneRisk === "Watch"
                    ? "text-red-300"
                    : "text-slate-300"
                }`}
              >
                {fortuneRisk}
              </p>
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
