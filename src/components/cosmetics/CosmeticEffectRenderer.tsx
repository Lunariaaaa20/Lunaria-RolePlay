"use client";

import React from "react";
import type { CosmeticTheme } from "./data/cosmeticItems";
import PremiumCosmeticCanvas from "./effects/PremiumCosmeticCanvas";

type CosmeticEffectRendererProps = {
  theme: CosmeticTheme;
  variant?: "card" | "compact" | "preview";
};

export default function CosmeticEffectRenderer({
  theme,
  variant = "card",
}: CosmeticEffectRendererProps) {
  return <PremiumCosmeticCanvas theme={theme} variant={variant} />;
}
