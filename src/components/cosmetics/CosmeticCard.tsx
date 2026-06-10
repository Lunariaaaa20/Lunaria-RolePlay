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

function formatSilverPrice(price: number) {
  const safePrice = Math.max(0, Math.floor(Number(price) || 0));
  const gold = Math.floor(safePrice / 1000);
  const silver = safePrice % 1000;

  if (gold > 0 && silver > 0) return `${gold}G ${silver}S`;
  if (gold > 0) return `${gold}G`;
  return `${silver}S`;
}

function getRarityStyle(rarity: CosmeticRarity) {
  const key = String(rarity);

  if (key === "Forbidden Relic") {
    return {
      badge: "border-red-100/60 bg-red-500/20 text-red-50 shadow-[0_0_24px_rgba(248,113,113,0.18)]",
      price: "text-red-50 drop-shadow-[0_0_18px_rgba(248,113,113,0.65)]",
      glow: "shadow-[0_0_90px_rgba(239,68,68,0.22)]",
      quality: "Forbidden Relic",
      motion: "Forbidden",
      crown: "border-red-200/45 bg-red-400/10",
    };
  }

  if (key === "Divine Relic") {
    return {
      badge: "border-white/50 bg-white/[0.12] text-white shadow-[0_0_24px_rgba(255,255,255,0.14)]",
      price: "text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.55)]",
      glow: "shadow-[0_0_82px_rgba(255,255,255,0.15)]",
      quality: "Divine Relic",
      motion: "Royal Loop",
      crown: "border-white/45 bg-white/[0.08]",
    };
  }

  if (key === "Mythic") {
    return {
      badge: "border-fuchsia-300/45 bg-fuchsia-400/18 text-fuchsia-100",
      price: "text-fuchsia-100 drop-shadow-[0_0_14px_rgba(217,70,239,0.35)]",
      glow: "shadow-[0_0_62px_rgba(217,70,239,0.17)]",
      quality: "Luxury Motion",
      motion: "High",
      crown: "border-fuchsia-300/35 bg-fuchsia-400/10",
    };
  }

  if (key === "Legendary") {
    return {
      badge: "border-amber-300/45 bg-amber-400/16 text-amber-100",
      price: "text-amber-100 drop-shadow-[0_0_12px_rgba(245,158,11,0.30)]",
      glow: "shadow-[0_0_55px_rgba(245,158,11,0.15)]",
      quality: "Premium Depth",
      motion: "Smooth",
      crown: "border-amber-300/35 bg-amber-400/10",
    };
  }

  if (key === "Epic") {
    return {
      badge: "border-violet-300/35 bg-violet-400/14 text-violet-100",
      price: "text-violet-100",
      glow: "shadow-[0_0_45px_rgba(168,85,247,0.12)]",
      quality: "Animated Layer",
      motion: "Smooth",
      crown: "border-violet-300/30 bg-violet-400/10",
    };
  }

  if (key === "Rare") {
    return {
      badge: "border-sky-300/35 bg-sky-400/12 text-sky-100",
      price: "text-sky-100",
      glow: "shadow-[0_0_38px_rgba(56,189,248,0.09)]",
      quality: "Soft Motion",
      motion: "Soft",
      crown: "border-sky-300/30 bg-sky-400/10",
    };
  }

  return {
    badge: "border-white/15 bg-white/[0.06] text-slate-200",
    price: "text-slate-100",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.07)]",
    quality: "Clean Basic",
    motion: "Clean",
    crown: "border-white/10 bg-white/[0.04]",
  };
}

function getThemeStyle(themeInput: CosmeticItem["theme"]) {
  const theme = String(themeInput);

  if (theme === "obsidian-monarch") {
    return {
      card: "border-amber-300/30 bg-[radial-gradient(circle_at_16%_12%,rgba(245,158,11,0.24),transparent_26%),radial-gradient(circle_at_88%_72%,rgba(120,113,108,0.30),transparent_34%),linear-gradient(135deg,rgba(7,7,9,0.99),rgba(28,25,23,0.88),rgba(12,10,9,0.98))]",
      particle: "bg-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.88)]",
      spark: "from-amber-200/0 via-amber-200/55 to-amber-200/0",
      ring: "border-amber-200/25",
      font: "Cinzel, Georgia, serif",
      label: "Cursed Royalty",
      ornament: "♛",
      mini: "text-amber-200",
    };
  }

  if (theme === "blood-cathedral") {
    return {
      card: "border-red-300/30 bg-[radial-gradient(circle_at_14%_12%,rgba(220,38,38,0.26),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(251,191,36,0.10),transparent_34%),linear-gradient(135deg,rgba(18,4,10,0.99),rgba(69,10,10,0.74),rgba(3,7,18,0.97))]",
      particle: "bg-red-300 shadow-[0_0_12px_rgba(248,113,113,0.88)]",
      spark: "from-red-200/0 via-red-200/55 to-red-200/0",
      ring: "border-red-200/25",
      font: "Cormorant Garamond, Georgia, serif",
      label: "Gothic Noble",
      ornament: "◆",
      mini: "text-red-200",
    };
  }

  if (theme === "abyss-sovereign") {
    return {
      card: "border-cyan-300/30 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.22),transparent_27%),radial-gradient(circle_at_84%_78%,rgba(16,185,129,0.16),transparent_36%),linear-gradient(135deg,rgba(2,12,27,0.99),rgba(8,47,73,0.78),rgba(3,7,18,0.98))]",
      particle: "bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.88)]",
      spark: "from-cyan-200/0 via-cyan-200/55 to-cyan-200/0",
      ring: "border-cyan-200/25",
      font: "Sora, Inter, sans-serif",
      label: "Deep Sea Majesty",
      ornament: "◇",
      mini: "text-cyan-200",
    };
  }

  if (theme === "thorn-empress") {
    return {
      card: "border-emerald-300/30 bg-[radial-gradient(circle_at_18%_14%,rgba(52,211,153,0.22),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(250,204,21,0.12),transparent_36%),linear-gradient(135deg,rgba(3,22,17,0.99),rgba(20,83,45,0.68),rgba(5,18,12,0.98))]",
      particle: "bg-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.88)]",
      spark: "from-emerald-200/0 via-emerald-200/55 to-emerald-200/0",
      ring: "border-emerald-200/25",
      font: "Marcellus, Georgia, serif",
      label: "Dark Fairywood",
      ornament: "✧",
      mini: "text-emerald-200",
    };
  }

  if (theme === "soulfire-tyrant") {
    return {
      card: "border-cyan-100/30 bg-[radial-gradient(circle_at_16%_14%,rgba(226,232,240,0.16),transparent_27%),radial-gradient(circle_at_82%_76%,rgba(34,211,238,0.22),transparent_38%),linear-gradient(135deg,rgba(5,9,18,0.99),rgba(15,23,42,0.78),rgba(0,0,0,0.98))]",
      particle: "bg-cyan-100 shadow-[0_0_12px_rgba(207,250,254,0.88)]",
      spark: "from-cyan-100/0 via-cyan-100/60 to-cyan-100/0",
      ring: "border-cyan-100/25",
      font: "Cinzel Decorative, Cinzel, Georgia, serif",
      label: "Soul Dominion",
      ornament: "☽",
      mini: "text-cyan-100",
    };
  }

  return {
    card: "border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.90))]",
    particle: "bg-white shadow-[0_0_10px_rgba(255,255,255,0.55)]",
    spark: "from-white/0 via-white/50 to-white/0",
    ring: "border-white/15",
    font: "Inter, sans-serif",
    label: "Cosmetic",
    ornament: "✦",
    mini: "text-white",
  };
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
  const theme = getThemeStyle(item.theme);

  return (
    <article
      className={`group relative overflow-hidden rounded-[34px] border p-5 transition duration-300 hover:-translate-y-1 hover:scale-[1.006] ${theme.card} ${rarity.glow}`}
    >
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_56%)]" />
        <div className="cosmetic-sweep absolute inset-0" />
        <div className="cosmetic-sweep cosmetic-sweep-two absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_32%,rgba(0,0,0,0.26))]" />
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 z-[2] h-40 w-40 rounded-full border border-white/10 bg-white/[0.035] blur-[1px]" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 z-[2] h-44 w-44 rounded-full border border-white/10 bg-black/20" />

      <FloatingParticles particleClass={theme.particle} />

      <div className="pointer-events-none absolute right-5 top-20 z-[3] opacity-20">
        <div
          className={`text-7xl font-black ${theme.mini}`}
          style={{ fontFamily: theme.font }}
        >
          {theme.ornament}
        </div>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div
          className={`relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[26px] border bg-black/35 text-4xl shadow-[inset_0_0_26px_rgba(255,255,255,0.055)] ${rarity.crown}`}
        >
          <div className={`absolute inset-[-6px] rounded-[30px] border ${theme.ring} cosmetic-orbit`} />
          <span className="relative z-10 drop-shadow-[0_0_18px_rgba(255,255,255,0.22)]">
            {item.icon}
          </span>
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
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
          {theme.label} • {item.typeLabel}
        </p>

        <h3
          className="mt-3 text-[27px] font-black leading-tight text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.10)]"
          style={{ fontFamily: theme.font }}
        >
          {item.name}
        </h3>

        <p className={`mt-2 text-sm font-extrabold ${item.accent}`}>
          {item.shortDescription}
        </p>

        <p className="mt-4 min-h-[88px] text-sm leading-6 text-slate-300">
          {item.description}
        </p>
      </div>

      <div className="relative z-10 mt-5 rounded-[28px] border border-white/10 bg-black/36 p-4 shadow-[inset_0_0_30px_rgba(255,255,255,0.035)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
            Live Visual Preview
          </p>
          <span className={`text-lg ${theme.mini}`}>{theme.ornament}</span>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/45 p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.11),transparent_60%)]" />
          <div className={`absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r ${theme.spark}`} />
          <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <MiniParticles particleClass={theme.particle} />

          <div className="relative z-10 flex min-h-[104px] items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.045] text-center">
            <div>
              <p className={`text-4xl font-black ${item.accent}`}>
                {item.icon}
              </p>

              <p
                className="mt-2 text-lg font-black text-white"
                style={{ fontFamily: theme.font }}
              >
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
          className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/25 hover:bg-white/[0.095]"
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
                ? "border-emerald-300/40 bg-emerald-400/18 text-emerald-100"
                : "border-sky-300/40 bg-sky-400/14 text-sky-100 hover:bg-sky-400/22"
            }`}
          >
            {equipped ? "Equipped" : working ? "Equipping..." : "Equip"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBuy}
            disabled={working}
            className="rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-600/30 via-amber-500/16 to-violet-600/24 px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-200/60 hover:shadow-[0_0_28px_rgba(245,158,11,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working ? "Buying..." : `Buy • ${formatSilverPrice(item.price)}`}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes cosmetic-float {
          0% {
            transform: translateY(22px) translateX(0) scale(0.72);
            opacity: 0;
          }
          18% {
            opacity: var(--particle-opacity);
          }
          72% {
            opacity: var(--particle-opacity);
          }
          100% {
            transform: translateY(-88px) translateX(var(--particle-drift))
              scale(1);
            opacity: 0;
          }
        }

        @keyframes cosmetic-mini-float {
          0% {
            transform: translateY(18px) scale(0.7);
            opacity: 0;
          }
          25% {
            opacity: 0.62;
          }
          100% {
            transform: translateY(-42px) scale(1);
            opacity: 0;
          }
        }

        @keyframes cosmetic-sweep-pass {
          0% {
            transform: translateX(-160%) skewX(-18deg);
            opacity: 0;
          }
          24% {
            opacity: 0.52;
          }
          56% {
            opacity: 0.16;
          }
          100% {
            transform: translateX(160%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes cosmetic-orbit-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.38;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.78;
          }
        }

        .cosmetic-sweep {
          width: 46%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.18),
            rgba(251, 191, 36, 0.09),
            transparent
          );
          animation: cosmetic-sweep-pass 7s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .cosmetic-sweep-two {
          animation-delay: 3.2s;
          opacity: 0.55;
        }

        .cosmetic-particle {
          animation-name: cosmetic-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        .cosmetic-mini-particle {
          animation-name: cosmetic-mini-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        .cosmetic-orbit {
          animation: cosmetic-orbit-pulse 4.8s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </article>
  );
}

function FloatingParticles({ particleClass }: { particleClass: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {Array.from({ length: 22 }).map((_, index) => (
        <span
          key={`cosmetic-particle-${index}`}
          className={`cosmetic-particle absolute rounded-full ${particleClass}`}
          style={
            {
              left: `${3 + ((index * 11) % 94)}%`,
              top: `${12 + ((index * 17) % 80)}%`,
              width: `${index % 4 === 0 ? 7 : index % 3 === 0 ? 5 : 3}px`,
              height: `${index % 4 === 0 ? 7 : index % 3 === 0 ? 5 : 3}px`,
              animationDelay: `${(index % 13) * 0.28}s`,
              animationDuration: `${4.6 + (index % 6) * 0.42}s`,
              "--particle-opacity": `${0.18 + (index % 6) * 0.075}`,
              "--particle-drift": `${index % 2 === 0 ? 22 : -22}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function MiniParticles({ particleClass }: { particleClass: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      {Array.from({ length: 10 }).map((_, index) => (
        <span
          key={`cosmetic-mini-particle-${index}`}
          className={`cosmetic-mini-particle absolute h-1 w-1 rounded-full ${particleClass}`}
          style={{
            left: `${8 + ((index * 17) % 84)}%`,
            top: `${30 + ((index * 23) % 46)}%`,
            animationDelay: `${index * 0.22}s`,
            animationDuration: `${3.2 + (index % 4) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-[inset_0_0_18px_rgba(255,255,255,0.025)]">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-slate-100">{value}</p>
    </div>
  );
}
