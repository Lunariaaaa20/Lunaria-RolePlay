import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type CreateEncounterBody = {
  playerId: string;
  speciesId: string;
  signalTitle?: string;
  bondingTask: string;
  familiarName?: string;
  personality?: string;
  desire?: string;
  adminNote?: string;
};

type PatchEncounterBody = {
  encounterId: string;
  action: "approve" | "reject" | "expire";
  adminNote?: string;
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("familiar_encounters")
      .select(
        `
        *,
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
          short_description
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      encounters: data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load familiar encounters." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateEncounterBody;

    const playerId = body.playerId?.trim();
    const speciesId = body.speciesId?.trim();
    const bondingTask = body.bondingTask?.trim();

    if (!playerId || !speciesId || !bondingTask) {
      return NextResponse.json(
        { error: "Player, species, dan bonding task wajib diisi." },
        { status: 400 }
      );
    }

    const { data: existingOpen, error: existingError } = await supabaseAdmin
      .from("familiar_encounters")
      .select("id, status")
      .eq("player_id", playerId)
      .in("status", ["active", "submitted"])
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existingOpen) {
      return NextResponse.json(
        {
          error:
            "Player ini masih punya Familiar Signal aktif / submitted. Selesaikan dulu sebelum buat signal baru.",
        },
        { status: 400 }
      );
    }

    const { data: species, error: speciesError } = await supabaseAdmin
      .from("familiar_species")
      .select("id, name")
      .eq("id", speciesId)
      .maybeSingle();

    if (speciesError || !species) {
      return NextResponse.json(
        { error: "Familiar species tidak ditemukan." },
        { status: 404 }
      );
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
      "Mischievous",
    ];

    const desirePool = [
      "wants_attention",
      "wants_rest",
      "wants_train",
      "feels_attached",
    ];

    const { data, error } = await supabaseAdmin
      .from("familiar_encounters")
      .insert({
        player_id: playerId,
        species_id: speciesId,
        status: "active",
        signal_title: body.signalTitle?.trim() || "Moon Familiar Signal",
        bonding_task: bondingTask,
        familiar_name: body.familiarName?.trim() || species.name,
        personality: body.personality?.trim() || pickRandom(personalityPool),
        desire: body.desire?.trim() || pickRandom(desirePool),
        admin_note: body.adminNote?.trim() || "",
      })
      .select(
        `
        *,
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
          short_description
        )
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Familiar Signal berhasil dibuat.",
      encounter: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create familiar encounter." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as PatchEncounterBody;

    const encounterId = body.encounterId?.trim();
    const action = body.action;

    if (!encounterId || !action) {
      return NextResponse.json(
        { error: "encounterId dan action wajib diisi." },
        { status: 400 }
      );
    }

    const { data: encounter, error: encounterError } = await supabaseAdmin
      .from("familiar_encounters")
      .select(
        `
        *,
        familiar_species (
          id,
          name
        ),
        players (
          id,
          character_name
        )
      `
      )
      .eq("id", encounterId)
      .maybeSingle();

    if (encounterError || !encounter) {
      return NextResponse.json(
        { error: "Encounter tidak ditemukan." },
        { status: 404 }
      );
    }

    if (action === "reject" || action === "expire") {
      const nextStatus = action === "reject" ? "rejected" : "expired";

      const { error } = await supabaseAdmin
        .from("familiar_encounters")
        .update({
          status: nextStatus,
          admin_note: body.adminNote?.trim() || encounter.admin_note || "",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", encounterId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message:
          action === "reject"
            ? "Familiar Signal ditolak."
            : "Familiar Signal di-expire.",
      });
    }

    if (action === "approve") {
      if (!["active", "submitted"].includes(encounter.status)) {
        return NextResponse.json(
          { error: "Encounter ini sudah tidak bisa di-approve." },
          { status: 400 }
        );
      }

      await supabaseAdmin
        .from("player_familiars")
        .update({ is_active: false })
        .eq("player_id", encounter.player_id)
        .eq("is_active", true);

      const familiarName =
        encounter.familiar_name?.trim() ||
        encounter.familiar_species?.name ||
        "Unnamed Familiar";

      const { error: insertError } = await supabaseAdmin
        .from("player_familiars")
        .insert({
          player_id: encounter.player_id,
          species_id: encounter.species_id,
          familiar_name: familiarName,
          stage: 1,
          mood: 76,
          energy: 82,
          bond_xp: 0,
          bond_rank: "Common",
          personality: encounter.personality || "Curious",
          relationship_status: "Normal",
          desire: encounter.desire || "wants_attention",
          battle_wins: 0,
          battle_losses: 0,
          tournament_wins: 0,
          memory_summary:
            encounter.player_report?.trim() ||
            "Familiar ini terikat melalui Familiar Signal di bawah cahaya bulan Lunaria.",
          is_active: true,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("familiar_encounters")
        .update({
          status: "approved",
          admin_note: body.adminNote?.trim() || encounter.admin_note || "",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", encounterId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${familiarName} berhasil di-bind ke ${encounter.players?.character_name || "player"}.`,
      });
    }

    return NextResponse.json(
      { error: "Action tidak dikenal." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update familiar encounter." },
      { status: 500 }
    );
  }
        }
