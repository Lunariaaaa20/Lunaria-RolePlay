"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  bronzeToCurrency,
  currencyToBronze,
  formatCurrency,
  normalizeCurrency,
} from "@/lib/lunariaCurrency";

type Player = {
  id: string;
  character_name: string;
  race: string;
  guild_rank: string;
  pathway: string;
  gold: number;
  silver: number;
  bronze: number;
  common_quests: number;
  uncommon_quests: number;
  dangerous_quests: number;
  special_quests: number;
  status: string;
  photo_url: string;
  created_at: string;
};

type RankedPlayer = Player & {
  points: number;
  standingScore: number;
};

const questRules = [
  {
    label: "Common",
    value: "10 pts",
    desc: "Basic guild decree",
    tone: "text-emerald-300",
    border: "border-emerald-400/20",
    bg: "from-emerald-500/10",
    icon: <LeafIcon />,
  },
  {
    label: "Uncommon",
    value: "25 pts",
    desc: "Moonlit field order",
    tone: "text-sky-300",
    border: "border-sky-400/20",
    bg: "from-sky-500/10",
    icon: <CrystalIcon />,
  },
  {
    label: "Dangerous",
    value: "60 pts",
    desc: "High-risk expedition",
    tone: "text-red-300",
    border: "border-red-400/20",
    bg: "from-red-500/10",
    icon: <BladeIcon />,
  },
  {
    label: "Special",
    value: "120 pts",
    desc: "Royal guild mandate",
    tone: "text-amber-300",
    border: "border-amber-400/20",
    bg: "from-amber-500/10",
    icon: <CrownIcon />,
  },
];

function calculatePoints(player: {
  common_quests: number;
  uncommon_quests: number;
  dangerous_quests: number;
  special_quests: number;
}) {
  return (
    Number(player.common_quests || 0) * 10 +
    Number(player.uncommon_quests || 0) * 25 +
    Number(player.dangerous_quests || 0) * 60 +
    Number(player.special_quests || 0) * 120
  );
}

function getPlayerCurrency(player: Pick<Player, "gold" | "silver" | "bronze">) {
  return normalizeCurrency({
    gold: player.gold,
    silver: player.silver,
    bronze: player.bronze,
  });
}

function normalizePlayerCurrency(player: Player): Player {
  const normalized = getPlayerCurrency(player);

  return {
    ...player,
    gold: normalized.gold,
    silver: normalized.silver,
    bronze: normalized.bronze,
  };
}

function getStandingScore(player: Player) {
  const points = calculatePoints(player);

  if (points > 0) return points;

  return currencyToBronze(getPlayerCurrency(player));
}

function getTopTheme(rank: number) {
  if (rank === 1) {
    return {
      title: "Moon Sovereign Throne",
      badge: "Eclipse Crown Bearer",
      label: "TOP 1",
      icon: <RoyalCrownIcon />,
      nameClass:
        "bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(252,211,77,0.45)]",
      numberClass:
        "bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(252,211,77,0.50)]",
      cardClass:
        "border-amber-300/35 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_42%),linear-gradient(135deg,rgba(69,26,3,0.55),rgba(2,6,23,0.92),rgba(30,27,75,0.55))] shadow-[0_0_80px_rgba(245,158,11,0.16)]",
      glowClass: "bg-amber-300/25",
      ringClass: "border-amber-300/35 bg-amber-400/10 text-amber-200",
      accent: "text-amber-300",
      line: "from-transparent via-amber-300/40 to-transparent",
    };
  }

  if (rank === 2) {
    return {
      title: "Silvermoon Knight Seat",
      badge: "Celestial Runner-Up",
      label: "TOP 2",
      icon: <MoonIcon />,
      nameClass:
        "bg-gradient-to-r from-sky-100 via-cyan-300 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(56,189,248,0.42)]",
      numberClass:
        "bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.45)]",
      cardClass:
        "border-sky-300/28 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_42%),linear-gradient(135deg,rgba(8,47,73,0.55),rgba(2,6,23,0.94),rgba(15,23,42,0.8))] shadow-[0_0_70px_rgba(14,165,233,0.13)]",
      glowClass: "bg-sky-300/22",
      ringClass: "border-sky-300/30 bg-sky-400/10 text-sky-200",
      accent: "text-sky-300",
      line: "from-transparent via-sky-300/35 to-transparent",
    };
  }

  return {
    title: "Astral Noble Crown",
    badge: "Arcane Prestige Holder",
    label: "TOP 3",
    icon: <StarIcon />,
    nameClass:
      "bg-gradient-to-r from-violet-100 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(217,70,239,0.36)]",
    numberClass:
      "bg-gradient-to-r from-purple-200 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.45)]",
    cardClass:
      "border-violet-300/28 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.14),transparent_42%),linear-gradient(135deg,rgba(59,7,100,0.55),rgba(2,6,23,0.94),rgba(30,27,75,0.75))] shadow-[0_0_70px_rgba(168,85,247,0.13)]",
    glowClass: "bg-violet-300/22",
    ringClass: "border-violet-300/30 bg-violet-400/10 text-violet-200",
    accent: "text-violet-300",
    line: "from-transparent via-violet-300/35 to-transparent",
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export default function LunariaLeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPlayers = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setNotice("");

    const { data, error } = await supabase
      .from("players")
      .select(
        `
        id,
        character_name,
        race,
        guild_rank,
        pathway,
        gold,
        silver,
        bronze,
        common_quests,
        uncommon_quests,
        dangerous_quests,
        special_quests,
        status,
        photo_url,
        created_at
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPlayers(((data || []) as Player[]).map(normalizePlayerCurrency));
    setNotice("Ranking berhasil disinkronkan dengan Guild Registry.");
    setTimeout(() => setNotice(""), 2600);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const rankedPlayers = useMemo<RankedPlayer[]>(() => {
    return [...players]
      .map((player) => ({
        ...player,
        points: calculatePoints(player),
        standingScore: getStandingScore(player),
      }))
      .sort((a, b) => b.standingScore - a.standingScore);
  }, [players]);

  const topThree = rankedPlayers.slice(0, 3);

  const totalQuests = rankedPlayers.reduce(
    (sum, player) =>
      sum +
      Number(player.common_quests || 0) +
      Number(player.uncommon_quests || 0) +
      Number(player.dangerous_quests || 0) +
      Number(player.special_quests || 0),
    0
  );

  const totalPoints = rankedPlayers.reduce(
    (sum, player) => sum + player.points,
    0
  );

  const totalBalance = bronzeToCurrency(
    rankedPlayers.reduce(
      (sum, player) => sum + currencyToBronze(getPlayerCurrency(player)),
      0
    )
  );

  return (
    <main className="space-y-6 text-slate-100">
      <section className="relative overflow-hidden rounded-[34px] border border-amber-400/20 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_33%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.24),transparent_42%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(3,7,18,0.98),rgba(30,27,75,0.82))] p-6 shadow-[0_0_80px_rgba(245,158,11,0.10)] md:p-8">
        <AnimatedMoonDust />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2">
              <MoonIcon />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-300">
                Lunaria Throne Board
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
              Leaderboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Papan kehormatan resmi Lunaria. Mereka yang berada di puncak tidak
              hanya membawa angka, tetapi membawa nama, aura, dan prestige yang
              terlihat oleh seluruh guild.
            </p>
          </div>

          <button
            onClick={fetchPlayers}
            disabled={isLoading}
            className="group relative overflow-hidden rounded-[22px] border border-amber-300/30 bg-gradient-to-r from-amber-500/18 via-black/20 to-violet-500/18 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 shadow-[0_0_36px_rgba(245,158,11,0.10)] transition hover:border-amber-200/50 hover:shadow-[0_0_45px_rgba(245,158,11,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
            <span className="relative z-10">
              {isLoading ? "Syncing..." : "Refresh Ranking"}
            </span>
          </button>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {questRules.map((rule) => (
            <div
              key={rule.label}
              className={`group relative overflow-hidden rounded-[26px] border ${rule.border} bg-gradient-to-br ${rule.bg} via-white/[0.035] to-black/20 p-5`}
            >
              <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-slate-200 transition group-hover:scale-105">
                {rule.icon}
              </div>

              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-slate-500">
                {rule.label} Quest
              </p>

              <p className={`mt-5 text-3xl font-black ${rule.tone}`}>
                {rule.value}
              </p>

              <p className="mt-2 text-xs font-semibold text-slate-500">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {notice ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
          {notice}
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-4 text-sm font-bold text-red-200">
          Failed to load leaderboard: {errorMessage}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Ranked Souls"
          value={formatNumber(rankedPlayers.length)}
          desc="Active adventurers"
          tone="text-emerald-300"
          icon={<UserSealIcon />}
        />
        <SummaryCard
          label="Completed Decrees"
          value={formatNumber(totalQuests)}
          desc="All quest records"
          tone="text-sky-300"
          icon={<ScrollIcon />}
        />
        <SummaryCard
          label="Lunar Prestige"
          value={formatNumber(totalPoints)}
          desc="Quest-based honor"
          tone="text-violet-300"
          icon={<StarIcon />}
        />
        <SummaryCard
          label="Guild Balance"
          value={formatCurrency(totalBalance)}
          desc="Active economy pool"
          tone="text-amber-300"
          icon={<MoonIcon />}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="relative overflow-hidden rounded-[34px] border border-amber-400/18 bg-black/35 p-5 shadow-[0_0_65px_rgba(15,23,42,0.45)] md:p-6">
            <AnimatedMoonDust />

            <div className="relative z-10 mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-300">
                  Moon Throne Registry
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">
                  Top Adventurers
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Top 1, Top 2, dan Top 3 mendapatkan visual aura eksklusif,
                  throne frame, dan prestige badge yang tidak tersedia di
                  Cosmetic Shop.
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-amber-400/25 bg-amber-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-amber-300 transition hover:bg-amber-500/15"
              >
                <CrownIcon />
                Guild Hall
              </Link>
            </div>

            <div className="relative z-10 space-y-5">
              {isLoading ? (
                <LoadingThrone />
              ) : topThree.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-slate-400">
                  Belum ada adventurer aktif di leaderboard.
                </div>
              ) : (
                topThree.map((player, index) => (
                  <TopPlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <section className="rounded-[34px] border border-violet-400/18 bg-black/35 p-6 shadow-[0_0_55px_rgba(15,23,42,0.35)]">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-violet-300">
              Lunaria Signature
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Guild Benefits
            </h2>

            <div className="mt-6 space-y-4">
              <BenefitItem
                icon={<ShieldIcon />}
                title="Moonbound Identity"
                text="Setiap adventurer memiliki ID Card resmi yang terasa seperti lisensi kerajaan Lunaria."
              />
              <BenefitItem
                icon={<CrownIcon />}
                title="Eclipse Rank Prestige"
                text="Top leaderboard bukan sekadar angka, tapi simbol status dan kehormatan di dalam guild."
              />
              <BenefitItem
                icon={<MoonIcon />}
                title="Balanced Economy"
                text="Gold, Silver, Bronze, quest, fortune, dan cosmetic terhubung sebagai ekonomi RP yang hidup."
              />
              <BenefitItem
                icon={<KeyIcon />}
                title="Guildmaster Control"
                text="Admin tetap mengatur reward, rank, status, dan progress agar dunia RP tetap stabil."
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[34px] border border-amber-400/18 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_35%),linear-gradient(135deg,rgba(0,0,0,0.55),rgba(15,23,42,0.75))] p-6">
            <AnimatedMoonDust />

            <div className="relative z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-300">
                Current Vessel
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Ranking Logic
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Ranking utama memakai quest points. Kalau point masih 0, sistem
                memakai total balance sebagai fallback agar player baru tetap
                bisa terlihat di board.
              </p>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Formula
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-200">
                  Common × 10 + Uncommon × 25 + Dangerous × 60 + Special × 120
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[34px] border border-white/10 bg-black/35 p-5 shadow-[0_0_60px_rgba(15,23,42,0.40)] md:p-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-300">
              Full Ranking
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white">
              Adventurer Leaderboard Table
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-400">
            Data akan berubah otomatis setelah admin update quest record,
            currency, atau status player dari Admin Panel.
          </p>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.24em] text-slate-500">
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Guild Rank</th>
                <th className="px-4 py-2">Pathway</th>
                <th className="px-4 py-2">Quest Record</th>
                <th className="px-4 py-2">Currency</th>
                <th className="px-4 py-2">Prestige</th>
              </tr>
            </thead>

            <tbody>
              {rankedPlayers.map((player, index) => {
                const rank = index + 1;
                const topTheme = rank <= 3 ? getTopTheme(rank) : null;

                return (
                  <tr
                    key={player.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] text-sm transition hover:bg-white/[0.065]"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      <span
                        className={`inline-flex min-w-12 items-center justify-center rounded-full border px-3 py-1 text-xs font-black ${
                          topTheme
                            ? topTheme.ringClass
                            : "border-white/10 bg-white/[0.04] text-slate-300"
                        }`}
                      >
                        #{rank}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p
                        className={`font-black ${
                          topTheme ? topTheme.nameClass : "text-white"
                        }`}
                      >
                        {player.character_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {player.race}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {player.guild_rank}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {player.pathway}
                    </td>

                    <td className="px-4 py-4 text-slate-400">
                      C {player.common_quests || 0} / U{" "}
                      {player.uncommon_quests || 0} / D{" "}
                      {player.dangerous_quests || 0} / S{" "}
                      {player.special_quests || 0}
                    </td>

                    <td className="px-4 py-4 font-black text-amber-300">
                      {formatCurrency(getPlayerCurrency(player))}
                    </td>

                    <td className="rounded-r-2xl px-4 py-4 font-black text-emerald-300">
                      {player.points > 0
                        ? `${formatNumber(player.points)} pts`
                        : `${formatCurrency(
                            getPlayerCurrency(player)
                          )} standing`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!isLoading && rankedPlayers.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-slate-400">
              Belum ada active player untuk ditampilkan.
            </div>
          ) : null}
        </div>
      </section>

      <style jsx>{`
        @keyframes lunaria-float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.75;
          }
          50% {
            transform: translateY(-10px) scale(1.04);
            opacity: 1;
          }
        }

        @keyframes lunaria-shimmer {
          0% {
            transform: translateX(-140%);
          }
          100% {
            transform: translateX(140%);
          }
        }

        @keyframes lunaria-pulse {
          0%,
          100% {
            opacity: 0.22;
          }
          50% {
            opacity: 0.6;
          }
        }

        .lunaria-float {
          animation: lunaria-float 5.5s ease-in-out infinite;
        }

        .lunaria-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-140%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.11),
            transparent
          );
          animation: lunaria-shimmer 4.2s ease-in-out infinite;
        }

        .lunaria-pulse {
          animation: lunaria-pulse 3.8s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

function TopPlayerCard({
  player,
  rank,
}: {
  player: RankedPlayer;
  rank: number;
}) {
  const theme = getTopTheme(rank);
  const currency = getPlayerCurrency(player);

  return (
    <article
      className={`group lunaria-shimmer relative overflow-hidden rounded-[32px] border p-5 transition duration-300 hover:-translate-y-1 hover:scale-[1.005] md:p-6 ${theme.cardClass}`}
    >
      <div
        className={`pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl ${theme.glowClass}`}
      />
      <div
        className={`pointer-events-none absolute -bottom-20 left-1/2 h-32 w-72 -translate-x-1/2 rounded-full blur-3xl ${theme.glowClass}`}
      />
      <div
        className={`pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r ${theme.line}`}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 md:gap-5">
          <div
            className={`lunaria-float flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] border text-3xl md:h-24 md:w-24 md:text-4xl ${theme.ringClass}`}
          >
            {theme.icon}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${theme.ringClass}`}
              >
                {theme.label}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                {theme.title}
              </span>
            </div>

            <h3
              className={`mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl ${theme.nameClass}`}
            >
              {player.character_name}
            </h3>

            <p className="mt-2 text-sm font-semibold text-slate-400">
              {player.guild_rank} • {player.pathway} • {player.race}
            </p>

            <p
              className={`mt-2 text-xs font-black uppercase tracking-[0.18em] ${theme.accent}`}
            >
              {theme.badge}
            </p>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className={`text-5xl font-black md:text-6xl ${theme.numberClass}`}>
            {player.points > 0
              ? formatNumber(player.points)
              : formatCurrency(currency)}
          </p>

          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
            {player.points > 0 ? "Quest Points" : "Balance Standing"}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MiniQuest label="Common" value={player.common_quests || 0} />
        <MiniQuest label="Uncommon" value={player.uncommon_quests || 0} />
        <MiniQuest label="Dangerous" value={player.dangerous_quests || 0} />
        <MiniQuest label="Special" value={player.special_quests || 0} />
        <MiniQuest label="Balance" value={formatCurrency(currency)} />
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  desc,
  tone,
  icon,
}: {
  label: string;
  value: string;
  desc: string;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-400/20 hover:bg-white/[0.055]">
      <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-slate-300 transition group-hover:scale-105">
        {icon}
      </div>

      <p className="text-[11px] font-black uppercase tracking-[0.26em] text-slate-500">
        {label}
      </p>

      <p className={`mt-5 text-4xl font-black ${tone}`}>{value}</p>

      <p className="mt-2 text-sm text-slate-500">{desc}</p>
    </div>
  );
}

function BenefitItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group flex gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition hover:border-amber-400/20 hover:bg-white/[0.06]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-amber-400/25 bg-amber-500/10 text-amber-300">
        {icon}
      </div>

      <div>
        <p className="font-black text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function MiniQuest({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/24 p-4 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function LoadingThrone() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-40 animate-pulse rounded-[32px] border border-white/10 bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

function AnimatedMoonDust() {
  return (
    <>
      <span className="lunaria-pulse pointer-events-none absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-amber-300/50 blur-[1px]" />
      <span className="lunaria-pulse pointer-events-none absolute right-[18%] top-[18%] h-2.5 w-2.5 rounded-full bg-violet-300/40 blur-[1px]" />
      <span className="lunaria-pulse pointer-events-none absolute bottom-[18%] left-[45%] h-2 w-2 rounded-full bg-sky-300/35 blur-[1px]" />
    </>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4.5 17.5h15M6.3 16.8 5 8.5l4.2 3L12 6l2.8 5.5 4.2-3-1.3 8.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RoyalCrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
      <path
        d="M3.7 17.8h16.6M5.6 16.8 4.4 7.2l5 3.9L12 4.6l2.6 6.5 5-3.9-1.2 9.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 20.2h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M19.2 14.8A7.8 7.8 0 0 1 9.2 4.8 8.1 8.1 0 1 0 19.2 14.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3.8 14.2 9.8 20.2 12 14.2 14.2 12 20.2 9.8 14.2 3.8 12 9.8 9.8 12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M19 5c-8.8.2-13 4.4-13 13 8.6-.1 13-4.2 13-13Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 17 15 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CrystalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="m12 3 7 6-7 12L5 9l7-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M5 9h14M12 3v18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BladeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M14 4 20 2l-2 6L8.5 17.5 6.5 15.5 14 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m5 16 3 3M4 20l4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3.5 19 6v5.7c0 4.3-2.8 7.4-7 8.8-4.2-1.4-7-4.5-7-8.8V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M14 10a4 4 0 1 0-2.7 3.8L14 16.5h2.5V19H19v-2.5h2.5V14H19l-2.8-2.8A4 4 0 0 0 14 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserSealIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 13.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4.8 20c.95-3.25 3.4-5 7.2-5s6.25 1.75 7.2 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M7 4h10a2 2 0 0 1 2 2v14H8a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 9h8M8 13h6M8 17h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
