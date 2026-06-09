"use client";

import React from "react";
import type { CosmeticItem, CosmeticRarity } from "./data/cosmeticItems";
import CosmeticEffectRenderer from "./CosmeticEffectRenderer";

type CosmeticPreviewModalProps = {
  item: CosmeticItem | null;
  owned?: boolean;
  equipped?: boolean;
  working?: boolean;
  onClose: () => void;
  onBuy?: () => void;
  onEquip?: () => void;
};

function getModalThemeClass(theme: CosmeticItem["theme"]) {
  if (theme === "sovereign-tempest") {
    return "border-amber-300/25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.20),transparent_45%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(30,27,75,0.88))]";
  }

  if (theme === "abyssal-leviathan") {
    return "border-cyan-300/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_45%),linear-gradient(135deg,rgba(2,8,23,0.98),rgba(8,47,73,0.86))]";
  }

  if (theme === "crimson-aristocrat") {
    return "border-red-300/25 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_45%),linear-gradient(135deg,rgba(15,3,9,0.98),rgba(69,10,10,0.86))]";
  }

  if (theme === "ethereal-yggdrasil") {
    return "border-emerald-300/25 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_45%),linear-gradient(135deg,rgba(2,20,16,0.98),rgba(20,83,45,0.80))]";
  }

  return "border-cyan-200/25 bg-[radial-gradient(circle_at_top_left,rgba(226,232,240,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.20),transparent_45%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.88))]";
}

function getRarityClass(rarity: CosmeticRarity) {
  if (rarity === "Mythic") {
    return "border-fuchsia-300/40 bg-fuchsia-400/15 text-fuchsia-100";
  }

  if (rarity === "Legendary") {
    return "border-amber-300/40 bg-amber-400/15 text-amber-100";
  }

  if (rarity === "Epic") {
    return "border-violet-300/35 bg-violet-400/14 text-violet-100";
  }

  if (rarity === "Rare") {
    return "border-sky-300/35 bg-sky-400/12 text-sky-100";
  }

  return "border-white/15 bg-white/[0.06] text-slate-200";
}

export default function CosmeticPreviewModal({
  item,
  owned = false,
  equipped = false,
  working = false,
  onClose,
  onBuy,
  onEquip,
}: CosmeticPreviewModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <section
        className={`relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[36px] border shadow-[0_0_80px_rgba(0,0,0,0.45)] ${getModalThemeClass(
          item.theme
        )}`}
      >
        <CosmeticEffectRenderer theme={item.theme} variant="preview" />

        <div className="relative z-10 max-h-[92vh] overflow-y-auto p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${getRarityClass(
                    item.rarity
                  )}`}
                >
                  {item.rarity}
                </span>

                <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  {item.typeLabel}
                </span>

                <span className="inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {item.themeName}
                </span>
              </div>

              <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
                {item.name}
              </h2>

              <p className={`mt-3 text-base font-bold md:text-lg ${item.accent}`}>
                {item.shortDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.09]"
            >
              Close
            </button>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/35 p-5">
                <CosmeticEffectRenderer theme={item.theme} variant="preview" />

                <div className="relative z-10 flex min-h-[420px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.045] p-6 text-center shadow-[inset_0_0_45px_rgba(255,255,255,0.035)]">
                  <div>
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[34px] border border-white/15 bg-black/35 text-6xl shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
                      {item.icon}
                    </div>

                    <p className={`mt-8 text-4xl font-black ${item.accent}`}>
                      {item.previewLabel}
                    </p>

                    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
                      {item.description}
                    </p>

                    <div className="mt-7 inline-flex rounded-full border border-white/10 bg-black/30 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                      {item.visualQuality}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4 xl:col-span-5">
              <div className="rounded-[30px] border border-white/10 bg-black/35 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
                  Cosmetic Detail
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <PreviewInfo label="Price" value={`${item.price}S`} />
                  <PreviewInfo label="Rarity" value={item.rarity} />
                  <PreviewInfo label="Slot" value={item.typeLabel} />
                  <PreviewInfo label="Theme" value={item.themeName} />
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-black/35 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
                  Visual Identity
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Cosmetic ini tidak dibuat sebagai warna polos. Setiap item
                  punya lapisan visual, ambient motion, dan mood yang mengikuti
                  tema collection-nya.
                </p>

                <div className="mt-5 space-y-3">
                  <PreviewLine title="Collection" value={item.themeName} />
                  <PreviewLine title="Motion Class" value={item.visualQuality} />
                  <PreviewLine title="Preview Name" value={item.previewLabel} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {owned ? (
                  <button
                    type="button"
                    onClick={onEquip}
                    disabled={working || equipped}
                    className={`rounded-2xl border px-5 py-5 text-xs font-black uppercase tracking-[0.2em] transition disabled:cursor-not-allowed ${
                      equipped
                        ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-200"
                        : "border-sky-300/35 bg-sky-400/12 text-sky-200 hover:bg-sky-400/20"
                    }`}
                  >
                    {equipped ? "Equipped" : working ? "Equipping..." : "Equip Cosmetic"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onBuy}
                    disabled={working}
                    className="rounded-2xl border border-amber-300/35 bg-gradient-to-r from-amber-600/25 via-amber-500/14 to-violet-600/20 px-5 py-5 text-xs font-black uppercase tracking-[0.2em] text-amber-100 transition hover:border-amber-200/55 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {working ? "Buying..." : `Buy for ${item.price}S`}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  Back to Vault
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function PreviewLine({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
                  }
