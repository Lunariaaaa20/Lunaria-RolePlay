"use client";

import React, { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminMarketAssetFormProps = {
  role?: "player" | "admin";
  onCreated?: () => void | Promise<void>;
};

type RiskLevel = "Low" | "Medium" | "High" | "Forbidden";

type FormState = {
  name: string;
  assetKey: string;
  category: string;
  icon: string;
  initialPrice: string;
  riskLevel: RiskLevel;
  description: string;
  flavor: string;
};

const defaultForm: FormState = {
  name: "Silvermoon Caravan Share",
  assetKey: "silvermoon-caravan-share",
  category: "Trade Route",
  icon: "☽",
  initialPrice: "55",
  riskLevel: "Medium",
  description:
    "Saham rute karavan malam Lunaria yang membawa rempah, kain bulan, dan peti guild antar kota.",
  flavor:
    "Karavan aman membuat harga naik perlahan, tetapi serangan bandit atau kabut malam bisa menurunkan nilainya.",
};

const categoryPresets = [
  "Trade Route",
  "Guild Supply",
  "Farm Supply",
  "Mining Contract",
  "Herbal Supply",
  "Forbidden Relic",
  "Noble Contract",
  "Port Exchange",
];

const iconPresets = ["☽", "◇", "✦", "◆", "⚒", "🌾", "🍎", "✧", "♛", "♜"];

function slugifyAssetKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatSilver(value: string | number) {
  const numberValue = Math.max(0, Math.floor(Number(value) || 0));
  const gold = Math.floor(numberValue / 1000);
  const silver = numberValue % 1000;

  if (gold > 0 && silver > 0) return `${gold}G ${silver}S`;
  if (gold > 0) return `${gold}G`;
  return `${silver}S`;
}

function getRiskStyle(risk: RiskLevel) {
  if (risk === "Low") {
    return {
      label: "Low Risk",
      range: "-5% sampai +7%",
      badge: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
      cardGlow: "from-emerald-400/16 via-transparent to-transparent",
      note: "Stabil, aman untuk player baru, perubahan harga kecil.",
    };
  }

  if (risk === "Medium") {
    return {
      label: "Medium Risk",
      range: "-12% sampai +15%",
      badge: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
      cardGlow: "from-cyan-400/16 via-transparent to-transparent",
      note: "Seimbang, cocok untuk market aktif tanpa terlalu liar.",
    };
  }

  if (risk === "High") {
    return {
      label: "High Risk",
      range: "-25% sampai +30%",
      badge: "border-amber-300/30 bg-amber-400/10 text-amber-100",
      cardGlow: "from-amber-400/18 via-transparent to-transparent",
      note: "Fluktuatif, cocok untuk asset tambang, monster route, atau supply langka.",
    };
  }

  return {
    label: "Forbidden Risk",
    range: "-45% sampai +60%",
    badge: "border-red-300/35 bg-red-500/12 text-red-100",
    cardGlow: "from-red-500/20 via-transparent to-transparent",
    note: "Sangat liar, hanya untuk relik terlarang atau market bayangan.",
  };
}

function getMarketReading(assetKey: string, risk: RiskLevel, flavor: string) {
  const key = assetKey.toLowerCase();

  if (flavor.trim()) return flavor.trim();

  if (key.includes("apple")) {
    return "Kontrak pangan membuat harga stabil, tetapi hujan panjang atau hama fantasy kecil bisa menurunkan suplai.";
  }

  if (key.includes("caravan")) {
    return "Karavan malam membawa laba perlahan, namun kabut dan perompak jalan dapat menekan nilai rute.";
  }

  if (key.includes("ore")) {
    return "Permintaan blacksmith dapat mengangkat harga, tetapi jalur tambang rawan gangguan monster.";
  }

  if (key.includes("herb")) {
    return "Healer dan alchemist menjaga demand tetap hidup, terutama setelah quest berisiko.";
  }

  if (risk === "Forbidden") {
    return "Nilainya mengikuti bisikan pasar gelap. Sangat menguntungkan, tetapi sulit diprediksi.";
  }

  return "Asset ini bergerak mengikuti kondisi guild, permintaan player, dan event Lunaria.";
}

export default function AdminMarketAssetForm({
  role,
  onCreated,
}: AdminMarketAssetFormProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [creating, setCreating] = useState(false);

  const isAdmin = role === "admin";

  const normalizedKey = useMemo(() => {
    return slugifyAssetKey(form.assetKey || form.name);
  }, [form.assetKey, form.name]);

  const safePrice = useMemo(() => {
    return Math.max(1, Math.floor(Number(form.initialPrice) || 0));
  }, [form.initialPrice]);

  const riskStyle = getRiskStyle(form.riskLevel);

  const previewDescription = form.description.trim()
    ? form.description.trim()
    : "Deskripsi asset belum diisi.";

  const previewFlavor = getMarketReading(
    normalizedKey,
    form.riskLevel,
    form.flavor
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "name") {
        next.assetKey = slugifyAssetKey(String(value));
      }

      return next;
    });
  }

  function resetForm() {
    setForm(defaultForm);
  }

  async function handleCreateAsset() {
    if (!isAdmin) {
      alert("Hanya admin yang bisa membuat market asset.");
      return;
    }

    const cleanName = form.name.trim();
    const cleanKey = normalizedKey;
    const cleanCategory = form.category.trim();
    const cleanDescription = form.description.trim();
    const cleanIcon = form.icon.trim() || "◇";
    const cleanFlavor = form.flavor.trim();

    if (!cleanName) {
      alert("Nama asset belum diisi.");
      return;
    }

    if (!cleanKey) {
      alert("Asset key belum valid.");
      return;
    }

    if (!cleanCategory) {
      alert("Category belum diisi.");
      return;
    }

    if (!cleanDescription) {
      alert("Description belum diisi.");
      return;
    }

    if (safePrice <= 0) {
      alert("Initial price harus lebih dari 0S.");
      return;
    }

    const confirmed = window.confirm(
      `Daftarkan market asset baru?\n\n${cleanName}\nKey: ${cleanKey}\nPrice: ${safePrice}S\nRisk: ${form.riskLevel}\n\nAsset akan langsung aktif di Relic Exchange.`
    );

    if (!confirmed) return;

    setCreating(true);

    const { error } = await supabase.rpc("create_market_asset", {
      input_asset_key: cleanKey,
      input_name: cleanName,
      input_category: cleanCategory,
      input_description: cleanDescription,
      input_initial_price: safePrice,
      input_risk_level: form.riskLevel,
      input_icon: cleanIcon,
      input_flavor: cleanFlavor || null,
    });

    if (error) {
      console.error("Create market asset error:", error);
      alert(`Gagal membuat market asset: ${error.message}`);
      setCreating(false);
      return;
    }

    await onCreated?.();

    setCreating(false);

    alert(`${cleanName} berhasil masuk ke Relic Exchange.`);
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[34px] border border-purple-300/15 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.13),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.025))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.30)] lg:p-6">
      <div className="pointer-events-none absolute inset-x-8 h-px bg-gradient-to-r from-transparent via-purple-200/30 to-transparent" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.30em] text-purple-300">
                Admin Market Registry
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Create Market Asset
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Tambahkan instrumen ekonomi baru ke Relic Exchange. Asset yang
                dibuat akan langsung aktif, muncul di market, dan bisa
                dibeli/jual oleh player.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.20em] text-amber-200">
                Admin Only
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Pastikan harga dan risk sudah benar sebelum submit.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FieldShell label="Asset Name">
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Silvermoon Caravan Share"
                className="w-full rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40 focus:bg-black/35"
              />
            </FieldShell>

            <FieldShell label="Asset Key">
              <input
                value={form.assetKey}
                onChange={(event) =>
                  updateField("assetKey", event.target.value)
                }
                placeholder="silvermoon-caravan-share"
                className="w-full rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40 focus:bg-black/35"
              />

              <p className="mt-2 text-[11px] font-semibold text-slate-500">
                Final key:{" "}
                <span className="text-purple-200">{normalizedKey || "-"}</span>
              </p>
            </FieldShell>

            <FieldShell label="Category">
              <div className="flex gap-2">
                <input
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="Trade Route"
                  className="w-full rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40 focus:bg-black/35"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {categoryPresets.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => updateField("category", category)}
                    className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10px] font-bold text-slate-400 transition hover:border-purple-300/30 hover:text-purple-100"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </FieldShell>

            <FieldShell label="Icon">
              <input
                value={form.icon}
                onChange={(event) => updateField("icon", event.target.value)}
                placeholder="☽"
                className="w-full rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40 focus:bg-black/35"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {iconPresets.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateField("icon", icon)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-sm text-slate-300 transition hover:border-purple-300/30 hover:bg-purple-400/10 hover:text-purple-100"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </FieldShell>

            <FieldShell label="Initial Price">
              <input
                value={form.initialPrice}
                onChange={(event) => {
                  const value = event.target.value.replace(/[^\d]/g, "");
                  updateField("initialPrice", value);
                }}
                inputMode="numeric"
                placeholder="55"
                className="w-full rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40 focus:bg-black/35"
              />

              <p className="mt-2 text-[11px] font-semibold text-slate-500">
                Preview price:{" "}
                <span className="text-amber-200">
                  {formatSilver(safePrice)}
                </span>
              </p>
            </FieldShell>

            <FieldShell label="Risk Level">
              <select
                value={form.riskLevel}
                onChange={(event) =>
                  updateField("riskLevel", event.target.value as RiskLevel)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-purple-300/40 focus:bg-black/35"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Forbidden">Forbidden</option>
              </select>

              <p className="mt-2 text-[11px] font-semibold text-slate-500">
                Range: <span className="text-cyan-200">{riskStyle.range}</span>
              </p>
            </FieldShell>

            <FieldShell label="Description" wide>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Deskripsi asset untuk player..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40 focus:bg-black/35"
              />
            </FieldShell>

            <FieldShell label="Flavor / Market Lore" wide>
              <textarea
                value={form.flavor}
                onChange={(event) => updateField("flavor", event.target.value)}
                placeholder="Kalimat lore market, contoh: Karavan aman membuat harga naik perlahan..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/26 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40 focus:bg-black/35"
              />
            </FieldShell>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCreateAsset}
              disabled={creating}
              className="rounded-2xl border border-purple-300/30 bg-purple-400/12 px-5 py-3 text-[10px] font-black uppercase tracking-[0.20em] text-purple-100 shadow-[0_0_30px_rgba(168,85,247,0.10)] transition hover:bg-purple-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Registering Asset..." : "Create Market Asset"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={creating}
              className="rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-3 text-[10px] font-black uppercase tracking-[0.20em] text-slate-300 transition hover:bg-white/[0.075] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset Form
            </button>
          </div>
        </div>

        <div>
          <div className="sticky top-6 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.80),rgba(2,6,23,0.94))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <div className={`absolute inset-0 bg-gradient-to-br ${riskStyle.cardGlow}`} />
            <div className="absolute right-4 top-4 text-8xl opacity-[0.055]">
              {form.icon || "◇"}
            </div>
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                Live Preview
              </p>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-xl">
                    {form.icon || "◇"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-white">
                      {form.name.trim() || "Unnamed Asset"}
                    </h3>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {form.category.trim() || "Uncategorized"}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${riskStyle.badge}`}
                >
                  {riskStyle.label}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {previewDescription}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <PreviewMetric label="Price" value={formatSilver(safePrice)} />
                <PreviewMetric label="Before" value={formatSilver(safePrice)} />
                <PreviewMetric label="Change" value="0%" />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/28 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Market Reading
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                  {previewFlavor}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Risk range: {riskStyle.range}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-400/[0.045] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/80">
                  Admin Note
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {riskStyle.note}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Registry Summary
                </p>

                <div className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
                  <p>
                    Name:{" "}
                    <span className="font-bold text-slate-200">
                      {form.name.trim() || "-"}
                    </span>
                  </p>
                  <p>
                    Key:{" "}
                    <span className="font-bold text-purple-200">
                      {normalizedKey || "-"}
                    </span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="font-bold text-emerald-200">
                      Active after submit
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldShell({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "lg:col-span-2" : ""}>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function PreviewMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
                                  }
