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

async function fetchEquippedCosmetics(
  playerId: string
): Promise<EquippedCosmetics> {
  const { data, error } = await supabase
    .from("player_cosmetics")
    .select("cosmetic_key, cosmetic_type, equipped")
    .eq("player_id", playerId)
    .eq("equipped", true);

  if (error || !data) {
    return { ...emptyEquipped };
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
  const [equipped, setEquipped] = useState<EquippedCosmetics>({
    ...emptyEquipped,
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!playerId) {
        setEquipped({ ...emptyEquipped });
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

function getThemeProfileStyle(item: CosmeticItem | null) {
  const theme = item ? String(item.theme) : "";

  if (theme === "obsidian-monarch") {
    return {
      border:
        "border-amber-300/45 shadow-[0_0_70px_rgba(245,158,11,0.24),inset_0_0_44px_rgba(245,158,11,0.055)]",
      background:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_88%_78%,rgba(120,113,108,0.22),transparent_42%),linear-gradient(135deg,rgba(7,7,9,0.84),rgba(28,25,23,0.58),rgba(3,7,18,0.84))]",
      name:
        "text-amber-100 drop-shadow-[0_0_16px_rgba(245,158,11,0.62)]",
      aura:
        "border-amber-200/45 bg-amber-400/10 shadow-[0_0_42px_rgba(245,158,11,0.32)]",
      list:
        "border-amber-200/20 bg-amber-400/[0.055] shadow-[inset_0_0_26px_rgba(245,158,11,0.04)]",
      symbol: "♛",
      accent: "text-amber-200",
      font: "Cinzel, Georgia, serif",
    };
  }

  if (theme === "blood-cathedral") {
    return {
      border:
        "border-red-300/45 shadow-[0_0_70px_rgba(220,38,38,0.26),inset_0_0_44px_rgba(220,38,38,0.055)]",
      background:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(220,38,38,0.20),transparent_32%),radial-gradient(circle_at_88%_78%,rgba(251,191,36,0.10),transparent_42%),linear-gradient(135deg,rgba(18,4,10,0.86),rgba(69,10,10,0.58),rgba(3,7,18,0.84))]",
      name:
        "text-red-100 drop-shadow-[0_0_16px_rgba(248,113,113,0.62)]",
      aura:
        "border-red-200/45 bg-red-400/10 shadow-[0_0_42px_rgba(220,38,38,0.34)]",
      list:
        "border-red-200/20 bg-red-400/[0.055] shadow-[inset_0_0_26px_rgba(220,38,38,0.04)]",
      symbol: "◆",
      accent: "text-red-200",
      font: "Cormorant Garamond, Georgia, serif",
    };
  }

  if (theme === "abyss-sovereign") {
    return {
      border:
        "border-cyan-300/45 shadow-[0_0_70px_rgba(34,211,238,0.25),inset_0_0_44px_rgba(34,211,238,0.055)]",
      background:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_88%_78%,rgba(16,185,129,0.13),transparent_42%),linear-gradient(135deg,rgba(2,12,27,0.86),rgba(8,47,73,0.58),rgba(3,7,18,0.84))]",
      name:
        "text-cyan-100 drop-shadow-[0_0_16px_rgba(34,211,238,0.62)]",
      aura:
        "border-cyan-200/45 bg-cyan-400/10 shadow-[0_0_42px_rgba(34,211,238,0.34)]",
      list:
        "border-cyan-200/20 bg-cyan-400/[0.055] shadow-[inset_0_0_26px_rgba(34,211,238,0.04)]",
      symbol: "◇",
      accent: "text-cyan-200",
      font: "Sora, Inter, sans-serif",
    };
  }

  if (theme === "thorn-empress") {
    return {
      border:
        "border-emerald-300/45 shadow-[0_0_70px_rgba(52,211,153,0.24),inset_0_0_44px_rgba(52,211,153,0.055)]",
      background:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_88%_78%,rgba(250,204,21,0.10),transparent_42%),linear-gradient(135deg,rgba(3,22,17,0.86),rgba(20,83,45,0.52),rgba(5,18,12,0.84))]",
      name:
        "text-emerald-100 drop-shadow-[0_0_16px_rgba(52,211,153,0.58)]",
      aura:
        "border-emerald-200/45 bg-emerald-400/10 shadow-[0_0_42px_rgba(52,211,153,0.32)]",
      list:
        "border-emerald-200/20 bg-emerald-400/[0.055] shadow-[inset_0_0_26px_rgba(52,211,153,0.04)]",
      symbol: "✧",
      accent: "text-emerald-200",
      font: "Marcellus, Georgia, serif",
    };
  }

  if (theme === "soulfire-tyrant") {
    return {
      border:
        "border-cyan-100/45 shadow-[0_0_70px_rgba(125,211,252,0.25),inset_0_0_44px_rgba(125,211,252,0.055)]",
      background:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(207,250,254,0.14),transparent_32%),radial-gradient(circle_at_88%_78%,rgba(34,211,238,0.16),transparent_42%),linear-gradient(135deg,rgba(5,9,18,0.88),rgba(15,23,42,0.62),rgba(0,0,0,0.86))]",
      name:
        "text-cyan-50 drop-shadow-[0_0_18px_rgba(125,211,252,0.68)]",
      aura:
        "border-cyan-100/45 bg-cyan-300/10 shadow-[0_0_42px_rgba(125,211,252,0.34)]",
      list:
        "border-cyan-100/20 bg-cyan-300/[0.055] shadow-[inset_0_0_26px_rgba(125,211,252,0.04)]",
      symbol: "☽",
      accent: "text-cyan-100",
      font: "Cinzel Decorative, Cinzel, Georgia, serif",
    };
  }

  return {
    border:
      "border-white/12 shadow-[0_0_42px_rgba(148,163,184,0.11),inset_0_0_30px_rgba(255,255,255,0.03)]",
    background:
      "bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.78),rgba(2,6,23,0.84))]",
    name: "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.28)]",
    aura:
      "border-white/25 bg-white/[0.06] shadow-[0_0_30px_rgba(255,255,255,0.12)]",
    list:
      "border-white/10 bg-white/[0.045] shadow-[inset_0_0_20px_rgba(255,255,255,0.025)]",
    symbol: "✦",
    accent: "text-white",
    font: "Outfit, Inter, sans-serif",
  };
}

function getMainVisualItem(equipped: EquippedCosmetics) {
  return (
    getCosmeticById(equipped.background) ||
    getCosmeticById(equipped.border) ||
    getCosmeticById(equipped.aura) ||
    getCosmeticById(equipped.particle) ||
    getCosmeticById(equipped.name_effect) ||
    null
  );
}

function getCosmeticItems(equipped: EquippedCosmetics) {
  return Object.values(equipped)
    .map((id) => getCosmeticById(id))
    .filter(Boolean) as CosmeticItem[];
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
  const style = getThemeProfileStyle(nameEffect);

  if (!nameEffect) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={`relative inline-flex min-h-[1em] items-center justify-center overflow-hidden ${className}`}
      style={{ fontFamily: style.font }}
    >
      <span className={`relative z-10 inline-block ${style.name}`}>
        {children}
      </span>

      <span className="cosmetic-name-glint pointer-events-none absolute inset-y-0 left-0 z-20 w-2/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      <style jsx>{`
        @keyframes cosmetic-name-glint {
          0% {
            transform: translateX(-165%) skewX(-18deg);
            opacity: 0;
          }
          32% {
            opacity: 0.42;
          }
          100% {
            transform: translateX(165%) skewX(-18deg);
            opacity: 0;
          }
        }

        .cosmetic-name-glint {
          animation: cosmetic-name-glint 3.8s ease-in-out infinite;
        }
      `}</style>
    </span>
  );
}

export function EquippedCosmeticList({ playerId }: { playerId: string }) {
  const equipped = useEquippedCosmetics(playerId);
  const items = getCosmeticItems(equipped);
  const mainItem = getMainVisualItem(equipped);
  const style = getThemeProfileStyle(mainItem);

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No cosmetic equipped.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => {
        const itemStyle = getThemeProfileStyle(item);

        return (
          <div
            key={item.id}
            className={`relative overflow-hidden rounded-2xl border p-4 ${itemStyle.list}`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.055),transparent)]" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-black/30 text-lg ${itemStyle.border}`}
                >
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-black text-white"
                    style={{ fontFamily: itemStyle.font }}
                  >
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
          </div>
        );
      })}

      <div
        className={`relative overflow-hidden rounded-2xl border px-4 py-3 text-center ${style.list}`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          Active Visual Set
        </p>
        <p
          className={`mt-1 text-sm font-black ${style.accent}`}
          style={{ fontFamily: style.font }}
        >
          {mainItem ? mainItem.theme.split("-").join(" ") : "Default Lunaria"}
        </p>
      </div>
    </div>
  );
}

function ProfileAuraLayer({ item }: { item: CosmeticItem | null }) {
  const style = getThemeProfileStyle(item);

  if (!item) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      <div
        className={`cosmetic-profile-aura absolute left-1/2 top-[150px] h-44 w-44 -translate-x-1/2 rounded-full border ${style.aura}`}
      />
      <div
        className={`cosmetic-profile-aura cosmetic-profile-aura-two absolute left-1/2 top-[166px] h-32 w-32 -translate-x-1/2 rounded-full border ${style.aura}`}
      />
      <div
        className={`absolute left-1/2 top-[192px] -translate-x-1/2 text-6xl opacity-[0.08] ${style.accent}`}
        style={{ fontFamily: style.font }}
      >
        {style.symbol}
      </div>
    </div>
  );
}

function ProfileParticleLayer({ item }: { item: CosmeticItem | null }) {
  const style = getThemeProfileStyle(item);

  if (!item) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {Array.from({ length: 30 }).map((_, index) => (
        <span
          key={`profile-particle-${index}`}
          className={`cosmetic-profile-particle absolute rounded-full ${style.accent}`}
          style={{
            left: `${4 + ((index * 13) % 92)}%`,
            top: `${14 + ((index * 19) % 78)}%`,
            width: `${index % 4 === 0 ? 7 : index % 3 === 0 ? 5 : 3}px`,
            height: `${index % 4 === 0 ? 7 : index % 3 === 0 ? 5 : 3}px`,
            backgroundColor: "currentColor",
            animationDelay: `${index * 0.18}s`,
            animationDuration: `${4.4 + (index % 7) * 0.34}s`,
            opacity: 0.34,
          }}
        />
      ))}
    </div>
  );
}

function BorderCrownLayer({ item }: { item: CosmeticItem | null }) {
  const style = getThemeProfileStyle(item);

  if (!item) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-[34px]">
      <div className={`absolute inset-0 rounded-[34px] border ${style.border}`} />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent" />

      <div
        className={`absolute right-5 top-5 text-4xl opacity-25 ${style.accent}`}
        style={{ fontFamily: style.font }}
      >
        {style.symbol}
      </div>
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
  const mainVisual = getMainVisualItem(equipped);
  const mainStyle = getThemeProfileStyle(background || border || mainVisual);

  return (
    <div
      className={`relative overflow-hidden rounded-[34px] border ${mainStyle.border} ${mainStyle.background} ${className}`}
    >
      {background ? (
        <div className="absolute inset-0 z-[1] opacity-85">
          <CosmeticEffectRenderer theme={background.theme} variant="preview" />
        </div>
      ) : null}

      {border ? <BorderCrownLayer item={border} /> : null}

      {aura ? <ProfileAuraLayer item={aura} /> : null}

      {particle ? (
        <>
          <div className="absolute inset-0 z-[2] opacity-70">
            <CosmeticEffectRenderer theme={particle.theme} variant="preview" />
          </div>
          <ProfileParticleLayer item={particle} />
        </>
      ) : null}

      {!background && !particle && mainVisual ? (
        <div className="absolute inset-0 z-[1] opacity-55">
          <CosmeticEffectRenderer theme={mainVisual.theme} variant="compact" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-[6] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_30%,rgba(0,0,0,0.18))]" />
      <div className="pointer-events-none absolute inset-0 z-[6] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_62%)]" />

      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes cosmetic-profile-aura {
          0%,
          100% {
            transform: translateX(-50%) scale(0.86);
            opacity: 0.24;
          }
          50% {
            transform: translateX(-50%) scale(1.12);
            opacity: 0.72;
          }
        }

        @keyframes cosmetic-profile-particle {
          0% {
            transform: translateY(34px) translateX(0) scale(0.74);
            opacity: 0;
          }
          22% {
            opacity: 0.46;
          }
          72% {
            opacity: 0.46;
          }
          100% {
            transform: translateY(-120px) translateX(var(--particle-drift))
              scale(1);
            opacity: 0;
          }
        }

        .cosmetic-profile-aura {
          animation: cosmetic-profile-aura 4.2s ease-in-out infinite;
        }

        .cosmetic-profile-aura-two {
          animation-delay: 1.35s;
        }

        .cosmetic-profile-particle {
          animation-name: cosmetic-profile-particle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          --particle-drift: 22px;
        }

        .cosmetic-profile-particle:nth-child(even) {
          --particle-drift: -22px;
        }
      `}</style>
    </div>
  );
}
