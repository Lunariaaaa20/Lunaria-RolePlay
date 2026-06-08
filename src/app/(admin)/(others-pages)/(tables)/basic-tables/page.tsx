"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const rankOptions = ["Initiate", "Seeker", "Warden", "Arbiter", "High Council"];
const pathwayOptions = ["Warrior", "Mystic", "Shadow", "Nature"];
const raceOptions = ["Human", "Elf", "Fairy", "Feyling", "Furry", "Dwarf"];

type RegistrationRequest = {
  id: string;
  character_name: string;
  race: string;
  pathway: string;
  skill_1: string;
  skill_2: string;
  inventory_1: string;
  inventory_2: string;
  inventory_3: string;
  notes: string;
  status: string;
  created_at: string;
};

type Player = {
  id: string;
  registration_request_id: string | null;
  username: string;
  access_code: string;
  character_name: string;
  race: string;
  guild_rank: string;
  pathway: string;
  mission: string;
  skill_1: string;
  skill_2: string;
  inventory_1: string;
  inventory_2: string;
  inventory_3: string;
  gold: number;
  silver: number;
  bronze: number;
  common_quests: number;
  uncommon_quests: number;
  dangerous_quests: number;
  special_quests: number;
  photo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function calculatePoints(player: {
  common_quests: number;
  uncommon_quests: number;
  dangerous_quests: number;
  special_quests: number;
}) {
  return (
    player.common_quests * 10 +
    player.uncommon_quests * 25 +
    player.dangerous_quests * 60 +
    player.special_quests * 120
  );
}

function generateAccessCode(name: string) {
  const clean = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${clean || "ADV"}-${random}`;
}

function generateUsername(name: string) {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 14);

  const random = Math.floor(100 + Math.random() * 900);

  return `${clean || "adventurer"}${random}`;
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LunariaAdminPanel() {
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) || players[0];

  const leaderboard = useMemo(() => {
    return [...players]
      .map((player) => ({
        ...player,
        points: calculatePoints(player),
      }))
      .sort((a, b) => b.points - a.points);
  }, [players]);

  const pendingRegistrations = useMemo(() => {
    return registrations.filter((item) => item.status === "pending");
  }, [registrations]);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2600);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const [registrationResult, playerResult] = await Promise.all([
      supabase
        .from("registration_requests")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (registrationResult.error) {
      showError(`Failed to fetch registrations: ${registrationResult.error.message}`);
    } else {
      setRegistrations(registrationResult.data || []);
    }

    if (playerResult.error) {
      showError(`Failed to fetch players: ${playerResult.error.message}`);
    } else {
      const data = playerResult.data || [];
      setPlayers(data);

      if (!selectedPlayerId && data.length > 0) {
        setSelectedPlayerId(data[0].id);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateSelectedPlayer = (key: keyof Player, value: string | number) => {
    if (!selectedPlayer) return;

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === selectedPlayer.id
          ? {
              ...player,
              [key]: value,
            }
          : player
      )
    );
  };

  const approveRegistration = async (request: RegistrationRequest) => {
    setIsApproving(request.id);
    setErrorMessage("");

    const accessCode = generateAccessCode(request.character_name);
    const username = generateUsername(request.character_name);

    const { data: newPlayer, error: insertError } = await supabase
      .from("players")
      .insert({
        registration_request_id: request.id,
        username,
        access_code: accessCode,
        character_name: request.character_name,
        race: request.race,
        guild_rank: "Initiate",
        pathway: request.pathway,
        mission: "Active Guild Registration",
        skill_1: request.skill_1,
        skill_2: request.skill_2,
        inventory_1: request.inventory_1 || "",
        inventory_2: request.inventory_2 || "",
        inventory_3: request.inventory_3 || "",
        gold: 0,
        silver: 10,
        bronze: 0,
        common_quests: 0,
        uncommon_quests: 0,
        dangerous_quests: 0,
        special_quests: 0,
        photo_url: "",
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      setIsApproving(null);
      showError(`Approve failed: ${insertError.message}`);
      return;
    }

    const { error: updateError } = await supabase
      .from("registration_requests")
      .update({ status: "approved" })
      .eq("id", request.id);

    if (updateError) {
      setIsApproving(null);
      showError(`Status update failed: ${updateError.message}`);
      return;
    }

    await supabase.from("access_logs").insert({
      player_id: newPlayer.id,
      action: "approved_registration",
      access_code: accessCode,
    });

    setPlayers((prev) => [newPlayer, ...prev]);
    setSelectedPlayerId(newPlayer.id);

    setRegistrations((prev) =>
      prev.map((item) =>
        item.id === request.id ? { ...item, status: "approved" } : item
      )
    );

    setIsApproving(null);
    showNotice(`Approved ${request.character_name}. Access Code: ${accessCode}`);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showNotice("Access code copied.");

    setTimeout(() => {
      setCopiedCode(null);
    }, 1800);
  };

  const handleSave = async () => {
    if (!selectedPlayer) {
      showError("No player selected.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("players")
      .update({
        character_name: selectedPlayer.character_name,
        race: selectedPlayer.race,
        guild_rank: selectedPlayer.guild_rank,
        pathway: selectedPlayer.pathway,
        mission: selectedPlayer.mission,
        skill_1: selectedPlayer.skill_1,
        skill_2: selectedPlayer.skill_2,
        inventory_1: selectedPlayer.inventory_1,
        inventory_2: selectedPlayer.inventory_2,
        inventory_3: selectedPlayer.inventory_3,
        gold: selectedPlayer.gold,
        silver: selectedPlayer.silver,
        bronze: selectedPlayer.bronze,
        common_quests: selectedPlayer.common_quests,
        uncommon_quests: selectedPlayer.uncommon_quests,
        dangerous_quests: selectedPlayer.dangerous_quests,
        special_quests: selectedPlayer.special_quests,
      })
      .eq("id", selectedPlayer.id);

    setIsSaving(false);

    if (error) {
      showError(`Save failed: ${error.message}`);
      return;
    }

    showNotice("Player ID Card updated in Supabase.");
    fetchData();
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

          <button
            onClick={fetchData}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300"
          >
            Refresh Data
          </button>
        </div>
      </section>

      {notice ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200 shadow-[0_0_30px_rgba(52,211,153,0.08)]">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[24px] border border-red-400/25 bg-red-400/10 p-5 text-red-200 shadow-[0_0_30px_rgba(248,113,113,0.08)]">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[24px] border border-sky-400/25 bg-sky-400/10 p-5 text-sky-200">
          <p className="text-sm font-bold">Loading Supabase data...</p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Registration"
          value={String(pendingRegistrations.length)}
          tone="text-amber-300"
        />
        <StatCard
          label="Active Adventurers"
          value={String(players.length)}
          tone="text-emerald-300"
        />
        <StatCard
          label="Approved Requests"
          value={String(
            registrations.filter((item) => item.status === "approved").length
          )}
          tone="text-sky-300"
        />
        <StatCard label="Currency Logs" value="Live Soon" tone="text-violet-300" />
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
              Data diambil langsung dari tabel Supabase registration_requests.
            </p>
          </div>

          <div className="space-y-4">
            {pendingRegistrations.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-slate-400">
                No pending registrations.
              </div>
            ) : (
              pendingRegistrations.map((request) => (
                <div
                  key={request.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                          {request.id.slice(0, 8)}
                        </span>
                        <span className="rounded-full border border-slate-400/20 bg-slate-400/10 px-3 py-1 text-xs font-bold text-slate-300">
                          {request.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-black text-white">
                        {request.character_name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {request.race} • {request.pathway} • Submitted{" "}
                        {formatDate(request.created_at)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Skills: {request.skill_1} / {request.skill_2}
                      </p>
                    </div>

                    <button
                      onClick={() => approveRegistration(request)}
                      disabled={isApproving === request.id}
                      className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isApproving === request.id ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-violet-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(124,58,237,0.10)] xl:col-span-5">
          <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
            Edit Adventurer
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            ID Card Control
          </h2>

          {!selectedPlayer ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-slate-400">
              No active player yet. Approve a registration first.
            </div>
          ) : (
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
                      {player.character_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
                  Login Access
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoBox label="Username" value={selectedPlayer.username} />
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Access Code
                    </p>
                    <p className="mt-2 font-black text-white">
                      {selectedPlayer.access_code}
                    </p>
                    <button
                      onClick={() => copyCode(selectedPlayer.access_code)}
                      className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-300"
                    >
                      {copiedCode === selectedPlayer.access_code
                        ? "Copied"
                        : "Copy Code"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminInput
                  label="Character Name"
                  value={selectedPlayer.character_name}
                  onChange={(value) =>
                    updateSelectedPlayer("character_name", value)
                  }
                />

                <SelectField
                  label="Race"
                  value={selectedPlayer.race}
                  options={raceOptions}
                  onChange={(value) => updateSelectedPlayer("race", value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Guild Rank"
                  value={selectedPlayer.guild_rank}
                  options={rankOptions}
                  onChange={(value) => updateSelectedPlayer("guild_rank", value)}
                />

                <SelectField
                  label="Pathway"
                  value={selectedPlayer.pathway}
                  options={pathwayOptions}
                  onChange={(value) => updateSelectedPlayer("pathway", value)}
                />
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
                    value={selectedPlayer.skill_1}
                    onChange={(value) => updateSelectedPlayer("skill_1", value)}
                  />
                  <AdminInput
                    label="Skill 2"
                    value={selectedPlayer.skill_2}
                    onChange={(value) => updateSelectedPlayer("skill_2", value)}
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
                    value={selectedPlayer.inventory_1}
                    onChange={(value) =>
                      updateSelectedPlayer("inventory_1", value)
                    }
                  />
                  <AdminInput
                    label="Inventory 2"
                    value={selectedPlayer.inventory_2}
                    onChange={(value) =>
                      updateSelectedPlayer("inventory_2", value)
                    }
                  />
                  <AdminInput
                    label="Inventory 3"
                    value={selectedPlayer.inventory_3}
                    onChange={(value) =>
                      updateSelectedPlayer("inventory_3", value)
                    }
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
                    value={selectedPlayer.common_quests}
                    onChange={(value) =>
                      updateSelectedPlayer("common_quests", value)
                    }
                  />
                  <AdminNumberInput
                    label="Uncommon"
                    value={selectedPlayer.uncommon_quests}
                    onChange={(value) =>
                      updateSelectedPlayer("uncommon_quests", value)
                    }
                  />
                  <AdminNumberInput
                    label="Dangerous"
                    value={selectedPlayer.dangerous_quests}
                    onChange={(value) =>
                      updateSelectedPlayer("dangerous_quests", value)
                    }
                  />
                  <AdminNumberInput
                    label="Special"
                    value={selectedPlayer.special_quests}
                    onChange={(value) =>
                      updateSelectedPlayer("special_quests", value)
                    }
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
                disabled={isSaving}
                className="w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-violet-600/20 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Update"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
              Adventurer Registry
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Player Database
            </h2>
          </div>

          <p className="text-sm text-slate-400">
            Data diambil langsung dari tabel Supabase players.
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
                    {player.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-4 font-black text-white">
                    {player.character_name}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                      {player.guild_rank}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {player.pathway}
                  </td>
                  <td className="px-4 py-4 text-amber-300">
                    {player.gold}G / {player.silver}S / {player.bronze}B
                  </td>
                  <td className="px-4 py-4 text-slate-400">
                    C {player.common_quests} / U {player.uncommon_quests} / D{" "}
                    {player.dangerous_quests} / S {player.special_quests}
                  </td>
                  <td className="rounded-r-2xl px-4 py-4 font-black text-emerald-300">
                    {player.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {players.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-slate-400">
              No approved players yet.
            </div>
          ) : null}
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-black text-white">{value}</p>
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="lunaria-admin-input"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
