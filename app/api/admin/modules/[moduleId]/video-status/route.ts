import { getModuleVideoStatus } from "@/functions/mux/get-module-video-status";
import { getApiAdmin } from "@/lib/session";
import type { ModuleStatusRouteContext } from "@/types/routes";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: ModuleStatusRouteContext
) {
  const admin = await getApiAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId } = await params;
  const status = await getModuleVideoStatus(moduleId);

  if (!status) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  return NextResponse.json(
    status,
    { headers: { "Cache-Control": "no-store" } }
  );
}
