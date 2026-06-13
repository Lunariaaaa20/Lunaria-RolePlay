import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type GrantBody = {
  playerId: string;
  speciesId: string;
  familiarName?: string;
  personality?: string;
  relationshipStatus?: string;
  desire?: string;
  replaceExisting?: boolean;
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GrantBody;

    const playerId = body.playerId?.trim();
    const speciesId = body.speciesId?.trim();
    const familiarNameInput = body.familiarName?.trim() || "";
    const replaceExisting = body.replaceExisting ?? true;

    if (!playerId || !speciesId) {
      return NextResponse.json(
        { error: "playerId dan speciesId wajib diisi." },
        { status: 400 }
      );
    }

    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select("id, character_name")
      .eq("id", playerId)
      .maybeSingle();

    if (playerError || !player) {
      return NextResponse.json(
        { error: "Player tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data: species, error: speciesError } = await supabaseAdmin
      .from("familiar_species")
      .select("id, name, habitat")
      .eq("id", speciesId)
      .maybeSingle();

    if (speciesError || !species) {
      return NextResponse.json(
        { error: "Familiar species tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data: activeExisting, error: existingError } = await supabaseAdmin
      .from("player_familiars")
      .select("id, familiar_name")
      .eq("player_id", playerId)
      .eq("is_active", true);

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (activeExisting && activeExisting.length > 0 && !replaceExisting) {
      return NextResponse.json(
        {
          error:
            "Player masih punya familiar aktif. Nonaktifkan dulu atau aktifkan replaceExisting.",
        },
        { status: 400 }
      );
    }

    if (replaceExisting) {
      const { error: deactivateError } = await supabaseAdmin
        .from("player_familiars")
        .update({ is_active: false })
        .eq("player_id", playerId)
        .eq("is_active", true);

      if (deactivateError) {
        return NextResponse.json(
          { error: deactivateError.message },
          { status: 500 }
        );
      }
    }

    const personalityPool = [
      "Smart",
      "Curious",
      "Gentle",
      "Loyal",
      "Clumsy",
      "Playful",
      "Bold",
      "Calm",
    ];

    const desirePool = [
      "wants_attention",
      "wants_rest",
      "wants_train",
      "feels_attached",
    ];

    const personality =
      body.personality?.trim() || pickRandom(personalityPool);
    const relationshipStatus = body.relationshipStatus?.trim() || "Normal";
    const desire = body.desire?.trim() || pickRandom(desirePool);

    const finalName = familiarNameInput || species.name;

    const insertPayload = {
      player_id: playerId,
      species_id: speciesId,
      familiar_name: finalName,
      stage: 1,
      mood: 78,
      energy: 82,
      bond_xp: 0,
      personality,
      relationship_status: relationshipStatus,
      desire,
      battle_wins: 0,
      battle_losses: 0,
      tournament_wins: 0,
      memory_summary: `Familiar pertama kali terikat dengan owner di bawah cahaya bulan Lunaria.`,
      is_active: true,
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("player_familiars")
      .insert(insertPayload)
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
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${finalName} berhasil di-bind ke ${player.character_name}.`,
      familiar: inserted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to bind familiar." },
      { status: 500 }
    );
  }
    }
