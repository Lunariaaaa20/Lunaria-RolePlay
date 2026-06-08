"use client";

import React, { useMemo, useState } from "react";

const pendingRegistrations = [
  {
    id: "REG-001",
    name: "Mira Veyl",
    race: "Human",
    pathway: "Nature",
    submittedAt: "Today, 09:20",
    status: "Pending",
  },
  {
    id: "REG-002",
    name: "Kael Ardent",
    race: "Elf",
    pathway: "Mystic",
    submittedAt: "Today, 10:45",
    status: "Pending",
  },
  {
    id: "REG-003",
    name: "Riven Noct",
    race: "Feyling",
    pathway: "Shadow",
    submittedAt: "Yesterday, 21:10",
    status: "Pending",
  },
];

const playerRegistry = [
  {
    id: "ADV-001",
    name: "Aether Veyl",
    rank: "Initiate",
    pathway: "Mystic",
    silver: 10,
    common: 12,
    uncommon: 4,
    dangerous: 1,
    special: 0,
  },
  {
    id: "ADV-002",
    name: "Qin Shi Huang",
    rank: "Seeker",
    pathway: "Warrior",
    silver: 42,
    common: 9,
    uncommon: 7,
    dangerous: 2,
    special: 0,
  },
  {
    id: "ADV-003",
    name: "Anila van Haldegar",
    rank: "Warden",
    pathway: "Shadow",
    silver: 76,
    common: 15,
    uncommon: 5,
    dangerous: 3,
    special: 1,
  },
];

const rankOptions = ["Initiate", "Seeker", "Warden", "Arbiter", "High Council"];

function calculatePoints(player: {
  common: number;
  uncommon: number;
  dangerous: number;
  special: number;
}) {
  return (
    player.common * 10 +
    player.uncommon * 25 +
    player.dangerous * 60 +
    player.special * 120
  );
}

function generateAccessCode(name: string) {
  const clean = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${clean}-${random}`;
}

export default function LunariaAdminPanel() {
  const [approvedCodes, setApprovedCodes] = useState<Record<string, string>>({});
  const [selectedPlayer, setSelectedPlayer] = useState(playerRegistry[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const leaderboard = useMemo(() => {
    return [...playerRegistry]
      .map((player) => ({
        ...player,
        points: calculatePoints(player),
      }))
      .sort((a, b) => b.points - a.points);
  }, []);

  const approveRegistration = (id: string, name: string) => {
    const code = generateAccessCode(name);

    setApprovedCodes((prev) => ({
      ...prev,
      [id]: code,
    }));
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode(null);
    }, 1800);
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          Lunaria Control Center
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Admin Panel
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Panel admin untuk approve registrasi, membuat access code, update
              ID card, mengatur currency, dan memantau quest point adventurer.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
            Admin Mode Active
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Registration" value="3" tone="text-amber-300" />
        <StatCard label="Active Adventurers" value="128" tone="text-emerald-300" />
        <StatCard label="Generated Codes" value={String(Object.keys(approvedCodes).length)} tone="text-sky-300" />
        <StatCard label="Currency Logs" value="256" tone="text-violet-300" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-[32px] border border-amber-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
              Registration Queue
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Pending Approval
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Setelah admin approve, sistem membuat access code. Code ini nanti
              dikirim admin ke player untuk login.
            </p>
          </div>

          <div className="space-y-4">
            {pendingRegistrations.map((request) => {
              const code = approvedCodes[request.id];

              return (
                <div
                  key={request.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                          {request.id}
                        </span>
                        <span className="rounded-full border border-slate-400/20 bg-slate-400/10 px-3 py-1 text-xs font-bold text-slate-300">
                          {request.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-black text-white">
                        {request.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {request.race} • {request.pathway} • Submitted{" "}
                        {request.submittedAt}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {!code ? (
                        <button
                          onClick={() =>
                            approveRegistration(request.id, request.name)
                          }
                          className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-emerald-300 transition hover:bg-emerald-400/20"
                        >
                          Approve
                        </button>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-sky-400/25 bg-sky-400/10 px-5 py-3 text-center">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-sky-300">
                              Access Code
                            </p>
                            <p className="mt-1 font-black text-white">{code}</p>
                          </div>

                          <button
                            onClick={() => copyCode(code)}
                            className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-amber-300 transition hover:bg-amber-500/20"
                          >
                            {copiedCode === code ? "Copied" : "Copy"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-5 rounded-[32px] border border-violet-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(124,58,237,0.10)]">
          <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
            Edit Adventurer
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            ID Card Control
          </h2>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Select Player
              </span>
              <select
                value={selectedPlayer.id}
                onChange={(event) => {
                  const next = playerRegistry.find(
                    (player) => player.id === event.target.value
                  );

                  if (next) {
                    setSelectedPlayer(next);
                  }
                }}
                className="lunaria-admin-input"
              >
                {playerRegistry.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>

            <AdminField label="Character Name" value={selectedPlayer.name} />
            <AdminField label="Pathway" value={selectedPlayer.pathway} />

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Guild Rank
              </span>
              <select value={selectedPlayer.rank} className="lunaria-admin-input" readOnly>
                {rankOptions.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <AdminSmallField label="Silver" value={String(selectedPlayer.silver)} />
              <AdminSmallField label="Common" value={String(selectedPlayer.common)} />
              <AdminSmallField label="Uncommon" value={String(selectedPlayer.uncommon)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AdminSmallField label="Dangerous" value={String(selectedPlayer.dangerous)} />
              <AdminSmallField label="Special" value={String(selectedPlayer.special)} />
            </div>

            <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                Current Points
              </p>
              <p className="mt-2 text-4xl font-black text-amber-200">
                {calculatePoints(selectedPlayer)}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Common × 10, Uncommon × 25, Dangerous × 60, Special × 120.
              </p>
            </div>

            <button className="w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-violet-600/20 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Save Update Later
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
              Adventurer Registry
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Player Database Preview
            </h2>
          </div>

          <p className="text-sm text-slate-400">
            Data masih static. Setelah Supabase aktif, tabel ini akan real-time.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Pathway</th>
                <th className="px-4 py-2">Silver</th>
                <th className="px-4 py-2">Quest Record</th>
                <th className="px-4 py-2">Points</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.map((player) => (
                <tr
                  key={player.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] text-sm"
                >
                  <td className="rounded-l-2xl px-4 py-4 text-slate-400">
                    {player.id}
                  </td>
                  <td className="px-4 py-4 font-black text-white">
                    {player.name}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                      {player.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {player.pathway}
                  </td>
                  <td className="px-4 py-4 text-amber-300">
                    {player.silver} S
                  </td>
                  <td className="px-4 py-4 text-slate-400">
                    C {player.common} / U {player.uncommon} / D{" "}
                    {player.dangerous} / S {player.special}
                  </td>
                  <td className="rounded-r-2xl px-4 py-4 font-black text-emerald-300">
                    {player.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .lunaria-admin-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(0, 0, 0, 0.28);
          padding: 0.85rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
        }

        .lunaria-admin-input:focus {
          border-color: rgba(245, 158, 11, 0.45);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        select.lunaria-admin-input option {
          background: #070812;
          color: white;
        }
      `}</style>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-4xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function AdminField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <input value={value} readOnly className="lunaria-admin-input" />
    </label>
  );
}

function AdminSmallField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <input value={value} readOnly className="lunaria-admin-input" />
    </label>
  );
}
