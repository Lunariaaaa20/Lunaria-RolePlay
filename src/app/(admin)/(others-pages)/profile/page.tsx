"use client";

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
  mission: string;
  skill_1: string;
  skill_2: string;
  inventory_1: string;
  inventory_2: string;
  inventory_3: string;
  gold: number;
  silver: number;
  bronze: number;
  common_quests: number;
  uncommon_quests: number;
  dangerous_quests: number;
  special_quests: number;
  photo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type EquippedCosmetic = {
  id: string;
  name: string;
  type: string;
};

const rankTheme: Record<
  string,
  {
    label: string;
    card: string;
    text: string;
    badge: string;
  }
> = {
  Initiate: {
    label: "First Moon Seal",
    card: "border-slate-300/25 bg-slate-400/10",
    text: "text-slate-200",
    badge: "border-slate-300/25 bg-slate-400/10 text-slate-200",
  },
  Seeker: {
    label: "Silver Path Seeker",
    card: "border-sky-300/25 bg-sky-400/10",
    text: "text-sky-200",
    badge: "border-sky-300/25 bg-sky-400/10 text-sky-200",
  },
  Warden: {
    label: "Moonlit Warden",
    card: "border-emerald-300/25 bg-emerald-400/10",
    text: "text-emerald-200",
    badge: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  },
  Arbiter: {
    label: "Eclipse Arbiter",
    card: "border-violet-300/25 bg-violet-400/10",
    text: "text-violet-200",
    badge: "border-violet-300/25 bg-violet-400/10 text-violet-200",
  },
  "High Council": {
    label: "High Lunar Council",
    card: "border-amber-300/35 bg-amber-400/10",
    text: "text-amber-200",
    badge: "border-amber-300/35 bg-amber-400/10 text-amber-200",
  },
};

const pathwayTheme: Record<
  string,
  {
    label: string;
    badge: string;
    glow: string;
  }
> = {
  Warrior: {
    label: "Crimson Blade",
    badge: "border-red-300/25 bg-red-400/10 text-red-200",
    glow: "rgba(248,113,113,0.18)",
  },
  Mystic: {
    label: "Astral Mystic",
    badge: "border-violet-300/25 bg-violet-400/10 text-violet-200",
    glow: "rgba(168,85,247,0.18)",
  },
  Shadow: {
    label: "Moonshade Veil",
    badge: "border-fuchsia-300/25 bg-fuchsia-400/10 text-fuchsia-200",
    glow: "rgba(217,70,239,0.16)",
  },
  Nature: {
    label: "Verdant Oath",
    badge: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
    glow: "rgba(52,211,153,0.16)",
  },
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

function calculatePoints(player: Player) {
  return (
    Number(player.common_quests || 0) * 10 +
    Number(player.uncommon_quests || 0) * 25 +
    Number(player.dangerous_quests || 0) * 60 +
    Number(player.special_quests || 0) * 120
  );
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function cleanUrl(value: string) {
  return value.trim();
}

function isValidImageUrl(value: string) {
  const clean = cleanUrl(value);

  if (!clean) return true;

  return (
    clean.startsWith("https://") ||
    clean.startsWith("http://") ||
    clean.startsWith("/")
  );
}

export default function AdventurerIdCardPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [equippedCosmetics, setEquippedCosmetics] = useState<EquippedCosmetic[]>([]);
  const [photoInput, setPhotoInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) || players[0];

  const isAdmin = session?.role === "admin";
  const isOwner =
    session?.role === "player" &&
    selectedPlayer &&
    session.playerId === selectedPlayer.id;

  const canEditPhoto = Boolean(selectedPlayer && (isAdmin || isOwner));

  const rankStyle =
    rankTheme[selectedPlayer?.guild_rank || ""] || rankTheme.Initiate;

  const pathwayStyle =
    pathwayTheme[selectedPlayer?.pathway || ""] || pathwayTheme.Mystic;

  const idCardText = useMemo(() => {
    if (!selectedPlayer) return "";

    return `╔══════════════════════╗
*LUNARIA ADVENTURER LICENSE*
╚══════════════════════╝

*Name :* ${selectedPlayer.character_name}
*Race :* ${selectedPlayer.race}
*Guild Rank :* ${selectedPlayer.guild_rank.toUpperCase()}
*Pathway :* ${selectedPlayer.pathway}
*Misi :* ${selectedPlayer.mission || "-"}

━━━━━━━━━━━━━━━━━━
*Primary Skills*
1. ${selectedPlayer.skill_1 || "-"}
2. ${selectedPlayer.skill_2 || "-"}

━━━━━━━━━━━━━━━━━━
*Inventory*
1. ${selectedPlayer.inventory_1 || "-"}
2. ${selectedPlayer.inventory_2 || "-"}
3. ${selectedPlayer.inventory_3 || "-"}

━━━━━━━━━━━━━━━━━━
*Currency*
- Gold : ${selectedPlayer.gold}
- Silver : ${selectedPlayer.silver}
- Bronze : ${selectedPlayer.bronze}

━━━━━━━━━━━━━━━━━━
*Quest Record*
- Common : ${selectedPlayer.common_quests}
- Uncommon : ${selectedPlayer.uncommon_quests}
- Dangerous : ${selectedPlayer.dangerous_quests}
- Special : ${selectedPlayer.special_quests}
- Lunar Prestige : ${calculatePoints(selectedPlayer)}

━━━━━━━━━━━━━━━━━━
*Registered Guild*
Lunaria Adventurer's Guild

*Status*
${selectedPlayer.status === "active" ? "Active Adventurer" : selectedPlayer.status}`;
  }, [selectedPlayer]);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const fetchEquippedCosmetics = async (playerId: string) => {
    const { data, error } = await supabase
      .from("player_cosmetics")
      .select(
        `
        id,
        cosmetic_id,
        is_equipped,
        cosmetics (
          name,
          type
        )
      `
      )
      .eq("player_id", playerId)
      .eq("is_equipped", true);

    if (error) {
      setEquippedCosmetics([]);
      return;
    }

    const mapped = ((data || []) as any[]).map((item) => {
      const cosmetic = Array.isArray(item.cosmetics)
        ? item.cosmetics[0]
        : item.cosmetics;

      return {
        id: item.id,
        name: cosmetic?.name || "Unknown Cosmetic",
        type: cosmetic?.type || "Cosmetic",
      };
    });

    setEquippedCosmetics(mapped);
  };

  const fetchPlayers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      setIsLoading(false);
      setPlayers([]);
      showError("Session tidak ditemukan. Login ulang dulu.");
      return;
    }

    let query = supabase
      .from("players")
      .select(
        `
        id,
        character_name,
        race,
        guild_rank,
        pathway,
        mission,
        skill_1,
        skill_2,
        inventory_1,
        inventory_2,
        inventory_3,
        gold,
        silver,
        bronze,
        common_quests,
        uncommon_quests,
        dangerous_quests,
        special_quests,
        photo_url,
        status,
        created_at,
        updated_at
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (currentSession.role === "player" && currentSession.playerId) {
      query = query.eq("id", currentSession.playerId);
    }

    const { data, error } = await query;

    setIsLoading(false);

    if (error) {
      showError(`Failed to load ID Card: ${error.message}`);
      return;
    }

    const playerData = (data || []) as Player[];

    setPlayers(playerData);

    if (playerData.length === 0) {
      setSelectedPlayerId("");
      setPhotoInput("");
      setEquippedCosmetics([]);
      return;
    }

    const preferredId =
      currentSession.role === "player" && currentSession.playerId
        ? currentSession.playerId
        : selectedPlayerId && playerData.some((player) => player.id === selectedPlayerId)
        ? selectedPlayerId
        : playerData[0].id;

    setSelectedPlayerId(preferredId);

    const currentPlayer =
      playerData.find((player) => player.id === preferredId) || playerData[0];

    setPhotoInput(currentPlayer.photo_url || "");
    fetchEquippedCosmetics(currentPlayer.id);
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPlayer) return;

    setPhotoInput(selectedPlayer.photo_url || "");
    fetchEquippedCosmetics(selectedPlayer.id);
  }, [selectedPlayerId]);

  const handleCopy = async () => {
    if (!idCardText) return;

    await navigator.clipboard.writeText(idCardText);
    setCopied(true);
    showNotice("ID Card copied.");

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  const handleSavePhoto = async () => {
    if (!selectedPlayer) {
      showError("No player selected.");
      return;
    }

    if (!canEditPhoto) {
      showError("Kamu hanya bisa edit foto ID Card milikmu sendiri.");
      return;
    }

    const finalUrl = cleanUrl(photoInput);

    if (!isValidImageUrl(finalUrl)) {
      showError("Photo URL harus diawali https://, http://, atau /images/...");
      return;
    }

    setIsSavingPhoto(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("players")
      .update({
        photo_url: finalUrl,
      })
      .eq("id", selectedPlayer.id);

    setIsSavingPhoto(false);

    if (error) {
      showError(`Save photo failed: ${error.message}`);
      return;
    }

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === selectedPlayer.id
          ? {
              ...player,
              photo_url: finalUrl,
            }
          : player
      )
    );

    showNotice("Character photo updated.");
  };

  return (
    <main className="relative space-y-7 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.08),transparent_34%),linear-gradient(135deg,#02030a,#050615_48%,#02030a)]" />

      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:58px_58px]" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="lunaria-particle left-[12%] top-[22%]" />
        <span className="lunaria-particle particle-two right-[16%] top-[18%]" />
        <span className="lunaria-particle particle-three bottom-[14%] left-[48%]" />
      </div>

      <section className="relative overflow-hidden rounded-[38px] border border-amber-300/25 bg-gradient-to-br from-[#070812]/95 via-[#050716]/95 to-violet-950/70 p-6 shadow-[0_0_95px_rgba(245,158,11,0.13)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.24),transparent_40%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-amber-200">
              <Icon name="moon" className="h-4 w-4" />
              Lunaria Moon License
            </div>

            <h1 className="lunaria-title mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Adventurer ID Card
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Lisensi resmi adventurer Lunaria. Saat player login, halaman ini
              otomatis membuka ID Card miliknya sendiri. Admin dapat melihat dan
              mengatur seluruh ID Card aktif.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={fetchPlayers}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/30 bg-sky-400/10 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-sky-200 transition hover:bg-sky-400/20"
            >
              <Icon name="scroll" className="h-4 w-4" />
              Refresh Data
            </button>

            <button
              onClick={handleCopy}
              disabled={!selectedPlayer}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="crest" className="h-4 w-4" />
              {copied ? "Copied" : "Copy ID Card"}
            </button>
          </div>
        </div>
      </section>

      {notice ? (
        <section className="rounded-[26px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[26px] border border-red-400/25 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[26px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading moon license data...</p>
        </section>
      ) : null}

      {!isLoading && players.length === 0 ? (
        <section className="rounded-[38px] border border-white/10 bg-black/35 p-7 text-slate-300">
          <p className="text-xl font-black text-white">No active ID Card found.</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Player inactive, banned, deleted, atau belum approve tidak tampil di
            halaman ID Card publik.
          </p>
        </section>
      ) : null}

      {selectedPlayer ? (
        <>
          {isAdmin && players.length > 1 ? (
            <section className="rounded-[34px] border border-white/10 bg-black/35 p-5">
              <label className="block">
                <span className="mb-3 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                  Select Adventurer
                </span>

                <select
                  value={selectedPlayerId}
                  onChange={(event) => setSelectedPlayerId(event.target.value)}
                  className="lunaria-id-input"
                >
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.character_name} — {player.guild_rank}
                    </option>
                  ))}
                </select>
              </label>
            </section>
          ) : null}

          <section className="grid grid-cols-1 gap-7 xl:grid-cols-12">
            <div className="xl:col-span-5">
              <div className="lunar-card-frame relative overflow-hidden rounded-[42px] border border-amber-300/35 bg-[#060711] p-5 shadow-[0_0_85px_rgba(245,158,11,0.16)]">
                <div className="lunar-shimmer" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_38%)]" />
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-12 h-64 w-64 rounded-full blur-3xl" style={{ background: pathwayStyle.glow }} />

                <div className="relative z-10 rounded-[34px] border border-amber-300/20 bg-black/40 p-5">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.30em] text-amber-200">
                        Adventurer&apos;s Guild License
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Lunar Registry of Aethelgard
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-200">
                      <Icon name="crest" className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-44 w-44 overflow-hidden rounded-[34px] border border-amber-300/35 bg-gradient-to-br from-slate-950 via-black to-violet-950 shadow-[0_0_45px_rgba(245,158,11,0.18)]">
                      <div className="pointer-events-none absolute inset-0 z-10 rounded-[34px] border border-white/10" />

                      {selectedPlayer.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedPlayer.photo_url}
                          alt={selectedPlayer.character_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Icon name="moon" className="h-20 w-20 text-amber-200/80" />
                        </div>
                      )}

                      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-amber-300/25 bg-black/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200 backdrop-blur">
                        Character Photo
                      </div>
                    </div>

                    <h2 className="lunaria-name mt-6 max-w-full break-words text-4xl font-black">
                      {selectedPlayer.character_name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-300">
                      {selectedPlayer.race} • {selectedPlayer.pathway}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${rankStyle.badge}`}
                      >
                        {selectedPlayer.guild_rank}
                      </span>

                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${pathwayStyle.badge}`}
                      >
                        {selectedPlayer.pathway}
                      </span>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
                        {rankStyle.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {pathwayStyle.label} • Official Moonbound Identity
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <CurrencyBox label="Gold" value={selectedPlayer.gold} tone="text-amber-300" />
                    <CurrencyBox label="Silver" value={selectedPlayer.silver} tone="text-slate-100" />
                    <CurrencyBox label="Bronze" value={selectedPlayer.bronze} tone="text-orange-300" />
                  </div>

                  <div
                    className={`mt-5 rounded-3xl border p-4 text-center ${
                      selectedPlayer.status === "active"
                        ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
                        : "border-red-300/25 bg-red-400/10 text-red-200"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.24em]">
                      {selectedPlayer.status === "active"
                        ? "Active Adventurer"
                        : selectedPlayer.status}
                    </p>
                  </div>

                  <div className="mt-5 rounded-3xl border border-violet-300/20 bg-violet-400/10 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-200">
                      Equipped Cosmetics
                    </p>

                    <div className="mt-4 space-y-3">
                      {equippedCosmetics.length > 0 ? (
                        equippedCosmetics.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                          >
                            <p className="text-sm font-bold text-white">
                              ✦ {item.name}
                            </p>
                            <p className="text-xs text-slate-500">{item.type}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">
                          No cosmetic equipped.
                        </p>
                      )}
                    </div>
                  </div>

                  {canEditPhoto ? (
                    <div className="mt-5 rounded-3xl border border-sky-300/20 bg-sky-400/10 p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-200">
                        Edit Character Photo
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Tempel link gambar karakter. Player hanya bisa edit ID
                        Card sendiri. Admin bisa edit semua player aktif.
                      </p>

                      <input
                        value={photoInput}
                        onChange={(event) => setPhotoInput(event.target.value)}
                        placeholder="https://example.com/character-photo.png"
                        className="lunaria-id-input mt-4"
                      />

                      <button
                        onClick={handleSavePhoto}
                        disabled={isSavingPhoto}
                        className="mt-4 w-full rounded-2xl border border-sky-300/30 bg-sky-400/10 px-5 py-4 text-xs font-black uppercase tracking-[0.20em] text-sky-200 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingPhoto ? "Saving..." : "Save Photo"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                        Photo Permission
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Kamu sedang melihat ID Card player lain. Foto hanya bisa
                        diubah oleh pemilik ID Card atau admin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-7 xl:col-span-7">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBox label="Name" value={selectedPlayer.character_name} />
                <InfoBox label="Race" value={selectedPlayer.race} />
                <InfoBox label="Guild Rank" value={selectedPlayer.guild_rank} />
                <InfoBox label="Pathway" value={selectedPlayer.pathway} />
              </section>

              <section className="rounded-[34px] border border-white/10 bg-black/35 p-6">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">
                  Current Mission
                </p>
                <p className="mt-3 text-2xl font-black text-white">
                  {selectedPlayer.mission || "-"}
                </p>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DataPanel
                  title="Primary Skills"
                  icon="star"
                  items={[selectedPlayer.skill_1 || "-", selectedPlayer.skill_2 || "-"]}
                />

                <DataPanel
                  title="Inventory"
                  icon="scroll"
                  items={[
                    selectedPlayer.inventory_1 || "-",
                    selectedPlayer.inventory_2 || "-",
                    selectedPlayer.inventory_3 || "-",
                  ]}
                />
              </section>

              <section className="rounded-[34px] border border-violet-300/20 bg-violet-400/10 p-6">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-200">
                  Quest Record
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <QuestBox label="Common" value={selectedPlayer.common_quests} />
                  <QuestBox label="Uncommon" value={selectedPlayer.uncommon_quests} />
                  <QuestBox label="Dangerous" value={selectedPlayer.dangerous_quests} />
                  <QuestBox label="Special" value={selectedPlayer.special_quests} />
                  <QuestBox label="Prestige" value={calculatePoints(selectedPlayer)} />
                </div>
              </section>

              <section className="rounded-[34px] border border-amber-300/20 bg-gradient-to-r from-amber-400/10 via-black/20 to-violet-400/10 p-6">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">
                  Registered Guild
                </p>

                <p className="mt-3 text-2xl font-black text-white">
                  Lunaria Adventurer&apos;s Guild
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  ID Card ini adalah identitas resmi karakter di komunitas
                  Lunaria. Data rank, skill, inventory, currency, quest record,
                  dan cosmetic akan mengikuti pembaruan dari sistem guild.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <MiniSeal label="Created" value={formatDate(selectedPlayer.created_at)} />
                  <MiniSeal label="Updated" value={formatDate(selectedPlayer.updated_at)} />
                </div>
              </section>

              <section className="rounded-[34px] border border-emerald-300/20 bg-emerald-400/10 p-6">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-200">
                  Security Notice
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Username dan access code tidak ditampilkan di ID Card.
                  Transaksi tetap memakai playerId dari session login, bukan
                  pilihan dropdown ID Card.
                </p>
              </section>
            </div>
          </section>
        </>
      ) : null}

      <style jsx>{`
        .lunaria-title {
          letter-spacing: -0.04em;
          text-shadow:
            0 0 28px rgba(255, 255, 255, 0.08),
            0 0 42px rgba(245, 158, 11, 0.08);
        }

        .lunaria-name {
          background: linear-gradient(90deg, #fff7cc, #ffffff, #facc15, #c4b5fd);
          background-size: 240% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 30px rgba(245, 158, 11, 0.16);
          animation: lunar-text-flow 5s linear infinite;
        }

        .lunaria-id-input {
          width: 100%;
          border-radius: 1.25rem;
          border: 1px solid rgba(245, 158, 11, 0.20);
          background: rgba(0, 0, 0, 0.36);
          padding: 1rem 1.1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
        }

        .lunaria-id-input::placeholder {
          color: rgb(100, 116, 139);
        }

        .lunaria-id-input:focus {
          border-color: rgba(245, 158, 11, 0.48);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.10);
        }

        select.lunaria-id-input option {
          background: #070812;
          color: white;
        }

        .lunar-card-frame {
          animation: lunar-card-float 6s ease-in-out infinite;
        }

        .lunar-shimmer {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 36%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 64%,
            transparent 100%
          );
          transform: translateX(-130%);
          animation: lunar-shimmer 5.5s ease-in-out infinite;
        }

        .lunaria-particle {
          position: absolute;
          height: 9px;
          width: 9px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.72);
          box-shadow: 0 0 24px rgba(245, 158, 11, 0.55);
          animation: lunaria-float 8s ease-in-out infinite;
        }

        .particle-two {
          height: 8px;
          width: 8px;
          background: rgba(168, 85, 247, 0.72);
          box-shadow: 0 0 24px rgba(168, 85, 247, 0.55);
          animation-delay: 1.4s;
        }

        .particle-three {
          height: 7px;
          width: 7px;
          background: rgba(56, 189, 248, 0.66);
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
          animation-delay: 2.2s;
        }

        @keyframes lunar-card-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes lunar-shimmer {
          0% {
            transform: translateX(-130%);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          60% {
            transform: translateX(130%);
            opacity: 0.8;
          }
          100% {
            transform: translateX(130%);
            opacity: 0;
          }
        }

        @keyframes lunar-text-flow {
          to {
            background-position: 240% center;
          }
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
      `}</style>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 break-words text-xl font-black text-white">
        {value || "-"}
      </p>
    </div>
  );
}

function CurrencyBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function QuestBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function DataPanel({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  return (
    <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-400/10 text-amber-200">
          <Icon name={icon} className="h-5 w-5" />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">
          {title}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-xs font-black text-amber-200">
              {index + 1}
            </div>

            <p className="break-words text-sm font-bold text-slate-200">
              {item || "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniSeal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.20em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  if (name === "moon") {
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
