"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type SessionData =
  | {
      role: "player";
      playerId: string;
      username: string;
      characterName: string;
      rank: string;
      pathway: string;
    }
  | {
      role: "admin";
      username: string;
    };

type Player = {
  id: string;
  character_name: string;
  race: string;
  guild_rank: string;
  pathway: string;
  silver: number;
  status: string;
};

type Cosmetic = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  price_silver: number;
  description: string;
  effect_label: string;
  status: string;
};

type PlayerCosmetic = {
  id: string;
  player_id: string;
  cosmetic_id: string;
  equipped: boolean;
  cosmetics?: Cosmetic;
};

const fallbackCosmetics: Cosmetic[] = [
  {
    id: "silver-oath-border",
    name: "Silver Oath Border",
    type: "ID Border",
    rarity: "Rare",
    price_silver: 30,
    description:
      "Border lisensi berkilau perak untuk adventurer yang ingin ID Card terlihat lebih resmi dan elegan.",
    effect_label: "Soft silver frame + oath glow",
    status: "active",
  },
  {
    id: "moonlit-archive",
    name: "Moonlit Archive",
    type: "ID Background",
    rarity: "Rare",
    price_silver: 45,
    description:
      "Background kartu bernuansa arsip bulan malam, cocok untuk karakter misterius dan kalem.",
    effect_label: "Moon archive card background",
    status: "active",
  },
  {
    id: "celestial-name-aura",
    name: "Celestial Name Aura",
    type: "Name Aura",
    rarity: "Epic",
    price_silver: 85,
    description:
      "Nama karakter memancarkan aura biru bulan yang halus. Tidak berlebihan, tapi terlihat mahal.",
    effect_label: "Animated lunar name glow",
    status: "active",
  },
  {
    id: "eclipse-throne-frame",
    name: "Eclipse Throne Frame",
    type: "ID Border",
    rarity: "Epic",
    price_silver: 120,
    description:
      "Frame gelap keemasan dengan sentuhan eclipse. Cocok untuk adventurer yang ingin terlihat seperti elite guild.",
    effect_label: "Eclipse gold premium frame",
    status: "active",
  },
  {
    id: "royal-moon-vessel",
    name: "Royal Moon Vessel",
    type: "ID Background",
    rarity: "Legendary",
    price_silver: 180,
    description:
      "Background eksklusif dengan nuansa royal moonlit hall. Memberi kesan ID Card seperti lisensi bangsawan Lunaria.",
    effect_label: "Royal lunar vessel background",
    status: "active",
  },
  {
    id: "astral-sovereign-aura",
    name: "Astral Sovereign Aura",
    type: "Name Aura",
    rarity: "Legendary",
    price_silver: 250,
    description:
      "Aura nama paling mewah untuk player yang ingin tampil menonjol tanpa terlihat norak.",
    effect_label: "Astral animated sovereign glow",
    status: "active",
  },
];

function getSession(): SessionData | null {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem("lunaria_session") ||
    sessionStorage.getItem("lunaria_session");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

function getRarityTheme(rarity: string) {
  const key = rarity?.toLowerCase();

  if (key === "legendary") {
    return {
      label: "Legendary",
      text: "text-amber-200",
      price: "text-amber-300",
      border: "border-amber-300/35",
      badge:
        "border-amber-300/35 bg-amber-400/15 text-amber-200 shadow-[0_0_22px_rgba(245,158,11,0.18)]",
      card: "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_42%),linear-gradient(135deg,rgba(69,26,3,0.55),rgba(2,6,23,0.94),rgba(30,27,75,0.75))]",
      icon: <CrownIcon />,
      glow: "bg-amber-300/25",
      preview:
        "border-amber-300/40 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.26),transparent_35%),linear-gradient(135deg,rgba(69,26,3,0.8),rgba(2,6,23,0.95),rgba(88,28,135,0.6))]",
    };
  }

  if (key === "epic") {
    return {
      label: "Epic",
      text: "text-violet-200",
      price: "text-violet-300",
      border: "border-violet-300/30",
      badge:
        "border-violet-300/30 bg-violet-400/15 text-violet-200 shadow-[0_0_20px_rgba(168,85,247,0.16)]",
      card: "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_42%),linear-gradient(135deg,rgba(59,7,100,0.55),rgba(2,6,23,0.94),rgba(15,23,42,0.75))]",
      icon: <StarIcon />,
      glow: "bg-violet-300/24",
      preview:
        "border-violet-300/35 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_35%),linear-gradient(135deg,rgba(59,7,100,0.72),rgba(2,6,23,0.95),rgba(15,23,42,0.7))]",
    };
  }

  if (key === "rare") {
    return {
      label: "Rare",
      text: "text-sky-200",
      price: "text-sky-300",
      border: "border-sky-300/28",
      badge:
        "border-sky-300/30 bg-sky-400/12 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.12)]",
      card: "bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.20),transparent_35%),linear-gradient(135deg,rgba(8,47,73,0.52),rgba(2,6,23,0.94),rgba(15,23,42,0.75))]",
      icon: <MoonIcon />,
      glow: "bg-sky-300/22",
      preview:
        "border-sky-300/32 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.22),transparent_35%),linear-gradient(135deg,rgba(8,47,73,0.7),rgba(2,6,23,0.95),rgba(15,23,42,0.7))]",
    };
  }

  return {
    label: "Common",
    text: "text-slate-200",
    price: "text-slate-200",
    border: "border-white/12",
    badge: "border-white/10 bg-white/[0.05] text-slate-300",
    card: "bg-[linear-gradient(135deg,rgba(15,23,42,0.75),rgba(2,6,23,0.95))]",
    icon: <ShieldIcon />,
    glow: "bg-white/10",
    preview:
      "border-white/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(2,6,23,0.96))]",
  };
}

function typeSortValue(type: string) {
  const key = type.toLowerCase();
  if (key.includes("border")) return 1;
  if (key.includes("background")) return 2;
  if (key.includes("aura")) return 3;
  return 4;
}

function raritySortValue(rarity: string) {
  const key = rarity.toLowerCase();
  if (key === "legendary") return 4;
  if (key === "epic") return 3;
  if (key === "rare") return 2;
  return 1;
}

export default function LunariaCosmeticShopPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [ownedCosmetics, setOwnedCosmetics] = useState<PlayerCosmetic[]>([]);
  const [selectedType, setSelectedType] = useState("All");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState("");

  const isPlayer = session?.role === "player";
  const isAdmin = session?.role === "admin";

  const ownedIds = useMemo(() => {
    return new Set(ownedCosmetics.map((item) => item.cosmetic_id));
  }, [ownedCosmetics]);

  const equippedByType = useMemo(() => {
    const map = new Map<string, PlayerCosmetic>();

    ownedCosmetics.forEach((item) => {
      if (item.equipped && item.cosmetics?.type) {
        map.set(item.cosmetics.type, item);
      }
    });

    return map;
  }, [ownedCosmetics]);

  const shopTypes = useMemo(() => {
    const types = Array.from(new Set(cosmetics.map((item) => item.type))).filter(
      Boolean
    );

    return ["All", ...types.sort()];
  }, [cosmetics]);

  const filteredCosmetics = useMemo(() => {
    return [...cosmetics]
      .filter((item) => item.status !== "inactive")
      .filter((item) => selectedType === "All" || item.type === selectedType)
      .sort((a, b) => {
        const typeDiff = typeSortValue(a.type) - typeSortValue(b.type);
        if (typeDiff !== 0) return typeDiff;

        return raritySortValue(a.rarity) - raritySortValue(b.rarity);
      });
  }, [cosmetics, selectedType]);

  const equippedItems = useMemo(() => {
    return ownedCosmetics.filter((item) => item.equipped && item.cosmetics);
  }, [ownedCosmetics]);

  const totalOwned = ownedCosmetics.length;
  const legendaryCount = ownedCosmetics.filter(
    (item) => item.cosmetics?.rarity?.toLowerCase() === "legendary"
  ).length;

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2800);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    const { data: cosmeticData, error: cosmeticError } = await supabase
      .from("cosmetics")
      .select("*")
      .order("price_silver", { ascending: true });

    if (cosmeticError) {
      setCosmetics(fallbackCosmetics);
    } else {
      const rows = (cosmeticData || []) as Cosmetic[];
      setCosmetics(rows.length > 0 ? rows : fallbackCosmetics);
    }

    if (!currentSession || currentSession.role !== "player") {
      setPlayer(null);
      setOwnedCosmetics([]);
      setIsLoading(false);
      return;
    }

    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("id, character_name, race, guild_rank, pathway, silver, status")
      .eq("id", currentSession.playerId)
      .maybeSingle();

    if (playerError || !playerData) {
      setPlayer(null);
      setOwnedCosmetics([]);
      setIsLoading(false);
      showError("Player session tidak ditemukan. Login ulang dulu.");
      return;
    }

    setPlayer(playerData as Player);

    const { data: ownedData, error: ownedError } = await supabase
      .from("player_cosmetics")
      .select(
        `
        id,
        player_id,
        cosmetic_id,
        equipped,
        cosmetics (
          id,
          name,
          type,
          rarity,
          price_silver,
          description,
          effect_label,
          status
        )
      `
      )
      .eq("player_id", currentSession.playerId);

    if (ownedError) {
      setOwnedCosmetics([]);
      showError(`Failed to load owned cosmetics: ${ownedError.message}`);
    } else {
      setOwnedCosmetics((ownedData || []) as unknown as PlayerCosmetic[]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuy = async (cosmetic: Cosmetic) => {
    if (!isPlayer || !player) {
      showError("Login sebagai player dulu untuk membeli cosmetic.");
      return;
    }

    if (ownedIds.has(cosmetic.id)) {
      showError("Cosmetic ini sudah kamu miliki.");
      return;
    }

    if (Number(player.silver || 0) < Number(cosmetic.price_silver || 0)) {
      showError("Silver belum cukup untuk membeli cosmetic ini.");
      return;
    }

    const confirmed = window.confirm(
      `Beli ${cosmetic.name} seharga ${cosmetic.price_silver}S?`
    );

    if (!confirmed) return;

    setIsWorking(cosmetic.id);
    setErrorMessage("");

    const nextSilver = Number(player.silver || 0) - Number(cosmetic.price_silver || 0);

    const { error: playerError } = await supabase
      .from("players")
      .update({ silver: nextSilver })
      .eq("id", player.id);

    if (playerError) {
      setIsWorking("");
      showError(`Purchase failed: ${playerError.message}`);
      return;
    }

    const { data: newOwned, error: ownedError } = await supabase
      .from("player_cosmetics")
      .insert({
        player_id: player.id,
        cosmetic_id: cosmetic.id,
        equipped: false,
      })
      .select(
        `
        id,
        player_id,
        cosmetic_id,
        equipped,
        cosmetics (
          id,
          name,
          type,
          rarity,
          price_silver,
          description,
          effect_label,
          status
        )
      `
      )
      .single();

    if (ownedError) {
      setIsWorking("");
      showError(`Owned cosmetic insert failed: ${ownedError.message}`);
      return;
    }

    await supabase.from("currency_logs").insert({
      player_id: player.id,
      type: "cosmetic_purchase",
      silver_change: -Number(cosmetic.price_silver || 0),
      reason: `Bought cosmetic: ${cosmetic.name}`,
    });

    setPlayer((prev) => (prev ? { ...prev, silver: nextSilver } : prev));
    setOwnedCosmetics((prev) => [
      ...prev,
      newOwned as unknown as PlayerCosmetic,
    ]);

    setIsWorking("");
    showNotice(`${cosmetic.name} berhasil dibeli. Equip untuk memasangnya.`);
  };

  const handleEquip = async (owned: PlayerCosmetic) => {
    if (!isPlayer || !player || !owned.cosmetics) {
      showError("Login sebagai player dulu.");
      return;
    }

    const targetType = owned.cosmetics.type;
    setIsWorking(owned.cosmetic_id);
    setErrorMessage("");

    const { error: unequipError } = await supabase
      .from("player_cosmetics")
      .update({ equipped: false })
      .eq("player_id", player.id)
      .eq("cosmetics.type", targetType);

    if (unequipError) {
      // fallback kalau Supabase tidak bisa filter join pada update
      const sameTypeOwned = ownedCosmetics.filter(
        (item) => item.cosmetics?.type === targetType
      );

      for (const item of sameTypeOwned) {
        await supabase
          .from("player_cosmetics")
          .update({ equipped: false })
          .eq("id", item.id);
      }
    }

    const { error: equipError } = await supabase
      .from("player_cosmetics")
      .update({ equipped: true })
      .eq("id", owned.id);

    if (equipError) {
      setIsWorking("");
      showError(`Equip failed: ${equipError.message}`);
      return;
    }

    setOwnedCosmetics((prev) =>
      prev.map((item) => {
        if (item.cosmetics?.type === targetType) {
          return { ...item, equipped: item.id === owned.id };
        }

        return item;
      })
    );

    setIsWorking("");
    showNotice(`${owned.cosmetics.name} berhasil dipasang.`);
  };

  const handleUnequip = async (owned: PlayerCosmetic) => {
    if (!isPlayer || !owned.cosmetics) return;

    setIsWorking(owned.cosmetic_id);

    const { error } = await supabase
      .from("player_cosmetics")
      .update({ equipped: false })
      .eq("id", owned.id);

    setIsWorking("");

    if (error) {
      showError(`Unequip failed: ${error.message}`);
      return;
    }

    setOwnedCosmetics((prev) =>
      prev.map((item) =>
        item.id === owned.id ? { ...item, equipped: false } : item
      )
    );

    showNotice(`${owned.cosmetics.name} dilepas dari ID Card.`);
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="relative overflow-hidden rounded-[34px] border border-amber-400/20 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.25),transparent_44%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(3,7,18,0.98),rgba(30,27,75,0.78))] p-6 shadow-[0_0_80px_rgba(245,158,11,0.10)] md:p-8">
        <MoonDust />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2">
              <MoonIcon />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-300">
                Lunaria Cosmetic Vault
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
              Cosmetic Shop
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Tempat membeli aura, border, dan background premium untuk membuat
              ID Card terasa lebih hidup, lebih mahal, dan lebih khas sebagai
              identitas adventurer Lunaria.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="relative overflow-hidden rounded-[22px] border border-amber-300/30 bg-gradient-to-r from-amber-500/18 via-black/20 to-violet-500/18 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 shadow-[0_0_36px_rgba(245,158,11,0.10)] transition hover:border-amber-200/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Syncing..." : "Refresh Vault"}
          </button>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <VaultStat
            label="Current Vessel"
            value={player?.character_name || (isAdmin ? "Admin" : "Guest")}
            desc={isPlayer ? "Player vault active" : "Preview mode"}
            tone="text-amber-300"
            icon={<UserIcon />}
          />
          <VaultStat
            label="Silver Balance"
            value={player ? `${player.silver}S` : "-"}
            desc="Currency RP Lunaria"
            tone="text-slate-100"
            icon={<MoonIcon />}
          />
          <VaultStat
            label="Owned Relics"
            value={String(totalOwned)}
            desc="Cosmetics collected"
            tone="text-sky-300"
            icon={<CrystalIcon />}
          />
          <VaultStat
            label="Legendary Items"
            value={String(legendaryCount)}
            desc="Highest cosmetic tier"
            tone="text-amber-300"
            icon={<CrownIcon />}
          />
        </div>
      </section>

      {notice ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
          {notice}
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-4 text-sm font-bold text-red-200">
          {errorMessage}
        </section>
      ) : null}

      {!isPlayer ? (
        <section className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-5 text-sm leading-6 text-amber-100">
          {isAdmin
            ? "Admin mode hanya untuk melihat tampilan shop. Pembelian dan equip cosmetic dilakukan oleh player melalui akun masing-masing."
            : "Login sebagai player untuk membeli dan memasang cosmetic ke ID Card."}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="space-y-6 xl:col-span-4">
          <section className="relative overflow-hidden rounded-[34px] border border-amber-400/18 bg-black/35 p-5 shadow-[0_0_55px_rgba(15,23,42,0.35)]">
            <MoonDust />

            <div className="relative z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-300">
                ID Card Preview
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Current Look
              </h2>

              <div className="mt-5 rounded-[30px] border border-amber-400/24 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96),rgba(30,27,75,0.55))] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
                      Adventurer License
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Cosmetic vessel preview
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-amber-400/25 bg-amber-500/10 text-amber-300">
                    <CrownIcon />
                  </div>
                </div>

                <div className="mt-6 flex flex-col items-center text-center">
                  <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[30px] border border-amber-400/25 bg-gradient-to-br from-slate-950 via-black to-violet-950 shadow-[0_0_35px_rgba(245,158,11,0.12)]">
                    <span className="text-5xl">🌙</span>
                    <span className="absolute bottom-2 rounded-full border border-amber-400/25 bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">
                      Preview
                    </span>
                  </div>

                  <h3 className="mt-5 bg-gradient-to-r from-amber-100 via-white to-violet-200 bg-clip-text text-3xl font-black tracking-[-0.04em] text-transparent">
                    {player?.character_name || "Lunaria Adventurer"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {player
                      ? `${player.guild_rank} • ${player.pathway}`
                      : "Moonlit Guild Vessel"}
                  </p>
                </div>

                <div className="mt-6 rounded-[24px] border border-violet-300/18 bg-violet-400/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">
                    Equipped Effects
                  </p>

                  <div className="mt-3 space-y-2">
                    {equippedItems.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        Belum ada cosmetic terpasang.
                      </p>
                    ) : (
                      equippedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-3"
                        >
                          <span className="text-sm font-bold text-white">
                            {item.cosmetics?.name}
                          </span>
                          <button
                            onClick={() => handleUnequip(item)}
                            disabled={isWorking === item.cosmetic_id}
                            className="text-xs font-black uppercase tracking-[0.14em] text-red-300"
                          >
                            Unequip
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[34px] border border-violet-400/18 bg-black/35 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-violet-300">
              Vault Category
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {shopTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                    selectedType === type
                      ? "border-amber-300/35 bg-amber-500/15 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.10)]"
                      : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-amber-400/20 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="xl:col-span-8">
          <div className="rounded-[34px] border border-white/10 bg-black/35 p-5 shadow-[0_0_60px_rgba(15,23,42,0.40)] md:p-6">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-300">
                  Moonlit Relic Market
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">
                  Premium Cosmetics
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Semakin tinggi rarity, semakin kuat identitas visualnya. Item
                  Legendary dibuat untuk player yang ingin ID Card-nya terasa
                  seperti artefak guild eksklusif.
                </p>
              </div>

              <div className="rounded-[20px] border border-amber-400/20 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-200">
                {filteredCosmetics.length} Items
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-[32px] border border-white/10 bg-white/[0.04]"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {filteredCosmetics.map((cosmetic) => {
                  const theme = getRarityTheme(cosmetic.rarity);
                  const owned = ownedCosmetics.find(
                    (item) => item.cosmetic_id === cosmetic.id
                  );
                  const isOwned = Boolean(owned);
                  const isEquipped = Boolean(owned?.equipped);
                  const sameTypeEquipped = equippedByType.get(cosmetic.type);

                  return (
                    <article
                      key={cosmetic.id}
                      className={`group relative overflow-hidden rounded-[32px] border ${theme.border} ${theme.card} p-5 shadow-[0_0_50px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_70px_rgba(245,158,11,0.10)]`}
                    >
                      <span
                        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl ${theme.glow}`}
                      />
                      <span className="pointer-events-none absolute inset-0 translate-x-[-140%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-[140%]" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border ${theme.badge}`}
                          >
                            {theme.icon}
                          </div>

                          <div className="text-right">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${theme.badge}`}
                            >
                              {theme.label}
                            </span>

                            <p className={`mt-3 text-3xl font-black ${theme.price}`}>
                              {cosmetic.price_silver}S
                            </p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                            {cosmetic.type}
                          </p>

                          <h3
                            className={`mt-2 text-2xl font-black tracking-[-0.03em] ${theme.text}`}
                          >
                            {cosmetic.name}
                          </h3>

                          <p className="mt-3 min-h-18 text-sm leading-6 text-slate-400">
                            {cosmetic.description}
                          </p>
                        </div>

                        <div
                          className={`mt-5 rounded-[24px] border ${theme.preview} p-4`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                            Effect Preview
                          </p>

                          <p className="mt-2 text-sm font-black text-white">
                            {cosmetic.effect_label || "Premium ID Card Effect"}
                          </p>

                          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <span className="text-sm font-bold text-slate-300">
                              {cosmetic.type}
                            </span>

                            <span className={`text-sm font-black ${theme.price}`}>
                              {cosmetic.rarity}
                            </span>
                          </div>
                        </div>

                        {sameTypeEquipped && !isEquipped ? (
                          <p className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-xs font-semibold leading-5 text-sky-200">
                            Saat equip item ini, {sameTypeEquipped.cosmetics?.name} akan dilepas dari slot {cosmetic.type}.
                          </p>
                        ) : null}

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {!isOwned ? (
                            <button
                              onClick={() => handleBuy(cosmetic)}
                              disabled={!isPlayer || isWorking === cosmetic.id}
                              className="rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-600/25 via-amber-500/15 to-violet-600/20 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-200/50 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                            >
                              {isWorking === cosmetic.id
                                ? "Buying..."
                                : isPlayer
                                ? "Buy Relic"
                                : "Player Only"}
                            </button>
                          ) : isEquipped ? (
                            <button
                              onClick={() => owned && handleUnequip(owned)}
                              disabled={isWorking === cosmetic.id}
                              className="rounded-2xl border border-emerald-300/30 bg-emerald-400/12 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-emerald-200 transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                            >
                              Equipped
                            </button>
                          ) : (
                            <>
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                                Owned
                              </div>

                              <button
                                onClick={() => owned && handleEquip(owned)}
                                disabled={isWorking === cosmetic.id}
                                className="rounded-2xl border border-sky-300/30 bg-sky-400/12 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-sky-200 transition hover:bg-sky-400/18 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isWorking === cosmetic.id ? "Equipping..." : "Equip"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </section>

      <style jsx>{`
        @keyframes moon-pulse {
          0%,
          100% {
            opacity: 0.25;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 0.75;
            transform: translateY(-8px) scale(1.08);
          }
        }

        .moon-dust {
          animation: moon-pulse 4.5s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

function VaultStat({
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

      <p className={`mt-5 text-3xl font-black ${tone}`}>{value}</p>

      <p className="mt-2 text-sm text-slate-500">{desc}</p>
    </div>
  );
}

function MoonDust() {
  return (
    <>
      <span className="moon-dust pointer-events-none absolute left-[18%] top-[20%] h-2 w-2 rounded-full bg-amber-300/50 blur-[1px]" />
      <span className="moon-dust pointer-events-none absolute right-[18%] top-[16%] h-2.5 w-2.5 rounded-full bg-violet-300/40 blur-[1px]" />
      <span className="moon-dust pointer-events-none absolute bottom-[18%] left-[45%] h-2 w-2 rounded-full bg-sky-300/35 blur-[1px]" />
    </>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4.5 17.5h15M6.3 16.8 5 8.5l4.2 3L12 6l2.8 5.5 4.2-3-1.3 8.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M19.2 14.8A7.8 7.8 0 0 1 9.2 4.8 8.1 8.1 0 1 0 19.2 14.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3.8 14.2 9.8 20.2 12 14.2 14.2 12 20.2 9.8 14.2 3.8 12 9.8 9.8 12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3.5 19 6v5.7c0 4.3-2.8 7.4-7 8.8-4.2-1.4-7-4.5-7-8.8V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrystalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="m12 3 7 6-7 12L5 9l7-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M5 9h14M12 3v18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 13.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4.8 20c.95-3.25 3.4-5 7.2-5s6.25 1.75 7.2 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
