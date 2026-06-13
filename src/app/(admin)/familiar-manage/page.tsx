"use client";

import React, { useEffect, useMemo, useState } from "react";

type LunariaSession = {
  role: "player" | "admin";
  playerId?: string;
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
};

type PlayerInfo = {
  id: string;
  character_name: string;
  race: string;
  guild_rank: string;
  pathway: string;
};

type SpeciesInfo = {
  id: string;
  name: string;
  slug: string;
  habitat: string;
  role: string;
  short_description: string;
  stage_1_image_url: string;
  stage_2_image_url: string;
  stage_3_image_url: string;
  stage_4_image_url: string;
};

type ManagedFamiliar = {
  id: string;
  player_id: string;
  species_id: string;
  familiar_name: string;
  stage: number;
  mood: number;
  energy: number;
  bond_xp: number;
  bond_rank: string;
  personality: string;
  relationship_status: string;
  desire: string;
  battle_wins: number;
  battle_losses: number;
  tournament_wins: number;
  memory_summary: string;
  is_active: boolean;
  obtained_at: string;
  players: PlayerInfo;
  familiar_species: SpeciesInfo;
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

function getStageImage(familiar: ManagedFamiliar) {
  const species = familiar.familiar_species;

  if (familiar.stage === 1) return species.stage_1_image_url;
  if (familiar.stage === 2) return species.stage_2_image_url;
  if (familiar.stage === 3) return species.stage_3_image_url;
  return species.stage_4_image_url;
}

export default function AdminFamiliarManagePage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [familiars, setFamiliars] = useState<ManagedFamiliar[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  const [familiarName, setFamiliarName] = useState("");
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [bondXp, setBondXp] = useState(0);
  const [stage, setStage] = useState(1);
  const [relationshipStatus, setRelationshipStatus] = useState("Normal");
  const [desire, setDesire] = useState("wants_attention");
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredFamiliars = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return familiars;

    return familiars.filter((familiar) =>
      [
        familiar.familiar_name,
        familiar.players?.character_name,
        familiar.familiar_species?.name,
        familiar.familiar_species?.role,
        familiar.familiar_species?.habitat,
        familiar.bond_rank,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [familiars, search]);

  const selectedFamiliar = useMemo(() => {
    return (
      familiars.find((familiar) => familiar.id === selectedId) ||
      familiars[0] ||
      null
    );
  }, [familiars, selectedId]);

  const loadFamiliars = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    try {
      const response = await fetch("/api/admin/familiar/list", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load familiar list.");
        setIsLoading(false);
        return;
      }

      const list = (result.familiars || []) as ManagedFamiliar[];
      setFamiliars(list);

      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }

      setIsLoading(false);
    } catch {
      setErrorMessage("Failed to load familiar list.");
      setIsLoading(false);
    }
  };

  const syncForm = (familiar: ManagedFamiliar | null) => {
    if (!familiar) return;

    setFamiliarName(familiar.familiar_name || "");
    setMood(Number(familiar.mood || 0));
    setEnergy(Number(familiar.energy || 0));
    setBondXp(Number(familiar.bond_xp || 0));
    setStage(Number(familiar.stage || 1));
    setRelationshipStatus(familiar.relationship_status || "Normal");
    setDesire(familiar.desire || "wants_attention");
    setIsActive(Boolean(familiar.is_active));
  };

  const handleSave = async () => {
    if (!selectedFamiliar) return;

    setIsSaving(true);
    setNotice("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/familiar/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          familiarId: selectedFamiliar.id,
          familiarName,
          mood,
          energy,
          bondXp,
          stage,
          relationshipStatus,
          desire,
          isActive,
        }),
      });

      const result = await response.json();

      setIsSaving(false);

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update familiar.");
        return;
      }

      const updated = result.familiar as ManagedFamiliar;

      setFamiliars((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setNotice(result.message || "Familiar updated.");
      setTimeout(() => setNotice(""), 4000);
    } catch {
      setIsSaving(false);
      setErrorMessage("Failed to update familiar.");
    }
  };

  useEffect(() => {
    loadFamiliars();
  }, []);

  useEffect(() => {
    syncForm(selectedFamiliar);
  }, [selectedFamiliar?.id]);

  if (session && session.role !== "admin") {
    return (
      <main className="space-y-6 text-slate-100">
        <section className="rounded-[34px] border border-red-300/20 bg-red-400/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
            Access Denied
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">
            Halaman ini khusus admin.
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="relative space-y-6 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_38%),linear-gradient(135deg,#02030a,#050615_48%,#02030a)]" />

      <section className="relative overflow-hidden rounded-[38px] border border-amber-300/20 bg-gradient-to-br from-[#070812]/95 via-[#050716]/95 to-violet-950/70 p-6 shadow-[0_0_90px_rgba(245,158,11,0.12)] md:p-8">
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Admin Familiar Manage
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
            Manage Familiar
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            Edit familiar yang sudah terikat ke player. Admin bisa mengubah nama,
            mood, energy, bond XP, stage, status, dan desire tanpa SQL manual.
          </p>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading familiar registry...</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      {notice ? (
        <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      {!isLoading ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-5">
            <div className="rounded-[34px] border border-white/10 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                Familiar List
              </p>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari owner / familiar / species"
                className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />

              <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
                {filteredFamiliars.map((familiar) => {
                  const active = familiar.id === selectedFamiliar?.id;

                  return (
                    <button
                      key={familiar.id}
                      onClick={() => setSelectedId(familiar.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-amber-300/35 bg-amber-400/10"
                          : "border-white/10 bg-white/[0.04] hover:border-amber-300/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <p className="font-black text-white">
                        {familiar.familiar_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Owner: {familiar.players?.character_name || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {familiar.familiar_species?.name} • Stage{" "}
                        {familiar.stage} • {familiar.bond_rank || "Common"} Bond
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-7">
            {selectedFamiliar ? (
              <>
                <section className="rounded-[34px] border border-amber-300/20 bg-black/35 p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr] md:items-center">
                    <div className="aspect-square overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
                      {getStageImage(selectedFamiliar) ? (
                        <img
                          src={getStageImage(selectedFamiliar)}
                          alt={selectedFamiliar.familiar_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl">
                          🌙
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                        Selected Familiar
                      </p>

                      <h2 className="mt-2 text-4xl font-black text-white">
                        {selectedFamiliar.familiar_name}
                      </h2>

                      <p className="mt-2 text-sm font-semibold text-amber-200">
                        Owner:{" "}
                        {selectedFamiliar.players?.character_name || "Unknown"}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {selectedFamiliar.familiar_species?.name} •{" "}
                        {selectedFamiliar.familiar_species?.role} •{" "}
                        {selectedFamiliar.familiar_species?.habitat}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[34px] border border-violet-300/20 bg-black/35 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-300">
                    Edit Familiar
                  </p>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Familiar Name
                      </label>
                      <input
                        value={familiarName}
                        onChange={(e) => setFamiliarName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <NumberInput
                        label="Mood"
                        value={mood}
                        min={0}
                        max={100}
                        onChange={setMood}
                      />
                      <NumberInput
                        label="Energy"
                        value={energy}
                        min={0}
                        max={100}
                        onChange={setEnergy}
                      />
                      <NumberInput
                        label="Bond XP"
                        value={bondXp}
                        min={0}
                        max={99999}
                        onChange={setBondXp}
                      />
                      <NumberInput
                        label="Stage"
                        value={stage}
                        min={1}
                        max={4}
                        onChange={setStage}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <QuickButton label="+10 Bond" onClick={() => setBondXp((v) => v + 10)} />
                      <QuickButton label="+50 Bond" onClick={() => setBondXp((v) => v + 50)} />
                      <QuickButton label="+100 Bond" onClick={() => setBondXp((v) => v + 100)} />
                      <QuickButton label="Full Energy" onClick={() => setEnergy(100)} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                          Relationship
                        </label>
                        <input
                          value={relationshipStatus}
                          onChange={(e) => setRelationshipStatus(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                          Desire
                        </label>
                        <input
                          value={desire}
                          onChange={(e) => setDesire(e.target.value)}
                          placeholder="wants_attention / wants_rest / wants_train / feels_attached"
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-slate-300">
                        Familiar aktif
                      </span>
                    </label>

                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full rounded-[22px] border border-amber-300/20 bg-gradient-to-r from-amber-400/20 to-violet-400/20 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-amber-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save Familiar Update"}
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <section className="rounded-[34px] border border-white/10 bg-black/35 p-6">
                <p className="text-sm text-slate-400">
                  Belum ada familiar yang bisa dikelola.
                </p>
              </section>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
      />
    </div>
  );
}

function QuickButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-300 transition hover:border-amber-300/30 hover:bg-amber-400/10 hover:text-amber-200"
    >
      {label}
    </button>
  );
}
