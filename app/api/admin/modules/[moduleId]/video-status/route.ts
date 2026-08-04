import { getVideoState } from "@/features/modules/video-state";
import { reconcileMuxUpload } from "@/features/modules/mux-processing";
import { deleteMuxAsset } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { getApiAdmin } from "@/lib/session";
import { after, NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const admin = await getApiAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId } = await params;
  const initialModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      muxUploadId: true,
      videoPlaybackId: true,
      videoError: true,
    },
  });

  if (!initialModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  let courseModule = initialModule;

  if (courseModule.muxUploadId) {
    const pendingUploadId = courseModule.muxUploadId;

    try {
      const transition = await reconcileMuxUpload(pendingUploadId);

      if (transition) {
        if (transition.assetIdsToDelete.length > 0) {
          after(() =>
            Promise.all(transition.assetIdsToDelete.map(deleteMuxAsset))
          );
        }

        const refreshedModule = await prisma.module.findUnique({
          where: { id: moduleId },
          select: {
            muxUploadId: true,
            videoPlaybackId: true,
            videoError: true,
          },
        });

        if (!refreshedModule) {
          return NextResponse.json(
            { error: "Module not found" },
            { status: 404 }
          );
        }

        courseModule = refreshedModule;
      }
    } catch (error) {
      console.error("[mux] Failed to reconcile video status", {
        moduleId,
        uploadId: pendingUploadId,
        error,
      });
    }
  }

  return NextResponse.json(
    {
      status: getVideoState(courseModule),
      error: courseModule.videoError,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
