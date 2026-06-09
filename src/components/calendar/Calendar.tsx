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

type NumberRound = {
  id: string;
  status: "active" | "settled";
  numbers: string[];
  winning_number: string | null;
  started_at: string;
  ends_at: string;
  settled_at: string | null;
  created_at: string;
};

type NumberEntry = {
  id: string;
  round_id: string;
  player_id: string;
  picked_number: string;
  bet_amount: number;
  result: "pending" | "win" | "lose";
  reward_amount: number;
  created_at: string;
  players?: {
    character_name: string;
  } | null;
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

type SpinOption = {
  label: string;
  count: number;
  cost: number;
};

type SpinResult = {
  label: string;
  reward: number;
  tone: "lose" | "neutral" | "win";
};

const NUMBER_POOL = [
  "10",
  "11",
  "12",
  "13",
  "21",
  "22",
  "23",
  "25",
  "34",
  "44",
  "54",
  "55",
  "66",
  "77",
  "87",
  "88",
  "89",
  "98",
  "99",
  "07",
];

const BET_OPTIONS = [5, 10, 20, 30];

const MAX_ENTRIES_PER_ROUND = 5;

const spinOptions: SpinOption[] = [
  {
    label: "1x Spin",
    count: 1,
    cost: 5,
  },
  {
    label: "5x Spin",
    count: 5,
    cost: 25,
  },
  {
    label: "10x Spin",
    count: 10,
    cost: 50,
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

function generateTenNumbers() {
  const shuffled = [...NUMBER_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}

function pickWinningNumber(numbers: string[]) {
  return numbers[Math.floor(Math.random() * numbers.length)];
}

function getRewardAmount(bet: number) {
  if (bet === 5) return 30;
  if (bet === 10) return 60;
  if (bet === 20) return 120;
  if (bet === 30) return 180;
  return bet * 6;
}

function getCountdown(targetDate: string) {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
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

function getSpinResult(): SpinResult {
  const roll = Math.random();

  if (roll < 0.45) {
    return {
      label: "Empty Omen",
      reward: 0,
      tone: "lose",
    };
  }

  if (roll < 0.7) {
    return {
      label: "Ash Return",
      reward: 2,
      tone: "neutral",
    };
  }

  if (roll < 0.85) {
    return {
      label: "Break Even",
      reward: 5,
      tone: "neutral",
    };
  }

  if (roll < 0.95) {
    return {
      label: "Small Blessing",
      reward: 8,
      tone: "win",
    };
  }

  if (roll < 0.99) {
    return {
      label: "Rare Blessing",
      reward: 15,
      tone: "win",
    };
  }

  return {
    label: "Crown Omen",
    reward: 35,
    tone: "win",
  };
}

export default function Calendar() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [activeRound, setActiveRound] = useState<NumberRound | null>(null);
  const [roundEntries, setRoundEntries] = useState<NumberEntry[]>([]);
  const [logs, setLogs] = useState<FortuneLog[]>([]);
  const [previewNumbers, setPreviewNumbers] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [selectedBet, setSelectedBet] = useState(5);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState("--:--:--");
  const [lastSpinText, setLastSpinText] = useState("");

  const isPlayerSession = session?.role === "player" && Boolean(session.playerId);

  const activeNumbers = useMemo(() => {
    if (activeRound?.numbers?.length) return activeRound.numbers;
    return previewNumbers;
  }, [activeRound, previewNumbers]);

  const currentPlayerEntry = useMemo(() => {
    if (!session?.playerId) return null;

    return (
      roundEntries.find((entry) => entry.player_id === session.playerId) || null
    );
  }, [roundEntries, session?.playerId]);

  const totalWins = useMemo(() => {
    return logs.filter((log) => log.silver_change > 0).length;
  }, [logs]);

  const totalLosses = useMemo(() => {
    return logs.filter((log) => log.silver_change < 0).length;
  }, [logs]);

  const participantSlots = `${roundEntries.length}/${MAX_ENTRIES_PER_ROUND}`;

  useEffect(() => {
    if (!activeRound?.ends_at) return;

    const interval = window.setInterval(() => {
      setCountdown(getCountdown(activeRound.ends_at));
    }, 1000);

    setCountdown(getCountdown(activeRound.ends_at));

    return () => {
      window.clearInterval(interval);
    };
  }, [activeRound?.ends_at]);

  const settleExpiredRounds = async () => {
    const nowIso = new Date().toISOString();

    const { data: expiredRounds, error: roundError } = await supabase
      .from("fortune_number_rounds")
      .select(
        "id, status, numbers, winning_number, started_at, ends_at, settled_at, created_at"
      )
      .eq("status", "active")
      .lte("ends_at", nowIso);

    if (roundError) {
      throw new Error(roundError.message);
    }

    const rounds = (expiredRounds as NumberRound[] | null) || [];

    for (const round of rounds) {
      const winningNumber = pickWinningNumber(round.numbers);

      const { data: entriesData, error: entriesError } = await supabase
        .from("fortune_number_entries")
        .select(
          "id, round_id, player_id, picked_number, bet_amount, result, reward_amount, created_at"
        )
        .eq("round_id", round.id);

      if (entriesError) {
        throw new Error(entriesError.message);
      }

      const entries = (entriesData as NumberEntry[] | null) || [];

      for (const entry of entries) {
        const isWin = entry.picked_number === winningNumber;
        const reward = isWin ? getRewardAmount(entry.bet_amount) : 0;

        if (isWin) {
          const { data: targetPlayer, error: readPlayerError } = await supabase
            .from("players")
            .select("id, silver")
            .eq("id", entry.player_id)
            .maybeSingle();

          if (readPlayerError) {
            throw new Error(readPlayerError.message);
          }

          if (targetPlayer) {
            await supabase
              .from("players")
              .update({
                silver: Number(targetPlayer.silver) + reward,
              })
              .eq("id", entry.player_id);
          }
        }

        await supabase
          .from("fortune_number_entries")
          .update({
            result: isWin ? "win" : "lose",
            reward_amount: reward,
          })
          .eq("id", entry.id);

        await supabase.from("fortune_logs").insert({
          player_id: entry.player_id,
          mode: "Daily Number Omen",
          detail: `Picked ${entry.picked_number} • Winning ${winningNumber} • Bet ${entry.bet_amount}S`,
          result: isWin ? "Number Omen Win" : "Number Omen Loss",
          silver_change: reward,
        });
      }

      await supabase
        .from("fortune_number_rounds")
        .update({
          status: "settled",
          winning_number: winningNumber,
          settled_at: new Date().toISOString(),
        })
        .eq("id", round.id);
    }
  };

  const loadFortuneData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      setPlayer(null);
      setActiveRound(null);
      setRoundEntries([]);
      setLogs([]);
      setIsLoading(false);
      setErrorMessage("Kamu belum login. Silakan masuk lewat Access Gate.");
      return;
    }

    if (currentSession.role === "admin") {
      setPlayer(null);
      setActiveRound(null);
      setRoundEntries([]);
      setLogs([]);
      setIsLoading(false);
      setErrorMessage(
        "Admin mode hanya untuk kontrol data. Login sebagai player untuk memakai Fortune Hall."
      );
      return;
    }

    if (!currentSession.playerId) {
      setPlayer(null);
      setActiveRound(null);
      setRoundEntries([]);
      setLogs([]);
      setIsLoading(false);
      setErrorMessage("Session player tidak valid. Silakan logout lalu login ulang.");
      return;
    }

    try {
      await settleExpiredRounds();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown settlement error.";
      setErrorMessage(`Gagal memproses ronde selesai: ${message}`);
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

    const { data: roundData, error: roundError } = await supabase
      .from("fortune_number_rounds")
      .select(
        "id, status, numbers, winning_number, started_at, ends_at, settled_at, created_at"
      )
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (roundError) {
      setIsLoading(false);
      setErrorMessage(`Gagal membaca ronde aktif: ${roundError.message}`);
      return;
    }

    let entries: NumberEntry[] = [];

    if (roundData) {
      const { data: entriesData, error: entriesError } = await supabase
        .from("fortune_number_entries")
        .select(
          "id, round_id, player_id, picked_number, bet_amount, result, reward_amount, created_at, players(character_name)"
        )
        .eq("round_id", roundData.id)
        .order("created_at", { ascending: true });

      if (entriesError) {
        setIsLoading(false);
        setErrorMessage(`Gagal membaca peserta ronde: ${entriesError.message}`);
        return;
      }

      entries = (entriesData as NumberEntry[] | null) || [];
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

    const round = (roundData as NumberRound | null) || null;

    setPlayer(playerData as PlayerProfile);
    setActiveRound(round);
    setRoundEntries(entries);
    setLogs((logData as FortuneLog[] | null) || []);

    if (round?.numbers?.length) {
      setSelectedNumber((prev) =>
        round.numbers.includes(prev) ? prev : round.numbers[0]
      );
    } else {
      const generated = generateTenNumbers();
      setPreviewNumbers(generated);
      setSelectedNumber((prev) =>
        generated.includes(prev) ? prev : generated[0]
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadFortuneData();
  }, []);

  const handleJoinNumberRound = async () => {
    setErrorMessage("");
    setNotice("");

    if (!isPlayerSession || !session?.playerId) {
      setErrorMessage("Login sebagai player untuk ikut Daily Number Omen.");
      return;
    }

    if (!player) {
      setErrorMessage("Data player belum terbaca. Refresh halaman dulu.");
      return;
    }

    if (!BET_OPTIONS.includes(selectedBet)) {
      setErrorMessage("Bet tidak valid. Pilih 5S, 10S, 20S, atau 30S.");
      return;
    }

    if (!activeNumbers.includes(selectedNumber)) {
      setErrorMessage("Pilih salah satu nomor aktif terlebih dahulu.");
      return;
    }

    if (player.silver < selectedBet) {
      setErrorMessage(`Silver tidak cukup. Kamu butuh ${selectedBet}S.`);
      return;
    }

    if (currentPlayerEntry) {
      setErrorMessage(
        "Kamu sudah ikut ronde ini. Satu player hanya boleh pasang satu angka."
      );
      return;
    }

    if (roundEntries.length >= MAX_ENTRIES_PER_ROUND) {
      setErrorMessage("Ronde ini sudah penuh. Maksimal 5 player.");
      return;
    }

    setIsJoining(true);

    try {
      let round = activeRound;

      if (!round) {
        const numbersForNewRound = activeNumbers.length
          ? activeNumbers
          : generateTenNumbers();

        const startedAt = new Date();
        const endsAt = new Date(startedAt.getTime() + 24 * 60 * 60 * 1000);

        const { data: newRound, error: createRoundError } = await supabase
          .from("fortune_number_rounds")
          .insert({
            status: "active",
            numbers: numbersForNewRound,
            started_at: startedAt.toISOString(),
            ends_at: endsAt.toISOString(),
          })
          .select(
            "id, status, numbers, winning_number, started_at, ends_at, settled_at, created_at"
          )
          .single();

        if (createRoundError) {
          setErrorMessage(`Gagal membuat ronde: ${createRoundError.message}`);
          return;
        }

        round = newRound as NumberRound;
      }

      const newSilver = player.silver - selectedBet;

      const { error: updatePlayerError } = await supabase
        .from("players")
        .update({ silver: newSilver })
        .eq("id", session.playerId);

      if (updatePlayerError) {
        setErrorMessage(`Gagal mengurangi silver: ${updatePlayerError.message}`);
        return;
      }

      const { error: insertEntryError } = await supabase
        .from("fortune_number_entries")
        .insert({
          round_id: round.id,
          player_id: session.playerId,
          picked_number: selectedNumber,
          bet_amount: selectedBet,
          result: "pending",
          reward_amount: 0,
        });

      if (insertEntryError) {
        await supabase
          .from("players")
          .update({ silver: player.silver })
          .eq("id", session.playerId);

        setErrorMessage(`Gagal menyimpan pilihan nomor: ${insertEntryError.message}`);
        return;
      }

      await supabase.from("fortune_logs").insert({
        player_id: session.playerId,
        mode: "Daily Number Omen",
        detail: `Locked number ${selectedNumber} • Bet ${selectedBet}S`,
        result: "Entry Locked",
        silver_change: -selectedBet,
      });

      setNotice(
        `Nomor ${selectedNumber} berhasil dikunci dengan bet ${selectedBet}S. Hasil keluar saat countdown selesai.`
      );

      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Daily Number error.";
      setErrorMessage(`Daily Number error: ${message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSpin = async (option: SpinOption) => {
    setErrorMessage("");
    setNotice("");
    setLastSpinText("");

    if (!isPlayerSession || !session?.playerId) {
      setErrorMessage("Login sebagai player untuk memakai Fortune Spin.");
      return;
    }

    if (!player) {
      setErrorMessage("Data player belum terbaca. Refresh halaman dulu.");
      return;
    }

    if (player.silver < option.cost) {
      setErrorMessage(`Silver tidak cukup. Kamu butuh ${option.cost}S.`);
      return;
    }

    setIsSpinning(true);

    try {
      let totalReward = 0;
      const results: string[] = [];

      for (let i = 0; i < option.count; i += 1) {
        const result = getSpinResult();
        totalReward += result.reward;
        results.push(result.label);
      }

      const net = totalReward - option.cost;
      const newSilver = player.silver + net;

      if (newSilver < 0) {
        setErrorMessage("Silver tidak cukup untuk menerima hasil spin.");
        return;
      }

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
        mode: "Fortune Spin",
        detail: `${option.label} • ${results.join(", ")}`,
        result:
          net > 0 ? "Spin Profit" : net < 0 ? "Spin Loss" : "Spin Break Even",
        silver_change: net,
      });

      if (logError) {
        await supabase
          .from("players")
          .update({ silver: player.silver })
          .eq("id", session.playerId);

        setErrorMessage(`Gagal menyimpan spin log: ${logError.message}`);
        return;
      }

      setPlayer((prev) => (prev ? { ...prev, silver: newSilver } : prev));
      setLastSpinText(
        `${option.label}: ${results.join(", ")} • ${net >= 0 ? "+" : ""}${net}S`
      );
      setNotice(
        net > 0
          ? `${option.label} selesai. Profit +${net}S.`
          : net < 0
          ? `${option.label} selesai. Loss ${Math.abs(net)}S.`
          : `${option.label} selesai. Break even.`
      );

      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Fortune Spin error.";
      setErrorMessage(`Spin error: ${message}`);
    } finally {
      setIsSpinning(false);
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
              Mini-game currency RP Lunaria. Semua transaksi memakai silver
              karakter login sendiri, bukan uang asli. ID Card player lain hanya
              bisa dilihat, tidak bisa dipakai untuk bermain.
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
                  Security Rule
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Fortune Hall selalu memakai{" "}
                  <span className="font-black text-amber-300">
                    playerId dari session login
                  </span>
                  . Tidak ada pilihan ID player lain untuk transaksi.
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
                          {log.detail}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {log.result}
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
                  Ada 10 nomor aktif. Maksimal 5 player ikut dalam satu ronde.
                  Satu player hanya boleh memilih satu angka. Countdown 24 jam
                  dimulai dari player pertama yang memasang angka.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                    Slots
                  </p>
                  <p className="mt-1 text-3xl font-black text-white">
                    {participantSlots}
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">
                    Timer
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {activeRound ? countdown : "Not Started"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                    Active Numbers
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Nomor tidak berubah sampai ronde selesai. Kalau belum ada
                    player yang join, ronde belum dimulai.
                  </p>
                </div>

                {currentPlayerEntry ? (
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-300">
                    Your Pick: {currentPlayerEntry.picked_number} •{" "}
                    {currentPlayerEntry.bet_amount}S
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {activeNumbers.map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setSelectedNumber(number)}
                    disabled={Boolean(currentPlayerEntry)}
                    className={`rounded-3xl border px-4 py-5 text-3xl font-black transition disabled:cursor-not-allowed ${
                      selectedNumber === number
                        ? "border-amber-400/45 bg-amber-500/15 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.10)]"
                        : "border-white/10 bg-black/30 text-slate-300 hover:border-amber-400/25"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                  Bet Amount
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {BET_OPTIONS.map((bet) => (
                    <button
                      key={bet}
                      type="button"
                      onClick={() => setSelectedBet(bet)}
                      disabled={Boolean(currentPlayerEntry)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition disabled:cursor-not-allowed ${
                        selectedBet === bet
                          ? "border-violet-400/35 bg-violet-500/15 text-violet-200"
                          : "border-white/10 bg-black/30 text-slate-400 hover:border-violet-400/25"
                      }`}
                    >
                      {bet}S
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Reward
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Jika nomor kamu benar, reward: 5S → 30S, 10S → 60S, 20S →
                  120S, 30S → 180S. Jika kalah, bet yang sudah dikunci hilang.
                </p>
              </div>

              <button
                type="button"
                onClick={handleJoinNumberRound}
                disabled={
                  isJoining ||
                  isLoading ||
                  !isPlayerSession ||
                  Boolean(currentPlayerEntry) ||
                  roundEntries.length >= MAX_ENTRIES_PER_ROUND
                }
                className="mt-5 w-full rounded-2xl border border-amber-400/35 bg-amber-500/15 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
              >
                {currentPlayerEntry
                  ? "Number Already Locked"
                  : isJoining
                  ? "Locking..."
                  : `Lock Number ${selectedNumber || "-"} • ${selectedBet}S`}
              </button>
            </div>
          </div>

          <div className="rounded-[34px] border border-violet-400/20 bg-gradient-to-br from-violet-950/35 via-black to-amber-950/20 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-300">
                  Fortune Spin
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Harder Spin
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Spin cepat untuk hiburan RP. Peluang profit dibuat rendah agar
                  ekonomi guild tidak terlalu mudah naik.
                </p>
              </div>
            </div>

            {lastSpinText ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
                {lastSpinText}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {spinOptions.map((option) => (
                <div
                  key={option.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {option.label}
                  </p>

                  <p className="mt-3 text-3xl font-black text-amber-300">
                    {option.cost}S
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    {option.count} roll chance
                  </p>

                  <button
                    type="button"
                    onClick={() => handleSpin(option)}
                    disabled={isSpinning || isLoading || !isPlayerSession}
                    className="mt-5 w-full rounded-2xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
                  >
                    {isSpinning ? "Spinning..." : "Spin"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-red-300">
                Spin Chance
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Empty Omen 45%, Ash Return 25%, Break Even 15%, Small Blessing
                10%, Rare Blessing 4%, Crown Omen 1%.
              </p>
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
