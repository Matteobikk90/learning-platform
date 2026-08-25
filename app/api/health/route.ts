import { NextResponse } from "next/server";

import { checkDatabaseConnection } from "@/functions/health/check-database-connection";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await checkDatabaseConnection();

    return NextResponse.json(
      { status: "ok" },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("[health] Database check failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return NextResponse.json(
      { status: "unavailable" },
      {
        status: 503,
        headers: { ...NO_STORE_HEADERS, "Retry-After": "30" },
      }
    );
  }
}
