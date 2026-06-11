 "use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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
  player_rank?: string;
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
  roll_data: RollData | null;
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

type WalletRow = {
  id: string;
  character_name: string;
  gold: number;
  silver: number;
  bronze: number;
};

type DiceRoll = {
  player_id: string;
  player_name: string;
  dice: number[];
  total: number;
  tie_breaker: number;
};

type RollData = {
  mode: "Moonfall Dice";
  rolls: DiceRoll[];
  winner_player_id: string;
};

type ResolvedPlayer = {
  player_id: string;
  player_name: string;
  total_score: number;
  placement: number;
  payout_silver: number;
  status: "win" | "runner_up" | "lose";
};

const TABLE_OPTIONS = [
  {
    key: "silver",
    name: "Silver Eclipse",
    bet: 10,
    desc: "Meja standar, cepat panas.",
  },
  {
    key: "gold",
    name: "Gold Crescent",
    bet: 25,
    desc: "Taruhan mulai terasa.",
  },
  {
    key: "royal",
    name: "Royal Moon",
    bet: 50,
    desc: "Meja besar untuk yang berani.",
  },
  {
    key: "black",
    name: "Black Moon",
    bet: 0,
    desc: "Custom bet untuk meja bar-bar.",
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

const DICE_FACE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

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

function getPlayerCurrency(player: PlayerProfile | WalletRow): LunariaCurrency {
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

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function rollThreeDice() {
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

function resolveMoonfallDice(players: LobbyPlayer[]) {
  const rolls: DiceRoll[] = players.map((player) => {
    const result = rollThreeDice();

    return {
      player_id: player.player_id,
      player_name: player.player_name || "Unknown Vessel",
      dice: result.dice,
      total: result.total,
      tie_breaker: Math.random(),
    };
  });

  const sorted = [...rolls].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return b.tie_breaker - a.tie_breaker;
  });

  const winner = sorted[0];

  const placements: ResolvedPlayer[] = sorted.map((item, index) => ({
    player_id: item.player_id,
    player_name: item.player_name,
    total_score: item.total,
    placement: index + 1,
    payout_silver: 0,
    status: index === 0 ? "win" : index === 1 ? "runner_up" : "lose",
  }));

  return {
    rollData: {
      mode: "Moonfall Dice",
      rolls,
      winner_player_id: winner.player_id,
    } satisfies RollData,
    placements,
  };
}

function arrangeSeats(players: LobbyPlayer[], currentPlayerId?: string) {
  const activePlayers = players.filter((item) => item.status !== "left");

  if (!activePlayers.length) {
    return [null, null, null, null] as (LobbyPlayer | null)[];
  }

  const currentPlayer = activePlayers.find(
    (item) => item.player_id === currentPlayerId
  );

  const others = activePlayers.filter(
    (item) => item.player_id !== currentPlayer?.player_id
  );

  const ordered = currentPlayer ? [currentPlayer, ...others] : [...activePlayers];

  return [
    ordered[0] || null,
    ordered[1] || null,
    ordered[2] || null,
    ordered[3] || null,
  ] as (LobbyPlayer | null)[];
}

export default function FortuneGameCasino() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [lobbies, setLobbies] = useState<WagerLobby[]>([]);
  const [selectedLobbyId, setSelectedLobbyId] = useState("");
  const [selectedLobby, setSelectedLobby] = useState<WagerLobby | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [taunts, setTaunts] = useState<WagerTaunt[]>([]);
  const [latestRound, setLatestRound] = useState<WagerRound | null>(null);
  const [latestRoundPlayers, setLatestRoundPlayers] = useState<WagerRoundPlayer[]>(
    []
  );
  const [selectedTableKey, setSelectedTableKey] = useState("gold");
  const [customBetSilver, setCustomBetSilver] = useState(75);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const isPlayer = session?.role === "player" && Boolean(session.playerId);
  const isAdmin = session?.role === "admin";
  const isLobbyCreator = Boolean(
    selectedLobby?.created_by && selectedLobby.created_by === session?.playerId
  );
  const canControlRound = isLobbyCreator;
  const playerBalance = player ? getPlayerCurrency(player) : null;

  const selectedTable = TABLE_OPTIONS.find(
    (table) => table.key === selectedTableKey
  );

  const effectiveBetSilver =
    selectedTableKey === "black"
      ? Number(customBetSilver || 0)
      : Number(selectedTable?.bet || 25);

  const currentLobbyPlayer = useMemo(() => {
    if (!session?.playerId) return null;

    return (
      lobbyPlayers.find((item) => item.player_id === session.playerId) || null
    );
  }, [lobbyPlayers, session?.playerId]);

  const readyPlayers = useMemo(() => {
    return lobbyPlayers.filter((item) => item.status === "ready");
  }, [lobbyPlayers]);

  const seats = useMemo(() => {
    return arrangeSeats(lobbyPlayers, session?.playerId);
  }, [lobbyPlayers, session?.playerId]);

  const latestTauntByPlayer = useMemo(() => {
    const map = new Map<string, WagerTaunt>();

    taunts.forEach((taunt) => {
      if (taunt.player_id && !map.has(taunt.player_id)) {
        map.set(taunt.player_id, taunt);
      }
    });

    return map;
  }, [taunts]);

  const latestRollMap = useMemo(() => {
    const map = new Map<string, DiceRoll>();

    latestRound?.roll_data?.rolls?.forEach((roll) => {
      map.set(roll.player_id, roll);
    });

    return map;
  }, [latestRound]);

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
  };

  const loadPlayersWithNames = async (lobbyId: string) => {
    const { data, error } = await supabase
      .from("fortune_wager_lobby_players")
      .select(
        "id, lobby_id, player_id, seat_number, status, joined_at, last_seen_at"
      )
      .eq("lobby_id", lobbyId)
      .neq("status", "left")
      .order("joined_at", { ascending: true });

    if (error) throw new Error(error.message);

    const rows = (data as unknown as LobbyPlayer[] | null) || [];
    const playerIds = [...new Set(rows.map((item) => item.player_id))];

    if (!playerIds.length) return rows;

    const { data: playerRows } = await supabase
      .from("players")
      .select("id, character_name, guild_rank")
      .in("id", playerIds);

    const nameMap = new Map<string, { name: string; rank: string }>();

    (
      (playerRows as unknown as
        | { id: string; character_name: string; guild_rank: string }[]
        | null) || []
    ).forEach((row) => {
      nameMap.set(row.id, {
        name: row.character_name,
        rank: row.guild_rank,
      });
    });

    return rows.map((row) => ({
      ...row,
      player_name: nameMap.get(row.player_id)?.name || "Unknown Vessel",
      player_rank: nameMap.get(row.player_id)?.rank || "Adventurer",
    }));
  };

  const loadGame = async (preferredLobbyId?: string) => {
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      setPlayer(null);
    }

    try {
      if (currentSession?.role === "player" && currentSession.playerId) {
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select(
            "id, character_name, race, pathway, guild_rank, gold, silver, bronze, status"
          )
          .eq("id", currentSession.playerId)
          .eq("status", "active")
          .maybeSingle();

        if (playerError) throw new Error(playerError.message);

        setPlayer((playerData as unknown as PlayerProfile | null) || null);
      }

      const { data: lobbyRows, error: lobbyError } = await supabase
        .from("fortune_wager_lobbies")
        .select(
          "id, lobby_type, table_name, bet_silver, custom_bet_silver, status, current_round_id, created_by, created_at, updated_at"
        )
        .neq("status", "closed")
        .order("updated_at", { ascending: false })
        .limit(12);

      if (lobbyError) throw new Error(lobbyError.message);

      const lobbyList = (lobbyRows as unknown as WagerLobby[] | null) || [];
      setLobbies(lobbyList);

      const targetLobbyId =
        preferredLobbyId ||
        selectedLobbyId ||
        lobbyList.find((lobby) => lobby.status !== "closed")?.id ||
        "";

      setSelectedLobbyId(targetLobbyId);

      const targetLobby =
        lobbyList.find((lobby) => lobby.id === targetLobbyId) || null;

      setSelectedLobby(targetLobby);

      if (!targetLobbyId) {
        setLobbyPlayers([]);
        setTaunts([]);
        setLatestRound(null);
        setLatestRoundPlayers([]);
        setIsLoading(false);
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
        .limit(1);

      if (roundError) throw new Error(roundError.message);

      const round =
        ((roundRows as unknown as WagerRound[] | null) || [])[0] || null;

      setLatestRound(round);

      if (round) {
        const { data: roundPlayerRows, error: roundPlayerError } = await supabase
          .from("fortune_wager_round_players")
          .select(
            "id, round_id, lobby_id, player_id, player_name, bet_silver, total_score, placement, payout_silver, status, created_at"
          )
          .eq("round_id", round.id)
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
        .limit(20);

      if (tauntError) throw new Error(tauntError.message);

      setTaunts((tauntRows as unknown as WagerTaunt[] | null) || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Fortune Game error.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("fortune-game-live-room")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fortune_wager_lobbies" },
        () => loadGame(selectedLobbyId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fortune_wager_lobby_players" },
        () => loadGame(selectedLobbyId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fortune_wager_rounds" },
        () => loadGame(selectedLobbyId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fortune_wager_round_players" },
        () => loadGame(selectedLobbyId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fortune_wager_taunts" },
        () => loadGame(selectedLobbyId)
      )
      .subscribe();

    const fallback = window.setInterval(() => {
      loadGame(selectedLobbyId);
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLobbyId]);

  useEffect(() => {
    if (!selectedLobby) return;
    if (!currentLobbyPlayer) return;
    if (!canControlRound) return;
    if (selectedLobby.status === "playing") return;
    if (readyPlayers.length < 2) return;
    if (isWorking || isRolling) return;

    const timer = window.setTimeout(() => {
      handleStartRound();
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedLobby?.id,
    selectedLobby?.status,
    currentLobbyPlayer?.id,
    canControlRound,
    readyPlayers.length,
    isWorking,
    isRolling,
  ]);

  const handleCreateLobby = async () => {
    setErrorMessage("");
    setNotice("");

    if (!isPlayer || !session?.playerId) {
      setErrorMessage("Masuk sebagai player untuk membuka meja.");
      return;
    }

    if (effectiveBetSilver < 5) {
      setErrorMessage("Minimal bet adalah 5 Silver.");
      return;
    }

    if (effectiveBetSilver > 500) {
      setErrorMessage("Custom bet maksimal V1 adalah 500 Silver.");
      return;
    }

    setIsWorking(true);

    try {
      const tableName =
        selectedTableKey === "black"
          ? `Black Moon ${effectiveBetSilver}S`
          : selectedTable?.name || "Gold Crescent";

      const { data: lobbyData, error: lobbyError } = await supabase
        .from("fortune_wager_lobbies")
        .insert({
          lobby_type: "moonfall",
          table_name: tableName,
          bet_silver: effectiveBetSilver,
          custom_bet_silver:
            selectedTableKey === "black" ? effectiveBetSilver : null,
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

      await supabase.from("fortune_wager_taunts").insert({
        lobby_id: lobby.id,
        player_id: session.playerId,
        player_name: player?.character_name || "Unknown Vessel",
        message: "Meja dibuka. Siapa berani masuk?",
      });

      setNotice(`${tableName} berhasil dibuka.`);
      await loadGame(lobby.id);
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
      setErrorMessage("Masuk sebagai player untuk join meja.");
      return;
    }

    setIsWorking(true);

    try {
      const members = await loadPlayersWithNames(lobby.id);
      const activeMember = members.find(
        (item) => item.player_id === session.playerId
      );

      if (activeMember) {
        setNotice("Kamu sudah berada di meja ini.");
        await loadGame(lobby.id);
        return;
      }

      if (members.length >= 8) {
        setErrorMessage("Lobby penuh. Maksimal 8 orang termasuk waiting.");
        return;
      }

      const { data: existingRows, error: existingError } = await supabase
        .from("fortune_wager_lobby_players")
        .select("id, status, seat_number")
        .eq("lobby_id", lobby.id)
        .eq("player_id", session.playerId)
        .limit(1);

      if (existingError) {
        throw new Error(existingError.message);
      }

      const existingRow =
        (
          (existingRows as unknown as
            | { id: string; status: string; seat_number: number | null }[]
            | null) || []
        )[0] || null;

      if (existingRow) {
        const { error: reviveError } = await supabase
          .from("fortune_wager_lobby_players")
          .update({
            status: "waiting",
            seat_number: existingRow.seat_number || members.length + 1,
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", existingRow.id);

        if (reviveError) {
          throw new Error(reviveError.message);
        }
      } else {
        const { error: insertError } = await supabase
          .from("fortune_wager_lobby_players")
          .insert({
            lobby_id: lobby.id,
            player_id: session.playerId,
            seat_number: members.length + 1,
            status: "waiting",
          });

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      await supabase.from("fortune_wager_taunts").insert({
        lobby_id: lobby.id,
        player_id: session.playerId,
        player_name: player?.character_name || "Unknown Vessel",
        message:
          lobby.status === "playing"
            ? "Aku masuk dulu, next round aku ikut."
            : "Aku masuk. Siapa yang panik?",
      });

      setNotice("Berhasil masuk lobby.");
      await loadGame(lobby.id);
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

    if (!selectedLobby || !currentLobbyPlayer) {
      setErrorMessage("Masuk ke meja dulu.");
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

      await supabase.from("fortune_wager_taunts").insert({
        lobby_id: selectedLobby.id,
        player_id: session?.playerId || null,
        player_name: player?.character_name || "Unknown Vessel",
        message:
          nextStatus === "ready"
            ? "Ready. Yang lain jangan lama."
            : "Aku mundur ready dulu.",
      });

      await loadGame(selectedLobby.id);
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
      setErrorMessage("Pilih meja dulu.");
      return;
    }

    if (!isPlayer || !session?.playerId || !currentLobbyPlayer) {
      setErrorMessage("Masuk ke lobby dulu untuk kirim taunt.");
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

      await loadGame(selectedLobby.id);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown taunt error.";
      setErrorMessage(text);
    }
  };

  const handleLeaveLobby = async () => {
    setErrorMessage("");
    setNotice("");

    if (!selectedLobby || !currentLobbyPlayer) {
      setErrorMessage("Kamu belum berada di meja.");
      return;
    }

    if (selectedLobby.status === "playing") {
      setErrorMessage(
        "Round sedang berjalan. Leave saat playing akan dibuat forfeit di versi berikutnya."
      );
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

      setNotice("Kamu keluar dari meja.");
      await loadGame(selectedLobby.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown leave error.";
      setErrorMessage(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleCloseLobby = async () => {
    setErrorMessage("");
    setNotice("");

    if (!selectedLobby) {
      setErrorMessage("Pilih meja dulu.");
      return;
    }

    const isCreator = selectedLobby.created_by === session?.playerId;

    if (!isCreator && !isAdmin) {
      setErrorMessage("Hanya pembuat meja atau admin yang bisa menutup meja.");
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

      setNotice("Meja ditutup.");
      await loadGame("");
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
      setErrorMessage("Pilih meja dulu.");
      return;
    }

    if (!isPlayer || !session?.playerId || !currentLobbyPlayer) {
      setErrorMessage("Masuk sebagai player di meja ini dulu.");
      return;
    }

    if (!canControlRound) {
      setErrorMessage("Round hanya bisa dimulai otomatis oleh pembuat lobby.");
      return;
    }

    if (selectedLobby.status === "playing") {
      setErrorMessage("Round sedang berjalan.");
      return;
    }

    const playersForRound = readyPlayers.slice(0, 4);

    if (playersForRound.length < 2) {
      setErrorMessage("Minimal 2 player harus Ready.");
      return;
    }

    const betSilver = Number(selectedLobby.bet_silver || 0);

    if (betSilver < 5) {
      setErrorMessage("Bet tidak valid.");
      return;
    }

    setIsWorking(true);
    setIsRolling(true);

    try {
      const playerIds = playersForRound.map((item) => item.player_id);

      const { data: walletRows, error: walletError } = await supabase
        .from("players")
        .select("id, character_name, gold, silver, bronze")
        .in("id", playerIds);

      if (walletError) throw new Error(walletError.message);

      const wallets = (walletRows as unknown as WalletRow[] | null) || [];
      const walletMap = new Map<string, WalletRow>();

      wallets.forEach((wallet) => {
        walletMap.set(wallet.id, wallet);
      });

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

      await supabase
        .from("fortune_wager_lobbies")
        .update({
          status: "playing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedLobby.id);

      await supabase
        .from("fortune_wager_lobby_players")
        .update({
          status: "playing",
          last_seen_at: new Date().toISOString(),
        })
        .in(
          "id",
          playersForRound.map((item) => item.id)
        );

      await supabase.from("fortune_wager_taunts").insert({
        lobby_id: selectedLobby.id,
        player_id: session.playerId,
        player_name: player?.character_name || "Unknown Vessel",
        message: "Dadu turun. Jangan kedip.",
      });

      await loadGame(selectedLobby.id);
      await sleep(1700);

      for (const item of playersForRound) {
        const wallet = walletMap.get(item.player_id);

        if (!wallet) continue;

        const balance = getPlayerCurrency(wallet);
        const nextBalance = subtractCurrency(balance, silverToCurrency(betSilver));

        await updatePlayerCurrency(item.player_id, nextBalance);
      }

      const totalPot = betSilver * playersForRound.length;
      const taxSilver = Math.floor(totalPot * 0.05);
      const netPot = totalPot - taxSilver;

      const result = resolveMoonfallDice(playersForRound);
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

      const { data: previousRounds } = await supabase
        .from("fortune_wager_rounds")
        .select("id")
        .eq("lobby_id", selectedLobby.id);

      const roundNumber = ((previousRounds || []).length || 0) + 1;

      const { data: roundData, error: roundError } = await supabase
        .from("fortune_wager_rounds")
        .insert({
          lobby_id: selectedLobby.id,
          round_number: roundNumber,
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

      const round = roundData as unknown as WagerRound;

      for (const placement of placements) {
        const payout = Number(placement.payout_silver || 0);

        if (payout > 0) {
          const currentCurrency = await readPlayerCurrency(placement.player_id);

          if (currentCurrency) {
            await updatePlayerCurrency(
              placement.player_id,
              addCurrency(currentCurrency, silverToCurrency(payout))
            );
          }
        }

        const finalStatus =
          placement.placement === 1
            ? "win"
            : placement.placement === 2 && payout > 0
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
          mode: "Moonfall Dice",
          detail: `${selectedLobby.table_name} • Rank #${placement.placement} • Roll ${placement.total_score}`,
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
        message: "GG. Saldonya aman di dompetku.",
      });

      setNotice(
        `${winner.player_name} menang dan menerima ${formatCurrency(
          silverToCurrency(winner.payout_silver)
        )}. Fortune Hall tax: ${formatCurrency(silverToCurrency(taxSilver))}.`
      );

      await loadGame(selectedLobby.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown start round error.";
      setErrorMessage(message);
    } finally {
      setIsRolling(false);
      setIsWorking(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#03050d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,199,90,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_32%),linear-gradient(135deg,#03050d,#080d1f,#140716)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1540px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[30px] border border-amber-300/20 bg-black/35 p-5 shadow-[0_0_60px_rgba(245,199,90,0.08)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/calendar"
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-300 transition hover:border-amber-300/30 hover:text-amber-200"
              >
                Back
              </Link>

              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">
                Live Table
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Fortune Hall Arena
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Private royal casino room untuk Moonfall Dice. Join meja, klik
              Ready, kirim taunt, lalu biarkan dadu memutuskan siapa yang
              pulang membawa pot.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <HeaderStat
              label="Balance"
              value={
                playerBalance
                  ? formatCurrency(playerBalance)
                  : session?.role === "admin"
                  ? "ADMIN"
                  : "-"
              }
              tone="text-amber-300"
            />

            <HeaderStat
              label="Table"
              value={selectedLobby?.table_name || "-"}
              tone="text-emerald-300"
            />

            <HeaderStat
              label="Status"
              value={selectedLobby?.status || "none"}
              tone="text-violet-300"
            />
          </div>
        </header>

        {notice ? (
          <div className="mt-4 rounded-[24px] border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
            {notice}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-[24px] border border-red-300/25 bg-red-400/10 p-4 text-sm font-bold text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-4 rounded-[24px] border border-sky-300/25 bg-sky-400/10 p-4 text-sm font-bold text-sky-200">
            Opening casino table...
          </div>
        ) : null}

        <div className="mt-5 grid flex-1 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="relative min-h-[760px] overflow-hidden rounded-[38px] border border-amber-300/20 bg-[radial-gradient(circle_at_center,rgba(245,199,90,0.12),transparent_36%),linear-gradient(135deg,rgba(7,11,25,0.92),rgba(4,6,15,0.98),rgba(18,6,22,0.92))] p-4 shadow-[0_0_80px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-3xl" />

            <CasinoSeat
              seat="B"
              player={seats[1]}
              positionClass="left-1/2 top-4 -translate-x-1/2"
              taunt={seats[1] ? latestTauntByPlayer.get(seats[1].player_id) : null}
              roll={seats[1] ? latestRollMap.get(seats[1].player_id) : null}
            />

            <CasinoSeat
              seat="C"
              player={seats[2]}
              positionClass="left-3 top-1/2 -translate-y-1/2"
              taunt={seats[2] ? latestTauntByPlayer.get(seats[2].player_id) : null}
              roll={seats[2] ? latestRollMap.get(seats[2].player_id) : null}
            />

            <CasinoSeat
              seat="D"
              player={seats[3]}
              positionClass="right-3 top-1/2 -translate-y-1/2"
              taunt={seats[3] ? latestTauntByPlayer.get(seats[3].player_id) : null}
              roll={seats[3] ? latestRollMap.get(seats[3].player_id) : null}
            />

            <CasinoSeat
              seat="A"
              player={seats[0]}
              positionClass="bottom-28 left-1/2 -translate-x-1/2"
              taunt={seats[0] ? latestTauntByPlayer.get(seats[0].player_id) : null}
              roll={seats[0] ? latestRollMap.get(seats[0].player_id) : null}
              isSelf
            />

            <div className="absolute left-1/2 top-1/2 flex h-[360px] w-[min(82vw,640px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[42px] border border-amber-300/30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_30%),linear-gradient(135deg,#0b5b42,#063b2e,#082419)] shadow-[inset_0_0_80px_rgba(0,0,0,0.35),0_0_70px_rgba(16,185,129,0.12)]">
              <div className="absolute inset-4 rounded-[34px] border border-amber-200/15" />
              <div className="absolute inset-8 rounded-[28px] border border-emerald-100/10" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-200">
                  Moonfall Dice
                </p>

                <DiceCenter isRolling={isRolling || selectedLobby?.status === "playing"} />

                <p className="mt-3 px-5 text-sm font-bold text-slate-200">
                  {selectedLobby
                    ? selectedLobby.status === "playing"
                      ? "Dadu sedang turun..."
                      : readyPlayers.length >= 2
                      ? "Minimal ready terpenuhi. Round akan dimulai otomatis."
                      : "Menunggu minimal 2 player Ready."
                    : "Pilih atau buat meja dulu."}
                </p>

                <div className="mt-4 rounded-2xl border border-amber-300/20 bg-black/35 px-5 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Current Pot
                  </p>

                  <p className="mt-1 text-3xl font-black text-amber-300">
                    {selectedLobby
                      ? formatCurrency(
                          silverToCurrency(
                            selectedLobby.bet_silver *
                              Math.max(readyPlayers.length, 2)
                          )
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-black/45 p-3 backdrop-blur-xl">
              {selectedLobby ? (
                <button
                  type="button"
                  onClick={() => handleJoinLobby(selectedLobby)}
                  disabled={isWorking || !isPlayer || Boolean(currentLobbyPlayer)}
                  className="casino-action border-sky-300/25 bg-sky-400/10 text-sky-200 disabled:opacity-45"
                >
                  {currentLobbyPlayer ? "Inside" : "Join"}
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleToggleReady}
                disabled={isWorking || !currentLobbyPlayer}
                className="casino-action border-emerald-300/25 bg-emerald-400/10 text-emerald-200 disabled:opacity-45"
              >
                {currentLobbyPlayer?.status === "ready" ? "Cancel Ready" : "Ready"}
              </button>

              {canControlRound ? (
                <button
                  type="button"
                  onClick={handleStartRound}
                  disabled={
                    isWorking ||
                    isRolling ||
                    !selectedLobby ||
                    readyPlayers.length < 2 ||
                    selectedLobby.status === "playing"
                  }
                  className="casino-action border-amber-300/30 bg-amber-400/10 text-amber-200 disabled:opacity-45"
                >
                  {readyPlayers.length >= 2 ? "Force Start" : "Need 2 Ready"}
                </button>
              ) : (
                <span className="casino-status-chip border-amber-300/20 bg-amber-400/10 text-amber-200">
                  Auto Start
                </span>
              )}

              <button
                type="button"
                onClick={handleLeaveLobby}
                disabled={isWorking || !currentLobbyPlayer}
                className="casino-action border-red-300/25 bg-red-400/10 text-red-200 disabled:opacity-45"
              >
                Leave
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[34px] border border-amber-300/20 bg-black/35 p-5 shadow-[0_0_45px_rgba(245,199,90,0.06)] backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                Open Casino Table
              </p>

              <div className="mt-4 space-y-3">
                {TABLE_OPTIONS.map((table) => (
                  <button
                    key={table.key}
                    type="button"
                    onClick={() => setSelectedTableKey(table.key)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedTableKey === table.key
                        ? "border-amber-300/35 bg-amber-400/10"
                        : "border-white/10 bg-white/[0.04] hover:border-amber-300/20"
                    }`}
                  >
                    <div className="flex justify-between gap-3">
                      <p className="font-black text-white">{table.name}</p>
                      <p className="font-black text-amber-300">
                        {table.bet > 0 ? `${table.bet}S` : "Custom"}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">{table.desc}</p>
                  </button>
                ))}
              </div>

              {selectedTableKey === "black" ? (
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Custom Silver
                  </p>

                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={customBetSilver}
                    onChange={(event) =>
                      setCustomBetSilver(Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-bold text-white outline-none focus:border-amber-300/40"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleCreateLobby}
                disabled={isWorking || !isPlayer}
                className="mt-5 w-full rounded-2xl border border-amber-300/35 bg-gradient-to-r from-amber-500/20 to-violet-500/15 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-amber-100 transition hover:border-amber-200/60 disabled:opacity-45"
              >
                Create Table
              </button>

              <div className="mt-4 space-y-2">
                {lobbies.length ? (
                  lobbies.map((lobby) => (
                    <button
                      key={lobby.id}
                      type="button"
                      onClick={() => loadGame(lobby.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedLobbyId === lobby.id
                          ? "border-violet-300/35 bg-violet-400/10"
                          : "border-white/10 bg-white/[0.04] hover:border-violet-300/20"
                      }`}
                    >
                      <div className="flex justify-between gap-3">
                        <p className="font-black text-white">{lobby.table_name}</p>
                        <p className="font-black text-amber-300">
                          {lobby.bet_silver}S
                        </p>
                      </div>

                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {lobby.status}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
                    Belum ada meja terbuka.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[34px] border border-violet-300/20 bg-black/35 p-5 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-300">
                Quick Taunt
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2">
                {QUICK_TAUNTS.map((taunt) => (
                  <button
                    key={taunt}
                    type="button"
                    onClick={() => handleSendTaunt(taunt)}
                    disabled={!currentLobbyPlayer}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-bold text-slate-300 transition hover:border-violet-300/25 hover:bg-violet-400/10 hover:text-violet-100 disabled:opacity-40"
                  >
                    {taunt}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-sky-300/20 bg-black/35 p-5 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-sky-300">
                Lobby Feed
              </p>

              <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {taunts.length ? (
                  taunts.map((taunt) => (
                    <div
                      key={taunt.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">
                          {taunt.player_name}
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                          {formatTime(taunt.created_at)}
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-300">
                        {taunt.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
                    Belum ada taunt. Panasin mejanya.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[34px] border border-emerald-300/20 bg-black/35 p-5 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-300">
                Latest Result
              </p>

              {latestRound ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                    <p className="text-sm font-black text-white">
                      Round #{latestRound.round_number}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Pot {latestRound.total_pot_silver}S • Tax{" "}
                      {latestRound.tax_silver}S • Net {latestRound.net_pot_silver}S
                    </p>
                  </div>

                  {latestRoundPlayers.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div>
                        <p className="text-sm font-black text-white">
                          #{row.placement} {row.player_name}
                        </p>

                        <p className="text-xs text-slate-500">
                          Score {row.total_score}
                        </p>
                      </div>

                      <p
                        className={`text-sm font-black ${
                          row.status === "win"
                            ? "text-emerald-300"
                            : row.status === "runner_up"
                            ? "text-sky-300"
                            : "text-red-300"
                        }`}
                      >
                        {row.payout_silver > 0
                          ? `+${row.payout_silver}S`
                          : row.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
                  Belum ada hasil round.
                </p>
              )}
            </section>

            {selectedLobby ? (
              <button
                type="button"
                onClick={handleCloseLobby}
                disabled={isWorking}
                className="w-full rounded-2xl border border-red-300/25 bg-red-400/10 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-red-200 transition hover:bg-red-400/15 disabled:opacity-50"
              >
                Close Table
              </button>
            ) : null}
          </aside>
        </div>
      </section>

      <style jsx>{`
        .casino-action {
          border-width: 1px;
          border-radius: 1rem;
          padding: 0.85rem 1rem;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          transition: 180ms ease;
        }

        .casino-action:hover:not(:disabled) {
          filter: brightness(1.16);
          transform: translateY(-1px);
        }

        .casino-status-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-width: 1px;
          border-radius: 1rem;
          padding: 0.85rem 1rem;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }

        @keyframes dice-shake {
          0%,
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-8px) rotate(-8deg) scale(1.05);
          }
          50% {
            transform: translateY(6px) rotate(8deg) scale(0.98);
          }
          75% {
            transform: translateY(-4px) rotate(-5deg) scale(1.04);
          }
        }

        .dice-rolling {
          animation: dice-shake 0.52s ease-in-out infinite;
        }

        @keyframes bubble-pop {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .taunt-bubble {
          animation: bubble-pop 180ms ease-out both;
        }
      `}</style>
    </main>
  );
}

function HeaderStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className={`mt-2 truncate text-lg font-black ${tone}`}>{value}</p>
    </div>
  );
}

function DiceCenter({ isRolling }: { isRolling: boolean }) {
  return (
    <div
      className={`mt-5 flex items-center justify-center gap-3 ${
        isRolling ? "dice-rolling" : ""
      }`}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/30 bg-black/40 text-5xl shadow-[0_0_30px_rgba(245,199,90,0.12)]">
        🎲
      </span>

      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/30 bg-black/40 text-5xl shadow-[0_0_30px_rgba(245,199,90,0.12)]">
        🎲
      </span>

      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/30 bg-black/40 text-5xl shadow-[0_0_30px_rgba(245,199,90,0.12)]">
        🎲
      </span>
    </div>
  );
}

function CasinoSeat({
  seat,
  player,
  positionClass,
  taunt,
  roll,
  isSelf = false,
}: {
  seat: string;
  player: LobbyPlayer | null;
  positionClass: string;
  taunt?: WagerTaunt | null;
  roll?: DiceRoll | null;
  isSelf?: boolean;
}) {
  return (
    <div className={`absolute z-20 w-[220px] ${positionClass}`}>
      <div
        className={`rounded-[26px] border p-4 shadow-[0_0_35px_rgba(0,0,0,0.20)] backdrop-blur-xl ${
          isSelf
            ? "border-amber-300/35 bg-amber-500/10"
            : "border-white/10 bg-black/45"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/25 bg-black/35 text-xl">
            {player ? "☾" : seat}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">
              {player?.player_name || "Empty Seat"}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {player?.player_rank || "Waiting"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
              player?.status === "ready"
                ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-300"
                : player?.status === "playing"
                ? "border-amber-300/25 bg-amber-400/10 text-amber-300"
                : "border-white/10 bg-white/[0.05] text-slate-400"
            }`}
          >
            {player?.status || "empty"}
          </span>

          {roll ? (
            <span className="text-xs font-black text-amber-300">
              {roll.total}
            </span>
          ) : null}
        </div>

        {roll ? (
          <div className="mt-3 flex gap-1">
            {roll.dice.map((value, index) => (
              <span
                key={`${player?.player_id || seat}-${index}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-lg text-white"
              >
                {DICE_FACE[value]}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {taunt ? (
        <div
          className={`taunt-bubble rounded-2xl border border-violet-300/20 bg-violet-500/15 px-4 py-3 text-xs font-bold leading-5 text-violet-100 shadow-[0_0_24px_rgba(168,85,247,0.10)] ${
            isSelf
              ? "absolute bottom-full left-1/2 mb-2 w-[220px] -translate-x-1/2"
              : "mt-2"
          }`}
        >
          {taunt.message}
        </div>
      ) : null}
    </div>
  );
}
