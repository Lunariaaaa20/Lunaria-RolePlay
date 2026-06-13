import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const playerId = req.nextUrl.searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        { error: "playerId wajib diisi." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("familiar_encounters")
      .select(
        `
        *,
        familiar_species (
          id,
          name,
          slug,
          habitat,
          role,
          short_description,
          origin_story,
          bonding_method,
          stage_1_image_url,
          habitat_background_url
        )
      `
      )
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      encounters: data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load player familiar encounter." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const playerId = body.playerId?.trim();
    const encounterId = body.encounterId?.trim();
    const playerReport = body.playerReport?.trim();

    if (!playerId || !encounterId || !playerReport) {
      return NextResponse.json(
        { error: "playerId, encounterId, dan bonding report wajib diisi." },
        { status: 400 }
      );
    }

    if (playerReport.length < 20) {
      return NextResponse.json(
        { error: "Bonding report terlalu pendek. Minimal 20 karakter." },
        { status: 400 }
      );
    }

    const { data: encounter, error: findError } = await supabaseAdmin
      .from("familiar_encounters")
      .select("id, status, player_id")
      .eq("id", encounterId)
      .eq("player_id", playerId)
      .maybeSingle();

    if (findError || !encounter) {
      return NextResponse.json(
        { error: "Familiar Signal tidak ditemukan." },
        { status: 404 }
      );
    }

    if (encounter.status !== "active") {
      return NextResponse.json(
        { error: "Familiar Signal ini sudah tidak aktif." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("familiar_encounters")
      .update({
        status: "submitted",
        player_report: playerReport,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", encounterId)
      .eq("player_id", playerId)
      .select(
        `
        *,
        familiar_species (
          id,
          name,
          slug,
          habitat,
          role,
          short_description,
          origin_story,
          bonding_method,
          stage_1_image_url,
          habitat_background_url
        )
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message:
        "Bonding report berhasil dikirim. Tunggu admin menilai Familiar Signal ini.",
      encounter: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit bonding report." },
      { status: 500 }
    );
  }
          }
