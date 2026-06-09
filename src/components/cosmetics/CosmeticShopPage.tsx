"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import CosmeticCard from "./CosmeticCard";
import CosmeticPreviewModal from "./CosmeticPreviewModal";
import {
  cosmeticItems,
  cosmeticThemes,
  cosmeticTypeLabels,
  type CosmeticItem,
  type CosmeticTheme,
  type CosmeticType,
} from "./data/cosmeticItems";

type LunariaSession = {
  role?: "admin" | "player";
  playerId?: string;
  username?: string;
  characterName?: string;
};

type PlayerCosmeticRow = {
  id: string;
  player_id: string;
  cosmetic_key: string | null;
  cosmetic_name: string | null;
  cosmetic_type: string | null;
  cosmetic_theme: string | null;
  rarity: string | null;
  price_silver: number | null;
  equipped: boolean | null;
};

type FilterTheme = "all" | CosmeticTheme;
type FilterType = "all" | CosmeticType;

function readSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem("lunaria_session") ||
    sessionStorage.getItem("lunaria_session");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as LunariaSession;
  } catch {
    return null;
  }
}

function getThemePanelClass(theme: CosmeticTheme) {
  if (theme === "sovereign-tempest") {
    return "border-amber-300/20 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.82),rgba(30,27,75,0.55))]";
  }

  if (theme === "abyssal-leviathan") {
    return "border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(135deg,rgba(3,16,35,0.86),rgba(8,47,73,0.55))]";
  }

  if (theme === "crimson-aristocrat") {
    return "border-red-300/20 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.18),transparent_34%),linear-gradient(135deg,rgba(22,5,14,0.88),rgba(69,10,10,0.52))]";
  }

  if (theme === "ethereal-yggdrasil") {
    return "border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),linear-gradient(135deg,rgba(4,24,19,0.86),rgba(20,83,45,0.50))]";
  }

  return "border-cyan-200/20 bg-[radial-gradient(circle_at_top_left,rgba(226,232,240,0.12),transparent_34%),linear-gradient(135deg,rgba(8,13,24,0.88),rgba(15,23,42,0.60))]";
}

export default function CosmeticShopPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [silver, setSilver] = useState<number | null>(null);
  const [ownedRows, setOwnedRows] = useState<PlayerCosmeticRow[]>([]);
  const [themeFilter, setThemeFilter] = useState<FilterTheme>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);
  const [workingId, setWorkingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const ownedIds = useMemo(() => {
    return ownedRows
      .map((row) => row.cosmetic_key)
      .filter(Boolean) as string[];
  }, [ownedRows]);

  const equippedIds = useMemo(() => {
    const result: Record<CosmeticType, string> = {
      name_effect: "",
      border: "",
      background: "",
      aura: "",
      particle: "",
    };

    for (const row of ownedRows) {
      if (!row.equipped || !row.cosmetic_key || !row.cosmetic_type) continue;

      const type = row.cosmetic_type as CosmeticType;
      if (type in result) {
        result[type] = row.cosmetic_key;
      }
    }

    return result;
  }, [ownedRows]);

  const filteredItems = useMemo(() => {
    return cosmeticItems.filter((item) => {
      const themeOk = themeFilter === "all" || item.theme === themeFilter;
      const typeOk = typeFilter === "all" || item.type === typeFilter;
      return themeOk && typeOk;
    });
  }, [themeFilter, typeFilter]);

  const groupedByTheme = useMemo(() => {
    return cosmeticThemes
      .map((theme) => {
        const items = filteredItems.filter((item) => item.theme === theme.id);
        return {
          theme,
          items,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [filteredItems]);

  const featuredItem =
    cosmeticItems.find((item) => item.id === "ivory-particle-01") ||
    cosmeticItems[0];

  const ownedCount = ownedIds.length;
  const totalPrice = cosmeticItems.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    const currentSession = readSession();
    setSession(currentSession);

    if (currentSession?.playerId) {
      loadPlayerVault(currentSession.playerId);
    }
  }, []);

  async function loadPlayerVault(playerId: string) {
    setError("");

    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("silver")
      .eq("id", playerId)
      .maybeSingle();

    if (playerError) {
      showError(`Gagal membaca silver: ${playerError.message}`);
      return;
    }

    setSilver(Number(playerData?.silver || 0));

    const { data: cosmeticData, error: cosmeticError } = await supabase
      .from("player_cosmetics")
      .select(
        `
        id,
        player_id,
        cosmetic_key,
        cosmetic_name,
        cosmetic_type,
        cosmetic_theme,
        rarity,
        price_silver,
        equipped
      `
      )
      .eq("player_id", playerId);

    if (cosmeticError) {
      showError(`Gagal membaca cosmetic: ${cosmeticError.message}`);
      setOwnedRows([]);
      return;
    }

    setOwnedRows((cosmeticData || []) as PlayerCosmeticRow[]);
  }

  function showNotice(message: string) {
    setNotice(message);
    setError("");
    window.setTimeout(() => setNotice(""), 3500);
  }

  function showError(message: string) {
    setError(message);
    setNotice("");
    window.setTimeout(() => setError(""), 5000);
  }

  async function handleBuy(item: CosmeticItem) {
    if (!session?.playerId || session.role !== "player") {
      showError("Login sebagai player dulu untuk membeli cosmetic.");
      return;
    }

    if (ownedIds.includes(item.id)) {
      showNotice("Cosmetic ini sudah kamu miliki.");
      return;
    }

    if (silver === null) {
      showError("Balance silver belum terbaca. Refresh halaman dulu.");
      return;
    }

    if (silver < item.price) {
      showError(`Silver tidak cukup. Butuh ${item.price}S.`);
      return;
    }

    const ok = window.confirm(`Beli ${item.name} seharga ${item.price} Silver?`);
    if (!ok) return;

    setWorkingId(item.id);
    setError("");

    const nextSilver = silver - item.price;

    const { error: updateError } = await supabase
      .from("players")
      .update({ silver: nextSilver })
      .eq("id", session.playerId);

    if (updateError) {
      setWorkingId("");
      showError(`Gagal update silver: ${updateError.message}`);
      return;
    }

    const { data: insertData, error: insertError } = await supabase
      .from("player_cosmetics")
      .insert({
        player_id: session.playerId,
        cosmetic_key: item.id,
        cosmetic_name: item.name,
        cosmetic_type: item.type,
        cosmetic_theme: item.theme,
        rarity: item.rarity,
        price_silver: item.price,
        equipped: false,
      })
      .select(
        `
        id,
        player_id,
        cosmetic_key,
        cosmetic_name,
        cosmetic_type,
        cosmetic_theme,
        rarity,
        price_silver,
        equipped
      `
      )
      .single();

    if (insertError) {
      await supabase
        .from("players")
        .update({ silver })
        .eq("id", session.playerId);

      setWorkingId("");
      showError(`Gagal menyimpan cosmetic: ${insertError.message}`);
      return;
    }

    await supabase.from("currency_logs").insert({
      player_id: session.playerId,
      type: "cosmetic_purchase",
      silver_change: -item.price,
      reason: `Purchased cosmetic: ${item.name}`,
    });

    setSilver(nextSilver);
    setOwnedRows((prev) => [...prev, insertData as PlayerCosmeticRow]);
    setWorkingId("");
    showNotice(`${item.name} berhasil dibeli dan tersimpan permanen.`);
  }

  async function handleEquip(item: CosmeticItem) {
    if (!session?.playerId || session.role !== "player") {
      showError("Login sebagai player dulu untuk equip cosmetic.");
      return;
    }

    if (!ownedIds.includes(item.id)) {
      showError("Cosmetic ini belum kamu beli.");
      return;
    }

    setWorkingId(item.id);
    setError("");

    const { error: unequipError } = await supabase
      .from("player_cosmetics")
      .update({ equipped: false })
      .eq("player_id", session.playerId)
      .eq("cosmetic_type", item.type);

    if (unequipError) {
      setWorkingId("");
      showError(`Gagal melepas cosmetic lama: ${unequipError.message}`);
      return;
    }

    const { error: equipError } = await supabase
      .from("player_cosmetics")
      .update({ equipped: true })
      .eq("player_id", session.playerId)
      .eq("cosmetic_key", item.id);

    if (equipError) {
      setWorkingId("");
      showError(`Gagal memasang cosmetic: ${equipError.message}`);
      return;
    }

    setOwnedRows((prev) =>
      prev.map((row) => {
        if (row.cosmetic_type === item.type) {
          return {
            ...row,
            equipped: row.cosmetic_key === item.id,
          };
        }

        return row;
      })
    );

    setWorkingId("");
    showNotice(`${item.name} berhasil dipasang permanen.`);
  }

  return (
    <main className="relative space-y-6 overflow-hidden text-slate-100">
      <section className="relative overflow-hidden rounded-[36px] border border-amber-300/20 bg-[radial-gradient(circle_at_16%_18%,rgba(245,158,11,0.20),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.22),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.12),transparent_44%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.88))] p-6 shadow-[0_0_80px_rgba(245,158,11,0.10)] md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-8">
            <div className="inline-flex rounded-full border border-amber-300/25 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-amber-200">
              Lunaria Cosmetic Vault
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Moonlit Identity Collection
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Cosmetic Shop untuk Name Effect, ID Border, ID Background, Aura,
              dan Particle Effect. Semua purchase dan equip sekarang tersimpan
              permanen di Supabase.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <VaultStat label="Total Item" value="25" />
              <VaultStat label="Owned" value={`${ownedCount}/25`} />
              <VaultStat label="Full Vault" value={`${totalPrice}S`} />
              <VaultStat
                label="Silver"
                value={
                  session?.role === "player"
                    ? `${silver ?? "-"}S`
                    : session?.role === "admin"
                    ? "Admin"
                    : "-"
                }
              />
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/35 p-5">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
                  Featured Cosmetic
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-cyan-200/20 bg-cyan-300/10 text-3xl">
                    {featuredItem.icon}
                  </div>

                  <div>
                    <p className="text-lg font-black text-white">
                      {featuredItem.name}
                    </p>
                    <p
                      className={`mt-1 text-sm font-bold ${featuredItem.accent}`}
                    >
                      {featuredItem.themeName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewItem(featuredItem)}
                  className="mt-5 w-full rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-amber-100 transition hover:border-amber-200/45"
                >
                  Preview Featured
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <section className="rounded-[26px] border border-emerald-300/25 bg-emerald-400/10 p-5 text-sm font-bold text-emerald-200">
          {notice}
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[26px] border border-red-300/25 bg-red-400/10 p-5 text-sm font-bold text-red-200">
          {error}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-[30px] border border-white/10 bg-black/30 p-5 xl:col-span-7">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-amber-300">
            Filter Collection
          </p>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            <FilterButton
              active={themeFilter === "all"}
              label="All"
              onClick={() => setThemeFilter("all")}
            />

            {cosmeticThemes.map((theme) => (
              <FilterButton
                key={theme.id}
                active={themeFilter === theme.id}
                label={`${theme.icon} ${theme.name}`}
                onClick={() => setThemeFilter(theme.id)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/30 p-5 xl:col-span-5">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-300">
            Filter Type
          </p>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            <FilterButton
              active={typeFilter === "all"}
              label="All"
              onClick={() => setTypeFilter("all")}
            />

            {(Object.keys(cosmeticTypeLabels) as CosmeticType[]).map((type) => (
              <FilterButton
                key={type}
                active={typeFilter === type}
                label={cosmeticTypeLabels[type]}
                onClick={() => setTypeFilter(type)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-7">
        {groupedByTheme.map(({ theme, items }) => (
          <div
            key={theme.id}
            className={`overflow-hidden rounded-[36px] border p-5 md:p-6 ${getThemePanelClass(
              theme.id
            )}`}
          >
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
                  {theme.icon} {theme.mood}
                </div>

                <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
                  {theme.name}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                  {theme.subtitle}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                {items.length} Item
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {items.map((item) => (
                <CosmeticCard
                  key={item.id}
                  item={item}
                  owned={ownedIds.includes(item.id)}
                  equipped={equippedIds[item.type] === item.id}
                  working={workingId === item.id}
                  onPreview={() => setPreviewItem(item)}
                  onBuy={() => handleBuy(item)}
                  onEquip={() => handleEquip(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <CosmeticPreviewModal
        item={previewItem}
        owned={previewItem ? ownedIds.includes(previewItem.id) : false}
        equipped={
          previewItem ? equippedIds[previewItem.type] === previewItem.id : false
        }
        working={previewItem ? workingId === previewItem.id : false}
        onClose={() => setPreviewItem(null)}
        onBuy={() => previewItem && handleBuy(previewItem)}
        onEquip={() => previewItem && handleEquip(previewItem)}
      />
    </main>
  );
}

function VaultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
        active
          ? "border-amber-300/40 bg-amber-400/14 text-amber-100"
          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
