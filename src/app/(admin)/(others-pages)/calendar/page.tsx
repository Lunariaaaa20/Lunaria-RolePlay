"use client";

import React, { useMemo, useState } from "react";

type HistoryLog = {
  id: string;
  mode: string;
  detail: string;
  result: string;
  amount: number;
  tone: "win" | "lose" | "neutral";
};

const spinOptions = [
  {
    label: "1x Spin",
    count: 1,
    cost: 5,
  },
  {
    label: "5x Spin",
    count: 5,
    cost: 25,
  },
  {
    label: "8x Spin",
    count: 8,
    cost: 40,
  },
];

const numberOptions = ["01", "07", "13", "21", "34", "55", "89"];

function getSpinResult() {
  const roll = Math.random();

  if (roll < 0.38) {
    return {
      label: "Lost",
      reward: 0,
      tone: "lose" as const,
    };
  }

  if (roll < 0.58) {
    return {
      label: "Small Return",
      reward: 3,
      tone: "neutral" as const,
    };
  }

  if (roll < 0.76) {
    return {
      label: "Break Even",
      reward: 5,
      tone: "neutral" as const,
    };
  }

  if (roll < 0.92) {
    return {
      label: "Minor Win",
      reward: 9,
      tone: "win" as const,
    };
  }

  return {
    label: "Rare Win",
    reward: 18,
    tone: "win" as const,
  };
}

function calculateDuelResult(playerNumber: string, bet: number) {
  const winningNumber = numberOptions[Math.floor(Math.random() * numberOptions.length)];

  if (playerNumber === winningNumber) {
    return {
      winningNumber,
      reward: bet * 2,
      result: "Win",
      tone: "win" as const,
    };
  }

  const nearMiss =
    Math.abs(Number(playerNumber) - Number(winningNumber)) <= 6;

  if (nearMiss) {
    return {
      winningNumber,
      reward: Math.floor(bet / 2),
      result: "Partial Return",
      tone: "neutral" as const,
    };
  }

  return {
    winningNumber,
    reward: 0,
    result: "Lose",
    tone: "lose" as const,
  };
}

export default function LunariaFortuneHall() {
  const [silver, setSilver] = useState(120);
  const [selectedNumber, setSelectedNumber] = useState("07");
  const [duelBet, setDuelBet] = useState(15);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<HistoryLog[]>([
    {
      id: "LOG-001",
      mode: "Fortune Spin",
      detail: "1x Spin",
      result: "Minor Win",
      amount: 4,
      tone: "win",
    },
    {
      id: "LOG-002",
      mode: "Daily Number Duel",
      detail: "Number 21",
      result: "Lose",
      amount: -15,
      tone: "lose",
    },
  ]);

  const totalWins = useMemo(() => {
    return history.filter((item) => item.tone === "win").length;
  }, [history]);

  const totalLosses = useMemo(() => {
    return history.filter((item) => item.tone === "lose").length;
  }, [history]);

  const addHistory = (log: Omit<HistoryLog, "id">) => {
    setHistory((prev) => [
      {
        id: `LOG-${String(prev.length + 1).padStart(3, "0")}`,
        ...log,
      },
      ...prev,
    ]);
  };

  const handleSpin = (count: number, cost: number, label: string) => {
    if (silver < cost) {
      setNotice(`Insufficient Silver. Need ${cost}S.`);
      setTimeout(() => setNotice(""), 2200);
      return;
    }

    let totalReward = 0;
    const results: string[] = [];

    for (let i = 0; i < count; i += 1) {
      const result = getSpinResult();
      totalReward += result.reward;
      results.push(result.label);
    }

    const net = totalReward - cost;

    setSilver((prev) => prev - cost + totalReward);

    addHistory({
      mode: "Fortune Spin",
      detail: label,
      result: results.join(", "),
      amount: net,
      tone: net > 0 ? "win" : net < 0 ? "lose" : "neutral",
    });

    setNotice(
      net > 0
        ? `${label} completed. Profit +${net}S.`
        : net < 0
        ? `${label} completed. Loss ${Math.abs(net)}S.`
        : `${label} completed. Break even.`
    );

    setTimeout(() => setNotice(""), 2200);
  };

  const handleNumberDuel = () => {
    if (duelBet < 5) {
      setNotice("Minimum bet is 5S.");
      setTimeout(() => setNotice(""), 2200);
      return;
    }

    if (duelBet > 30) {
      setNotice("Daily Number Duel max bet is 30S.");
      setTimeout(() => setNotice(""), 2200);
      return;
    }

    if (silver < duelBet) {
      setNotice(`Insufficient Silver. Need ${duelBet}S.`);
      setTimeout(() => setNotice(""), 2200);
      return;
    }

    const result = calculateDuelResult(selectedNumber, duelBet);
    const net = result.reward - duelBet;

    setSilver((prev) => prev - duelBet + result.reward);

    addHistory({
      mode: "Daily Number Duel",
      detail: `Picked ${selectedNumber}, result ${result.winningNumber}`,
      result: result.result,
      amount: net,
      tone: result.tone,
    });

    setNotice(
      result.tone === "win"
        ? `Number Duel Win. Winning number ${result.winningNumber}. Profit +${net}S.`
        : result.tone === "neutral"
        ? `Near miss. Winning number ${result.winningNumber}. Partial return.`
        : `Number Duel Lose. Winning number ${result.winningNumber}.`
    );

    setTimeout(() => setNotice(""), 2600);
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          Lunaria RP Currency Game
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Fortune Hall
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Mini-game berbasis currency RP untuk komunitas Lunaria. Sistem ini
              hanya memakai uang karakter dalam RP, bukan uang asli, dan dibuat
              dengan batasan risiko agar ekonomi guild tetap aman.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-300">
              Current Balance
            </p>
            <p className="mt-1 text-3xl font-black text-white">{silver}S</p>
          </div>
        </div>
      </section>

      {notice ? (
        <section className="rounded-[24px] border border-amber-400/25 bg-amber-500/10 p-5 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Current Silver" value={`${silver}S`} tone="text-amber-300" />
        <StatCard label="Win Logs" value={String(totalWins)} tone="text-emerald-300" />
        <StatCard label="Loss Logs" value={String(totalLosses)} tone="text-red-300" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-[32px] border border-violet-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(124,58,237,0.10)] xl:col-span-6">
          <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
            Mode 1
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Daily Number Duel
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Pilih angka dan pasang silver. Versi UI ini langsung menampilkan
            hasil untuk testing. Nanti saat Supabase aktif, mode ini bisa dibuat
            menunggu 24 jam dan bisa diikuti player lain.
          </p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-500">
              Pick Number
            </p>

            <div className="grid grid-cols-4 gap-3 md:grid-cols-7">
              {numberOptions.map((number) => (
                <button
                  key={number}
                  onClick={() => setSelectedNumber(number)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    selectedNumber === number
                      ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-black/25 text-slate-400 hover:border-amber-400/25"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Bet Amount
              </span>
              <input
                type="number"
                min="5"
                max="30"
                value={duelBet}
                onChange={(event) => setDuelBet(Number(event.target.value))}
                className="lunaria-input"
              />
            </label>

            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-amber-300">
                Rule
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Minimum bet 5S, maximum bet 30S. Jika angka tepat, reward 2x.
                Jika hampir dekat, sebagian silver kembali. Jika kalah, bet
                hilang.
              </p>
            </div>

            <button
              onClick={handleNumberDuel}
              className="mt-5 w-full rounded-2xl border border-violet-400/30 bg-violet-500/10 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-violet-200 transition hover:bg-violet-500/20"
            >
              Place Number Duel
            </button>
          </div>
        </div>

        <div className="rounded-[32px] border border-amber-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)] xl:col-span-6">
          <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
            Mode 2
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Fortune Spin
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Spin cepat dengan biaya tetap. Hasil tidak selalu menguntungkan:
            ada lose, small return, break even, minor win, dan rare win.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {spinOptions.map((option) => (
              <div
                key={option.label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {option.label}
                </p>

                <p className="mt-3 text-3xl font-black text-amber-300">
                  {option.cost}S
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {option.count} roll chance
                </p>

                <button
                  onClick={() =>
                    handleSpin(option.count, option.cost, option.label)
                  }
                  className="mt-5 w-full rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-amber-300 transition hover:bg-amber-500/20"
                >
                  Spin
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-red-300">
              Risk Control
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Mode ini sengaja tidak dibuat terlalu mudah profit. Tujuannya
              untuk hiburan RP dan menjaga keseimbangan ekonomi guild.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
              Fortune Log
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Result History
            </h2>
          </div>

          <p className="text-sm text-slate-400">
            Riwayat masih local state. Setelah Supabase aktif, log akan permanen.
          </p>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                    {item.id}
                  </span>
                  <span className="rounded-full border border-slate-400/20 bg-slate-400/10 px-3 py-1 text-xs font-bold text-slate-300">
                    {item.mode}
                  </span>
                </div>

                <p className="mt-3 text-lg font-black text-white">
                  {item.result}
                </p>

                <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
              </div>

              <div
                className={`text-2xl font-black ${
                  item.tone === "win"
                    ? "text-emerald-300"
                    : item.tone === "lose"
                    ? "text-red-300"
                    : "text-slate-300"
                }`}
              >
                {item.amount > 0 ? "+" : ""}
                {item.amount}S
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .lunaria-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(0, 0, 0, 0.28);
          padding: 0.85rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
        }

        .lunaria-input:focus {
          border-color: rgba(245, 158, 11, 0.45);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
