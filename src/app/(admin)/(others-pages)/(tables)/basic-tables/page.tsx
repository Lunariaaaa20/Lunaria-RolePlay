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

type PlayerCosmeticRow = {
  id: string;
  player_id: string;
  cosmetic_id: string;
  equipped: boolean;
};

type CosmeticInfo = {
  id: string;
  name: string;
  type: string;
};

const cosmeticCatalog: CosmeticInfo[] = [
  { id: "name-ember-script", name: "Ember Script", type: "Name Effect" },
  { id: "name-royal-gold", name: "Royal Gold Name", type: "Name Effect" },
  { id: "border-silver-oath", name: "Silver Oath Border", type: "ID Border" },
  { id: "border-demon-throne", name: "Demon Throne Border", type: "ID Border" },
  { id: "bg-moonlit-archive", name: "Moonlit Archive", type: "ID Background" },
  { id: "bg-void-cathedral", name: "Void Cathedral", type: "ID Background" },
  { id: "aura-green-sanctuary", name: "Green Sanctuary Aura", type: "Aura Effect" },
  { id: "aura-astral-crown", name: "Astral Crown Aura", type: "Aura Effect" },
];

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

export default function AdventurerIdCardPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [equippedRows, setEquippedRows] = useState<PlayerCosmeticRow[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) || players[0];

  const canEditPhoto =
    Boolean(selectedPlayer) &&
    (session?.role === "admin" || session?.playerId === selectedPlayer?.id);

  const equippedCosmetics = useMemo(() => {
    return equippedRows
      .filter((row) => row.player_id === selectedPlayer?.id && row.equipped)
      .map((row) => {
        const cosmetic = cosmeticCatalog.find(
          (item) => item.id === row.cosmetic_id
        );

        return {
          id: row.id,
          name: cosmetic?.name || row.cosmetic_id,
          type: cosmetic?.type || "Cosmetic",
        };
      });
  }, [equippedRows, selectedPlayer?.id]);

  const idCardText = useMemo(() => {
    if (!selectedPlayer) return "";

    return `╔══════════════════════╗
* ADVENTURER'S GUILD LICENSE
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
Adventurer's Guild of Aethelgard

Status :
Active Adventurer`;
  }, [selectedPlayer]);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2600);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 4200);
  };

  const fetchPlayers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    const { data, error } = await supabase
      .from("players")
      .select(`
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
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      setIsLoading(false);
      showError(`Failed to load players: ${error.message}`);
      return;
    }

    const activePlayers = (data || []) as Player[];
    setPlayers(activePlayers);

    let defaultPlayerId = "";

    if (
      currentSession?.role === "player" &&
      currentSession.playerId &&
      activePlayers.some((player) => player.id === currentSession.playerId)
    ) {
      defaultPlayerId = currentSession.playerId;
    } else if (
      selectedPlayerId &&
      activePlayers.some((player) => player.id === selectedPlayerId)
    ) {
      defaultPlayerId = selectedPlayerId;
    } else if (activePlayers.length > 0) {
      defaultPlayerId = activePlayers[0].id;
    }

    setSelectedPlayerId(defaultPlayerId);

    const { data: cosmeticData, error: cosmeticError } = await supabase
      .from("player_cosmetics")
      .select("id, player_id, cosmetic_id, equipped")
      .eq("equipped", true);

    if (cosmeticError) {
      setEquippedRows([]);
    } else {
      setEquippedRows((cosmeticData || []) as PlayerCosmeticRow[]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPhotoUrlInput(selectedPlayer?.photo_url || "");
  }, [selectedPlayer?.id, selectedPlayer?.photo_url]);

  const handleCopy = async () => {
    if (!idCardText) return;

    await navigator.clipboard.writeText(idCardText);
    setCopied(true);
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

    const cleanUrl = photoUrlInput.trim();

    const { error } = await supabase
      .from("players")
      .update({
        photo_url: cleanUrl,
      })
      .eq("id", selectedPlayer.id);

    setIsSavingPhoto(false);

    if (error) {
      showError(`Gagal menyimpan foto: ${error.message}`);
      return;
    }

    showNotice("Foto ID Card berhasil disimpan.");
    await fetchPlayers();
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          Lunaria Guild Registry
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Adventurer ID Card
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              ID Card publik untuk melihat data adventurer aktif. Saat player
              login, halaman otomatis membuka ID Card miliknya sendiri.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={fetchPlayers}
              className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-500/20"
            >
              Refresh Data
            </button>

            <button
              onClick={handleCopy}
              disabled={!selectedPlayer}
              className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copied ? "Copied" : "Copy ID Card"}
            </button>
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
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[24px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading active player data...</p>
        </section>
      ) : null}

      {!isLoading && players.length === 0 ? (
        <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 text-slate-400">
          Belum ada player aktif. Player inactive, banned, atau deleted tidak
          tampil di ID Card publik.
        </section>
      ) : null}

      {selectedPlayer ? (
        <>
          <section className="rounded-[28px] border border-white/10 bg-black/30 p-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
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

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-5">
              <div className="relative overflow-hidden rounded-[32px] border border-amber-400/30 bg-[#070812] p-5 shadow-[0_0_50px_rgba(245,158,11,0.14)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_30%)]" />

                <div className="relative z-10 rounded-[26px] border border-amber-400/20 bg-black/35 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
                        Adventurer&apos;s Guild License
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Registered Guild of Aethelgard
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-xl text-amber-300">
                      ⚜
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[32px] border border-amber-400/30 bg-gradient-to-br from-slate-900 via-black to-violet-950 shadow-[0_0_35px_rgba(245,158,11,0.14)]">
                      {selectedPlayer.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedPlayer.photo_url}
                          alt={selectedPlayer.character_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl">🧙</span>
                      )}

                      <div className="absolute bottom-2 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-300">
                        Character Photo
                      </div>
                    </div>

                    <h2 className="mt-5 text-3xl font-black text-white">
                      {selectedPlayer.character_name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {selectedPlayer.race} • {selectedPlayer.pathway}
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                          rankTheme[selectedPlayer.guild_rank] ||
                          "border-slate-400/30 bg-slate-400/10 text-slate-200"
                        }`}
                      >
                        {selectedPlayer.guild_rank}
                      </span>

                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
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
                      color="text-slate-200"
                    />
                    <CurrencyBox
                      label="Bronze"
                      value={selectedPlayer.bronze}
                      color="text-orange-300"
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
                      Active Adventurer
                    </p>
                  </div>

                  <div className="mt-5 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
                      Equipped Cosmetics
                    </p>

                    <div className="mt-3 space-y-2">
                      {equippedCosmetics.length ? (
                        equippedCosmetics.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                          >
                            <span className="text-sm font-semibold text-slate-200">
                              ◆ {item.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {item.type}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          No cosmetic equipped.
                        </p>
                      )}
                    </div>
                  </div>

                  {canEditPhoto ? (
                    <div className="mt-5 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
                      <p className="text-xs uppercase tracking-[0.26em] text-sky-300">
                        Edit Character Photo
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Tempel link gambar karakter. Player hanya bisa edit foto
                        ID Card sendiri. Admin bisa edit semua player aktif.
                      </p>

                      <input
                        value={photoUrlInput}
                        onChange={(event) => setPhotoUrlInput(event.target.value)}
                        placeholder="https://example.com/character-photo.png"
                        className="lunaria-id-input mt-4"
                      />

                      <button
                        onClick={handleSavePhoto}
                        disabled={isSavingPhoto}
                        className="mt-4 w-full rounded-2xl border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingPhoto ? "Saving..." : "Save Photo"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                        Photo Permission
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Kamu sedang melihat ID Card player lain. Foto hanya bisa
                        diubah oleh pemilik ID Card atau admin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-7">
              <div className="h-full rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoBox label="Name" value={selectedPlayer.character_name} />
                  <InfoBox label="Race" value={selectedPlayer.race} />
                  <InfoBox label="Guild Rank" value={selectedPlayer.guild_rank} />
                  <InfoBox label="Pathway" value={selectedPlayer.pathway} />
                </div>

                <div className="mt-4">
                  <InfoBox label="Misi" value={selectedPlayer.mission} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
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
                </div>

                <div className="mt-6 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
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
                </div>

                <div className="mt-6 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-black/20 to-violet-500/10 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
                    Registered Guild
                  </p>
                  <p className="mt-2 text-lg font-black text-white">
                    Adventurer&apos;s Guild of Aethelgard
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    ID Card publik hanya menampilkan adventurer aktif. Player
                    inactive, banned, atau deleted tidak muncul di dropdown.
                  </p>
                </div>

                <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-emerald-300">
                    Security Notice
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Username dan access code tidak ditampilkan di ID Card.
                    Transaksi tetap memakai playerId dari session login, bukan
                    dari ID Card yang sedang dilihat.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <style jsx>{`
        .lunaria-id-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(0, 0, 0, 0.28);
          padding: 0.85rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value || "-"}</p>
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
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function DataPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
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
