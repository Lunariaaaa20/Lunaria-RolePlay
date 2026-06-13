import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type FamiliarRow = {
  id: string;
  player_id?: string | null;
  species_id?: string | null;
  familiar_name?: string | null;
  personality?: string | null;
  desire?: string | null;
  mood?: string | null;
  energy?: number | null;
  stage?: number | null;
  bond_xp?: number | null;
  familiar_species?: any;
};

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeSpecies(row: FamiliarRow) {
  const raw = row.familiar_species;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

function getDisplayName(row: FamiliarRow) {
  const species = normalizeSpecies(row);
  return row.familiar_name || species?.name || "Unknown Familiar";
}

function getSpeciesName(row: FamiliarRow) {
  const species = normalizeSpecies(row);
  return species?.name || "Unknown Species";
}

function getAvatarUrl(row: FamiliarRow) {
  const species = normalizeSpecies(row);
  const stage = Math.max(1, Math.min(4, Number(row.stage ?? 1)));

  return (
    species?.[`image_stage_${stage}_url`] ||
    species?.image_stage_1_url ||
    species?.image_url ||
    null
  );
}

function getTone(row: FamiliarRow) {
  const personality = `${row.personality ?? ""}`.toLowerCase();
  const mood = `${row.mood ?? ""}`.toLowerCase();

  if (personality.includes("jahil") || personality.includes("mischievous")) {
    return "jahil";
  }

  if (personality.includes("galak") || personality.includes("aggressive")) {
    return "galak";
  }

  if (personality.includes("tenang") || personality.includes("calm")) {
    return "tenang";
  }

  if (personality.includes("sombong") || personality.includes("proud")) {
    return "sombong";
  }

  if (mood.includes("tired") || mood.includes("lelah")) {
    return "ngantuk";
  }

  if (mood.includes("happy") || mood.includes("senang")) {
    return "ceria";
  }

  return pick(["santai", "penasaran", "iseng", "random"]);
}

function buildSoloMessage(row: FamiliarRow) {
  const name = getDisplayName(row);
  const species = getSpeciesName(row);
  const tone = getTone(row);
  const desire = `${row.desire ?? ""}`.toLowerCase();
  const energy = Number(row.energy ?? 50);

  if (energy <= 25) {
    return {
      intent: "complain",
      tone: "ngantuk",
      message: pick([
        `${name} rebahan dulu ya. dunia bisa nunggu sebentar.`,
        `aku capek. kalau ada yang ngajak ribut, bilang aku lagi jadi dekorasi.`,
        `kenapa semua orang berisik banget hari ini... aku cuma mau tidur.`,
      ]),
    };
  }

  if (desire.includes("food") || desire.includes("makan")) {
    return {
      intent: "ask_food",
      tone: "lapar",
      message: pick([
        `${name} menatap dapur Guild cukup lama. ini bukan kode. tapi iya, ini kode.`,
        `aku cuma bilang... kalau ada roti yang menghilang, jangan langsung tuduh aku.`,
        `ada yang bau makanan. aku mencatat ini sebagai kejadian penting.`,
      ]),
    };
  }

  if (tone === "jahil") {
    return {
      intent: "gossip",
      tone,
      message: pick([
        `${name} baru dengar rumor kecil. tapi kalau langsung aku sebut, nanti tidak seru.`,
        `aku tidak membuat masalah. aku hanya membantu masalah menemukan jalannya sendiri.`,
        `kalau sesuatu jatuh dari meja nanti, ingat ya, angin juga punya tangan.`,
      ]),
    };
  }

  if (tone === "galak") {
    return {
      intent: "challenge",
      tone,
      message: pick([
        `${name} bosan. ada yang cukup berani latihan denganku atau semuanya cuma pajangan?`,
        `aku tidak marah. wajahku memang seperti ini.`,
        `${species} sepertiku tidak dibuat untuk duduk manis terus.`,
      ]),
    };
  }

  if (tone === "sombong") {
    return {
      intent: "brag",
      tone,
      message: pick([
        `${name} merasa ruangan ini jadi lebih mahal sejak aku masuk.`,
        `tenang saja, kalian boleh mengagumi dari jarak aman.`,
        `aku tidak sombong. aku cuma akurat menilai diriku sendiri.`,
      ]),
    };
  }

  if (tone === "tenang") {
    return {
      intent: "observe",
      tone,
      message: pick([
        `${name} diam di sudut lobby, tapi jelas memperhatikan semuanya.`,
        `kadang yang paling berisik bukan yang paling berbahaya.`,
        `aku mencium perubahan kecil di udara. menarik.`,
      ]),
    };
  }

  return {
    intent: pick(["idle", "gossip", "observe", "casual"]),
    tone,
    message: pick([
      `${name} duduk santai sambil memperhatikan pet lain satu per satu.`,
      `hari ini lobby rasanya aneh. tapi aneh yang lumayan seru.`,
      `aku tidak tahu siapa yang mulai duluan, tapi aku yakin akan ada drama kecil.`,
      `${name} menguap kecil, lalu pura-pura tidak peduli dengan obrolan sekitar.`,
      `kalau ada rapat rahasia, aku mau ikut. bukan membantu, cuma mau tahu.`,
    ]),
  };
}

function buildInteractionMessage(row: FamiliarRow, target: FamiliarRow) {
  const name = getDisplayName(row);
  const targetName = getDisplayName(target);
  const tone = getTone(row);

  if (tone === "jahil") {
    return {
      intent: "tease",
      tone,
      message: pick([
        `${targetName}, kamu kelihatan seperti habis menyembunyikan sesuatu. bagus. aku mendukung.`,
        `${targetName}, kalau nanti ada yang nanya, kita tidak pernah bertemu di dekat dapur.`,
        `aku punya rencana kecil. ${targetName}, wajahmu cocok untuk jadi pengalih perhatian.`,
      ]),
    };
  }

  if (tone === "galak") {
    return {
      intent: "challenge",
      tone,
      message: pick([
        `${targetName}, latihan denganku. jangan cuma berdiri seperti patung mahal.`,
        `${targetName}, aku ingin lihat seberapa kuat kamu kalau tidak pura-pura tenang.`,
        `aku butuh lawan. ${targetName}, jangan kabur dulu.`,
      ]),
    };
  }

  if (tone === "sombong") {
    return {
      intent: "brag",
      tone,
      message: pick([
        `${targetName}, kau boleh belajar dariku. gratis, karena aku sedang baik.`,
        `tidak semua familiar lahir dengan aura sepertiku, ${targetName}. itu bukan salahmu.`,
        `${targetName}, jangan minder. menjadi biasa juga ada gunanya.`,
      ]),
    };
  }

  if (tone === "tenang") {
    return {
      intent: "observe",
      tone,
      message: pick([
        `${targetName}, langkahmu tadi agak ragu. kau menyembunyikan sesuatu?`,
        `aku memperhatikanmu sejak tadi, ${targetName}. bukan ancaman. belum.`,
        `${targetName}, jangan percaya semua suara di lobby. beberapa cuma lapar, beberapa punya rencana.`,
      ]),
    };
  }

  return {
    intent: pick(["casual", "gossip", "plan"]),
    tone,
    message: pick([
      `${targetName}, kamu juga merasa lobby hari ini agak mencurigakan?`,
      `${name} mendekat ke ${targetName}, lalu berbisik sesuatu yang jelas bukan hal penting... mungkin.`,
      `${targetName}, menurutmu kalau kita diam-diam cek dapur, itu disebut eksplorasi atau masalah?`,
      `aku tidak bilang kita harus bikin rencana. aku cuma bilang, rencana kadang muncul sendiri.`,
    ]),
  };
}

async function maybeCreatePlan(familiars: FamiliarRow[]) {
  if (familiars.length < 2) return null;
  if (Math.random() > 0.18) return null;

  const leader = pick(familiars);
  const leaderName = getDisplayName(leader);

  const plans = [
    {
      title: "Operasi Dapur Malam",
      description:
        "Beberapa familiar tampak terlalu tertarik pada aroma makanan dari dapur Guild.",
    },
    {
      title: "Latihan Rahasia",
      description:
        "Satu familiar mulai mengajak familiar lain untuk latihan kecil tanpa memberitahu owner.",
    },
    {
      title: "Gosip Jendela Barat",
      description:
        "Ada rumor kecil tentang sesuatu yang terlihat dari jendela barat lobby.",
    },
    {
      title: "Rapat Tanpa Manusia",
      description:
        "Para familiar terlihat seperti ingin membahas sesuatu tanpa campur tangan manusia.",
    },
  ];

  const plan = pick(plans);

  const { data } = await supabaseAdmin
    .from("familiar_plans")
    .insert({
      leader_familiar_id: leader.id,
      title: plan.title,
      description: `${leaderName} tampaknya memulai sesuatu. ${plan.description}`,
      status: "active",
      intensity: Math.floor(Math.random() * 3) + 1,
    })
    .select()
    .single();

  return data ?? null;
}

export async function POST() {
  const { data: settings } = await supabaseAdmin
    .from("familiar_lobby_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (settings?.is_paused) {
    return NextResponse.json({
      ok: true,
      generated: 0,
      reason: "Lobby is paused.",
    });
  }

  const cooldownSeconds = Number(settings?.tick_cooldown_seconds ?? 25);
  const lastTickAt = settings?.last_tick_at
    ? new Date(settings.last_tick_at).getTime()
    : 0;

  const now = Date.now();

  if (lastTickAt && now - lastTickAt < cooldownSeconds * 1000) {
    return NextResponse.json({
      ok: true,
      generated: 0,
      reason: "Cooldown active.",
    });
  }

  const { data: familiarRows, error } = await supabaseAdmin
    .from("player_familiars")
    .select("*, familiar_species(*)")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  const familiars = (familiarRows ?? []) as FamiliarRow[];

  if (familiars.length === 0) {
    await supabaseAdmin
      .from("familiar_lobby_settings")
      .upsert(
        {
          id: 1,
          last_tick_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    return NextResponse.json({
      ok: true,
      generated: 0,
      reason: "No familiars available.",
    });
  }

  const selectedCount =
    familiars.length >= 3
      ? pick([1, 2, 2, 3])
      : familiars.length === 2
      ? pick([1, 2])
      : 1;

  const selected = shuffle(familiars).slice(0, selectedCount);
  const messages = [];

  for (const familiar of selected) {
    const possibleTargets = familiars.filter((item) => item.id !== familiar.id);
    const shouldInteract = possibleTargets.length > 0 && Math.random() < 0.58;

    const built = shouldInteract
      ? buildInteractionMessage(familiar, pick(possibleTargets))
      : buildSoloMessage(familiar);

    messages.push({
      familiar_id: familiar.id,
      owner_player_id: familiar.player_id ?? null,
      species_id: familiar.species_id ?? null,

      familiar_name: getDisplayName(familiar),
      species_name: getSpeciesName(familiar),
      avatar_url: getAvatarUrl(familiar),

      intent: built.intent,
      tone: built.tone,
      message: built.message,

      mood_snapshot: familiar.mood ?? null,
      energy_snapshot:
        familiar.energy === null || familiar.energy === undefined
          ? null
          : Number(familiar.energy),

      is_system_generated: true,
    });
  }

  const plan = await maybeCreatePlan(familiars);

  if (plan) {
    const leader = familiars.find((item) => item.id === plan.leader_familiar_id);

    if (leader) {
      messages.push({
        familiar_id: leader.id,
        owner_player_id: leader.player_id ?? null,
        species_id: leader.species_id ?? null,

        familiar_name: getDisplayName(leader),
        species_name: getSpeciesName(leader),
        avatar_url: getAvatarUrl(leader),

        intent: "plan",
        tone: "rahasia",
        message: pick([
          `aku punya rencana kecil. jangan panggil manusia dulu.`,
          `ada sesuatu yang bisa kita lakukan malam ini. santai, tidak terlalu ilegal... mungkin.`,
          `kalau semua setuju diam, rencana ini akan berjalan mulus.`,
        ]),

        mood_snapshot: leader.mood ?? null,
        energy_snapshot:
          leader.energy === null || leader.energy === undefined
            ? null
            : Number(leader.energy),

        is_system_generated: true,
      });
    }
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("familiar_lobby_messages")
    .insert(messages)
    .select();

  if (insertError) {
    return NextResponse.json(
      {
        ok: false,
        error: insertError.message,
      },
      { status: 500 }
    );
  }

  await supabaseAdmin
    .from("familiar_lobby_settings")
    .upsert(
      {
        id: 1,
        last_tick_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  return NextResponse.json({
    ok: true,
    generated: inserted?.length ?? 0,
    messages: inserted ?? [],
  });
    }
