"use client";

import React from "react";
import type { CosmeticTheme } from "./data/cosmeticItems";

import SovereignTempestEffect from "./effects/SovereignTempestEffect";
import AbyssalLeviathanEffect from "./effects/AbyssalLeviathanEffect";
import CrimsonAristocratEffect from "./effects/CrimsonAristocratEffect";
import EtherealYggdrasilEffect from "./effects/EtherealYggdrasilEffect";
import IvoryOverlordEffect from "./effects/IvoryOverlordEffect";

type CosmeticEffectRendererProps = {
theme: CosmeticTheme;
variant?: "card" | "compact" | "preview";
};

export default function CosmeticEffectRenderer({
theme,
variant = "card",
}: CosmeticEffectRendererProps) {
if (theme === "sovereign-tempest") {
return <SovereignTempestEffect variant={variant} />;
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

return null;
}
