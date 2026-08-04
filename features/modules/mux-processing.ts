import "server-only";

import { getMux } from "@/lib/mux";
import { prisma } from "@/lib/prisma";

export type MuxProcessingTransition = {
  moduleId: string;
  courseId: string;
  assetIdsToDelete: string[];
};

type ReadyAsset = {
  uploadId: string;
  assetId: string;
  playbackId: string;
  playbackPolicy: "public" | "signed";
  durationSeconds?: number;
};

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
}: ReadyAsset): Promise<MuxProcessingTransition | null> {
  const courseModule = await getPendingModule(uploadId);

  if (!courseModule) return null;

  const duration =
    typeof durationSeconds === "number" &&
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0
      ? Math.min(Math.ceil(durationSeconds), 12 * 60 * 60)
      : undefined;

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
      videoError: message.slice(0, 500),
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
        upload.error?.message ?? "Il caricamento Mux non è stato completato."
      );
    }

    if (!upload.asset_id) return null;

    const asset = await mux.video.assets.retrieve(upload.asset_id);

    if (asset.status === "preparing") return null;

    if (asset.status === "errored") {
      return markMuxUploadFailed(
        uploadId,
        asset.errors?.messages?.join(" ") ??
          "Mux non è riuscito a elaborare il video.",
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
        "Mux non ha generato un identificativo di riproduzione.",
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
    if ((error as { status?: number }).status === 404) {
      return markMuxUploadFailed(
        uploadId,
        "Mux non trova più il caricamento associato al modulo."
      );
    }

    throw error;
  }
}
