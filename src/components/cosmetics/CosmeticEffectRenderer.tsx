 "use client";

import React from "react";
import type { CosmeticTheme } from "./data/cosmeticItems";

import SovereignTempestEffect from "./effects/SovereignTempestEffect";
import AbyssalLeviathanEffect from "./effects/AbyssalLeviathanEffect";
import CrimsonAristocratEffect from "./effects/CrimsonAristocratEffect";
import EtherealYggdrasilEffect from "./effects/EtherealYggdrasilEffect";
import IvoryOverlordEffect from "./effects/IvoryOverlordEffect";
import SovereignLunarEclipseEffect from "./effects/SovereignLunarEclipseEffect";
import CosmicEclipseEffect from "./effects/CosmicEclipseEffect";

type RendererVariant = "card" | "compact" | "preview";

type CosmeticEffectRendererProps = {
  theme: CosmeticTheme;
  variant?: RendererVariant;
};

type EffectVariant = "name" | "border" | "background" | "aura" | "particle" | "full";

export default function CosmeticEffectRenderer({
  theme,
  variant = "card",
}: CosmeticEffectRendererProps) {
  const effectVariant = getEffectVariant(variant);

  if (theme === "sovereign-tempest") {
    return <SovereignTempestEffect variant={effectVariant} />;
  }

  if (theme === "abyssal-leviathan") {
    return <AbyssalLeviathanEffect variant={effectVariant} />;
  }

  if (theme === "crimson-aristocrat") {
    return <CrimsonAristocratEffect variant={effectVariant} />;
  }

  if (theme === "ethereal-yggdrasil") {
    return <EtherealYggdrasilEffect variant={effectVariant} />;
  }

  if (theme === "ivory-overlord") {
    return <IvoryOverlordEffect variant={effectVariant} />;
  }

  if (theme === "sovereign-lunar-eclipse") {
    return (
      <SovereignLunarEclipseEffect
        variant={effectVariant}
        className={getDivineEffectClassName(variant)}
      />
    );
  }

  if (theme === "cosmic-eclipse") {
    return (
      <CosmicEclipseEffect
        variant={effectVariant}
        className={getDivineEffectClassName(variant)}
      />
    );
  }

  return null;
}

function getEffectVariant(_variant: RendererVariant): EffectVariant {
  return "full";
}

function getDivineEffectClassName(variant: RendererVariant) {
  if (variant === "compact") {
    return "absolute inset-0 rounded-[24px] opacity-80";
  }

  if (variant === "preview") {
    return "absolute inset-0 rounded-[32px] opacity-95";
  }

  return "absolute inset-0 rounded-[28px] opacity-90";
}
