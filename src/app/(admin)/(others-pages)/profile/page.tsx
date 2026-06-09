 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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

type CosmeticType =
  | "Name Effect"
  | "ID Border"
  | "ID Background"
  | "Aura Effect";

type Cosmetic = {
  id: string;
  name: string;
  type: CosmeticType;
  icon: string;
  nameClass?: string;
  borderClass?: string;
  backgroundClass?: string;
  auraClass?: string;
};

type PlayerCosmeticRow = {
  id: string;
  player_id: string;
  cosmetic_id: string;
  equipped: boolean;
};

const cosmetics: Cosmetic[] = [
  {
    id: "name-ember-script",
    name: "Ember Script",
    type: "Name Effect",
    icon: "✦",
    nameClass:
      "text-amber-200 drop-shadow-[0_0_16px_rgba(245,158,11,0.45)]",
  },
  {
    id: "name-royal-gold",
    name: "Royal Gold Name",
    type: "Name Effect",
    icon: "♛",
    nameClass:
      "bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(245,158,11,0.55)]",
  },
  {
    id: "border-silver-oath",
    name: "Silver Oath Border",
    type: "ID Border",
    icon: "◆",
    borderClass:
      "border-sky-200/55 shadow-[0_0_55px_rgba(125,211,252,0.18)]",
  },
  {
    id: "border-demon-throne",
    name: "Demon Throne Border",
    type: "ID Border",
    icon: "♜",
    borderClass:
      "border-red-400/60 shadow-[0_0_70px_rgba(248,113,113,0.22)]",
  },
  {
    id: "bg-moonlit-archive",
    name: "Moonlit Archive",
    type: "ID Background",
    icon: "☾",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.28),transparent_34%),linear-gradient(135deg,#020617,#030712_45%,#0f172a)]",
  },
  {
    id: "bg-void-cathedral",
    name: "Void Cathedral",
    type: "ID Background",
    icon: "✧",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.20),transparent_34%),linear-gradient(135deg,#020617,#05000d_45%,#12051f)]",
  },
  {
    id: "aura-green-sanctuary",
    name: "Green Sanctuary Aura",
    type: "Aura Effect",
    icon: "❧",
    auraClass:
      "bg-emerald-400/20 shadow-[0_0_75px_rgba(52,211,153,0.28)]",
  },
  {
    id: "aura-astral-crown",
    name: "Astral Crown Aura",
    type: "Aura Effect",
    icon: "✺",
    auraClass:
      "bg-violet-400/20 shadow-[0_0_90px_rgba(168,85,247,0.34)]",
  },
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

function calculatePoints(player: Player) {
  return (
    player.common_quests * 10 +
    player.uncommon_quests * 25 +
    player.dangerous_quests * 60 +
    player.special_quests * 120
  );
}

function getCosmeticById(id: string) {
  return cosmetics.find((item) => item.id === id) || null;
}

export default function AdventurerIdCardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [equippedRows, setEquippedRows] = useState<PlayerCosmeticRow[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) || players[0];

  const selectedCosmetics = useMemo(() => {
    const result: Record<CosmeticType, Cosmetic | null> = {
      "Name Effect": null,
      "ID Border": null,
      "ID Background": null,
      "Aura Effect": null,
    };

    if (!selectedPlayer) return result;

    equippedRows
      .filter((row) => row.player_id === selectedPlayer.id && row.equipped)
      .forEach((row) => {
        const cosmetic = getCosmeticById(row.cosmetic_id);
        if (!cosmetic) return;

        result[cosmetic.type] = cosmetic;
      });

    return result;
  }, [equippedRows, selectedPlayer]);

  const equippedList = useMemo(() => {
    return Object.values(selectedCosmetics).filter(Boolean) as Cosmetic[];
  }, [selectedCosmetics]);

  const idCardText = useMemo(() => {
    if (!selectedPlayer) {
      return "";
    }

    const cosmeticText = equippedList.length
      ? equippedList.map((item) => `- ${item.type}: ${item.name}`).join("\n")
      : "- No cosmetic equipped";

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
*Equipped Cosmetic*
${cosmeticText}
━━━━━━━━━━━━━━━━━━
Registered Guild :
Adventurer's Guild of Aethelgard

Status :
${selectedPlayer.status === "active" ? "Active Adventurer" : selectedPlayer.status}`;
  }, [selectedPlayer, equippedList]);

  const fetchPlayers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data: playerData, error: playerError } = await supabase
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
      .order("created_at", { ascending: false });

    if (playerError) {
      setIsLoading(false);
      setErrorMessage(playerError.message);
      return;
    }

    const { data: cosmeticData, error: cosmeticError } = await supabase
      .from("player_cosmetics")
      .select("id, player_id, cosmetic_id, equipped")
      .eq("equipped", true);

    setIsLoading(false);

    if (cosmeticError) {
      setErrorMessage(`Failed to load cosmetics: ${cosmeticError.message}`);
      setPlayers((playerData as Player[] | null) || []);
      return;
    }

    const playerRows = (playerData as Player[] | null) || [];
    const cosmeticRows = (cosmeticData as PlayerCosmeticRow[] | null) || [];

    setPlayers(playerRows);
    setEquippedRows(cosmeticRows);

    if (playerRows.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(playerRows[0].id);
    }
  };

  useEffect(() => {
    fetchPlayers();

    const playersChannel = supabase
      .channel("lunaria-id-card-players")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    const cosmeticsChannel = supabase
      .channel("lunaria-id-card-cosmetics")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_cosmetics",
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(cosmeticsChannel);
    };
  }, []);

  const handleCopy = async () => {
    if (!idCardText) return;

    await navigator.clipboard.writeText(idCardText);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  const nameClass =
    selectedCosmetics["Name Effect"]?.nameClass || "text-white";

  const borderClass =
    selectedCosmetics["ID Border"]?.borderClass ||
    "border-amber-400/30 shadow-[0_0_50px_rgba(245,158,11,0.14)]";

  const backgroundClass =
    selectedCosmetics["ID Background"]?.backgroundClass || "bg-[#070812]";

  const auraClass = selectedCosmetics["Aura Effect"]?.auraClass || "";

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
              ID Card publik untuk melihat data adventurer. Cosmetic yang sudah
              dibeli dan dipasang akan tampil otomatis di kartu ini.
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

      {isLoading ? (
        <section className="rounded-[24px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">
            Loading player data from Supabase...
          </p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">
            Failed to load players: {errorMessage}
          </p>
        </section>
      ) : null}

      {!isLoading && players.length === 0 ? (
        <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 text-slate-400">
          Belum ada player aktif. Approve registration dari Admin Panel dulu.
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
              <div
                className={`relative overflow-hidden rounded-[32px] border p-5 ${backgroundClass} ${borderClass}`}
              >
                {auraClass ? (
                  <>
                    <div
                      className={`pointer-events-none absolute -left-12 top-20 h-40 w-40 rounded-full blur-3xl ${auraClass}`}
                    />
                    <div
                      className={`pointer-events-none absolute -right-12 bottom-16 h-44 w-44 rounded-full blur-3xl ${auraClass}`}
                    />
                  </>
                ) : null}

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_30%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:36px_36px]" />

                <div className="relative z-10 rounded-[26px] border border-amber-400/20 bg-black/35 p-5 backdrop-blur-sm">
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

                    <h2 className={`mt-5 text-3xl font-black ${nameClass}`}>
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
                      {selectedPlayer.status === "active"
                        ? "Active Adventurer"
                        : selectedPlayer.status}
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-violet-300">
                      Equipped Cosmetics
                    </p>

                    <div className="mt-3 space-y-2">
                      {equippedList.length ? (
                        equippedList.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm"
                          >
                            <span className="text-slate-200">
                              {item.icon} {item.name}
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
                </div>
              </div>
            </div>

            <div className="xl:col-span-7">
              <div className="h-full rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoBox label="Name" value={selectedPlayer.character_name} />
                  <InfoBox label="Race" value={selectedPlayer.race} />
                  <InfoBox
                    label="Guild Rank"
                    value={selectedPlayer.guild_rank}
                  />
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
                    <QuestBox
                      label="Common"
                      value={selectedPlayer.common_quests}
                    />
                    <QuestBox
                      label="Uncommon"
                      value={selectedPlayer.uncommon_quests}
                    />
                    <QuestBox
                      label="Dangerous"
                      value={selectedPlayer.dangerous_quests}
                    />
                    <QuestBox
                      label="Special"
                      value={selectedPlayer.special_quests}
                    />
                    <QuestBox
                      label="Points"
                      value={calculatePoints(selectedPlayer)}
                    />
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
                    Data ini terhubung ke Supabase. Update dari Admin Panel,
                    Cosmetic Shop, dan Fortune Hall akan tampil setelah refresh
                    data.
                  </p>
                </div>

                <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-emerald-300">
                    Security Notice
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    ID Card boleh dilihat semua player, tapi pembelian cosmetic,
                    fortune, dan transaksi selalu memakai akun login sendiri.
                    Username dan access code tidak ditampilkan di halaman publik
                    ini.
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
