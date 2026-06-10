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
        "border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(251,191,36,0.16),rgba(239,68,68,0.12))] text-white shadow-[0_0_22px_rgba(255,255,255,0.12)]",
      price: "text-white drop-shadow-[0_0_14px_rgba(251,191,36,0.38)]",
      glow:
        "shadow-[0_0_70px_rgba(255,255,255,0.12),0_0_95px_rgba(245,158,11,0.08),0_0_120px_rgba(239,68,68,0.06)]",
      quality: "Divine Relic",
      motion: "Royal Loop",
    };
  }

  if (rarity === "Mythic") {
    return {
      badge: "border-fuchsia-300/40 bg-fuchsia-400/15 text-fuchsia-100",
      price: "text-fuchsia-200",
      glow: "shadow-[0_0_55px_rgba(217,70,239,0.16)]",
      quality: "Luxury Motion",
      motion: "High",
    };
  }

  if (rarity === "Legendary") {
    return {
      badge: "border-amber-300/40 bg-amber-400/15 text-amber-100",
      price: "text-amber-200",
      glow: "shadow-[0_0_55px_rgba(245,158,11,0.15)]",
      quality: "Premium Depth",
      motion: "Smooth",
    };
  }

  if (rarity === "Epic") {
    return {
      badge: "border-violet-300/35 bg-violet-400/14 text-violet-100",
      price: "text-violet-200",
      glow: "shadow-[0_0_45px_rgba(168,85,247,0.12)]",
      quality: "Animated Layer",
      motion: "Smooth",
    };
  }

  if (rarity === "Rare") {
    return {
      badge: "border-sky-300/35 bg-sky-400/12 text-sky-100",
      price: "text-sky-200",
      glow: "shadow-[0_0_38px_rgba(56,189,248,0.09)]",
      quality: "Soft Motion",
      motion: "Soft",
    };
  }

  return {
    badge: "border-white/15 bg-white/[0.06] text-slate-200",
    price: "text-slate-100",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.07)]",
    quality: "Clean Basic",
    motion: "Clean",
  };
}

function getThemeCardClass(theme: CosmeticItem["theme"]) {
  if (theme === "sovereign-tempest") {
    return "border-amber-300/25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.20),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_42%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,27,75,0.70))]";
  }

  if (theme === "abyssal-leviathan") {
    return "border-cyan-300/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_42%),linear-gradient(135deg,rgba(3,16,35,0.94),rgba(8,47,73,0.70))]";
  }

  if (theme === "crimson-aristocrat") {
    return "border-red-300/25 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_42%),linear-gradient(135deg,rgba(22,5,14,0.94),rgba(69,10,10,0.62))]";
  }

  if (theme === "ethereal-yggdrasil") {
    return "border-emerald-300/25 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_42%),linear-gradient(135deg,rgba(4,24,19,0.94),rgba(20,83,45,0.58))]";
  }

  if (theme === "ivory-overlord") {
    return "border-cyan-200/25 bg-[radial-gradient(circle_at_top_left,rgba(226,232,240,0.13),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_42%),linear-gradient(135deg,rgba(8,13,24,0.95),rgba(15,23,42,0.72))]";
  }

  if (theme === "sovereign-lunar-eclipse") {
    return "border-white/35 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(147,197,253,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_42%),linear-gradient(135deg,rgba(8,13,28,0.96),rgba(30,41,59,0.76),rgba(15,23,42,0.88))]";
  }

  if (theme === "cosmic-eclipse") {
    return "border-red-300/30 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.26),transparent_32%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.42),transparent_44%),linear-gradient(135deg,rgba(3,3,8,0.98),rgba(39,8,12,0.82),rgba(9,9,11,0.94))]";
  }

  return "border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.90))]";
}

function getDivineCardCrown(theme: CosmeticItem["theme"]) {
  if (theme === "sovereign-lunar-eclipse") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 z-[1] rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/80 shadow-[0_0_20px_rgba(255,255,255,0.10)]">
        Moonlit Sovereign
      </div>
    );
  }

  if (theme === "cosmic-eclipse") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 z-[1] rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.12)]">
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
      className={`relative overflow-hidden rounded-[32px] border p-5 transition duration-300 hover:-translate-y-1 hover:scale-[1.006] ${getThemeCardClass(
        item.theme
      )} ${rarity.glow}`}
    >
      <CosmeticEffectRenderer
        theme={item.theme}
        type={item.type}
        variant="card"
      />

      {getDivineCardCrown(item.theme)}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.055),transparent)] opacity-70" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] border border-white/15 bg-black/30 text-3xl shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
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

        <p className={`mt-2 text-sm font-bold ${item.accent}`}>
          {item.shortDescription}
        </p>

        <p className="mt-4 min-h-[88px] text-sm leading-6 text-slate-300">
          {item.description}
        </p>
      </div>

      <div className="relative z-10 mt-5 rounded-[26px] border border-white/10 bg-black/28 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
          Live Visual Preview
        </p>

        <div className="relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/35 p-4">
          <CosmeticEffectRenderer
            theme={item.theme}
            type={item.type}
            variant="compact"
          />

          <div className="relative z-10 flex min-h-[96px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-center">
            <div>
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
          className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
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
            className="rounded-2xl border border-amber-300/35 bg-gradient-to-r from-amber-600/25 via-amber-500/14 to-violet-600/20 px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-200/55 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working ? "Buying..." : `Buy • ${formatSilverPrice(item.price)}`}
          </button>
        )}
      </div>
    </article>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-slate-200">{value}</p>
    </div>
  );
}
