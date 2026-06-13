import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const [{ data: players, error: playersError }, { data: species, error: speciesError }] =
      await Promise.all([
        supabaseAdmin
          .from("players")
          .select("id, character_name, guild_rank, pathway, race")
          .order("character_name", { ascending: true }),

        supabaseAdmin
          .from("familiar_species")
          .select("id, name, slug, habitat, role, short_description")
          .order("name", { ascending: true }),
      ]);

    if (playersError) {
      return NextResponse.json(
        { error: playersError.message },
        { status: 500 }
      );
    }

    if (speciesError) {
      return NextResponse.json(
        { error: speciesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      players: players || [],
      species: species || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load familiar admin options." },
      { status: 500 }
    );
  }
}
