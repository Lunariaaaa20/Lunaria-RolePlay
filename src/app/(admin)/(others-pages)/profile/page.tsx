"use client";

import React, { useMemo, useState } from "react";

const adventurer = {
  name: "Aether Veyl",
  race: "Human",
  rank: "Initiate",
  pathway: "Mystic",
  mission: "Active Guild Registration",
  skills: ["Arcane Thread", "Silent Ember"],
  inventory: ["Beginner Cloak", "Small Mana Vial", "Guild Token"],
  currency: {
    gold: 0,
    silver: 10,
    bronze: 0,
  },
  guild: "Adventurer's Guild of Aethelgard",
  status: "Active Adventurer",
};

const rankTheme: Record<string, string> = {
  Initiate: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  Seeker: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Warden: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Arbiter: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  "High Council": "border-amber-400/40 bg-amber-400/10 text-amber-200",
};

const pathwayTheme: Record<string, string> = {
  Warrior: "border-red-400/30 bg-red-400/10 text-red-200",
  Mystic: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  Shadow: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  Nature: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export default function AdventurerIdCardPage() {
  const [copied, setCopied] = useState(false);

  const idCardText = useMemo(() => {
    return `╔══════════════════════╗
* ADVENTURER'S GUILD LICENSE
╚══════════════════════╝
*Name :* ${adventurer.name}
*Race :* ${adventurer.race}
*Guild Rank :* ${adventurer.rank.toUpperCase()}
*Pathway :* ${adventurer.pathway}
*Misi :* ${adventurer.mission}
━━━━━━━━━━━━━━━━━━
*Primary Skills*
1. ${adventurer.skills[0]}
2. ${adventurer.skills[1]}
━━━━━━━━━━━━━━━━━━
*Inventory*
1. ${adventurer.inventory[0]}
2. ${adventurer.inventory[1]}
3. ${adventurer.inventory[2]}
━━━━━━━━━━━━━━━━━━
*Currency*
- Gold : ${adventurer.currency.gold}
- Silver : ${adventurer.currency.silver}
- Bronze : ${adventurer.currency.bronze}
━━━━━━━━━━━━━━━━━━
Registered Guild :
${adventurer.guild}

Status :
${adventurer.status}`;
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(idCardText);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          Lunaria Guild Registry
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Adventurer ID Card
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Lisensi resmi adventurer untuk data karakter, rank, pathway,
              skill, inventory, currency, dan status aktif di Guild Aethelgard.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500/20"
          >
            {copied ? "Copied" : "Copy ID Card"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <div className="relative overflow-hidden rounded-[32px] border border-amber-400/30 bg-[#070812] p-5 shadow-[0_0_50px_rgba(245,158,11,0.14)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_30%)]" />

            <div className="relative z-10 rounded-[26px] border border-amber-400/20 bg-black/35 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
                    Adventurer&apos;s Guild License
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Registered Guild of Aethelgard
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-xl text-amber-300">
                  ⚜
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[32px] border border-amber-400/30 bg-gradient-to-br from-slate-900 via-black to-violet-950 shadow-[0_0_35px_rgba(245,158,11,0.14)]">
                  <span className="text-5xl">🧙</span>
                  <div className="absolute bottom-2 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-300">
                    Character Photo
                  </div>
                </div>

                <h2 className="mt-5 text-3xl font-black text-white">
                  {adventurer.name}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {adventurer.race} • {adventurer.pathway}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <span
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                      rankTheme[adventurer.rank]
                    }`}
                  >
                    {adventurer.rank}
                  </span>

                  <span
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                      pathwayTheme[adventurer.pathway]
                    }`}
                  >
                    {adventurer.pathway}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-amber-400/20 bg-white/[0.04] p-3 text-center">
                  <p className="text-xs text-slate-500">Gold</p>
                  <p className="mt-1 text-2xl font-black text-amber-300">
                    {adventurer.currency.gold}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-400/20 bg-white/[0.04] p-3 text-center">
                  <p className="text-xs text-slate-500">Silver</p>
                  <p className="mt-1 text-2xl font-black text-slate-200">
                    {adventurer.currency.silver}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-400/20 bg-white/[0.04] p-3 text-center">
                  <p className="text-xs text-slate-500">Bronze</p>
                  <p className="mt-1 text-2xl font-black text-orange-300">
                    {adventurer.currency.bronze}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
                  {adventurer.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7">
          <div className="h-full rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoBox label="Name" value={adventurer.name} />
              <InfoBox label="Race" value={adventurer.race} />
              <InfoBox label="Guild Rank" value={adventurer.rank} />
              <InfoBox label="Pathway" value={adventurer.pathway} />
            </div>

            <div className="mt-4">
              <InfoBox label="Misi" value={adventurer.mission} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DataPanel title="Primary Skills" items={adventurer.skills} />
              <DataPanel title="Inventory" items={adventurer.inventory} />
            </div>

            <div className="mt-6 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-black/20 to-violet-500/10 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
                Registered Guild
              </p>
              <p className="mt-2 text-lg font-black text-white">
                {adventurer.guild}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Data ini sementara masih dummy/static. Setelah Supabase
                dipasang, semua data akan otomatis berasal dari registrasi yang
                sudah di-approve admin.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
                Cosmetic Slot
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Border, background, name effect, dan aura ID card nanti bisa
                dipasang/copot dari Cosmetic Shop setelah sistem database aktif.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function DataPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-xs font-black text-amber-300">
              {index + 1}
            </div>

            <p className="text-sm font-semibold text-slate-200">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
