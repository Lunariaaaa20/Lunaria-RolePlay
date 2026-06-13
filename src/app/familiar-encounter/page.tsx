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

type SpeciesInfo = {
  id: string;
  name: string;
  slug: string;
  habitat: string;
  role: string;
  short_description: string;
  origin_story: string;
  bonding_method: string;
  stage_1_image_url: string;
  habitat_background_url: string;
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

export default function FamiliarEncounterPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [playerReport, setPlayerReport] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedEncounter = useMemo(() => {
    return (
      encounters.find((encounter) => encounter.id === selectedId) ||
      encounters[0] ||
      null
    );
  }, [encounters, selectedId]);

  const loadEncounters = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession?.playerId) {
      setIsLoading(false);
      setEncounters([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/familiar/encounter?playerId=${currentSession.playerId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load encounter.");
        setIsLoading(false);
        return;
      }

      const list = (result.encounters || []) as Encounter[];

      setEncounters(list);

      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }

      setIsLoading(false);
    } catch {
      setErrorMessage("Failed to load encounter.");
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!session?.playerId || !selectedEncounter) return;

    setNotice("");
    setErrorMessage("");

    if (playerReport.trim().length < 20) {
      setErrorMessage("Bonding report terlalu pendek. Minimal 20 karakter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/familiar/encounter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: session.playerId,
          encounterId: selectedEncounter.id,
          playerReport,
        }),
      });

      const result = await response.json();

      setIsSubmitting(false);

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to submit report.");
        return;
      }

      setNotice(result.message || "Bonding report terkirim.");
      setPlayerReport("");

      await loadEncounters();
    } catch {
      setIsSubmitting(false);
      setErrorMessage("Failed to submit report.");
    }
  };

  useEffect(() => {
    loadEncounters();
  }, []);

  useEffect(() => {
    setPlayerReport(selectedEncounter?.player_report || "");
  }, [selectedEncounter?.id]);

  return (
    <main className="relative space-y-6 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_38%),linear-gradient(135deg,#02030a,#050615_48%,#02030a)]" />

      <section className="relative overflow-hidden rounded-[38px] border border-amber-300/20 bg-gradient-to-br from-[#070812]/95 via-[#050716]/95 to-violet-950/70 p-6 shadow-[0_0_90px_rgba(245,158,11,0.12)] md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
          Lunaria Familiar Signal
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
          Familiar Encounter
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          Jika sebuah Familiar Signal muncul untukmu, ikuti bonding task dan
          tulis laporan RP singkat agar familiar dapat menilai niatmu.
        </p>
      </section>

      {isLoading ? (
        <section className="rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading familiar signal...</p>
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

      {!isLoading && !session?.playerId ? (
        <section className="rounded-[34px] border border-white/10 bg-black/35 p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
            No Session
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            Login sebagai player dulu.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Familiar Signal hanya bisa dilihat oleh player yang sudah login.
          </p>
        </section>
      ) : null}

      {!isLoading && session?.playerId && encounters.length === 0 ? (
        <section className="rounded-[34px] border border-white/10 bg-black/35 p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
            No Familiar Signal
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            Belum ada Familiar Signal untukmu.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Familiar tidak muncul begitu saja. Tunggu event, quest, atau sinyal
            dari admin.
          </p>
        </section>
      ) : null}

      {selectedEncounter ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-5">
            <section className="rounded-[34px] border border-white/10 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-300">
                Signal History
              </p>

              <div className="mt-5 space-y-3">
                {encounters.map((encounter) => (
                  <button
                    key={encounter.id}
                    onClick={() => setSelectedId(encounter.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      encounter.id === selectedEncounter.id
                        ? "border-amber-300/35 bg-amber-400/10"
                        : "border-white/10 bg-white/[0.04] hover:border-amber-300/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">
                          {encounter.signal_title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {encounter.familiar_species?.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(encounter.created_at)}
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
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6 xl:col-span-7">
            <section className="rounded-[34px] border border-amber-300/20 bg-black/35 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr] md:items-center">
                <div className="aspect-square overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
                  {selectedEncounter.familiar_species?.stage_1_image_url ? (
                    <img
                      src={selectedEncounter.familiar_species.stage_1_image_url}
                      alt={selectedEncounter.familiar_species.name}
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
                    Familiar Signal
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-white">
                    {selectedEncounter.signal_title}
                  </h2>

                  <p className="mt-2 text-sm font-semibold text-amber-200">
                    {selectedEncounter.familiar_species?.name} •{" "}
                    {selectedEncounter.familiar_species?.role}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {selectedEncounter.familiar_species?.short_description}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-sky-300/20 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
                Bonding Task
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {selectedEncounter.bonding_task}
              </p>
            </section>

            <section className="rounded-[34px] border border-emerald-300/20 bg-black/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                Bonding Report
              </p>

              {selectedEncounter.status === "active" ? (
                <>
                  <textarea
                    value={playerReport}
                    onChange={(e) => setPlayerReport(e.target.value)}
                    placeholder="Tulis RP singkat bagaimana karaktermu mendekati, merawat, atau mencoba membuat familiar ini percaya..."
                    rows={7}
                    className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                    className="mt-5 w-full rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-emerald-200 transition hover:border-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bonding Report"}
                  </button>
                </>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm leading-7 text-slate-300">
                    {selectedEncounter.player_report ||
                      "Belum ada report yang tersimpan."}
                  </p>
                </div>
              )}
            </section>

            {selectedEncounter.status === "approved" ? (
              <section className="rounded-[34px] border border-emerald-300/20 bg-emerald-400/10 p-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-200">
                  Approved
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Familiar berhasil terikat.
                </h3>
                <p className="mt-3 text-sm leading-6 text-emerald-100">
                  Buka halaman Moon Familiar untuk melihat familiar barumu.
                </p>
              </section>
            ) : null}

            {selectedEncounter.status === "submitted" ? (
              <section className="rounded-[34px] border border-amber-300/20 bg-amber-400/10 p-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200">
                  Waiting Approval
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Bonding report sudah dikirim.
                </h3>
                <p className="mt-3 text-sm leading-6 text-amber-100">
                  Tunggu admin menilai dan approve Familiar Signal ini.
                </p>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
  }
