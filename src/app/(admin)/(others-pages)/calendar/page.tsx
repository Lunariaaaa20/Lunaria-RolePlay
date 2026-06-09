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

type NumberState = {
  id: string;
  date_key: string;
  number_a: string;
  number_b: string;
  used_count: number;
  updated_at: string;
};

const NUMBER_STATE_ID = "daily-number-omen";
const DAILY_NUMBER_COST = 10;

const numberPool = [
  "01",
  "07",
  "13",
  "21",
  "34",
  "55",
  "89",
  "11",
  "22",
  "33",
  "44",
  "66",
  "77",
  "88",
  "99",
];

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

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function generateTwoNumbers() {
  const shuffled = [...numberPool].sort(() => Math.random() - 0.5);

  return {
    numberA: shuffled[0],
    numberB: shuffled[1] === shuffled[0] ? shuffled[2] : shuffled[1],
  };
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

function calculateNumberOmenResult(pickedNumber: string, activeNumbers: string[]) {
  const winningNumber =
    activeNumbers[Math.floor(Math.random() * activeNumbers.length)];

  if (pickedNumber === winningNumber) {
    return {
      winningNumber,
      result: "Number Omen Win",
      label: `Picked ${pickedNumber}, winning number ${winningNumber}`,
      silverChange: 20,
    };
  }

  return {
    winningNumber,
    result: "Number Omen Loss",
    label: `Picked ${pickedNumber}, winning number ${winningNumber}`,
    silverChange: -10,
  };
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
  const [numberState, setNumberState] = useState<NumberState | null>(null);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [selectedModeId, setSelectedModeId] = useState(fortuneModes[0].id);
  const [lastResult, setLastResult] = useState<{
    mode: FortuneMode;
    outcome: FortuneOutcome;
  } | null>(null);
  const [lastNumberResult, setLastNumberResult] = useState<{
    result: string;
    detail: string;
    silverChange: number;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [isNumberRolling, setIsNumberRolling] = useState(false);

  const selectedMode = useMemo(() => {
    return (
      fortuneModes.find((mode) => mode.id === selectedModeId) ||
      fortuneModes[0]
    );
  }, [selectedModeId]);

  const activeNumbers = useMemo(() => {
    if (!numberState) return [];
    return [numberState.number_a, numberState.number_b];
  }, [numberState]);

  const isPlayerSession = session?.role === "player" && Boolean(session.playerId);

  const totalWins = useMemo(() => {
    return logs.filter((log) => log.silver_change > 0).length;
  }, [logs]);

  const totalLosses = useMemo(() => {
    return logs.filter((log) => log.silver_change < 0).length;
  }, [logs]);

  const ensureNumberState = async () => {
    const { data, error } = await supabase
      .from("fortune_number_state")
      .select("id, date_key, number_a, number_b, used_count, updated_at")
      .eq("id", NUMBER_STATE_ID)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      return data as NumberState;
    }

    const generated = generateTwoNumbers();

    const { data: inserted, error: insertError } = await supabase
      .from("fortune_number_state")
      .insert({
        id: NUMBER_STATE_ID,
        date_key: getTodayKey(),
        number_a: generated.numberA,
        number_b: generated.numberB,
        used_count: 0,
      })
      .select("id, date_key, number_a, number_b, used_count, updated_at")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return inserted as NumberState;
  };

  const refreshNumberStateAfterUse = async () => {
    const generated = generateTwoNumbers();

    const { data, error } = await supabase
      .from("fortune_number_state")
      .update({
        date_key: getTodayKey(),
        number_a: generated.numberA,
        number_b: generated.numberB,
        used_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", NUMBER_STATE_ID)
      .select("id, date_key, number_a, number_b, used_count, updated_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as NumberState;
  };

  const loadFortuneData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      setPlayer(null);
      setLogs([]);
      setNumberState(null);
      setIsLoading(false);
      setErrorMessage("Kamu belum login. Silakan masuk lewat Access Gate.");
      return;
    }

    if (currentSession.role === "admin") {
      setPlayer(null);
      setLogs([]);
      setNumberState(null);
      setIsLoading(false);
      setErrorMessage(
        "Admin mode hanya untuk kontrol data. Login sebagai player untuk memakai Fortune Hall."
      );
      return;
    }

    if (!currentSession.playerId) {
      setPlayer(null);
      setLogs([]);
      setNumberState(null);
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
      .limit(10);

    if (logError) {
      setIsLoading(false);
      setErrorMessage(`Gagal membaca fortune log: ${logError.message}`);
      return;
    }

    try {
      const state = await ensureNumberState();
      setNumberState(state);
      setSelectedNumber((prev) => prev || state.number_a);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown number state error.";
      setErrorMessage(`Gagal membaca nomor harian: ${message}`);
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
    setLastNumberResult(null);

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
        await supabase
          .from("players")
          .update({ silver: player.silver })
          .eq("id", session.playerId);

        setErrorMessage(`Gagal menyimpan fortune log: ${logError.message}`);
        return;
      }

      setPlayer((prev) => (prev ? { ...prev, silver: newSilver } : prev));
      setLastResult({
        mode: selectedMode,
        outcome,
      });

      setNotice(
        `${selectedMode.name}: ${outcome.result} (${
          outcome.silverChange >= 0 ? "+" : ""
        }${outcome.silverChange}S)`
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

  const handleDailyNumberOmen = async () => {
    setErrorMessage("");
    setNotice("");
    setLastResult(null);
    setLastNumberResult(null);

    if (!isPlayerSession || !session?.playerId) {
      setErrorMessage("Login sebagai player untuk memakai Daily Number Omen.");
      return;
    }

    if (!player) {
      setErrorMessage("Data player belum terbaca. Refresh halaman dulu.");
      return;
    }

    if (!numberState) {
      setErrorMessage("Nomor harian belum siap. Refresh halaman dulu.");
      return;
    }

    if (!activeNumbers.includes(selectedNumber)) {
      setErrorMessage("Pilih salah satu nomor aktif terlebih dahulu.");
      return;
    }

    if (player.silver < DAILY_NUMBER_COST) {
      setErrorMessage(`Silver tidak cukup. Daily Number Omen butuh ${DAILY_NUMBER_COST}S.`);
      return;
    }

    const numberResult = calculateNumberOmenResult(selectedNumber, activeNumbers);
    const newSilver = player.silver + numberResult.silverChange;

    if (newSilver < 0) {
      setErrorMessage("Silver tidak cukup untuk menerima risiko nomor ini.");
      return;
    }

    setIsNumberRolling(true);

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
        mode: "Daily Number Omen",
        detail: numberResult.label,
        result: numberResult.result,
        silver_change: numberResult.silverChange,
      });

      if (logError) {
        await supabase
          .from("players")
          .update({ silver: player.silver })
          .eq("id", session.playerId);

        setErrorMessage(`Gagal menyimpan number log: ${logError.message}`);
        return;
      }

      const newState = await refreshNumberStateAfterUse();

      setNumberState(newState);
      setSelectedNumber(newState.number_a);
      setPlayer((prev) => (prev ? { ...prev, silver: newSilver } : prev));
      setLastNumberResult({
        result: numberResult.result,
        detail: numberResult.label,
        silverChange: numberResult.silverChange,
      });

      setNotice(
        `Daily Number Omen: ${numberResult.result} (${
          numberResult.silverChange >= 0 ? "+" : ""
        }${numberResult.silverChange}S). Nomor aktif sudah berganti.`
      );

      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown daily number omen error.";
      setErrorMessage(`Daily Number error: ${message}`);
    } finally {
      setIsNumberRolling(false);
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Current Silver"
          value={player ? `${player.silver}S` : "-"}
          tone="text-amber-300"
        />
        <StatCard
          label="Win Logs"
          value={String(totalWins)}
          tone="text-emerald-300"
        />
        <StatCard
          label="Loss Logs"
          value={String(totalLosses)}
          tone="text-red-300"
        />
      </section>

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
                  Fortune Hall selalu memakai{" "}
                  <span className="font-black text-amber-300">
                    playerId dari session login
                  </span>
                  . Tidak bisa memakai ID Card player lain.
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
          <div className="rounded-[34px] border border-amber-400/25 bg-gradient-to-br from-amber-950/35 via-black to-violet-950/25 p-6 shadow-[0_0_35px_rgba(245,158,11,0.08)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                  Daily Number Omen
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Pasang Nomor Harian
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Hanya ada dua nomor aktif. Nomor akan tetap sama kalau belum
                  ada yang memakai. Setelah ada player memakai salah satu nomor,
                  sistem otomatis mengganti dua nomor baru.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 text-right">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                  Cost
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {DAILY_NUMBER_COST}S
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Active Numbers
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {activeNumbers.length ? (
                  activeNumbers.map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setSelectedNumber(number)}
                      className={`rounded-3xl border px-6 py-6 text-4xl font-black transition ${
                        selectedNumber === number
                          ? "border-amber-400/45 bg-amber-500/15 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.10)]"
                          : "border-white/10 bg-black/30 text-slate-300 hover:border-amber-400/25"
                      }`}
                    >
                      {number}
                    </button>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-slate-500">
                    Nomor harian belum siap.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleDailyNumberOmen}
                disabled={
                  isNumberRolling ||
                  isLoading ||
                  !isPlayerSession ||
                  !selectedNumber
                }
                className="mt-5 w-full rounded-2xl border border-amber-400/35 bg-amber-500/15 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
              >
                {isNumberRolling
                  ? "Reading Number..."
                  : `Use Number ${selectedNumber || "-"} • ${DAILY_NUMBER_COST}S`}
              </button>

              {lastNumberResult ? (
                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/35 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Last Number Result
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-white">
                    {lastNumberResult.result}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {lastNumberResult.detail}
                  </p>
                  <p
                    className={`mt-3 text-2xl font-black ${
                      lastNumberResult.silverChange >= 0
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {lastNumberResult.silverChange >= 0 ? "+" : ""}
                    {lastNumberResult.silverChange}S
                  </p>
                </div>
              ) : null}
            </div>
          </div>

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
                {isRolling
                  ? "Reading..."
                  : `Read Fortune • ${selectedMode.cost}S`}
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-4xl font-black ${tone}`}>{value}</p>
    </div>
  );
}
