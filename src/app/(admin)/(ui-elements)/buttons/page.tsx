"use client";

import React, { useMemo, useState } from "react";

type CosmeticTier = "Rare" | "Epic" | "Legendary";
type CosmeticCategory = "Particle" | "Aura" | "Border" | "Background";

type CosmeticItem = {
  id: string;
  symbol: string;
  name: string;
  family: string;
  category: CosmeticCategory;
  tier: CosmeticTier;
  price: number;
  description: string;
  premiumLine: string;
  bestFor: string;
  motionLabel: string;
  theme: "forest" | "ocean" | "cloud" | "bone" | "vampire" | "thunder";
  surface: string;
  accent: string;
};

const COSMETICS: CosmeticItem[] = [
  {
    id: "forest-whisper",
    symbol: "❈",
    name: "Verdant Whisper Bloom",
    family: "Forest Theme",
    category: "Particle",
    tier: "Rare",
    price: 48,
    description:
      "Serbuk cahaya hutan, daun lembut, dan kabut hijau redup yang bergerak perlahan di sekitar ID Card.",
    premiumLine:
      "Memberi nuansa alam suci yang tenang, hidup, dan terasa mahal tanpa membuat tampilan terlalu ramai.",
    bestFor: "ID Card natural, healer, ranger, druid, atau karakter bertema alam.",
    motionLabel: "Floating leaves · soft mist · green spores",
    theme: "forest",
    surface:
      "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(16,185,129,0.12), transparent 30%), linear-gradient(135deg, rgba(4,16,20,0.94), rgba(3,8,20,0.96))",
    accent:
      "linear-gradient(90deg, rgba(34,197,94,0.32), rgba(16,185,129,0.15), rgba(56,189,248,0.12))",
  },
  {
    id: "ocean-tide",
    symbol: "◈",
    name: "Abyssal Tide Halo",
    family: "Sea Theme",
    category: "Aura",
    tier: "Epic",
    price: 96,
    description:
      "Aura laut biru gelap dengan kilau ombak, bubble drift, dan arus cahaya yang menyapu halus dari samping.",
    premiumLine:
      "Terasa dingin, bersih, berkelas, dan cocok untuk profile yang ingin terlihat elite serta menenangkan.",
    bestFor: "Karakter pelaut, mage air, noble laut, atau profile bertema samudra malam.",
    motionLabel: "Liquid sweep · deep bubbles · tide shimmer",
    theme: "ocean",
    surface:
      "radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(6,182,212,0.16), transparent 32%), linear-gradient(135deg, rgba(3,14,28,0.95), rgba(4,8,18,0.97))",
    accent:
      "linear-gradient(90deg, rgba(59,130,246,0.28), rgba(6,182,212,0.20), rgba(125,211,252,0.14))",
  },
  {
    id: "cloudveil",
    symbol: "✦",
    name: "Cloudveil Reverie",
    family: "Sky Theme",
    category: "Background",
    tier: "Epic",
    price: 88,
    description:
      "Lapisan awan lembut, glow putih kebiruan, dan bintang kecil yang bergerak pelan seperti langit dini hari.",
    premiumLine:
      "Tampil ringan, anggun, dreamy, dan sangat cocok untuk player yang ingin kesan elegan tanpa agresif.",
    bestFor: "Karakter suci, celestial, support, princess, mage langit, atau profile yang soft.",
    motionLabel: "Soft cloud drift · moon haze · starlit dust",
    theme: "cloud",
    surface:
      "radial-gradient(circle at top left, rgba(244,244,255,0.10), transparent 24%), radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 28%), linear-gradient(135deg, rgba(11,13,30,0.95), rgba(4,8,18,0.97))",
    accent:
      "linear-gradient(90deg, rgba(226,232,240,0.16), rgba(147,197,253,0.18), rgba(168,85,247,0.20))",
  },
  {
    id: "ossuary-relic",
    symbol: "⟡",
    name: "Ossuary Relic Frame",
    family: "Bone Theme",
    category: "Border",
    tier: "Epic",
    price: 112,
    description:
      "Fragmen tulang kuno, debu pucat, dan glow fosil redup yang mengitari frame seperti artefak terkutuk yang mewah.",
    premiumLine:
      "Tidak norak, tidak kasar, tetapi tetap memberi identitas dark-fantasy yang sangat kuat dan eksklusif.",
    bestFor: "Necromancer, undead theme, relic hunter, dark priest, atau aesthetic gothic-bone.",
    motionLabel: "Pale shards · relic dust · ossuary glow",
    theme: "bone",
    surface:
      "radial-gradient(circle at top left, rgba(245,222,179,0.12), transparent 24%), radial-gradient(circle at bottom right, rgba(148,163,184,0.14), transparent 30%), linear-gradient(135deg, rgba(14,11,12,0.96), rgba(8,10,18,0.97))",
    accent:
      "linear-gradient(90deg, rgba(214,211,209,0.18), rgba(161,161,170,0.16), rgba(245,158,11,0.12))",
  },
  {
    id: "crimson-nocturne",
    symbol: "☽",
    name: "Crimson Nocturne Veil",
    family: "Vampire Theme",
    category: "Aura",
    tier: "Legendary",
    price: 168,
    description:
      "Kabut merah anggur, ember darah, kilau malam aristokrat, dan pulse gelap yang terasa seperti ballroom vampire.",
    premiumLine:
      "Sangat mewah, sensual, dominan, dan cocok untuk player yang ingin aura mahal dengan identitas kuat.",
    bestFor: "Vampire, noble malam, dark queen, blood mage, atau profile berkelas dengan vibe berbahaya.",
    motionLabel: "Crimson veil · ember pulse · nocturne haze",
    theme: "vampire",
    surface:
      "radial-gradient(circle at top left, rgba(220,38,38,0.18), transparent 26%), radial-gradient(circle at bottom right, rgba(190,24,93,0.18), transparent 30%), linear-gradient(135deg, rgba(20,5,10,0.96), rgba(6,8,18,0.97))",
    accent:
      "linear-gradient(90deg, rgba(220,38,38,0.28), rgba(190,24,93,0.18), rgba(126,34,206,0.16))",
  },
  {
    id: "storm-crown",
    symbol: "⚡",
    name: "Storm Crown Pulse",
    family: "Thunder Theme",
    category: "Particle",
    tier: "Legendary",
    price: 182,
    description:
      "Arc petir elegan, kilatan energi, dan shock pulse biru-ungu yang bergerak dinamis namun tetap bersih.",
    premiumLine:
      "Terkesan cepat, elite, dominan, dan sangat menarik untuk player yang ingin profile terlihat high-tier.",
    bestFor: "Storm knight, assassin cepat, thunder mage, boss character, atau profile prestige tinggi.",
    motionLabel: "Electric arcs · flash pulse · royal voltage",
    theme: "thunder",
    surface:
      "radial-gradient(circle at top left, rgba(250,204,21,0.16), transparent 26%), radial-gradient(circle at bottom right, rgba(96,165,250,0.18), transparent 30%), linear-gradient(135deg, rgba(8,10,24,0.97), rgba(6,8,20,0.97))",
    accent:
      "linear-gradient(90deg, rgba(250,204,21,0.25), rgba(96,165,250,0.20), rgba(129,140,248,0.18))",
  },
];

const CATEGORIES: Array<"All" | CosmeticCategory> = [
  "All",
  "Particle",
  "Aura",
  "Border",
  "Background",
];

export default function CosmeticVaultPage() {
  const [activeCategory, setActiveCategory] =
    useState<"All" | CosmeticCategory>("All");

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return COSMETICS;
    return COSMETICS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-4 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-amber-400/15 bg-[linear-gradient(135deg,rgba(17,10,5,0.28),rgba(3,7,18,0.82),rgba(40,20,80,0.28))] shadow-[0_25px_80px_rgba(2,6,23,0.45)]">
          <div className="relative overflow-hidden p-5 md:p-7 lg:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%)]" />

            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-amber-300">
                  Lunaria Cosmetic Vault
                </div>

                <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">
                  Premium Cosmetic Collection
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                  Koleksi visual Lunaria untuk membuat ID Card, profile, dan
                  presence guild terasa lebih hidup. Setiap cosmetic di bawah
                  punya identitas visual yang berbeda, motion yang berbeda, dan
                  value yang berbeda — bukan sekadar recolor biasa.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <StatCapsule
                    title="Visual Identity"
                    value="Distinct Themes"
                    note="Setiap item punya tema dan motion sendiri."
                  />
                  <StatCapsule
                    title="Premium Motion"
                    value="Live Animation"
                    note="Partikel, kabut, glow, arc, dan drift bergerak."
                  />
                  <StatCapsule
                    title="Purchase Value"
                    value="Tiered Quality"
                    note="Semakin tinggi tier, semakin mewah efeknya."
                  />
                </div>
              </div>

              <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[360px] xl:max-w-[380px] xl:grid-cols-1">
                <SidePanel
                  title="Moonlit Standard"
                  text="Cosmetic umum dibuat berbeda dari visual Top Leaderboard agar benefit Top 3 tetap eksklusif."
                />
                <SidePanel
                  title="Live Theme Preview"
                  text="Preview di setiap card sudah memakai gerakan. Jadi player langsung bisa menilai feel sebelum beli."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap gap-3">
          {CATEGORIES.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                  active
                    ? "border-amber-400/35 bg-amber-500/15 text-amber-300 shadow-[0_0_28px_rgba(245,158,11,0.10)]"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredItems.map((item) => (
            <CosmeticCard key={item.id} item={item} />
          ))}
        </section>
      </div>

      <style jsx global>{`
        .cosmetic-grid-bg {
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 34px 34px;
        }

        .preview-stage {
          position: relative;
          overflow: hidden;
          height: 190px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: linear-gradient(
            135deg,
            rgba(5, 8, 20, 0.95),
            rgba(8, 11, 30, 0.95)
          );
          box-shadow: inset 0 0 80px rgba(255, 255, 255, 0.02);
        }

        .preview-stage::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.65;
          pointer-events: none;
        }

        .preview-stage::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 24px;
          box-shadow: inset 0 0 80px rgba(255, 255, 255, 0.02);
          pointer-events: none;
        }

        /* FOREST */
        .forest .forest-glow {
          position: absolute;
          inset: -20% auto auto -10%;
          width: 65%;
          height: 75%;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.25), transparent 65%);
          filter: blur(24px);
          animation: forestPulse 5s ease-in-out infinite;
        }

        .forest .forest-mist {
          position: absolute;
          bottom: -10px;
          left: -10%;
          width: 130%;
          height: 55%;
          background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.20), transparent 60%);
          filter: blur(20px);
          animation: mistSlide 10s linear infinite alternate;
        }

        .forest .forest-leaf {
          position: absolute;
          width: 16px;
          height: 10px;
          border-radius: 16px 16px 16px 2px;
          background: linear-gradient(135deg, rgba(134, 239, 172, 0.95), rgba(34, 197, 94, 0.55));
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.22);
          transform: rotate(20deg);
        }

        .forest .f1 { top: 24px; left: 50px; animation: leafFloat1 6s ease-in-out infinite; }
        .forest .f2 { top: 54px; right: 70px; animation: leafFloat2 7s ease-in-out infinite; }
        .forest .f3 { bottom: 48px; left: 120px; animation: leafFloat3 5.8s ease-in-out infinite; }
        .forest .f4 { top: 76px; left: 230px; animation: leafFloat2 6.8s ease-in-out infinite; }

        .forest .forest-spore {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(134, 239, 172, 0.9);
          box-shadow: 0 0 12px rgba(74, 222, 128, 0.45);
        }

        .forest .s1 { top: 30px; right: 35px; animation: sparkleUp 4s ease-in-out infinite; }
        .forest .s2 { bottom: 30px; left: 42px; animation: sparkleUp 5s ease-in-out infinite 0.8s; }
        .forest .s3 { top: 110px; right: 130px; animation: sparkleUp 4.5s ease-in-out infinite 0.4s; }

        /* OCEAN */
        .ocean .ocean-wave {
          position: absolute;
          left: -18%;
          right: -18%;
          bottom: 22px;
          height: 70px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(8, 47, 73, 0.05),
            rgba(56, 189, 248, 0.28),
            rgba(8, 47, 73, 0.05)
          );
          filter: blur(3px);
          animation: waveSweep 8s linear infinite;
        }

        .ocean .ocean-aura {
          position: absolute;
          inset: 10% 5% auto auto;
          width: 55%;
          height: 65%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent 70%);
          filter: blur(18px);
          animation: oceanPulse 6s ease-in-out infinite;
        }

        .ocean .bubble {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(125,211,252,0.28));
          border: 1px solid rgba(186, 230, 253, 0.2);
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.16);
        }

        .ocean .b1 { width: 10px; height: 10px; left: 40px; bottom: 18px; animation: bubbleRise 6.5s linear infinite; }
        .ocean .b2 { width: 14px; height: 14px; left: 110px; bottom: 8px; animation: bubbleRise 8s linear infinite 1s; }
        .ocean .b3 { width: 8px; height: 8px; right: 80px; bottom: 14px; animation: bubbleRise 6s linear infinite 0.5s; }
        .ocean .b4 { width: 12px; height: 12px; right: 150px; bottom: 0px; animation: bubbleRise 7.2s linear infinite 1.8s; }

        /* CLOUD */
        .cloud .cloud-mass,
        .cloud .cloud-mass-2,
        .cloud .cloud-mass-3 {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(191,219,254,0.22));
          filter: blur(2px);
          opacity: 0.9;
        }

        .cloud .cloud-mass { width: 110px; height: 42px; left: 30px; top: 55px; animation: cloudDrift 11s ease-in-out infinite; }
        .cloud .cloud-mass-2 { width: 88px; height: 34px; right: 45px; top: 38px; animation: cloudDriftAlt 13s ease-in-out infinite; }
        .cloud .cloud-mass-3 { width: 140px; height: 48px; left: 130px; bottom: 36px; animation: cloudDrift 12s ease-in-out infinite 1.2s; }

        .cloud .moon-haze {
          position: absolute;
          top: 18px;
          right: 22px;
          width: 95px;
          height: 95px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(224,231,255,0.28), transparent 68%);
          filter: blur(8px);
          animation: hazeGlow 6s ease-in-out infinite;
        }

        .cloud .star {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 0 14px rgba(255,255,255,0.55);
        }

        .cloud .st1 { left: 70px; top: 24px; animation: twinkle 2.4s ease-in-out infinite; }
        .cloud .st2 { left: 180px; top: 34px; animation: twinkle 2s ease-in-out infinite 0.6s; }
        .cloud .st3 { right: 90px; bottom: 58px; animation: twinkle 2.8s ease-in-out infinite 0.4s; }
        .cloud .st4 { left: 260px; bottom: 34px; animation: twinkle 2.2s ease-in-out infinite 1s; }

        /* BONE */
        .bone .bone-haze {
          position: absolute;
          inset: auto 0 -10px 0;
          height: 60%;
          background: radial-gradient(circle at 50% 60%, rgba(214,211,209,0.10), transparent 65%);
          filter: blur(20px);
          animation: mistSlide 9s linear infinite alternate;
        }

        .bone .bone-shard {
          position: absolute;
          width: 36px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(245,245,244,0.85), rgba(214,211,209,0.38));
          box-shadow: 0 0 14px rgba(214,211,209,0.12);
        }

        .bone .bone-shard::before,
        .bone .bone-shard::after {
          content: "";
          position: absolute;
          top: -5px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(245,245,244,0.82);
        }

        .bone .bone-shard::before { left: -4px; }
        .bone .bone-shard::after { right: -4px; }

        .bone .bs1 { top: 36px; left: 40px; transform: rotate(-18deg); animation: relicFloat 6.5s ease-in-out infinite; }
        .bone .bs2 { top: 90px; right: 55px; transform: rotate(15deg); animation: relicFloatAlt 7.2s ease-in-out infinite; }
        .bone .bs3 { bottom: 34px; left: 150px; transform: rotate(-8deg); animation: relicFloat 5.8s ease-in-out infinite 0.8s; }

        .bone .bone-dust {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: rgba(245, 245, 244, 0.85);
          box-shadow: 0 0 10px rgba(214,211,209,0.35);
        }

        .bone .bd1 { left: 90px; bottom: 22px; animation: sparkleUp 4.5s ease-in-out infinite; }
        .bone .bd2 { right: 110px; top: 28px; animation: sparkleUp 5.2s ease-in-out infinite 0.9s; }
        .bone .bd3 { left: 240px; top: 102px; animation: sparkleUp 4.8s ease-in-out infinite 0.4s; }

        /* VAMPIRE */
        .vampire .vampire-glow {
          position: absolute;
          inset: auto auto 20px 20px;
          width: 140px;
          height: 140px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(220,38,38,0.25), transparent 66%);
          filter: blur(12px);
          animation: crimsonPulse 4.8s ease-in-out infinite;
        }

        .vampire .blood-mist {
          position: absolute;
          left: -8%;
          right: -8%;
          top: 42px;
          height: 80px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(127,29,29,0.08), rgba(220,38,38,0.18), rgba(190,24,93,0.15), rgba(127,29,29,0.08));
          filter: blur(16px);
          animation: veilDrift 10s ease-in-out infinite alternate;
        }

        .vampire .ember {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(251,113,133,0.95);
          box-shadow: 0 0 14px rgba(244,63,94,0.4);
        }

        .vampire .e1 { left: 55px; bottom: 20px; animation: emberRise 5.6s linear infinite; }
        .vampire .e2 { left: 130px; bottom: 10px; animation: emberRise 4.8s linear infinite 0.9s; }
        .vampire .e3 { right: 65px; bottom: 14px; animation: emberRise 6.2s linear infinite 1.1s; }
        .vampire .e4 { right: 140px; bottom: 0; animation: emberRise 5.3s linear infinite 0.5s; }

        .vampire .bat {
          position: absolute;
          width: 18px;
          height: 9px;
          border-radius: 999px 999px 0 0;
          background: rgba(255,255,255,0.12);
          filter: blur(0.3px);
        }

        .vampire .bat::before,
        .vampire .bat::after {
          content: "";
          position: absolute;
          top: -2px;
          width: 8px;
          height: 8px;
          border-radius: 999px 999px 0 0;
          background: rgba(255,255,255,0.10);
        }

        .vampire .bat::before { left: -6px; transform: rotate(-22deg); }
        .vampire .bat::after { right: -6px; transform: rotate(22deg); }

        .vampire .bt1 { top: 36px; right: 90px; animation: batFly 8s ease-in-out infinite; }
        .vampire .bt2 { top: 80px; left: 180px; animation: batFlyAlt 9.2s ease-in-out infinite; }

        /* THUNDER */
        .thunder .storm-core {
          position: absolute;
          top: 24px;
          right: 32px;
          width: 130px;
          height: 130px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(96,165,250,0.25), transparent 68%);
          filter: blur(12px);
          animation: electricPulse 4.2s ease-in-out infinite;
        }

        .thunder .bolt {
          position: absolute;
          width: 5px;
          height: 72px;
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(96,165,250,0.75), rgba(250,204,21,0.55));
          clip-path: polygon(40% 0%, 100% 0%, 62% 44%, 100% 44%, 20% 100%, 42% 58%, 0% 58%);
          filter: drop-shadow(0 0 12px rgba(96,165,250,0.45));
          opacity: 0.95;
        }

        .thunder .t1 { left: 70px; top: 32px; transform: scale(1.1) rotate(6deg); animation: boltFlash 3s ease-in-out infinite; }
        .thunder .t2 { left: 180px; top: 76px; transform: scale(0.9) rotate(-8deg); animation: boltFlash 3.8s ease-in-out infinite 0.8s; }
        .thunder .t3 { right: 84px; top: 66px; transform: scale(1.05) rotate(8deg); animation: boltFlash 3.3s ease-in-out infinite 0.3s; }

        .thunder .electric-ring {
          position: absolute;
          left: 24px;
          right: 24px;
          bottom: 18px;
          height: 46px;
          border-radius: 999px;
          border: 1px solid rgba(96,165,250,0.16);
          background: linear-gradient(90deg, rgba(59,130,246,0.04), rgba(96,165,250,0.14), rgba(59,130,246,0.04));
          filter: blur(0.2px);
          animation: ringPulse 3.6s ease-in-out infinite;
        }

        /* KEYFRAMES */
        @keyframes forestPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes mistSlide {
          0% { transform: translateX(-2%) translateY(0); }
          50% { transform: translateX(3%) translateY(-2px); }
          100% { transform: translateX(-1%) translateY(0); }
        }

        @keyframes leafFloat1 {
          0%, 100% { transform: translateY(0) rotate(20deg); opacity: 0.8; }
          50% { transform: translateY(-12px) translateX(6px) rotate(34deg); opacity: 1; }
        }

        @keyframes leafFloat2 {
          0%, 100% { transform: translateY(0) rotate(-12deg); opacity: 0.75; }
          50% { transform: translateY(10px) translateX(-4px) rotate(12deg); opacity: 1; }
        }

        @keyframes leafFloat3 {
          0%, 100% { transform: translateY(0) translateX(0) rotate(10deg); opacity: 0.8; }
          50% { transform: translateY(-8px) translateX(8px) rotate(28deg); opacity: 1; }
        }

        @keyframes sparkleUp {
          0% { transform: translateY(6px); opacity: 0.25; }
          50% { opacity: 1; }
          100% { transform: translateY(-12px); opacity: 0.2; }
        }

        @keyframes waveSweep {
          0% { transform: translateX(-8%) scaleX(0.98); opacity: 0.65; }
          50% { transform: translateX(6%) scaleX(1.04); opacity: 1; }
          100% { transform: translateX(-6%) scaleX(0.98); opacity: 0.65; }
        }

        @keyframes oceanPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.06); opacity: 1; }
        }

        @keyframes bubbleRise {
          0% { transform: translateY(0) scale(0.75); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-120px) scale(1.05); opacity: 0; }
        }

        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0); opacity: 0.85; }
          50% { transform: translateX(20px); opacity: 1; }
        }

        @keyframes cloudDriftAlt {
          0%, 100% { transform: translateX(0); opacity: 0.8; }
          50% { transform: translateX(-18px); opacity: 1; }
        }

        @keyframes hazeGlow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes relicFloat {
          0%, 100% { transform: translateY(0) rotate(-18deg); opacity: 0.9; }
          50% { transform: translateY(-10px) rotate(-8deg); opacity: 1; }
        }

        @keyframes relicFloatAlt {
          0%, 100% { transform: translateY(0) rotate(15deg); opacity: 0.85; }
          50% { transform: translateY(8px) rotate(6deg); opacity: 1; }
        }

        @keyframes crimsonPulse {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes veilDrift {
          0% { transform: translateX(-2%); opacity: 0.55; }
          50% { transform: translateX(4%); opacity: 0.9; }
          100% { transform: translateX(-1%); opacity: 0.55; }
        }

        @keyframes emberRise {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          12% { opacity: 0.9; }
          100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
        }

        @keyframes batFly {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.7; }
          25% { transform: translateX(8px) translateY(-6px) scale(1.08); opacity: 1; }
          50% { transform: translateX(18px) translateY(2px) scale(0.95); opacity: 0.75; }
          75% { transform: translateX(8px) translateY(8px) scale(1.05); opacity: 1; }
        }

        @keyframes batFlyAlt {
          0%, 100% { transform: translateX(0) translateY(0) scale(0.92); opacity: 0.55; }
          50% { transform: translateX(-24px) translateY(-10px) scale(1.06); opacity: 0.95; }
        }

        @keyframes electricPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes boltFlash {
          0%, 100% { opacity: 0.25; filter: drop-shadow(0 0 8px rgba(96,165,250,0.2)); }
          10% { opacity: 0.95; filter: drop-shadow(0 0 18px rgba(96,165,250,0.55)); }
          20% { opacity: 0.35; }
          30% { opacity: 1; filter: drop-shadow(0 0 20px rgba(250,204,21,0.4)); }
          45% { opacity: 0.28; }
        }

        @keyframes ringPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.6; }
          50% { transform: scaleX(1.04); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function CosmeticCard({ item }: { item: CosmeticItem }) {
  return (
    <article
      className="cosmetic-grid-bg overflow-hidden rounded-[30px] border border-white/10 shadow-[0_20px_60px_rgba(2,6,23,0.38)]"
      style={{ background: item.surface }}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] text-2xl shadow-[inset_0_0_24px_rgba(255,255,255,0.05)]">
              <span>{item.symbol}</span>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
                {item.family}
              </p>
              <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                {item.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag>{item.category}</Tag>
                <Tag>{item.motionLabel}</Tag>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <TierBadge tier={item.tier} />
            <div className="mt-4 text-4xl font-black leading-none text-white">
              {item.price}
              <span className="ml-1 text-2xl text-amber-300">S</span>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-300">
          {item.description}
        </p>

        <p className="mt-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-300">
          {item.premiumLine}
        </p>

        <div className="mt-5">
          <PreviewByTheme theme={item.theme} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <DetailBlock
            title="Best For"
            value={item.bestFor}
          />
          <DetailBlock
            title="Visual Value"
            value={`Tier ${item.tier} · ${item.motionLabel}`}
          />
        </div>

        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center rounded-[22px] border border-amber-400/25 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.10)] transition hover:scale-[1.01] hover:border-amber-300/40 hover:text-white"
          style={{ background: item.accent }}
        >
          Buy Cosmetic
        </button>
      </div>
    </article>
  );
}

function PreviewByTheme({
  theme,
}: {
  theme: CosmeticItem["theme"];
}) {
  if (theme === "forest") {
    return (
      <div className="preview-stage forest">
        <div className="forest-glow" />
        <div className="forest-mist" />
        <span className="forest-leaf f1" />
        <span className="forest-leaf f2" />
        <span className="forest-leaf f3" />
        <span className="forest-leaf f4" />
        <span className="forest-spore s1" />
        <span className="forest-spore s2" />
        <span className="forest-spore s3" />
      </div>
    );
  }

  if (theme === "ocean") {
    return (
      <div className="preview-stage ocean">
        <div className="ocean-aura" />
        <div className="ocean-wave" />
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
      </div>
    );
  }

  if (theme === "cloud") {
    return (
      <div className="preview-stage cloud">
        <div className="moon-haze" />
        <div className="cloud-mass" />
        <div className="cloud-mass-2" />
        <div className="cloud-mass-3" />
        <span className="star st1" />
        <span className="star st2" />
        <span className="star st3" />
        <span className="star st4" />
      </div>
    );
  }

  if (theme === "bone") {
    return (
      <div className="preview-stage bone">
        <div className="bone-haze" />
        <span className="bone-shard bs1" />
        <span className="bone-shard bs2" />
        <span className="bone-shard bs3" />
        <span className="bone-dust bd1" />
        <span className="bone-dust bd2" />
        <span className="bone-dust bd3" />
      </div>
    );
  }

  if (theme === "vampire") {
    return (
      <div className="preview-stage vampire">
        <div className="vampire-glow" />
        <div className="blood-mist" />
        <span className="ember e1" />
        <span className="ember e2" />
        <span className="ember e3" />
        <span className="ember e4" />
        <span className="bat bt1" />
        <span className="bat bt2" />
      </div>
    );
  }

  return (
    <div className="preview-stage thunder">
      <div className="storm-core" />
      <span className="bolt t1" />
      <span className="bolt t2" />
      <span className="bolt t3" />
      <div className="electric-ring" />
    </div>
  );
}

function StatCapsule({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_0_24px_rgba(255,255,255,0.03)]">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
    </div>
  );
}

function SidePanel({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-300">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function DetailBlock({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-200">{value}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
      {children}
    </span>
  );
}

function TierBadge({ tier }: { tier: CosmeticTier }) {
  const map: Record<CosmeticTier, string> = {
    Rare: "border-sky-400/25 bg-sky-400/10 text-sky-300",
    Epic: "border-violet-400/25 bg-violet-400/10 text-violet-300",
    Legendary: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${map[tier]}`}
    >
      {tier}
    </span>
  );
  }
