import { muxUploadRequestSchema } from "@/features/modules/schema";
import { createDirectUpload } from "@/functions/mux/create-direct-upload";
import { getApiAdmin } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const admin = await getApiAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = muxUploadRequestSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  }

  const result = await createDirectUpload(parsed.data.moduleId, admin.id);

  return "uploadUrl" in result
    ? NextResponse.json({ uploadUrl: result.uploadUrl })
    : NextResponse.json({ error: result.error }, { status: result.status });
}
