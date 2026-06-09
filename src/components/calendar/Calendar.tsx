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
  player_name?: string;
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
  sigil: string;
  subtitle: string;
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
    label: "Veil Spin I",
    count: 1,
    cost: 5,
    sigil: "I",
    subtitle: "Single whisper cast",
  },
  {
    label: "Veil Spin V",
    count: 5,
    cost: 25,
    sigil: "V",
    subtitle: "Five-fold omen draw",
  },
  {
    label: "Veil Spin X",
    count: 10,
    cost: 50,
    sigil: "X",
    subtitle: "Grand ritual cascade",
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
      label: "Silent Ash",
      reward: 0,
      tone: "lose",
    };
  }

  if (roll < 0.7) {
    return {
      label: "Faint Return",
      reward: 2,
      tone: "neutral",
    };
  }

  if (roll < 0.85) {
    return {
      label: "Equal Omen",
      reward: 5,
      tone: "neutral",
    };
  }

  if (roll < 0.95) {
    return {
      label: "Blessed Ember",
      reward: 8,
      tone: "win",
    };
  }

  if (roll < 0.99) {
    return {
      label: "Seraphic Veil",
      reward: 15,
      tone: "win",
    };
  }

  return {
    label: "Crown of Temptation",
    reward: 35,
    tone: "win",
  };
}

export default function FortuneHallPage() {
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
  const [isAdminWorking, setIsAdminWorking] = useState(false);
  const [countdown, setCountdown] = useState("--:--:--");
  const [lastSpinText, setLastSpinText] = useState("");

  const isAdminSession = session?.role === "admin";
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

  const settleOneRound = async (round: NumberRound) => {
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

    const entries = (entriesData as unknown as NumberEntry[] | null) || [];

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
        mode: "Veiled Number Rite",
        detail: `Marked ${entry.picked_number} • Sealed result ${winningNumber} • Tribute ${entry.bet_amount}S`,
        result: isWin ? "Veil Favored You" : "The Veil Stayed Silent",
        silver_change: isWin ? reward : 0,
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

    return winningNumber;
  };

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

    const rounds = (expiredRounds as unknown as NumberRound[] | null) || [];

    for (const round of rounds) {
      await settleOneRound(round);
    }
  };

  const loadEntriesWithNames = async (roundId: string) => {
    const { data: entriesData, error: entriesError } = await supabase
      .from("fortune_number_entries")
      .select(
        "id, round_id, player_id, picked_number, bet_amount, result, reward_amount, created_at"
      )
      .eq("round_id", roundId)
      .order("created_at", { ascending: true });

    if (entriesError) {
      throw new Error(entriesError.message);
    }

    const entries = (entriesData as unknown as NumberEntry[] | null) || [];
    const playerIds = [...new Set(entries.map((entry) => entry.player_id))];

    if (!playerIds.length) {
      return entries;
    }

    const { data: playerRows, error: playerRowsError } = await supabase
      .from("players")
      .select("id, character_name")
      .in("id", playerIds);

    if (playerRowsError) {
      return entries;
    }

    const playerMap = new Map<string, string>();

    (
      (playerRows as unknown as { id: string; character_name: string }[] | null) ||
      []
    ).forEach((row) => {
      playerMap.set(row.id, row.character_name);
    });

    return entries.map((entry) => ({
      ...entry,
      player_name: playerMap.get(entry.player_id) || "Unknown Vessel",
    }));
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
      setErrorMessage("Akses belum ditemukan. Masuk dulu melalui gerbang guild.");
      return;
    }

    try {
      await settleExpiredRounds();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown settlement error.";
      setErrorMessage(`Ritual settlement gagal: ${message}`);
    }

    let currentPlayer: PlayerProfile | null = null;

    if (currentSession.role === "player") {
      if (!currentSession.playerId) {
        setPlayer(null);
        setActiveRound(null);
        setRoundEntries([]);
        setLogs([]);
        setIsLoading(false);
        setErrorMessage("Session player tidak valid. Logout lalu login ulang.");
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

      currentPlayer = playerData as unknown as PlayerProfile;
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
      setErrorMessage(`Gagal membaca ritual aktif: ${roundError.message}`);
      return;
    }

    const round = (roundData as unknown as NumberRound | null) || null;
    let entries: NumberEntry[] = [];

    if (round) {
      try {
        entries = await loadEntriesWithNames(round.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown entries error.";
        setIsLoading(false);
        setErrorMessage(`Gagal membaca peserta ritual: ${message}`);
        return;
      }
    }

    let logQuery = supabase
      .from("fortune_logs")
      .select("id, player_id, mode, detail, result, silver_change, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (currentSession.role === "player" && currentSession.playerId) {
      logQuery = logQuery.eq("player_id", currentSession.playerId);
    }

    const { data: logData, error: logError } = await logQuery;

    if (logError) {
      setIsLoading(false);
      setErrorMessage(`Gagal membaca catatan takdir: ${logError.message}`);
      return;
    }

    setPlayer(currentPlayer);
    setActiveRound(round);
    setRoundEntries(entries);
    setLogs((logData as unknown as FortuneLog[] | null) || []);

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
      setErrorMessage("Masuk sebagai player untuk mengikuti ritual angka.");
      return;
    }

    if (!player) {
      setErrorMessage("Data player belum terbaca. Refresh dulu.");
      return;
    }

    if (!BET_OPTIONS.includes(selectedBet)) {
      setErrorMessage("Nominal persembahan tidak valid.");
      return;
    }

    if (!activeNumbers.includes(selectedNumber)) {
      setErrorMessage("Pilih salah satu sigil angka aktif.");
      return;
    }

    if (player.silver < selectedBet) {
      setErrorMessage(`Silver tidak cukup. Kamu butuh ${selectedBet}S.`);
      return;
    }

    if (currentPlayerEntry) {
      setErrorMessage("Tandamu sudah terkunci pada ritual aktif ini.");
      return;
    }

    if (roundEntries.length >= MAX_ENTRIES_PER_ROUND) {
      setErrorMessage("Lingkaran sudah penuh. Maksimal 5 jiwa per ritual.");
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
          setErrorMessage(`Gagal membuka ritual: ${createRoundError.message}`);
          return;
        }

        round = newRound as unknown as NumberRound;
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

        setErrorMessage(`Gagal mengunci angka: ${insertEntryError.message}`);
        return;
      }

      await supabase.from("fortune_logs").insert({
        player_id: session.playerId,
        mode: "Veiled Number Rite",
        detail: `Marked sigil ${selectedNumber} • Tribute ${selectedBet}S`,
        result: "Seal Accepted",
        silver_change: -selectedBet,
      });

      setNotice(
        `Sigil ${selectedNumber} telah diterima. Persembahan ${selectedBet}S masuk ke lingkaran.`
      );

      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown ritual error.";
      setErrorMessage(`Ritual error: ${message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSpin = async (option: SpinOption) => {
    setErrorMessage("");
    setNotice("");
    setLastSpinText("");

    if (!isPlayerSession || !session?.playerId) {
      setErrorMessage("Masuk sebagai player untuk menyentuh Veil Spin.");
      return;
    }

    if (!player) {
      setErrorMessage("Data player belum terbaca. Refresh dulu.");
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
        setErrorMessage("Silver tidak cukup untuk menerima hasil ritual.");
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
        mode: "Veil Spin",
        detail: `${option.label} • ${results.join(", ")}`,
        result:
          net > 0 ? "The Veil Smiled" : net < 0 ? "The Veil Took Its Due" : "Balance Preserved",
        silver_change: net,
      });

      if (logError) {
        await supabase
          .from("players")
          .update({ silver: player.silver })
          .eq("id", session.playerId);

        setErrorMessage(`Gagal menyimpan ritual log: ${logError.message}`);
        return;
      }

      setPlayer((prev) => (prev ? { ...prev, silver: newSilver } : prev));
      setLastSpinText(
        `${option.label}: ${results.join(", ")} • ${net >= 0 ? "+" : ""}${net}S`
      );
      setNotice(
        net > 0
          ? `${option.label} berakhir manis. Veil memberimu +${net}S.`
          : net < 0
          ? `${option.label} menuntut harga. Veil mengambil ${Math.abs(net)}S.`
          : `${option.label} selesai. Takdir tetap seimbang.`
      );

      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown spin error.";
      setErrorMessage(`Spin error: ${message}`);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleForceSettleRound = async () => {
    setErrorMessage("");
    setNotice("");

    if (!isAdminSession) {
      setErrorMessage("Hanya admin yang bisa menutup ritual secara paksa.");
      return;
    }

    if (!activeRound) {
      setErrorMessage("Tidak ada ritual aktif untuk diselesaikan.");
      return;
    }

    setIsAdminWorking(true);

    try {
      const winningNumber = await settleOneRound(activeRound);
      setNotice(`Ritual ditutup. Sigil terpilih: ${winningNumber}.`);
      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown force settle error.";
      setErrorMessage(`Force settle gagal: ${message}`);
    } finally {
      setIsAdminWorking(false);
    }
  };

  const handleResetActiveRound = async () => {
    setErrorMessage("");
    setNotice("");

    if (!isAdminSession) {
      setErrorMessage("Hanya admin yang bisa mereset ritual.");
      return;
    }

    if (!activeRound) {
      setErrorMessage("Tidak ada ritual aktif untuk direset.");
      return;
    }

    setIsAdminWorking(true);

    try {
      const { error: deleteEntriesError } = await supabase
        .from("fortune_number_entries")
        .delete()
        .eq("round_id", activeRound.id);

      if (deleteEntriesError) {
        setErrorMessage(`Gagal hapus entry ritual: ${deleteEntriesError.message}`);
        return;
      }

      const { error: deleteRoundError } = await supabase
        .from("fortune_number_rounds")
        .delete()
        .eq("id", activeRound.id);

      if (deleteRoundError) {
        setErrorMessage(`Gagal reset ritual: ${deleteRoundError.message}`);
        return;
      }

      setNotice("Ritual aktif berhasil dihapus.");
      await loadFortuneData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown reset error.";
      setErrorMessage(`Reset ritual gagal: ${message}`);
    } finally {
      setIsAdminWorking(false);
    }
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="fortune-shell relative overflow-hidden rounded-[34px] border border-amber-400/20 bg-[radial-gradient(circle_at_top_left,rgba(255,214,102,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%),linear-gradient(135deg,rgba(4,7,21,0.96),rgba(8,12,32,0.98),rgba(40,11,24,0.84))] p-6 shadow-[0_0_70px_rgba(245,158,11,0.08)] md:p-8">
        <InfernalHalo />
        <FloatingVeilParticles />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-2">
              <HaloMaskIcon />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-300">
                Sanctum of Veiled Fortune
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Fortune Hall
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Aula mewah yang tampak suci di permukaan, namun menyembunyikan
              lingkaran takdir di balik cahaya. Setiap angka, spin, dan ritual
              mengalir menggunakan silver karakter login sendiri.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
            <TopHeroStat
              label="Silver Vessel"
              value={player ? `${player.silver}S` : isAdminSession ? "ADMIN" : "-"}
              tone="text-amber-300"
            />
            <TopHeroStat
              label="Veiled Timer"
              value={activeRound ? countdown : "Dormant"}
              tone="text-violet-300"
            />
          </div>
        </div>
      </section>

      {notice ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200 shadow-[0_0_26px_rgba(52,211,153,0.08)]">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-5 text-red-200 shadow-[0_0_26px_rgba(248,113,113,0.08)]">
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
          <p className="text-sm font-bold">Unsealing Fortune Hall...</p>
        </section>
      ) : null}

      {isAdminSession ? (
        <section className="relative overflow-hidden rounded-[34px] border border-red-400/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.10),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.12),transparent_28%),linear-gradient(135deg,rgba(26,8,8,0.92),rgba(11,11,20,0.98),rgba(43,16,24,0.90))] p-6 shadow-[0_0_45px_rgba(248,113,113,0.06)]">
          <FloatingVeilParticles />

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-red-300">
                Ritual Overseer Panel
              </p>

              <h2 className="mt-3 text-3xl font-black text-white">
                Admin Fortune Control
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Panel khusus admin untuk testing dan kontrol sistem. Penutupan
                paksa akan langsung mengungkap sigil terpilih. Reset aktif akan
                menghapus ritual tanpa rollback silver testing.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleForceSettleRound}
                disabled={isAdminWorking || !activeRound}
                className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
              >
                Force Settle
              </button>

              <button
                type="button"
                onClick={handleResetActiveRound}
                disabled={isAdminWorking || !activeRound}
                className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
              >
                Reset Ritual
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              label="Ritual State"
              value={activeRound ? "ACTIVE" : "DORMANT"}
              tone={activeRound ? "text-emerald-300" : "text-slate-400"}
            />
            <StatCard label="Vessels" value={participantSlots} tone="text-amber-300" />
            <StatCard
              label="Clock"
              value={activeRound ? countdown : "-"}
              tone="text-violet-300"
            />
            <StatCard
              label="Entries"
              value={String(roundEntries.length)}
              tone="text-sky-300"
            />
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          label="Silver Balance"
          value={player ? `${player.silver}S` : isAdminSession ? "ADMIN" : "-"}
          desc="Current vessel reserve"
          tone="text-amber-300"
          icon={<HaloMaskIcon className="h-5 w-5" />}
        />
        <SummaryCard
          label="Favorable Echoes"
          value={String(totalWins)}
          desc="Positive ritual records"
          tone="text-emerald-300"
          icon={<RadiantStarIcon className="h-5 w-5" />}
        />
        <SummaryCard
          label="Devoured Offers"
          value={String(totalLosses)}
          desc="Silver taken by the veil"
          tone="text-red-300"
          icon={<InfernalMarkIcon className="h-5 w-5" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="space-y-6 xl:col-span-4">
          <section className="relative overflow-hidden rounded-[34px] border border-amber-400/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02)),radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_26%),linear-gradient(160deg,rgba(7,8,20,0.96),rgba(12,15,35,0.96),rgba(25,8,18,0.90))] p-6 shadow-[0_0_45px_rgba(15,23,42,0.40)]">
            <FloatingVeilParticles />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                Bound Vessel
              </p>

              <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-4">
                  <div className="ritual-orb flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-3xl">
                    <span className="ritual-orb-inner">☽</span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-white">
                      {player?.character_name ||
                        (isAdminSession ? "Guild Admin" : "No Player Session")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {player
                        ? `${player.guild_rank} • ${player.pathway}`
                        : isAdminSession
                        ? "Ritual Overseer"
                        : "Login required"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-amber-400/15 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Veil Lock
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Seluruh transaksi ritual terkunci pada{" "}
                    <span className="font-black text-amber-300">
                      playerId session login
                    </span>
                    . Tidak ada pemilihan ID player lain.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[34px] border border-violet-400/18 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_26%),linear-gradient(160deg,rgba(8,9,24,0.96),rgba(12,16,39,0.96),rgba(15,8,25,0.92))] p-6 shadow-[0_0_45px_rgba(15,23,42,0.40)]">
            <FloatingVeilParticles />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-300">
                Chronicle of Echoes
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Recent Fortune Logs
              </h2>

              <div className="mt-4 space-y-3">
                {logs.length ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white">
                            {log.mode}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {log.detail}
                          </p>
                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
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
                    Belum ada catatan takdir.
                  </p>
                )}
              </div>
            </div>
          </section>
        </aside>

        <section className="space-y-6 xl:col-span-8">
          <section className="relative overflow-hidden rounded-[36px] border border-amber-400/18 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.10),transparent_30%),linear-gradient(135deg,rgba(11,14,32,0.97),rgba(10,18,40,0.97),rgba(34,10,28,0.92))] p-6 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
            <InfernalHalo />
            <FloatingVeilParticles />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                  Veiled Number Rite
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Ritual of Marked Sigils
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Sepuluh sigil dibuka pada setiap putaran. Maksimal lima jiwa
                  dapat masuk ke satu ritual. Setelah segel pertama ditempatkan,
                  jam takdir mulai bergerak selama 24 jam.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                    Vessels
                  </p>
                  <p className="mt-1 text-3xl font-black text-white">
                    {participantSlots}
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">
                    Veiled Clock
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {activeRound ? countdown : "Dormant"}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                    Open Sigils
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Susunan angka tetap sampai ritual berakhir. Jika belum ada
                    yang masuk, ritual masih tertidur.
                  </p>
                </div>

                {currentPlayerEntry ? (
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-300">
                    Your Mark: {currentPlayerEntry.picked_number} •{" "}
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
                    disabled={Boolean(currentPlayerEntry) || isAdminSession}
                    className={`ritual-number rounded-[26px] border px-4 py-5 text-3xl font-black transition duration-200 disabled:cursor-not-allowed ${
                      selectedNumber === number
                        ? "border-amber-400/45 bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(124,58,237,0.12))] text-amber-200 shadow-[0_0_26px_rgba(245,158,11,0.10)]"
                        : "border-white/10 bg-black/30 text-slate-300 hover:border-amber-400/25 hover:bg-white/[0.05]"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                  Offered Tribute
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {BET_OPTIONS.map((bet) => (
                    <button
                      key={bet}
                      type="button"
                      onClick={() => setSelectedBet(bet)}
                      disabled={Boolean(currentPlayerEntry) || isAdminSession}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition disabled:cursor-not-allowed ${
                        selectedBet === bet
                          ? "border-violet-400/35 bg-violet-500/15 text-violet-200 shadow-[0_0_22px_rgba(168,85,247,0.10)]"
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
                  Covenant Return
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Jika sigilmu dipanggil, Veil membalas persembahanmu dengan
                  hasil lebih besar. Jika tidak, tribute tetap tenggelam ke
                  dalam lingkaran.
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
                className="ritual-button mt-5 w-full rounded-2xl border border-amber-400/35 bg-[linear-gradient(135deg,rgba(245,158,11,0.16),rgba(124,58,237,0.14))] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-100 transition hover:border-amber-300/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.10)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
              >
                {isAdminSession
                  ? "Admin Cannot Enter Ritual"
                  : currentPlayerEntry
                  ? "Mark Already Sealed"
                  : isJoining
                  ? "Sealing..."
                  : `Seal Sigil ${selectedNumber || "-"} • ${selectedBet}S`}
              </button>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[36px] border border-violet-400/18 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_28%),linear-gradient(135deg,rgba(11,11,27,0.98),rgba(9,18,43,0.98),rgba(30,10,30,0.92))] p-6 shadow-[0_0_40px_rgba(124,58,237,0.06)]">
            <InfernalHalo />
            <FloatingVeilParticles />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-300">
                  Veil Spin Chamber
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Angel’s Mask, Devil’s Wheel
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Sebuah roda yang tampil indah, tenang, dan memikat. Namun di
                  balik kilaunya, hasil tetap dirahasiakan oleh Veil. Tidak ada
                  angka peluang yang ditampilkan. Hanya mereka yang berani
                  menyentuhnya yang akan mengetahui harga sesungguhnya.
                </p>
              </div>
            </div>

            {lastSpinText ? (
              <div className="relative z-10 mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
                {lastSpinText}
              </div>
            ) : null}

            <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {spinOptions.map((option) => (
                <div
                  key={option.label}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 transition hover:border-violet-400/20 hover:bg-white/[0.055]"
                >
                  <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-lg font-black text-violet-200 transition group-hover:scale-105">
                    {option.sigil}
                  </div>

                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    {option.label}
                  </p>

                  <p className="mt-4 text-4xl font-black text-amber-300">
                    {option.cost}S
                  </p>

                  <p className="mt-2 text-sm text-slate-400">{option.subtitle}</p>

                  <button
                    type="button"
                    onClick={() => handleSpin(option)}
                    disabled={isSpinning || isLoading || !isPlayerSession}
                    className="mt-6 w-full rounded-2xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
                  >
                    {isAdminSession
                      ? "Admin Disabled"
                      : isSpinning
                      ? "Invoking..."
                      : "Touch the Veil"}
                  </button>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">
                  Outcome Veil
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Frekuensi hasil tidak diumumkan. Sebagian hasil muncul lebih
                  sering, sebagian lain nyaris tak pernah menampakkan diri.
                  Semakin cerah namanya, semakin tipis jejaknya.
                </p>
              </div>

              <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                  Hidden Doctrine
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Veil Spin dirancang untuk menggoda, bukan menjelaskan. Setiap
                  sentuhan adalah kontrak singkat antara rasa penasaran dan
                  risiko.
                </p>
              </div>
            </div>
          </section>
        </section>
      </section>

      <style jsx>{`
        @keyframes veil-float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.04);
          }
        }

        @keyframes halo-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.22;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.08);
          }
        }

        @keyframes shimmer-pass {
          0% {
            transform: translateX(-140%);
          }
          100% {
            transform: translateX(140%);
          }
        }

        .fortune-shell::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.04),
            transparent
          );
          transform: translateX(-140%);
          animation: shimmer-pass 8s linear infinite;
          pointer-events: none;
        }

        .ritual-orb {
          animation: veil-float 5s ease-in-out infinite;
        }

        .ritual-orb-inner {
          filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.35));
        }

        .ritual-number {
          backdrop-filter: blur(8px);
        }

        .ritual-button {
          position: relative;
          overflow: hidden;
        }

        .ritual-button::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.10),
            transparent
          );
          transform: translateX(-140%);
          transition: transform 0.7s ease;
        }

        .ritual-button:hover::after {
          transform: translateX(140%);
        }

        .halo-ring {
          animation: halo-spin 16s linear infinite;
        }

        .veil-pulse {
          animation: pulse-soft 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

function TopHeroStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 truncate text-2xl font-black ${tone}`}>{value}</p>
    </div>
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

function FloatingVeilParticles() {
  return (
    <>
      <span className="veil-pulse pointer-events-none absolute left-[10%] top-[18%] h-2 w-2 rounded-full bg-amber-300/50 blur-[1px]" />
      <span className="veil-pulse pointer-events-none absolute right-[12%] top-[22%] h-2.5 w-2.5 rounded-full bg-violet-300/40 blur-[1px]" />
      <span className="veil-pulse pointer-events-none absolute bottom-[18%] left-[46%] h-2 w-2 rounded-full bg-rose-300/35 blur-[1px]" />
      <span className="veil-pulse pointer-events-none absolute bottom-[28%] right-[30%] h-1.5 w-1.5 rounded-full bg-sky-300/40 blur-[1px]" />
    </>
  );
}

function InfernalHalo() {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/8 opacity-60 blur-sm" />
      <div className="halo-ring pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] rounded-full border border-amber-300/10 opacity-45" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-3xl" />
    </>
  );
}

function HaloMaskIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 4.2c4.2 0 7.6 3.2 7.6 7.2 0 4.9-4.1 8.4-7.6 8.4-3.5 0-7.6-3.5-7.6-8.4 0-4 3.4-7.2 7.6-7.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.6 10.8c.6-.4 1.1-.6 1.7-.6m3.1.6c.5-.4 1.1-.6 1.7-.6M8.7 14.5c.9.8 1.9 1.1 3.3 1.1 1.4 0 2.4-.3 3.3-1.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8.2 3.1c1-1 2.3-1.5 3.8-1.5 1.5 0 2.8.5 3.8 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RadiantStarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7L4.5 10.9 10.1 9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfernalMarkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 4.2c1.8 2.2 4.7 3.9 7 4.3-.4 5.8-2.7 9.1-7 11.3-4.3-2.2-6.6-5.5-7-11.3 2.3-.4 5.2-2.1 7-4.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.8 10.4 12 12l2.2-1.6M10.5 15.2h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
