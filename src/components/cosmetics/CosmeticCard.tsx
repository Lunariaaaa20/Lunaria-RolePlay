"use client";

import React from "react";
import type { CosmeticItem, CosmeticRarity } from "./data/cosmeticItems";

type CosmeticCardProps = {
  item: CosmeticItem;
  owned?: boolean;
  equipped?: boolean;
  working?: boolean;
  onBuy?: () => void;
  onEquip?: () => void;
  onPreview?: () => void;
};

type ThemeVisual = {
  card: string;
  accent: string;
  glow: string;
  particle: string;
  soft: string;
  text: string;
};

function formatSilverPrice(price: number) {
  const safePrice = Math.max(0, Math.floor(Number(price) || 0));
  const gold = Math.floor(safePrice / 1000);
  const silver = safePrice % 1000;

  if (gold > 0 && silver > 0) return `${gold}G ${silver}S`;
  if (gold > 0) return `${gold}G`;
  return `${silver}S`;
}

function getRarityStyle(rarity: CosmeticRarity) {
  if (rarity === "Divine Relic") {
    return {
      badge:
        "border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.23),rgba(251,191,36,0.17),rgba(239,68,68,0.12))] text-white shadow-[0_0_24px_rgba(255,255,255,0.16)]",
      price: "text-white drop-shadow-[0_0_15px_rgba(251,191,36,0.45)]",
      glow:
        "shadow-[0_0_90px_rgba(255,255,255,0.13),0_0_120px_rgba(245,158,11,0.08),0_0_140px_rgba(239,68,68,0.07)]",
      quality: "Divine Relic",
      motion: "Royal Loop",
      ring: "border-white/35",
    };
  }

  if (rarity === "Mythic") {
    return {
      badge: "border-fuchsia-300/40 bg-fuchsia-400/15 text-fuchsia-100",
      price: "text-fuchsia-200",
      glow: "shadow-[0_0_64px_rgba(217,70,239,0.18)]",
      quality: "Luxury Motion",
      motion: "High",
      ring: "border-fuchsia-300/28",
    };
  }

  if (rarity === "Legendary") {
    return {
      badge: "border-amber-300/40 bg-amber-400/15 text-amber-100",
      price: "text-amber-200",
      glow: "shadow-[0_0_60px_rgba(245,158,11,0.16)]",
      quality: "Premium Depth",
      motion: "Smooth",
      ring: "border-amber-300/26",
    };
  }

  if (rarity === "Epic") {
    return {
      badge: "border-violet-300/35 bg-violet-400/14 text-violet-100",
      price: "text-violet-200",
      glow: "shadow-[0_0_50px_rgba(168,85,247,0.13)]",
      quality: "Animated Layer",
      motion: "Smooth",
      ring: "border-violet-300/24",
    };
  }

  if (rarity === "Rare") {
    return {
      badge: "border-sky-300/35 bg-sky-400/12 text-sky-100",
      price: "text-sky-200",
      glow: "shadow-[0_0_42px_rgba(56,189,248,0.10)]",
      quality: "Soft Motion",
      motion: "Soft",
      ring: "border-sky-300/22",
    };
  }

  return {
    badge: "border-white/15 bg-white/[0.06] text-slate-200",
    price: "text-slate-100",
    glow: "shadow-[0_0_32px_rgba(148,163,184,0.08)]",
    quality: "Clean Basic",
    motion: "Clean",
    ring: "border-white/15",
  };
}

function getThemeVisual(theme: CosmeticItem["theme"]): ThemeVisual {
  if (theme === "sovereign-tempest") {
    return {
      card: "border-amber-300/30 bg-[radial-gradient(circle_at_15%_12%,rgba(245,158,11,0.28),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(56,189,248,0.19),transparent_32%),radial-gradient(circle_at_82%_84%,rgba(168,85,247,0.22),transparent_42%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,27,75,0.82),rgba(8,13,28,0.96))]",
      accent: "rgba(251,191,36,0.95)",
      glow: "rgba(251,191,36,0.34)",
      particle: "bg-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.82)]",
      soft: "from-amber-300/20 via-sky-300/10 to-violet-400/20",
      text: "text-amber-200",
    };
  }

  if (theme === "abyssal-leviathan") {
    return {
      card: "border-cyan-300/30 bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.24),transparent_32%),radial-gradient(circle_at_80%_82%,rgba(16,185,129,0.18),transparent_42%),linear-gradient(135deg,rgba(3,16,35,0.98),rgba(8,47,73,0.78),rgba(2,6,23,0.96))]",
      accent: "rgba(103,232,249,0.95)",
      glow: "rgba(34,211,238,0.34)",
      particle: "bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.82)]",
      soft: "from-cyan-300/20 via-blue-400/10 to-emerald-300/20",
      text: "text-cyan-200",
    };
  }

  if (theme === "crimson-aristocrat") {
    return {
      card: "border-red-300/30 bg-[radial-gradient(circle_at_14%_14%,rgba(185,28,28,0.30),transparent_34%),radial-gradient(circle_at_84%_84%,rgba(245,158,11,0.14),transparent_42%),linear-gradient(135deg,rgba(22,5,14,0.98),rgba(69,10,10,0.72),rgba(9,9,11,0.96))]",
      accent: "rgba(252,165,165,0.95)",
      glow: "rgba(248,113,113,0.34)",
      particle: "bg-red-300 shadow-[0_0_12px_rgba(248,113,113,0.82)]",
      soft: "from-red-400/20 via-rose-500/10 to-amber-400/14",
      text: "text-red-200",
    };
  }

  if (theme === "ethereal-yggdrasil") {
    return {
      card: "border-emerald-300/30 bg-[radial-gradient(circle_at_16%_12%,rgba(52,211,153,0.24),transparent_32%),radial-gradient(circle_at_84%_82%,rgba(250,204,21,0.14),transparent_42%),linear-gradient(135deg,rgba(4,24,19,0.98),rgba(20,83,45,0.68),rgba(2,6,23,0.94))]",
      accent: "rgba(110,231,183,0.95)",
      glow: "rgba(52,211,153,0.34)",
      particle: "bg-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.82)]",
      soft: "from-emerald-300/20 via-lime-300/10 to-yellow-200/14",
      text: "text-emerald-200",
    };
  }

  if (theme === "ivory-overlord") {
    return {
      card: "border-cyan-200/30 bg-[radial-gradient(circle_at_14%_14%,rgba(226,232,240,0.18),transparent_32%),radial-gradient(circle_at_84%_80%,rgba(34,211,238,0.22),transparent_42%),linear-gradient(135deg,rgba(8,13,24,0.98),rgba(15,23,42,0.80),rgba(2,6,23,0.96))]",
      accent: "rgba(207,250,254,0.95)",
      glow: "rgba(103,232,249,0.34)",
      particle: "bg-cyan-100 shadow-[0_0_12px_rgba(207,250,254,0.82)]",
      soft: "from-slate-100/14 via-cyan-300/12 to-blue-500/16",
      text: "text-cyan-100",
    };
  }

  if (theme === "sovereign-lunar-eclipse") {
    return {
      card: "border-white/40 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.30),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(147,197,253,0.25),transparent_34%),radial-gradient(circle_at_84%_84%,rgba(251,191,36,0.20),transparent_42%),linear-gradient(135deg,rgba(8,13,28,0.98),rgba(30,41,59,0.82),rgba(15,23,42,0.94))]",
      accent: "rgba(255,255,255,0.98)",
      glow: "rgba(255,255,255,0.38)",
      particle: "bg-white shadow-[0_0_14px_rgba(255,255,255,0.92)]",
      soft: "from-white/20 via-sky-200/12 to-amber-200/16",
      text: "text-white",
    };
  }

  if (theme === "cosmic-eclipse") {
    return {
      card: "border-red-300/35 bg-[radial-gradient(circle_at_16%_14%,rgba(185,28,28,0.34),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_82%_82%,rgba(0,0,0,0.50),transparent_44%),linear-gradient(135deg,rgba(3,3,8,0.99),rgba(39,8,12,0.86),rgba(9,9,11,0.98))]",
      accent: "rgba(248,113,113,0.98)",
      glow: "rgba(248,113,113,0.38)",
      particle: "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.86)]",
      soft: "from-red-500/20 via-black/20 to-amber-700/16",
      text: "text-red-200",
    };
  }

  return {
    card: "border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))]",
    accent: "rgba(255,255,255,0.90)",
    glow: "rgba(255,255,255,0.16)",
    particle: "bg-white shadow-[0_0_10px_rgba(255,255,255,0.50)]",
    soft: "from-white/10 via-slate-400/10 to-white/5",
    text: "text-white",
  };
}

function getDivineCardCrown(theme: CosmeticItem["theme"]) {
  if (theme === "sovereign-lunar-eclipse") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 z-[14] rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/80 shadow-[0_0_20px_rgba(255,255,255,0.12)]">
        Moonlit Sovereign
      </div>
    );
  }

  if (theme === "cosmic-eclipse") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 z-[14] rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.16)]">
        Forbidden Relic
      </div>
    );
  }

  return null;
}

function getTypeLabel(type: CosmeticItem["type"]) {
  if (type === "name_effect") return "Animated Signature";
  if (type === "border") return "Royal Frame";
  if (type === "background") return "Living Realm";
  if (type === "aura") return "Avatar Aura";
  if (type === "particle") return "Particle Field";
  return "Cosmetic";
}

export default function CosmeticCard({
  item,
  owned = false,
  equipped = false,
  working = false,
  onBuy,
  onEquip,
  onPreview,
}: CosmeticCardProps) {
  const rarity = getRarityStyle(item.rarity);
  const theme = getThemeVisual(item.theme);

  return (
    <article
      className={`premium-cosmetic-card relative overflow-hidden rounded-[32px] border p-5 transition duration-300 hover:-translate-y-1 hover:scale-[1.006] ${theme.card} ${rarity.glow}`}
      style={
        {
          "--theme-accent": theme.accent,
          "--theme-glow": theme.glow,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="premium-scanline absolute inset-0 opacity-[0.07]" />
        <div className="premium-shimmer absolute inset-0" />
        <div className="premium-vignette absolute inset-0" />
      </div>

      <PremiumTypeAura item={item} />

      <PremiumParticles item={item} theme={theme} />

      {getDivineCardCrown(item.theme)}

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div
          className={`premium-icon-orb flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] border ${rarity.ring} bg-black/35 text-3xl shadow-[inset_0_0_28px_rgba(255,255,255,0.06)]`}
        >
          {item.icon}
        </div>

        <div className="text-right">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${rarity.badge}`}
          >
            {item.rarity}
          </span>

          <p className={`mt-3 text-4xl font-black ${rarity.price}`}>
            {formatSilverPrice(item.price)}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
          {item.themeName} • {item.typeLabel}
        </p>

        <h3 className="mt-3 text-2xl font-black leading-tight text-white">
          {item.name}
        </h3>

        <p className={`mt-2 text-sm font-black ${item.accent}`}>
          {item.shortDescription}
        </p>

        <p className="mt-4 min-h-[88px] text-sm leading-6 text-slate-300">
          {item.description}
        </p>
      </div>

      <div className="relative z-10 mt-5 rounded-[26px] border border-white/10 bg-black/35 p-4 shadow-[inset_0_0_30px_rgba(255,255,255,0.025)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
            Live Visual Preview
          </p>

          <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${theme.text}`}>
            {getTypeLabel(item.type)}
          </p>
        </div>

        <TypeShowcase item={item} theme={theme} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoPill label="Quality" value={rarity.quality} />
          <InfoPill label="Motion" value={rarity.motion} />
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onPreview}
          className="rounded-2xl border border-white/10 bg-white/[0.065] px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.10]"
        >
          Preview
        </button>

        {owned ? (
          <button
            type="button"
            onClick={onEquip}
            disabled={working || equipped}
            className={`rounded-2xl border px-4 py-4 text-xs font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed ${
              equipped
                ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-200"
                : "border-sky-300/35 bg-sky-400/12 text-sky-200 hover:bg-sky-400/20"
            }`}
          >
            {equipped ? "Equipped" : working ? "Equipping..." : "Equip"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBuy}
            disabled={working}
            className="rounded-2xl border border-amber-300/35 bg-gradient-to-r from-amber-600/28 via-amber-500/16 to-violet-600/22 px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-200/55 hover:shadow-[0_0_24px_rgba(245,158,11,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working ? "Buying..." : `Buy • ${formatSilverPrice(item.price)}`}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes premium-shimmer-pass {
          0% {
            transform: translateX(-150%) skewX(-18deg);
            opacity: 0;
          }
          18% {
            opacity: 0.45;
          }
          52% {
            opacity: 0.18;
          }
          100% {
            transform: translateX(150%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes premium-orbit-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes premium-orbit-spin-reverse {
          0% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes premium-particle-float {
          0% {
            transform: translate3d(0, 22px, 0) scale(0.65);
            opacity: 0;
          }
          20% {
            opacity: var(--particle-opacity);
          }
          75% {
            opacity: var(--particle-opacity);
          }
          100% {
            transform: translate3d(var(--particle-drift), -74px, 0) scale(1.05);
            opacity: 0;
          }
        }

        @keyframes premium-icon-pulse {
          0%,
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.08));
          }
          50% {
            transform: scale(1.04);
            filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.18));
          }
        }

        @keyframes name-shine {
          0% {
            transform: translateX(-130%) skewX(-18deg);
          }
          100% {
            transform: translateX(130%) skewX(-18deg);
          }
        }

        @keyframes realm-pan {
          0%,
          100% {
            transform: translateX(0) scale(1);
          }
          50% {
            transform: translateX(10px) scale(1.04);
          }
        }

        @keyframes aura-breathe {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.35;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.12);
            opacity: 0.75;
          }
        }

        @keyframes border-trace {
          0% {
            opacity: 0.25;
            transform: rotate(0deg);
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.25;
            transform: rotate(360deg);
          }
        }

        .premium-cosmetic-card {
          isolation: isolate;
        }

        .premium-scanline {
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.18) 0px,
            rgba(255, 255, 255, 0.18) 1px,
            transparent 1px,
            transparent 7px
          );
        }

        .premium-shimmer {
          width: 48%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.16),
            rgba(251, 191, 36, 0.10),
            transparent
          );
          animation: premium-shimmer-pass 7s ease-in-out infinite;
        }

        .premium-vignette {
          background:
            radial-gradient(circle at center, transparent 38%, rgba(0, 0, 0, 0.26) 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.045), transparent 38%, rgba(0, 0, 0, 0.20));
        }

        .premium-orbit {
          animation: premium-orbit-spin 18s linear infinite;
        }

        .premium-orbit-reverse {
          animation: premium-orbit-spin-reverse 24s linear infinite;
        }

        .premium-icon-orb {
          animation: premium-icon-pulse 4.8s ease-in-out infinite;
        }

        .premium-particle {
          animation-name: premium-particle-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .type-showcase {
          min-height: 132px;
        }

        .showcase-name-text {
          background: linear-gradient(110deg, #ffffff, var(--theme-accent), #ffffff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 14px var(--theme-glow));
        }

        .showcase-name-shine {
          animation: name-shine 3.4s ease-in-out infinite;
        }

        .showcase-border-spin {
          animation: border-trace 7s linear infinite;
        }

        .showcase-realm {
          animation: realm-pan 8s ease-in-out infinite;
        }

        .showcase-aura-core {
          animation: aura-breathe 4.2s ease-in-out infinite;
        }
      `}</style>
    </article>
  );
}

function PremiumTypeAura({ item }: { item: CosmeticItem }) {
  if (item.type === "name_effect") {
    return (
      <div className="pointer-events-none absolute inset-x-8 top-[170px] z-[3] h-20 rounded-full bg-[radial-gradient(circle,var(--theme-glow),transparent_70%)] opacity-30 blur-2xl" />
    );
  }

  if (item.type === "border") {
    return (
      <>
        <div className="premium-orbit pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[34px] border border-white/12 opacity-55" />
        <div className="premium-orbit-reverse pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-white/10 opacity-35" />
      </>
    );
  }

  if (item.type === "background") {
    return (
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_70%_24%,var(--theme-glow),transparent_24%),radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.10),transparent_28%)] opacity-60" />
    );
  }

  if (item.type === "aura") {
    return (
      <>
        <div className="showcase-aura-core pointer-events-none absolute left-1/2 top-[45%] z-[3] h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--theme-glow),transparent_66%)] blur-xl" />
        <div className="premium-orbit pointer-events-none absolute left-1/2 top-[45%] z-[3] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 opacity-60" />
      </>
    );
  }

  if (item.type === "particle") {
    return (
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,var(--theme-glow),transparent_58%)] opacity-40" />
    );
  }

  return null;
}

function TypeShowcase({
  item,
  theme,
}: {
  item: CosmeticItem;
  theme: ThemeVisual;
}) {
  if (item.type === "name_effect") {
    return (
      <div className="type-showcase relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/45 p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--theme-glow),transparent_62%)] opacity-35" />
        <div className="relative z-10 flex min-h-[112px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.045] text-center">
          <div className="relative overflow-hidden px-5 py-3">
            <div className="showcase-name-shine pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)]" />
            <p className="showcase-name-text text-2xl font-black">
              {item.previewLabel}
            </p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {item.visualQuality}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "border") {
    return (
      <div className="type-showcase relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/45 p-4">
        <div className="showcase-border-spin absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/20 shadow-[0_0_30px_var(--theme-glow)]" />
        <div className="relative z-10 flex min-h-[112px] items-center justify-center rounded-[18px] border border-white/20 bg-white/[0.035] text-center">
          <div>
            <p className={`text-3xl font-black ${item.accent}`}>{item.icon}</p>
            <p className="mt-2 text-sm font-black text-white">
              {item.previewLabel}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Animated Frame Trace
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "background") {
    return (
      <div className="type-showcase relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/45 p-4">
        <div
          className={`showcase-realm absolute inset-0 bg-gradient-to-br ${theme.soft} opacity-80`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(to_top,rgba(255,255,255,0.12),transparent)]" />
        <div className="absolute right-8 top-8 h-16 w-16 rounded-full bg-white/30 blur-[1px] shadow-[0_0_45px_var(--theme-glow)]" />
        <div className="relative z-10 flex min-h-[112px] items-end justify-center rounded-[18px] border border-white/10 bg-black/10 p-4 text-center">
          <div>
            <p className="text-sm font-black text-white">{item.previewLabel}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
              Layered Background Realm
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "aura") {
    return (
      <div className="type-showcase relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/45 p-4">
        <div className="showcase-aura-core absolute left-1/2 top-1/2 h-36 w-36 rounded-full bg-[radial-gradient(circle,var(--theme-glow),transparent_70%)] blur-lg" />
        <div className="premium-orbit absolute left-1/2 top-1/2 h-32 w-32 rounded-full border border-white/20" />
        <div className="premium-orbit-reverse absolute left-1/2 top-1/2 h-44 w-44 rounded-full border border-white/10" />
        <div className="relative z-10 flex min-h-[112px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.035] text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/35 text-3xl shadow-[0_0_28px_var(--theme-glow)]">
            {item.icon}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="type-showcase relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/45 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--theme-glow),transparent_60%)] opacity-30" />
      <div className="relative z-10 flex min-h-[112px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.035] text-center">
        <div>
          <div className="mx-auto grid h-20 w-28 grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={`particle-preview-${index}`}
                className={`h-2 w-2 rounded-full ${theme.particle}`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm font-black text-white">{item.previewLabel}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Particle Field System
          </p>
        </div>
      </div>
    </div>
  );
}

function PremiumParticles({
  item,
  theme,
}: {
  item: CosmeticItem;
  theme: ThemeVisual;
}) {
  const count = item.type === "particle" ? 34 : item.type === "aura" ? 22 : 14;

  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={`premium-particle-${index}`}
          className={`premium-particle absolute rounded-full ${theme.particle} ${
            item.type === "particle" ? "h-2 w-2" : "h-1.5 w-1.5"
          }`}
          style={
            {
              left: `${4 + ((index * 13) % 92)}%`,
              top: `${14 + ((index * 19) % 78)}%`,
              animationDelay: `${(index % 12) * 0.35}s`,
              animationDuration: `${4.5 + (index % 7) * 0.5}s`,
              "--particle-opacity": `${0.18 + (index % 5) * 0.08}`,
              "--particle-drift": `${index % 2 === 0 ? 18 : -18}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-slate-200">{value}</p>
    </div>
  );
}
