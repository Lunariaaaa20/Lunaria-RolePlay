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

export default function AdminFamiliarGrantPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);

  const [playerId, setPlayerId] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [familiarName, setFamiliarName] = useState("");
  const [personality, setPersonality] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("Normal");
  const [desire, setDesire] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(true);

  const [searchPlayer, setSearchPlayer] = useState("");
  const [searchSpecies, setSearchSpecies] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedSpecies = useMemo(() => {
    return species.find((item) => item.id === speciesId) || null;
  }, [species, speciesId]);

  const filteredPlayers = useMemo(() => {
    const keyword = searchPlayer.toLowerCase().trim();
    if (!keyword) return players;

    return players.filter((player) =>
      [
        player.character_name,
        player.guild_rank,
        player.pathway,
        player.race,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [players, searchPlayer]);

  const filteredSpecies = useMemo(() => {
    const keyword = searchSpecies.toLowerCase().trim();
    if (!keyword) return species;

    return species.filter((item) =>
      [item.name, item.role, item.habitat, item.slug]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [species, searchSpecies]);

  const loadOptions = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    try {
      const response = await fetch("/api/admin/familiar/options", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load admin familiar data.");
        setIsLoading(false);
        return;
      }

      setPlayers(result.players || []);
      setSpecies(result.species || []);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage("Failed to load admin familiar data.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setNotice("");
    setErrorMessage("");

    if (!playerId || !speciesId) {
      setErrorMessage("Player dan species wajib dipilih.");
      return;
    }

    setSubmitLoading(true);

    try {
      const response = await fetch("/api/admin/familiar/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          speciesId,
          familiarName,
          personality,
          relationshipStatus,
          desire,
          replaceExisting,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Bind familiar gagal.");
        setSubmitLoading(false);
        return;
      }

      setNotice(result.message || "Familiar berhasil di-bind.");
      setFamiliarName("");
      setPersonality("");
      setDesire("");
      setSubmitLoading(false);
    } catch (error) {
      setErrorMessage("Bind familiar gagal.");
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
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
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Session aktif bukan admin.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative space-y-6 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_38%),linear-gradient(135deg,#02030a,#050615_48%,#02030a)]" />

      <section className="relative overflow-hidden rounded-[38px] border border-amber-300/20 bg-gradient-to-br from-[#070812]/95 via-[#050716]/95 to-violet-950/70 p-6 shadow-[0_0_90px_rgba(245,158,11,0.12)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_40%)]" />

        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Admin Familiar Control
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
            Bind Familiar
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            Admin dapat memberikan familiar ke player tanpa perlu SQL manual.
            Familiar aktif lama bisa otomatis diganti.
          </p>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading admin familiar control...</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      {!isLoading ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-[34px] border border-amber-300/20 bg-black/35 p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                Familiar Grant Form
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Search Player
                  </label>
                  <input
                    value={searchPlayer}
                    onChange={(e) => setSearchPlayer(e.target.value)}
                    placeholder="Cari nama player / rank / pathway"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>

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
                    {filteredPlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.character_name} — {player.guild_rank} /{" "}
                        {player.pathway}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Search Species
                  </label>
                  <input
                    value={searchSpecies}
                    onChange={(e) => setSearchSpecies(e.target.value)}
                    placeholder="Cari species / habitat / role"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  />
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
                    {filteredSpecies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.role} / {item.habitat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Familiar Name
                  </label>
                  <input
                    value={familiarName}
                    onChange={(e) => setFamiliarName(e.target.value)}
                    placeholder="Kosongkan kalau mau pakai nama default species"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-slate-300">
                    Nonaktifkan familiar aktif lama otomatis
                  </span>
                </label>

                {notice ? (
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
                    {notice}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full rounded-[22px] border border-amber-300/20 bg-gradient-to-r from-amber-400/20 to-violet-400/20 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-amber-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? "Binding Familiar..." : "Bind Familiar"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6 xl:col-span-5">
            <section className="rounded-[34px] border border-sky-300/20 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
                Selected Species
              </p>

              {selectedSpecies ? (
                <div className="mt-4 space-y-3">
                  <InfoLine label="Name" value={selectedSpecies.name} />
                  <InfoLine label="Role" value={selectedSpecies.role} />
                  <InfoLine label="Habitat" value={selectedSpecies.habitat} />
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Description
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {selectedSpecies.short_description || "No description."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Pilih species untuk melihat ringkasannya.
                </p>
              )}
            </section>

            <section className="rounded-[34px] border border-violet-300/20 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-300">
                Operational Notes
              </p>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p>• Satu player disarankan hanya punya satu familiar aktif.</p>
                <p>• Form ini otomatis bind ke Stage 1.</p>
                <p>• Mood, energy, dan bond memakai default awal.</p>
                <p>• Personality dan desire bisa dikosongkan untuk random.</p>
              </div>
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-black text-white">{value}</p>
    </div>
  );
}
