"use client";

import React from "react";

type WorldChronicleRow = {
  id: string;

  season_name: string;
  season_day: number;
  season_length: number;

  world_day_name: string;
  weather_name: string;
  moon_phase: string;

  headline: string;
  news_body: string;

  event_title: string;
  event_type: string;
  event_location: string;
  event_mode: string;
  event_requirement: string;
  event_reward_note: string;

  market_mood: string;
  market_warning: string;

  created_by: string;
  last_generated_at: string;
  next_update_at: string;

  created_at: string;
  updated_at: string;
};

type ChronicleMarketNoteRow = {
  id: string;
  chronicle_id: string;
  asset_category: string;
  effect_type: "positive" | "negative" | "stable" | "volatile";
  effect_strength: number;
  title: string;
  body: string;
  rumor_tone: "optimistic" | "cautious" | "uncertain" | "warning" | "neutral";
  created_at: string;
};

type LunariaChroniclePanelProps = {
  chronicle: WorldChronicleRow | null;
  marketNotes: ChronicleMarketNoteRow[];
  isAdmin: boolean;
  updating: boolean;
  onRunDailyChronicle: () => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSeasonStyle(seasonName: string | undefined) {
  const season = String(seasonName || "").toLowerCase();

  if (season === "bloomcrest") {
    return {
      label: "Bloomcrest",
      badge: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
      glow: "from-emerald-400/16 via-amber-300/8 to-transparent",
      icon: "✦",
      mood:
        "Musim pertumbuhan. Herbal, farm supply, dan aktivitas desa biasanya lebih sering mendapat perhatian Chronicle.",
    };
  }

  if (season === "virelune") {
    return {
      label: "Virelune",
      badge: "border-indigo-300/25 bg-indigo-400/10 text-indigo-100",
      glow: "from-indigo-400/18 via-cyan-300/8 to-transparent",
      icon: "☽",
      mood:
        "Musim cahaya bulan. Karavan malam, relik, dan rumor pasar bayangan biasanya lebih aktif.",
    };
  }

  if (season === "ashenfall") {
    return {
      label: "Ashenfall",
      badge: "border-orange-300/25 bg-orange-400/10 text-orange-100",
      glow: "from-orange-500/18 via-red-400/8 to-transparent",
      icon: "◆",
      mood:
        "Musim debu panas. Mining contract, forge demand, dan jalur Cinderpeak lebih sering berubah.",
    };
  }

  if (season === "frostveil") {
    return {
      label: "Frostveil",
      badge: "border-sky-300/25 bg-sky-400/10 text-sky-100",
      glow: "from-sky-400/18 via-white/8 to-transparent",
      icon: "❄",
      mood:
        "Musim dingin. Cadangan pangan, supply desa, dan rute lambat lebih sering menjadi bahan berita.",
    };
  }

  if (season === "stormwake") {
    return {
      label: "Stormwake",
      badge: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
      glow: "from-cyan-400/18 via-blue-500/8 to-transparent",
      icon: "≈",
      mood:
        "Musim gelombang. Port exchange, kargo, kapal, dan perdagangan Azure Coast menjadi lebih volatile.",
    };
  }

  return {
    label: seasonName || "Unknown Season",
    badge: "border-white/15 bg-white/[0.06] text-slate-200",
    glow: "from-white/10 via-transparent to-transparent",
    icon: "◇",
    mood: "Chronicle sedang membaca kondisi dunia Lunaria.",
  };
}

function getEffectStyle(effectType: ChronicleMarketNoteRow["effect_type"]) {
  if (effectType === "positive") {
    return {
      label: "Demand Pressure",
      badge: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
      dot: "bg-emerald-300",
      text: "Sinyal market terlihat menguat, tapi arah harga tetap belum pasti.",
    };
  }

  if (effectType === "negative") {
    return {
      label: "Supply Pressure",
      badge: "border-red-300/25 bg-red-400/10 text-red-100",
      dot: "bg-red-300",
      text: "Ada tekanan pada kategori ini. Player perlu membaca risiko sebelum membeli.",
    };
  }

  if (effectType === "volatile") {
    return {
      label: "Volatile",
      badge: "border-amber-300/25 bg-amber-400/10 text-amber-100",
      dot: "bg-amber-300",
      text: "Peluang dan risiko sama-sama naik. Market bisa bergerak tidak stabil.",
    };
  }

  return {
    label: "Stable Watch",
    badge: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
    dot: "bg-cyan-300",
    text: "Market relatif tenang, tetapi masih bisa berubah karena risk roll.",
  };
}

function getToneLabel(tone: ChronicleMarketNoteRow["rumor_tone"]) {
  if (tone === "optimistic") return "Optimistic Rumor";
  if (tone === "cautious") return "Cautious Report";
  if (tone === "warning") return "Warning Notice";
  if (tone === "neutral") return "Neutral Reading";
  return "Uncertain Whisper";
}

export default function LunariaChroniclePanel({
  chronicle,
  marketNotes,
  isAdmin,
  updating,
  onRunDailyChronicle,
}: LunariaChroniclePanelProps) {
  const seasonStyle = getSeasonStyle(chronicle?.season_name);

  return (
    <section className="relative mt-6 overflow-hidden rounded-[38px] border border-amber-300/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] lg:p-6">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${seasonStyle.glow}`}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-7 top-6 text-8xl opacity-[0.045]">
        {seasonStyle.icon}
      </div>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/35 to-transparent" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(252,211,77,0.85)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-200">
                The Lunaria Chronicle
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Royal Market Bulletin
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Berita harian Lunaria untuk membaca musim, cuaca, event ringan,
              dan rumor market sebelum player membeli asset di Relic Exchange.
            </p>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={onRunDailyChronicle}
              disabled={updating}
              className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.10)] transition hover:bg-amber-400/16 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? "Publishing..." : "Run Daily Chronicle"}
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <ChronicleSeal
            label="Season"
            value={`${chronicle?.season_name || "Bloomcrest"} — Day ${
              chronicle?.season_day || 1
            }/${chronicle?.season_length || 7}`}
            badge={seasonStyle.label}
          />
          <ChronicleSeal
            label="World Day"
            value={chronicle?.world_day_name || "Solarys"}
            badge="Calendar"
          />
          <ChronicleSeal
            label="Weather"
            value={chronicle?.weather_name || "Soft Rain"}
            badge="Climate"
          />
          <ChronicleSeal
            label="Moon Phase"
            value={chronicle?.moon_phase || "Waxing Moon"}
            badge="Lunar"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-[30px] border border-white/10 bg-black/24 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                  Front Page
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                  {chronicle?.headline ||
                    "The Silver Rain Opens the Market Week"}
                </h3>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${seasonStyle.badge}`}
              >
                {chronicle?.season_name || "Bloomcrest"}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {chronicle?.news_body ||
                "Hujan lembut turun di beberapa jalur luar Lunaria. Para merchant mencatat pergerakan lambat di rute dagang, sementara herbalist melaporkan cahaya tanaman liar yang lebih kuat dari biasanya."}
            </p>

            <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-400/[0.045] p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-300">
                Season Reading
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {seasonStyle.mood}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Last Published
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {formatDate(chronicle?.last_generated_at)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Next Update
                </p>
                <p className="mt-2 text-sm font-black text-amber-200">
                  {formatDate(chronicle?.next_update_at)}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-purple-300/15 bg-purple-400/[0.045] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-300">
                  RP Notice
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                  {chronicle?.event_title || "Glowcap Harvest Notice"}
                </h3>
              </div>

              <span className="shrink-0 rounded-full border border-purple-300/25 bg-purple-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-purple-100">
                {chronicle?.event_type || "Seasonal Notice"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniNotice label="Location" value={chronicle?.event_location || "Everglow Forest"} />
              <MiniNotice label="Mode" value={chronicle?.event_mode || "Solo / Duo"} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/22 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                What Player Can Do
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {chronicle?.event_requirement ||
                  "Player dapat melakukan RP menuju lokasi event, membantu NPC terkait, dan membawa laporan ringan ke guild."}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.045] p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-300">
                Reward Note
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {chronicle?.event_reward_note ||
                  "Reward dapat ditentukan admin sesuai kualitas RP dan kondisi karakter."}
              </p>
            </div>
          </article>
        </div>

        <div className="mt-5 rounded-[30px] border border-cyan-300/15 bg-cyan-400/[0.04] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                Market Bulletin
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Category Rumors
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Rumor market ini memberi konteks untuk asset, bukan bocoran
                pasti. Harga tetap dipengaruhi risk roll, demand, dan kondisi
                dunia berikutnya.
              </p>
            </div>

            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
              {marketNotes.length} Reports
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {marketNotes.map((note) => {
              const effect = getEffectStyle(note.effect_type);

              return (
                <article
                  key={note.id}
                  className="rounded-[24px] border border-white/10 bg-black/24 p-4 transition hover:border-white/16 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${effect.dot} shadow-[0_0_14px_rgba(255,255,255,0.25)]`}
                        />
                        <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                          {note.asset_category}
                        </p>
                      </div>

                      <h4 className="mt-2 text-base font-black text-white">
                        {note.title}
                      </h4>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${effect.badge}`}
                    >
                      {effect.label}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {note.body}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <MiniNotice
                      label="Rumor Tone"
                      value={getToneLabel(note.rumor_tone)}
                    />
                    <MiniNotice
                      label="Pressure"
                      value={`${note.effect_strength > 0 ? "+" : ""}${
                        note.effect_strength
                      }`}
                    />
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    {effect.text}
                  </p>
                </article>
              );
            })}

            {marketNotes.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-400">
                Belum ada market bulletin. Jalankan Daily Chronicle untuk
                menerbitkan rumor kategori market hari ini.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
            Chronicle Warning
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {chronicle?.market_warning ||
              "Catatan Chronicle tidak menjamin harga pasti naik atau turun. Player tetap perlu membaca risiko asset sebelum membeli."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ChronicleSeal({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/24 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 truncate text-sm font-black text-white">{value}</p>
        </div>

        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-slate-300">
          {badge}
        </span>
      </div>
    </div>
  );
}

function MiniNotice({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
