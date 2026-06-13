"use client";

import React, { useEffect, useMemo, useState } from "react";

type LobbyMessage = {
  id: string;
  familiar_id: string | null;
  familiar_name: string;
  species_name: string | null;
  avatar_url: string | null;
  intent: string;
  tone: string;
  message: string;
  mood_snapshot: string | null;
  energy_snapshot: number | null;
  created_at: string;
};

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function getInitial(name: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "?";
}

function getToneLabel(tone: string) {
  const clean = tone || "casual";

  const labels: Record<string, string> = {
    jahil: "Jahil",
    galak: "Galak",
    tenang: "Tenang",
    sombong: "Sombong",
    ngantuk: "Ngantuk",
    ceria: "Ceria",
    lapar: "Lapar",
    rahasia: "Rahasia",
    santai: "Santai",
    penasaran: "Penasaran",
    iseng: "Iseng",
    random: "Random",
  };

  return labels[clean] || clean;
}

export default function FamiliarLobbyPage() {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulseText, setPulseText] = useState("Waking up familiar lobby...");
  const [lastGenerated, setLastGenerated] = useState<number | null>(null);

  async function loadMessages(showLoading = false) {
    if (showLoading) setLoading(true);

    try {
      const res = await fetch("/api/familiar-lobby/list", {
        cache: "no-store",
      });

      const json = await res.json();

      if (json.ok) {
        setMessages(json.messages ?? []);
      }
    } catch {
      setPulseText("Lobby signal is unstable...");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function runTick() {
    try {
      setPulseText("The familiars are thinking...");

      const res = await fetch("/api/familiar-lobby/tick", {
        method: "POST",
      });

      const json = await res.json();

      if (json.ok) {
        setLastGenerated(json.generated ?? 0);

        if ((json.generated ?? 0) > 0) {
          setPulseText("New familiar whispers appeared.");
        } else {
          setPulseText(json.reason || "The lobby is quiet for now.");
        }
      } else {
        setPulseText("The familiar lobby failed to respond.");
      }
    } catch {
      setPulseText("The familiar lobby lost its signal.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setLoading(true);
      await runTick();

      if (!cancelled) {
        await loadMessages(false);
        setLoading(false);
      }
    }

    boot();

    const interval = window.setInterval(async () => {
      await runTick();
      await loadMessages(false);
    }, 28000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const latestPlanLikeMessage = useMemo(() => {
    return [...messages].reverse().find((message) => message.intent === "plan");
  }, [messages]);

  return (
    <div className="min-h-screen space-y-6 text-slate-100">
      <section className="overflow-hidden rounded-[32px] border border-amber-300/20 bg-black/35 p-5 shadow-[0_0_80px_rgba(245,158,11,0.08)] backdrop-blur-xl md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
              Lunaria Familiar Lobby
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Familiar Lobby
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Ruang obrolan otomatis para familiar. Tidak ada input manual dari
              player atau admin — mereka berbicara sendiri berdasarkan mood,
              personality, energy, dan kemauan kecil mereka.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
              </span>
              <span className="font-bold text-emerald-200">Live Pulse</span>
            </div>

            <p className="mt-2 text-xs text-slate-400">{pulseText}</p>

            {lastGenerated !== null && (
              <p className="mt-1 text-xs text-slate-500">
                Last tick: {lastGenerated} message
                {lastGenerated === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>
      </section>

      {latestPlanLikeMessage && (
        <section className="rounded-[28px] border border-violet-300/20 bg-violet-950/20 p-5 shadow-[0_0_60px_rgba(124,58,237,0.10)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-200">
            Active Whisper
          </p>

          <p className="mt-3 text-sm leading-6 text-violet-100">
            Ada familiar yang tampaknya sedang merencanakan sesuatu. Tidak jelas
            serius atau cuma cari masalah kecil.
          </p>

          <p className="mt-3 rounded-2xl border border-violet-200/10 bg-black/20 p-4 text-sm italic text-slate-200">
            “{latestPlanLikeMessage.message}”
          </p>
        </section>
      )}

      <section className="rounded-[32px] border border-white/10 bg-black/30 p-4 shadow-[0_0_80px_rgba(15,23,42,0.35)] backdrop-blur-xl md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white">
              Familiar Group Chat
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Chat berjalan otomatis setiap beberapa saat. Tidak ada kolom
              ketik untuk manusia.
            </p>
          </div>

          <button
            onClick={() => loadMessages(true)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm font-bold text-slate-300">
              Opening familiar lobby...
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Para familiar sedang mencari tempat duduk paling dramatis.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm font-bold text-slate-300">
              Lobby masih sunyi.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Tunggu beberapa detik. Familiar pertama biasanya pura-pura tidak
              ingin bicara.
            </p>
          </div>
        ) : (
          <div className="max-h-[680px] space-y-4 overflow-y-auto pr-1">
            {messages.map((item) => (
              <article
                key={item.id}
                className="rounded-[28px] border border-white/10 bg-white/[0.035] p-4 transition hover:border-amber-300/20 hover:bg-white/[0.055]"
              >
                <div className="flex gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-amber-200/20 bg-black/40">
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt={item.familiar_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-black text-amber-200">
                        {getInitial(item.familiar_name)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-white">
                        {item.familiar_name}
                      </h3>

                      {item.species_name && (
                        <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          {item.species_name}
                        </span>
                      )}

                      <span className="rounded-full border border-amber-300/15 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200">
                        {getToneLabel(item.tone)}
                      </span>

                      <span className="ml-auto text-xs text-slate-500">
                        {formatTime(item.created_at)}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                      {item.message}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      <span>Intent: {item.intent}</span>
                      {item.mood_snapshot && <span>• Mood: {item.mood_snapshot}</span>}
                      {item.energy_snapshot !== null && (
                        <span>• Energy: {item.energy_snapshot}</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
                  }
