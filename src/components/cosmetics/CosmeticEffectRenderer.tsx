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

type TempestPreviewVariant = "background";
type DivinePreviewVariant = "full";

export default function CosmeticEffectRenderer({
  theme,
  variant = "card",
}: CosmeticEffectRendererProps) {
  if (theme === "sovereign-tempest") {
    return (
      <SovereignTempestEffect
        variant={"background" as TempestPreviewVariant}
      />
    );
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
        variant={"full" as DivinePreviewVariant}
        className={getDivineEffectClassName(variant)}
      />
    );
  }

  if (theme === "cosmic-eclipse") {
    return (
      <CosmicEclipseEffect
        variant={"full" as DivinePreviewVariant}
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
