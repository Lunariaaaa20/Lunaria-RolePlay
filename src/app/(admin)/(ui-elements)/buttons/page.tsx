 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type CosmeticSlot =
  | "Name Effect"
  | "Border Frame"
  | "Background Realm"
  | "Aura Field"
  | "Particle Effect";

type CosmeticTheme =
  | "Sovereign Tempest"
  | "Abyssal Leviathan"
  | "Crimson Aristocrat"
  | "Ethereal Yggdrasil"
  | "Ivory Overlord";

type CosmeticRarity = "Rare" | "Epic" | "Legendary" | "Mythic" | "Sovereign";

type CosmeticItem = {
  id: string;
  name: string;
  theme: CosmeticTheme;
  slot: CosmeticSlot;
  rarity: CosmeticRarity;
  price: number;
  icon: string;
  tagline: string;
  description: string;
  motion: string;
};

type LunariaSession = {
  role: "player" | "admin";
  playerId?: string;
  characterName?: string;
  username?: string;
};

const cosmetics: CosmeticItem[] = [
  {
    id: "tempest-name",
    name: "Tempest Crown Script",
    theme: "Sovereign Tempest",
    slot: "Name Effect",
    rarity: "Rare",
    price: 45,
    icon: "♕",
    tagline: "Crown letters wrapped in divine stormlight.",
    description:
      "Efek nama berbentuk huruf kerajaan dengan cahaya petir emas yang bergerak dari satu sisi teks ke sisi lain.",
    motion: "Micro lightning, gold shimmer, cloud pulse",
  },
  {
    id: "tempest-border",
    name: "Stormcrest Frame",
    theme: "Sovereign Tempest",
    slot: "Border Frame",
    rarity: "Epic",
    price: 85,
    icon: "⚡",
    tagline: "A noble border forged from thunderclouds.",
    description:
      "Bingkai badai elegan dengan awan ungu gelap dan kilatan emas kecil yang muncul secara ritmis.",
    motion: "Cloud drift, violet spark, frame glow",
  },
  {
    id: "tempest-bg",
    name: "Sky Dominion",
    theme: "Sovereign Tempest",
    slot: "Background Realm",
    rarity: "Legendary",
    price: 145,
    icon: "☁",
    tagline: "A royal storm sky behind your identity.",
    description:
      "Latar langit malam badai dengan hujan cahaya emas dan kedalaman awan yang terasa seperti realm para dewa.",
    motion: "Gold rain, depth haze, storm glow",
  },
  {
    id: "tempest-aura",
    name: "Voltage Halo",
    theme: "Sovereign Tempest",
    slot: "Aura Field",
    rarity: "Mythic",
    price: 230,
    icon: "✧",
    tagline: "Static divinity circling the adventurer.",
    description:
      "Aura listrik halus mengelilingi ID Card, memberi kesan karakter memiliki tekanan magis tinggi.",
    motion: "Static pulse, edge distortion, divine ring",
  },
  {
    id: "tempest-particle",
    name: "Thunder Bloom",
    theme: "Sovereign Tempest",
    slot: "Particle Effect",
    rarity: "Sovereign",
    price: 350,
    icon: "✦",
    tagline: "Golden thunder particles blooming in silence.",
    description:
      "Partikel petir kecil mekar seperti bunga cahaya, bergerak lembut tanpa membuat tampilan ramai.",
    motion: "Lightning bloom, gold dust, slow pulse",
  },

  {
    id: "abyssal-name",
    name: "Tideglass Nameflow",
    theme: "Abyssal Leviathan",
    slot: "Name Effect",
    rarity: "Rare",
    price: 50,
    icon: "≈",
    tagline: "Letters filled with flowing sapphire water.",
    description:
      "Efek nama bertekstur air safir dengan gelembung kecil yang naik dan pecah perlahan.",
    motion: "Fluid text, bubble rise, aqua shimmer",
  },
  {
    id: "abyssal-border",
    name: "Leviathan Coral Frame",
    theme: "Abyssal Leviathan",
    slot: "Border Frame",
    rarity: "Epic",
    price: 95,
    icon: "◇",
    tagline: "Crystal coral frame from the deep sea.",
    description:
      "Border karang kristal bercahaya dengan garis bioluminescent yang bergerak seperti arus laut.",
    motion: "Coral glow, soft wave, pearl flicker",
  },
  {
    id: "abyssal-bg",
    name: "Abyssal Sanctum",
    theme: "Abyssal Leviathan",
    slot: "Background Realm",
    rarity: "Legendary",
    price: 160,
    icon: "◌",
    tagline: "A deep ocean sanctuary of quiet luxury.",
    description:
      "Background laut dalam dengan god rays, plankton glow, dan atmosfer dingin yang mahal.",
    motion: "God rays, plankton blink, deep drift",
  },
  {
    id: "abyssal-aura",
    name: "Biolume Ripple",
    theme: "Abyssal Leviathan",
    slot: "Aura Field",
    rarity: "Mythic",
    price: 245,
    icon: "◍",
    tagline: "A living ripple around the character soul.",
    description:
      "Aura riak air biru-hijau yang mengitari ID Card, memberi kesan tenang, mahal, dan misterius.",
    motion: "Ripple ring, aqua pulse, soft refraction",
  },
  {
    id: "abyssal-particle",
    name: "Spirit Koi Drift",
    theme: "Abyssal Leviathan",
    slot: "Particle Effect",
    rarity: "Sovereign",
    price: 370,
    icon: "☄",
    tagline: "Spirit fish drifting through lunar water.",
    description:
      "Partikel ikan spirit transparan yang melintas lembut seperti cahaya hidup di bawah laut.",
    motion: "Spirit koi, bubble trail, pearl dust",
  },

  {
    id: "crimson-name",
    name: "Blood Oath Script",
    theme: "Crimson Aristocrat",
    slot: "Name Effect",
    rarity: "Rare",
    price: 55,
    icon: "✒",
    tagline: "An aristocratic name sealed in ruby light.",
    description:
      "Efek nama emas kusam dengan kilau ruby halus, seperti tanda tangan bangsawan malam.",
    motion: "Ruby drip, smoke fade, antique shimmer",
  },
  {
    id: "crimson-border",
    name: "Rosecrest Nocturne",
    theme: "Crimson Aristocrat",
    slot: "Border Frame",
    rarity: "Epic",
    price: 105,
    icon: "✥",
    tagline: "A gothic frame wrapped by black roses.",
    description:
      "Border victoria mewah dengan mawar hitam dan kelopak merah gelap yang jatuh perlahan.",
    motion: "Rose fall, velvet mist, gold edge",
  },
  {
    id: "crimson-bg",
    name: "Crimson Cathedral",
    theme: "Crimson Aristocrat",
    slot: "Background Realm",
    rarity: "Legendary",
    price: 175,
    icon: "◈",
    tagline: "A blood moon cathedral for noble souls.",
    description:
      "Background kastil gothic dengan kaca patri dan blood moon yang memberi aura aristokrat gelap.",
    motion: "Moon haze, stained glow, velvet fog",
  },
  {
    id: "crimson-aura",
    name: "Scarlet Veil",
    theme: "Crimson Aristocrat",
    slot: "Aura Field",
    rarity: "Mythic",
    price: 260,
    icon: "☽",
    tagline: "A red veil crawling beneath the profile.",
    description:
      "Aura kabut merah tipis yang bergerak di bawah kartu, elegan, misterius, dan tidak berlebihan.",
    motion: "Low mist, ruby pulse, shadow breath",
  },
  {
    id: "crimson-particle",
    name: "Bat Ash Waltz",
    theme: "Crimson Aristocrat",
    slot: "Particle Effect",
    rarity: "Sovereign",
    price: 390,
    icon: "♟",
    tagline: "Tiny bats dissolving into noble gold ash.",
    description:
      "Partikel siluet kelelawar kecil yang muncul sesaat lalu memudar menjadi debu emas gelap.",
    motion: "Bat sweep, ash fade, rose spark",
  },

  {
    id: "ygg-name",
    name: "Rootsong Glyph",
    theme: "Ethereal Yggdrasil",
    slot: "Name Effect",
    rarity: "Rare",
    price: 45,
    icon: "♧",
    tagline: "Living root letters from the ancient forest.",
    description:
      "Efek nama seperti akar bercahaya yang tumbuh halus, membawa nuansa alam suci dan hangat.",
    motion: "Root pulse, pollen sparkle, leaf glow",
  },
  {
    id: "ygg-border",
    name: "Elderbranch Embrace",
    theme: "Ethereal Yggdrasil",
    slot: "Border Frame",
    rarity: "Epic",
    price: 90,
    icon: "❧",
    tagline: "A sacred branch frame embracing the ID Card.",
    description:
      "Border ranting pohon peri dengan daun kecil bercahaya yang muncul perlahan di sisi kartu.",
    motion: "Branch breath, leaf drift, fairy blink",
  },
  {
    id: "ygg-bg",
    name: "Yggdrasil Hollow",
    theme: "Ethereal Yggdrasil",
    slot: "Background Realm",
    rarity: "Legendary",
    price: 155,
    icon: "✿",
    tagline: "A glowing forest hollow beneath the moon.",
    description:
      "Background hutan kuno dengan cahaya hijau zamrud, air terjun jauh, dan kedalaman alam fantasy.",
    motion: "Forest breath, distant glow, pollen rise",
  },
  {
    id: "ygg-aura",
    name: "Sylvan Grace",
    theme: "Ethereal Yggdrasil",
    slot: "Aura Field",
    rarity: "Mythic",
    price: 235,
    icon: "🜁",
    tagline: "A gentle fairy aura around the adventurer.",
    description:
      "Aura hijau-emas yang lembut seperti perlindungan peri kuno, cocok untuk karakter natural dan healer.",
    motion: "Fairy ring, soft spores, emerald pulse",
  },
  {
    id: "ygg-particle",
    name: "Butterfly Stardust",
    theme: "Ethereal Yggdrasil",
    slot: "Particle Effect",
    rarity: "Sovereign",
    price: 360,
    icon: "✺",
    tagline: "Luminous butterflies leaving golden stardust.",
    description:
      "Partikel kupu-kupu cahaya kecil bergerak mengitari area kartu dan meninggalkan debu bintang halus.",
    motion: "Butterfly orbit, stardust trail, leaf float",
  },

  {
    id: "ivory-name",
    name: "Soulbone Insignia",
    theme: "Ivory Overlord",
    slot: "Name Effect",
    rarity: "Rare",
    price: 60,
    icon: "☠",
    tagline: "Polished ivory letters lit by soul fire.",
    description:
      "Efek nama tulang gading mewah dengan retakan kecil yang memancarkan api jiwa cyan.",
    motion: "Crack glow, cyan ember, ivory shine",
  },
  {
    id: "ivory-border",
    name: "Ivory Crown Frame",
    theme: "Ivory Overlord",
    slot: "Border Frame",
    rarity: "Epic",
    price: 115,
    icon: "♜",
    tagline: "A royal bone frame with cold blue smoke.",
    description:
      "Border mahkota tulang elegan dengan asap biru turun perlahan, dark fantasy tapi tetap mahal.",
    motion: "Soul smoke, bone shine, cold pulse",
  },
  {
    id: "ivory-bg",
    name: "Throne of Pale Flame",
    theme: "Ivory Overlord",
    slot: "Background Realm",
    rarity: "Legendary",
    price: 190,
    icon: "♛",
    tagline: "An ivory throne surrounded by calm soulfire.",
    description:
      "Background singgasana gading di tengah api biru yang tenang, memberi kesan penguasa dark fantasy.",
    motion: "Blue flame, ash rise, throne glow",
  },
  {
    id: "ivory-aura",
    name: "Soulfire Dominion",
    theme: "Ivory Overlord",
    slot: "Aura Field",
    rarity: "Mythic",
    price: 285,
    icon: "♢",
    tagline: "A cold cyan dominion around the character.",
    description:
      "Aura api jiwa cyan yang bergerak pelan di sekitar ID Card, terasa kuat dan intimidating.",
    motion: "Soul ring, cyan flare, gravity drift",
  },
  {
    id: "ivory-particle",
    name: "Ashen Spirit Orbit",
    theme: "Ivory Overlord",
    slot: "Particle Effect",
    rarity: "Sovereign",
    price: 420,
    icon: "☾",
    tagline: "Pale spirits orbiting through royal ash.",
    description:
      "Partikel roh kecil berbentuk flame cyan mengorbit halus dan meninggalkan abu putih tulang.",
    motion: "Spirit orbit, ash lift, soul flicker",
  },
];

const themeFilters: Array<"All" | CosmeticTheme> = [
  "All",
  "Sovereign Tempest",
  "Abyssal Leviathan",
  "Crimson Aristocrat",
  "Ethereal Yggdrasil",
  "Ivory Overlord",
];

const slotFilters: Array<"All" | CosmeticSlot> = [
  "All",
  "Name Effect",
  "Border Frame",
  "Background Realm",
  "Aura Field",
  "Particle Effect",
];

function getSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem("lunaria_session") ||
    sessionStorage.getItem("lunaria_session");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as LunariaSession;
  } catch {
    return null;
  }
}

function getThemeStyle(theme: CosmeticTheme) {
  if (theme === "Sovereign Tempest") {
    return {
      short: "Tempest",
      animation: "storm",
      text: "text-amber-200",
      glow: "shadow-[0_0_45px_rgba(245,158,11,0.12)]",
      card:
        "border-amber-300/25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_34%),linear-gradient(135deg,rgba(12,15,32,0.96),rgba(27,20,50,0.90))]",
      badge: "border-amber-300/30 bg-amber-400/10 text-amber-200",
      button:
        "border-amber-300/35 bg-gradient-to-r from-amber-700/35 via-violet-600/25 to-amber-500/20 text-amber-100",
    };
  }

  if (theme === "Abyssal Leviathan") {
    return {
      short: "Abyssal",
      animation: "abyss",
      text: "text-cyan-200",
      glow: "shadow-[0_0_45px_rgba(34,211,238,0.10)]",
      card:
        "border-cyan-300/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_35%),linear-gradient(135deg,rgba(3,16,35,0.96),rgba(6,36,56,0.88))]",
      badge: "border-cyan-300/30 bg-cyan-400/10 text-cyan-200",
      button:
        "border-cyan-300/35 bg-gradient-to-r from-cyan-700/30 via-blue-600/25 to-emerald-500/20 text-cyan-100",
    };
  }

  if (theme === "Crimson Aristocrat") {
    return {
      short: "Crimson",
      animation: "crimson",
      text: "text-red-200",
      glow: "shadow-[0_0_45px_rgba(248,113,113,0.10)]",
      card:
        "border-red-300/25 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.20),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_35%),linear-gradient(135deg,rgba(22,5,14,0.96),rgba(45,12,24,0.88))]",
      badge: "border-red-300/30 bg-red-400/10 text-red-200",
      button:
        "border-red-300/35 bg-gradient-to-r from-red-900/35 via-rose-700/25 to-amber-700/20 text-red-100",
    };
  }

  if (theme === "Ethereal Yggdrasil") {
    return {
      short: "Yggdrasil",
      animation: "forest",
      text: "text-emerald-200",
      glow: "shadow-[0_0_45px_rgba(52,211,153,0.10)]",
      card:
        "border-emerald-300/25 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_34%),linear-gradient(135deg,rgba(4,24,19,0.96),rgba(14,39,28,0.88))]",
      badge: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
      button:
        "border-emerald-300/35 bg-gradient-to-r from-emerald-700/30 via-lime-600/20 to-amber-500/20 text-emerald-100",
    };
  }

  return {
    short: "Ivory",
    animation: "ivory",
    text: "text-sky-100",
    glow: "shadow-[0_0_45px_rgba(125,211,252,0.10)]",
    card:
      "border-sky-200/25 bg-[radial-gradient(circle_at_top_left,rgba(226,232,240,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,rgba(8,13,24,0.96),rgba(18,28,42,0.88))]",
    badge: "border-sky-200/30 bg-sky-300/10 text-sky-100",
    button:
      "border-sky-200/35 bg-gradient-to-r from-slate-600/30 via-cyan-700/25 to-blue-500/20 text-sky-100",
  };
}

function getRarityStyle(rarity: CosmeticRarity) {
  if (rarity === "Rare") return "border-sky-300/30 bg-sky-400/10 text-sky-200";
  if (rarity === "Epic")
    return "border-violet-300/30 bg-violet-400/10 text-violet-200";
  if (rarity === "Legendary")
    return "border-amber-300/30 bg-amber-400/10 text-amber-200";
  if (rarity === "Mythic")
    return "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-200";
  return "border-yellow-200/40 bg-yellow-300/10 text-yellow-100";
}

export default function PremiumCosmeticVaultPage() {
  const [session, setSession] = useState<LunariaSession | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [themeFilter, setThemeFilter] = useState<"All" | CosmeticTheme>("All");
  const [slotFilter, setSlotFilter] = useState<"All" | CosmeticSlot>("All");
  const [selectedItem, setSelectedItem] = useState<CosmeticItem | null>(null);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBuying, setIsBuying] = useState<string | null>(null);

  const filteredCosmetics = useMemo(() => {
    return cosmetics.filter((item) => {
      const themeMatch = themeFilter === "All" || item.theme === themeFilter;
      const slotMatch = slotFilter === "All" || item.slot === slotFilter;
      return themeMatch && slotMatch;
    });
  }, [themeFilter, slotFilter]);

  const groupedCosmetics = useMemo(() => {
    const themes = cosmetics.reduce((acc, item) => {
      if (!acc[item.theme]) acc[item.theme] = [];
      acc[item.theme].push(item);
      return acc;
    }, {} as Record<CosmeticTheme, CosmeticItem[]>);

    return themes;
  }, []);

  const featuredItem = cosmetics.find((item) => item.id === "tempest-particle");

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    if (currentSession?.role === "player" && currentSession.playerId) {
      loadPlayerData(currentSession.playerId);
    }
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 4200);
  };

  const loadPlayerData = async (playerId: string) => {
    const { data, error } = await supabase
      .from("players")
      .select("id, silver")
      .eq("id", playerId)
      .maybeSingle();

    if (!error && data) {
      setBalance(Number(data.silver || 0));
    }

    const localOwned = localStorage.getItem(`lunaria_owned_cosmetics_${playerId}`);
    if (localOwned) {
      try {
        setOwnedIds(JSON.parse(localOwned));
      } catch {
        setOwnedIds([]);
      }
    }
  };

  const handleBuy = async (item: CosmeticItem) => {
    if (!session || session.role !== "player" || !session.playerId) {
      showError("Login sebagai player dulu untuk membeli cosmetic.");
      return;
    }

    if (ownedIds.includes(item.id)) {
      showNotice("Cosmetic ini sudah kamu miliki.");
      return;
    }

    if (balance === null) {
      showError("Balance player belum terbaca. Refresh halaman dulu.");
      return;
    }

    if (balance < item.price) {
      showError(`Silver tidak cukup. Butuh ${item.price}S.`);
      return;
    }

    const confirmed = window.confirm(
      `Beli ${item.name} seharga ${item.price}S?`
    );

    if (!confirmed) return;

    setIsBuying(item.id);
    setErrorMessage("");

    const nextBalance = balance - item.price;

    const { error: updateError } = await supabase
      .from("players")
      .update({ silver: nextBalance })
      .eq("id", session.playerId);

    if (updateError) {
      setIsBuying(null);
      showError(`Purchase failed: ${updateError.message}`);
      return;
    }

    await supabase.from("currency_logs").insert({
      player_id: session.playerId,
      type: "cosmetic_purchase",
      silver_change: -item.price,
      reason: `Purchased cosmetic: ${item.name}`,
    });

    await supabase.from("player_cosmetics").insert({
      player_id: session.playerId,
      cosmetic_key: item.id,
      cosmetic_name: item.name,
      cosmetic_type: item.slot,
      theme: item.theme,
      rarity: item.rarity,
      price: item.price,
      is_equipped: false,
    });

    const nextOwned = [...ownedIds, item.id];
    localStorage.setItem(
      `lunaria_owned_cosmetics_${session.playerId}`,
      JSON.stringify(nextOwned)
    );

    setOwnedIds(nextOwned);
    setBalance(nextBalance);
    setIsBuying(null);
    showNotice(`${item.name} berhasil dibeli.`);
  };

  return (
    <main className="relative space-y-6 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
        <div className="absolute left-[8%] top-[18%] h-2 w-2 animate-lunaria-orb rounded-full bg-amber-300/60 blur-[1px]" />
        <div className="absolute right-[16%] top-[28%] h-2 w-2 animate-lunaria-orb-delay rounded-full bg-violet-300/50 blur-[1px]" />
        <div className="absolute bottom-[16%] left-[44%] h-2 w-2 animate-lunaria-orb-slow rounded-full bg-cyan-300/50 blur-[1px]" />
      </div>

      <section className="relative z-10 overflow-hidden rounded-[34px] border border-amber-300/20 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.30),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.88))] p-6 shadow-[0_0_70px_rgba(245,158,11,0.12)] md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-8">
            <div className="inline-flex rounded-full border border-amber-300/25 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-amber-200">
              Moonlit Cosmetic Vault
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Premium Identity Collection
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Vault kosmetik resmi Lunaria. Kumpulkan efek nama, border,
              background, aura, dan partikel bertema eksklusif untuk membentuk
              identitas adventurer yang hidup, mahal, dan tidak tergantikan.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <VaultStat label="Cosmetics" value="25" />
              <VaultStat label="Themes" value="5" />
              <VaultStat label="Motion Sets" value="Live" />
              <VaultStat
                label="Balance"
                value={
                  session?.role === "player"
                    ? `${balance ?? "-"}S`
                    : session?.role === "admin"
                    ? "Admin"
                    : "-"
                }
              />
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-200">
                Vault Rule
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Cosmetic umum tidak memakai throne style leaderboard. Setiap
                tema punya motion, warna, dan rasa visual sendiri.
              </p>
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <section className="relative z-10 rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200">
          <p className="text-sm font-bold">{notice}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="relative z-10 rounded-[24px] border border-red-400/25 bg-red-400/10 p-5 text-red-200">
          <p className="text-sm font-bold">{errorMessage}</p>
        </section>
      ) : null}

      <section className="relative z-10 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-[30px] border border-white/10 bg-black/30 p-5 xl:col-span-7">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
            Filter by Theme
          </p>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {themeFilters.map((theme) => (
              <button
                key={theme}
                onClick={() => setThemeFilter(theme)}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                  themeFilter === theme
                    ? "border-amber-300/35 bg-amber-400/15 text-amber-200"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/30 p-5 xl:col-span-5">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
            Filter by Slot
          </p>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {slotFilters.map((slot) => (
              <button
                key={slot}
                onClick={() => setSlotFilter(slot)}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                  slotFilter === slot
                    ? "border-cyan-300/35 bg-cyan-400/15 text-cyan-200"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </section>

      {featuredItem ? (
        <section className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <CosmeticCard
              item={featuredItem}
              owned={ownedIds.includes(featuredItem.id)}
              buying={isBuying === featuredItem.id}
              large
              onPreview={() => setSelectedItem(featuredItem)}
              onBuy={() => handleBuy(featuredItem)}
            />
          </div>

          <div className="rounded-[34px] border border-amber-300/20 bg-black/35 p-6 xl:col-span-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              Featured Sovereign Piece
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">
              Thunder Bloom
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Item puncak dari Sovereign Tempest. Dibuat untuk player yang ingin
              ID Card terasa hidup, kuat, dan memiliki aura badai dewa tanpa
              terlihat ramai.
            </p>

            <div className="mt-6 space-y-3">
              <FeatureLine icon="⚡" text="Partikel petir mikro bergerak halus." />
              <FeatureLine icon="✦" text="Glow emas menyala secara lembut." />
              <FeatureLine icon="☁" text="Nuansa badai divine yang tidak mirip leaderboard." />
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative z-10 space-y-8">
        {themeFilters
          .filter((theme): theme is CosmeticTheme => theme !== "All")
          .map((theme) => {
            const style = getThemeStyle(theme);
            const items =
              themeFilter === "All"
                ? groupedCosmetics[theme].filter(
                    (item) => slotFilter === "All" || item.slot === slotFilter
                  )
                : filteredCosmetics.filter((item) => item.theme === theme);

            if (items.length === 0) return null;

            return (
              <div
                key={theme}
                className="rounded-[34px] border border-white/10 bg-black/25 p-5 md:p-6"
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className={`text-xs font-black uppercase tracking-[0.28em] ${style.text}`}>
                      {style.short} Collection
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-white">
                      {theme}
                    </h2>
                  </div>

                  <p className="max-w-xl text-sm leading-6 text-slate-400">
                    Complete set berisi Name, Border, Background, Aura, dan
                    Particle dengan motion khas tema ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {items.map((item) => (
                    <CosmeticCard
                      key={item.id}
                      item={item}
                      owned={ownedIds.includes(item.id)}
                      buying={isBuying === item.id}
                      onPreview={() => setSelectedItem(item)}
                      onBuy={() => handleBuy(item)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </section>

      {selectedItem ? (
        <PreviewModal
          item={selectedItem}
          owned={ownedIds.includes(selectedItem.id)}
          buying={isBuying === selectedItem.id}
          onClose={() => setSelectedItem(null)}
          onBuy={() => handleBuy(selectedItem)}
        />
      ) : null}

      <style jsx global>{`
        @keyframes lunaria-orb {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.45;
          }
          50% {
            transform: translate3d(18px, -26px, 0) scale(1.8);
            opacity: 1;
          }
        }

        @keyframes lunaria-orb-delay {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(-24px, 22px, 0) scale(1.6);
            opacity: 0.9;
          }
        }

        @keyframes lunaria-orb-slow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(28px, 14px, 0) scale(1.7);
            opacity: 0.85;
          }
        }

        .animate-lunaria-orb {
          animation: lunaria-orb 8s ease-in-out infinite;
        }

        .animate-lunaria-orb-delay {
          animation: lunaria-orb-delay 10s ease-in-out infinite;
        }

        .animate-lunaria-orb-slow {
          animation: lunaria-orb-slow 13s ease-in-out infinite;
        }

        @keyframes storm-line {
          0%, 100% {
            transform: translateX(-20%) rotate(-8deg);
            opacity: 0;
          }
          35% {
            opacity: 0.75;
          }
          60% {
            transform: translateX(85%) rotate(-8deg);
            opacity: 0.2;
          }
        }

        @keyframes bubble-rise {
          0% {
            transform: translateY(65px) scale(0.7);
            opacity: 0;
          }
          25% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-120px) scale(1.25);
            opacity: 0;
          }
        }

        @keyframes petal-fall {
          0% {
            transform: translateY(-80px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(150px) translateX(35px) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes leaf-drift {
          0% {
            transform: translateY(90px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          30% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-120px) translateX(-30px) rotate(140deg);
            opacity: 0;
          }
        }

        @keyframes soul-orbit {
          0% {
            transform: rotate(0deg) translateX(38px) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            opacity: 0.95;
          }
          100% {
            transform: rotate(360deg) translateX(38px) rotate(-360deg);
            opacity: 0.2;
          }
        }

        @keyframes preview-breath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.9;
          }
        }

        @keyframes shine-run {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          30% {
            opacity: 0.65;
          }
          100% {
            transform: translateX(140%);
            opacity: 0;
          }
        }

        .cosmetic-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 40%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.12),
            transparent
          );
          animation: shine-run 7s ease-in-out infinite;
          pointer-events: none;
        }

        .storm-particle {
          animation: storm-line 2.8s ease-in-out infinite;
        }

        .bubble-particle {
          animation: bubble-rise 5.5s ease-in-out infinite;
        }

        .petal-particle {
          animation: petal-fall 6.5s ease-in-out infinite;
        }

        .leaf-particle {
          animation: leaf-drift 6.2s ease-in-out infinite;
        }

        .soul-particle {
          animation: soul-orbit 5.8s linear infinite;
        }

        .preview-breath {
          animation: preview-breath 4.5s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

function VaultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-amber-200">{value}</p>
    </div>
  );
}

function CosmeticCard({
  item,
  owned,
  buying,
  large,
  onPreview,
  onBuy,
}: {
  item: CosmeticItem;
  owned: boolean;
  buying: boolean;
  large?: boolean;
  onPreview: () => void;
  onBuy: () => void;
}) {
  const style = getThemeStyle(item.theme);

  return (
    <article
      className={`cosmetic-shine relative overflow-hidden rounded-[34px] border p-5 ${style.card} ${style.glow} ${
        large ? "min-h-[520px]" : "min-h-[430px]"
      }`}
    >
      <CosmeticMotion theme={style.animation} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/15 bg-black/25 text-2xl">
          {item.icon}
        </div>

        <div className="text-right">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${getRarityStyle(
              item.rarity
            )}`}
          >
            {item.rarity}
          </span>
          <p className={`mt-3 text-4xl font-black ${style.text}`}>
            {item.price}S
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
          {item.slot}
        </p>
        <h3 className="mt-3 text-3xl font-black leading-tight text-white">
          {item.name}
        </h3>
        <p className={`mt-2 text-sm font-bold ${style.text}`}>{item.tagline}</p>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          {item.description}
        </p>
      </div>

      <div className="relative z-10 mt-7 rounded-[28px] border border-white/10 bg-black/25 p-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
          Live Motion Preview
        </p>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/30 p-5">
          <div className="preview-breath flex h-24 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04]">
            <PreviewSignature item={item} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Motion Layer
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-200">
            {item.motion}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={onPreview}
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
        >
          Preview Live
        </button>

        <button
          onClick={onBuy}
          disabled={owned || buying}
          className={`rounded-2xl border px-4 py-4 text-xs font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 ${style.button}`}
        >
          {owned ? "Owned" : buying ? "Buying..." : "Buy Cosmetic"}
        </button>
      </div>
    </article>
  );
}

function CosmeticMotion({ theme }: { theme: string }) {
  if (theme === "storm") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="storm-particle absolute left-2 top-16 h-[2px] w-40 bg-gradient-to-r from-transparent via-amber-200 to-transparent blur-[1px]" />
        <div className="storm-particle absolute left-20 top-40 h-[2px] w-56 bg-gradient-to-r from-transparent via-violet-300 to-transparent blur-[1px] [animation-delay:1.1s]" />
        <div className="absolute right-10 top-20 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />
      </div>
    );
  }

  if (theme === "abyss") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bubble-particle absolute bottom-6 left-[18%] h-3 w-3 rounded-full border border-cyan-200/40 bg-cyan-300/10" />
        <div className="bubble-particle absolute bottom-0 left-[46%] h-2 w-2 rounded-full border border-emerald-200/40 bg-emerald-300/10 [animation-delay:1.4s]" />
        <div className="bubble-particle absolute bottom-10 right-[20%] h-4 w-4 rounded-full border border-sky-200/40 bg-sky-300/10 [animation-delay:2.3s]" />
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(120deg,transparent,rgba(34,211,238,0.06),transparent)]" />
      </div>
    );
  }

  if (theme === "crimson") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="petal-particle absolute left-[18%] top-0 h-3 w-2 rounded-full bg-red-300/45 blur-[1px]" />
        <div className="petal-particle absolute left-[55%] top-2 h-3 w-2 rounded-full bg-rose-400/40 blur-[1px] [animation-delay:1.6s]" />
        <div className="petal-particle absolute right-[18%] top-4 h-3 w-2 rounded-full bg-amber-200/25 blur-[1px] [animation-delay:2.5s]" />
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-red-950/25 to-transparent" />
      </div>
    );
  }

  if (theme === "forest") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="leaf-particle absolute bottom-0 left-[20%] h-3 w-2 rounded-full bg-emerald-300/45 blur-[1px]" />
        <div className="leaf-particle absolute bottom-4 left-[62%] h-3 w-2 rounded-full bg-lime-300/35 blur-[1px] [animation-delay:1.2s]" />
        <div className="leaf-particle absolute bottom-8 right-[18%] h-2 w-2 rounded-full bg-amber-200/35 blur-[1px] [animation-delay:2.2s]" />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10" />
      <div className="soul-particle absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-cyan-200/60 blur-[2px]" />
      <div className="soul-particle absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-sky-400/50 blur-[2px] [animation-delay:1.4s]" />
      <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-cyan-950/20 to-transparent" />
    </div>
  );
}

function PreviewSignature({ item }: { item: CosmeticItem }) {
  const style = getThemeStyle(item.theme);

  return (
    <div className="text-center">
      <p className={`text-2xl font-black ${style.text}`}>{item.icon}</p>
      <p className="mt-2 text-sm font-black text-white">{item.name}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {item.slot}
      </p>
    </div>
  );
}

function FeatureLine({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-lg">
        {icon}
      </div>
      <p className="text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function PreviewModal({
  item,
  owned,
  buying,
  onClose,
  onBuy,
}: {
  item: CosmeticItem;
  owned: boolean;
  buying: boolean;
  onClose: () => void;
  onBuy: () => void;
}) {
  const style = getThemeStyle(item.theme);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div
        className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[34px] border p-6 ${style.card} ${style.glow}`}
      >
        <CosmeticMotion theme={style.animation} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.28em] ${style.text}`}>
              Live Preview
            </p>
            <h2 className="mt-3 text-4xl font-black text-white">{item.name}</h2>
            <p className="mt-2 text-sm text-slate-300">
              {item.theme} • {item.slot} • {item.rarity}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-200"
          >
            Close
          </button>
        </div>

        <div className="relative z-10 mt-8 rounded-[30px] border border-white/10 bg-black/30 p-6">
          <div className="preview-breath flex min-h-[260px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04]">
            <div className="text-center">
              <p className="text-6xl">{item.icon}</p>
              <p className={`mt-5 text-4xl font-black ${style.text}`}>
                {item.name}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                {item.description}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <VaultStat label="Price" value={`${item.price}S`} />
          <VaultStat label="Rarity" value={item.rarity} />
          <VaultStat label="Slot" value={item.slot} />
        </div>

        <button
          onClick={onBuy}
          disabled={owned || buying}
          className={`relative z-10 mt-6 w-full rounded-2xl border px-5 py-5 text-sm font-black uppercase tracking-[0.22em] transition disabled:cursor-not-allowed disabled:opacity-60 ${style.button}`}
        >
          {owned ? "Already Owned" : buying ? "Buying..." : "Buy Cosmetic"}
        </button>
      </div>
    </div>
  );
}
