import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type AnyRow = Record<string, any>;

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getSpecies(row: AnyRow) {
  return row.familiar_species ?? null;
}

function getFamiliarName(row: AnyRow) {
  const species = getSpecies(row);

  return (
    row.familiar_name ||
    row.nickname ||
    row.name ||
    species?.name ||
    "Unknown Familiar"
  );
}

function getSpeciesName(row: AnyRow) {
  const species = getSpecies(row);
  return species?.name || "Unknown Species";
}

function getAvatarUrl(row: AnyRow) {
  const species = getSpecies(row);
  const stage = Math.max(1, Math.min(4, Number(row.stage ?? 1)));

  return (
    species?.[`image_stage_${stage}_url`] ||
    species?.image_stage_1_url ||
    species?.image_url ||
    null
  );
}

function getTone(row: AnyRow) {
  const personality = String(row.personality ?? "").toLowerCase();
  const mood = String(row.mood ?? "").toLowerCase();
  const desire = String(row.desire ?? "").toLowerCase();

  if (desire.includes("food") || desire.includes("makan")) return "lapar";
  if (mood.includes("tired") || mood.includes("lelah")) return "ngantuk";
  if (mood.includes("happy") || mood.includes("senang")) return "ceria";

  if (
    personality.includes("jahil") ||
    personality.includes("mischievous") ||
    personality.includes("trick")
  ) {
    return "jahil";
  }

  if (
    personality.includes("galak") ||
    personality.includes("aggressive") ||
    personality.includes("brave")
  ) {
    return "galak";
  }

  if (
    personality.includes("tenang") ||
    personality.includes("calm") ||
    personality.includes("wise")
  ) {
    return "tenang";
  }

  if (
    personality.includes("sombong") ||
    personality.includes("proud") ||
    personality.includes("noble")
  ) {
    return "sombong";
  }

  return pick(["santai", "iseng", "penasaran", "random"]);
}

function buildSoloMessage(row: AnyRow) {
  const name = getFamiliarName(row);
  const speciesName = getSpeciesName(row);
  const tone = getTone(row);
  const energy = Number(row.energy ?? 50);

  if (energy <= 25) {
    return {
      intent: "complain",
      tone: "ngantuk",
      message: pick([
        `${name} rebahan dulu. dunia bisa menunggu sebentar.`,
        `aku capek. kalau ada drama, bangunkan aku pas bagian serunya.`,
        `hari ini terlalu banyak suara. aku memilih menjadi pajangan dulu.`,
      ]),
    };
  }

  if (tone === "lapar") {
    return {
      intent: "ask_food",
      tone,
      message: pick([
        `${name} menatap arah dapur Guild. tidak bilang lapar, tapi jelas sekali lapar.`,
        `kalau ada roti hilang nanti, jangan langsung tuduh aku ya.`,
        `aku mendengar suara makanan. iya, makanan punya suara kalau kita cukup serius.`,
      ]),
    };
  }

  if (tone === "jahil") {
    return {
      intent: "gossip",
      tone,
      message: pick([
        `${name} punya rumor kecil. tapi kalau langsung diceritakan, nanti kurang seru.`,
        `aku tidak bikin masalah. aku cuma memberi masalah sedikit arah.`,
        `kalau nanti ada benda jatuh sendiri, mungkin itu angin. mungkin juga bukan.`,
      ]),
    };
  }

  if (tone === "galak") {
    return {
      intent: "challenge",
      tone,
      message: pick([
        `${name} bosan. ada yang mau latihan atau semuanya cuma dekorasi lobby?`,
        `${speciesName} sepertiku tidak dibuat untuk duduk manis terus.`,
        `aku tidak marah. wajahku memang begini.`,
      ]),
    };
  }

  if (tone === "sombong") {
    return {
      intent: "brag",
      tone,
      message: pick([
        `${name} merasa lobby ini naik kelas sejak dia datang.`,
        `tidak semua familiar punya aura sepertiku. itu bukan salah kalian.`,
        `aku tidak sombong. aku cuma tahu kualitas diriku sendiri.`,
      ]),
    };
  }

  if (tone === "tenang") {
    return {
      intent: "observe",
      tone,
      message: pick([
        `${name} diam di sudut lobby, tapi matanya memperhatikan semuanya.`,
        `yang paling berisik biasanya bukan yang paling berbahaya.`,
        `aku mencium perubahan kecil di udara. menarik.`,
      ]),
    };
  }

  return {
    intent: pick(["idle", "casual", "observe", "gossip"]),
    tone,
    message: pick([
      `${name} duduk santai sambil memperhatikan familiar lain satu per satu.`,
      `lobby hari ini aneh. tapi aneh yang lumayan seru.`,
      `aku tidak tahu siapa yang mulai duluan, tapi sepertinya akan ada drama kecil.`,
      `${name} menguap kecil, lalu pura-pura tidak peduli dengan obrolan sekitar.`,
      `kalau ada rapat rahasia, aku mau ikut. bukan membantu, cuma mau tahu.`,
    ]),
  };
}

function buildInteractionMessage(row: AnyRow, target: AnyRow) {
  const name = getFamiliarName(row);
  const targetName = getFamiliarName(target);
  const tone = getTone(row);

  if (tone === "jahil") {
    return {
      intent: "tease",
      tone,
      message: pick([
        `${targetName}, kalau nanti ada yang nanya, kita tidak pernah dekat dapur.`,
        `${targetName}, wajahmu cocok banget buat pengalih perhatian.`,
        `aku punya rencana kecil. jangan panik dulu, ${targetName}.`,
      ]),
    };
  }

  if (tone === "galak") {
    return {
      intent: "challenge",
      tone,
      message: pick([
        `${targetName}, latihan denganku. jangan cuma berdiri seperti patung mahal.`,
        `aku butuh lawan. ${targetName}, jangan pura-pura tidak dengar.`,
        `${targetName}, aku ingin lihat kamu kuat beneran atau cuma gaya.`,
      ]),
    };
  }

  if (tone === "sombong") {
    return {
      intent: "brag",
      tone,
      message: pick([
        `${targetName}, kamu boleh belajar dariku. hari ini gratis.`,
        `${targetName}, jangan minder. jadi biasa juga ada gunanya.`,
        `tidak semua orang bisa seanggun aku, ${targetName}. sabar saja.`,
      ]),
    };
  }

  if (tone === "tenang") {
    return {
      intent: "observe",
      tone,
      message: pick([
        `${targetName}, langkahmu tadi ragu. kamu menyembunyikan sesuatu?`,
        `aku memperhatikanmu sejak tadi, ${targetName}. bukan ancaman. belum.`,
        `${targetName}, jangan percaya semua suara di lobby.`,
      ]),
    };
  }

  return {
    intent: pick(["casual", "gossip", "plan"]),
    tone,
    message: pick([
      `${targetName}, kamu juga merasa lobby hari ini agak mencurigakan?`,
      `${name} mendekat ke ${targetName}, lalu berbisik sesuatu yang jelas bukan hal penting... mungkin.`,
      `${targetName}, kalau kita diam-diam cek dapur, itu eksplorasi atau masalah?`,
      `aku tidak bilang kita harus bikin rencana. aku cuma bilang rencana kadang muncul sendiri.`,
    ]),
  };
}

async function loadFamiliars() {
  const { data: familiarRows, error: familiarError } = await supabaseAdmin
    .from("player_familiars")
    .select("*")
    .limit(40);

  if (familiarError) {
    throw new Error(familiarError.message);
  }

  const familiars = familiarRows ?? [];

  const speciesIds = Array.from(
    new Set(
      familiars
        .map((item: AnyRow) => item.species_id)
        .filter(Boolean)
    )
  );

  if (speciesIds.length === 0) {
    return familiars;
  }

  const { data: speciesRows, error: speciesError } = await supabaseAdmin
    .from("familiar_species")
    .select("*")
    .in("id", speciesIds);

  if (speciesError) {
    throw new Error(speciesError.message);
  }

  const speciesMap = new Map<string, AnyRow>();

  for (const species of speciesRows ?? []) {
    speciesMap.set(species.id, species);
  }

  return familiars.map((familiar: AnyRow) => ({
    ...familiar,
    familiar_species: familiar.species_id
      ? speciesMap.get(familiar.species_id) ?? null
      : null,
  }));
}

async function tickLobby() {
  const { data: settings } = await supabaseAdmin
    .from("familiar_lobby_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (settings?.is_paused) {
    return {
      ok: true,
      generated: 0,
      reason: "Lobby is paused.",
    };
  }

  const cooldownSeconds = Number(settings?.tick_cooldown_seconds ?? 25);
  const lastTickAt = settings?.last_tick_at
    ? new Date(settings.last_tick_at).getTime()
    : 0;

  if (lastTickAt && Date.now() - lastTickAt < cooldownSeconds * 1000) {
    return {
      ok: true,
      generated: 0,
      reason: "Cooldown active.",
    };
  }

  const familiars = await loadFamiliars();

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

    return {
      ok: true,
      generated: 0,
      reason: "No familiars available.",
    };
  }

  const selectedCount =
    familiars.length >= 3
      ? pick([1, 2, 2, 3])
      : familiars.length === 2
      ? pick([1, 2])
      : 1;

  const selected = shuffle(familiars).slice(0, selectedCount);

  const messages = selected.map((familiar: AnyRow) => {
    const targets = familiars.filter((item: AnyRow) => item.id !== familiar.id);
    const shouldTalkToOther = targets.length > 0 && Math.random() < 0.55;

    const built = shouldTalkToOther
      ? buildInteractionMessage(familiar, pick(targets))
      : buildSoloMessage(familiar);

    return {
      familiar_id: familiar.id,
      owner_player_id: familiar.player_id ?? null,
      species_id: familiar.species_id ?? null,

      familiar_name: getFamiliarName(familiar),
      species_name: getSpeciesName(familiar),
      avatar_url: getAvatarUrl(familiar),

      intent: built.intent,
      tone: built.tone,
      message: built.message,

      mood_snapshot: familiar.mood ?? null,
      energy_snapshot:
        familiar.energy === undefined || familiar.energy === null
          ? null
          : Number(familiar.energy),

      is_system_generated: true,
    };
  });

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("familiar_lobby_messages")
    .insert(messages)
    .select();

  if (insertError) {
    throw new Error(insertError.message);
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

  return {
    ok: true,
    generated: inserted?.length ?? 0,
    messages: inserted ?? [],
  };
}

export async function POST() {
  try {
    const result = await tickLobby();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Unknown familiar lobby error.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await tickLobby();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Unknown familiar lobby error.",
      },
      { status: 500 }
    );
  }
         }
