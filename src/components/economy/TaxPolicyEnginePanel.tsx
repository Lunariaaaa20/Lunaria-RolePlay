"use client";

import React from "react";

type TaxPolicyRow = {
  id: string;
  decree_name: string;
  status: "lowered" | "stable" | "raised";
  reason: string;

  tier_0_max: number;
  tier_0_rate: number;

  tier_1_min: number;
  tier_1_max: number;
  tier_1_rate: number;

  tier_2_min: number;
  tier_2_max: number;
  tier_2_rate: number;

  tier_3_min: number;
  tier_3_max: number;
  tier_3_rate: number;

  tier_4_min: number;
  tier_4_rate: number;

  last_review_at: string | null;
  next_review_at: string | null;

  created_at: string;
  updated_at: string;
};

type TaxPolicyHistoryRow = {
  id: string;
  decree_name: string;
  status: "lowered" | "stable" | "raised";
  reason: string;

  tier_0_rate: number;
  tier_1_rate: number;
  tier_2_rate: number;
  tier_3_rate: number;
  tier_4_rate: number;

  previous_tier_0_rate: number | null;
  previous_tier_1_rate: number | null;
  previous_tier_2_rate: number | null;
  previous_tier_3_rate: number | null;
  previous_tier_4_rate: number | null;

  review_summary: string | null;
  created_by: string;
  created_at: string;
};

type TaxPolicyEnginePanelProps = {
  policy: TaxPolicyRow | null;
  history: TaxPolicyHistoryRow[];
  reviewing: boolean;
  onReview: () => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPolicyState(status: string | undefined) {
  if (status === "raised") {
    return {
      label: "Raised",
      title: "Tax Pressure Increased",
      description:
        "Treasury membutuhkan dorongan tambahan. Pajak naik ringan agar kas guild tetap kuat tanpa menghancurkan ekonomi player.",
      badge: "border-red-300/25 bg-red-400/10 text-red-100",
      glow: "from-red-400/16 via-amber-300/8 to-transparent",
      dot: "bg-red-300 shadow-[0_0_18px_rgba(252,165,165,0.85)]",
      icon: "⚖",
      mood: "Treasury pressure rising",
    };
  }

  if (status === "lowered") {
    return {
      label: "Lowered",
      title: "Tax Relief Decree Active",
      description:
        "Beban pajak sedang diringankan. Guild memberi ruang bagi player dan merchant agar ekonomi kembali bernapas.",
      badge: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
      glow: "from-emerald-400/16 via-cyan-300/8 to-transparent",
      dot: "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.85)]",
      icon: "✦",
      mood: "Relief-oriented policy",
    };
  }

  return {
    label: "Stable",
    title: "Balanced Treasury Order",
    description:
      "Kebijakan pajak sedang stabil. Treasury menjaga agar ekonomi tidak berubah terlalu cepat dan market tetap bisa bergerak alami.",
    badge: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
    glow: "from-cyan-400/16 via-purple-300/8 to-transparent",
    dot: "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)]",
    icon: "♛",
    mood: "Treasury is balanced",
  };
}

function getRateShiftText(history: TaxPolicyHistoryRow | undefined) {
  if (!history) return "Belum ada riwayat review baru.";

  const previousRates = [
    history.previous_tier_0_rate,
    history.previous_tier_1_rate,
    history.previous_tier_2_rate,
    history.previous_tier_3_rate,
    history.previous_tier_4_rate,
  ];

  if (previousRates.every((rate) => rate === null)) {
    return "Decree awal dicatat sebagai dasar kebijakan pajak guild.";
  }

  if (history.status === "raised") {
    return "Tarif pajak terakhir naik ringan berdasarkan kondisi treasury.";
  }

  if (history.status === "lowered") {
    return "Tarif pajak terakhir turun ringan untuk memberi ruang ekonomi.";
  }

  return "Tarif pajak terakhir dipertahankan tanpa perubahan besar.";
}

export default function TaxPolicyEnginePanel({
  policy,
  history,
  reviewing,
  onReview,
}: TaxPolicyEnginePanelProps) {
  const state = getPolicyState(policy?.status);
  const latestHistory = history[0];

  return (
    <div className="relative mt-5 overflow-hidden rounded-[28px] border border-amber-300/15 bg-[linear-gradient(135deg,rgba(245,158,11,0.075),rgba(34,211,238,0.045),rgba(168,85,247,0.04))] p-5 shadow-[inset_0_0_34px_rgba(255,255,255,0.025)]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${state.glow}`} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-amber-300/10 blur-2xl" />
      <div className="pointer-events-none absolute right-5 top-4 text-6xl opacity-[0.065]">
        {state.icon}
      </div>
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} />
              <p className="text-[9px] font-black uppercase tracking-[0.26em] text-amber-100">
                Royal Tax Policy Engine
              </p>
            </div>

            <h3 className="mt-3 text-xl font-black text-white">
              {policy?.decree_name || state.title}
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {policy?.reason || state.description}
            </p>

            <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold leading-5 text-slate-300">
              {getRateShiftText(latestHistory)}
            </p>
          </div>

          <span
            className={`w-fit shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${state.badge}`}
          >
            {state.label}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <TaxMiniCard
            label="Current Decree"
            value={policy?.decree_name || "Balanced Treasury Order"}
          />

          <TaxMiniCard
            label="Next Review"
            value={formatDate(policy?.next_review_at)}
            highlight
          />

          <TaxMiniCard label="Tax Mood" value={state.mood} />

          <TaxMiniCard
            label="Latest Review"
            value={formatDate(policy?.last_review_at)}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-5">
          <TaxRatePill
            label={`0S–${policy?.tier_0_max ?? 50}S`}
            value={`${policy?.tier_0_rate ?? 0}%`}
          />
          <TaxRatePill
            label={`${policy?.tier_1_min ?? 51}S–${policy?.tier_1_max ?? 150}S`}
            value={`${policy?.tier_1_rate ?? 3}%`}
          />
          <TaxRatePill
            label={`${policy?.tier_2_min ?? 151}S–${policy?.tier_2_max ?? 300}S`}
            value={`${policy?.tier_2_rate ?? 5}%`}
          />
          <TaxRatePill
            label={`${policy?.tier_3_min ?? 301}S–${policy?.tier_3_max ?? 700}S`}
            value={`${policy?.tier_3_rate ?? 7}%`}
          />
          <TaxRatePill
            label={`${policy?.tier_4_min ?? 701}S+`}
            value={`${policy?.tier_4_rate ?? 10}%`}
          />
        </div>

        <button
          type="button"
          onClick={onReview}
          disabled={reviewing}
          className="mt-5 w-full rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-400/16 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reviewing ? "Reviewing..." : "Run Tax Policy Review"}
        </button>
      </div>
    </div>
  );
}

function TaxMiniCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 line-clamp-2 text-sm font-black ${
          highlight ? "text-amber-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TaxRatePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/22 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-amber-200">{value}</p>
    </div>
  );
}
