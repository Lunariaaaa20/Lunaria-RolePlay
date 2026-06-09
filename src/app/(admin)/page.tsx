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

const questRules = [
  {
    label: "Common",
    title: "Moonlit Errands",
    value: 10,
    tone: "text-emerald-300",
    bg: "from-emerald-950/40 via-black to-slate-950",
    border: "border-emerald-400/25",
    icon: "crescent",
  },
  {
    label: "Uncommon",
    title: "Silver Path Trials",
    value: 25,
    tone: "text-sky-300",
    bg: "from-sky-950/40 via-black to-slate-950",
    border: "border-sky-400/25",
    icon: "star",
  },
  {
    label: "Dangerous",
    title: "Blood Moon Hunts",
    value: 60,
    tone: "text-red-300",
    bg: "from-red-950/40 via-black to-slate-950",
    border: "border-red-400/25",
    icon: "blade",
  },
  {
    label: "Special",
    title: "Eclipse Decrees",
    value: 120,
    tone: "text-amber-300",
    bg: "from-amber-950/40 via-black to-slate-950",
    border: "border-amber-400/25",
    icon: "crown",
  },
];

const lunarBenefits = [
  {
    title: "Moonbound Identity",
    text: "Setiap adventurer memiliki ID Card resmi yang terasa seperti lisensi kerajaan Lunaria.",
    icon: "crest",
  },
  {
    title: "Eclipse Rank Prestige",
    text: "Top leaderboard bukan sekadar angka, tapi simbol status dan kehormatan di dalam guild.",
    icon: "crown",
  },
  {
    title: "Silverflow Economy",
    text: "Silver, quest, fortune, dan cosmetic terhubung sebagai ekonomi RP yang hidup.",
    icon: "moon",
  },
  {
    title: "Guildmaster Control",
    text: "Admin tetap mengatur reward, rank, status, dan progres agar dunia RP tetap stabil.",
    icon: "key",
  },
];

const shortcuts = [
  {
    title: "Adventurer ID Card",
    href: "/profile",
    icon: "crest",
    text: "Buka lisensi karakter, currency, quest record, dan cosmetic terpasang.",
  },
  {
    title: "Moon Throne Leaderboard",
    href: "/line-chart",
    icon: "crown",
    text: "Lihat pemegang posisi tertinggi dan aura eksklusif Lunaria.",
  },
  {
    title: "Cosmetic Atelier",
    href: "/buttons",
    icon: "star",
    text: "Kelola tampilan premium untuk ID Card dan identitas karakter.",
  },
  {
    title: "Fortune Hall",
    href: "/calendar",
    icon: "moon",
    text: "Masuki ruang ramalan dan permainan silver berbasis RP.",
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

function getDisplayLabel(player: Player) {
  return calculatePoints(player) > 0 ? "Lunar Prestige" : "Silver Standing";
}

function getTopTheme(rank: number) {
  if (rank === 1) {
    return {
      badge: "Moon Throne I",
      title: "Eclipse Sovereign",
      icon: "crown",
      frame:
        "border-amber-300/45 bg-gradient-to-br from-amber-950/35 via-red-950/20 to-black shadow-[0_0_90px_rgba(245,158,11,0.22)]",
      glow: "bg-amber-300/25",
      text: "from-amber-200 via-yellow-300 to-amber-500",
      chip: "border-amber-300/35 bg-amber-400/10 text-amber-200",
    };
  }

  if (rank === 2) {
    return {
      badge: "Moon Throne II",
      title: "Silvermoon Knight",
      icon: "moon",
      frame:
        "border-sky-300/35 bg-gradient-to-br from-sky-950/40 via-blue-950/20 to-black shadow-[0_0_80px_rgba(56,189,248,0.16)]",
      glow: "bg-sky-300/20",
      text: "from-sky-200 via-cyan-300 to-blue-400",
      chip: "border-sky-300/30 bg-sky-400/10 text-sky-200",
    };
  }

  return {
    badge: "Moon Throne III",
    title: "Astral Noble",
    icon: "star",
    frame:
      "border-violet-300/35 bg-gradient-to-br from-violet-950/45 via-fuchsia-950/20 to-black shadow-[0_0_80px_rgba(168,85,247,0.16)]",
    glow: "bg-violet-300/20",
    text: "from-violet-200 via-purple-300 to-fuchsia-400",
    chip: "border-violet-300/30 bg-violet-400/10 text-violet-200",
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

  const currentPlayer = useMemo(() => {
    if (!session?.playerId) return null;
    return players.find((player) => player.id === session.playerId) || null;
  }, [players, session?.playerId]);

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
    return activePlayers.reduce(
      (sum, player) => sum + Number(player.silver || 0),
      0
    );
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
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.08),transparent_34%),linear-gradient(135deg,#02030a,#050615_48%,#02030a)]" />

      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:58px_58px]" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="lunaria-moon-particle left-[12%] top-[18%]" />
        <span className="lunaria-moon-particle lunaria-particle-two right-[18%] top-[20%]" />
        <span className="lunaria-moon-particle lunaria-particle-three bottom-[12%] left-[45%]" />
      </div>

      <section className="relative overflow-hidden rounded-[38px] border border-amber-300/25 bg-gradient-to-br from-[#070812]/95 via-[#050716]/95 to-violet-950/70 p-6 shadow-[0_0_95px_rgba(245,158,11,0.13)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.24),transparent_40%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-amber-200">
              <Icon name="moon" className="h-4 w-4" />
              Lunaria Moonlit Guild System
            </div>

            <h1 className="lunaria-title mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Guild Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Selamat datang di pusat kendali Lunaria, sebuah gerbang guild
              bertema bulan tempat identitas adventurer, prestige leaderboard,
              cosmetic, fortune, dan ekonomi RP tersusun dalam satu sistem yang
              hidup.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroPill
                label="Moon Gate"
                value="Awakened"
                tone="text-emerald-300"
                icon="moon"
              />
              <HeroPill
                label="Current Soul"
                value={
                  session?.role === "admin"
                    ? "Guild Admin"
                    : currentPlayer?.character_name || "Adventurer"
                }
                tone="text-amber-300"
                icon="crest"
              />
              <HeroPill
                label="Realm Seal"
                value="Protected"
                tone="text-violet-300"
                icon="key"
              />
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="relative overflow-hidden rounded-[32px] border border-amber-300/25 bg-black/35 p-5 text-left shadow-[0_0_45px_rgba(245,158,11,0.08)] xl:text-right">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/10 blur-2xl" />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">
                  Lunar Clock
                </p>
                <p className="mt-3 text-5xl font-black tabular-nums text-white">
                  {time}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Denting waktu untuk seluruh aktivitas guild.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-7 overflow-hidden rounded-3xl border border-amber-300/25 bg-black/35 px-5 py-4">
          <div className="lunaria-marquee text-sm font-semibold text-amber-100">
            ✦ Di bawah cahaya bulan Lunaria, setiap adventurer membawa nama,
            jejak, kehormatan, dan takdirnya sendiri. ID Card aktif, cosmetic
            premium, leaderboard eksklusif, Fortune Hall, dan ekonomi guild kini
            bergerak dalam satu sistem. ✦
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
          <p className="text-sm font-bold">Loading moonlit guild records...</p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RoyalStat
          label="Awakened Adventurers"
          value={String(activePlayers.length)}
          detail={`${players.length} souls in registry`}
          tone="text-emerald-300"
          icon="crest"
        />
        <RoyalStat
          label="Completed Decrees"
          value={String(totalQuest)}
          detail="All quest records"
          tone="text-sky-300"
          icon="scroll"
        />
        <RoyalStat
          label="Lunar Prestige"
          value={String(totalGuildPoints)}
          detail="Quest-based honor"
          tone="text-violet-300"
          icon="star"
        />
        <RoyalStat
          label="Guild Silverflow"
          value={`${totalSilver}S`}
          detail="Active economy pool"
          tone="text-amber-300"
          icon="moon"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-[38px] border border-amber-300/20 bg-black/35 p-6 shadow-[0_0_65px_rgba(15,23,42,0.40)]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200">
                  Moon Throne Registry
                </p>
                <h2 className="lunaria-title mt-2 text-3xl font-black text-white">
                  Top Adventurers
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Mereka yang berdiri di puncak tidak hanya membawa angka, tetapi
                  membawa nama, aura, dan kehormatan yang terlihat oleh seluruh
                  guild.
                </p>
              </div>

              <Link
                href="/line-chart"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-400/20"
              >
                <Icon name="crown" className="h-4 w-4" />
                View Throne
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
                      className={`relative overflow-hidden rounded-[34px] border p-5 ${theme.frame}`}
                    >
                      <div
                        className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl ${theme.glow}`}
                      />
                      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-[24px] border ${theme.chip}`}
                          >
                            <Icon name={theme.icon} className="h-8 w-8" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${theme.chip}`}
                              >
                                {theme.badge}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
                                {theme.title}
                              </span>
                            </div>

                            <h3 className="mt-3 text-2xl font-black text-white md:text-3xl">
                              {player.character_name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {player.guild_rank} • {player.pathway} • {player.race}
                            </p>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p
                            className={`bg-gradient-to-r ${theme.text} bg-clip-text text-5xl font-black text-transparent md:text-6xl`}
                          >
                            {getDisplayScore(player)}
                          </p>
                          <p className="mt-1 text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                            {getDisplayLabel(player)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-slate-400">
                  Belum ada active adventurer untuk Moon Throne.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className="rounded-[38px] border border-violet-300/20 bg-black/35 p-6 shadow-[0_0_55px_rgba(124,58,237,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-200">
              Lunaria Signature
            </p>
            <h2 className="lunaria-title mt-2 text-2xl font-black text-white">
              Guild Benefits
            </h2>

            <div className="mt-5 space-y-4">
              {lunarBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-400/10 text-amber-200">
                      <Icon name={benefit.icon} className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="font-black text-white">{benefit.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {benefit.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[38px] border border-amber-300/20 bg-gradient-to-br from-amber-950/25 via-black to-violet-950/25 p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200">
              Current Vessel
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              {session?.role === "admin"
                ? "Guild Admin"
                : currentPlayer?.character_name || "Wandering Guest"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {session?.role === "admin"
                ? "Pemegang kunci registry, approval, status, dan perkembangan ID Card."
                : currentPlayer
                ? `${currentPlayer.guild_rank} • ${currentPlayer.pathway} • ${currentPlayer.race}`
                : "Masuk sebagai player untuk melihat status karakter di dashboard ini."}
            </p>

            <Link
              href={session?.role === "admin" ? "/basic-tables" : "/profile"}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-400/20"
            >
              <Icon name="key" className="h-4 w-4" />
              {session?.role === "admin" ? "Open Control Panel" : "Open ID Card"}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {questRules.map((rule, index) => {
          const totals = [
            questTotals.common,
            questTotals.uncommon,
            questTotals.dangerous,
            questTotals.special,
          ];

          return (
            <div
              key={rule.label}
              className={`relative overflow-hidden rounded-[32px] border ${rule.border} bg-gradient-to-br ${rule.bg} p-5`}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                    {rule.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-300">
                    {rule.title}
                  </p>
                </div>

                <div className={`rounded-2xl border ${rule.border} p-3 ${rule.tone}`}>
                  <Icon name={rule.icon} className="h-5 w-5" />
                </div>
              </div>

              <p className={`relative z-10 mt-5 text-4xl font-black ${rule.tone}`}>
                {totals[index]}
              </p>
              <p className="relative z-10 mt-2 text-sm text-slate-400">
                {rule.value} prestige each
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[38px] border border-white/10 bg-black/35 p-6">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200">
            Guild Navigation
          </p>
          <h2 className="lunaria-title mt-2 text-3xl font-black text-white">
            Moonlit Modules
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Akses cepat menuju fitur inti Lunaria.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-300/30 hover:bg-amber-400/10"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl transition group-hover:bg-amber-300/20" />

              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-200">
                  <Icon name={item.icon} className="h-7 w-7" />
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
        .lunaria-title {
          letter-spacing: -0.04em;
          text-shadow:
            0 0 28px rgba(255, 255, 255, 0.08),
            0 0 42px rgba(245, 158, 11, 0.08);
        }

        .lunaria-moon-particle {
          position: absolute;
          height: 10px;
          width: 10px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.72);
          box-shadow: 0 0 24px rgba(245, 158, 11, 0.55);
          animation: lunaria-float 8s ease-in-out infinite;
        }

        .lunaria-particle-two {
          height: 8px;
          width: 8px;
          background: rgba(168, 85, 247, 0.72);
          box-shadow: 0 0 24px rgba(168, 85, 247, 0.55);
          animation-delay: 1.4s;
        }

        .lunaria-particle-three {
          height: 7px;
          width: 7px;
          background: rgba(56, 189, 248, 0.66);
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
          animation-delay: 2.2s;
        }

        .lunaria-marquee {
          white-space: nowrap;
          animation: lunaria-marquee 26s linear infinite;
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
            transform: translateX(-130%);
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
  icon,
}: {
  label: string;
  value: string;
  tone: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-3">
        <Icon name={icon} className={`h-5 w-5 ${tone}`} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
      </div>
      <p className={`mt-2 text-lg font-black ${tone}`}>{value}</p>
    </div>
  );
}

function RoyalStat({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_35px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-4xl font-black ${tone}`}>{value}</p>
          <p className="mt-2 text-sm text-slate-400">{detail}</p>
        </div>

        <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-3 ${tone}`}>
          <Icon name={icon} className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  if (name === "moon" || name === "crescent") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M20.2 15.4C18.8 18.7 15.5 21 11.7 21C6.6 21 2.5 16.9 2.5 11.8C2.5 7.8 5.1 4.4 8.7 3.2C7.8 4.5 7.3 6.1 7.3 7.8C7.3 12.7 11.3 16.7 16.2 16.7C17.6 16.7 19 16.3 20.2 15.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "crown") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M4 18H20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M5 16L6.2 7.8L10 12L12 6L14 12L17.8 7.8L19 16H5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 16V13.8M12 16V12.8M15.5 16V13.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "crest") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 3L19 6V11.5C19 16 16.1 19.5 12 21C7.9 19.5 5 16 5 11.5V6L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 7V17M8.8 11.2H15.2M9.5 14.5H14.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "key") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M14.5 9.5L21 3M17.5 6.5L19.5 8.5M15.5 8.5L17.5 10.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9.5 21C13.1 21 16 18.1 16 14.5S13.1 8 9.5 8S3 10.9 3 14.5S5.9 21 9.5 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M9.5 15.5C10.1 15.5 10.5 15.1 10.5 14.5S10.1 13.5 9.5 13.5S8.5 13.9 8.5 14.5S8.9 15.5 9.5 15.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === "scroll") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M7 4H17C18.1 4 19 4.9 19 6V18C19 19.1 18.1 20 17 20H7C5.9 20 5 19.1 5 18V6C5 4.9 5.9 4 7 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8.5 8H15.5M8.5 12H15.5M8.5 16H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "blade") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M14 3L21 10L10 21L3 14L14 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 3L10.5 14.5L21 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
