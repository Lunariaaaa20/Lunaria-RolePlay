"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

type NewMarketAssetForm = {
  assetKey: string;
  name: string;
  category: string;
  description: string;
  currentPrice: string;
  riskLevel: "Low" | "Medium" | "High" | "Forbidden";
  icon: string;
  flavor: string;
};

const defaultNewMarketAssetForm: NewMarketAssetForm = {
  assetKey: "",
  name: "",
  category: "Trade Route",
  description: "",
  currentPrice: "50",
  riskLevel: "Medium",
  icon: "◇",
  flavor: "",
};

function generateAssetKey(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminMarketAssetForm({
  role,
  onCreated,
}: {
  role?: "player" | "admin";
  onCreated: () => Promise<void>;
}) {
  const [creatingAsset, setCreatingAsset] = useState(false);
  const [form, setForm] = useState<NewMarketAssetForm>(
    defaultNewMarketAssetForm
  );

  if (role !== "admin") return null;

  function updateForm<K extends keyof NewMarketAssetForm>(
    key: K,
    value: NewMarketAssetForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleCreateMarketAsset() {
    const cleanName = form.name.trim();
    const cleanKey = form.assetKey.trim() || generateAssetKey(cleanName);
    const cleanCategory = form.category.trim();
    const cleanDescription = form.description.trim();
    const cleanIcon = form.icon.trim() || "◇";
    const cleanFlavor = form.flavor.trim();
    const price = Number(form.currentPrice);

    if (!cleanName) {
      alert("Nama asset wajib diisi.");
      return;
    }

    if (!cleanKey) {
      alert("Asset key wajib diisi.");
      return;
    }

    if (!cleanCategory) {
      alert("Category wajib diisi.");
      return;
    }

    if (!cleanDescription) {
      alert("Description wajib diisi.");
      return;
    }

    if (!Number.isFinite(price) || price < 5 || price > 300) {
      alert("Harga asset harus antara 5S sampai 300S.");
      return;
    }

    const confirmed = window.confirm(
      `Buat market asset baru?\n\n${cleanName}\nKey: ${cleanKey}\nPrice: ${Math.floor(
        price
      )}S\nRisk: ${form.riskLevel}`
    );

    if (!confirmed) return;

    setCreatingAsset(true);

    const { error } = await supabase.rpc("create_market_asset", {
      input_asset_key: cleanKey,
      input_name: cleanName,
      input_category: cleanCategory,
      input_description: cleanDescription,
      input_current_price: Math.floor(price),
      input_risk_level: form.riskLevel,
      input_icon: cleanIcon,
      input_flavor: cleanFlavor,
    });

    if (error) {
      console.error("Create market asset error:", error);
      alert(`Gagal membuat asset: ${error.message}`);
      setCreatingAsset(false);
      return;
    }

    setForm(defaultNewMarketAssetForm);
    await onCreated();
    setCreatingAsset(false);

    alert("Market asset baru berhasil dibuat.");
  }

  return (
    <section className="mt-6 rounded-[30px] border border-purple-300/15 bg-purple-400/[0.045] p-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-300">
          Admin Market Registry
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Create Market Asset
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Tambahkan saham fantasy baru ke Relic Exchange. Asset yang dibuat
          langsung aktif, masuk market, dan bisa dibeli/jual player.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MarketInput
          label="Asset Name"
          value={form.name}
          placeholder="Silvermoon Caravan Share"
          onChange={(value) => {
            updateForm("name", value);

            if (!form.assetKey.trim()) {
              updateForm("assetKey", generateAssetKey(value));
            }
          }}
        />

        <MarketInput
          label="Asset Key"
          value={form.assetKey}
          placeholder="silvermoon-caravan-share"
          onChange={(value) => updateForm("assetKey", value)}
        />

        <MarketInput
          label="Category"
          value={form.category}
          placeholder="Trade Route"
          onChange={(value) => updateForm("category", value)}
        />

        <MarketInput
          label="Icon"
          value={form.icon}
          placeholder="◇"
          onChange={(value) => updateForm("icon", value)}
        />

        <MarketInput
          label="Initial Price"
          value={form.currentPrice}
          placeholder="55"
          type="number"
          onChange={(value) => updateForm("currentPrice", value)}
        />

        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            Risk Level
          </span>

          <select
            value={form.riskLevel}
            onChange={(event) =>
              updateForm(
                "riskLevel",
                event.target.value as NewMarketAssetForm["riskLevel"]
              )
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-purple-300/40"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Forbidden">Forbidden</option>
          </select>
        </label>

        <MarketTextarea
          label="Description"
          value={form.description}
          placeholder="Saham rute karavan malam Lunaria yang membawa rempah, kain bulan, dan peti guild antar kota."
          onChange={(value) => updateForm("description", value)}
        />

        <MarketTextarea
          label="Flavor / Market Lore"
          value={form.flavor}
          placeholder="Karavan aman membuat harga naik perlahan, tetapi serangan bandit atau kabut malam bisa menurunkan nilainya."
          onChange={(value) => updateForm("flavor", value)}
        />
      </div>

      <button
        type="button"
        onClick={handleCreateMarketAsset}
        disabled={creatingAsset}
        className="mt-5 rounded-2xl border border-purple-300/30 bg-purple-400/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-purple-100 transition hover:bg-purple-400/16 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creatingAsset ? "Creating..." : "Create Market Asset"}
      </button>
    </section>
  );
}

function MarketInput({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40"
      />
    </label>
  );
}

function MarketTextarea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/40"
      />
    </label>
  );
}
