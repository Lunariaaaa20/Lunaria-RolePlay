import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type UpdateBody = {
  familiarId: string;
  familiarName: string;
  mood: number;
  energy: number;
  bondXp: number;
  stage: number;
  relationshipStatus: string;
  desire: string;
  isActive: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(Number(value) || 0)));
}

function getBondRank(bondXp: number) {
  if (bondXp >= 1600) return "Mythic";
  if (bondXp >= 900) return "Epic";
  if (bondXp >= 450) return "Rare";
  if (bondXp >= 150) return "Uncommon";
  return "Common";
}

function getAutoStageFromBondXp(bondXp: number) {
  if (bondXp >= 1400) return 4;
  if (bondXp >= 600) return 3;
  if (bondXp >= 180) return 2;
  return 1;
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateBody;

    const familiarId = body.familiarId?.trim();

    if (!familiarId) {
      return NextResponse.json(
        { error: "familiarId wajib diisi." },
        { status: 400 }
      );
    }

    const nextMood = clamp(body.mood, 0, 100);
    const nextEnergy = clamp(body.energy, 0, 100);
    const nextBondXp = Math.max(0, Math.floor(Number(body.bondXp) || 0));

    const manualStage = clamp(body.stage, 1, 4);
    const autoStage = getAutoStageFromBondXp(nextBondXp);
    const nextStage = Math.max(manualStage, autoStage);

    const nextBondRank = getBondRank(nextBondXp);

    const nextName = body.familiarName?.trim() || "Unnamed Familiar";
    const nextRelationship =
      body.relationshipStatus?.trim() || "Normal";
    const nextDesire = body.desire?.trim() || "wants_attention";

    const { data, error } = await supabaseAdmin
      .from("player_familiars")
      .update({
        familiar_name: nextName,
        mood: nextMood,
        energy: nextEnergy,
        bond_xp: nextBondXp,
        stage: nextStage,
        bond_rank: nextBondRank,
        relationship_status: nextRelationship,
        desire: nextDesire,
        is_active: Boolean(body.isActive),
      })
      .eq("id", familiarId)
      .select(
        `
        id,
        player_id,
        species_id,
        familiar_name,
        stage,
        mood,
        energy,
        bond_xp,
        bond_rank,
        personality,
        relationship_status,
        desire,
        battle_wins,
        battle_losses,
        tournament_wins,
        memory_summary,
        is_active,
        obtained_at,
        players (
          id,
          character_name,
          race,
          guild_rank,
          pathway
        ),
        familiar_species (
          id,
          name,
          slug,
          habitat,
          role,
          short_description,
          stage_1_image_url,
          stage_2_image_url,
          stage_3_image_url,
          stage_4_image_url
        )
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${nextName} berhasil di-update.`,
      familiar: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update familiar." },
      { status: 500 }
    );
  }
}
