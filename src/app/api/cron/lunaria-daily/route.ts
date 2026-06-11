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

function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

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
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized cron request.",
      },
      { status: 401 }
    );
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.rpc("run_lunaria_auto_daily_cycle");

  if (error) {
    await supabase.from("cron_activity_logs").insert({
      job_name: "lunaria_daily_engine",
      status: "failed",
      did_run_chronicle: false,
      did_run_market: false,
      chronicle_status: "failed",
      market_status: "failed",
      error_message: error.message,
    });

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

  const didRunChronicle = Boolean(result?.did_run_chronicle);
  const didRunMarket = Boolean(result?.did_run_market);

  const cronStatus = didRunChronicle || didRunMarket ? "success" : "sleeping";

  await supabase.from("cron_activity_logs").insert({
    job_name: "lunaria_daily_engine",
    status: cronStatus,
    did_run_chronicle: didRunChronicle,
    did_run_market: didRunMarket,
    chronicle_status:
      result?.chronicle_status || "Chronicle status unavailable.",
    market_status: result?.market_status || "Market status unavailable.",
    current_season: result?.current_season || null,
    current_season_day: result?.current_season_day || null,
    current_headline: result?.current_headline || null,
    next_update_at: result?.next_update_at || null,
    error_message: null,
  });

  return NextResponse.json({
    ok: true,
    message: "Lunaria daily cron checked successfully.",
    status: cronStatus,
    result: result || null,
  });
}
