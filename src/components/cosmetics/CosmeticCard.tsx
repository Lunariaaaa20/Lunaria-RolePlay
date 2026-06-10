"use client";

import React from "react";
import type { CosmeticItem, CosmeticRarity } from "./data/cosmeticItems";
import CosmeticEffectRenderer from "./CosmeticEffectRenderer";

type CosmeticCardProps = {
  item: CosmeticItem;
  owned?: boolean;
  equipped?: boolean;
  working?: boolean;
  onBuy?: () => void;
  onEquip?: () => void;
  onPreview?: () => void;
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
        "border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(251,191,36,0.18),rgba(239,68,68,0.13))] text-white shadow-[0_0_26px_rgba(255,255,255,0.18)]",
      price:
        "text-white drop-shadow-[0_0_16px_rgba(251,191,36,0.48)]",
      glow:
        "shadow-[0_0_90px_rgba(255,255,255,0.14),0_0_120px_rgba(245,158,11,0.10),0_0_140px_rgba(239,68,68,0.08)]",
      quality: "Divine Relic",
      motion: "Royal Loop",
      ring: "border-white/35",
    };
  }

  if (rarity === "Mythic") {
    return {
      badge: "border-fuchsia-300/40 bg-fuchsia-400/15 text-fuchsia-100",
      price: "text-fuchsia-200",
      glow: "shadow-[0_0_65px_rgba(217,70,239,0.18)]",
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
      glow: "shadow-[0_0_42px_rgba(56,189,248,0.11)]",
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

function getThemeCardClass(theme: CosmeticItem["theme"]) {
  if (theme === "sovereign-tempest") {
    return "border-amber-300/30 bg-[radial-gradient(circle_at_12%_14%,rgba(245,158,11,0.28),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_84%,rgba(168,85,247,0.22),transparent_42%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,27,75,0.82),rgba(8,13,28,0.96))]";
  }

  if (theme === "abyssal-leviathan") {
    return "border-cyan-300/30 bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.24),transparent_32%),radial-gradient(circle_at_80%_82%,rgba(16,185,129,0.18),transparent_42%),linear-gradient(135deg,rgba(3,16,35,0.98),rgba(8,47,73,0.78),rgba(2,6,23,0.96))]";
  }

  if (theme === "crimson-aristocrat") {
    return "border-red-300/30 bg-[radial-gradient(circle_at_14%_14%,rgba(185,28,28,0.30),transparent_34%),radial-gradient(circle_at_84%_84%,rgba(245,158,11,0.14),transparent_42%),linear-gradient(135deg,rgba(22,5,14,0.98),rgba(69,10,10,0.72),rgba(9,9,11,0.96))]";
  }

  if (theme === "ethereal-yggdrasil") {
    return "border-emerald-300/30 bg-[radial-gradient(circle_at_16%_12%,rgba(52,211,153,0.24),transparent_32%),radial-gradient(circle_at_84%_82%,rgba(250,204,21,0.14),transparent_42%),linear-gradient(135deg,rgba(4,24,19,0.98),rgba(20,83,45,0.68),rgba(2,6,23,0.94))]";
  }

  if (theme === "ivory-overlord") {
    return "border-cyan-200/30 bg-[radial-gradient(circle_at_14%_14%,rgba(226,232,240,0.18),transparent_32%),radial-gradient(circle_at_84%_80%,rgba(34,211,238,0.22),transparent_42%),linear-gradient(135deg,rgba(8,13,24,0.98),rgba(15,23,42,0.80),rgba(2,6,23,0.96))]";
  }

  if (theme === "sovereign-lunar-eclipse") {
    return "border-white/40 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.30),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(147,197,253,0.25),transparent_34%),radial-gradient(circle_at_84%_84%,rgba(251,191,36,0.20),transparent_42%),linear-gradient(135deg,rgba(8,13,28,0.98),rgba(30,41,59,0.82),rgba(15,23,42,0.94))]";
  }

  if (theme === "cosmic-eclipse") {
    return "border-red-300/35 bg-[radial-gradient(circle_at_16%_14%,rgba(185,28,28,0.34),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_82%_82%,rgba(0,0,0,0.50),transparent_44%),linear-gradient(135deg,rgba(3,3,8,0.99),rgba(39,8,12,0.86),rgba(9,9,11,0.98))]";
  }

  return "border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))]";
}

function getThemeParticleClass(theme: CosmeticItem["theme"]) {
  if (theme === "sovereign-tempest") return "bg-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.8)]";
  if (theme === "abyssal-leviathan") return "bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.8)]";
  if (theme === "crimson-aristocrat") return "bg-red-300 shadow-[0_0_12px_rgba(248,113,113,0.8)]";
  if (theme === "ethereal-yggdrasil") return "bg-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.8)]";
  if (theme === "ivory-overlord") return "bg-cyan-100 shadow-[0_0_12px_rgba(207,250,254,0.8)]";
  if (theme === "sovereign-lunar-eclipse") return "bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]";
  if (theme === "cosmic-eclipse") return "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.85)]";
  return "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]";
}

function getDivineCardCrown(theme: CosmeticItem["theme"]) {
  if (theme === "sovereign-lunar-eclipse") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 z-[12] rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/80 shadow-[0_0_20px_rgba(255,255,255,0.12)]">
        Moonlit Sovereign
      </div>
    );
  }

  if (theme === "cosmic-eclipse") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 z-[12] rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.16)]">
        Forbidden Relic
      </div>
    );
  }

  return null;
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

  return (
    <article
      className={`premium-cosmetic-card relative overflow-hidden rounded-[32px] border p-5 transition duration-300 hover:-translate-y-1 hover:scale-[1.006] ${getThemeCardClass(
        item.theme
      )} ${rarity.glow}`}
    >
      <CosmeticEffectRenderer
        theme={item.theme}
        type={item.type}
        variant="card"
      />

      <div className="pointer-events-none absolute inset-0 z-[2]">
        <div className="premium-scanline absolute inset-0 opacity-[0.08]" />
        <div className="premium-shimmer absolute inset-0" />
        <div className="premium-vignette absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-50 premium-orbit" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-35 premium-orbit-reverse" />

      <PremiumParticles theme={item.theme} />

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
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
          Live Visual Preview
        </p>

        <div className="relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/45 p-4">
          <CosmeticEffectRenderer
            theme={item.theme}
            type={item.type}
            variant="compact"
          />

          <div className="relative z-10 flex min-h-[104px] items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.045] text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_55%)]" />

            <div className="relative z-10">
              <p className={`text-3xl font-black ${item.accent}`}>
                {item.icon}
              </p>

              <p className="mt-2 text-sm font-black text-white">
                {item.previewLabel}
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {item.visualQuality}
              </p>
            </div>
          </div>
        </div>

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
            transform: translateX(-140%) skewX(-18deg);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          55% {
            opacity: 0.18;
          }
          100% {
            transform: translateX(140%) skewX(-18deg);
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
            transform: translate3d(0, 18px, 0) scale(0.65);
            opacity: 0;
          }
          20% {
            opacity: var(--particle-opacity);
          }
          75% {
            opacity: var(--particle-opacity);
          }
          100% {
            transform: translate3d(var(--particle-drift), -72px, 0) scale(1.05);
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
          animation: premium-shimmer-pass 6.5s ease-in-out infinite;
        }

        .premium-vignette {
          background:
            radial-gradient(circle at center, transparent 38%, rgba(0, 0, 0, 0.22) 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.045), transparent 38%, rgba(0, 0, 0, 0.18));
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
      `}</style>
    </article>
  );
}

function PremiumParticles({ theme }: { theme: CosmeticItem["theme"] }) {
  const particleClass = getThemeParticleClass(theme);

  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={`premium-particle-${index}`}
          className={`premium-particle absolute h-1.5 w-1.5 rounded-full ${particleClass}`}
          style={
            {
              left: `${4 + ((index * 13) % 92)}%`,
              top: `${14 + ((index * 19) % 78)}%`,
              animationDelay: `${(index % 12) * 0.35}s`,
              animationDuration: `${4.5 + (index % 7) * 0.5}s`,
              "--particle-opacity": `${0.2 + (index % 5) * 0.08}`,
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
