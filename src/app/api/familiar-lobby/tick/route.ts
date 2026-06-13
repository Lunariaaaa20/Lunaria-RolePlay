 import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type AnyRow = Record<string, any>;

type BuiltMessage = {
  intent: string;
  tone: string;
  topic: string;
  message: string;
};

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function chooseFresh(items: BuiltMessage[], recentTexts: Set<string>) {
  const fresh = items.filter((item) => !recentTexts.has(item.message));
  return pick(fresh.length > 0 ? fresh : items);
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
    personality.includes("trick") ||
    personality.includes("iseng")
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

function inferTopic(text: string) {
  const value = text.toLowerCase();

  if (
    value.includes("dapur") ||
    value.includes("roti") ||
    value.includes("makan") ||
    value.includes("pie")
  ) {
    return "kitchen";
  }

  if (
    value.includes("rapat") ||
    value.includes("rahasia") ||
    value.includes("rencana")
  ) {
    return "secret_plan";
  }

  if (
    value.includes("latihan") ||
    value.includes("lawan") ||
    value.includes("kuat") ||
    value.includes("ribut")
  ) {
    return "training";
  }

  if (
    value.includes("drama") ||
    value.includes("rumor") ||
    value.includes("gosip")
  ) {
    return "gossip";
  }

  if (
    value.includes("tidur") ||
    value.includes("capek") ||
    value.includes("rebahan") ||
    value.includes("ngantuk")
  ) {
    return "rest";
  }

  return "casual";
}

function buildStarter(row: AnyRow, recentTexts: Set<string>): BuiltMessage {
  const name = getFamiliarName(row);
  const tone = getTone(row);

  const options: BuiltMessage[] = [
    {
      intent: "gossip",
      tone,
      topic: "kitchen",
      message: `${name} mencium aroma dari dapur Guild. ini mencurigakan. atau mungkin aku cuma lapar.`,
    },
    {
      intent: "plan",
      tone,
      topic: "secret_plan",
      message: `${name} melihat sekeliling lobby pelan. kalau ada rapat rahasia, aku mau ikut.`,
    },
    {
      intent: "casual",
      tone,
      topic: "gossip",
      message: `${name} merasa lobby hari ini terlalu tenang. biasanya itu tanda sebelum ada drama kecil.`,
    },
    {
      intent: "observe",
      tone,
      topic: "casual",
      message: `${name} duduk sambil memperhatikan semua familiar yang lewat. ada yang aneh hari ini.`,
    },
  ];

  if (tone === "galak") {
    options.push({
      intent: "challenge",
      tone,
      topic: "training",
      message: `${name} menatap familiar lain satu per satu. ada yang mau latihan atau semuanya cuma numpang lewat?`,
    });
  }

  if (tone === "jahil") {
    options.push({
      intent: "plan",
      tone,
      topic: "secret_plan",
      message: `${name} punya ide kecil. tidak berbahaya kok. mungkin cuma sedikit menyusahkan.`,
    });
  }

  if (tone === "ngantuk") {
    options.push({
      intent: "complain",
      tone,
      topic: "rest",
      message: `${name} menguap pelan. kalau ada yang bikin ribut, tolong ributnya agak jauh.`,
    });
  }

  return chooseFresh(options, recentTexts);
}

function buildReply(
  row: AnyRow,
  context: AnyRow,
  recentTexts: Set<string>
): BuiltMessage {
  const speaker = getFamiliarName(row);
  const target = context.familiar_name || "kamu";
  const topic = context.topic || inferTopic(context.message || "");
  const tone = getTone(row);

  const options: BuiltMessage[] = [];

  if (topic === "kitchen") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, kamu ngomong soal dapur terlalu keras. sekarang semua orang tahu.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `kalau itu eksplorasi, kenapa aku merasa kamu sudah siap bawa kantong kecil?`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} tidak menuduh siapa pun. tapi kalau roti hilang, aku punya daftar tersangka.`,
      }
    );
  }

  if (topic === "secret_plan") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, rapat rahasia itu bukan rahasia kalau kamu bilang di tengah lobby.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `aku ikut. tapi kalau manusia datang, aku pura-pura tidur.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} merasa rencana ini akan gagal, tapi justru itu yang membuatnya menarik.`,
      }
    );
  }

  if (topic === "training") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, jangan ngajak latihan kalau nanti baru kena debu saja sudah mundur.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `latihan boleh. tapi jangan sampai owner kalian pikir ini perang kecil.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} menatap ${target}. aku mau lihat kamu serius atau cuma banyak gaya.`,
      }
    );
  }

  if (topic === "gossip") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, drama kecil biasanya mulai dari kalimat “aku cuma penasaran”.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `kalau ada gosip, jangan setengah-setengah. itu tidak sopan untuk telinga kami.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} pura-pura tidak mendengar, tapi telinganya jelas bergerak.`,
      }
    );
  }

  if (topic === "rest") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, tidur saja. kalau ada makanan jatuh, aku bangunkan.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `jangan tidur di tengah lobby. nanti ada yang mengira kamu karpet mahal.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} melihat ${target} sebentar, lalu ikut menguap tanpa alasan jelas.`,
      }
    );
  }

  options.push(
    {
      intent: "reply",
      tone,
      topic,
      message: `${target}, itu terdengar seperti awal masalah kecil. aku suka.`,
    },
    {
      intent: "reply",
      tone,
      topic,
      message: `aku tidak bilang setuju, tapi aku juga tidak akan menghentikanmu.`,
    },
    {
      intent: "reply",
      tone,
      topic,
      message: `${speaker} menatap ${target}. lanjutkan. aku ingin tahu ini akan jadi lucu atau kacau.`,
    }
  );

  if (tone === "galak") {
    options.push({
      intent: "reply",
      tone,
      topic,
      message: `${target}, bicaramu banyak. buktikan sedikit.`,
    });
  }

  if (tone === "jahil") {
    options.push({
      intent: "reply",
      tone,
      topic,
      message: `${target}, aku bisa bantu. tapi kalau gagal, namamu yang disebut duluan.`,
    });
  }

  if (tone === "tenang") {
    options.push({
      intent: "reply",
      tone,
      topic,
      message: `${target}, pelan-pelan. rencana buruk biasanya terlalu cepat diumumkan.`,
    });
  }

  if (tone === "sombong") {
    options.push({
      intent: "reply",
      tone,
      topic,
      message: `${target}, aku bisa memperbaiki rencana itu. tapi nanti semua orang tahu aku yang paling penting.`,
    });
  }

  return chooseFresh(options, recentTexts);
}

async function loadFamiliars() {
  const { data: familiarRows, error: familiarError } = await supabaseAdmin
    .from("player_familiars")
    .select("*")
    .limit(50);

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

async function loadRecentMessages() {
  const { data, error } = await supabaseAdmin
    .from("familiar_lobby_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(14);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reverse();
}

function chooseSpeaker(
  familiars: AnyRow[],
  context: AnyRow | null,
  excludedIds: Set<string>
) {
  const contextId = context?.familiar_id ?? null;

  let pool = familiars.filter(
    (item) => item.id !== contextId && !excludedIds.has(item.id)
  );

  if (pool.length === 0) {
    pool = familiars.filter((item) => item.id !== contextId);
  }

  if (pool.length === 0) {
    pool = familiars;
  }

  return pick(pool);
}

function toInsertRow(
  familiar: AnyRow,
  built: BuiltMessage,
  context: AnyRow | null
) {
  return {
    familiar_id: familiar.id,
    owner_player_id: familiar.player_id ?? null,
    species_id: familiar.species_id ?? null,

    familiar_name: getFamiliarName(familiar),
    species_name: getSpeciesName(familiar),
    avatar_url: getAvatarUrl(familiar),

    reply_to_message_id: context?.id ?? null,
    target_familiar_name: context?.familiar_name ?? null,
    topic: built.topic,

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

  const cooldownSeconds = Number(settings?.tick_cooldown_seconds ?? 15);
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

  const recentMessages = await loadRecentMessages();
  const recentTexts = new Set(recentMessages.map((item) => item.message));

  const lastMessage =
    recentMessages.length > 0
      ? recentMessages[recentMessages.length - 1]
      : null;

  const lastMessageAge =
    lastMessage?.created_at
      ? Date.now() - new Date(lastMessage.created_at).getTime()
      : Number.POSITIVE_INFINITY;

  const shouldStartNewTopic =
    !lastMessage || lastMessageAge > 8 * 60 * 1000 || Math.random() < 0.18;

  const generatedCount =
    familiars.length >= 3 ? pick([1, 1, 2]) : 1;

  const excludedIds = new Set<string>();
  const insertRows = [];

  let context: AnyRow | null = shouldStartNewTopic ? null : lastMessage;

  for (let i = 0; i < generatedCount; i++) {
    const speaker = chooseSpeaker(familiars, context, excludedIds);
    excludedIds.add(speaker.id);

    const built =
      context && !shouldStartNewTopic
        ? buildReply(speaker, context, recentTexts)
        : i === 0
        ? buildStarter(speaker, recentTexts)
        : buildReply(speaker, context, recentTexts);

    const row = toInsertRow(speaker, built, context);
    insertRows.push(row);

    context = {
      familiar_id: speaker.id,
      familiar_name: getFamiliarName(speaker),
      message: built.message,
      intent: built.intent,
      tone: built.tone,
      topic: built.topic,
      id: null,
    };

    recentTexts.add(built.message);
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("familiar_lobby_messages")
    .insert(insertRows)
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
