 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type CareAction = "feed" | "care" | "train" | "rest";

type LunariaSession = {
  role: "player" | "admin";
  playerId?: string;
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
};

type FamiliarSpecies = {
  id: string;
  name: string;
  slug: string;
  rarity: string;
  habitat: string;
  role: string;
  personality_tags: string[];
  short_description: string;
  origin_story: string;
  habitat_story: string;
  bonding_method: string;
  stage_1_name: string;
  stage_2_name: string;
  stage_3_name: string;
  stage_4_name: string;
  stage_1_image_url: string;
  stage_2_image_url: string;
  stage_3_image_url: string;
  stage_4_image_url: string;
  habitat_background_url: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  wis: number;
  rp_skill_1_name: string;
  rp_skill_1_desc: string;
  rp_skill_2_name: string;
  rp_skill_2_desc: string;
  battle_skill_1_name: string;
  battle_skill_1_desc: string;
  battle_skill_2_name: string;
  battle_skill_2_desc: string;
  battle_skill_3_name: string;
  battle_skill_3_desc: string;
  favorite_food: string;
  chat_style: string;
  ai_behavior: string;
};

type Player = {
  character_name: string;
  race: string;
  guild_rank: string;
  pathway: string;
};

type PlayerFamiliar = {
  id: string;
  player_id: string;
  familiar_name: string;
  stage: number;
  mood: number;
  energy: number;
  bond_xp: number;
  personality: string;
  relationship_status: string;
  desire: string;
  battle_wins: number;
  battle_losses: number;
  tournament_wins: number;
  memory_summary: string;
  is_active: boolean;
  obtained_at: string;
  familiar_species: FamiliarSpecies;
  players: Player;
};

function getSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const raw =
    sessionStorage.getItem("lunaria_session") ||
    localStorage.getItem("lunaria_session");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as LunariaSession;
  } catch {
    return null;
  }
}

function getStageName(familiar: PlayerFamiliar) {
  const species = familiar.familiar_species;

  if (familiar.stage === 1) return species.stage_1_name;
  if (familiar.stage === 2) return species.stage_2_name;
  if (familiar.stage === 3) return species.stage_3_name;
  return species.stage_4_name;
}

function getStageImage(familiar: PlayerFamiliar) {
  const species = familiar.familiar_species;

  if (familiar.stage === 1) return species.stage_1_image_url;
  if (familiar.stage === 2) return species.stage_2_image_url;
  if (familiar.stage === 3) return species.stage_3_image_url;
  return species.stage_4_image_url;
}

function getNextEvolutionXp(stage: number) {
  if (stage === 1) return 100;
  if (stage === 2) return 300;
  if (stage === 3) return 700;
  return null;
}

function getMoodLabel(mood: number) {
  if (mood >= 80) return "Happy";
  if (mood >= 55) return "Stable";
  if (mood >= 30) return "Restless";
  return "Distant";
}

function getEnergyLabel(energy: number) {
  if (energy >= 75) return "Energetic";
  if (energy >= 45) return "Ready";
  if (energy >= 20) return "Tired";
  return "Exhausted";
}

function generateFamiliarLine(familiar: PlayerFamiliar) {
  const name = familiar.familiar_name || familiar.familiar_species.name;
  const mood = familiar.mood;
  const energy = familiar.energy;
  const personality = familiar.personality.toLowerCase();
  const desire = familiar.desire;

  if (desire === "wants_attention") {
    return `${name} memperhatikan owner-nya dari dekat, seolah menunggu diajak bicara duluan.`;
  }

  if (desire === "feels_attached") {
    return `${name} tampak lebih dekat dari biasanya. Ia tidak mengatakan apa-apa, tapi posisinya tidak jauh dari owner.`;
  }

  if (desire === "wants_rest") {
    return `${name} terlihat lelah setelah bergerak cukup banyak. Ia menatap owner-nya seperti meminta waktu istirahat.`;
  }

  if (desire === "wants_train") {
    return `${name} tampak lebih segar. Gerakannya kecil, tapi terlihat seperti ingin melakukan sesuatu.`;
  }

  if (mood < 35) {
    return `${name} tampak menjauh sedikit. Ia masih mengikuti, tapi cahayanya tidak secerah biasanya.`;
  }

  if (energy < 25) {
    return `${name} terlihat lelah dan memilih duduk diam, menolak terlihat kalah gengsi.`;
  }

  if (personality.includes("smart")) {
    return `${name} tidak banyak bergerak. Matanya mengamati sekitar seperti sedang membaca sesuatu yang tidak terlihat.`;
  }

  if (personality.includes("aggressive")) {
    return `${name} menghentakkan kaki kecilnya, terlihat ingin menantang sesuatu meski tidak ada lawan di depan.`;
  }

  if (personality.includes("clumsy")) {
    return `${name} hampir terpeleset sendiri, lalu berpura-pura itu memang bagian dari rencananya.`;
  }

  return `${name} berada di sisi owner-nya, tenang di bawah cahaya bulan Lunaria.`;
}

export default function MoonFamiliarPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [familiar, setFamiliar] = useState<PlayerFamiliar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [careNotice, setCareNotice] = useState("");
  const [careError, setCareError] = useState("");
  const [isCareWorking, setIsCareWorking] = useState<CareAction | null>(null);

  const nextEvolutionXp = familiar ? getNextEvolutionXp(familiar.stage) : null;

  const bondPercent =
    familiar && nextEvolutionXp
      ? Math.min(100, Math.round((familiar.bond_xp / nextEvolutionXp) * 100))
      : familiar?.stage === 4
      ? 100
      : 0;

  const currentLine = useMemo(() => {
    if (!familiar) return "";
    return generateFamiliarLine(familiar);
  }, [familiar]);

  const fetchFamiliar = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession?.playerId) {
      setIsLoading(false);
      setFamiliar(null);
      return;
    }

    const { data, error } = await supabase
      .from("player_familiars")
      .select(
        `
        *,
        familiar_species (*),
        players (
          character_name,
          race,
          guild_rank,
          pathway
        )
      `
      )
      .eq("player_id", currentSession.playerId)
      .eq("is_active", true)
      .maybeSingle();

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setFamiliar(data as PlayerFamiliar | null);
  };

  const handleCareAction = async (action: CareAction) => {
    if (!familiar) return;

    setCareNotice("");
    setCareError("");
    setIsCareWorking(action);

    const response = await fetch("/api/familiar/care", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerId: familiar.player_id,
        familiarId: familiar.id,
        action,
      }),
    });

    const result = await response.json();
    setIsCareWorking(null);

    if (!response.ok) {
      setCareError(result.error || "Care action failed.");
      setTimeout(() => setCareError(""), 5000);
      return;
    }

    setFamiliar(result.familiar as PlayerFamiliar);
    setCareNotice(result.message || "Familiar updated.");
    setTimeout(() => setCareNotice(""), 5000);
  };

  useEffect(() => {
    fetchFamiliar();
  }, []);

  return (
    <main className="relative space-y-6 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_38%),linear-gradient(135deg,#02030a,#050615_48%,#02030a)]" />

      <section className="relative overflow-hidden rounded-[38px] border border-amber-300/20 bg-gradient-to-br from-[#070812]/95 via-[#050716]/95 to-violet-950/70 p-6 shadow-[0_0_90px_rgba(245,158,11,0.12)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_40%)]" />

        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Lunaria Familiar System
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
            Moon Familiar
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            Familiar adalah companion hidup yang memiliki habitat, story, mood,
            energy, bond, personality, dan memory. Mereka bukan sekadar pet,
            tetapi partner kecil yang ikut tumbuh bersama owner.
          </p>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading familiar bond...</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">
            Failed to load familiar: {errorMessage}
          </p>
        </section>
      ) : null}

      {!isLoading && !familiar ? (
        <section className="rounded-[38px] border border-white/10 bg-black/35 p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
            No Familiar Bound
          </p>

          <h2 className="mt-3 text-3xl font-black text-white">
            Belum ada Familiar yang terikat.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Familiar tidak langsung muncul begitu saja. Player perlu mendapatkan
            Familiar Egg, Signal, atau bonding story dari event / quest / admin.
          </p>

          <p className="mt-4 text-xs font-bold text-slate-500">
            Session: {session?.characterName || session?.username || "Guest"}
          </p>
        </section>
      ) : null}

      {familiar ? (
        <>
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <div className="relative overflow-hidden rounded-[40px] border border-amber-300/25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_40%),linear-gradient(135deg,rgba(2,6,23,0.92),rgba(15,23,42,0.82),rgba(30,27,75,0.72))] p-6 shadow-[0_0_75px_rgba(245,158,11,0.10)]">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone="amber">{familiar.familiar_species.rarity}</Tag>
                    <Tag tone="sky">{familiar.familiar_species.role}</Tag>
                    <Tag tone="violet">
                      Stage {familiar.stage} — {getStageName(familiar)}
                    </Tag>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr] md:items-center">
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[34px] border border-white/10 bg-black/35">
                      {getStageImage(familiar) ? (
                        <img
                          src={getStageImage(familiar)}
                          alt={
                            familiar.familiar_name ||
                            familiar.familiar_species.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle,rgba(245,158,11,0.18),transparent_55%)] p-6 text-center">
                          <div className="flex h-24 w-24 items-center justify-center rounded-[32px] border border-amber-300/25 bg-amber-400/10 text-5xl">
                            🌙
                          </div>
                          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            Image coming soon
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                        Bound Familiar
                      </p>

                      <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">
                        {familiar.familiar_name ||
                          familiar.familiar_species.name}
                      </h2>

                      <p className="mt-2 text-sm font-semibold text-amber-200">
                        Owner:{" "}
                        {familiar.players?.character_name ||
                          session?.characterName ||
                          "Unknown"}
                      </p>

                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {familiar.familiar_species.short_description}
                      </p>

                      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
                          Familiar Thought
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {currentLine}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 xl:col-span-5">
              <GaugeCard
                label="Mood"
                value={familiar.mood}
                desc={getMoodLabel(familiar.mood)}
                tone="text-pink-300"
              />

              <GaugeCard
                label="Energy"
                value={familiar.energy}
                desc={getEnergyLabel(familiar.energy)}
                tone="text-sky-300"
              />

              <div className="rounded-[30px] border border-emerald-300/20 bg-black/35 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                  Bond Progress
                </p>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl font-black text-white">
                      {familiar.bond_xp}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {nextEvolutionXp
                        ? `Need ${nextEvolutionXp} Bond XP`
                        : "Max stage reached"}
                    </p>
                  </div>

                  <p className="text-2xl font-black text-emerald-300">
                    {bondPercent}%
                  </p>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
                    style={{ width: `${bondPercent}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[30px] border border-amber-300/20 bg-black/35 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                  Mind Profile
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <InfoLine label="Personality" value={familiar.personality} />
                  <InfoLine
                    label="Relationship"
                    value={familiar.relationship_status}
                  />
                  <InfoLine
                    label="Current Desire"
                    value={familiar.desire.replace(/_/g, " ")}
                  />
                  <InfoLine
                    label="Habitat"
                    value={familiar.familiar_species.habitat}
                  />
                </div>
              </div>

              <div className="rounded-[30px] border border-violet-300/20 bg-black/35 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">
                  Care Actions
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Rawat familiar supaya mood, energy, dan bond-nya tetap stabil.
                </p>

                {careNotice ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-200">
                    {careNotice}
                  </div>
                ) : null}

                {careError ? (
                  <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm font-bold text-red-200">
                    {careError}
                  </div>
                ) : null}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <CareButton
                    label="Feed"
                    desc="+Mood +Energy"
                    disabled={Boolean(isCareWorking)}
                    active={isCareWorking === "feed"}
                    onClick={() => handleCareAction("feed")}
                  />
                  <CareButton
                    label="Care"
                    desc="+Mood +Bond"
                    disabled={Boolean(isCareWorking)}
                    active={isCareWorking === "care"}
                    onClick={() => handleCareAction("care")}
                  />
                  <CareButton
                    label="Train"
                    desc="-Energy +Bond"
                    disabled={Boolean(isCareWorking)}
                    active={isCareWorking === "train"}
                    onClick={() => handleCareAction("train")}
                  />
                  <CareButton
                    label="Rest"
                    desc="+Energy"
                    disabled={Boolean(isCareWorking)}
                    active={isCareWorking === "rest"}
                    onClick={() => handleCareAction("rest")}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <StoryBox
              eyebrow="Origin Story"
              title="Asal-Usul Familiar"
              text={familiar.familiar_species.origin_story}
            />

            <StoryBox
              eyebrow="Habitat"
              title={familiar.familiar_species.habitat}
              text={familiar.familiar_species.habitat_story}
            />

            <StoryBox
              eyebrow="Memory"
              title="Memory Bond"
              text={familiar.memory_summary || "Belum ada memory penting."}
            />

            <StoryBox
              eyebrow="Bonding Method"
              title="Cara Familiar Ini Terikat"
              text={familiar.familiar_species.bonding_method}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-[34px] border border-emerald-300/20 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                RP Skills
              </p>

              <div className="mt-5 space-y-4">
                <SkillBox
                  name={familiar.familiar_species.rp_skill_1_name}
                  desc={familiar.familiar_species.rp_skill_1_desc}
                />
                <SkillBox
                  name={familiar.familiar_species.rp_skill_2_name}
                  desc={familiar.familiar_species.rp_skill_2_desc}
                />
              </div>
            </div>

            <div className="rounded-[34px] border border-red-300/20 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
                Battle Instinct
              </p>

              <div className="mt-5 grid grid-cols-5 gap-2">
                <StatPill label="HP" value={familiar.familiar_species.hp} />
                <StatPill label="ATK" value={familiar.familiar_species.atk} />
                <StatPill label="DEF" value={familiar.familiar_species.def} />
                <StatPill label="SPD" value={familiar.familiar_species.spd} />
                <StatPill label="WIS" value={familiar.familiar_species.wis} />
              </div>

              <div className="mt-5 space-y-4">
                <SkillBox
                  name={familiar.familiar_species.battle_skill_1_name}
                  desc={familiar.familiar_species.battle_skill_1_desc}
                />
                <SkillBox
                  name={familiar.familiar_species.battle_skill_2_name}
                  desc={familiar.familiar_species.battle_skill_2_desc}
                />
                <SkillBox
                  name={familiar.familiar_species.battle_skill_3_name}
                  desc={familiar.familiar_species.battle_skill_3_desc}
                />
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "sky" | "violet";
}) {
  const className =
    tone === "amber"
      ? "border-amber-300/30 bg-amber-400/10 text-amber-200"
      : tone === "sky"
      ? "border-sky-300/20 bg-sky-400/10 text-sky-200"
      : "border-violet-300/20 bg-violet-400/10 text-violet-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${className}`}
    >
      {children}
    </span>
  );
}

function GaugeCard({
  label,
  value,
  desc,
  tone,
}: {
  label: string;
  value: number;
  desc: string;
  tone: string;
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-black/35 p-5">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <p className={`text-5xl font-black ${tone}`}>{value}</p>
        <p className="text-sm font-bold text-slate-400">{desc}</p>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-violet-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CareButton({
  label,
  desc,
  disabled,
  active,
  onClick,
}: {
  label: string;
  desc: string;
  disabled: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-amber-300/30 hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <p className="text-sm font-black text-white">
        {active ? "Working..." : label}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-500">{desc}</p>
    </button>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-black capitalize text-white">{value}</p>
    </div>
  );
}

function StoryBox({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[34px] border border-white/10 bg-black/35 p-6">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function SkillBox({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="font-black text-white">{name || "Unnamed Skill"}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {desc || "Skill description belum tersedia."}
      </p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}
