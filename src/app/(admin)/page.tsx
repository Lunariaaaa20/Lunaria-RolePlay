"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type LunariaSession = {
  role: "player" | "admin";
  playerId?: string;
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
};

type Player = {
  id: string;
  character_name: string;
  race: string;
  guild_rank: string;
  pathway: string;
  silver: number;
  gold: number;
  bronze: number;
  common_quests: number;
  uncommon_quests: number;
  dangerous_quests: number;
  special_quests: number;
  status: string;
  created_at: string;
};

const pointRules = [
  {
    label: "Common",
    value: 10,
    tone: "text-emerald-300",
    border: "border-emerald-400/20",
    bg: "bg-emerald-400/10",
  },
  {
    label: "Uncommon",
    value: 25,
    tone: "text-sky-300",
    border: "border-sky-400/20",
    bg: "bg-sky-400/10",
  },
  {
    label: "Dangerous",
    value: 60,
    tone: "text-red-300",
    border: "border-red-400/20",
    bg: "bg-red-400/10",
  },
  {
    label: "Special",
    value: 120,
    tone: "text-amber-300",
    border: "border-amber-400/20",
    bg: "bg-amber-400/10",
  },
];

const premiumBenefits = [
  {
    title: "Royal ID Presence",
    subtitle: "ID Card karakter tampil seperti lisensi guild resmi.",
    icon: "⚜",
  },
  {
    title: "Exclusive Top Aura",
    subtitle: "Top leaderboard memiliki tema visual khusus dan tidak dijual di shop.",
    icon: "♛",
  },
  {
    title: "Living Guild Economy",
    subtitle: "Silver, fortune, cosmetic, dan quest record bergerak sebagai sistem RP.",
    icon: "✦",
  },
  {
    title: "Admin-Controlled Progression",
    subtitle: "Rank, reward, dan perkembangan karakter tetap dikurasi admin.",
    icon: "◆",
  },
];

const shortcuts = [
  {
    title: "Adventurer ID Card",
    href: "/profile",
    icon: "🪪",
    text: "Lihat lisensi karakter dan data guild resmi.",
  },
  {
    title: "Quest Leaderboard",
    href: "/line-chart",
    icon: "♛",
    text: "Lihat posisi top adventurer dan efek eksklusif.",
  },
  {
    title: "Cosmetic Shop",
    href: "/buttons",
    icon: "✦",
    text: "Kelola cosmetic premium untuk ID Card.",
  },
  {
    title: "Fortune Hall",
    href: "/calendar",
    icon: "🔮",
    text: "Mini-game RP currency dengan risiko terkontrol.",
  },
];

function getSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const sessionSession = sessionStorage.getItem("lunaria_session");
  const localSession = localStorage.getItem("lunaria_session");
  const raw = sessionSession || localSession;

  if (!raw) return null;

  try {
    return JSON.parse(raw) as LunariaSession;
  } catch {
    localStorage.removeItem("lunaria_session");
    sessionStorage.removeItem("lunaria_session");
    return null;
  }
}

function calculatePoints(player: Player) {
  return (
    player.common_quests * 10 +
    player.uncommon_quests * 25 +
    player.dangerous_quests * 60 +
    player.special_quests * 120
  );
}

function getDisplayScore(player: Player) {
  const points = calculatePoints(player);
  return points > 0 ? points : player.silver;
}

function getDisplayScoreLabel(player: Player) {
  return calculatePoints(player) > 0 ? "Guild Points" : "Silver Fallback";
}

function getTopTheme(rank: number) {
  if (rank === 1) {
    return {
      name: "Demon King Throne",
      icon: "♛",
      badge: "TOP 1",
      card:
        "border-amber-400/35 bg-gradient-to-br from-red-950/55 via-black to-amber-950/35 shadow-[0_0_70px_rgba(245,158,11,0.18)]",
      glow: "bg-amber-400/25",
      text: "text-amber-300",
      ring: "border-amber-300/35 bg-amber-500/10 text-amber-200",
    };
  }

  if (rank === 2) {
    return {
      name: "Celestial Knight Seat",
      icon: "◆",
      badge: "TOP 2",
      card:
        "border-sky-400/30 bg-gradient-to-br from-sky-950/50 via-black to-blue-950/30 shadow-[0_0_60px_rgba(56,189,248,0.14)]",
      glow: "bg-sky-400/20",
      text: "text-sky-300",
      ring: "border-sky-300/30 bg-sky-400/10 text-sky-200",
    };
  }

  return {
    name: "Arcane Noble Crown",
    icon: "✦",
    badge: "TOP 3",
    card:
      "border-violet-400/30 bg-gradient-to-br from-violet-950/55 via-black to-fuchsia-950/25 shadow-[0_0_60px_rgba(168,85,247,0.14)]",
    glow: "bg-violet-400/20",
    text: "text-violet-300",
    ring: "border-violet-300/30 bg-violet-400/10 text-violet-200",
  };
}

function formatTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LunariaDashboard() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [time, setTime] = useState("--:--:--");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const activePlayers = useMemo(() => {
    return players.filter((player) => player.status === "active");
  }, [players]);

  const rankedPlayers = useMemo(() => {
    return [...activePlayers].sort((a, b) => {
      const scoreA = getDisplayScore(a);
      const scoreB = getDisplayScore(b);

      if (scoreB !== scoreA) return scoreB - scoreA;

      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [activePlayers]);

  const topThree = rankedPlayers.slice(0, 3);

  const totalQuest = useMemo(() => {
    return activePlayers.reduce(
      (sum, player) =>
        sum +
        player.common_quests +
        player.uncommon_quests +
        player.dangerous_quests +
        player.special_quests,
      0
    );
  }, [activePlayers]);

  const totalGuildPoints = useMemo(() => {
    return activePlayers.reduce((sum, player) => sum + calculatePoints(player), 0);
  }, [activePlayers]);

  const totalSilver = useMemo(() => {
    return activePlayers.reduce((sum, player) => sum + Number(player.silver || 0), 0);
  }, [activePlayers]);

  const questTotals = useMemo(() => {
    return {
      common: activePlayers.reduce((sum, player) => sum + player.common_quests, 0),
      uncommon: activePlayers.reduce(
        (sum, player) => sum + player.uncommon_quests,
        0
      ),
      dangerous: activePlayers.reduce(
        (sum, player) => sum + player.dangerous_quests,
        0
      ),
      special: activePlayers.reduce((sum, player) => sum + player.special_quests, 0),
    };
  }, [activePlayers]);

  const currentPlayer = useMemo(() => {
    if (!session?.playerId) return null;
    return players.find((player) => player.id === session.playerId) || null;
  }, [players, session?.playerId]);

  const loadDashboard = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    const { data, error } = await supabase
      .from("players")
      .select(
        `
        id,
        character_name,
        race,
        guild_rank,
        pathway,
        silver,
        gold,
        bronze,
        common_quests,
        uncommon_quests,
        dangerous_quests,
        special_quests,
        status,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPlayers((data || []) as Player[]);
  };

  useEffect(() => {
    loadDashboard();

    const timer = window.setInterval(() => {
      setTime(formatTime());
    }, 1000);

    setTime(formatTime());

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="relative space-y-7 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_34%),linear-gradient(135deg,#03040a,#060715_48%,#02030a)]" />

      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:58px_58px]" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="lunaria-orb left-[12%] top-[16%]" />
        <span className="lunaria-orb lunaria-orb-two right-[18%] top-[18%]" />
        <span className="lunaria-orb lunaria-orb-three bottom-[12%] left-[45%]" />
      </div>

      <section className="relative overflow-hidden rounded-[36px] border border-amber-400/25 bg-gradient-to-br from-[#070814] via-[#060817] to-violet-950/60 p-6 shadow-[0_0_90px_rgba(245,158,11,0.12)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_36%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-8">
            <div className="inline-flex rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-amber-300">
              Lunaria Royal Command Hall
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Guild Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Pusat kendali eksklusif komunitas Lunaria. Semua identitas
              adventurer, leaderboard, cosmetic, fortune, dan ekonomi RP
              dirancang seperti sistem guild premium yang terasa hidup.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroPill label="Guild Status" value="Online" tone="text-emerald-300" />
              <HeroPill
                label="Session"
                value={
                  session?.role === "admin"
                    ? "Guild Admin"
                    : currentPlayer?.character_name || "Adventurer"
                }
                tone="text-amber-300"
              />
              <HeroPill label="Realm Access" value="Secured" tone="text-violet-300" />
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-[30px] border border-amber-400/25 bg-black/35 p-5 text-left shadow-[0_0_45px_rgba(245,158,11,0.08)] xl:text-right">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                Real-Time Guild Clock
              </p>
              <p className="mt-3 text-5xl font-black tabular-nums text-white">
                {time}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Activity monitor untuk seluruh modul guild.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-7 overflow-hidden rounded-3xl border border-amber-400/25 bg-black/35 px-5 py-4">
          <div className="lunaria-marquee text-sm font-semibold text-amber-100">
            ✦ Welcome to Lunaria Guild System — ID Card aktif, cosmetic premium,
            leaderboard eksklusif, fortune hall, dan ekonomi RP terkoneksi dalam
            satu sistem guild. ✦
          </div>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-[26px] border border-red-400/25 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">Failed to load dashboard: {errorMessage}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[26px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading royal guild data...</p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RoyalStat
          label="Active Adventurers"
          value={String(activePlayers.length)}
          detail={`${players.length} total registry`}
          tone="text-emerald-300"
        />
        <RoyalStat
          label="Completed Quests"
          value={String(totalQuest)}
          detail="All rank quest records"
          tone="text-sky-300"
        />
        <RoyalStat
          label="Guild Points"
          value={String(totalGuildPoints)}
          detail="Quest-based prestige"
          tone="text-violet-300"
        />
        <RoyalStat
          label="Guild Silver"
          value={`${totalSilver}S`}
          detail="Active economy pool"
          tone="text-amber-300"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-[36px] border border-amber-400/20 bg-black/35 p-6 shadow-[0_0_65px_rgba(15,23,42,0.40)]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                  Royal Prestige Board
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  Top Adventurers
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Top 1, Top 2, dan Top 3 mendapat visual aura eksklusif sebagai
                  benefit status di Lunaria.
                </p>
              </div>

              <Link
                href="/line-chart"
                className="inline-flex rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500/20"
              >
                View Leaderboard
              </Link>
            </div>

            <div className="space-y-5">
              {topThree.length ? (
                topThree.map((player, index) => {
                  const rank = index + 1;
                  const theme = getTopTheme(rank);

                  return (
                    <div
                      key={player.id}
                      className={`relative overflow-hidden rounded-[32px] border p-5 ${theme.card}`}
                    >
                      <div
                        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl ${theme.glow}`}
                      />

                      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-[24px] border text-3xl ${theme.ring}`}
                          >
                            {theme.icon}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${theme.ring}`}
                              >
                                {theme.badge}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                {theme.name}
                              </span>
                            </div>

                            <h3 className="mt-3 text-2xl font-black text-white">
                              {player.character_name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {player.guild_rank} • {player.pathway} • {player.race}
                            </p>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className={`text-5xl font-black ${theme.text}`}>
                            {getDisplayScore(player)}
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            {getDisplayScoreLabel(player)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-slate-400">
                  Belum ada active adventurer untuk leaderboard.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className="rounded-[36px] border border-violet-400/20 bg-black/35 p-6 shadow-[0_0_55px_rgba(124,58,237,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-300">
              Guild Identity
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Lunaria Signature
            </h2>

            <div className="mt-5 space-y-4">
              {premiumBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-xl text-amber-300">
                      {benefit.icon}
                    </div>

                    <div>
                      <p className="font-black text-white">{benefit.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {benefit.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-amber-400/20 bg-gradient-to-br from-amber-950/25 via-black to-violet-950/25 p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              Current Session
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              {session?.role === "admin"
                ? "Guild Admin"
                : currentPlayer?.character_name || "Guest"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {session?.role === "admin"
                ? "Admin memiliki akses kontrol ke registry dan ID Card."
                : currentPlayer
                ? `${currentPlayer.guild_rank} • ${currentPlayer.pathway} • ${currentPlayer.race}`
                : "Login sebagai player untuk melihat status karakter di sini."}
            </p>

            <Link
              href={session?.role === "admin" ? "/basic-tables" : "/profile"}
              className="mt-5 inline-flex w-full justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500/20"
            >
              {session?.role === "admin" ? "Open Admin Panel" : "Open ID Card"}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pointRules.map((rule, index) => {
          const totals = [
            questTotals.common,
            questTotals.uncommon,
            questTotals.dangerous,
            questTotals.special,
          ];

          return (
            <div
              key={rule.label}
              className={`rounded-[30px] border ${rule.border} ${rule.bg} p-5`}
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                {rule.label} Quest
              </p>
              <p className={`mt-3 text-4xl font-black ${rule.tone}`}>
                {totals[index]}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {rule.value} pts each
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[36px] border border-white/10 bg-black/35 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              Guild Navigation
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Core Modules
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Akses cepat ke fitur utama Lunaria.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-400/30 hover:bg-amber-500/10"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl transition group-hover:bg-amber-400/20" />

              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-2xl">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-lg font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.text}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style jsx>{`
        .lunaria-orb {
          position: absolute;
          height: 10px;
          width: 10px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.72);
          box-shadow: 0 0 24px rgba(245, 158, 11, 0.55);
          animation: lunaria-float 8s ease-in-out infinite;
        }

        .lunaria-orb-two {
          height: 8px;
          width: 8px;
          background: rgba(168, 85, 247, 0.72);
          box-shadow: 0 0 24px rgba(168, 85, 247, 0.55);
          animation-delay: 1.4s;
        }

        .lunaria-orb-three {
          height: 7px;
          width: 7px;
          background: rgba(56, 189, 248, 0.66);
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
          animation-delay: 2.2s;
        }

        .lunaria-marquee {
          white-space: nowrap;
          animation: lunaria-marquee 24s linear infinite;
        }

        @keyframes lunaria-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(18px, -26px, 0) scale(1.45);
            opacity: 0.9;
          }
        }

        @keyframes lunaria-marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-120%);
          }
        }
      `}</style>
    </main>
  );
}

function HeroPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-lg font-black ${tone}`}>{value}</p>
    </div>
  );
}

function RoyalStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_35px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl" />
      <p className="relative z-10 text-xs font-black uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className={`relative z-10 mt-3 text-4xl font-black ${tone}`}>{value}</p>
      <p className="relative z-10 mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
