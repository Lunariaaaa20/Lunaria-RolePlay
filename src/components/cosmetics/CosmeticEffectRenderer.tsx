"use client";

import React from "react";
import type { CosmeticTheme } from "./data/cosmeticItems";

type CosmeticEffectRendererProps = {
  theme: CosmeticTheme;
  variant?: "card" | "compact" | "preview";
};

export default function CosmeticEffectRenderer({
  theme,
  variant = "card",
}: CosmeticEffectRendererProps) {
  void theme;
  void variant;

  return null;
}
