import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("player_familiars")
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
      .order("obtained_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      familiars: data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load familiar list." },
      { status: 500 }
    );
  }
}
