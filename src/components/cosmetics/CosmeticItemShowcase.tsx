"use client";

import React from "react";
import type { CosmeticItem } from "./data/cosmeticItems";
import CosmeticEffectRenderer from "./CosmeticEffectRenderer";

type CosmeticItemShowcaseProps = {
  item: CosmeticItem;
  themeFont: string;
  themeMini: string;
  themeSpark: string;
  themeParticle: string;
};

function getTypeTitle(type: CosmeticItem["type"]) {
  if (type === "name_effect") return "Name Effect Demo";
  if (type === "border") return "ID Border Demo";
  if (type === "background") return "Background Realm Demo";
  if (type === "aura") return "Profile Aura Demo";
  if (type === "particle") return "Particle Field Demo";

  return "Cosmetic Demo";
}

function getThemeVisual(themeInput: CosmeticItem["theme"]) {
  const theme = String(themeInput);

  if (theme === "obsidian-monarch") {
    return {
      nameClass:
        "text-amber-100 drop-shadow-[0_0_14px_rgba(251,191,36,0.55)]",
      borderClass:
        "border-amber-300/55 shadow-[0_0_26px_rgba(245,158,11,0.22)]",
      auraClass:
        "border-amber-200/35 bg-amber-400/10 shadow-[0_0_34px_rgba(245,158,11,0.20)]",
      scene:
        "bg-[radial-gradient(circle_at_35%_20%,rgba(245,158,11,0.20),transparent_24%),linear-gradient(135deg,rgba(9,9,11,0.96),rgba(41,37,36,0.72),rgba(0,0,0,0.96))]",
      mark: "♛",
      title: "BLACK GLASS ROYALTY",
    };
  }

  if (theme === "blood-cathedral") {
    return {
      nameClass:
        "text-red-100 drop-shadow-[0_0_14px_rgba(248,113,113,0.58)]",
      borderClass:
        "border-red-300/55 shadow-[0_0_26px_rgba(220,38,38,0.24)]",
      auraClass:
        "border-red-200/35 bg-red-400/10 shadow-[0_0_34px_rgba(220,38,38,0.22)]",
      scene:
        "bg-[radial-gradient(circle_at_35%_20%,rgba(220,38,38,0.22),transparent_25%),linear-gradient(135deg,rgba(18,4,10,0.96),rgba(69,10,10,0.76),rgba(0,0,0,0.96))]",
      mark: "◆",
      title: "BLOOD NOBLE RITE",
    };
  }

  if (theme === "abyss-sovereign") {
    return {
      nameClass:
        "text-cyan-100 drop-shadow-[0_0_14px_rgba(103,232,249,0.60)]",
      borderClass:
        "border-cyan-300/55 shadow-[0_0_26px_rgba(34,211,238,0.24)]",
      auraClass:
        "border-cyan-200/35 bg-cyan-400/10 shadow-[0_0_34px_rgba(34,211,238,0.22)]",
      scene:
        "bg-[radial-gradient(circle_at_35%_20%,rgba(34,211,238,0.20),transparent_25%),linear-gradient(135deg,rgba(2,12,27,0.96),rgba(8,47,73,0.76),rgba(0,0,0,0.96))]",
      mark: "◇",
      title: "ABYSSAL CROWN DEPTH",
    };
  }

  if (theme === "thorn-empress") {
    return {
      nameClass:
        "text-emerald-100 drop-shadow-[0_0_14px_rgba(110,231,183,0.58)]",
      borderClass:
        "border-emerald-300/55 shadow-[0_0_26px_rgba(52,211,153,0.22)]",
      auraClass:
        "border-emerald-200/35 bg-emerald-400/10 shadow-[0_0_34px_rgba(52,211,153,0.22)]",
      scene:
        "bg-[radial-gradient(circle_at_35%_20%,rgba(52,211,153,0.20),transparent_25%),linear-gradient(135deg,rgba(3,22,17,0.96),rgba(20,83,45,0.72),rgba(0,0,0,0.96))]",
      mark: "✧",
      title: "THORNED FAIRY COURT",
    };
  }

  if (theme === "soulfire-tyrant") {
    return {
      nameClass:
        "text-cyan-50 drop-shadow-[0_0_14px_rgba(207,250,254,0.62)]",
      borderClass:
        "border-cyan-100/55 shadow-[0_0_26px_rgba(125,211,252,0.24)]",
      auraClass:
        "border-cyan-100/35 bg-cyan-300/10 shadow-[0_0_34px_rgba(125,211,252,0.24)]",
      scene:
        "bg-[radial-gradient(circle_at_35%_20%,rgba(207,250,254,0.16),transparent_25%),linear-gradient(135deg,rgba(5,9,18,0.96),rgba(15,23,42,0.76),rgba(0,0,0,0.98))]",
      mark: "☽",
      title: "SOULFIRE TYRANT ALTAR",
    };
  }

  return {
    nameClass: "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]",
    borderClass: "border-white/35",
    auraClass: "border-white/25 bg-white/10",
    scene:
      "bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))]",
    mark: "✦",
    title: "COSMETIC PREVIEW",
  };
}

export default function CosmeticItemShowcase({
  item,
  themeFont,
  themeMini,
  themeSpark,
  themeParticle,
}: CosmeticItemShowcaseProps) {
  const visual = getThemeVisual(item.theme);

  return (
    <div className="relative mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/45 p-4">
      <CosmeticEffectRenderer theme={item.theme} variant="compact" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.11),transparent_60%)]" />
      <div
        className={`absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r ${themeSpark}`}
      />
      <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {item.type === "name_effect" && (
        <NameEffectDemo
          item={item}
          themeFont={themeFont}
          themeMini={themeMini}
          themeParticle={themeParticle}
          visual={visual}
        />
      )}

      {item.type === "border" && (
        <BorderEffectDemo
          item={item}
          themeFont={themeFont}
          themeMini={themeMini}
          themeParticle={themeParticle}
          visual={visual}
        />
      )}

      {item.type === "background" && (
        <BackgroundEffectDemo
          item={item}
          themeFont={themeFont}
          themeMini={themeMini}
          themeParticle={themeParticle}
          visual={visual}
        />
      )}

      {item.type === "aura" && (
        <AuraEffectDemo
          item={item}
          themeFont={themeFont}
          themeMini={themeMini}
          themeParticle={themeParticle}
          visual={visual}
        />
      )}

      {item.type === "particle" && (
        <ParticleEffectDemo
          item={item}
          themeFont={themeFont}
          themeMini={themeMini}
          themeParticle={themeParticle}
          visual={visual}
        />
      )}

      <style jsx>{`
        @keyframes name-shine {
          0% {
            transform: translateX(-140%);
            opacity: 0;
          }
          35% {
            opacity: 0.65;
          }
          100% {
            transform: translateX(140%);
            opacity: 0;
          }
        }

        @keyframes border-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes aura-pulse {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.28;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.74;
          }
        }

        @keyframes showcase-float {
          0% {
            transform: translateY(20px) scale(0.75);
            opacity: 0;
          }
          30% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-58px) scale(1);
            opacity: 0;
          }
        }

        .name-shine {
          animation: name-shine 3.5s ease-in-out infinite;
        }

        .border-rotate {
          animation: border-rotate 8s linear infinite;
        }

        .aura-pulse {
          animation: aura-pulse 3.2s ease-in-out infinite;
        }

        .showcase-float {
          animation: showcase-float 4.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function NameEffectDemo({
  item,
  themeFont,
  themeMini,
  themeParticle,
  visual,
}: {
  item: CosmeticItem;
  themeFont: string;
  themeMini: string;
  themeParticle: string;
  visual: ReturnType<typeof getThemeVisual>;
}) {
  return (
    <div className="relative z-10 flex min-h-[118px] items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.045] px-4 text-center">
      <MiniFloatParticles particleClass={themeParticle} count={10} />

      <div className="relative">
        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">
          {getTypeTitle(item.type)}
        </p>

        <h4
          className={`relative mt-2 overflow-hidden text-2xl font-black leading-tight ${visual.nameClass}`}
          style={{ fontFamily: themeFont }}
        >
          <span>{item.previewLabel}</span>
          <span className="name-shine absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </h4>

        <p className={`mt-2 text-3xl ${themeMini}`}>{visual.mark}</p>
      </div>
    </div>
  );
}

function BorderEffectDemo({
  item,
  themeFont,
  themeMini,
  themeParticle,
  visual,
}: {
  item: CosmeticItem;
  themeFont: string;
  themeMini: string;
  themeParticle: string;
  visual: ReturnType<typeof getThemeVisual>;
}) {
  return (
    <div className="relative z-10 flex min-h-[128px] items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] px-4">
      <MiniFloatParticles particleClass={themeParticle} count={8} />

      <div
        className={`relative w-full max-w-[280px] overflow-hidden rounded-[22px] border bg-black/34 p-4 ${visual.borderClass}`}
      >
        <div className="border-rotate absolute -inset-20 bg-[conic-gradient(from_90deg,transparent,rgba(255,255,255,0.26),transparent,rgba(255,255,255,0.12),transparent)] opacity-70" />
        <div className="relative rounded-[18px] border border-white/10 bg-black/55 p-4 text-center">
          <p className={`text-3xl ${themeMini}`}>{visual.mark}</p>
          <p
            className="mt-2 text-base font-black text-white"
            style={{ fontFamily: themeFont }}
          >
            {item.previewLabel}
          </p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            Animated ID Frame
          </p>
        </div>
      </div>
    </div>
  );
}

function BackgroundEffectDemo({
  item,
  themeFont,
  themeMini,
  themeParticle,
  visual,
}: {
  item: CosmeticItem;
  themeFont: string;
  themeMini: string;
  themeParticle: string;
  visual: ReturnType<typeof getThemeVisual>;
}) {
  return (
    <div
      className={`relative z-10 min-h-[132px] overflow-hidden rounded-[20px] border border-white/10 ${visual.scene} p-4`}
    >
      <MiniFloatParticles particleClass={themeParticle} count={12} />

      <div className="absolute inset-x-8 bottom-8 h-12 rounded-full bg-black/35 blur-xl" />
      <div className="absolute bottom-5 left-1/2 h-16 w-32 -translate-x-1/2 rounded-t-full border border-white/10 bg-black/30" />
      <div className="absolute bottom-12 left-1/2 h-14 w-20 -translate-x-1/2 rounded-t-full border border-white/10 bg-white/[0.035]" />

      <div className="relative z-10 flex min-h-[100px] flex-col items-center justify-center text-center">
        <p className={`text-4xl ${themeMini}`}>{visual.mark}</p>
        <p
          className="mt-2 text-lg font-black text-white"
          style={{ fontFamily: themeFont }}
        >
          {item.previewLabel}
        </p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          {visual.title}
        </p>
      </div>
    </div>
  );
}

function AuraEffectDemo({
  item,
  themeFont,
  themeMini,
  themeParticle,
  visual,
}: {
  item: CosmeticItem;
  themeFont: string;
  themeMini: string;
  themeParticle: string;
  visual: ReturnType<typeof getThemeVisual>;
}) {
  return (
    <div className="relative z-10 flex min-h-[132px] items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] px-4 text-center">
      <MiniFloatParticles particleClass={themeParticle} count={10} />

      <div className={`aura-pulse absolute h-28 w-28 rounded-full border ${visual.auraClass}`} />
      <div className={`aura-pulse absolute h-20 w-20 rounded-full border ${visual.auraClass}`} />

      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/50 text-4xl">
        <span className={themeMini}>{visual.mark}</span>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <p
          className="text-base font-black text-white"
          style={{ fontFamily: themeFont }}
        >
          {item.previewLabel}
        </p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          Aura Pulse Active
        </p>
      </div>
    </div>
  );
}

function ParticleEffectDemo({
  item,
  themeFont,
  themeMini,
  themeParticle,
  visual,
}: {
  item: CosmeticItem;
  themeFont: string;
  themeMini: string;
  themeParticle: string;
  visual: ReturnType<typeof getThemeVisual>;
}) {
  return (
    <div className="relative z-10 flex min-h-[132px] items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] px-4 text-center">
      <MiniFloatParticles particleClass={themeParticle} count={22} />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_58%)]" />

      <div className="relative z-10">
        <p className={`text-5xl ${themeMini}`}>{visual.mark}</p>
        <p
          className="mt-2 text-lg font-black text-white"
          style={{ fontFamily: themeFont }}
        >
          {item.previewLabel}
        </p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          Dense Particle Field
        </p>
      </div>
    </div>
  );
}

function MiniFloatParticles({
  particleClass,
  count,
}: {
  particleClass: string;
  count: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={`showcase-particle-${index}`}
          className={`showcase-float absolute rounded-full ${particleClass}`}
          style={{
            left: `${8 + ((index * 17) % 84)}%`,
            top: `${32 + ((index * 23) % 48)}%`,
            width: `${index % 3 === 0 ? 7 : index % 2 === 0 ? 5 : 3}px`,
            height: `${index % 3 === 0 ? 7 : index % 2 === 0 ? 5 : 3}px`,
            animationDelay: `${index * 0.19}s`,
            animationDuration: `${3.1 + (index % 5) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
  }
