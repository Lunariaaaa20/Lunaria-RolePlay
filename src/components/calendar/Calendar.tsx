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

type PlayerProfile = {
  id: string;
  character_name: string;
  race: string;
  pathway: string;
  guild_rank: string;
  silver: number;
  status: string;
};

type FortuneMode = {
  id: string;
  name: string;
  subtitle: string;
  cost: number;
  risk: "Low" | "Medium" | "High";
  icon: string;
  description: string;
  themeClass: string;
  outcomes: FortuneOutcome[];
};

type FortuneOutcome = {
  label: string;
  result: string;
  silverChange: number;
  weight: number;
};

type FortuneLog = {
  id: string;
  player_id: string;
  mode: string;
  detail: string;
  result: string;
  silver_change: number;
  created_at: string;
};

const fortuneModes: FortuneMode[] = [
  {
    id: "silver-coin",
    name: "Silver Coin Omen",
    subtitle: "Small Luck Reading",
    cost: 5,
    risk: "Low",
    icon: "◐",
    description:
      "Ritual koin kecil untuk membaca keberuntungan ringan. Cocok untuk player baru.",
    themeClass:
      "border-sky-400/30 bg-gradient-to-br from-sky-950/45 via-black to-slate-950",
    outcomes: [
      {
        label: "Bright Face",
        result: "Minor Blessing",
        silverChange: 5,
        weight: 45,
      },
      {
        label: "Dull Face",
        result: "Quiet Loss",
        silverChange: -5,
        weight: 55,
      },
    ],
  },
  {
    id: "moon-dice",
    name: "Moon Dice",
    subtitle: "Guild Luck Dice",
    cost: 10,
    risk: "Medium",
    icon: "◇",
    description:
      "Dadu bulan yang sering dipakai adventurer untuk menguji nasib RP harian.",
    themeClass:
      "border-violet-400/30 bg-gradient-to-br from-violet-950/55 via-black to-blue-950/25",
    outcomes: [
      {
        label: "Twin Moon",
        result: "Strong Blessing",
        silverChange: 20,
        weight: 20,
      },
      {
        label: "Half Moon",
        result: "Small Blessing",
        silverChange: 5,
        weight: 35,
      },
      {
        label: "Dark Moon",
        result: "Moon Debt",
        silverChange: -10,
        weight: 45,
      },
    ],
  },
  {
    id: "oracle-card",
    name: "Oracle Card",
    subtitle: "High Risk Reading",
    cost: 15,
    risk: "High",
    icon: "✦",
    description:
      "Kartu ramalan berisiko tinggi. Hasilnya bisa memberi berkah besar atau kehilangan silver.",
    themeClass:
      "border-amber-400/35 bg-gradient-to-br from-amber-950/45 via-black to-red-950/30",
    outcomes: [
      {
        label: "Crown of Fortune",
        result: "Major Blessing",
        silverChange: 45,
        weight: 12,
      },
      {
        label: "Golden Thread",
        result: "Fair Blessing",
        silverChange: 15,
        weight: 25,
      },
      {
        label: "Ashen Veil",
        result: "Oracle Loss",
        silverChange: -15,
        weight: 63,
      },
    ],
  },
];

const riskTheme: Record<FortuneMode["risk"], string> = {
  Low: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  Medium: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  High: "border-red-400/25 bg-red-400/10 text-red-200",
};

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

function pickOutcome(outcomes: FortuneOutcome[]) {
  const totalWeight = outcomes.reduce((sum, item) => sum + item.weight, 0);
  const roll = Math.random() * totalWeight;

  let current = 0;

  for (const outcome of outcomes) {
    current += outcome.weight;
    if (roll <= current) {
      return outcome;
    }
  }

  return outcomes[outcomes.length - 1];
}

function formatTime(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LunariaFortuneHall() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [logs, setLogs] = useState<FortuneLog[]>([]);
  const [selectedModeId, setSelectedModeId] = useState(fortuneModes[0].id);
  const [lastResult, setLastResult] = useState<{
    mode: FortuneMode;
    outcome: FortuneOutcome;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRolling, setIsRolling] = useState(false);

  const selectedMode = useMemo(() => {
    return (
      fortuneModes.find((mode) => mode.id === selectedModeId) ||
      fortuneModes[0]
    );
  }, [selectedModeId]);

  const isPlayerSession = session?.role === "player" && Boolean(session.playerId);

  const loadFortuneData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      setPlayer(null);
      setLogs([]);
      setIsLoading(false);
      setErrorMessage("Kamu belum login. Silakan masuk lewat Access Gate.");
      return;
    }

    if (currentSession.role === "admin") {
      setPlayer(null);
      setLogs([]);
      setIsLoading(false);
      setErrorMessage(
        "Admin mode hanya untuk kontrol data. Login sebagai player untuk memakai Fortune Hall."
      );
      return;
    }

    if (!currentSession.playerId) {
      setPlayer(null);
      setLogs([]);
      setIsLoading(false);
      setErrorMessage("Session player tidak valid. Silakan logout lalu login ulang.");
      return;
    }

    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("id, character_name, race, pathway, guild_rank, silver, status")
      .eq("id", currentSession.playerId)
      .eq("status", "active")
      .maybeSingle();

    if (playerError) {
      setIsLoading(false);
      setErrorMessage(`Gagal membaca data player: ${playerError.message}`);
      return;
    }

    if (!playerData) {
      setIsLoading(false);
      setErrorMessage("Player tidak ditemukan atau belum active.");
      return;
    }

    const { data: logData, error: logError } = await supabase
      .from("fortune_logs")
      .select("id, player_id, mode, detail, result, silver_change, created_at")
      .eq("player_id", currentSession.playerId)
      .order("created_at", { ascending: false })
      .limit(8);

    if (logError) {
      setIsLoading(false);
      setErrorMessage(`Gagal membaca fortune log: ${logError.message}`);
      return;
    }

    setPlayer(playerData as PlayerProfile);
    setLogs((logData as FortuneLog[] | null) || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFortuneData();
  }, []);

  const handleRollFortune = async () => {
    setErrorMessage("");
    setNotice("");
    setLastResult(null);

    if (!isPlayerSession || !session?.playerId) {
      setErrorMessage("Login sebagai player untuk memakai Fortune Hall.");
      return;
    }

    if (!player) {
      setErrorMessage("Data player belum terbaca. Refresh halaman dulu.");
      return;
    }

    if (player.silver < selectedMode.cost) {
      setErrorMessage(
        `Silver tidak cukup. ${selectedMode.name} butuh minimal ${selectedMode.cost}S.`
      );
      return;
    }

    const outcome = pickOutcome(selectedMode.outcomes);
    const newSilver = player.silver + outcome.silverChange;

    if (newSilver < 0) {
      setErrorMessage("Silver tidak cukup untuk menerima risiko mode ini.");
      return;
    }

    setIsRolling(true);

    try {
      const { error: updateError } = await supabase
        .from("players")
        .update({ silver: newSilver })
        .eq("id", session.playerId);

      if (updateError) {
        setErrorMessage(`Gagal update silver: ${updateError.message}`);
        return;
      }

      const { error: logError } = await supabase.from("fortune_logs").insert({
        player_id: session.playerId,
        mode: selectedMode.name,
        detail: outcome.label,
        result: outcome.result,
        silver_change: outcome.silverChange,
      });

      if (logError) {
        setErrorMessage(`Gagal menyimpan fortune log: ${logError.message}`);
        return;
      }

      setPlayer((prev) => (prev ? { ...prev, silver: newSilver } : prev));
      setLastResult({
        mode: selectedMode,
        outcome,
      });

      setNotice(
        `${selectedMode.name}: ${outcome.result} (${outcome.silverChange >= 0 ? "+" : ""}${outcome.silverChange}S)`
      );

      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown fortune hall error.";
      setErrorMessage(`Fortune error: ${message}`);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="overflow-hidden rounded-[32px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_55px_rgba(245,158,11,0.10)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-amber-300">
              Lunaria Fortune Hall
            </p>

            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Fortune Hall
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Ruang keberuntungan RP untuk memakai silver karakter. Semua hasil
              hanya memakai currency roleplay, bukan uang asli. Setiap roll
              selalu memakai akun login sendiri.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 px-6 py-4 text-right">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
              Current Balance
            </p>
            <p className="mt-1 text-4xl font-black text-white">
              {player ? `${player.silver}S` : "-"}
            </p>
          </div>
        </div>
      </section>

      {notice ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>

          {!session ? (
            <Link
              href="/signin"
              className="mt-4 inline-flex rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-200"
            >
              Open Access Gate
            </Link>
          ) : null}
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[24px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading Fortune Hall...</p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="space-y-6 xl:col-span-4">
          <div className="rounded-[32px] border border-amber-400/20 bg-black/35 p-6">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
              Player Session
            </p>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-3xl">
                  🔮
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-white">
                    {player?.character_name || "No Player Session"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {player
                      ? `${player.guild_rank} • ${player.pathway}`
                      : "Login required"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-400/15 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Rule
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Fortune Hall selalu memakai <b>playerId dari session login</b>.
                  Tidak bisa memakai ID Card player lain.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-violet-400/20 bg-black/35 p-6">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-300">
              Recent Fortune Logs
            </p>

            <div className="mt-4 space-y-3">
              {logs.length ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">
                          {log.mode}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {log.detail} • {log.result}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          log.silver_change >= 0
                            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                            : "border-red-400/25 bg-red-400/10 text-red-300"
                        }`}
                      >
                        {log.silver_change >= 0 ? "+" : ""}
                        {log.silver_change}S
                      </span>
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      {formatTime(log.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
                  Belum ada fortune log.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="space-y-6 xl:col-span-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {fortuneModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedModeId(mode.id)}
                className={`rounded-[30px] border p-5 text-left transition ${
                  selectedModeId === mode.id
                    ? `${mode.themeClass} shadow-[0_0_35px_rgba(245,158,11,0.10)]`
                    : "border-white/10 bg-white/[0.04] hover:border-amber-400/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/35 text-3xl">
                    {mode.icon}
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                      riskTheme[mode.risk]
                    }`}
                  >
                    {mode.risk}
                  </span>
                </div>

                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {mode.subtitle}
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  {mode.name}
                </h2>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
                  {mode.description}
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Minimum Silver
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-300">
                    {mode.cost}S
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className={`rounded-[34px] border p-6 ${selectedMode.themeClass}`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                  Selected Fortune
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {selectedMode.name}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  {selectedMode.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRollFortune}
                disabled={isRolling || isLoading || !isPlayerSession}
                className="rounded-2xl border border-amber-400/35 bg-amber-500/15 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
              >
                {isRolling ? "Reading..." : `Read Fortune • ${selectedMode.cost}S`}
              </button>
            </div>

            {lastResult ? (
              <div className="mt-6 rounded-[28px] border border-white/10 bg-black/35 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                  Last Result
                </p>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {lastResult.outcome.result}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {lastResult.outcome.label}
                    </p>
                  </div>

                  <span
                    className={`rounded-2xl border px-5 py-3 text-xl font-black ${
                      lastResult.outcome.silverChange >= 0
                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                        : "border-red-400/25 bg-red-400/10 text-red-300"
                    }`}
                  >
                    {lastResult.outcome.silverChange >= 0 ? "+" : ""}
                    {lastResult.outcome.silverChange}S
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Possible Results
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {selectedMode.outcomes.map((outcome) => (
                  <div
                    key={`${selectedMode.id}-${outcome.label}`}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <p className="text-sm font-black text-white">
                      {outcome.result}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {outcome.label}
                    </p>
                    <p
                      className={`mt-3 text-lg font-black ${
                        outcome.silverChange >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {outcome.silverChange >= 0 ? "+" : ""}
                      {outcome.silverChange}S
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
