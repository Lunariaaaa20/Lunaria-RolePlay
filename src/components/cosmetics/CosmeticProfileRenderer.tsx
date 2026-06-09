"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CosmeticItem, CosmeticType } from "./data/cosmeticItems";
import { getCosmeticById } from "./data/cosmeticItems";
import CosmeticEffectRenderer from "./CosmeticEffectRenderer";

type EquippedCosmetics = Record<CosmeticType, string>;

type CosmeticProfileRendererProps = {
  playerId: string;
  children: React.ReactNode;
  className?: string;
};

type PlayerCosmeticRow = {
  cosmetic_key: string | null;
  cosmetic_type: string | null;
  equipped: boolean | null;
};

const emptyEquipped: EquippedCosmetics = {
  name_effect: "",
  border: "",
  background: "",
  aura: "",
  particle: "",
};

async function fetchEquippedCosmetics(playerId: string): Promise<EquippedCosmetics> {
  const { data, error } = await supabase
    .from("player_cosmetics")
    .select("cosmetic_key, cosmetic_type, equipped")
    .eq("player_id", playerId)
    .eq("equipped", true);

  if (error || !data) {
    return emptyEquipped;
  }

  const result: EquippedCosmetics = { ...emptyEquipped };

  for (const row of data as PlayerCosmeticRow[]) {
    if (!row.cosmetic_key || !row.cosmetic_type) continue;

    const type = row.cosmetic_type as CosmeticType;

    if (type in result) {
      result[type] = row.cosmetic_key;
    }
  }

  return result;
}

function useEquippedCosmetics(playerId: string) {
  const [equipped, setEquipped] = useState<EquippedCosmetics>(emptyEquipped);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!playerId) {
        setEquipped(emptyEquipped);
        return;
      }

      const result = await fetchEquippedCosmetics(playerId);

      if (alive) {
        setEquipped(result);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [playerId]);

  return equipped;
}

function getThemeBorderClass(item: CosmeticItem | null) {
  if (!item) return "border-white/10";

  if (item.theme === "sovereign-tempest") {
    return "border-amber-300/35 shadow-[0_0_45px_rgba(245,158,11,0.16)]";
  }

  if (item.theme === "abyssal-leviathan") {
    return "border-cyan-300/35 shadow-[0_0_45px_rgba(34,211,238,0.14)]";
  }

  if (item.theme === "crimson-aristocrat") {
    return "border-red-300/35 shadow-[0_0_45px_rgba(248,113,113,0.13)]";
  }

  if (item.theme === "ethereal-yggdrasil") {
    return "border-emerald-300/35 shadow-[0_0_45px_rgba(52,211,153,0.13)]";
  }

  return "border-cyan-200/35 shadow-[0_0_45px_rgba(125,211,252,0.13)]";
}

function getThemeBackgroundClass(item: CosmeticItem | null) {
  if (!item) return "";

  if (item.theme === "sovereign-tempest") {
    return "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_44%)]";
  }

  if (item.theme === "abyssal-leviathan") {
    return "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.13),transparent_44%)]";
  }

  if (item.theme === "crimson-aristocrat") {
    return "bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_44%)]";
  }

  if (item.theme === "ethereal-yggdrasil") {
    return "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.10),transparent_44%)]";
  }

  return "bg-[radial-gradient(circle_at_top_left,rgba(226,232,240,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_44%)]";
}

function getNameEffectClass(item: CosmeticItem | null) {
  if (!item) return "";

  if (item.theme === "sovereign-tempest") {
    return "bg-gradient-to-r from-amber-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]";
  }

  if (item.theme === "abyssal-leviathan") {
    return "bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.30)]";
  }

  if (item.theme === "crimson-aristocrat") {
    return "bg-gradient-to-r from-red-200 via-amber-100 to-rose-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(248,113,113,0.30)]";
  }

  if (item.theme === "ethereal-yggdrasil") {
    return "bg-gradient-to-r from-emerald-200 via-lime-100 to-amber-100 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(52,211,153,0.28)]";
  }

  return "bg-gradient-to-r from-slate-100 via-cyan-100 to-sky-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(125,211,252,0.28)]";
}

export function CosmeticNameText({
  playerId,
  children,
  className = "",
}: {
  playerId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const equipped = useEquippedCosmetics(playerId);
  const nameEffect = getCosmeticById(equipped.name_effect);

  if (!nameEffect) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={`${className} ${getNameEffectClass(nameEffect)}`}>
      {children}
    </span>
  );
}

export function EquippedCosmeticList({ playerId }: { playerId: string }) {
  const equipped = useEquippedCosmetics(playerId);

  const items = Object.values(equipped)
    .map((id) => getCosmeticById(id))
    .filter(Boolean) as CosmeticItem[];

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No cosmetic equipped.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lg">
              {item.icon}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {item.name}
              </p>
              <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {item.typeLabel}
              </p>
            </div>
          </div>

          <span className={`shrink-0 text-xs font-black ${item.accent}`}>
            {item.rarity}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CosmeticProfileRenderer({
  playerId,
  children,
  className = "",
}: CosmeticProfileRendererProps) {
  const equipped = useEquippedCosmetics(playerId);

  const border = getCosmeticById(equipped.border);
  const background = getCosmeticById(equipped.background);
  const aura = getCosmeticById(equipped.aura);
  const particle = getCosmeticById(equipped.particle);

  const fallbackVisual = particle || aura || background || border;

  return (
    <div
      className={`relative overflow-hidden rounded-[34px] border ${getThemeBorderClass(
        border
      )} ${getThemeBackgroundClass(background)} ${className}`}
    >
      {background ? (
        <CosmeticEffectRenderer theme={background.theme} variant="compact" />
      ) : null}

      {aura ? (
        <div className="absolute inset-0 opacity-70">
          <CosmeticEffectRenderer theme={aura.theme} variant="compact" />
        </div>
      ) : null}

      {particle ? (
        <div className="absolute inset-0 opacity-80">
          <CosmeticEffectRenderer theme={particle.theme} variant="compact" />
        </div>
      ) : null}

      {!background && !aura && !particle && fallbackVisual ? (
        <CosmeticEffectRenderer theme={fallbackVisual.theme} variant="compact" />
      ) : null}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
