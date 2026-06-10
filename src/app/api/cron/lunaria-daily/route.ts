import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AutoDailyCycleResult = {
  did_run_chronicle: boolean;
  did_run_market: boolean;
  chronicle_status: string;
  market_status: string;
  current_season: string;
  current_season_day: number;
  current_headline: string;
  next_update_at: string;
};

function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      message: "Unauthorized cron request.",
    },
    { status: 401 }
  );
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "CRON_SECRET is not configured.",
      },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return unauthorized();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase environment variables are missing.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.rpc("run_lunaria_auto_daily_cycle");

  if (error) {
    console.error("Lunaria cron failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Lunaria daily cycle failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }

  const result = Array.isArray(data)
    ? (data[0] as AutoDailyCycleResult | undefined)
    : undefined;

  return NextResponse.json({
    ok: true,
    message: "Lunaria daily cron checked successfully.",
    result: result || null,
  });
      }
