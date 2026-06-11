"use client";

import React, { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  addCurrency,
  canAfford,
  formatCurrency,
  normalizeCurrency,
  silverToCurrency,
  subtractCurrency,
  type LunariaCurrency,
} from "@/lib/lunariaCurrency";

type ArenaSession = {
  role: "player" | "admin";
  playerId?: string;
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
};

type ArenaPlayer = {
  id: string;
  character_name: string;
  race: string;
  pathway: string;
  guild_rank: string;
  gold: number;
  silver: number;
  bronze: number;
  status: string;
};

type WagerLobby = {
  id: string;
  lobby_type: "duel" | "moonfall";
  table_name: string;
  bet_silver: number;
  custom_bet_silver: number | null;
  status: "waiting" | "playing" | "intermission" | "closed";
  current_round_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type LobbyPlayer = {
  id: string;
  lobby_id: string;
  player_id: string;
  seat_number: number | null;
  status: "waiting" | "ready" | "playing" | "forfeit" | "left";
  joined_at: string;
  last_seen_at: string;
  player_name?: string;
};

type WagerRound = {
  id: string;
  lobby_id: string;
  round_number: number;
  status: "playing" | "settled" | "cancelled";
  bet_silver: number;
  total_pot_silver: number;
  tax_silver: number;
  net_pot_silver: number;
  winner_player_id: string | null;
  runner_up_player_id: string | null;
  roll_data: unknown;
  started_at: string;
  settled_at: string | null;
};

type WagerRoundPlayer = {
  id: string;
  round_id: string;
  lobby_id: string;
  player_id: string;
  player_name: string;
  bet_silver: number;
  total_score: number;
  placement: number | null;
  payout_silver: number;
  status: "playing" | "win" | "runner_up" | "lose" | "forfeit";
  created_at: string;
};

type WagerTaunt = {
  id: string;
  lobby_id: string;
  player_id: string | null;
  player_name: string;
  message: string;
  created_at: string;
};

type PlayerWalletRow = {
  id: string;
  character_name: string;
  gold: number;
  silver: number;
  bronze: number;
};

type ResolvedParticipant = {
  player_id: string;
  player_name: string;
  total_score: number;
  placement: number;
  payout_silver: number;
  status: "win" | "runner_up" | "lose";
};

type FortuneWagerArenaProps = {
  session: ArenaSession | null;
  player: ArenaPlayer | null;
  onRefresh?: () => Promise<void> | void;
};

const TABLE_OPTIONS = [
  {
    key: "bronze",
    name: "Bronze Moon",
    bet: 5,
    desc: "Meja ringan buat pemanasan.",
  },
  {
    key: "silver",
    name: "Silver Eclipse",
    bet: 10,
    desc: "Taruhan standar Fortune Hall.",
  },
  {
    key: "gold",
    name: "Gold Crescent",
    bet: 25,
    desc: "Mulai panas, saldo mulai serius.",
  },
  {
    key: "royal",
    name: "Royal Moon",
    bet: 50,
    desc: "Meja besar buat player berani.",
  },
  {
    key: "black",
    name: "Black Moon",
    bet: 0,
    desc: "Custom bet untuk lobby panas.",
  },
];

const QUICK_TAUNTS = [
  "Panik... Panik... Panik...",
  "Info lawan keras.",
  "Jangan kabur, baru juga mulai.",
  "Roll segitu niat menang?",
  "Dadu kamu lagi ngambek?",
  "Saldo kalian cuma titipan.",
  "Aku datang buat ambil pot.",
  "Bulan lagi di pihakku.",
  "Tenang, kalah itu proses.",
  "Next korban siapa?",
  "Cepetan selesai, aku next.",
  "Yang menang jangan kabur.",
];

function getPlayerCurrency(player: ArenaPlayer | PlayerWalletRow) {
  return normalizeCurrency({
    gold: Number(player.gold || 0),
    silver: Number(player.silver || 0),
    bronze: Number(player.bronze || 0),
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function rollDice() {
  const dice = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];

  return {
    dice,
    total: dice.reduce((sum, value) => sum + value, 0),
  };
}

function resolveDuel(players: LobbyPlayer[]) {
  const scores = new Map<string, number>();
  const rounds: unknown[] = [];

  players.forEach((player) => scores.set(player.player_id, 0));

  for (let roundIndex = 1; roundIndex <= 3; roundIndex += 1) {
    let settled = false;
    let attempt = 0;

    while (!settled) {
      attempt += 1;

      const rolls = players.map((player) => ({
        player_id: player.player_id,
        player_name: player.player_name || "Unknown Vessel",
        ...rollDice(),
      }));

      const sorted = [...rolls].sort((a, b) => b.total - a.total);
      const top = sorted[0];
      const second = sorted[1];

      if (top.total !== second.total) {
        scores.set(top.player_id, (scores.get(top.player_id) || 0) + 1);
        rounds.push({
          round: roundIndex,
          attempt,
          winner_player_id: top.player_id,
          rolls,
        });
        settled = true;
      }
    }
  }

  let sortedScore = players
    .map((player) => ({
      player_id: player.player_id,
      player_name: player.player_name || "Unknown Vessel",
      score: scores.get(player.player_id) || 0,
    }))
    .sort((a, b) => b.score - a.score);

  while (sortedScore[0].score === sortedScore[1].score) {
    const suddenRolls = sortedScore.slice(0, 2).map((player) => ({
      player_id: player.player_id,
      player_name: player.player_name,
      ...rollDice(),
    }));

    const suddenSorted = [...suddenRolls].sort((a, b) => b.total - a.total);

    if (suddenSorted[0].total !== suddenSorted[1].total) {
      scores.set(
        suddenSorted[0].player_id,
        (scores.get(suddenSorted[0].player_id) || 0) + 1
      );

      rounds.push({
        round: "Sudden Moon",
        winner_player_id: suddenSorted[0].player_id,
        rolls: suddenRolls,
      });

      sortedScore = players
        .map((player) => ({
          player_id: player.player_id,
          player_name: player.player_name || "Unknown Vessel",
          score: scores.get(player.player_id) || 0,
        }))
        .sort((a, b) => b.score - a.score);
    }
  }

  return {
    rollData: {
      mode: "Eclipse Dice Duel",
      rounds,
    },
    placements: sortedScore.map((item, index) => ({
      player_id: item.player_id,
      player_name: item.player_name,
      total_score: item.score,
      placement: index + 1,
      payout_silver: 0,
      status: index === 0 ? "win" : "lose",
    })) as ResolvedParticipant[],
  };
}

function resolveMoonfall(players: LobbyPlayer[]) {
  const scores = new Map<string, number>();
  const rounds: unknown[] = [];

  players.forEach((player) => scores.set(player.player_id, 0));

  for (let roundIndex = 1; roundIndex <= 3; roundIndex += 1) {
    const rolls = players.map((player) => ({
      player_id: player.player_id,
      player_name: player.player_name || "Unknown Vessel",
      ...rollDice(),
      tieBreaker: Math.random(),
    }));

    const sorted = [...rolls].sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.tieBreaker - a.tieBreaker;
    });

    const pointMap = [3, 2, 1, 0];

    sorted.forEach((item, index) => {
      scores.set(
        item.player_id,
        (scores.get(item.player_id) || 0) + (pointMap[index] || 0)
      );
    });

    rounds.push({
      round: roundIndex,
      rolls: sorted,
    });
  }

  let sortedScore = players
    .map((player) => ({
      player_id: player.player_id,
      player_name: player.player_name || "Unknown Vessel",
      score: scores.get(player.player_id) || 0,
    }))
    .sort((a, b) => b.score - a.score);

  while (
    sortedScore.length > 1 &&
    sortedScore[0].score === sortedScore[1].score
  ) {
    const tied = sortedScore.filter((item) => item.score === sortedScore[0].score);

    const suddenRolls = tied.map((player) => ({
      player_id: player.player_id,
      player_name: player.player_name,
      ...rollDice(),
      tieBreaker: Math.random(),
    }));

    const suddenSorted = [...suddenRolls].sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.tieBreaker - a.tieBreaker;
    });

    scores.set(
      suddenSorted[0].player_id,
      (scores.get(suddenSorted[0].player_id) || 0) + 1
    );

    rounds.push({
      round: "Sudden Moon",
      winner_player_id: suddenSorted[0].player_id,
      rolls: suddenSorted,
    });

    sortedScore = players
      .map((player) => ({
        player_id: player.player_id,
        player_name: player.player_name || "Unknown Vessel",
        score: scores.get(player.player_id) || 0,
      }))
      .sort((a, b) => b.score - a.score);
  }

  return {
    rollData: {
      mode: "Moonfall Lobby Table",
      rounds,
    },
    placements: sortedScore.map((item, index) => ({
      player_id: item.player_id,
      player_name: item.player_name,
      total_score: item.score,
      placement: index + 1,
      payout_silver: 0,
      status: index === 0 ? "win" : index === 1 ? "runner_up" : "lose",
    })) as ResolvedParticipant[],
  };
}

export default function FortuneWagerArena({
  session,
  player,
  onRefresh,
}: FortuneWagerArenaProps) {
  const [lobbies, setLobbies] = useState<WagerLobby[]>([]);
  const [selectedLobbyId, setSelectedLobbyId] = useState("");
  const [selectedLobby, setSelectedLobby] = useState<WagerLobby | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [rounds, setRounds] = useState<WagerRound[]>([]);
  const [latestRoundPlayers, setLatestRoundPlayers] = useState<
    WagerRoundPlayer[]
  >([]);
  const [taunts, setTaunts] = useState<WagerTaunt[]>([]);
  const [selectedLobbyType, setSelectedLobbyType] = useState<"duel" | "moonfall">(
    "duel"
  );
  const [selectedTableKey, setSelectedTableKey] = useState("silver");
  const [customBetSilver, setCustomBetSilver] = useState(75);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [isArenaLoading, setIsArenaLoading] = useState(false);

  const isPlayer = session?.role === "player" && Boolean(session.playerId);
  const playerBalance = player ? getPlayerCurrency(player) : null;

  const selectedTable = TABLE_OPTIONS.find(
    (table) => table.key === selectedTableKey
  );

  const effectiveBetSilver =
    selectedTable?.key === "black"
      ? Number(customBetSilver || 0)
      : Number(selectedTable?.bet || 10);

  const currentLobbyPlayer = useMemo(() => {
    if (!session?.playerId) return null;

    return (
      lobbyPlayers.find((item) => item.player_id === session.playerId) || null
    );
  }, [lobbyPlayers, session?.playerId]);

  const readyPlayers = useMemo(() => {
    return lobbyPlayers.filter((item) => item.status === "ready");
  }, [lobbyPlayers]);

  const waitingPlayers = useMemo(() => {
    return lobbyPlayers.filter((item) => item.status === "waiting");
  }, [lobbyPlayers]);

  const latestRound = rounds[0] || null;

  const readPlayerCurrency = async (playerId: string) => {
    const { data, error } = await supabase
      .from("players")
      .select("id, character_name, gold, silver, bronze")
      .eq("id", playerId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return normalizeCurrency({
      gold: Number(data.gold || 0),
      silver: Number(data.silver || 0),
      bronze: Number(data.bronze || 0),
    });
  };

  const updatePlayerCurrency = async (
    playerId: string,
    nextCurrency: LunariaCurrency
  ) => {
    const normalized = normalizeCurrency(nextCurrency);

    const { error } = await supabase
      .from("players")
      .update({
        gold: normalized.gold,
        silver: normalized.silver,
        bronze: normalized.bronze,
      })
      .eq("id", playerId);

    if (error) throw new Error(error.message);

    return normalized;
  };

  const loadPlayersWithNames = async (lobbyId: string) => {
    const { data, error } = await supabase
      .from("fortune_wager_lobby_players")
      .select("id, lobby_id, player_id, seat_number, status, joined_at, last_seen_at")
      .eq("lobby_id", lobbyId)
      .neq("status", "left")
      .order("joined_at", { ascending: true });

    if (error) throw new Error(error.message);

    const rows = (data as unknown as LobbyPlayer[] | null) || [];
    const playerIds = [...new Set(rows.map((item) => item.player_id))];

    if (!playerIds.length) return rows;

    const { data: playerRows } = await supabase
      .from("players")
      .select("id, character_name")
      .in("id", playerIds);

    const nameMap = new Map<string, string>();

    (
      (playerRows as unknown as { id: string; character_name: string }[] | null) ||
      []
    ).forEach((item) => {
      nameMap.set(item.id, item.character_name);
    });

    return rows.map((item) => ({
      ...item,
      player_name: nameMap.get(item.player_id) || "Unknown Vessel",
    }));
  };

  const loadArena = async (preferredLobbyId?: string) => {
    setIsArenaLoading(true);
    setErrorMessage("");

    try {
      const { data: lobbyRows, error: lobbyError } = await supabase
        .from("fortune_wager_lobbies")
        .select(
          "id, lobby_type, table_name, bet_silver, custom_bet_silver, status, current_round_id, created_by, created_at, updated_at"
        )
        .neq("status", "closed")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (lobbyError) throw new Error(lobbyError.message);

      const lobbyList = (lobbyRows as unknown as WagerLobby[] | null) || [];
      setLobbies(lobbyList);

      const stillExists = lobbyList.find((item) => item.id === selectedLobbyId);
      const targetLobbyId =
        preferredLobbyId || stillExists?.id || lobbyList[0]?.id || "";

      setSelectedLobbyId(targetLobbyId);

      const targetLobby =
        lobbyList.find((item) => item.id === targetLobbyId) || null;

      setSelectedLobby(targetLobby);

      if (!targetLobbyId) {
        setLobbyPlayers([]);
        setRounds([]);
        setLatestRoundPlayers([]);
        setTaunts([]);
        setIsArenaLoading(false);
        return;
      }

      const players = await loadPlayersWithNames(targetLobbyId);
      setLobbyPlayers(players);

      const { data: roundRows, error: roundError } = await supabase
        .from("fortune_wager_rounds")
        .select(
          "id, lobby_id, round_number, status, bet_silver, total_pot_silver, tax_silver, net_pot_silver, winner_player_id, runner_up_player_id, roll_data, started_at, settled_at"
        )
        .eq("lobby_id", targetLobbyId)
        .order("started_at", { ascending: false })
        .limit(5);

      if (roundError) throw new Error(roundError.message);

      const roundList = (roundRows as unknown as WagerRound[] | null) || [];
      setRounds(roundList);

      const latest = roundList[0];

      if (latest) {
        const { data: roundPlayerRows, error: roundPlayerError } =
          await supabase
            .from("fortune_wager_round_players")
            .select(
              "id, round_id, lobby_id, player_id, player_name, bet_silver, total_score, placement, payout_silver, status, created_at"
            )
            .eq("round_id", latest.id)
            .order("placement", { ascending: true });

        if (roundPlayerError) throw new Error(roundPlayerError.message);

        setLatestRoundPlayers(
          (roundPlayerRows as unknown as WagerRoundPlayer[] | null) || []
        );
      } else {
        setLatestRoundPlayers([]);
      }

      const { data: tauntRows, error: tauntError } = await supabase
        .from("fortune_wager_taunts")
        .select("id, lobby_id, player_id, player_name, message, created_at")
        .eq("lobby_id", targetLobbyId)
        .order("created_at", { ascending: false })
        .limit(12);

      if (tauntError) throw new Error(tauntError.message);

      setTaunts((tauntRows as unknown as WagerTaunt[] | null) || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Fortune Arena error.";
      setErrorMessage(message);
    } finally {
      setIsArenaLoading(false);
    }
  };

  React.useEffect(() => {
    loadArena();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateLobby = async () => {
    setErrorMessage("");
    setNotice("");

    if (!isPlayer || !session?.playerId) {
      setErrorMessage("Masuk sebagai player untuk membuat lobby.");
      return;
    }

    if (effectiveBetSilver < 5) {
      setErrorMessage("Minimal bet adalah 5 Silver.");
      return;
    }

    if (effectiveBetSilver > 200) {
      setErrorMessage("Custom bet maksimal V1 adalah 200 Silver.");
      return;
    }

    setIsWorking(true);

    try {
      const tableName =
        selectedTable?.key === "black"
          ? `Black Moon ${effectiveBetSilver}S`
          : selectedTable?.name || "Silver Eclipse";

      const { data: lobbyData, error: lobbyError } = await supabase
        .from("fortune_wager_lobbies")
        .insert({
          lobby_type: selectedLobbyType,
          table_name: tableName,
          bet_silver: effectiveBetSilver,
          custom_bet_silver:
            selectedTable?.key === "black" ? effectiveBetSilver : null,
          status: "waiting",
          created_by: session.playerId,
          updated_at: new Date().toISOString(),
        })
        .select(
          "id, lobby_type, table_name, bet_silver, custom_bet_silver, status, current_round_id, created_by, created_at, updated_at"
        )
        .single();

      if (lobbyError) throw new Error(lobbyError.message);

      const lobby = lobbyData as unknown as WagerLobby;

      const { error: joinError } = await supabase
        .from("fortune_wager_lobby_players")
        .insert({
          lobby_id: lobby.id,
          player_id: session.playerId,
          seat_number: 1,
          status: "waiting",
        });

      if (joinError) throw new Error(joinError.message);

      setNotice(`${tableName} berhasil dibuka.`);
      await loadArena(lobby.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown create lobby error.";
      setErrorMessage(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleJoinLobby = async (lobby: WagerLobby) => {
    setErrorMessage("");
    setNotice("");

    if (!isPlayer || !session?.playerId) {
      setErrorMessage("Masuk sebagai player untuk join lobby.");
      return;
    }

    const alreadyInside = lobbyPlayers.some(
      (item) => item.player_id === session.playerId && item.lobby_id === lobby.id
    );

    if (alreadyInside) {
      setSelectedLobbyId(lobby.id);
      await loadArena(lobby.id);
      return;
    }

    setIsWorking(true);

    try {
      const lobbyMembers = await loadPlayersWithNames(lobby.id);
      const nextSeat = lobbyMembers.length + 1;

      if (lobbyMembers.length >= 8) {
        setErrorMessage("Lobby terlalu penuh. Maksimal 8 orang termasuk waiting.");
        return;
      }

      const { error } = await supabase
        .from("fortune_wager_lobby_players")
        .insert({
          lobby_id: lobby.id,
          player_id: session.playerId,
          seat_number: nextSeat,
          status: "waiting",
        });

      if (error) throw new Error(error.message);

      await supabase.from("fortune_wager_taunts").insert({
        lobby_id: lobby.id,
        player_id: session.playerId,
        player_name: player?.character_name || "Unknown Vessel",
        message: "Aku masuk. Meja aman?",
      });

      setNotice("Berhasil masuk lobby. Kamu masuk Waiting Lobby.");
      await loadArena(lobby.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown join lobby error.";
      setErrorMessage(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleToggleReady = async () => {
    setErrorMessage("");
    setNotice("");

    if (!currentLobbyPlayer || !selectedLobby) {
      setErrorMessage("Kamu belum berada di lobby ini.");
      return;
    }

    if (selectedLobby.status === "playing") {
      setErrorMessage("Round sedang berjalan. Tunggu babak berikutnya.");
      return;
    }

    const nextStatus = currentLobbyPlayer.status === "ready" ? "waiting" : "ready";

    setIsWorking(true);

    try {
      const { error } = await supabase
        .from("fortune_wager_lobby_players")
        .update({
          status: nextStatus,
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", currentLobbyPlayer.id);

      if (error) throw new Error(error.message);

      setNotice(nextStatus === "ready" ? "Ready. Meja mulai panas." : "Ready dibatalkan.");
      await loadArena(selectedLobby.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown ready error.";
      setErrorMessage(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleSendTaunt = async (message: string) => {
    setErrorMessage("");

    if (!selectedLobby) {
      setErrorMessage("Pilih lobby dulu.");
      return;
    }

    if (!isPlayer || !session?.playerId) {
      setErrorMessage("Masuk sebagai player untuk mengirim taunt.");
      return;
    }

    if (!currentLobbyPlayer) {
      setErrorMessage("Masuk ke lobby dulu sebelum kirim taunt.");
      return;
    }

    try {
      const { error } = await supabase.from("fortune_wager_taunts").insert({
        lobby_id: selectedLobby.id,
        player_id: session.playerId,
        player_name: player?.character_name || "Unknown Vessel",
        message,
      });

      if (error) throw new Error(error.message);

      await loadArena(selectedLobby.id);
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Unknown taunt error.";
      setErrorMessage(text);
    }
  };

  const handleLeaveLobby = async () => {
    setErrorMessage("");
    setNotice("");

    if (!currentLobbyPlayer || !selectedLobby) {
      setErrorMessage("Kamu belum berada di lobby.");
      return;
    }

    setIsWorking(true);

    try {
      const { error } = await supabase
        .from("fortune_wager_lobby_players")
        .update({
          status: "left",
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", currentLobbyPlayer.id);

      if (error) throw new Error(error.message);

      setNotice("Kamu keluar dari lobby.");
      await loadArena(selectedLobby.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown leave lobby error.";
      setErrorMessage(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleCloseLobby = async () => {
    setErrorMessage("");
    setNotice("");

    if (!selectedLobby) {
      setErrorMessage("Pilih lobby dulu.");
      return;
    }

    const isCreator = selectedLobby.created_by === session?.playerId;
    const isAdmin = session?.role === "admin";

    if (!isCreator && !isAdmin) {
      setErrorMessage("Hanya pembuat lobby atau admin yang bisa menutup lobby.");
      return;
    }

    setIsWorking(true);

    try {
      const { error } = await supabase
        .from("fortune_wager_lobbies")
        .update({
          status: "closed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedLobby.id);

      if (error) throw new Error(error.message);

      setNotice("Lobby ditutup.");
      await loadArena();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown close lobby error.";
      setErrorMessage(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleStartRound = async () => {
    setErrorMessage("");
    setNotice("");

    if (!selectedLobby) {
      setErrorMessage("Pilih lobby dulu.");
      return;
    }

    if (!isPlayer || !session?.playerId) {
      setErrorMessage("Masuk sebagai player untuk memulai round.");
      return;
    }

    if (!currentLobbyPlayer) {
      setErrorMessage("Kamu harus join lobby dulu.");
      return;
    }

    if (selectedLobby.status === "playing") {
      setErrorMessage("Round sedang berjalan.");
      return;
    }

    const maxPlayers = selectedLobby.lobby_type === "duel" ? 2 : 4;
    const playersForRound = readyPlayers.slice(0, maxPlayers);

    if (playersForRound.length < 2) {
      setErrorMessage("Minimal 2 player harus Ready.");
      return;
    }

    if (selectedLobby.lobby_type === "duel" && playersForRound.length !== 2) {
      setErrorMessage("Eclipse Dice Duel hanya butuh 2 player Ready.");
      return;
    }

    const betSilver = Number(selectedLobby.bet_silver || 0);

    if (betSilver < 5) {
      setErrorMessage("Bet lobby tidak valid.");
      return;
    }

    setIsWorking(true);

    try {
      const playerIds = playersForRound.map((item) => item.player_id);

      const { data: walletRows, error: walletError } = await supabase
        .from("players")
        .select("id, character_name, gold, silver, bronze")
        .in("id", playerIds);

      if (walletError) throw new Error(walletError.message);

      const wallets = (walletRows as unknown as PlayerWalletRow[] | null) || [];
      const walletMap = new Map<string, PlayerWalletRow>();

      wallets.forEach((item) => walletMap.set(item.id, item));

      for (const item of playersForRound) {
        const wallet = walletMap.get(item.player_id);

        if (!wallet) {
          throw new Error(`${item.player_name || "Player"} tidak ditemukan.`);
        }

        const balance = getPlayerCurrency(wallet);
        const cost = silverToCurrency(betSilver);

        if (!canAfford(balance, cost)) {
          throw new Error(
            `${wallet.character_name} tidak cukup saldo untuk bet ${formatCurrency(
              cost
            )}.`
          );
        }
      }

      for (const item of playersForRound) {
        const wallet = walletMap.get(item.player_id);

        if (!wallet) continue;

        const balance = getPlayerCurrency(wallet);
        const afterBet = subtractCurrency(balance, silverToCurrency(betSilver));

        await updatePlayerCurrency(item.player_id, afterBet);
      }

      const totalPot = betSilver * playersForRound.length;
      const taxSilver = Math.floor(totalPot * 0.05);
      const netPot = totalPot - taxSilver;

      const result =
        selectedLobby.lobby_type === "duel"
          ? resolveDuel(playersForRound)
          : resolveMoonfall(playersForRound);

      const placements = [...result.placements].sort(
        (a, b) => a.placement - b.placement
      );

      const winner = placements[0];
      const runnerUp = placements[1] || null;

      if (playersForRound.length <= 2) {
        winner.payout_silver = netPot;
      } else {
        winner.payout_silver = Math.floor(netPot * 0.8);

        if (runnerUp) {
          runnerUp.payout_silver = netPot - winner.payout_silver;
        }
      }

      const { data: newRound, error: roundError } = await supabase
        .from("fortune_wager_rounds")
        .insert({
          lobby_id: selectedLobby.id,
          round_number: (rounds[0]?.round_number || 0) + 1,
          status: "settled",
          bet_silver: betSilver,
          total_pot_silver: totalPot,
          tax_silver: taxSilver,
          net_pot_silver: netPot,
          winner_player_id: winner.player_id,
          runner_up_player_id:
            playersForRound.length > 2 && runnerUp ? runnerUp.player_id : null,
          roll_data: result.rollData,
          started_at: new Date().toISOString(),
          settled_at: new Date().toISOString(),
        })
        .select(
          "id, lobby_id, round_number, status, bet_silver, total_pot_silver, tax_silver, net_pot_silver, winner_player_id, runner_up_player_id, roll_data, started_at, settled_at"
        )
        .single();

      if (roundError) throw new Error(roundError.message);

      const round = newRound as unknown as WagerRound;

      for (const placement of placements) {
        const payout = Number(placement.payout_silver || 0);

        if (payout > 0) {
          const currentCurrency = await readPlayerCurrency(placement.player_id);

          if (currentCurrency) {
            const nextCurrency = addCurrency(
              currentCurrency,
              silverToCurrency(payout)
            );

            await updatePlayerCurrency(placement.player_id, nextCurrency);
          }
        }

        const finalStatus =
          placement.placement === 1
            ? "win"
            : placement.placement === 2 && playersForRound.length > 2
            ? "runner_up"
            : "lose";

        await supabase.from("fortune_wager_round_players").insert({
          round_id: round.id,
          lobby_id: selectedLobby.id,
          player_id: placement.player_id,
          player_name: placement.player_name,
          bet_silver: betSilver,
          total_score: placement.total_score,
          placement: placement.placement,
          payout_silver: payout,
          status: finalStatus,
        });

        await supabase.from("fortune_logs").insert({
          player_id: placement.player_id,
          mode: "Fortune Wager",
          detail: `${selectedLobby.table_name} • ${placement.player_name} • Rank #${placement.placement}`,
          result:
            placement.placement === 1
              ? "Pot Secured"
              : placement.placement === 2 && payout > 0
              ? "Runner Up Return"
              : "Saldo Pindah Tangan",
          silver_change: payout - betSilver,
        });
      }

      await supabase
        .from("fortune_wager_lobby_players")
        .update({
          status: "waiting",
          last_seen_at: new Date().toISOString(),
        })
        .in(
          "id",
          playersForRound.map((item) => item.id)
        );

      await supabase
        .from("fortune_wager_lobbies")
        .update({
          status: "intermission",
          current_round_id: round.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedLobby.id);

      await supabase.from("fortune_wager_taunts").insert({
        lobby_id: selectedLobby.id,
        player_id: winner.player_id,
        player_name: winner.player_name,
        message: "GG, saldonya aman di dompetku.",
      });

      setNotice(
        `${winner.player_name} menang dan menerima ${formatCurrency(
          silverToCurrency(winner.payout_silver)
        )}. Tax Fortune Hall: ${formatCurrency(silverToCurrency(taxSilver))}.`
      );

      await loadArena(selectedLobby.id);
      await onRefresh?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown start round error.";
      setErrorMessage(message);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-amber-400/20 bg-[radial-gradient(circle_at_top_left,rgba(245,199,90,0.13),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_28%),linear-gradient(135deg,rgba(5,8,20,0.98),rgba(9,15,35,0.98),rgba(30,10,28,0.92))] p-6 text-slate-100 shadow-[0_0_55px_rgba(245,158,11,0.08)]">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              PvP Wager Arena
            </p>

            <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">
              Fortune Hall Lobby Tables
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Buat lobby taruhan RP antar player. Semua rank bisa ikut selama
              saldo cukup. Player yang masuk saat meja ramai dapat menunggu
              babak berikutnya sambil kirim taunt.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadArena(selectedLobbyId)}
            disabled={isArenaLoading}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-300 transition hover:border-amber-400/30 hover:text-amber-200 disabled:opacity-50"
          >
            {isArenaLoading ? "Refreshing..." : "Refresh Arena"}
          </button>
        </div>

        {notice ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
            {notice}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm font-bold text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">
          <aside className="space-y-5 xl:col-span-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                Create Lobby
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/25 p-2">
                <button
                  type="button"
                  onClick={() => setSelectedLobbyType("duel")}
                  className={`rounded-xl px-3 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                    selectedLobbyType === "duel"
                      ? "bg-amber-500/20 text-amber-200"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Duel 1v1
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLobbyType("moonfall")}
                  className={`rounded-xl px-3 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                    selectedLobbyType === "moonfall"
                      ? "bg-violet-500/20 text-violet-200"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  2–4 Lobby
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {TABLE_OPTIONS.map((table) => (
                  <button
                    key={table.key}
                    type="button"
                    onClick={() => setSelectedTableKey(table.key)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedTableKey === table.key
                        ? "border-amber-400/35 bg-amber-500/10"
                        : "border-white/10 bg-black/25 hover:border-amber-400/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-white">
                        {table.name}
                      </p>
                      <p className="text-sm font-black text-amber-300">
                        {table.bet > 0 ? `${table.bet}S` : "Custom"}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{table.desc}</p>
                  </button>
                ))}
              </div>

              {selectedTableKey === "black" ? (
                <div className="mt-4">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Custom Bet Silver
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={customBetSilver}
                    onChange={(event) =>
                      setCustomBetSilver(Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-amber-400/40"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleCreateLobby}
                disabled={isWorking || !isPlayer}
                className="mt-5 w-full rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/20 to-violet-500/15 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-amber-100 transition hover:border-amber-300/55 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
              >
                Create Table
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">
                Open Lobbies
              </p>

              <div className="mt-4 space-y-3">
                {lobbies.length ? (
                  lobbies.map((lobby) => (
                    <button
                      key={lobby.id}
                      type="button"
                      onClick={() => loadArena(lobby.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedLobbyId === lobby.id
                          ? "border-violet-400/35 bg-violet-500/10"
                          : "border-white/10 bg-black/25 hover:border-violet-400/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-white">
                            {lobby.table_name}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {lobby.lobby_type === "duel"
                              ? "Eclipse Dice Duel"
                              : "Moonfall Lobby Table"}
                          </p>
                        </div>
                        <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-200">
                          {lobby.bet_silver}S
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        {lobby.status}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-500">
                    Belum ada lobby terbuka.
                  </p>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-5 xl:col-span-8">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                    Selected Table
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-white">
                    {selectedLobby?.table_name || "No Lobby Selected"}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {selectedLobby
                      ? selectedLobby.lobby_type === "duel"
                        ? "1v1 cepat. Dua player Ready bisa langsung Start."
                        : "Lobby 2–4 player. Player baru bisa waiting untuk babak berikutnya."
                      : "Buat atau pilih lobby dulu."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedLobby ? (
                    <button
                      type="button"
                      onClick={() => handleJoinLobby(selectedLobby)}
                      disabled={isWorking || !isPlayer || Boolean(currentLobbyPlayer)}
                      className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
                    >
                      {currentLobbyPlayer ? "Inside" : "Join Lobby"}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleToggleReady}
                    disabled={isWorking || !currentLobbyPlayer}
                    className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
                  >
                    {currentLobbyPlayer?.status === "ready"
                      ? "Cancel Ready"
                      : "Ready"}
                  </button>

                  <button
                    type="button"
                    onClick={handleStartRound}
                    disabled={isWorking || !selectedLobby || readyPlayers.length < 2}
                    className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
                  >
                    Start Round
                  </button>

                  <button
                    type="button"
                    onClick={handleLeaveLobby}
                    disabled={isWorking || !currentLobbyPlayer}
                    className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-600"
                  >
                    Leave
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseLobby}
                    disabled={isWorking || !selectedLobby}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400 transition hover:border-red-400/25 hover:text-red-200 disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <ArenaStat
                  label="Bet"
                  value={
                    selectedLobby
                      ? formatCurrency(silverToCurrency(selectedLobby.bet_silver))
                      : "-"
                  }
                  tone="text-amber-300"
                />
                <ArenaStat
                  label="Ready"
                  value={`${readyPlayers.length}/${
                    selectedLobby?.lobby_type === "duel" ? 2 : 4
                  }`}
                  tone="text-emerald-300"
                />
                <ArenaStat
                  label="Balance"
                  value={playerBalance ? formatCurrency(playerBalance) : "-"}
                  tone="text-sky-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                  Lobby Players
                </p>

                <div className="mt-4 space-y-3">
                  {lobbyPlayers.length ? (
                    lobbyPlayers.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div>
                          <p className="text-sm font-black text-white">
                            {item.player_name || "Unknown Vessel"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                            Seat {item.seat_number || "-"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${
                            item.status === "ready"
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                              : item.status === "playing"
                              ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                              : "border-white/10 bg-white/[0.04] text-slate-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-500">
                      Lobby kosong.
                    </p>
                  )}
                </div>

                {waitingPlayers.length ? (
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Waiting player bisa ikut babak berikutnya setelah klik Ready.
                  </p>
                ) : null}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">
                  Quick Taunt
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  {QUICK_TAUNTS.map((taunt) => (
                    <button
                      key={taunt}
                      type="button"
                      onClick={() => handleSendTaunt(taunt)}
                      disabled={!currentLobbyPlayer}
                      className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-sm font-bold text-slate-300 transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {taunt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                  Latest Round
                </p>

                {latestRound ? (
                  <div className="mt-4">
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                      <p className="text-sm font-black text-white">
                        Round #{latestRound.round_number}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        Pot {latestRound.total_pot_silver}S • Tax{" "}
                        {latestRound.tax_silver}S • Net{" "}
                        {latestRound.net_pot_silver}S
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatTime(latestRound.started_at)}
                      </p>
                    </div>

                    <div className="mt-3 space-y-3">
                      {latestRoundPlayers.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
                        >
                          <div>
                            <p className="text-sm font-black text-white">
                              #{item.placement || "-"} {item.player_name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Score {item.total_score} • Bet {item.bet_silver}S
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${
                              item.status === "win"
                                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                                : item.status === "runner_up"
                                ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
                                : "border-red-400/25 bg-red-400/10 text-red-300"
                            }`}
                          >
                            {item.payout_silver > 0
                              ? `+${item.payout_silver}S`
                              : item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-500">
                    Belum ada round.
                  </p>
                )}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">
                  Lobby Chat
                </p>

                <div className="mt-4 space-y-3">
                  {taunts.length ? (
                    taunts.map((taunt) => (
                      <div
                        key={taunt.id}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-white">
                            {taunt.player_name}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                            {formatTime(taunt.created_at)}
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-300">
                          {taunt.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-500">
                      Belum ada taunt. Jangan malu, panasinnn.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-6 text-slate-500">
          V1 memakai auto-roll instan setelah Start Round. Player yang masuk
          ketika lobby sudah ramai akan tetap bisa waiting untuk babak berikutnya.
          Sistem memakai Silver bulat untuk tax; tax 5% dibulatkan ke bawah.
        </p>
      </div>
    </section>
  );
}

function ArenaStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 truncate text-xl font-black ${tone}`}>{value}</p>
    </div>
  );
}
