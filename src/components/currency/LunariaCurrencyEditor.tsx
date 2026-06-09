"use client";

import React from "react";
import {
  formatCurrency,
  normalizeCurrency,
  type LunariaCurrency,
} from "@/lib/lunariaCurrency";

type LunariaCurrencyEditorProps = {
  value: LunariaCurrency;
  onChange: (nextValue: LunariaCurrency) => void;
  label?: string;
};

export default function LunariaCurrencyEditor({
  value,
  onChange,
  label = "Currency",
}: LunariaCurrencyEditorProps) {
  const normalized = normalizeCurrency(value);

  function updateCurrency(key: keyof LunariaCurrency, inputValue: string) {
    const nextRaw = {
      ...value,
      [key]: Math.max(0, Math.floor(Number(inputValue) || 0)),
    };

    onChange(normalizeCurrency(nextRaw));
  }

  function handleNormalize() {
    onChange(normalizeCurrency(value));
  }

  return (
    <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
            {label}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Konversi otomatis:{" "}
            <span className="font-black text-amber-200">1G = 1000S</span>,{" "}
            <span className="font-black text-slate-100">1S = 100B</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Current
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {formatCurrency(normalized)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <CurrencyField
          label="Gold"
          value={normalized.gold}
          tone="text-amber-300"
          onChange={(nextValue) => updateCurrency("gold", nextValue)}
        />

        <CurrencyField
          label="Silver"
          value={normalized.silver}
          tone="text-slate-100"
          onChange={(nextValue) => updateCurrency("silver", nextValue)}
        />

        <CurrencyField
          label="Bronze"
          value={normalized.bronze}
          tone="text-orange-300"
          onChange={(nextValue) => updateCurrency("bronze", nextValue)}
        />
      </div>

      <button
        type="button"
        onClick={handleNormalize}
        className="mt-4 w-full rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-amber-200 transition hover:bg-amber-500/20"
      >
        Normalize Currency
      </button>
    </div>
  );
}

function CurrencyField({
  label,
  value,
  tone,
  onChange,
}: {
  label: string;
  value: number;
  tone: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/30 p-4">
      <span className={`text-xs font-black uppercase tracking-[0.22em] ${tone}`}>
        {label}
      </span>

      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-lg font-black text-white outline-none transition focus:border-amber-300/45 focus:ring-4 focus:ring-amber-400/10"
      />
    </label>
  );
}
