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

type SafeEffectProps = {
  variant?: string;
  className?: string;
};

const SafeSovereignTempestEffect =
  SovereignTempestEffect as React.ComponentType<SafeEffectProps>;
const SafeAbyssalLeviathanEffect =
  AbyssalLeviathanEffect as React.ComponentType<SafeEffectProps>;
const SafeCrimsonAristocratEffect =
  CrimsonAristocratEffect as React.ComponentType<SafeEffectProps>;
const SafeEtherealYggdrasilEffect =
  EtherealYggdrasilEffect as React.ComponentType<SafeEffectProps>;
const SafeIvoryOverlordEffect =
  IvoryOverlordEffect as React.ComponentType<SafeEffectProps>;
const SafeSovereignLunarEclipseEffect =
  SovereignLunarEclipseEffect as React.ComponentType<SafeEffectProps>;
const SafeCosmicEclipseEffect =
  CosmicEclipseEffect as React.ComponentType<SafeEffectProps>;

export default function CosmeticEffectRenderer({
  theme,
  variant = "card",
}: CosmeticEffectRendererProps) {
  if (theme === "sovereign-tempest") {
    return <SafeSovereignTempestEffect variant="background" />;
  }

  if (theme === "abyssal-leviathan") {
    return <SafeAbyssalLeviathanEffect variant={variant} />;
  }

  if (theme === "crimson-aristocrat") {
    return <SafeCrimsonAristocratEffect variant={variant} />;
  }

  if (theme === "ethereal-yggdrasil") {
    return <SafeEtherealYggdrasilEffect variant={variant} />;
  }

  if (theme === "ivory-overlord") {
    return <SafeIvoryOverlordEffect variant={variant} />;
  }

  if (theme === "sovereign-lunar-eclipse") {
    return (
      <SafeSovereignLunarEclipseEffect
        variant="full"
        className={getDivineEffectClassName(variant)}
      />
    );
  }

  if (theme === "cosmic-eclipse") {
    return (
      <SafeCosmicEclipseEffect
        variant="full"
        className={getDivineEffectClassName(variant)}
      />
    );
  }

  return null;
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
