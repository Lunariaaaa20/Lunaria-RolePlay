export type CosmeticType =
  | "name_effect"
  | "border"
  | "background"
  | "aura"
  | "particle";

export type CosmeticTheme =
  // Legacy themes — biarin ada supaya file lama tidak error
  | "sovereign-tempest"
  | "abyssal-leviathan"
  | "crimson-aristocrat"
  | "ethereal-yggdrasil"
  | "ivory-overlord"
  
  // V2 themes — yang baru dipakai
  | "obsidian-monarch"
  | "blood-cathedral"
  | "abyss-sovereign"
  | "thorn-empress"
  | "soulfire-tyrant";

export type CosmeticRarity =
  | "Common"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic"
  | "Divine Relic"
  | "Forbidden Relic";

export type CosmeticItem = {
  id: string;
  name: string;
  theme: CosmeticTheme;
  themeName: string;
  type: CosmeticType;
  typeLabel: string;
  rarity: CosmeticRarity;
  price: number;
  icon: string;
  accent: string;
  shortDescription: string;
  description: string;
  visualQuality: string;
  previewLabel: string;
};

export const cosmeticThemes = [
  {
    id: "obsidian-monarch",
    name: "Obsidian Monarch",
    subtitle: "Mahkota gelap, obsidian, emas redup, dan tekanan raja terkutuk.",
    icon: "♛",
    mood: "Dark Royal Dominion",
    color: "from-zinc-950 via-stone-900 to-amber-950",
  },
  {
    id: "blood-cathedral",
    name: "Blood Cathedral",
    subtitle: "Katedral vampir, velvet merah, kaca patri, dan aristokrat malam.",
    icon: "◆",
    mood: "Gothic Blood Noble",
    color: "from-red-950 via-rose-950 to-black",
  },
  {
    id: "abyss-sovereign",
    name: "Abyss Sovereign",
    subtitle: "Laut jurang, leviathan, kristal safir, dan cahaya bioluminescent.",
    icon: "◇",
    mood: "Deep Sea Majesty",
    color: "from-cyan-950 via-blue-950 to-slate-950",
  },
  {
    id: "thorn-empress",
    name: "Thorn Empress",
    subtitle: "Ratu peri gelap, akar tajam, duri emas, dan hutan suci berbahaya.",
    icon: "✧",
    mood: "Dark Fairywood Empress",
    color: "from-emerald-950 via-green-950 to-yellow-950",
  },
  {
    id: "soulfire-tyrant",
    name: "Soulfire Tyrant",
    subtitle: "Singgasana tulang, api jiwa cyan, kabut arwah, dan dominasi dingin.",
    icon: "☽",
    mood: "Cyan Soul Dominion",
    color: "from-slate-950 via-cyan-950 to-black",
  },
] as const;

export const cosmeticItems: CosmeticItem[] = [
  // =========================================================
  // OBSIDIAN MONARCH
  // =========================================================
  {
    id: "obsidian-name-01",
    name: "Crown of Black Glass",
    theme: "obsidian-monarch",
    themeName: "Obsidian Monarch",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Epic",
    price: 180,
    icon: "♛",
    accent: "text-amber-200",
    shortDescription: "Nama obsidian dengan kilau mahkota emas redup.",
    description:
      "Efek nama mewah seperti kaca hitam kerajaan, dihiasi retakan emas tipis dan shimmer tajam yang bergerak pelan dari kiri ke kanan.",
    visualQuality: "Obsidian royal text shimmer",
    previewLabel: "Black Crown Signature",
  },
  {
    id: "obsidian-border-01",
    name: "Imperial Obsidian Frame",
    theme: "obsidian-monarch",
    themeName: "Obsidian Monarch",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Legendary",
    price: 320,
    icon: "▰",
    accent: "text-stone-200",
    shortDescription: "Border kerajaan hitam dengan garis emas tajam.",
    description:
      "Bingkai ID Card bergaya takhta obsidian, memiliki garis emas redup, sudut tajam, dan aura berat seperti lisensi bangsawan gelap.",
    visualQuality: "Sharp obsidian royal border",
    previewLabel: "Imperial Black Frame",
  },
  {
    id: "obsidian-background-01",
    name: "Throne Under Ashfall",
    theme: "obsidian-monarch",
    themeName: "Obsidian Monarch",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 420,
    icon: "♜",
    accent: "text-yellow-200",
    shortDescription: "Latar singgasana gelap di bawah hujan abu emas.",
    description:
      "Background profil berisi singgasana batu hitam, kabut istana, dan partikel abu emas yang jatuh perlahan. Mewah, berat, dan intimidatif.",
    visualQuality: "Dark throne parallax realm",
    previewLabel: "Ashfall Throne",
  },
  {
    id: "obsidian-aura-01",
    name: "Monarch Pressure Aura",
    theme: "obsidian-monarch",
    themeName: "Obsidian Monarch",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Mythic",
    price: 650,
    icon: "✦",
    accent: "text-amber-300",
    shortDescription: "Aura tekanan raja yang gelap dan mahal.",
    description:
      "Aura hitam keemasan yang berdenyut lambat di sekitar avatar, dengan cincin dominasi tipis dan asap emas yang bergerak seperti napas istana.",
    visualQuality: "Royal pressure aura loop",
    previewLabel: "Monarch Pulse",
  },
  {
    id: "obsidian-particle-01",
    name: "Gilded Ash Particles",
    theme: "obsidian-monarch",
    themeName: "Obsidian Monarch",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Divine Relic",
    price: 1200,
    icon: "✷",
    accent: "text-yellow-100",
    shortDescription: "Abu emas kerajaan yang jatuh tanpa henti.",
    description:
      "Partikel premium berupa abu emas, serpihan kaca obsidian, dan micro sparkle tajam yang membuat profil terasa seperti artefak kerajaan.",
    visualQuality: "Gilded ash particle storm",
    previewLabel: "Gilded Ashfall",
  },

  // =========================================================
  // BLOOD CATHEDRAL
  // =========================================================
  {
    id: "blood-name-01",
    name: "Velvet Bloodline Name",
    theme: "blood-cathedral",
    themeName: "Blood Cathedral",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Epic",
    price: 200,
    icon: "◆",
    accent: "text-red-200",
    shortDescription: "Nama velvet merah dengan kilau darah bangsawan.",
    description:
      "Efek nama gothic dengan pantulan ruby, kabut merah halus, dan shimmer old gold yang terasa seperti nama keluarga vampir kerajaan.",
    visualQuality: "Ruby velvet text motion",
    previewLabel: "Bloodline Signature",
  },
  {
    id: "blood-border-01",
    name: "Stained Glass Noble Frame",
    theme: "blood-cathedral",
    themeName: "Blood Cathedral",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Legendary",
    price: 360,
    icon: "❖",
    accent: "text-rose-200",
    shortDescription: "Border kaca patri merah dan ukiran gothic.",
    description:
      "Bingkai ID Card dengan motif katedral malam, kaca patri merah gelap, ornamen emas tua, dan sudut victorian yang elegan.",
    visualQuality: "Gothic stained glass frame",
    previewLabel: "Cathedral Frame",
  },
  {
    id: "blood-background-01",
    name: "Blood Moon Nave",
    theme: "blood-cathedral",
    themeName: "Blood Cathedral",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 460,
    icon: "☾",
    accent: "text-red-300",
    shortDescription: "Latar katedral blood moon yang dingin dan megah.",
    description:
      "Background profil berupa ruang katedral gelap, cahaya blood moon dari kaca patri, dan kabut merah yang bergerak perlahan.",
    visualQuality: "Blood moon cathedral realm",
    previewLabel: "Crimson Nave",
  },
  {
    id: "blood-aura-01",
    name: "Aristocrat Crimson Mist",
    theme: "blood-cathedral",
    themeName: "Blood Cathedral",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Mythic",
    price: 700,
    icon: "♜",
    accent: "text-red-200",
    shortDescription: "Aura kabut merah aristokrat yang elegan.",
    description:
      "Aura profil berupa red mist, ember darah kecil, dan pantulan old gold yang mengitari avatar seperti kutukan bangsawan malam.",
    visualQuality: "Crimson noble aura loop",
    previewLabel: "Velvet Mist",
  },
  {
    id: "blood-particle-01",
    name: "Black Rose Bloodfall",
    theme: "blood-cathedral",
    themeName: "Blood Cathedral",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Divine Relic",
    price: 1350,
    icon: "✹",
    accent: "text-rose-100",
    shortDescription: "Kelopak mawar hitam dan ember darah jatuh perlahan.",
    description:
      "Partikel eksklusif berisi kelopak mawar hitam, red ember, dan serpihan ruby yang jatuh seperti ritual katedral terlarang.",
    visualQuality: "Black rose blood particle field",
    previewLabel: "Blood Rosefall",
  },

  // =========================================================
  // ABYSS SOVEREIGN
  // =========================================================
  {
    id: "abyss-name-01",
    name: "Sapphire Abyss Name",
    theme: "abyss-sovereign",
    themeName: "Abyss Sovereign",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Epic",
    price: 190,
    icon: "◇",
    accent: "text-cyan-200",
    shortDescription: "Nama safir laut dalam dengan cahaya bioluminescent.",
    description:
      "Efek nama dengan kilau air gelap, pantulan safir, gelembung mikro, dan cahaya cyan yang mengalir seperti arus bawah laut.",
    visualQuality: "Sapphire water text shimmer",
    previewLabel: "Abyssal Signature",
  },
  {
    id: "abyss-border-01",
    name: "Leviathan Crystal Frame",
    theme: "abyss-sovereign",
    themeName: "Abyss Sovereign",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Legendary",
    price: 340,
    icon: "◈",
    accent: "text-blue-200",
    shortDescription: "Border kristal leviathan dari laut jurang.",
    description:
      "Bingkai ID Card berupa kristal laut gelap, garis neon cyan, dan pecahan relik bawah laut yang bergerak seperti terkena arus.",
    visualQuality: "Leviathan crystal border",
    previewLabel: "Abyss Crystal Frame",
  },
  {
    id: "abyss-background-01",
    name: "Sunken Crown Trench",
    theme: "abyss-sovereign",
    themeName: "Abyss Sovereign",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 450,
    icon: "🌊",
    accent: "text-teal-200",
    shortDescription: "Latar kerajaan tenggelam di palung gelap.",
    description:
      "Background profil menampilkan reruntuhan mahkota bawah laut, plankton bercahaya, bubble, dan kabut air safir yang terasa premium.",
    visualQuality: "Deep sea parallax realm",
    previewLabel: "Sunken Trench",
  },
  {
    id: "abyss-aura-01",
    name: "Leviathan Ripple Aura",
    theme: "abyss-sovereign",
    themeName: "Abyss Sovereign",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Mythic",
    price: 680,
    icon: "☄",
    accent: "text-cyan-100",
    shortDescription: "Aura riak leviathan yang berputar halus.",
    description:
      "Aura berupa cincin riak air, spirit fish cyan, dan distorsi lembut di sekitar avatar seperti berada di bawah tekanan laut jurang.",
    visualQuality: "Abyss ripple aura loop",
    previewLabel: "Leviathan Ripple",
  },
  {
    id: "abyss-particle-01",
    name: "Pearl Abyss Plankton",
    theme: "abyss-sovereign",
    themeName: "Abyss Sovereign",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Divine Relic",
    price: 1250,
    icon: "✧",
    accent: "text-cyan-100",
    shortDescription: "Plankton mutiara dan bubble bercahaya naik perlahan.",
    description:
      "Partikel premium berupa pearl plankton, bubble tipis, dan shimmer safir yang membuat profil hidup seperti istana laut dalam.",
    visualQuality: "Pearl plankton particle field",
    previewLabel: "Pearl Abyssfall",
  },

  // =========================================================
  // THORN EMPRESS
  // =========================================================
  {
    id: "thorn-name-01",
    name: "Empress Root Signature",
    theme: "thorn-empress",
    themeName: "Thorn Empress",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Epic",
    price: 185,
    icon: "✧",
    accent: "text-emerald-200",
    shortDescription: "Nama akar peri gelap dengan duri emas.",
    description:
      "Efek nama seperti akar hidup yang tumbuh pelan, dihiasi duri emas kecil, spora bercahaya, dan shimmer hijau tua.",
    visualQuality: "Living root text shimmer",
    previewLabel: "Root Empress Name",
  },
  {
    id: "thorn-border-01",
    name: "Dark Fairy Thorn Frame",
    theme: "thorn-empress",
    themeName: "Thorn Empress",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Legendary",
    price: 330,
    icon: "☘",
    accent: "text-lime-200",
    shortDescription: "Border duri peri gelap dengan daun emas.",
    description:
      "Bingkai ID Card berupa ranting hitam-hijau, duri tajam, daun emas, dan micro fairy light yang bergerak lembut.",
    visualQuality: "Dark fairy thorn border",
    previewLabel: "Thorn Crown Frame",
  },
  {
    id: "thorn-background-01",
    name: "Forbidden Fairywood Court",
    theme: "thorn-empress",
    themeName: "Thorn Empress",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 430,
    icon: "♧",
    accent: "text-green-200",
    shortDescription: "Latar istana hutan peri gelap.",
    description:
      "Background profil dengan sanctuary hutan tua, kabut emerald, akar bercahaya, dan siluet court peri yang terasa cantik tapi berbahaya.",
    visualQuality: "Dark fairywood realm",
    previewLabel: "Fairywood Court",
  },
  {
    id: "thorn-aura-01",
    name: "Thornhalo Empress Aura",
    theme: "thorn-empress",
    themeName: "Thorn Empress",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Mythic",
    price: 660,
    icon: "✺",
    accent: "text-emerald-100",
    shortDescription: "Aura halo duri dan kupu-kupu cahaya.",
    description:
      "Aura profil berupa cincin duri hijau emas, butterfly light, dan stardust lembut yang mengitari avatar seperti restu ratu peri.",
    visualQuality: "Thorn halo aura loop",
    previewLabel: "Empress Thornhalo",
  },
  {
    id: "thorn-particle-01",
    name: "Sacred Spore Bloom",
    theme: "thorn-empress",
    themeName: "Thorn Empress",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Divine Relic",
    price: 1180,
    icon: "✤",
    accent: "text-lime-100",
    shortDescription: "Spora suci, daun kecil, dan dust emas melayang ramai.",
    description:
      "Partikel premium berupa spora bercahaya, daun lembut, dan fairy dust emas yang membuat profil terasa seperti ritual hutan kuno.",
    visualQuality: "Sacred spore particle bloom",
    previewLabel: "Spore Bloomfall",
  },

  // =========================================================
  // SOULFIRE TYRANT
  // =========================================================
  {
    id: "soulfire-name-01",
    name: "Cyan Soulcrack Name",
    theme: "soulfire-tyrant",
    themeName: "Soulfire Tyrant",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Epic",
    price: 210,
    icon: "☽",
    accent: "text-cyan-100",
    shortDescription: "Nama tulang ivory dengan retakan api jiwa cyan.",
    description:
      "Efek nama seperti ukiran tulang raja, memiliki retakan cyan menyala, smoke dingin, dan shimmer arwah yang bergerak tajam.",
    visualQuality: "Cyan soulcrack text shimmer",
    previewLabel: "Soulcrack Signature",
  },
  {
    id: "soulfire-border-01",
    name: "Bone Throne Frame",
    theme: "soulfire-tyrant",
    themeName: "Soulfire Tyrant",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Legendary",
    price: 380,
    icon: "♔",
    accent: "text-slate-100",
    shortDescription: "Border takhta tulang dengan api jiwa cyan.",
    description:
      "Bingkai ID Card berupa ukiran tulang kerajaan, flame wisp cyan, garis arcane, dan kabut arwah yang terasa dingin.",
    visualQuality: "Bone throne animated frame",
    previewLabel: "Soul Throne Frame",
  },
  {
    id: "soulfire-background-01",
    name: "Tyrant Soul Throne",
    theme: "soulfire-tyrant",
    themeName: "Soulfire Tyrant",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 500,
    icon: "🔥",
    accent: "text-blue-100",
    shortDescription: "Latar singgasana arwah dengan api cyan.",
    description:
      "Background profil berupa singgasana ivory, api jiwa cyan, abu dingin yang naik, dan kabut tulang dark fantasy.",
    visualQuality: "Cyan soulfire throne realm",
    previewLabel: "Soul Tyrant Throne",
  },
  {
    id: "soulfire-aura-01",
    name: "Revenant Crown Aura",
    theme: "soulfire-tyrant",
    themeName: "Soulfire Tyrant",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Mythic",
    price: 760,
    icon: "✷",
    accent: "text-cyan-200",
    shortDescription: "Aura mahkota arwah cyan yang mengorbit avatar.",
    description:
      "Aura profil berupa flame wisp cyan, arcane ring, dan ghost crown yang berputar di sekitar avatar dengan dominasi dingin.",
    visualQuality: "Revenant crown aura loop",
    previewLabel: "Revenant Crown",
  },
  {
    id: "soulfire-particle-01",
    name: "Soul Ash Ascension",
    theme: "soulfire-tyrant",
    themeName: "Soulfire Tyrant",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Forbidden Relic",
    price: 1600,
    icon: "✹",
    accent: "text-cyan-100",
    shortDescription: "Abu jiwa cyan naik seperti gravitasi terbalik.",
    description:
      "Partikel tertinggi berupa soul ash, flame wisp cyan, debu tulang, dan kabut arwah yang naik perlahan seolah profil berada di altar tiran.",
    visualQuality: "Forbidden soulfire ash field",
    previewLabel: "Soul Ash Ascension",
  },
];

export const cosmeticTypeLabels: Record<CosmeticType, string> = {
  name_effect: "Name Effect",
  border: "ID Border",
  background: "ID Background",
  aura: "Profile Aura",
  particle: "Particle Effect",
};

export const rarityOrder: Record<CosmeticRarity, number> = {
  Common: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
  Mythic: 5,
  "Divine Relic": 6,
  "Forbidden Relic": 7,
};

export function getCosmeticsByTheme(theme: CosmeticTheme) {
  return cosmeticItems.filter((item) => item.theme === theme);
}

export function getCosmeticsByType(type: CosmeticType) {
  return cosmeticItems.filter((item) => item.type === type);
}

export function getCosmeticById(id: string) {
  return cosmeticItems.find((item) => item.id === id) || null;
}p
