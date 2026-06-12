import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CareAction = "feed" | "care" | "train" | "rest";

type FamiliarRow = {
  id: string;
  player_id: string;
  familiar_name: string;
  mood: number;
  energy: number;
  bond_xp: number;
  last_feed_at: string | null;
  last_care_at: string | null;
  last_train_at: string | null;
  last_rest_at: string | null;
  familiar_species?: {
    name: string;
  } | null;
};

const actionRules: Record<
  CareAction,
  {
    moodChange: number;
    energyChange: number;
    bondChange: number;
    cooldownField:
      | "last_feed_at"
      | "last_care_at"
      | "last_train_at"
      | "last_rest_at";
    cooldownHours: number;
    minEnergy?: number;
    desire: string;
    narration: (name: string) => string;
  }
> = {
  feed: {
    moodChange: 5,
    energyChange: 5,
    bondChange: 2,
    cooldownField: "last_feed_at",
    cooldownHours: 6,
    desire: "wants_attention",
    narration: (name) =>
      `${name} menerima makanan kecil dan terlihat sedikit lebih dekat dengan owner-nya.`,
  },
  care: {
    moodChange: 10,
    energyChange: 0,
    bondChange: 5,
    cooldownField: "last_care_at",
    cooldownHours: 12,
    desire: "feels_attached",
    narration: (name) =>
      `${name} dirawat dengan lembut. Ia tampak lebih percaya pada owner-nya.`,
  },
  train: {
    moodChange: -2,
    energyChange: -10,
    bondChange: 8,
    cooldownField: "last_train_at",
    cooldownHours: 24,
    minEnergy: 15,
    desire: "wants_rest",
    narration: (name) =>
      `${name} menjalani latihan kecil. Ia terlihat lelah, tapi bond-nya bertambah kuat.`,
  },
  rest: {
    moodChange: 3,
    energyChange: 20,
    bondChange: 1,
    cooldownField: "last_rest_at",
    cooldownHours: 6,
    desire: "wants_train",
    narration: (name) =>
      `${name} beristirahat di bawah cahaya bulan dan energinya mulai pulih.`,
  },
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getRelationshipStatus(mood: number) {
  if (mood >= 55) return "Normal";
  if (mood >= 30) return "Restless";
  return "Distant";
}

function getRemainingText(ms: number) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} menit`;
  if (minutes <= 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server env Supabase belum lengkap." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const playerId = String(body.playerId || "");
    const familiarId = String(body.familiarId || "");
    const action = String(body.action || "") as CareAction;

    if (!playerId || !familiarId || !actionRules[action]) {
      return NextResponse.json(
        { error: "Request familiar care tidak valid." },
        { status: 400 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data: familiar, error: familiarError } = await admin
      .from("player_familiars")
      .select(
        `
        *,
        familiar_species (
          name
        )
      `
      )
      .eq("id", familiarId)
      .eq("player_id", playerId)
      .eq("is_active", true)
      .single();

    if (familiarError || !familiar) {
      return NextResponse.json(
        { error: "Familiar aktif tidak ditemukan untuk player ini." },
        { status: 404 }
      );
    }

    const typedFamiliar = familiar as FamiliarRow;
    const rule = actionRules[action];
    const now = new Date();
    const lastActionAt = typedFamiliar[rule.cooldownField];

    if (lastActionAt) {
      const last = new Date(lastActionAt);
      const cooldownMs = rule.cooldownHours * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - last.getTime();

      if (elapsedMs < cooldownMs) {
        return NextResponse.json(
          {
            error: `Aksi ini masih cooldown. Tunggu ${getRemainingText(
              cooldownMs - elapsedMs
            )}.`,
          },
          { status: 429 }
        );
      }
    }

    if (rule.minEnergy && typedFamiliar.energy < rule.minEnergy) {
      return NextResponse.json(
        {
          error:
            "Energy familiar terlalu rendah untuk latihan. Biarkan dia rest dulu.",
        },
        { status: 400 }
      );
    }

    const nextMood = clamp(typedFamiliar.mood + rule.moodChange);
    const nextEnergy = clamp(typedFamiliar.energy + rule.energyChange);
    const nextBond = Math.max(0, typedFamiliar.bond_xp + rule.bondChange);

    const familiarName =
      typedFamiliar.familiar_name ||
      typedFamiliar.familiar_species?.name ||
      "Familiar";

    const narration = rule.narration(familiarName);

    const updatePayload: Record<string, unknown> = {
      mood: nextMood,
      energy: nextEnergy,
      bond_xp: nextBond,
      relationship_status: getRelationshipStatus(nextMood),
      desire: rule.desire,
      updated_at: now.toISOString(),
      [rule.cooldownField]: now.toISOString(),
    };

    const { error: updateError } = await admin
      .from("player_familiars")
      .update(updatePayload)
      .eq("id", familiarId)
      .eq("player_id", playerId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    await admin.from("familiar_care_logs").insert({
      player_familiar_id: familiarId,
      player_id: playerId,
      action,
      mood_change: rule.moodChange,
      energy_change: rule.energyChange,
      bond_change: rule.bondChange,
      narration,
    });

    const { data: updatedFamiliar, error: refetchError } = await admin
      .from("player_familiars")
      .select(
        `
        *,
        familiar_species (*),
        players (
          character_name,
          race,
          guild_rank,
          pathway
        )
      `
      )
      .eq("id", familiarId)
      .single();

    if (refetchError) {
      return NextResponse.json(
        { error: refetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: narration,
      familiar: updatedFamiliar,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown familiar care error.",
      },
      { status: 500 }
    );
  }
                          }
