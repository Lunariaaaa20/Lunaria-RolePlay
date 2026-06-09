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
  cosmetic_id: string;
  player_id: string;
  equipped: boolean;
  cosmetics?: {
    name?: string;
    type?: string;
    rarity?: string;
  } | null;
};

const rankTheme: Record<string, string> = {
  Initiate: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  Seeker: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Warden: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Arbiter: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  "High Council": "border-amber-400/40 bg-amber-400/10 text-amber-200",
};

const pathwayTheme: Record<string, string> = {
  Warrior: "border-red-400/30 bg-red-400/10 text-red-200",
  Mystic: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  Shadow: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  Nature: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

function getSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const sessionRaw =
    sessionStorage.getItem("lunaria_session") ||
    localStorage.getItem("lunaria_session");

  if (!sessionRaw) return null;

  try {
    return JSON.parse(sessionRaw) as LunariaSession;
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

function getTotalQuests(player: Player) {
  return (
    player.common_quests +
    player.uncommon_quests +
    player.dangerous_quests +
    player.special_quests
  );
}

function getDisplayStatus(player: Player) {
  if (player.guild_rank === "High Council") return "Moon-Crowned Authority";
  if (player.guild_rank === "Arbiter") return "Royal Verdict Bearer";
  if (player.guild_rank === "Warden") return "Oathbound Field Warden";
  if (player.guild_rank === "Seeker") return "Moonlit Seeker";
  return "Awakened Adventurer";
}

export default function AdventurerIdCardPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [photoInput, setPhotoInput] = useState("");
  const [equippedCosmetics, setEquippedCosmetics] = useState<EquippedCosmetic[]>(
    []
  );
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
    Boolean(session.playerId) &&
    selectedPlayer?.id === session.playerId;

  const canEditPhoto = Boolean(selectedPlayer && (isAdmin || isOwner));

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (a.id === session?.playerId) return -1;
      if (b.id === session?.playerId) return 1;
      return a.character_name.localeCompare(b.character_name);
    });
  }, [players, session?.playerId]);

  const idCardText = useMemo(() => {
    if (!selectedPlayer) return "";

    return `╔══════════════════════╗
* LUNARIA ADVENTURER LICENSE
╚══════════════════════╝
*Name :* ${selectedPlayer.character_name}
*Race :* ${selectedPlayer.race}
*Guild Rank :* ${selectedPlayer.guild_rank.toUpperCase()}
*Pathway :* ${selectedPlayer.pathway}
*Misi :* ${selectedPlayer.mission}

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
- Points : ${calculatePoints(selectedPlayer)}

━━━━━━━━━━━━━━━━━━
Registered Guild :
Lunaria Adventurer Registry

Status :
${getDisplayStatus(selectedPlayer)}`;
  }, [selectedPlayer]);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2600);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 4200);
  };

  const fetchEquippedCosmetics = async (playerId: string) => {
    const { data, error } = await supabase
      .from("player_cosmetics")
      .select(
        `
        id,
        cosmetic_id,
        player_id,
        equipped,
        cosmetics (
          name,
          type,
          rarity
        )
      `
      )
      .eq("player_id", playerId)
      .eq("equipped", true);

    if (error) {
      setEquippedCosmetics([]);
      return;
    }

    setEquippedCosmetics((data as unknown as EquippedCosmetic[]) || []);
  };

  const fetchPlayers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      setIsLoading(false);
      setPlayers([]);
      setSelectedPlayerId("");
      setPhotoInput("");
      setEquippedCosmetics([]);
      showError("Session tidak ditemukan. Login ulang dulu.");
      return;
    }

    const { data, error } = await supabase
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

    const ownPlayerId =
      currentSession.role === "player" && currentSession.playerId
        ? currentSession.playerId
        : "";

    const preferredId =
      ownPlayerId && playerData.some((player) => player.id === ownPlayerId)
        ? ownPlayerId
        : selectedPlayerId &&
          playerData.some((player) => player.id === selectedPlayerId)
        ? selectedPlayerId
        : playerData[0].id;

    const currentPlayer =
      playerData.find((player) => player.id === preferredId) || playerData[0];

    setSelectedPlayerId(currentPlayer.id);
    setPhotoInput(currentPlayer.photo_url || "");
    fetchEquippedCosmetics(currentPlayer.id);
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);

    const nextPlayer = players.find((player) => player.id === playerId);
    setPhotoInput(nextPlayer?.photo_url || "");

    if (nextPlayer) {
      fetchEquippedCosmetics(nextPlayer.id);
    }
  };

  const handleCopy = async () => {
    if (!idCardText) return;

    await navigator.clipboard.writeText(idCardText);
    setCopied(true);
    showNotice("ID Card copied.");

    setTimeout(() => setCopied(false), 1800);
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

    setIsSavingPhoto(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("players")
      .update({
        photo_url: photoInput.trim(),
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
              photo_url: photoInput.trim(),
            }
          : player
      )
    );

    showNotice("Character photo updated.");
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="relative overflow-hidden rounded-[32px] border border-amber-400/25 bg-gradient-to-br from-[#080911] via-[#07101d] to-violet-950/70 p-5 shadow-[0_0_65px_rgba(245,158,11,0.10)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.30),transparent_36%)]" />
        <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full border border-amber-300/20 bg-amber-300/10 blur-2xl" />

        <div className="relative z-10 grid grid-cols-1 gap-5 xl:grid-cols-12 xl:items-center">
          <div className="xl:col-span-7">
            <div className="inline-flex rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-300">
                Lunaria Guild Registry
              </p>
            </div>

            <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
              Adventurer ID Card
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
              Lisensi resmi adventurer Lunaria. Player otomatis membuka kartu
              miliknya sendiri, namun tetap bisa melihat ID Card adventurer aktif
              lain sebagai arsip publik guild.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:col-span-5">
            <button
              onClick={fetchPlayers}
              className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-sky-300 transition hover:bg-sky-500/20"
            >
              Refresh
            </button>

            <button
              onClick={handleCopy}
              disabled={!selectedPlayer}
              className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copied ? "Copied" : "Copy ID"}
            </button>

            <MiniHeroStat
              label="Active Registry"
              value={String(players.length)}
              tone="text-emerald-300"
            />

            <MiniHeroStat
              label="Viewer"
              value={session?.role === "admin" ? "Admin" : session?.characterName || "-"}
              tone="text-amber-300"
            />
          </div>
        </div>
      </section>

      {notice ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-200">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-4 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[24px] border border-sky-400/25 bg-sky-400/10 p-4 text-sky-200">
          <p className="text-sm font-bold">Loading active ID Cards...</p>
        </section>
      ) : null}

      {!isLoading && players.length === 0 ? (
        <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 text-slate-400">
          Belum ada player aktif. Player inactive, banned, atau deleted tidak
          muncul di halaman ID Card publik.
        </section>
      ) : null}

      {selectedPlayer ? (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-5 shadow-[0_0_45px_rgba(15,23,42,0.45)] xl:col-span-8">
              <label className="block">
                <span className="mb-3 block text-xs font-black uppercase tracking-[0.26em] text-slate-500">
                  Public Active ID Viewer
                </span>

                <select
                  value={selectedPlayerId}
                  onChange={(event) => handleSelectPlayer(event.target.value)}
                  className="lunaria-id-input"
                >
                  {sortedPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.id === session?.playerId ? "★ " : ""}
                      {player.character_name} — {player.guild_rank} —{" "}
                      {player.pathway}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:col-span-4">
              <SmallStat
                label="Total Quest"
                value={String(getTotalQuests(selectedPlayer))}
                tone="text-sky-300"
              />
              <SmallStat
                label="Prestige"
                value={String(calculatePoints(selectedPlayer))}
                tone="text-violet-300"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <div className="sticky top-24">
                <div className="relative overflow-hidden rounded-[34px] border border-amber-400/30 bg-[#070812] p-5 shadow-[0_0_70px_rgba(245,158,11,0.12)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.24),transparent_30%)]" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />

                  <div className="relative z-10 rounded-[28px] border border-amber-400/20 bg-black/35 p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">
                          Moonbound License
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Lunaria Adventurer Registry
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10">
                        <MoonIcon className="h-6 w-6 text-amber-300" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[34px] border border-amber-400/30 bg-gradient-to-br from-slate-900 via-black to-violet-950 shadow-[0_0_38px_rgba(245,158,11,0.18)]">
                        {selectedPlayer.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedPlayer.photo_url}
                            alt={selectedPlayer.character_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl">☾</span>
                        )}

                        <div className="absolute bottom-2 rounded-full border border-amber-400/30 bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">
                          Vessel Photo
                        </div>
                      </div>

                      <h2 className="mt-5 text-3xl font-black leading-tight text-white">
                        {selectedPlayer.character_name}
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        {selectedPlayer.race} • {selectedPlayer.pathway}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <span
                          className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                            rankTheme[selectedPlayer.guild_rank] ||
                            "border-slate-400/30 bg-slate-400/10 text-slate-200"
                          }`}
                        >
                          {selectedPlayer.guild_rank}
                        </span>

                        <span
                          className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                            pathwayTheme[selectedPlayer.pathway] ||
                            "border-violet-400/30 bg-violet-400/10 text-violet-200"
                          }`}
                        >
                          {selectedPlayer.pathway}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <CurrencyBox
                        label="Gold"
                        value={selectedPlayer.gold}
                        color="text-amber-300"
                      />
                      <CurrencyBox
                        label="Silver"
                        value={selectedPlayer.silver}
                        color="text-slate-100"
                      />
                      <CurrencyBox
                        label="Bronze"
                        value={selectedPlayer.bronze}
                        color="text-orange-300"
                      />
                    </div>

                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                        {getDisplayStatus(selectedPlayer)}
                      </p>
                    </div>

                    <div className="mt-4 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">
                        Equipped Cosmetics
                      </p>

                      <div className="mt-3 space-y-3">
                        {equippedCosmetics.length ? (
                          equippedCosmetics.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                            >
                              <p className="text-sm font-bold text-white">
                                ◆ {item.cosmetics?.name || "Unknown Cosmetic"}
                              </p>

                              <p className="text-xs text-slate-500">
                                {item.cosmetics?.type || "Cosmetic"}
                              </p>
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
                      <div className="mt-4 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">
                          Character Photo
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Player bisa edit foto sendiri. Admin bisa edit semua
                          ID aktif.
                        </p>

                        <input
                          value={photoInput}
                          onChange={(event) => setPhotoInput(event.target.value)}
                          placeholder="https://example.com/photo.png"
                          className="lunaria-id-input mt-4"
                        />

                        <button
                          onClick={handleSavePhoto}
                          disabled={isSavingPhoto}
                          className="mt-4 w-full rounded-2xl border border-sky-400/30 bg-sky-500/10 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSavingPhoto ? "Saving..." : "Save Photo"}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                          Photo Permission
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Kamu sedang melihat ID Card player lain. Foto hanya
                          bisa diubah oleh pemilik kartu atau admin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-8">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBox label="Name" value={selectedPlayer.character_name} />
                <InfoBox label="Race" value={selectedPlayer.race} />
                <InfoBox label="Guild Rank" value={selectedPlayer.guild_rank} />
                <InfoBox label="Pathway" value={selectedPlayer.pathway} />
              </section>

              <section className="rounded-[30px] border border-white/10 bg-black/35 p-5">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                  Current Mission
                </p>

                <p className="mt-3 text-2xl font-black text-white">
                  {selectedPlayer.mission || "-"}
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Misi aktif tercatat langsung dari Guild Registry. Perubahan
                  dari Admin Panel akan muncul setelah data diperbarui.
                </p>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DataPanel
                  title="Primary Skills"
                  items={[selectedPlayer.skill_1, selectedPlayer.skill_2]}
                />

                <DataPanel
                  title="Inventory"
                  items={[
                    selectedPlayer.inventory_1 || "-",
                    selectedPlayer.inventory_2 || "-",
                    selectedPlayer.inventory_3 || "-",
                  ]}
                />
              </section>

              <section className="rounded-[30px] border border-violet-400/20 bg-violet-400/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-300">
                  Quest Record
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <QuestBox label="Common" value={selectedPlayer.common_quests} />
                  <QuestBox
                    label="Uncommon"
                    value={selectedPlayer.uncommon_quests}
                  />
                  <QuestBox
                    label="Dangerous"
                    value={selectedPlayer.dangerous_quests}
                  />
                  <QuestBox label="Special" value={selectedPlayer.special_quests} />
                  <QuestBox label="Points" value={calculatePoints(selectedPlayer)} />
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-[30px] border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-black/20 to-violet-500/10 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                    Registered Guild
                  </p>

                  <p className="mt-2 text-xl font-black text-white">
                    Lunaria Adventurer Registry
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Hanya adventurer aktif yang muncul di viewer publik. Player
                    inactive, banned, atau deleted tidak tampil.
                  </p>
                </div>

                <div className="rounded-[30px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-300">
                    Security Seal
                  </p>

                  <p className="mt-2 text-xl font-black text-white">
                    Credential Hidden
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Username dan access code tidak ditampilkan di ID Card.
                    Transaksi tetap memakai playerId dari session login.
                  </p>
                </div>
              </section>
            </div>
          </section>
        </>
      ) : null}

      <style jsx>{`
        .lunaria-id-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(0, 0, 0, 0.3);
          padding: 0.95rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
        }

        .lunaria-id-input::placeholder {
          color: rgb(100, 116, 139);
        }

        .lunaria-id-input:focus {
          border-color: rgba(245, 158, 11, 0.45);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        select.lunaria-id-input option {
          background: #070812;
          color: white;
        }
      `}</style>
    </main>
  );
}

function MiniHeroStat({
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
      <p className={`mt-2 truncate text-xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function SmallStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-4xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value || "-"}</p>
    </div>
  );
}

function CurrencyBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function QuestBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function DataPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-xs font-black text-amber-300">
              {index + 1}
            </div>

            <p className="text-sm font-semibold text-slate-200">{item || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20.3 15.15A8.3 8.3 0 0 1 8.85 3.7 8.6 8.6 0 1 0 20.3 15.15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.8 4.4h.01M17.2 6.8h.01M18.4 10.2h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
