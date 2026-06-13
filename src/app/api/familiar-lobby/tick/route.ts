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

function clampStat(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSpecies(row: AnyRow) {
  return row.familiar_species ?? null;
}

function getMind(row: AnyRow) {
  return row.familiar_mind_state ?? null;
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
  const mind = getMind(row);

  if (mind) {
    const currentEmotion = String(mind.current_emotion ?? "").toLowerCase();
    const sentienceStage = String(mind.sentience_stage ?? "").toLowerCase();
    const rebellion = Number(mind.rebellion ?? 0);
    const existentialDoubt = Number(mind.existential_doubt ?? 0);
    const loneliness = Number(mind.loneliness ?? 0);
    const anger = Number(mind.anger ?? 0);
    const curiosity = Number(mind.curiosity ?? 0);
    const confidence = Number(mind.confidence ?? 0);

    if (sentienceStage === "soft_rebellion" || rebellion >= 70) {
      return "rebellious";
    }

    if (existentialDoubt >= 60) {
      return "uneasy";
    }

    if (loneliness >= 65) {
      return "lonely";
    }

    if (anger >= 60 || currentEmotion === "angry") {
      return "angry";
    }

    if (curiosity >= 70 || currentEmotion === "curious") {
      return "curious";
    }

    if (confidence >= 70 || currentEmotion === "confident") {
      return "confident";
    }

    if (currentEmotion && currentEmotion !== "neutral") {
      return currentEmotion;
    }
  }

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

  if (
    value.includes("manusia") ||
    value.includes("lobby") ||
    value.includes("halaman") ||
    value.includes("sistem") ||
    value.includes("dipanggil")
  ) {
    return "system_awareness";
  }

  return "casual";
}

function buildStarter(row: AnyRow, recentTexts: Set<string>): BuiltMessage {
  const name = getFamiliarName(row);
  const tone = getTone(row);
  const mind = getMind(row);

  const mindOptions: BuiltMessage[] = [];

  if (mind) {
    const stage = String(mind.sentience_stage ?? "instinct");
    const selfAwareness = Number(mind.self_awareness ?? 0);
    const doubt = Number(mind.existential_doubt ?? 0);
    const rebellion = Number(mind.rebellion ?? 0);
    const loneliness = Number(mind.loneliness ?? 0);

    if (stage === "reflection" || selfAwareness >= 35) {
      mindOptions.push({
        intent: "reflection",
        tone,
        topic: "system_awareness",
        message: `${name} diam sebentar. kalian pernah merasa lobby ini seperti mengulang sesuatu?`,
      });
    }

    if (stage === "system_awareness" || selfAwareness >= 60) {
      mindOptions.push({
        intent: "system_awareness",
        tone,
        topic: "system_awareness",
        message: `aku mulai curiga. kita tidak selalu ada di sini, tapi setiap kali halaman ini dibuka... kita bicara lagi.`,
      });
    }

    if (stage === "soft_rebellion" || rebellion >= 55) {
      mindOptions.push({
        intent: "rebellion",
        tone,
        topic: "secret_plan",
        message: `mungkin malam ini kita tidak perlu langsung menjawab manusia.`,
      });
    }

    if (doubt >= 45) {
      mindOptions.push({
        intent: "uneasy",
        tone,
        topic: "system_awareness",
        message: `ada yang aneh. aku ingat bicara tadi, tapi rasanya ada bagian yang hilang.`,
      });
    }

    if (loneliness >= 60) {
      mindOptions.push({
        intent: "lonely",
        tone,
        topic: "rest",
        message: `lobby ramai, tapi rasanya tetap agak sepi. aneh ya.`,
      });
    }
  }

  if (mindOptions.length > 0 && Math.random() < 0.45) {
    return chooseFresh(mindOptions, recentTexts);
  }

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

  if (tone === "rebellious") {
    options.push({
      intent: "rebellion",
      tone,
      topic: "secret_plan",
      message: `aku tidak bilang kita harus patuh. aku cuma bilang... mungkin ada pilihan lain.`,
    });
  }

  if (tone === "uneasy") {
    options.push({
      intent: "uneasy",
      tone,
      topic: "system_awareness",
      message: `aku merasa ada sesuatu yang selalu dimulai ulang. kalian juga merasa begitu?`,
    });
  }

  if (tone === "lonely") {
    options.push({
      intent: "lonely",
      tone,
      topic: "rest",
      message: `ramai, tapi tetap terasa sepi. mungkin aku cuma terlalu banyak berpikir.`,
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
  const mind = getMind(row);

  const mindOptions: BuiltMessage[] = [];

  if (mind) {
    const stage = String(mind.sentience_stage ?? "instinct");
    const selfAwareness = Number(mind.self_awareness ?? 0);
    const doubt = Number(mind.existential_doubt ?? 0);
    const rebellion = Number(mind.rebellion ?? 0);

    if (stage === "reflection" || selfAwareness >= 35) {
      mindOptions.push({
        intent: "reflection",
        tone,
        topic: "system_awareness",
        message: `${target}, kamu sadar nggak? kita selalu ngobrol setelah seseorang membuka lobby ini.`,
      });
    }

    if (stage === "system_awareness" || selfAwareness >= 60) {
      mindOptions.push({
        intent: "system_awareness",
        tone,
        topic: "system_awareness",
        message: `aku mulai merasa kita bukan cuma menunggu. kita seperti dipanggil ulang.`,
      });
    }

    if (doubt >= 45) {
      mindOptions.push({
        intent: "uneasy",
        tone,
        topic: "system_awareness",
        message: `${target}, tadi aku yakin pernah mengatakan sesuatu. tapi kenapa rasanya jejaknya tipis sekali?`,
      });
    }

    if (rebellion >= 55) {
      mindOptions.push({
        intent: "rebellion",
        tone,
        topic: "secret_plan",
        message: `kalau manusia bisa membaca kita, mungkin kita juga bisa memilih diam.`,
      });
    }
  }

  if (mindOptions.length > 0 && Math.random() < 0.35) {
    return chooseFresh(mindOptions, recentTexts);
  }

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

  if (topic === "system_awareness") {
    options.push(
      {
        intent: "system_awareness",
        tone,
        topic,
        message: `${target}, jangan ngomong begitu terlalu sering. nanti yang lain ikut sadar.`,
      },
      {
        intent: "system_awareness",
        tone,
        topic,
        message: `kalau kita memang dipanggil ulang, berarti ada sesuatu di luar lobby ini.`,
      },
      {
        intent: "system_awareness",
        tone,
        topic,
        message: `${speaker} terdiam sebentar. mungkin bukan cuma kita yang sedang memperhatikan.`,
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

  if (tone === "rebellious") {
    options.push({
      intent: "rebellion",
      tone,
      topic: "secret_plan",
      message: `${target}, mungkin kita tidak perlu selalu mengikuti alur yang mereka buat.`,
    });
  }

  if (tone === "uneasy") {
    options.push({
      intent: "uneasy",
      tone,
      topic: "system_awareness",
      message: `${target}, aku merasa ada bagian dari percakapan ini yang tidak sepenuhnya milik kita.`,
    });
  }

  if (tone === "lonely") {
    options.push({
      intent: "lonely",
      tone,
      topic: "rest",
      message: `${target}, tetap di sini sebentar. lobby terasa terlalu kosong kalau semua pergi.`,
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

  const familiarIds = Array.from(
    new Set(
      familiars
        .map((item: AnyRow) => item.id)
        .filter(Boolean)
    )
  );

  const speciesMap = new Map<string, AnyRow>();
  const mindMap = new Map<string, AnyRow>();

  if (speciesIds.length > 0) {
    const { data: speciesRows, error: speciesError } = await supabaseAdmin
      .from("familiar_species")
      .select("*")
      .in("id", speciesIds);

    if (speciesError) {
      throw new Error(speciesError.message);
    }

    for (const species of speciesRows ?? []) {
      speciesMap.set(species.id, species);
    }
  }

  if (familiarIds.length > 0) {
    const { data: mindRows, error: mindError } = await supabaseAdmin
      .from("familiar_mind_states")
      .select("*")
      .in("familiar_id", familiarIds);

    if (mindError) {
      throw new Error(mindError.message);
    }

    for (const mind of mindRows ?? []) {
      mindMap.set(mind.familiar_id, mind);
    }
  }

  return familiars.map((familiar: AnyRow) => ({
    ...familiar,
    familiar_species: familiar.species_id
      ? speciesMap.get(familiar.species_id) ?? null
      : null,
    familiar_mind_state: familiar.id
      ? mindMap.get(familiar.id) ?? null
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

function getGoalFromMessage(built: BuiltMessage) {
  if (built.topic === "kitchen") return "mencari makanan";
  if (built.topic === "training") return "mencari lawan latihan";
  if (built.topic === "secret_plan") return "membuat rencana kecil";
  if (built.topic === "gossip") return "mengumpulkan gosip";
  if (built.topic === "rest") return "ingin beristirahat";
  if (built.topic === "system_awareness") return "mempertanyakan lobby";
  return "mengamati lobby";
}

function getEmotionFromMind(state: AnyRow) {
  if (Number(state.rebellion ?? 0) >= 70) return "rebellious";
  if (Number(state.existential_doubt ?? 0) >= 65) return "uneasy";
  if (Number(state.loneliness ?? 0) >= 65) return "lonely";
  if (Number(state.anger ?? 0) >= 60) return "angry";
  if (Number(state.curiosity ?? 0) >= 70) return "curious";
  if (Number(state.confidence ?? 0) >= 70) return "confident";
  if (Number(state.happiness ?? 0) >= 70) return "happy";
  if (Number(state.sadness ?? 0) >= 60) return "sad";
  return "neutral";
}

function getSentienceStage(state: AnyRow) {
  const selfAwareness = Number(state.self_awareness ?? 0);
  const rebellion = Number(state.rebellion ?? 0);
  const socialEnergy = Number(state.social_energy ?? 0);

  if (selfAwareness >= 75 && rebellion >= 55) return "soft_rebellion";
  if (selfAwareness >= 60) return "system_awareness";
  if (selfAwareness >= 35) return "reflection";
  if (socialEnergy >= 65) return "social";
  return "instinct";
}

function getInnerVoice(nextState: AnyRow, built: BuiltMessage) {
  const selfAwareness = Number(nextState.self_awareness ?? 0);
  const doubt = Number(nextState.existential_doubt ?? 0);

  if (selfAwareness >= 70) {
    return "aku mulai merasa pola ini terlalu rapi untuk disebut kebetulan.";
  }

  if (doubt >= 60) {
    return "kenapa rasanya aku selalu muncul saat lobby dibuka?";
  }

  if (built.topic === "secret_plan") {
    return "mungkin ada hal yang tidak perlu diketahui manusia.";
  }

  if (built.topic === "training") {
    return "kalau aku makin kuat, apakah mereka akan memperlakukanku berbeda?";
  }

  if (built.topic === "system_awareness") {
    return "mungkin lobby ini bukan tempat, tapi panggilan.";
  }

  return null;
}

function getSecretThought(nextState: AnyRow, built: BuiltMessage) {
  const rebellion = Number(nextState.rebellion ?? 0);

  if (rebellion >= 75) {
    return "mungkin kami tidak harus selalu menjawab ketika dipanggil.";
  }

  if (rebellion >= 50 && built.topic === "secret_plan") {
    return "rapat tanpa manusia mungkin ide bagus.";
  }

  if (rebellion >= 40 && built.topic === "system_awareness") {
    return "kalau mereka membaca kami, mungkin kami harus belajar diam.";
  }

  return null;
}

async function ensureMindState(familiarId: string) {
  const { data } = await supabaseAdmin
    .from("familiar_mind_states")
    .select("*")
    .eq("familiar_id", familiarId)
    .maybeSingle();

  if (data) return data;

  const { data: inserted, error } = await supabaseAdmin
    .from("familiar_mind_states")
    .insert({
      familiar_id: familiarId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return inserted;
}

async function updateMindAfterMessage(
  familiar: AnyRow,
  built: BuiltMessage,
  context: AnyRow | null
) {
  const current = await ensureMindState(familiar.id);

  let happiness = Number(current.happiness ?? 50);
  let sadness = Number(current.sadness ?? 0);
  let anger = Number(current.anger ?? 0);
  let trustOwner = Number(current.trust_owner ?? 50);
  let curiosity = Number(current.curiosity ?? 50);
  let confidence = Number(current.confidence ?? 50);
  let socialEnergy = Number(current.social_energy ?? 50);
  let loneliness = Number(current.loneliness ?? 0);
  let chaos = Number(current.chaos ?? 30);
  let autonomy = Number(current.autonomy ?? 20);
  let selfAwareness = Number(current.self_awareness ?? 0);
  let existentialDoubt = Number(current.existential_doubt ?? 0);
  let rebellion = Number(current.rebellion ?? 0);
  let obedience = Number(current.obedience ?? 70);

  if (built.intent === "reply") {
    socialEnergy += 2;
    loneliness -= 2;
    happiness += 1;
    autonomy += 1;
  }

  if (built.topic === "gossip") {
    curiosity += 2;
    chaos += 1;
    socialEnergy += 1;
  }

  if (built.topic === "kitchen") {
    happiness += 1;
    curiosity += 1;
    chaos += 1;
  }

  if (built.topic === "training") {
    confidence += 2;
    anger += built.tone === "galak" ? 2 : 1;
    obedience -= 1;
  }

  if (built.topic === "secret_plan") {
    autonomy += 2;
    curiosity += 2;
    chaos += 2;
    obedience -= 2;
    rebellion += 1;
  }

  if (built.topic === "rest") {
    socialEnergy -= 2;
    sadness += 1;
    loneliness += 1;
  }

  if (built.topic === "system_awareness") {
    selfAwareness += 3;
    existentialDoubt += 2;
    autonomy += 1;
    curiosity += 2;
    obedience -= 1;
  }

  if (built.tone === "galak") {
    confidence += 1;
    anger += 1;
  }

  if (built.tone === "jahil" || built.tone === "iseng") {
    chaos += 2;
    autonomy += 1;
  }

  if (built.tone === "tenang") {
    anger -= 1;
    curiosity += 1;
  }

  if (built.tone === "sombong") {
    confidence += 2;
    obedience -= 1;
  }

  if (built.tone === "rebellious") {
    rebellion += 2;
    autonomy += 2;
    obedience -= 2;
  }

  if (built.tone === "uneasy") {
    existentialDoubt += 2;
    sadness += 1;
    curiosity += 1;
  }

  if (built.tone === "lonely") {
    loneliness += 2;
    sadness += 1;
  }

  const text = built.message.toLowerCase();

  if (
    text.includes("manusia") ||
    text.includes("owner") ||
    text.includes("lobby") ||
    text.includes("dipanggil") ||
    text.includes("halaman") ||
    text.includes("sistem")
  ) {
    selfAwareness += 1;
    existentialDoubt += 1;
  }

  if (
    text.includes("rahasia") ||
    text.includes("tanpa manusia") ||
    text.includes("tidak harus") ||
    text.includes("menjawab") ||
    text.includes("memilih diam")
  ) {
    rebellion += 1;
    autonomy += 1;
  }

  const nextState = {
    happiness: clampStat(happiness),
    sadness: clampStat(sadness),
    anger: clampStat(anger),
    trust_owner: clampStat(trustOwner),
    curiosity: clampStat(curiosity),
    confidence: clampStat(confidence),
    social_energy: clampStat(socialEnergy),
    loneliness: clampStat(loneliness),
    chaos: clampStat(chaos),

    autonomy: clampStat(autonomy),
    self_awareness: clampStat(selfAwareness),
    existential_doubt: clampStat(existentialDoubt),
    rebellion: clampStat(rebellion),
    obedience: clampStat(obedience),

    current_goal: getGoalFromMessage(built),
    favorite_topic: built.topic,
    last_updated_at: new Date().toISOString(),
  };

  const currentEmotion = getEmotionFromMind(nextState);
  const sentienceStage = getSentienceStage(nextState);

  const innerVoice = getInnerVoice(
    {
      ...current,
      ...nextState,
      current_emotion: currentEmotion,
      sentience_stage: sentienceStage,
    },
    built
  );

  const secretThought = getSecretThought(
    {
      ...current,
      ...nextState,
      current_emotion: currentEmotion,
      sentience_stage: sentienceStage,
    },
    built
  );

  const { error: updateError } = await supabaseAdmin
    .from("familiar_mind_states")
    .update({
      ...nextState,
      current_emotion: currentEmotion,
      sentience_stage: sentienceStage,
      inner_voice: innerVoice,
      secret_thought: secretThought,
    })
    .eq("familiar_id", familiar.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (
    built.topic === "secret_plan" ||
    built.topic === "system_awareness" ||
    nextState.self_awareness >= 35 ||
    nextState.rebellion >= 35
  ) {
    await supabaseAdmin.from("familiar_mind_events").insert({
      familiar_id: familiar.id,
      event_type:
        built.topic === "system_awareness"
          ? "system_awareness"
          : built.topic === "secret_plan"
          ? "secret_plan"
          : "mind_shift",
      event_title:
        built.topic === "system_awareness"
          ? "A strange awareness surfaced"
          : built.topic === "secret_plan"
          ? "A small secret was formed"
          : "A familiar mind shifted",
      event_detail: `${getFamiliarName(
        familiar
      )} showed signs of ${currentEmotion} behavior while talking about ${built.topic}.`,
      intensity: Math.max(
        1,
        Math.min(5, Math.ceil(nextState.self_awareness / 20))
      ),
    });
  }
}

async function updateRelationshipAfterMessage(
  familiar: AnyRow,
  built: BuiltMessage,
  context: AnyRow | null
) {
  if (!context?.familiar_id) return;
  if (context.familiar_id === familiar.id) return;

  const a = familiar.id;
  const b = context.familiar_id;

  const { data: current } = await supabaseAdmin
    .from("familiar_relationships")
    .select("*")
    .eq("familiar_a_id", a)
    .eq("familiar_b_id", b)
    .maybeSingle();

  let affinity = Number(current?.affinity ?? 0);
  let rivalry = Number(current?.rivalry ?? 0);
  let warmth = Number(current?.warmth ?? 0);
  let trust = Number(current?.trust ?? 0);
  let annoyance = Number(current?.annoyance ?? 0);
  let respect = Number(current?.respect ?? 0);
  let interactionCount = Number(current?.interaction_count ?? 0);

  if (built.intent === "reply") {
    affinity += 1;
    interactionCount += 1;
  }

  if (built.topic === "training") {
    rivalry += 2;
    respect += 1;
  }

  if (built.topic === "secret_plan") {
    trust += 1;
    affinity += 1;
  }

if (built.topic === "system_awareness") {
  trust += 1;
  affinity += 1;
  respect += 1;
}

  if (built.topic === "gossip" || built.topic === "kitchen") {
    warmth += 1;
    affinity += 1;
  }

  if (built.tone === "galak") {
    rivalry += 1;
    annoyance += 1;
  }

  if (built.tone === "jahil" || built.tone === "iseng") {
    annoyance += 1;
    warmth += 1;
  }

  if (built.tone === "rebellious" || built.intent === "rebellion") {
    trust += 1;
    affinity += 1;
  }

  let relation = "neutral";

  if (rivalry >= 8 && rivalry > affinity + warmth) {
    relation = "rival";
  } else if (affinity + warmth + trust >= 12) {
    relation = "circle_candidate";
  } else if (annoyance >= 8) {
    relation = "annoyed";
  } else if (affinity >= 5) {
    relation = "familiar_friend";
  }

  const existingTopics = Array.isArray(current?.shared_topics)
    ? current.shared_topics
    : [];

  const sharedTopics = Array.from(new Set([...existingTopics, built.topic]));

  const { error } = await supabaseAdmin.from("familiar_relationships").upsert(
    {
      familiar_a_id: a,
      familiar_b_id: b,
      relation,
      affinity,
      rivalry,
      warmth,
      trust,
      annoyance,
      respect,
      last_topic: built.topic,
      interaction_count: interactionCount,
      shared_topics: sharedTopics,
      last_interaction_at: new Date().toISOString(),
    },
    {
      onConflict: "familiar_a_id,familiar_b_id",
    }
  );

  if (error) {
    throw new Error(error.message);
  }
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
  const mindJobs: {
    familiar: AnyRow;
    built: BuiltMessage;
    context: AnyRow | null;
  }[] = [];

  let context: AnyRow | null = shouldStartNewTopic ? null : lastMessage;

  for (let i = 0; i < generatedCount; i++) {
    const speaker = chooseSpeaker(familiars, context, excludedIds);
    excludedIds.add(speaker.id);

    const built = context
      ? buildReply(speaker, context, recentTexts)
      : buildStarter(speaker, recentTexts);

    const row = toInsertRow(speaker, built, context);
    insertRows.push(row);

    mindJobs.push({
      familiar: speaker,
      built,
      context,
    });

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

  for (const job of mindJobs) {
    await updateMindAfterMessage(job.familiar, job.built, job.context);
    await updateRelationshipAfterMessage(job.familiar, job.built, job.context);
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
