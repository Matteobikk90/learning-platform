import "server-only";

import { applyMuxProcessingTransition } from "@/functions/mux/apply-processing-transition";
import { syncModuleMuxDuration } from "@/functions/mux/duration";
import { reconcileMuxUpload } from "@/functions/mux/process-upload";
import { getVideoState } from "@/functions/video/get-video-state";
import { prisma } from "@/lib/prisma";
import type { VideoStatusResponse } from "@/types/video";

function findModuleVideoStatus(moduleId: string) {
  return prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      durationSeconds: true,
      muxAssetId: true,
      muxUploadId: true,
      videoPlaybackId: true,
      videoError: true,
    },
  });
}

export async function getModuleVideoStatus(
  moduleId: string
): Promise<VideoStatusResponse | null> {
  const initialModule = await findModuleVideoStatus(moduleId);

  if (!initialModule) return null;

  let courseModule = initialModule;

  if (courseModule.muxUploadId) {
    const pendingUploadId = courseModule.muxUploadId;

    try {
      const transition = await reconcileMuxUpload(pendingUploadId);

      if (transition) {
        applyMuxProcessingTransition(transition);

        const refreshedModule = await findModuleVideoStatus(moduleId);

        if (!refreshedModule) return null;

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

  const status = getVideoState(courseModule);
  const durationSeconds =
    status === "ready" &&
    courseModule.durationSeconds <= 0 &&
    courseModule.muxAssetId
      ? await syncModuleMuxDuration(
          courseModule.id,
          courseModule.muxAssetId,
          courseModule.durationSeconds
        )
      : courseModule.durationSeconds;

  return {
    status,
    error: courseModule.videoError,
    durationSeconds,
  };
}
