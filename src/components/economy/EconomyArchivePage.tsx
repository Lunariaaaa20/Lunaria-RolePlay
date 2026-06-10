"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminMarketAssetForm from "./AdminMarketAssetForm";
import LunariaChroniclePanel from "./LunariaChroniclePanel";
import AutoDailyEnginePanel from "./AutoDailyEnginePanel";

type LunariaSession = {
  role: "player" | "admin";
  playerId?: string;
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
  loginAt?: string;
};

type TreasuryRow = {
  id: string;
  treasury_balance: number;
  total_tax_collected: number;
  total_relief_distributed: number;
  last_tax_run_at: string | null;
  last_relief_run_at: string | null;
  last_market_update_at: string | null;
};

type TaxPolicyRow = {
  id: string;
  decree_name: string;
  status: "lowered" | "stable" | "raised";
  reason: string;

  tier_0_max: number;
  tier_0_rate: number;

  tier_1_min: number;
  tier_1_max: number;
  tier_1_rate: number;

  tier_2_min: number;
  tier_2_max: number;
  tier_2_rate: number;

  tier_3_min: number;
  tier_3_max: number;
  tier_3_rate: number;

  tier_4_min: number;
  tier_4_rate: number;

  last_review_at: string | null;
  next_review_at: string | null;

  created_at: string;
  updated_at: string;
};

type TaxPolicyHistoryRow = {
  id: string;
  decree_name: string;
  status: "lowered" | "stable" | "raised";
  reason: string;

  tier_0_rate: number;
  tier_1_rate: number;
  tier_2_rate: number;
  tier_3_rate: number;
  tier_4_rate: number;

  previous_tier_0_rate: number | null;
  previous_tier_1_rate: number | null;
  previous_tier_2_rate: number | null;
  previous_tier_3_rate: number | null;
  previous_tier_4_rate: number | null;

  review_summary: string | null;
  created_by: string;
  created_at: string;
};

type WorldChronicleRow = {
  id: string;

  season_name: string;
  season_day: number;
  season_length: number;

  world_day_name: string;
  weather_name: string;
  moon_phase: string;

  headline: string;
  news_body: string;

  event_title: string;
  event_type: string;
  event_location: string;
  event_mode: string;
  event_requirement: string;
  event_reward_note: string;

  market_mood: string;
  market_warning: string;

  created_by: string;
  last_generated_at: string;
  next_update_at: string;

  created_at: string;
  updated_at: string;
};

type ChronicleMarketNoteRow = {
  id: string;
  chronicle_id: string;
  asset_category: string;
  effect_type: "positive" | "negative" | "stable" | "volatile";
  effect_strength: number;
  title: string;
  body: string;
  rumor_tone: "optimistic" | "cautious" | "uncertain" | "warning" | "neutral";
  created_at: string;
};

type LedgerRow = {
  id: string;
  entry_type: string;
  player_id: string | null;
  player_name: string | null;
  amount: number;
  balance_before: number | null;
  balance_after: number | null;
  treasury_before: number | null;
  treasury_after: number | null;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

type MarketAssetRow = {
  id: string;
  asset_key: string;
  name: string;
  category: string;
  description: string;
  current_price: number;
  previous_price: number;
  risk_level: string;
  status: string;
  icon: string;
  flavor: string | null;
  created_at: string;
  updated_at: string;
};

type MarketHistoryRow = {
  id: string;
  asset_id: string;
  old_price: number;
  new_price: number;
  change_percent: number;
  reason: string | null;
  created_at: string;
};

type MarketHoldingRow = {
  id: string;
  player_id: string;
  player_name: string | null;
  asset_id: string;
  quantity: number;
  average_buy_price: number;
  created_at: string;
  updated_at: string;
};

type EconomyData = {
  treasury: TreasuryRow | null;
  taxPolicy: TaxPolicyRow | null;
  taxPolicyHistory: TaxPolicyHistoryRow[];
  chronicle: WorldChronicleRow | null;
  chronicleMarketNotes: ChronicleMarketNoteRow[];
  ledger: LedgerRow[];
  assets: MarketAssetRow[];
  archivedAssets: MarketAssetRow[];
  history: MarketHistoryRow[];
  holdings: MarketHoldingRow[];
};

function getStoredSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const localSession = localStorage.getItem("lunaria_session");
  const sessionSession = sessionStorage.getItem("lunaria_session");
  const rawSession = localSession || sessionSession;

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as LunariaSession;
  } catch {
    return null;
  }
}

function formatSilver(value: number | null | undefined) {
  const safe = Math.max(0, Math.floor(Number(value) || 0));
  const gold = Math.floor(safe / 1000);
  const silver = safe % 1000;

  if (gold > 0 && silver > 0) return `${gold}G ${silver}S`;
  if (gold > 0) return `${gold}G`;
  return `${silver}S`;
}

function formatSignedSilver(value: number) {
  if (value > 0) return `+${value}S`;
  if (value < 0) return `${value}S`;
  return "0S";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Belum pernah";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getRiskStyle(riskLevel: string) {
  const risk = String(riskLevel).toLowerCase();

  if (risk === "low") {
    return {
      label: "Low Risk",
      badge: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
      range: "-5% sampai +7%",
      glow: "from-emerald-400/16 via-transparent to-transparent",
    };
  }

  if (risk === "medium") {
    return {
      label: "Medium Risk",
      badge: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
      range: "-12% sampai +15%",
      glow: "from-cyan-400/16 via-transparent to-transparent",
    };
  }

  if (risk === "high") {
    return {
      label: "High Risk",
      badge: "border-amber-300/30 bg-amber-400/10 text-amber-100",
      range: "-25% sampai +30%",
      glow: "from-amber-400/18 via-transparent to-transparent",
    };
  }

  if (risk === "forbidden") {
    return {
      label: "Forbidden Risk",
      badge: "border-red-300/35 bg-red-500/12 text-red-100",
      range: "-45% sampai +60%",
      glow: "from-red-500/20 via-transparent to-transparent",
    };
  }

  return {
    label: riskLevel || "Unknown",
    badge: "border-white/15 bg-white/[0.06] text-slate-200",
    range: "Tidak diketahui",
    glow: "from-white/10 via-transparent to-transparent",
  };
}

function getChangeInfo(currentPrice: number, previousPrice: number) {
  if (!previousPrice || previousPrice <= 0) {
    return {
      percent: 0,
      label: "0%",
      className: "text-slate-300",
    };
  }

  const percent = Math.round(
    ((currentPrice - previousPrice) / previousPrice) * 100
  );

  if (percent > 0) {
    return {
      percent,
      label: `+${percent}%`,
      className: "text-emerald-200",
    };
  }

  if (percent < 0) {
    return {
      percent,
      label: `${percent}%`,
      className: "text-red-200",
    };
  }

  return {
    percent,
    label: "0%",
    className: "text-slate-300",
  };
}

function getMarketMood(asset: MarketAssetRow) {
  const risk = asset.risk_level.toLowerCase();
  const change = getChangeInfo(asset.current_price, asset.previous_price);

  if (risk === "forbidden") {
    if (change.percent > 0) {
      return "Permintaan relik terlarang meningkat di pasar bayangan kerajaan.";
    }

    if (change.percent < 0) {
      return "Kepanikan relik menyebar di antara lingkar pedagang tersembunyi.";
    }

    return "Pasar terlarang diam, tetapi nilainya tetap tidak stabil.";
  }

  if (asset.asset_key.includes("pearl")) {
    if (change.percent > 0) return "Jalur laut stabil, permintaan mutiara naik.";
    if (change.percent < 0) return "Laporan badai melemahkan kepercayaan merchant.";
    return "Perdagangan Azure Coast berada dalam ritme tenang.";
  }

  if (asset.asset_key.includes("ore")) {
    if (change.percent > 0) {
      return "Permintaan blacksmith mendorong kontrak bijih naik.";
    }

    if (change.percent < 0) {
      return "Aktivitas monster Cinderpeak mengganggu jalur tambang.";
    }

    return "Karavan bijih menunggu jalur yang lebih aman.";
  }

  if (asset.asset_key.includes("herb")) {
    if (change.percent > 0) {
      return "Healer dan alchemist meminta lebih banyak herbal bercahaya.";
    }

    if (change.percent < 0) return "Pasokan herbal stabil, urgensi pasar menurun.";

    return "Perdagangan herbal Everglow bergerak stabil.";
  }

  if (asset.asset_key.includes("grain")) {
    if (change.percent > 0) return "Catatan panen desa terlihat menguntungkan.";
    if (change.percent < 0) return "Kondisi jalan memperlambat pengiriman gandum.";
    return "Pasokan gandum bulan tetap stabil.";
  }

  if (asset.asset_key.includes("apple")) {
    if (change.percent > 0) return "Permintaan dapur guild membuat pasokan naik.";
    if (change.percent < 0) return "Panen basah menekan nilai kontrak apel.";
    return "Kontrak apel Oakhaven berada di harga aman.";
  }

  if (asset.asset_key.includes("caravan")) {
    if (change.percent > 0) return "Karavan malam kembali membawa laba perlahan.";
    if (change.percent < 0) return "Kabut jalan dagang menahan nilai saham karavan.";
    return "Saham karavan bergerak tenang di bawah cahaya bulan.";
  }

  return asset.flavor || "Pergerakan market sedang tenang di arsip treasury.";
}

function getPolicyStatusStyle(status: string) {
  if (status === "raised") {
    return {
      label: "Raised",
      badge: "border-red-300/30 bg-red-400/10 text-red-100",
      note: "Tarif naik ringan untuk memperkuat kas guild dan menahan tekanan inflasi.",
      glow: "from-red-400/14 via-transparent to-transparent",
    };
  }

  if (status === "lowered") {
    return {
      label: "Lowered",
      badge: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
      note: "Tarif turun ringan untuk memberi ruang ekonomi kepada player dan merchant.",
      glow: "from-emerald-400/14 via-transparent to-transparent",
    };
  }

  return {
    label: "Stable",
    badge: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
    note: "Tarif dipertahankan agar ekonomi tetap seimbang dan tidak berubah terlalu cepat.",
    glow: "from-cyan-400/14 via-transparent to-transparent",
  };
}

function getChronicleEffectLabel(effectType: ChronicleMarketNoteRow["effect_type"]) {
  if (effectType === "positive") return "Demand Pressure";
  if (effectType === "negative") return "Supply Pressure";
  if (effectType === "volatile") return "Volatile Signal";
  return "Stable Watch";
}

function getChronicleEffectBadge(effectType?: ChronicleMarketNoteRow["effect_type"]) {
  if (effectType === "positive") {
    return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  }

  if (effectType === "negative") {
    return "border-red-300/25 bg-red-400/10 text-red-100";
  }

  if (effectType === "volatile") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }

  return "border-cyan-300/25 bg-cyan-400/10 text-cyan-100";
}

export default function EconomyArchivePage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [data, setData] = useState<EconomyData>({
    treasury: null,
    taxPolicy: null,
    taxPolicyHistory: [],
    chronicle: null,
    chronicleMarketNotes: [],
    ledger: [],
    assets: [],
    archivedAssets: [],
    history: [],
    holdings: [],
  });

  const [loading, setLoading] = useState(true);
  const [updatingMarket, setUpdatingMarket] = useState(false);
  const [runningTax, setRunningTax] = useState(false);
  const [runningRelief, setRunningRelief] = useState(false);
  const [reviewingTaxPolicy, setReviewingTaxPolicy] = useState(false);
  const [updatingChronicle, setUpdatingChronicle] = useState(false);
  const [autoCycleStatus, setAutoCycleStatus] = useState<string | null>(null);
  const [tradingAssetId, setTradingAssetId] = useState<string | null>(null);
  const [archivingAssetId, setArchivingAssetId] = useState<string | null>(null);
  const [restoringAssetId, setRestoringAssetId] = useState<string | null>(null);

  const totalMarketValue = useMemo(() => {
    return data.assets.reduce((sum, asset) => sum + asset.current_price, 0);
  }, [data.assets]);

  const assetMap = useMemo(() => {
    return new Map(data.assets.map((asset) => [asset.id, asset]));
  }, [data.assets]);

  const holdingMap = useMemo(() => {
    return new Map(data.holdings.map((holding) => [holding.asset_id, holding]));
  }, [data.holdings]);

  const portfolioValue = useMemo(() => {
    return data.holdings.reduce((sum, holding) => {
      const asset = assetMap.get(holding.asset_id);
      if (!asset) return sum;
      return sum + holding.quantity * asset.current_price;
    }, 0);
  }, [assetMap, data.holdings]);

  const portfolioCost = useMemo(() => {
    return data.holdings.reduce((sum, holding) => {
      return sum + holding.quantity * holding.average_buy_price;
    }, 0);
  }, [data.holdings]);

  const portfolioProfitLoss = portfolioValue - portfolioCost;
  const isAdmin = session?.role === "admin";

  async function runAutoDailyCycle() {
    const { data: cycleData, error } = await supabase.rpc(
      "run_lunaria_auto_daily_cycle"
    );

    if (error) {
      console.error("Auto daily cycle error:", error);
      setAutoCycleStatus("Auto Daily Engine gagal dicek.");
      return;
    }

    const result = Array.isArray(cycleData) ? cycleData[0] : null;

    if (!result) {
      setAutoCycleStatus(null);
      return;
    }

    if (result.did_run_chronicle || result.did_run_market) {
      setAutoCycleStatus(
        "Auto Daily Engine menerbitkan Chronicle dan memperbarui Relic Exchange."
      );
      return;
    }

    setAutoCycleStatus(result.chronicle_status || null);
  }

  async function loadEconomy() {
    setLoading(true);

    await runAutoDailyCycle();

    const storedSession = getStoredSession();
    setSession(storedSession);

    const [
      treasuryResult,
      taxPolicyResult,
      taxPolicyHistoryResult,
      chronicleResult,
      chronicleMarketNotesResult,
      ledgerResult,
      assetsResult,
      archivedAssetsResult,
      historyResult,
      holdingsResult,
    ] = await Promise.all([
      supabase
        .from("economy_treasury")
        .select("*")
        .eq("id", "main")
        .maybeSingle(),
      supabase
        .from("economy_tax_policy")
        .select("*")
        .eq("id", "main")
        .maybeSingle(),
      supabase
        .from("economy_tax_policy_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("world_chronicle")
        .select("*")
        .eq("id", "current")
        .maybeSingle(),
      supabase
        .from("world_chronicle_market_notes")
        .select("*")
        .eq("chronicle_id", "current")
        .order("created_at", { ascending: true }),
      supabase
        .from("economy_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("economy_market_assets")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: true }),
      supabase
        .from("economy_market_assets")
        .select("*")
        .eq("status", "archived")
        .order("updated_at", { ascending: false }),
      supabase
        .from("economy_market_price_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      storedSession?.playerId
        ? supabase
            .from("economy_market_holdings")
            .select("*")
            .eq("player_id", storedSession.playerId)
            .order("updated_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (treasuryResult.error) console.error("Treasury load error:", treasuryResult.error);
    if (taxPolicyResult.error) console.error("Tax policy load error:", taxPolicyResult.error);
    if (taxPolicyHistoryResult.error) console.error("Tax policy history load error:", taxPolicyHistoryResult.error);
    if (chronicleResult.error) console.error("Chronicle load error:", chronicleResult.error);
    if (chronicleMarketNotesResult.error) console.error("Chronicle market notes load error:", chronicleMarketNotesResult.error);
    if (ledgerResult.error) console.error("Ledger load error:", ledgerResult.error);
    if (assetsResult.error) console.error("Assets load error:", assetsResult.error);
    if (archivedAssetsResult.error) console.error("Archived assets load error:", archivedAssetsResult.error);
    if (historyResult.error) console.error("History load error:", historyResult.error);
    if (holdingsResult.error) console.error("Holdings load error:", holdingsResult.error);

    setData({
      treasury: (treasuryResult.data as TreasuryRow | null) || null,
      taxPolicy: (taxPolicyResult.data as TaxPolicyRow | null) || null,
      taxPolicyHistory:
        (taxPolicyHistoryResult.data as TaxPolicyHistoryRow[]) || [],
      chronicle: (chronicleResult.data as WorldChronicleRow | null) || null,
      chronicleMarketNotes:
        (chronicleMarketNotesResult.data as ChronicleMarketNoteRow[]) || [],
      ledger: (ledgerResult.data as LedgerRow[]) || [],
      assets: (assetsResult.data as MarketAssetRow[]) || [],
      archivedAssets: (archivedAssetsResult.data as MarketAssetRow[]) || [],
      history: (historyResult.data as MarketHistoryRow[]) || [],
      holdings: (holdingsResult.data as MarketHoldingRow[]) || [],
    });

    setLoading(false);
  }

  function requirePlayerId() {
    const storedSession = getStoredSession();

    if (!storedSession?.playerId) {
      alert(
        "Session player tidak memiliki playerId. Silakan login ulang lewat Access Gate."
      );
      return null;
    }

    return storedSession.playerId;
  }

  async function handleBuyAsset(asset: MarketAssetRow) {
    const playerId = requirePlayerId();
    if (!playerId) return;

    const confirmed = window.confirm(
      `Beli 1 unit ${asset.name} seharga ${asset.current_price}S?`
    );

    if (!confirmed) return;

    setTradingAssetId(`${asset.id}:buy`);

    const { error } = await supabase.rpc("buy_market_asset", {
      input_player_id: playerId,
      input_asset_id: asset.id,
      input_quantity: 1,
    });

    if (error) {
      console.error("Buy asset error:", error);
      alert(`Gagal beli asset: ${error.message}`);
      setTradingAssetId(null);
      return;
    }

    await loadEconomy();
    setTradingAssetId(null);

    alert(`Berhasil membeli 1 unit ${asset.name}.`);
  }

  async function handleSellAsset(asset: MarketAssetRow) {
    const playerId = requirePlayerId();
    if (!playerId) return;

    const holding = holdingMap.get(asset.id);

    if (!holding || holding.quantity <= 0) {
      alert("Kamu belum memiliki asset ini.");
      return;
    }

    const confirmed = window.confirm(
      `Jual 1 unit ${asset.name} seharga ${asset.current_price}S?`
    );

    if (!confirmed) return;

    setTradingAssetId(`${asset.id}:sell`);

    const { error } = await supabase.rpc("sell_market_asset", {
      input_player_id: playerId,
      input_asset_id: asset.id,
      input_quantity: 1,
    });

    if (error) {
      console.error("Sell asset error:", error);
      alert(`Gagal jual asset: ${error.message}`);
      setTradingAssetId(null);
      return;
    }

    await loadEconomy();
    setTradingAssetId(null);

    alert(`Berhasil menjual 1 unit ${asset.name}.`);
  }

  async function handleRunWeeklyTax() {
    if (!isAdmin) {
      alert("Hanya admin yang bisa menjalankan pajak.");
      return;
    }

    const confirmed = window.confirm(
      "Jalankan Weekly Guild Tax sekarang? Saldo player aktif akan dipotong otomatis berdasarkan decree pajak aktif. Sistem akan menolak jika pajak sudah dijalankan dalam 7 hari terakhir."
    );

    if (!confirmed) return;

    setRunningTax(true);

    const { error } = await supabase.rpc("run_weekly_tax");

    if (error) {
      console.error("Weekly tax error:", error);
      alert(`Gagal menjalankan pajak: ${error.message}`);
      setRunningTax(false);
      return;
    }

    await loadEconomy();
    setRunningTax(false);

    alert("Weekly Guild Tax berhasil dijalankan.");
  }

  async function handleRunTaxPolicyReview() {
    if (!isAdmin) {
      alert("Hanya admin yang bisa menjalankan review kebijakan pajak.");
      return;
    }

    const confirmed = window.confirm(
      "Jalankan Royal Tax Policy Review sekarang? Sistem akan mengecek kondisi treasury dan menentukan apakah pajak naik, turun, atau tetap. Review normalnya hanya bisa berjalan 14 hari sekali."
    );

    if (!confirmed) return;

    setReviewingTaxPolicy(true);

    const { error } = await supabase.rpc("run_tax_policy_review");

    if (error) {
      console.error("Tax policy review error:", error);
      alert(`Gagal menjalankan tax policy review: ${error.message}`);
      setReviewingTaxPolicy(false);
      return;
    }

    await loadEconomy();
    setReviewingTaxPolicy(false);

    alert("Royal Tax Policy Review berhasil dijalankan.");
  }

  async function handleRunDailyChronicle() {
    if (!isAdmin) {
      alert("Hanya admin yang bisa menerbitkan Daily Chronicle.");
      return;
    }

    const confirmed = window.confirm(
      "Terbitkan Daily Lunaria Chronicle sekarang? Season day, berita harian, RP notice, dan market bulletin akan diperbarui."
    );

    if (!confirmed) return;

    setUpdatingChronicle(true);

    const { error } = await supabase.rpc("run_daily_chronicle_update");

    if (error) {
      console.error("Daily chronicle update error:", error);
      alert(`Gagal menerbitkan Chronicle: ${error.message}`);
      setUpdatingChronicle(false);
      return;
    }

    await loadEconomy();
    setUpdatingChronicle(false);

    alert("Daily Lunaria Chronicle berhasil diterbitkan.");
  }

  async function handleDistributeRelief() {
    if (!isAdmin) {
      alert("Hanya admin yang bisa membagikan bansos.");
      return;
    }

    const confirmed = window.confirm(
      "Jalankan Weekly Relief sekarang? Player aktif dengan saldo 50S ke bawah akan menerima 10S dari Treasury. Sistem akan menolak jika relief sudah dijalankan dalam 7 hari terakhir."
    );

    if (!confirmed) return;

    setRunningRelief(true);

    const { error } = await supabase.rpc("run_weekly_relief");

    if (error) {
      console.error("Weekly relief error:", error);
      alert(`Gagal menjalankan bansos: ${error.message}`);
      setRunningRelief(false);
      return;
    }

    await loadEconomy();
    setRunningRelief(false);

    alert("Weekly Relief berhasil dibagikan.");
  }

  async function handleArchiveAsset(asset: MarketAssetRow) {
    if (!isAdmin) {
      alert("Hanya admin yang bisa archive market asset.");
      return;
    }

    const confirmed = window.confirm(
      `Archive asset ini?\n\n${asset.name}\n\nAsset akan hilang dari Relic Exchange aktif, tapi ledger dan holding player tidak dihapus.`
    );

    if (!confirmed) return;

    setArchivingAssetId(asset.id);

    const { error } = await supabase.rpc("archive_market_asset", {
      input_asset_id: asset.id,
    });

    if (error) {
      console.error("Archive asset error:", error);
      alert(`Gagal archive asset: ${error.message}`);
      setArchivingAssetId(null);
      return;
    }

    await loadEconomy();
    setArchivingAssetId(null);

    alert(`${asset.name} berhasil di-archive.`);
  }

  async function handleRestoreAsset(asset: MarketAssetRow) {
    if (!isAdmin) {
      alert("Hanya admin yang bisa restore market asset.");
      return;
    }

    const confirmed = window.confirm(
      `Restore asset ini?\n\n${asset.name}\n\nAsset akan kembali muncul di Relic Exchange aktif dan bisa dibeli/jual player lagi.`
    );

    if (!confirmed) return;

    setRestoringAssetId(asset.id);

    const { error } = await supabase.rpc("restore_market_asset", {
      input_asset_id: asset.id,
    });

    if (error) {
      console.error("Restore asset error:", error);
      alert(`Gagal restore asset: ${error.message}`);
      setRestoringAssetId(null);
      return;
    }

    await loadEconomy();
    setRestoringAssetId(null);

    alert(`${asset.name} berhasil di-restore.`);
  }

  async function handleUpdateMarketPrices() {
    if (!isAdmin) {
      alert("Hanya admin yang bisa update harga market.");
      return;
    }

    const confirmed = window.confirm(
      "Update harga Relic Exchange sekarang? Harga semua market asset akan naik/turun otomatis berdasarkan Chronicle, risk roll, dan kondisi market."
    );

    if (!confirmed) return;

    setUpdatingMarket(true);

    const { error } = await supabase.rpc("run_market_price_update");

    if (error) {
      console.error("Market update error:", error);
      alert(`Gagal update market: ${error.message}`);
      setUpdatingMarket(false);
      return;
    }

    await loadEconomy();
    setUpdatingMarket(false);

    alert("Relic Exchange berhasil diperbarui.");
  }

  useEffect(() => {
    loadEconomy();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03050d] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.10),transparent_32%),linear-gradient(180deg,#03050d,#060816_45%,#02030a)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:54px_54px]" />
      <div className="pointer-events-none fixed left-1/2 top-0 z-0 h-px w-[84%] -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />

      <div className="relative z-10">
        <section className="relative overflow-hidden rounded-[38px] border border-amber-200/15 bg-[radial-gradient(circle_at_20%_15%,rgba(245,158,11,0.18),transparent_32%),radial-gradient(circle_at_78%_10%,rgba(34,211,238,0.13),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.040)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.040)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/35 to-transparent" />

          <div className="relative z-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(252,211,77,0.9)]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-200">
                    Lunaria Royal Economy
                  </p>
                </div>

                <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Royal Treasury
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                  Pusat kendali ekonomi Lunaria: tempat silver berputar,
                  pajak dicatat, dana bantuan disalurkan, dan Relic Exchange
                  menjaga denyut pasar guild tetap hidup.
                </p>
              </div>

              <button
                type="button"
                onClick={loadEconomy}
                disabled={loading}
                className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.08)] transition hover:bg-amber-400/16 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Syncing..." : "Refresh Treasury"}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Treasury Balance"
                value={formatSilver(data.treasury?.treasury_balance || 0)}
                note="Dana tersimpan di kas guild"
                icon="♛"
                tone="amber"
              />
              <StatCard
                label="Tax Collected"
                value={formatSilver(data.treasury?.total_tax_collected || 0)}
                note="Total pajak yang telah masuk"
                icon="⚖"
                tone="red"
              />
              <StatCard
                label="Relief Distributed"
                value={formatSilver(data.treasury?.total_relief_distributed || 0)}
                note="Bantuan untuk player saldo rendah"
                icon="✦"
                tone="emerald"
              />
              <StatCard
                label="Market Index"
                value={formatSilver(totalMarketValue)}
                note={`${data.assets.length} instrumen aktif`}
                icon="◇"
                tone="cyan"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ScheduleCard
                title="Tax Seal"
                value={formatDate(data.treasury?.last_tax_run_at)}
                description="Pajak mingguan menjaga inflasi agar ekonomi guild tetap sehat."
                badge="Anti Inflation"
              />
              <ScheduleCard
                title="Relief Seal"
                value={formatDate(data.treasury?.last_relief_run_at)}
                description="Dana bantuan untuk adventurer aktif yang sedang kekurangan silver."
                badge="Welfare Fund"
              />
              <ScheduleCard
                title="Market Seal"
                value={formatDate(data.treasury?.last_market_update_at)}
                description="Harga Relic Exchange bergerak mengikuti risiko, event, dan demand."
                badge="Relic Exchange"
              />
            </div>
          </div>
        </section>

        <LunariaChroniclePanel
          chronicle={data.chronicle}
          marketNotes={data.chronicleMarketNotes}
          isAdmin={isAdmin}
          updating={updatingChronicle}
          onRunDailyChronicle={handleRunDailyChronicle}
        />

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_0_35px_rgba(255,255,255,0.025)] lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                  Relic Exchange
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Market Instruments
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Saham fantasy, kontrak pasokan, dan relik bernilai yang bisa
                  dibeli atau dijual oleh player.
                </p>
              </div>

              <span className="hidden rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100 sm:inline-flex">
                Live Market
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.assets.map((asset) => {
                const holding = holdingMap.get(asset.id);
                const chronicleNote =
                  data.chronicleMarketNotes.find(
                    (note) =>
                      note.asset_category.toLowerCase() ===
                      asset.category.toLowerCase()
                  ) || null;

                return (
                  <MarketAssetCard
                    key={asset.id}
                    asset={asset}
                    holdingQuantity={holding?.quantity || 0}
                    averageBuyPrice={holding?.average_buy_price || 0}
                    chronicleNote={chronicleNote}
                    tradingAssetId={tradingAssetId}
                    archivingAssetId={archivingAssetId}
                    isAdmin={isAdmin}
                    onBuy={() => handleBuyAsset(asset)}
                    onSell={() => handleSellAsset(asset)}
                    onArchive={() => handleArchiveAsset(asset)}
                  />
                );
              })}

              {!loading && data.assets.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-400">
                  Belum ada asset aktif. Restore dari archive vault atau buat
                  instrumen market baru melalui panel admin.
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <PortfolioCard
              session={session}
              holdings={data.holdings}
              assets={data.assets}
              portfolioValue={portfolioValue}
              portfolioCost={portfolioCost}
              portfolioProfitLoss={portfolioProfitLoss}
            />

            <RoyalTaxPolicyCard
              policy={data.taxPolicy}
              history={data.taxPolicyHistory}
              isAdmin={isAdmin}
              reviewing={reviewingTaxPolicy}
              onReview={handleRunTaxPolicyReview}
            />

            <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
                Treasury Ledger
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Archive Records
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Catatan resmi seluruh transaksi treasury, market, pajak,
                bantuan, archive, dan restore.
              </p>

              <div className="mt-5 space-y-3">
                {data.ledger.map((entry) => (
                  <LedgerItem key={entry.id} entry={entry} />
                ))}

                {!loading && data.ledger.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">
                    Belum ada ledger. Catatan akan muncul setelah pajak, bansos,
                    buy, sell, archive, restore, atau market update berjalan.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {isAdmin ? (
          <>
            <section className="mt-6 rounded-[34px] border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.025))] p-5 lg:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-300">
                    Admin Treasury Console
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    Treasury Operations
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    Panel operasi ekonomi guild. Jalankan pajak, bantuan, dan
                    update market secara manual dengan cooldown agar ekonomi
                    Lunaria tetap terkendali.
                  </p>

                  <AutoDailyEnginePanel
  chronicle={data.chronicle}
  autoCycleStatus={autoCycleStatus}
/>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <ActiveActionCard
                  title="Run Weekly Tax"
                  description="Mengambil pajak bertingkat dari saldo player aktif berdasarkan decree pajak aktif."
                  icon="⚖"
                  loading={runningTax}
                  buttonLabel={runningTax ? "Running..." : "Run Weekly Tax"}
                  onClick={handleRunWeeklyTax}
                  tone="amber"
                />

                <ActiveActionCard
                  title="Distribute Relief"
                  description="Membagikan 10S untuk player aktif dengan saldo rendah agar ekonomi tetap adil."
                  icon="✦"
                  loading={runningRelief}
                  buttonLabel={
                    runningRelief ? "Distributing..." : "Distribute Relief"
                  }
                  onClick={handleDistributeRelief}
                  tone="emerald"
                />

                <ActiveActionCard
                  title="Update Market Prices"
                  description="Menggerakkan harga asset fantasy berdasarkan Chronicle, risk roll, dan kondisi market."
                  icon="◇"
                  loading={updatingMarket}
                  buttonLabel={updatingMarket ? "Updating..." : "Run Market Update"}
                  onClick={handleUpdateMarketPrices}
                  tone="cyan"
                />
              </div>
            </section>

            <AdminMarketAssetForm role={session?.role} onCreated={loadEconomy} />

            <ArchivedAssetViewer
              assets={data.archivedAssets}
              restoringAssetId={restoringAssetId}
              onRestore={handleRestoreAsset}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: string;
  tone: "amber" | "red" | "emerald" | "cyan";
}) {
  const style = {
    amber: {
      icon: "text-amber-100 border-amber-300/25 bg-amber-400/12",
      glow: "bg-amber-400/10",
    },
    red: {
      icon: "text-red-100 border-red-300/25 bg-red-400/12",
      glow: "bg-red-400/10",
    },
    emerald: {
      icon: "text-emerald-100 border-emerald-300/25 bg-emerald-400/12",
      glow: "bg-emerald-400/10",
    },
    cyan: {
      icon: "text-cyan-100 border-cyan-300/25 bg-cyan-400/12",
      glow: "bg-cyan-400/10",
    },
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black/26 p-5 transition hover:border-white/16 hover:bg-white/[0.055]">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${style.glow} blur-2xl`} />
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-white">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{note}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl shadow-[0_0_24px_rgba(255,255,255,0.04)] ${style.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({
  title,
  value,
  description,
  badge,
}: {
  title: string;
  value: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/24 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-300">
          {badge}
        </span>
      </div>

      <p className="mt-3 text-sm font-black text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
    </div>
  );
}

function MarketAssetCard({
  asset,
  holdingQuantity,
  averageBuyPrice,
  chronicleNote,
  tradingAssetId,
  archivingAssetId,
  isAdmin,
  onBuy,
  onSell,
  onArchive,
}: {
  asset: MarketAssetRow;
  holdingQuantity: number;
  averageBuyPrice: number;
  chronicleNote: ChronicleMarketNoteRow | null;
  tradingAssetId: string | null;
  archivingAssetId: string | null;
  isAdmin: boolean;
  onBuy: () => void;
  onSell: () => void;
  onArchive: () => void;
}) {
  const risk = getRiskStyle(asset.risk_level);
  const change = getChangeInfo(asset.current_price, asset.previous_price);
  const mood = getMarketMood(asset);
  const buying = tradingAssetId === `${asset.id}:buy`;
  const selling = tradingAssetId === `${asset.id}:sell`;
  const archiving = archivingAssetId === asset.id;
  const isTrading = Boolean(tradingAssetId) || Boolean(archivingAssetId);

  const profitLoss =
    holdingQuantity > 0
      ? (asset.current_price - averageBuyPrice) * holdingQuantity
      : 0;

  return (
    <article className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.92))] p-5 shadow-[0_16px_42px_rgba(0,0,0,0.20)] transition hover:border-white/16 hover:bg-white/[0.055]">
      <div className={`absolute inset-0 bg-gradient-to-br ${risk.glow} opacity-80`} />
      <div className="absolute right-4 top-4 text-7xl opacity-[0.055]">
        {asset.icon}
      </div>
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-xl shadow-[0_0_22px_rgba(255,255,255,0.035)]">
              {asset.icon}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-white">
                {asset.name}
              </h3>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {asset.category}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${risk.badge}`}
          >
            {risk.label}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          {asset.description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniMetric label="Price" value={formatSilver(asset.current_price)} />
          <MiniMetric
            label="Before"
            value={formatSilver(asset.previous_price)}
          />
          <MiniMetric
            label="Change"
            value={change.label}
            valueClass={change.className}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/26 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            Market Reading
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
            {mood}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Risk range: {risk.range}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.045] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Affected by Chronicle
              </p>

              <p className="mt-2 text-sm font-black text-white">
                {chronicleNote
                  ? `${chronicleNote.asset_category} • ${getChronicleEffectLabel(
                      chronicleNote.effect_type
                    )}`
                  : "No Direct Chronicle Signal"}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${getChronicleEffectBadge(
                chronicleNote?.effect_type
              )}`}
            >
              {chronicleNote
                ? `${chronicleNote.effect_strength > 0 ? "+" : ""}${
                    chronicleNote.effect_strength
                  }`
                : "0"}
            </span>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            {chronicleNote
              ? `${chronicleNote.title}. ${chronicleNote.body}`
              : "Chronicle hari ini belum memberi sinyal langsung untuk kategori asset ini. Harga tetap bergerak berdasarkan risk roll normal."}
          </p>

          <p className="mt-3 text-[11px] font-semibold leading-5 text-slate-500">
            Chronicle memberi konteks market, bukan bocoran pasti. Harga tetap
            dapat naik atau turun karena base roll dan risk level asset.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-400/[0.045] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/80">
            Your Holding
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniMetric label="Owned" value={`${holdingQuantity}`} />
            <MiniMetric
              label="Avg Buy"
              value={holdingQuantity > 0 ? formatSilver(averageBuyPrice) : "-"}
            />
            <MiniMetric
              label="P/L"
              value={formatSignedSilver(profitLoss)}
              valueClass={
                profitLoss > 0
                  ? "text-emerald-200"
                  : profitLoss < 0
                    ? "text-red-200"
                    : "text-slate-300"
              }
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onBuy}
              disabled={isTrading}
              className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100 transition hover:bg-emerald-400/16 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buying ? "Buying..." : "Buy 1"}
            </button>

            <button
              type="button"
              onClick={onSell}
              disabled={isTrading || holdingQuantity <= 0}
              className="rounded-2xl border border-red-300/25 bg-red-400/10 px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-400/16 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selling ? "Selling..." : "Sell 1"}
            </button>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={onArchive}
              disabled={isTrading}
              className="mt-3 w-full rounded-2xl border border-purple-300/25 bg-purple-400/10 px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-purple-100 transition hover:bg-purple-400/16 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {archiving ? "Sealing..." : "Archive Asset"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function PortfolioCard({
  session,
  holdings,
  assets,
  portfolioValue,
  portfolioCost,
  portfolioProfitLoss,
}: {
  session: LunariaSession | null;
  holdings: MarketHoldingRow[];
  assets: MarketAssetRow[];
  portfolioValue: number;
  portfolioCost: number;
  portfolioProfitLoss: number;
}) {
  const assetMap = useMemo(() => {
    return new Map(assets.map((asset) => [asset.id, asset]));
  }, [assets]);

  return (
    <div className="rounded-[34px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),rgba(34,211,238,0.045)] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
        Player Portfolio
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">
        {session?.characterName || session?.username || "Unknown Vessel"}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Nilai asset yang sedang dimiliki dari Relic Exchange.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniMetric label="Value" value={formatSilver(portfolioValue)} />
        <MiniMetric label="Cost" value={formatSilver(portfolioCost)} />
        <MiniMetric
          label="P/L"
          value={formatSignedSilver(portfolioProfitLoss)}
          valueClass={
            portfolioProfitLoss > 0
              ? "text-emerald-200"
              : portfolioProfitLoss < 0
                ? "text-red-200"
                : "text-slate-300"
          }
        />
      </div>

      <div className="mt-5 space-y-3">
        {holdings.map((holding) => {
          const asset = assetMap.get(holding.asset_id);
          if (!asset) return null;

          const value = holding.quantity * asset.current_price;
          const cost = holding.quantity * holding.average_buy_price;
          const profitLoss = value - cost;

          return (
            <div
              key={holding.id}
              className="rounded-2xl border border-white/10 bg-black/22 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {asset.name}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Qty {holding.quantity} • Avg{" "}
                    {formatSilver(holding.average_buy_price)}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-sm font-black ${
                    profitLoss > 0
                      ? "text-emerald-200"
                      : profitLoss < 0
                        ? "text-red-200"
                        : "text-slate-300"
                  }`}
                >
                  {formatSignedSilver(profitLoss)}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Current value: {formatSilver(value)}
              </p>
            </div>
          );
        })}

        {holdings.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">
            Belum ada asset. Beli 1 unit dari Relic Exchange untuk mulai
            membangun portfolio.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RoyalTaxPolicyCard({
  policy,
  history,
  isAdmin,
  reviewing,
  onReview,
}: {
  policy: TaxPolicyRow | null;
  history: TaxPolicyHistoryRow[];
  isAdmin: boolean;
  reviewing: boolean;
  onReview: () => void;
}) {
  const status = getPolicyStatusStyle(policy?.status || "stable");

  const tiers = policy
    ? [
        [`0S–${policy.tier_0_max}S`, `${policy.tier_0_rate}%`],
        [
          `${policy.tier_1_min}S–${policy.tier_1_max}S`,
          `${policy.tier_1_rate}%`,
        ],
        [
          `${policy.tier_2_min}S–${policy.tier_2_max}S`,
          `${policy.tier_2_rate}%`,
        ],
        [
          `${policy.tier_3_min}S–${policy.tier_3_max}S`,
          `${policy.tier_3_rate}%`,
        ],
        [`${policy.tier_4_min}S+`, `${policy.tier_4_rate}%`],
      ]
    : [
        ["0S–50S", "0%"],
        ["51S–150S", "3%"],
        ["151S–300S", "5%"],
        ["301S–700S", "7%"],
        ["701S+", "10%"],
      ];

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_30%),rgba(255,255,255,0.045)] p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${status.glow}`} />
      <div className="absolute right-4 top-4 text-7xl opacity-[0.05]">⚖</div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
              Royal Tax Policy
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {policy?.decree_name || "Balanced Treasury Order"}
            </h2>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${status.badge}`}
          >
            {status.label}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {policy?.reason ||
            "Treasury Lunaria berada dalam kondisi seimbang. Pajak dipertahankan agar ekonomi guild tetap stabil."}
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/22 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            Policy Reading
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{status.note}</p>

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-400">
            <div className="flex items-center justify-between gap-3">
              <span>Last Review</span>
              <span className="text-right font-bold text-slate-200">
                {formatDate(policy?.last_review_at)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span>Next Review</span>
              <span className="text-right font-bold text-amber-200">
                {formatDate(policy?.next_review_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {tiers.map(([range, rate]) => (
            <div
              key={range}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/22 px-4 py-3"
            >
              <span className="text-sm font-bold text-slate-300">{range}</span>
              <span className="text-sm font-black text-amber-200">{rate}</span>
            </div>
          ))}
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={onReview}
            disabled={reviewing}
            className="mt-5 w-full rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-400/16 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reviewing ? "Reviewing..." : "Run Tax Policy Review"}
          </button>
        ) : null}

        <div className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
            Recent Policy History
          </p>

          <div className="mt-3 space-y-2">
            {history.slice(0, 3).map((item) => {
              const itemStatus = getPolicyStatusStyle(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">
                        {item.decree_name}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${itemStatus.badge}`}
                    >
                      {itemStatus.label}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                    {item.reason}
                  </p>
                </div>
              );
            })}

            {history.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-400">
                Belum ada riwayat policy selain decree aktif.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchivedAssetViewer({
  assets,
  restoringAssetId,
  onRestore,
}: {
  assets: MarketAssetRow[];
  restoringAssetId: string | null;
  onRestore: (asset: MarketAssetRow) => void;
}) {
  return (
    <section className="mt-6 rounded-[34px] border border-purple-300/15 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_32%),rgba(168,85,247,0.045)] p-5 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-300">
            Sealed Archive Vault
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Archived Market Assets
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Asset yang disegel dari market aktif akan disimpan di vault ini.
            Admin bisa membuka segel dan mengembalikannya ke Relic Exchange.
          </p>
        </div>

        <span className="rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-purple-100">
          {assets.length} Sealed
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {assets.map((asset) => {
          const risk = getRiskStyle(asset.risk_level);
          const restoring = restoringAssetId === asset.id;

          return (
            <article
              key={asset.id}
              className="rounded-[26px] border border-white/10 bg-black/24 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-lg">
                    {asset.icon}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-white">
                      {asset.name}
                    </h3>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                      {asset.asset_key}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${risk.badge}`}
                >
                  Sealed
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                {asset.description}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniMetric label="Price" value={formatSilver(asset.current_price)} />
                <MiniMetric label="Risk" value={risk.label} />
                <MiniMetric label="Updated" value={formatDate(asset.updated_at)} />
              </div>

              <button
                type="button"
                onClick={() => onRestore(asset)}
                disabled={Boolean(restoringAssetId)}
                className="mt-4 w-full rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100 transition hover:bg-emerald-400/16 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restoring ? "Restoring..." : "Restore Asset"}
              </button>
            </article>
          );
        })}

        {assets.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-400">
            Belum ada sealed asset. Kalau admin archive asset dari Relic
            Exchange, catatannya akan muncul di vault ini.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-sm font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function LedgerItem({ entry }: { entry: LedgerRow }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/22 p-4 transition hover:border-white/16 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{entry.title}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
            {entry.player_name ? `${entry.player_name} • ` : ""}
            {entry.entry_type} • {formatDate(entry.created_at)}
          </p>
        </div>

        <span className="shrink-0 text-sm font-black text-amber-200">
          {formatSilver(entry.amount)}
        </span>
      </div>

      {entry.description ? (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {entry.description}
        </p>
      ) : null}

      {entry.balance_before !== null && entry.balance_after !== null ? (
        <p className="mt-2 text-[11px] font-bold text-slate-500">
          Balance: {formatSilver(entry.balance_before)} →{" "}
          {formatSilver(entry.balance_after)}
        </p>
      ) : null}
    </div>
  );
}

function ActiveActionCard({
  title,
  description,
  icon,
  loading,
  buttonLabel,
  onClick,
  tone = "cyan",
}: {
  title: string;
  description: string;
  icon: string;
  loading: boolean;
  buttonLabel: string;
  onClick: () => void;
  tone?: "cyan" | "amber" | "emerald";
}) {
  const styles =
    tone === "amber"
      ? {
          card: "border-amber-300/20 bg-amber-400/[0.06] shadow-[0_0_28px_rgba(245,158,11,0.06)]",
          icon: "border-amber-300/20 bg-amber-400/10 text-amber-100",
          button:
            "border-amber-300/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/16",
        }
      : tone === "emerald"
        ? {
            card: "border-emerald-300/20 bg-emerald-400/[0.06] shadow-[0_0_28px_rgba(16,185,129,0.06)]",
            icon: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
            button:
              "border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/16",
          }
        : {
            card: "border-cyan-300/20 bg-cyan-400/[0.06] shadow-[0_0_28px_rgba(34,211,238,0.06)]",
            icon: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
            button:
              "border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/16",
          };

  return (
    <div className={`rounded-[26px] border p-5 ${styles.card}`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg ${styles.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">{title}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {description}
          </p>

          <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className={`mt-4 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 ${styles.button}`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
