"use client";

import React, { useMemo, useState } from "react";

type CosmeticType =
  | "Name Effect"
  | "ID Border"
  | "ID Background"
  | "Aura Effect";

type Cosmetic = {
  id: string;
  name: string;
  type: CosmeticType;
  tier: "Common" | "Uncommon" | "Rare" | "Epic" | "Mythic";
  price: number;
  description: string;
  icon: string;
  previewClass: string;
};

const cosmetics: Cosmetic[] = [
  {
    id: "name-ember-script",
    name: "Ember Script",
    type: "Name Effect",
    tier: "Common",
    price: 15,
    description: "Name glow sederhana dengan nuansa amber guild.",
    icon: "✦",
    previewClass:
      "border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-black to-slate-950",
  },
  {
    id: "name-royal-gold",
    name: "Royal Gold Name",
    type: "Name Effect",
    tier: "Rare",
    price: 85,
    description: "Efek nama emas mewah untuk lisensi adventurer.",
    icon: "♛",
    previewClass:
      "border-amber-300/40 bg-gradient-to-br from-amber-500/20 via-black to-yellow-950/30",
  },
  {
    id: "border-silver-oath",
    name: "Silver Oath Border",
    type: "ID Border",
    tier: "Uncommon",
    price: 45,
    description: "Border silver bersih untuk tampilan knight fantasy.",
    icon: "◆",
    previewClass:
      "border-sky-300/35 bg-gradient-to-br from-slate-300/10 via-black to-blue-950/30",
  },
  {
    id: "border-demon-throne",
    name: "Demon Throne Border",
    type: "ID Border",
    tier: "Epic",
    price: 150,
    description: "Border crimson-gold dengan aura villain premium.",
    icon: "♜",
    previewClass:
      "border-red-400/40 bg-gradient-to-br from-red-950/55 via-black to-amber-950/35",
  },
  {
    id: "bg-moonlit-archive",
    name: "Moonlit Archive",
    type: "ID Background",
    tier: "Rare",
    price: 95,
    description: "Background biru gelap seperti arsip kerajaan malam.",
    icon: "☾",
    previewClass:
      "border-blue-300/35 bg-gradient-to-br from-blue-950/50 via-slate-950 to-black",
  },
  {
    id: "bg-void-cathedral",
    name: "Void Cathedral",
    type: "ID Background",
    tier: "Mythic",
    price: 200,
    description: "Background gothic mythic dengan nuansa cathedral void.",
    icon: "✧",
    previewClass:
      "border-violet-300/45 bg-gradient-to-br from-violet-950/70 via-black to-amber-950/25",
  },
  {
    id: "aura-green-sanctuary",
    name: "Green Sanctuary Aura",
    type: "Aura Effect",
    tier: "Uncommon",
    price: 60,
    description: "Aura hijau lembut untuk healer, nature, dan support.",
    icon: "❧",
    previewClass:
      "border-emerald-300/35 bg-gradient-to-br from-emerald-950/40 via-black to-green-900/20",
  },
  {
    id: "aura-astral-crown",
    name: "Astral Crown Aura",
    type: "Aura Effect",
    tier: "Mythic",
    price: 190,
    description: "Aura ungu-emas dengan kesan royal cosmic.",
    icon: "✺",
    previewClass:
      "border-violet-300/45 bg-gradient-to-br from-violet-950/65 via-black to-amber-900/30",
  },
];

const tierTheme: Record<Cosmetic["tier"], string> = {
  Common: "border-slate-400/25 bg-slate-400/10 text-slate-200",
  Uncommon: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  Rare: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  Epic: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  Mythic: "border-amber-400/35 bg-amber-400/10 text-amber-200",
};

const typeFilters: ("All" | CosmeticType)[] = [
  "All",
  "Name Effect",
  "ID Border",
  "ID Background",
  "Aura Effect",
];

export default function LunariaCosmeticShop() {
  const [silver, setSilver] = useState(220);
  const [owned, setOwned] = useState<string[]>(["name-ember-script"]);
  const [equipped, setEquipped] = useState<Record<CosmeticType, string | null>>({
    "Name Effect": "name-ember-script",
    "ID Border": null,
    "ID Background": null,
    "Aura Effect": null,
  });
  const [activeFilter, setActiveFilter] = useState<"All" | CosmeticType>("All");
  const [notice, setNotice] = useState("");

  const filteredCosmetics = useMemo(() => {
    if (activeFilter === "All") {
      return cosmetics;
    }

    return cosmetics.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  const equippedItems = useMemo(() => {
    return cosmetics.filter((item) =>
      Object.values(equipped).includes(item.id)
    );
  }, [equipped]);

  const handleBuy = (item: Cosmetic) => {
    if (owned.includes(item.id)) {
      setNotice(`${item.name} already owned.`);
      return;
    }

    if (silver < item.price) {
      setNotice(`Insufficient Silver. Need ${item.price}S.`);
      return;
    }

    setSilver((prev) => prev - item.price);
    setOwned((prev) => [...prev, item.id]);
    setNotice(`${item.name} purchased for ${item.price}S.`);

    setTimeout(() => setNotice(""), 2200);
  };

  const handleEquip = (item: Cosmetic) => {
    if (!owned.includes(item.id)) {
      setNotice("Buy this cosmetic before equipping.");
      return;
    }

    setEquipped((prev) => ({
      ...prev,
      [item.type]: item.id,
    }));

    setNotice(`${item.name} equipped.`);
    setTimeout(() => setNotice(""), 2200);
  };

  const handleUnequip = (type: CosmeticType) => {
    setEquipped((prev) => ({
      ...prev,
      [type]: null,
    }));

    setNotice(`${type} unequipped.`);
    setTimeout(() => setNotice(""), 2200);
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          Lunaria Premium Cosmetic Market
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Cosmetic Shop
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Tempat membeli dan memasang cosmetic untuk memperindah Adventurer
              ID Card. Semua pembelian memakai currency RP, bukan uang asli.
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

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="space-y-6 xl:col-span-4">
          <div className="rounded-[32px] border border-amber-400/20 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]">
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
              ID Card Preview
            </p>

            <div className="mt-5 rounded-[28px] border border-amber-400/25 bg-gradient-to-br from-slate-950 via-black to-violet-950/40 p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300">
                  Adventurer License
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
                  ⚜
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-amber-400/25 bg-black/35 text-4xl">
                  🧙
                </div>

                <h2 className="mt-5 text-2xl font-black text-amber-200 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  Aether Veyl
                </h2>
                <p className="mt-2 text-sm text-slate-400">Human • Mystic</p>

                <div className="mt-4 flex gap-3">
                  <span className="rounded-full border border-slate-400/30 bg-slate-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-200">
                    Initiate
                  </span>
                  <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
                    Mystic
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Equipped Cosmetics
                </p>

                <div className="mt-3 space-y-2">
                  {equippedItems.length ? (
                    equippedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm"
                      >
                        <span className="text-slate-200">{item.name}</span>
                        <button
                          onClick={() => handleUnequip(item.type)}
                          className="text-xs font-bold uppercase tracking-[0.14em] text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No cosmetic equipped.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-violet-400/20 bg-black/35 p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-violet-300">
              Shop Rules
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <li>• Harga cosmetic mulai dari 15S sampai 200S.</li>
              <li>• Cosmetic hanya bisa dipakai oleh pemiliknya.</li>
              <li>• Player bisa pasang dan copot cosmetic yang sudah dibeli.</li>
              <li>• Top Leaderboard effect tidak dijual di shop.</li>
            </ul>
          </div>
        </aside>

        <section className="xl:col-span-8">
          <div className="mb-5 flex flex-wrap gap-3">
            {typeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                  activeFilter === filter
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-amber-400/25 hover:text-amber-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredCosmetics.map((item) => {
              const isOwned = owned.includes(item.id);
              const isEquipped = equipped[item.type] === item.id;

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[32px] border p-5 ${item.previewClass}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-black/35 text-3xl">
                        {item.icon}
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {item.type}
                        </p>
                        <h2 className="mt-1 text-xl font-black text-white">
                          {item.name}
                        </h2>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                        tierTheme[item.tier]
                      }`}
                    >
                      {item.tier}
                    </span>
                  </div>

                  <p className="mt-5 min-h-[48px] text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Price
                    </p>
                    <p className="mt-1 text-3xl font-black text-amber-300">
                      {item.price}S
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={isOwned}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
                        isOwned
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                          : "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                      }`}
                    >
                      {isOwned ? "Owned" : "Buy"}
                    </button>

                    <button
                      onClick={() => handleEquip(item)}
                      disabled={!isOwned}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
                        isEquipped
                          ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
                          : isOwned
                          ? "border-violet-400/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                          : "border-white/10 bg-white/[0.03] text-slate-600"
                      }`}
                    >
                      {isEquipped ? "Equipped" : "Equip"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
