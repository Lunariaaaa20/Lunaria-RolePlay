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

type PlayerOption = {
  id: string;
  character_name: string;
  guild_rank: string;
  pathway: string;
  race: string;
};

type SpeciesOption = {
  id: string;
  name: string;
  slug: string;
  habitat: string;
  role: string;
  short_description: string;
};

type Encounter = {
  id: string;
  player_id: string;
  species_id: string;
  status: "active" | "submitted" | "approved" | "rejected" | "expired";
  signal_title: string;
  bonding_task: string;
  player_report: string;
  admin_note: string;
  familiar_name: string;
  personality: string;
  desire: string;
  created_at: string;
  submitted_at: string | null;
  resolved_at: string | null;
  expires_at: string;
  players: PlayerOption;
  familiar_species: SpeciesOption;
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

function getStatusClass(status: string) {
  if (status === "active") {
    return "border-sky-300/30 bg-sky-400/10 text-sky-200";
  }

  if (status === "submitted") {
    return "border-amber-300/30 bg-amber-400/10 text-amber-200";
  }

  if (status === "approved") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "rejected") {
    return "border-red-300/30 bg-red-400/10 text-red-200";
  }

  return "border-slate-300/20 bg-slate-400/10 text-slate-300";
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function FamiliarEncounterAdminPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);

  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);

  const [playerId, setPlayerId] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [signalTitle, setSignalTitle] = useState("Moon Familiar Signal");
  const [bondingTask, setBondingTask] = useState("");
  const [familiarName, setFamiliarName] = useState("");
  const [personality, setPersonality] = useState("");
  const [desire, setDesire] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedSpecies = useMemo(() => {
    return species.find((item) => item.id === speciesId) || null;
  }, [species, speciesId]);

  const filteredEncounters = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return encounters;

    return encounters.filter((item) =>
      [
        item.players?.character_name,
        item.familiar_species?.name,
        item.status,
        item.signal_title,
        item.familiar_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [encounters, search]);

  const loadAll = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    try {
      const [optionsResponse, encountersResponse] = await Promise.all([
        fetch("/api/admin/familiar/options", {
          method: "GET",
          cache: "no-store",
        }),
        fetch("/api/admin/familiar/encounter", {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      const optionsResult = await optionsResponse.json();
      const encountersResult = await encountersResponse.json();

      if (!optionsResponse.ok) {
        setErrorMessage(optionsResult.error || "Failed to load options.");
        setIsLoading(false);
        return;
      }

      if (!encountersResponse.ok) {
        setErrorMessage(encountersResult.error || "Failed to load encounters.");
        setIsLoading(false);
        return;
      }

      setPlayers(optionsResult.players || []);
      setSpecies(optionsResult.species || []);
      setEncounters(encountersResult.encounters || []);
      setIsLoading(false);
    } catch {
      setErrorMessage("Failed to load encounter admin data.");
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setNotice("");
    setErrorMessage("");

    if (!playerId || !speciesId || !bondingTask.trim()) {
      setErrorMessage("Player, species, dan bonding task wajib diisi.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/familiar/encounter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          speciesId,
          signalTitle,
          bondingTask,
          familiarName,
          personality,
          desire,
          adminNote,
        }),
      });

      const result = await response.json();

      setIsCreating(false);

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create signal.");
        return;
      }

      setNotice(result.message || "Familiar Signal berhasil dibuat.");
      setBondingTask("");
      setFamiliarName("");
      setPersonality("");
      setDesire("");
      setAdminNote("");

      await loadAll();
    } catch {
      setIsCreating(false);
      setErrorMessage("Failed to create signal.");
    }
  };

  const handleResolve = async (
    encounterId: string,
    action: "approve" | "reject" | "expire"
  ) => {
    setWorkingId(encounterId);
    setNotice("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/familiar/encounter", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encounterId,
          action,
          adminNote,
        }),
      });

      const result = await response.json();

      setWorkingId("");

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update encounter.");
        return;
      }

      setNotice(result.message || "Encounter updated.");
      await loadAll();
    } catch {
      setWorkingId("");
      setErrorMessage("Failed to update encounter.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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
        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
          Admin Familiar Signal
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
          Familiar Encounter
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          Buat Familiar Signal untuk player, tunggu bonding report, lalu approve
          agar familiar otomatis terikat ke player.
        </p>
      </section>

      {isLoading ? (
        <section className="rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading Familiar Signal system...</p>
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
          <form
            onSubmit={handleCreate}
            className="rounded-[34px] border border-amber-300/20 bg-black/35 p-6 xl:col-span-5"
          >
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              Create Signal
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Player
                </label>
                <select
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">Pilih player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.character_name} — {player.guild_rank} /{" "}
                      {player.pathway}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Familiar Species
                </label>
                <select
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">Pilih species</option>
                  {species.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.role} / {item.habitat}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSpecies ? (
                <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">
                    Selected Species
                  </p>
                  <p className="mt-2 font-black text-white">
                    {selectedSpecies.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {selectedSpecies.short_description}
                  </p>
                </div>
              ) : null}

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Signal Title
                </label>
                <input
                  value={signalTitle}
                  onChange={(e) => setSignalTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Bonding Task
                </label>
                <textarea
                  value={bondingTask}
                  onChange={(e) => setBondingTask(e.target.value)}
                  placeholder="Contoh: Dekati familiar ini pelan-pelan di Everglow Forest. Tulis RP pendek tentang cara kamu membuatnya percaya."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Familiar Name
                </label>
                <input
                  value={familiarName}
                  onChange={(e) => setFamiliarName(e.target.value)}
                  placeholder="Kosongkan untuk pakai nama species"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Personality
                  </label>
                  <input
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="Opsional"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Desire
                  </label>
                  <input
                    value={desire}
                    onChange={(e) => setDesire(e.target.value)}
                    placeholder="Opsional"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Admin Note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Opsional. Catatan admin untuk signal ini."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-[22px] border border-amber-300/20 bg-gradient-to-r from-amber-400/20 to-violet-400/20 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-amber-300/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Creating Signal..." : "Create Familiar Signal"}
              </button>
            </div>
          </form>

          <div className="space-y-5 xl:col-span-7">
            <section className="rounded-[34px] border border-white/10 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-300">
                Encounter Registry
              </p>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari player / familiar / status"
                className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />

              <div className="mt-5 space-y-4">
                {filteredEncounters.length ? (
                  filteredEncounters.map((encounter) => (
                    <div
                      key={encounter.id}
                      className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-white">
                            {encounter.signal_title}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {encounter.players?.character_name || "Unknown"} →{" "}
                            {encounter.familiar_species?.name || "Unknown"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Created: {formatDate(encounter.created_at)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusClass(
                            encounter.status
                          )}`}
                        >
                          {encounter.status}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                          Bonding Task
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {encounter.bonding_task}
                        </p>
                      </div>

                      {encounter.player_report ? (
                        <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                            Player Report
                          </p>
                          <p className="mt-2 text-sm leading-6 text-emerald-100">
                            {encounter.player_report}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                            Player Report
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            Belum ada laporan dari player.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                          type="button"
                          disabled={Boolean(workingId)}
                          onClick={() => handleResolve(encounter.id, "approve")}
                          className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-emerald-200 disabled:opacity-50"
                        >
                          {workingId === encounter.id ? "Working..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(workingId)}
                          onClick={() => handleResolve(encounter.id, "reject")}
                          className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(workingId)}
                          onClick={() => handleResolve(encounter.id, "expire")}
                          className="rounded-2xl border border-slate-300/20 bg-slate-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-300 disabled:opacity-50"
                        >
                          Expire
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    Belum ada Familiar Signal.
                  </p>
                )}
              </div>
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
    }
