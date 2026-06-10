export type CosmeticType =
  | "name_effect"
  | "border"
  | "background"
  | "aura"
  | "particle";

export type CosmeticTheme =
  | "sovereign-tempest"
  | "abyssal-leviathan"
  | "crimson-aristocrat"
  | "ethereal-yggdrasil"
  | "ivory-overlord";

export type CosmeticRarity =
  | "Common"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic";

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
    id: "sovereign-tempest",
    name: "Sovereign Tempest",
    subtitle: "Petir, awan dewa, dan kemuliaan langit kerajaan.",
    icon: "⚡",
    mood: "Storm Royalty",
    color: "from-amber-400/25 via-violet-500/20 to-sky-300/15",
  },
  {
    id: "abyssal-leviathan",
    name: "Abyssal Leviathan",
    subtitle: "Laut dalam, kristal safir, dan cahaya bioluminescent.",
    icon: "◇",
    mood: "Deep Sea Relic",
    color: "from-cyan-300/20 via-blue-500/20 to-emerald-300/15",
  },
  {
    id: "crimson-aristocrat",
    name: "Crimson Aristocrat",
    subtitle: "Gothic vampire, velvet hitam, ruby, dan bangsawan malam.",
    icon: "✦",
    mood: "Blood Moon Noble",
    color: "from-red-500/25 via-rose-900/25 to-amber-300/15",
  },
  {
    id: "ethereal-yggdrasil",
    name: "Ethereal Yggdrasil",
    subtitle: "Hutan peri kuno, akar bercahaya, dan napas alam suci.",
    icon: "✧",
    mood: "Ancient Fairywood",
    color: "from-emerald-300/25 via-lime-400/15 to-amber-200/10",
  },
  {
    id: "ivory-overlord",
    name: "Ivory Overlord",
    subtitle: "Tulang raja, api jiwa cyan, dan singgasana dark fantasy.",
    icon: "♛",
    mood: "Soulfire Dominion",
    color: "from-cyan-300/20 via-slate-200/10 to-blue-500/20",
  },
] as const;

export const cosmeticItems: CosmeticItem[] = [
  // =========================================================
  // SOVEREIGN TEMPEST — PETIR & AWAN DEWA
  // =========================================================
  {
    id: "tempest-name-01",
    name: "Storm-Crowned Name",
    theme: "sovereign-tempest",
    themeName: "Sovereign Tempest",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Rare",
    price: 65,
    icon: "⚡",
    accent: "text-amber-300",
    shortDescription: "Nama berkilat seperti mahkota badai.",
    description:
      "Efek nama dengan kilatan petir kecil yang menyambar halus dari huruf ke huruf, memberi kesan karakter berada di bawah restu langit Lunaria.",
    visualQuality: "Micro lightning text shimmer",
    previewLabel: "Storm Letter Glow",
  },
  {
    id: "tempest-border-01",
    name: "Cumulus Royal Frame",
    theme: "sovereign-tempest",
    themeName: "Sovereign Tempest",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Epic",
    price: 95,
    icon: "☁",
    accent: "text-violet-300",
    shortDescription: "Border awan kerajaan dengan cahaya ungu.",
    description:
      "Bingkai ID Card bergaya awan kumulonimbus magis, dihiasi denyut petir ungu dan garis emas yang membuat kartu terasa seperti lisensi langit.",
    visualQuality: "Animated thunder cloud border",
    previewLabel: "Royal Cloud Frame",
  },
  {
    id: "tempest-background-01",
    name: "Thunder Dragon Sky",
    theme: "sovereign-tempest",
    themeName: "Sovereign Tempest",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 150,
    icon: "🐉",
    accent: "text-amber-300",
    shortDescription: "Langit badai dengan siluet naga petir.",
    description:
      "Background ID Card berupa langit malam yang bergemuruh, dihiasi hujan cahaya emas dan bayangan naga petir yang terasa jauh, mahal, dan mistis.",
    visualQuality: "Layered storm sky parallax",
    previewLabel: "Dragon Storm Realm",
  },
  {
    id: "tempest-aura-01",
    name: "Static Divinity Aura",
    theme: "sovereign-tempest",
    themeName: "Sovereign Tempest",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Legendary",
    price: 170,
    icon: "✺",
    accent: "text-sky-200",
    shortDescription: "Aura listrik statis di sekitar karakter.",
    description:
      "Aura profil dengan percikan listrik statis dan distorsi udara halus. Memberi kesan karakter punya tekanan spiritual seperti dewa badai.",
    visualQuality: "Electric aura distortion",
    previewLabel: "Divine Static Ring",
  },
  {
    id: "tempest-particle-01",
    name: "Golden Stormfall Particles",
    theme: "sovereign-tempest",
    themeName: "Sovereign Tempest",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Mythic",
    price: 220,
    icon: "✹",
    accent: "text-yellow-300",
    shortDescription: "Partikel cahaya emas jatuh seperti hujan langit.",
    description:
      "Efek partikel eksklusif berupa debu cahaya emas, kilatan mini, dan arus angin badai yang bergerak lembut di sekitar kartu.",
    visualQuality: "Falling golden lightning dust",
    previewLabel: "Stormfall Dust",
  },

  // =========================================================
  // ABYSSAL LEVIATHAN — LAUT DALAM & KRISTAL
  // =========================================================
  {
    id: "leviathan-name-01",
    name: "Tideglass Name",
    theme: "abyssal-leviathan",
    themeName: "Abyssal Leviathan",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Rare",
    price: 60,
    icon: "◇",
    accent: "text-cyan-300",
    shortDescription: "Nama seperti kaca laut yang mengalir.",
    description:
      "Efek nama dengan tekstur air mengalir, gelembung kecil, dan cahaya safir lembut. Cocok untuk karakter elegan, misterius, dan tenang.",
    visualQuality: "Fluid water text glow",
    previewLabel: "Abyssal Letter Flow",
  },
  {
    id: "leviathan-border-01",
    name: "Coral Crystal Frame",
    theme: "abyssal-leviathan",
    themeName: "Abyssal Leviathan",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Epic",
    price: 90,
    icon: "◈",
    accent: "text-blue-300",
    shortDescription: "Border karang kristal laut dalam.",
    description:
      "Bingkai ID Card dari kristal karang bercahaya, dengan garis bioluminescent yang memberi kesan relik dari kerajaan bawah laut.",
    visualQuality: "Crystal coral border shimmer",
    previewLabel: "Crystal Reef Frame",
  },
  {
    id: "leviathan-background-01",
    name: "Sunken Sapphire Realm",
    theme: "abyssal-leviathan",
    themeName: "Abyssal Leviathan",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 145,
    icon: "🌊",
    accent: "text-emerald-300",
    shortDescription: "Background laut dalam dengan plankton bercahaya.",
    description:
      "Latar ID Card bernuansa laut safir gelap dengan god rays, plankton bercahaya, dan kabut air lembut yang terasa mahal namun tidak ramai.",
    visualQuality: "Deep sea luminous parallax",
    previewLabel: "Sapphire Abyss",
  },
  {
    id: "leviathan-aura-01",
    name: "Spirit Fish Aura",
    theme: "abyssal-leviathan",
    themeName: "Abyssal Leviathan",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Legendary",
    price: 165,
    icon: "☄",
    accent: "text-cyan-200",
    shortDescription: "Aura ikan cahaya yang mengitari profil.",
    description:
      "Aura lembut berupa riak air dan spirit fish transparan yang bergerak mengelilingi kartu. Terlihat anggun dan premium.",
    visualQuality: "Ripple aura with spirit fish",
    previewLabel: "Leviathan Ripple",
  },
  {
    id: "leviathan-particle-01",
    name: "Pearl Plankton Particles",
    theme: "abyssal-leviathan",
    themeName: "Abyssal Leviathan",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Mythic",
    price: 210,
    icon: "✧",
    accent: "text-teal-200",
    shortDescription: "Partikel plankton mutiara yang naik perlahan.",
    description:
      "Efek partikel berupa plankton bercahaya, bubble halus, dan kilau mutiara yang membuat ID Card terasa hidup seperti berada di bawah laut.",
    visualQuality: "Floating pearl plankton",
    previewLabel: "Pearl Abyss Dust",
  },

  // =========================================================
  // CRIMSON ARISTOCRAT — VAMPIRE & GOTHIC ROYAL
  // =========================================================
  {
    id: "crimson-name-01",
    name: "Ruby Noble Name",
    theme: "crimson-aristocrat",
    themeName: "Crimson Aristocrat",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Rare",
    price: 70,
    icon: "♦",
    accent: "text-red-300",
    shortDescription: "Nama bangsawan ruby dengan asap merah.",
    description:
      "Efek nama berkilau ruby gelap, dihiasi asap merah tipis dan pantulan emas tua. Elegan, gothic, dan terasa seperti nama keluarga bangsawan malam.",
    visualQuality: "Ruby gothic text vapor",
    previewLabel: "Bloodline Letter",
  },
  {
    id: "crimson-border-01",
    name: "Black Rose Victorian Frame",
    theme: "crimson-aristocrat",
    themeName: "Crimson Aristocrat",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Epic",
    price: 105,
    icon: "✦",
    accent: "text-rose-300",
    shortDescription: "Border victoria dengan mawar hitam.",
    description:
      "Bingkai ID Card bergaya ukiran victoria, velvet hitam, aksen emas redup, dan kelopak mawar gelap yang memberi rasa aristokrat.",
    visualQuality: "Victorian rose frame",
    previewLabel: "Black Rose Frame",
  },
  {
    id: "crimson-background-01",
    name: "Blood Moon Cathedral",
    theme: "crimson-aristocrat",
    themeName: "Crimson Aristocrat",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 160,
    icon: "☾",
    accent: "text-red-200",
    shortDescription: "Katedral gothic di bawah blood moon.",
    description:
      "Background berupa kaca patri megah, cahaya bulan merah, dan ruang kastil gelap yang cocok untuk karakter bangsawan, villain, atau noble mystery.",
    visualQuality: "Blood moon gothic hall",
    previewLabel: "Crimson Cathedral",
  },
  {
    id: "crimson-aura-01",
    name: "Velvet Mist Aura",
    theme: "crimson-aristocrat",
    themeName: "Crimson Aristocrat",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Legendary",
    price: 175,
    icon: "♜",
    accent: "text-amber-200",
    shortDescription: "Kabut merah velvet dan debu emas.",
    description:
      "Aura profil dengan kabut merah yang merayap perlahan, serpihan emas, dan siluet kelelawar halus yang memudar elegan.",
    visualQuality: "Crimson mist noble aura",
    previewLabel: "Velvet Blood Aura",
  },
  {
    id: "crimson-particle-01",
    name: "Falling Black Rose Petals",
    theme: "crimson-aristocrat",
    themeName: "Crimson Aristocrat",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Mythic",
    price: 230,
    icon: "❖",
    accent: "text-red-300",
    shortDescription: "Kelopak mawar hitam jatuh perlahan.",
    description:
      "Partikel eksklusif berupa kelopak mawar hitam, asap ruby, dan kilau emas tua. Memberi kesan mahal dan sangat khas gothic royal.",
    visualQuality: "Animated black rose fall",
    previewLabel: "Rosefall Particles",
  },

  // =========================================================
  // ETHEREAL YGGDRASIL — HUTAN PERI & ALAM KUNO
  // =========================================================
  {
    id: "yggdrasil-name-01",
    name: "Living Root Name",
    theme: "ethereal-yggdrasil",
    themeName: "Ethereal Yggdrasil",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Rare",
    price: 60,
    icon: "✧",
    accent: "text-emerald-300",
    shortDescription: "Nama dari akar hidup bercahaya.",
    description:
      "Efek nama seperti akar peri yang tumbuh pelan, memancarkan spora hijau emas dan cahaya alam yang menenangkan.",
    visualQuality: "Growing root text glow",
    previewLabel: "Living Root Letter",
  },
  {
    id: "yggdrasil-border-01",
    name: "Fairywood Branch Frame",
    theme: "ethereal-yggdrasil",
    themeName: "Ethereal Yggdrasil",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Epic",
    price: 90,
    icon: "☘",
    accent: "text-lime-300",
    shortDescription: "Border ranting peri dengan daun bercahaya.",
    description:
      "Bingkai ID Card berupa ranting hutan kuno, daun kecil bercahaya, dan kilau peri yang membuat kartu terasa alami tapi tetap premium.",
    visualQuality: "Glowing fairy branch frame",
    previewLabel: "Fairywood Frame",
  },
  {
    id: "yggdrasil-background-01",
    name: "Ancient Forest Sanctuary",
    theme: "ethereal-yggdrasil",
    themeName: "Ethereal Yggdrasil",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 140,
    icon: "♧",
    accent: "text-green-200",
    shortDescription: "Hutan kuno dengan air terjun bercahaya.",
    description:
      "Background ID Card berupa sanctuary hutan tua, kabut hijau lembut, cahaya peri, dan ilusi kedalaman seperti dunia alam suci.",
    visualQuality: "Breathing ancient forest",
    previewLabel: "Forest Sanctuary",
  },
  {
    id: "yggdrasil-aura-01",
    name: "Butterfly Stardust Aura",
    theme: "ethereal-yggdrasil",
    themeName: "Ethereal Yggdrasil",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Legendary",
    price: 165,
    icon: "✺",
    accent: "text-emerald-200",
    shortDescription: "Aura kupu-kupu cahaya dan stardust.",
    description:
      "Aura profil dengan kupu-kupu cahaya, jejak debu bintang, dan shimmer hijau emas. Cocok untuk karakter nature, healer, elf, dan guardian.",
    visualQuality: "Butterfly light orbit",
    previewLabel: "Fairy Orbit Aura",
  },
  {
    id: "yggdrasil-particle-01",
    name: "Sacred Spore Particles",
    theme: "ethereal-yggdrasil",
    themeName: "Ethereal Yggdrasil",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Mythic",
    price: 205,
    icon: "✤",
    accent: "text-lime-200",
    shortDescription: "Spora suci yang melayang seperti nafas hutan.",
    description:
      "Partikel spora bercahaya, daun kecil, dan debu emas yang bergerak lembut. Memberi kesan karakter berada di bawah restu Yggdrasil.",
    visualQuality: "Floating sacred spores",
    previewLabel: "Yggdrasil Sporefall",
  },

  // =========================================================
  // IVORY OVERLORD — TULANG RAJA & API JIWA
  // =========================================================
  {
    id: "ivory-name-01",
    name: "Soulcrack Ivory Name",
    theme: "ivory-overlord",
    themeName: "Ivory Overlord",
    type: "name_effect",
    typeLabel: "Name Effect",
    rarity: "Rare",
    price: 75,
    icon: "♛",
    accent: "text-cyan-200",
    shortDescription: "Nama tulang ivory dengan retakan api jiwa.",
    description:
      "Efek nama seperti ukiran tulang mewah, dengan retakan cyan yang menyala dari dalam. Dark fantasy, elegan, dan terasa intimidatif.",
    visualQuality: "Ivory bone text with soulfire",
    previewLabel: "Soulcrack Letter",
  },
  {
    id: "ivory-border-01",
    name: "Bone Crown Frame",
    theme: "ivory-overlord",
    themeName: "Ivory Overlord",
    type: "border",
    typeLabel: "ID Border",
    rarity: "Epic",
    price: 110,
    icon: "♔",
    accent: "text-slate-200",
    shortDescription: "Border mahkota tulang dengan asap cyan.",
    description:
      "Bingkai ID Card berupa ukiran tulang kerajaan, bukan tengkorak polos. Dihiasi asap biru dan garis cyan yang membuatnya terasa mahal.",
    visualQuality: "Royal bone crown border",
    previewLabel: "Ivory Crown Frame",
  },
  {
    id: "ivory-background-01",
    name: "Throne of Blue Souls",
    theme: "ivory-overlord",
    themeName: "Ivory Overlord",
    type: "background",
    typeLabel: "ID Background",
    rarity: "Legendary",
    price: 175,
    icon: "🔥",
    accent: "text-blue-200",
    shortDescription: "Singgasana gading di tengah api jiwa.",
    description:
      "Background dark fantasy dengan singgasana ivory, api cyan, dan abu melayang. Terlihat mewah, dingin, dan berbahaya.",
    visualQuality: "Ivory throne soulfire realm",
    previewLabel: "Soulfire Throne",
  },
  {
    id: "ivory-aura-01",
    name: "Cyan Revenant Aura",
    theme: "ivory-overlord",
    themeName: "Ivory Overlord",
    type: "aura",
    typeLabel: "Profile Aura",
    rarity: "Legendary",
    price: 190,
    icon: "☽",
    accent: "text-cyan-300",
    shortDescription: "Aura roh cyan yang mengorbit kartu.",
    description:
      "Aura profil berupa api jiwa cyan yang bergerak mengorbit. Memberi kesan karakter punya dominasi gelap yang terkontrol.",
    visualQuality: "Orbiting cyan revenant flame",
    previewLabel: "Revenant Orbit Aura",
  },
  {
    id: "ivory-particle-01",
    name: "Soul Ash Particles",
    theme: "ivory-overlord",
    themeName: "Ivory Overlord",
    type: "particle",
    typeLabel: "Particle Effect",
    rarity: "Mythic",
    price: 250,
    icon: "✷",
    accent: "text-cyan-200",
    shortDescription: "Abu jiwa cyan yang naik tanpa gravitasi.",
    description:
      "Partikel abu jiwa, flame wisp cyan, dan kabut tulang yang melayang ke atas. Efek ini dibuat untuk terasa seperti cosmetic tertinggi.",
    visualQuality: "Floating soulfire ash",
    previewLabel: "Overlord Soul Ash",
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
};

export function getCosmeticsByTheme(theme: CosmeticTheme) {
  return cosmeticItems.filter((item) => item.theme === theme);
}

export function getCosmeticsByType(type: CosmeticType) {
  return cosmeticItems.filter((item) => item.type === type);
}

export function getCosmeticById(id: string) {
  return cosmeticItems.find((item) => item.id === id) || null;
}
