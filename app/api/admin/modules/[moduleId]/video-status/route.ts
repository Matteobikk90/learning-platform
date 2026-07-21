import { getVideoState } from "@/features/modules/video-state";
import { prisma } from "@/lib/prisma";
import { getApiAdmin } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const admin = await getApiAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId } = await params;
  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      muxUploadId: true,
      videoPlaybackId: true,
      videoError: true,
    },
  });

  if (!courseModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      status: getVideoState(courseModule),
      error: courseModule.videoError,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
