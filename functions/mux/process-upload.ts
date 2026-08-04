import "server-only";

import {
  MUX_ERROR_MESSAGES,
  MUX_MAX_VIDEO_ERROR_LENGTH,
} from "@/constants/mux";
import { resolveMuxDuration } from "@/functions/mux/duration";
import { isMuxNotFoundError } from "@/functions/mux/is-mux-not-found-error";
import { getMux } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import type {
  MuxProcessingTransition,
  ReadyMuxAsset,
} from "@/types/mux";

async function getPendingModule(uploadId: string) {
  return prisma.module.findUnique({
    where: { muxUploadId: uploadId },
    select: {
      id: true,
      courseId: true,
      muxAssetId: true,
    },
  });
}

export async function markMuxAssetReady({
  uploadId,
  assetId,
  playbackId,
  playbackPolicy,
  durationSeconds,
}: ReadyMuxAsset): Promise<MuxProcessingTransition | null> {
  const courseModule = await getPendingModule(uploadId);

  if (!courseModule) return null;

  const duration = await resolveMuxDuration(assetId, durationSeconds);

  const updated = await prisma.module.updateMany({
    where: {
      id: courseModule.id,
      muxUploadId: uploadId,
    },
    data: {
      muxUploadId: null,
      muxAssetId: assetId,
      videoPlaybackId: playbackId,
      videoPlaybackPolicy:
        playbackPolicy === "signed" ? "SIGNED" : "PUBLIC",
      videoError: null,
      ...(duration ? { durationSeconds: duration } : {}),
    },
  });

  if (updated.count === 0) return null;

  return {
    moduleId: courseModule.id,
    courseId: courseModule.courseId,
    assetIdsToDelete:
      courseModule.muxAssetId && courseModule.muxAssetId !== assetId
        ? [courseModule.muxAssetId]
        : [],
  };
}

export async function markMuxUploadFailed(
  uploadId: string,
  message: string,
  assetIdToDelete?: string
): Promise<MuxProcessingTransition | null> {
  const courseModule = await getPendingModule(uploadId);

  if (!courseModule) return null;

  const updated = await prisma.module.updateMany({
    where: {
      id: courseModule.id,
      muxUploadId: uploadId,
    },
    data: {
      muxUploadId: null,
      videoError: message.slice(0, MUX_MAX_VIDEO_ERROR_LENGTH),
    },
  });

  if (updated.count === 0) return null;

  return {
    moduleId: courseModule.id,
    courseId: courseModule.courseId,
    assetIdsToDelete: assetIdToDelete ? [assetIdToDelete] : [],
  };
}

export async function reconcileMuxUpload(
  uploadId: string
): Promise<MuxProcessingTransition | null> {
  const mux = getMux();

  try {
    const upload = await mux.video.uploads.retrieve(uploadId);

    if (upload.status === "waiting") return null;

    if (upload.status !== "asset_created") {
      return markMuxUploadFailed(
        uploadId,
        upload.error?.message ?? MUX_ERROR_MESSAGES.uploadIncomplete
      );
    }

    if (!upload.asset_id) return null;

    const asset = await mux.video.assets.retrieve(upload.asset_id);

    if (asset.status === "preparing") return null;

    if (asset.status === "errored") {
      return markMuxUploadFailed(
        uploadId,
        asset.errors?.messages?.join(" ") ?? MUX_ERROR_MESSAGES.processingFailed,
        asset.id
      );
    }

    const playback = asset.playback_ids?.find(
      ({ policy }) => policy === "public" || policy === "signed"
    );

    if (
      !playback ||
      (playback.policy !== "public" && playback.policy !== "signed")
    ) {
      return markMuxUploadFailed(
        uploadId,
        MUX_ERROR_MESSAGES.missingPlaybackId,
        asset.id
      );
    }

    return markMuxAssetReady({
      uploadId,
      assetId: asset.id,
      playbackId: playback.id,
      playbackPolicy: playback.policy,
      durationSeconds: asset.duration,
    });
  } catch (error) {
    if (isMuxNotFoundError(error)) {
      return markMuxUploadFailed(uploadId, MUX_ERROR_MESSAGES.missingUpload);
    }

    throw error;
  }
}
