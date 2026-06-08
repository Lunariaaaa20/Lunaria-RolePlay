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

const initialPlayers = [
  {
    id: "ADV-001",
    name: "Aether Veyl",
    race: "Human",
    rank: "Initiate",
    pathway: "Mystic",
    mission: "Active Guild Registration",
    skill1: "Arcane Thread",
    skill2: "Silent Ember",
    inventory1: "Beginner Cloak",
    inventory2: "Small Mana Vial",
    inventory3: "Guild Token",
    gold: 0,
    silver: 10,
    bronze: 0,
    common: 12,
    uncommon: 4,
    dangerous: 1,
    special: 0,
  },
  {
    id: "ADV-002",
    name: "Qin Shi Huang",
    race: "Human",
    rank: "Seeker",
    pathway: "Warrior",
    mission: "Glass Bridge Patrol",
    skill1: "Imperial Strike",
    skill2: "Iron Body",
    inventory1: "Training Blade",
    inventory2: "Travel Ration",
    inventory3: "Guild Token",
    gold: 0,
    silver: 42,
    bronze: 0,
    common: 9,
    uncommon: 7,
    dangerous: 2,
    special: 0,
  },
  {
    id: "ADV-003",
    name: "Anila van Haldegar",
    race: "Elf",
    rank: "Warden",
    pathway: "Shadow",
    mission: "Royal District Surveillance",
    skill1: "Silent Step",
    skill2: "Abyss Cut",
    inventory1: "Dark Cloak",
    inventory2: "Poison Needle",
    inventory3: "Guild Token",
    gold: 0,
    silver: 76,
    bronze: 0,
    common: 15,
    uncommon: 5,
    dangerous: 3,
    special: 1,
  },
];

const rankOptions = ["Initiate", "Seeker", "Warden", "Arbiter", "High Council"];
const pathwayOptions = ["Warrior", "Mystic", "Shadow", "Nature"];
const raceOptions = ["Human", "Elf", "Fairy", "Feyling", "Furry", "Dwarf"];

type Player = (typeof initialPlayers)[number];

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
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayers[0].id);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) || players[0];

  const leaderboard = useMemo(() => {
    return [...players]
      .map((player) => ({
        ...player,
        points: calculatePoints(player),
      }))
      .sort((a, b) => b.points - a.points);
  }, [players]);

  const updateSelectedPlayer = (key: keyof Player, value: string | number) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === selectedPlayerId
          ? {
              ...player,
              [key]: value,
            }
          : player
      )
    );
  };

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

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
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
              ID card, rank, skill, inventory, currency, dan quest record.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
            Admin Mode Active
          </div>
        </div>
      </section>

      {saved ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200 shadow-[0_0_30px_rgba(52,211,153,0.08)]">
          <p className="text-sm font-bold">
            Update saved locally. Setelah Supabase aktif, data ini akan tersimpan permanen ke database.
          </p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Registration" value="3" tone="text-amber-300" />
        <StatCard label="Active Adventurers" value={String(players.length)} tone="text-emerald-300" />
        <StatCard
          label="Generated Codes"
          value={String(Object.keys(approvedCodes).length)}
          tone="text-sky-300"
        />
        <StatCard label="Currency Logs" value="256" tone="text-violet-300" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-[32px] border border-amber-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)] xl:col-span-7">
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

        <div className="rounded-[32px] border border-violet-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(124,58,237,0.10)] xl:col-span-5">
          <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
            Edit Adventurer
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            ID Card Control
          </h2>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Select Player
              </span>
              <select
                value={selectedPlayerId}
                onChange={(event) => setSelectedPlayerId(event.target.value)}
                className="lunaria-admin-input"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdminInput
                label="Character Name"
                value={selectedPlayer.name}
                onChange={(value) => updateSelectedPlayer("name", value)}
              />

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Race
                </span>
                <select
                  value={selectedPlayer.race}
                  onChange={(event) => updateSelectedPlayer("race", event.target.value)}
                  className="lunaria-admin-input"
                >
                  {raceOptions.map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Guild Rank
                </span>
                <select
                  value={selectedPlayer.rank}
                  onChange={(event) => updateSelectedPlayer("rank", event.target.value)}
                  className="lunaria-admin-input"
                >
                  {rankOptions.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Pathway
                </span>
                <select
                  value={selectedPlayer.pathway}
                  onChange={(event) => updateSelectedPlayer("pathway", event.target.value)}
                  className="lunaria-admin-input"
                >
                  {pathwayOptions.map((pathway) => (
                    <option key={pathway} value={pathway}>
                      {pathway}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <AdminInput
              label="Mission"
              value={selectedPlayer.mission}
              onChange={(value) => updateSelectedPlayer("mission", value)}
            />

            <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-amber-300">
                Primary Skills
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminInput
                  label="Skill 1"
                  value={selectedPlayer.skill1}
                  onChange={(value) => updateSelectedPlayer("skill1", value)}
                />
                <AdminInput
                  label="Skill 2"
                  value={selectedPlayer.skill2}
                  onChange={(value) => updateSelectedPlayer("skill2", value)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-sky-300">
                Inventory
              </p>

              <div className="grid grid-cols-1 gap-4">
                <AdminInput
                  label="Inventory 1"
                  value={selectedPlayer.inventory1}
                  onChange={(value) => updateSelectedPlayer("inventory1", value)}
                />
                <AdminInput
                  label="Inventory 2"
                  value={selectedPlayer.inventory2}
                  onChange={(value) => updateSelectedPlayer("inventory2", value)}
                />
                <AdminInput
                  label="Inventory 3"
                  value={selectedPlayer.inventory3}
                  onChange={(value) => updateSelectedPlayer("inventory3", value)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Currency
              </p>

              <div className="grid grid-cols-3 gap-3">
                <AdminNumberInput
                  label="Gold"
                  value={selectedPlayer.gold}
                  onChange={(value) => updateSelectedPlayer("gold", value)}
                />
                <AdminNumberInput
                  label="Silver"
                  value={selectedPlayer.silver}
                  onChange={(value) => updateSelectedPlayer("silver", value)}
                />
                <AdminNumberInput
                  label="Bronze"
                  value={selectedPlayer.bronze}
                  onChange={(value) => updateSelectedPlayer("bronze", value)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-violet-300">
                Quest Record
              </p>

              <div className="grid grid-cols-2 gap-3">
                <AdminNumberInput
                  label="Common"
                  value={selectedPlayer.common}
                  onChange={(value) => updateSelectedPlayer("common", value)}
                />
                <AdminNumberInput
                  label="Uncommon"
                  value={selectedPlayer.uncommon}
                  onChange={(value) => updateSelectedPlayer("uncommon", value)}
                />
                <AdminNumberInput
                  label="Dangerous"
                  value={selectedPlayer.dangerous}
                  onChange={(value) => updateSelectedPlayer("dangerous", value)}
                />
                <AdminNumberInput
                  label="Special"
                  value={selectedPlayer.special}
                  onChange={(value) => updateSelectedPlayer("special", value)}
                />
              </div>
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

            <button
              onClick={handleSave}
              className="w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-violet-600/20 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 transition hover:bg-amber-500/20"
            >
              Save Update
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
            Data masih local state. Setelah Supabase aktif, tabel ini akan tersimpan permanen.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Pathway</th>
                <th className="px-4 py-2">Currency</th>
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
                    {player.gold}G / {player.silver}S / {player.bronze}B
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

        .lunaria-admin-input::placeholder {
          color: rgb(100, 116, 139);
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

function AdminInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="lunaria-admin-input"
      />
    </label>
  );
}

function AdminNumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="lunaria-admin-input"
      />
    </label>
  );
}
