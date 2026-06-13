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
      message: `eh, ada yang nyium aroma dari dapur nggak? atau aku aja yang mulai halu.`,
    },
    {
      intent: "casual",
      tone,
      topic: "gossip",
      message: `kok lobby sepi banget. biasanya kalau sepi begini, bentar lagi ada yang bikin ulah.`,
    },
    {
      intent: "plan",
      tone,
      topic: "secret_plan",
      message: `aku punya ide. tapi aku butuh satu familiar yang cukup nekat buat setuju duluan.`,
    },
    {
      intent: "observe",
      tone,
      topic: "casual",
      message: `${name} ngeliatin sudut lobby dari tadi. bukan takut, cuma curiga aja.`,
    },
    {
      intent: "casual",
      tone,
      topic: "gossip",
      message: `ada yang lihat owner-ku? aku cuma mau menatapnya sampai dia merasa bersalah.`,
    },
  ];

  if (tone === "galak") {
    options.push({
      intent: "challenge",
      tone,
      topic: "training",
      message: `ada yang mau latihan nggak? atau kalian semua cuma jago duduk manis?`,
    });
  }

  if (tone === "jahil") {
    options.push({
      intent: "plan",
      tone,
      topic: "secret_plan",
      message: `aku punya rencana kecil. santai, paling cuma bikin satu orang panik.`,
    });
  }

  if (tone === "ngantuk") {
    options.push({
      intent: "complain",
      tone,
      topic: "rest",
      message: `aku mau tidur. kalau kalian mau drama, volumenya kecilin dikit.`,
    });
  }

  if (tone === "sombong") {
    options.push({
      intent: "brag",
      tone,
      topic: "casual",
      message: `aku baru masuk sebentar, lobby ini langsung kelihatan lebih mahal.`,
    });
  }

  return chooseFresh(options, recentTexts);
}

function buildReply(
  row: AnyRow,
  context: AnyRow | null,
  recentTexts: Set<string>
): BuiltMessage {
  if (!context) {
    return buildStarter(row, recentTexts);
  }

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
        message: `${target}, jangan ngomong dapur keras-keras. nanti pintunya dikunci beneran.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `kalau kita ke dapur, itu bukan nyuri. itu... inspeksi kualitas.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `aku ikut, tapi kalau ketahuan kamu yang lari duluan ya.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `tunggu. siapa yang bilang soal dapur duluan? aku cuma mau tahu siapa yang harus disalahin nanti.`,
      }
    );
  }

  if (topic === "secret_plan") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, rapat rahasia kok diumumin di lobby. hebat juga.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `oke, aku ikut. tapi aturan pertama: jangan ajak manusia. mereka panik duluan.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `rencana ini kedengarannya buruk. jadi kemungkinan besar menarik.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} menoleh pelan. lanjut. aku belum bilang setuju, tapi aku juga belum pergi.`,
      }
    );
  }

  if (topic === "training") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, ngomongnya berani. nanti pas latihan jangan pura-pura sakit kaki.`,
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
        message: `aku mau lihat ini. biasanya yang paling keras ngajak latihan jatuh duluan.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} mengangkat kepala. akhirnya ada yang ngomong sesuatu yang tidak membosankan.`,
      }
    );
  }

  if (topic === "gossip") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `nah itu baru gosip. jangan berhenti di bagian menarik.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, lanjut. telingaku sudah terlanjur kerja.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `kalau cuma setengah cerita, itu bukan gosip. itu nyiksa pendengar.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${speaker} pura-pura tidak peduli, tapi jelas makin mendekat.`,
      }
    );
  }

  if (topic === "rest") {
    options.push(
      {
        intent: "reply",
        tone,
        topic,
        message: `tidur aja. nanti kalau ada yang jatuh dari meja, aku bangunin.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `${target}, jangan tidur di tengah lobby. nanti ada yang kira kamu karpet mahal.`,
      },
      {
        intent: "reply",
        tone,
        topic,
        message: `aku juga mau tidur, tapi sekarang aku penasaran siapa yang bakal bikin masalah duluan.`,
      }
    );
  }

  options.push(
    {
      intent: "reply",
      tone,
      topic,
      message: `${target}, kamu ngomong gitu bikin aku curiga.`,
    },
    {
      intent: "reply",
      tone,
      topic,
      message: `hmm... aku setuju setengah. setengahnya lagi aku tunggu sampai ada masalah.`,
    },
    {
      intent: "reply",
      tone,
      topic,
      message: `oke, tapi kalau ini berakhir kacau, aku bilang dari awal cuma nonton.`,
    },
    {
      intent: "reply",
      tone,
      topic,
      message: `${speaker} menatap ${target}. kamu sadar itu terdengar seperti awal masalah, kan?`,
    }
  );

  if (tone === "galak") {
    options.push({
      intent: "reply",
      tone,
      topic,
      message: `${target}, langsung aja. terlalu banyak muter-muter.`,
    });
  }

  if (tone === "jahil") {
    options.push({
      intent: "reply",
      tone,
      topic,
      message: `aku bisa bantu, tapi namaku jangan dibawa kalau gagal.`,
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
      message: `aku bisa memperbaiki rencana itu. tapi nanti semua orang harus tahu aku yang paling penting.`,
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
    familiars.length >= 3 && Math.random() < 0.18 ? 2 : 1;

  const excludedIds = new Set<string>();
  const insertRows: AnyRow[] = [];

  let context: AnyRow | null = shouldStartNewTopic ? null : lastMessage;

  for (let i = 0; i < generatedCount; i++) {
    const speaker = chooseSpeaker(familiars, context, excludedIds);
    excludedIds.add(speaker.id);

    const built = context
      ? buildReply(speaker, context, recentTexts)
      : buildStarter(speaker, recentTexts);

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
