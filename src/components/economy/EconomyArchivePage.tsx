"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  ledger: LedgerRow[];
  assets: MarketAssetRow[];
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
    };
  }

  if (risk === "medium") {
    return {
      label: "Medium Risk",
      badge: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
      range: "-12% sampai +15%",
    };
  }

  if (risk === "high") {
    return {
      label: "High Risk",
      badge: "border-amber-300/30 bg-amber-400/10 text-amber-100",
      range: "-25% sampai +30%",
    };
  }

  if (risk === "forbidden") {
    return {
      label: "Forbidden Risk",
      badge: "border-red-300/35 bg-red-500/12 text-red-100",
      range: "-45% sampai +60%",
    };
  }

  return {
    label: riskLevel || "Unknown",
    badge: "border-white/15 bg-white/[0.06] text-slate-200",
    range: "Tidak diketahui",
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
      return "Forbidden relic demand is rising in the shadow market.";
    }

    if (change.percent < 0) {
      return "Relic panic spreads through hidden merchant circles.";
    }

    return "The forbidden market is silent, but unstable.";
  }

  if (asset.asset_key.includes("pearl")) {
    if (change.percent > 0) return "Sea route stable, pearl demand rising.";
    if (change.percent < 0) return "Storm reports weaken merchant confidence.";
    return "Azure Coast trade remains calm.";
  }

  if (asset.asset_key.includes("ore")) {
    if (change.percent > 0) {
      return "Blacksmith demand pushes ore contracts upward.";
    }

    if (change.percent < 0) {
      return "Cinderpeak monster activity disrupts mining routes.";
    }

    return "Ore caravans are waiting for safer passage.";
  }

  if (asset.asset_key.includes("herb")) {
    if (change.percent > 0) {
      return "Healers request more luminous herbs after recent quests.";
    }

    if (change.percent < 0) return "Herb supply is stable, lowering urgency.";

    return "Everglow herbal trade remains steady.";
  }

  if (asset.asset_key.includes("grain")) {
    if (change.percent > 0) return "Village harvest records look favorable.";
    if (change.percent < 0) return "Poor road conditions slow grain delivery.";
    return "Moonlit grain supply is stable.";
  }

  return asset.flavor || "Market movement is currently quiet.";
}

export default function EconomyArchivePage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [data, setData] = useState<EconomyData>({
    treasury: null,
    ledger: [],
    assets: [],
    history: [],
    holdings: [],
  });

  const [loading, setLoading] = useState(true);
  const [updatingMarket, setUpdatingMarket] = useState(false);
  const [runningTax, setRunningTax] = useState(false);
  const [runningRelief, setRunningRelief] = useState(false);
  const [tradingAssetId, setTradingAssetId] = useState<string | null>(null);

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

  async function loadEconomy() {
    setLoading(true);

    const storedSession = getStoredSession();
    setSession(storedSession);

    const [
      treasuryResult,
      ledgerResult,
      assetsResult,
      historyResult,
      holdingsResult,
    ] = await Promise.all([
      supabase
        .from("economy_treasury")
        .select("*")
        .eq("id", "main")
        .maybeSingle(),
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
    if (ledgerResult.error) console.error("Ledger load error:", ledgerResult.error);
    if (assetsResult.error) console.error("Assets load error:", assetsResult.error);
    if (historyResult.error) console.error("History load error:", historyResult.error);
    if (holdingsResult.error) console.error("Holdings load error:", holdingsResult.error);

    setData({
      treasury: (treasuryResult.data as TreasuryRow | null) || null,
      ledger: (ledgerResult.data as LedgerRow[]) || [],
      assets: (assetsResult.data as MarketAssetRow[]) || [],
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
    const confirmed = window.confirm(
      "Jalankan Weekly Guild Tax sekarang? Saldo player aktif akan dipotong otomatis berdasarkan tier pajak. Sistem akan menolak jika pajak sudah dijalankan dalam 7 hari terakhir."
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

  async function handleDistributeRelief() {
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

  async function handleUpdateMarketPrices() {
    const confirmed = window.confirm(
      "Update harga Relic Exchange sekarang? Harga semua market asset akan naik/turun otomatis berdasarkan risk roll."
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
    <main className="min-h-screen bg-[#050711] px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.16),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,0.10),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-5 shadow-[0_0_60px_rgba(0,0,0,0.35)] sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-300">
                Lunaria Economy Archive
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Royal Treasury
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Pusat arsip ekonomi guild: pajak mingguan, dana bansos, dan
                Relic Exchange fantasy market. Sistem ini dibuat untuk mencegah
                inflasi tanpa bikin player kecil makin berat.
              </p>
            </div>

            <button
              type="button"
              onClick={loadEconomy}
              disabled={loading}
              className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-amber-100 transition hover:bg-amber-400/16 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh Archive"}
            </button>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Treasury Balance"
              value={formatSilver(data.treasury?.treasury_balance || 0)}
              note="Dana pajak tersimpan"
              icon="♛"
              tone="amber"
            />
            <StatCard
              label="Tax Collected"
              value={formatSilver(data.treasury?.total_tax_collected || 0)}
              note="Total pajak terkumpul"
              icon="⚖"
              tone="red"
            />
            <StatCard
              label="Relief Distributed"
              value={formatSilver(data.treasury?.total_relief_distributed || 0)}
              note="Total bansos keluar"
              icon="✦"
              tone="emerald"
            />
            <StatCard
              label="Market Index"
              value={formatSilver(totalMarketValue)}
              note={`${data.assets.length} active assets`}
              icon="◇"
              tone="cyan"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ScheduleCard
              title="Weekly Tax"
              value={formatDate(data.treasury?.last_tax_run_at)}
              description="Pajak mingguan untuk mencegah inflasi ekonomi guild."
              badge="Anti Inflation"
            />
            <ScheduleCard
              title="Relief Ledger"
              value={formatDate(data.treasury?.last_relief_run_at)}
              description="Dana bansos untuk player saldo rendah."
              badge="Welfare Fund"
            />
            <ScheduleCard
              title="Market Update"
              value={formatDate(data.treasury?.last_market_update_at)}
              description="Harga Relic Exchange naik-turun berdasarkan risk dan event."
              badge="Fantasy Market"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_0_30px_rgba(255,255,255,0.025)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                Relic Exchange
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Fantasy Market Assets
              </h2>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
              Live Market
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.assets.map((asset) => {
              const holding = holdingMap.get(asset.id);

              return (
                <MarketAssetCard
                  key={asset.id}
                  asset={asset}
                  holdingQuantity={holding?.quantity || 0}
                  averageBuyPrice={holding?.average_buy_price || 0}
                  tradingAssetId={tradingAssetId}
                  onBuy={() => handleBuyAsset(asset)}
                  onSell={() => handleSellAsset(asset)}
                />
              );
            })}

            {!loading && data.assets.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-slate-400">
                Belum ada market asset. Cek lagi SQL seed di Supabase.
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

          <TaxRulesCard />

          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
              Economy Ledger
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Latest Records
            </h2>

            <div className="mt-5 space-y-3">
              {data.ledger.map((entry) => (
                <LedgerItem key={entry.id} entry={entry} />
              ))}

              {!loading && data.ledger.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
                  Belum ada ledger. Nanti akan terisi saat pajak, bansos, buy,
                  sell, atau market update berjalan.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-300">
              Admin Economy Controls
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Treasury Operations
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Pajak, bansos, dan market sudah bisa dijalankan manual oleh admin.
              Semua punya cooldown agar ekonomi tidak rusak.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ActiveActionCard
            title="Run Weekly Tax"
            description="Potong pajak otomatis berdasarkan tier saldo player aktif. Terkunci otomatis selama 7 hari setelah dijalankan."
            icon="⚖"
            loading={runningTax}
            buttonLabel={runningTax ? "Running..." : "Run Weekly Tax"}
            onClick={handleRunWeeklyTax}
            tone="amber"
          />

          <ActiveActionCard
            title="Distribute Relief"
            description="Bansos otomatis 10S untuk player aktif dengan saldo 50S ke bawah. Terkunci otomatis selama 7 hari setelah dijalankan."
            icon="✦"
            loading={runningRelief}
            buttonLabel={runningRelief ? "Distributing..." : "Distribute Relief"}
            onClick={handleDistributeRelief}
            tone="emerald"
          />

          <ActiveActionCard
            title="Update Market Prices"
            description="Harga market naik-turun otomatis dengan random risk roll dan market event."
            icon="◇"
            loading={updatingMarket}
            buttonLabel={updatingMarket ? "Updating..." : "Run Market Update"}
            onClick={handleUpdateMarketPrices}
            tone="cyan"
          />
        </div>
      </section>
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
  const toneClass = {
    amber: "text-amber-200 border-amber-300/20 bg-amber-400/10",
    red: "text-red-200 border-red-300/20 bg-red-400/10",
    emerald: "text-emerald-200 border-emerald-300/20 bg-emerald-400/10",
    cyan: "text-cyan-200 border-cyan-300/20 bg-cyan-400/10",
  }[tone];

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/24 p-5">
      <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-white/[0.035] blur-xl" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{note}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl ${toneClass}`}
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
    <div className="rounded-[24px] border border-white/10 bg-black/22 p-5">
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
  tradingAssetId,
  onBuy,
  onSell,
}: {
  asset: MarketAssetRow;
  holdingQuantity: number;
  averageBuyPrice: number;
  tradingAssetId: string | null;
  onBuy: () => void;
  onSell: () => void;
}) {
  const risk = getRiskStyle(asset.risk_level);
  const change = getChangeInfo(asset.current_price, asset.previous_price);
  const mood = getMarketMood(asset);
  const buying = tradingAssetId === `${asset.id}:buy`;
  const selling = tradingAssetId === `${asset.id}:sell`;
  const isTrading = Boolean(tradingAssetId);

  const profitLoss =
    holdingQuantity > 0 ? (asset.current_price - averageBuyPrice) * holdingQuantity : 0;

  return (
    <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.72),rgba(2,6,23,0.84))] p-5">
      <div className="absolute right-4 top-4 text-6xl opacity-[0.07]">
        {asset.icon}
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-xl">
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

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/24 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            Market Status
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
            {mood}
          </p>
          <p className="mt-2 text-xs text-slate-500">Range: {risk.range}</p>
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
    <div className="rounded-[30px] border border-cyan-300/15 bg-cyan-400/[0.045] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
        Player Portfolio
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">
        {session?.characterName || session?.username || "Unknown Vessel"}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Asset fantasy yang sedang dimiliki player dari Relic Exchange.
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
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {asset.name}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Qty {holding.quantity} • Avg {formatSilver(holding.average_buy_price)}
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
          <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
            Belum ada asset. Beli 1 unit dari Relic Exchange untuk mulai portfolio.
          </p>
        ) : null}
      </div>
    </div>
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

function TaxRulesCard() {
  const tiers = [
    ["0S–50S", "0%"],
    ["51S–150S", "3%"],
    ["151S–300S", "5%"],
    ["301S–700S", "7%"],
    ["701S+", "10%"],
  ];

  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">
        Weekly Tax Rules
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        Anti Inflation Tax
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Pajak dibuat bertingkat. Player kecil aman, player kaya membantu
        treasury guild.
      </p>

      <div className="mt-5 space-y-2">
        {tiers.map(([range, rate]) => (
          <div
            key={range}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <span className="text-sm font-bold text-slate-300">{range}</span>
            <span className="text-sm font-black text-amber-200">{rate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LedgerItem({ entry }: { entry: LedgerRow }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
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
    <div className={`rounded-[24px] border p-5 ${styles.card}`}>
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
