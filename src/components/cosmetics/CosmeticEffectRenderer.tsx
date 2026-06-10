"use client";

import React from "react";
import type { CosmeticTheme, CosmeticType } from "./data/cosmeticItems";

import SovereignTempestEffect from "./effects/SovereignTempestEffect";
import AbyssalLeviathanEffect from "./effects/AbyssalLeviathanEffect";
import CrimsonAristocratEffect from "./effects/CrimsonAristocratEffect";
import EtherealYggdrasilEffect from "./effects/EtherealYggdrasilEffect";
import IvoryOverlordEffect from "./effects/IvoryOverlordEffect";
import SovereignLunarEclipseEffect from "./effects/SovereignLunarEclipseEffect";
import CosmicEclipseEffect from "./effects/CosmicEclipseEffect";

type RendererVariant = "card" | "compact" | "preview";

type DivineEffectVariant =
  | "name"
  | "border"
  | "background"
  | "aura"
  | "particle"
  | "full";

type CosmeticEffectRendererProps = {
  theme: CosmeticTheme;
  type?: CosmeticType;
  variant?: RendererVariant;
};

export default function CosmeticEffectRenderer({
  theme,
  type,
  variant = "card",
}: CosmeticEffectRendererProps) {
  if (theme === "sovereign-tempest") {
    return <SovereignTempestEffect variant="background" />;
  }

  if (theme === "abyssal-leviathan") {
    return <AbyssalLeviathanEffect variant={variant} />;
  }

  if (theme === "crimson-aristocrat") {
    return <CrimsonAristocratEffect variant={variant} />;
  }

  if (theme === "ethereal-yggdrasil") {
    return <EtherealYggdrasilEffect variant={variant} />;
  }

  if (theme === "ivory-overlord") {
    return <IvoryOverlordEffect variant={variant} />;
  }

  if (theme === "sovereign-lunar-eclipse") {
    return (
      <SovereignLunarEclipseEffect
        variant={getDivineEffectVariant(type)}
        className={getDivineEffectClassName(variant)}
      />
    );
  }

  if (theme === "cosmic-eclipse") {
    return (
      <CosmicEclipseEffect
        variant={getDivineEffectVariant(type)}
        className={getDivineEffectClassName(variant)}
      />
    );
  }

  return null;
}

function getDivineEffectVariant(type?: CosmeticType): DivineEffectVariant {
  if (type === "name_effect") return "name";
  if (type === "border") return "border";
  if (type === "background") return "background";
  if (type === "aura") return "aura";
  if (type === "particle") return "particle";

  return "full";
}

function getDivineEffectClassName(variant: RendererVariant) {
  if (variant === "compact") {
    return "absolute inset-0 rounded-[24px] opacity-90";
  }

  if (variant === "preview") {
    return "absolute inset-0 rounded-[32px] opacity-100";
  }

  return "absolute inset-0 rounded-[28px] opacity-95";
}
