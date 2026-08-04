import "server-only";

import {
  MUX_DIRECT_UPLOAD_TIMEOUT_SECONDS,
  MUX_ERROR_MESSAGES,
  MUX_PLAYBACK_POLICY,
} from "@/constants/mux";
import { isMuxNotFoundError } from "@/functions/mux/is-mux-not-found-error";
import { getAppUrl, requireEnv } from "@/lib/env";
import { getMux, getNewAssetPlaybackPolicy } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import type { CreateMuxUploadResult } from "@/types/mux";

export async function createDirectUpload(
  moduleId: string,
  adminId: string
): Promise<CreateMuxUploadResult> {
  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      title: true,
      muxUploadId: true,
    },
  });

  if (!courseModule) {
    return { error: MUX_ERROR_MESSAGES.missingModule, status: 404 };
  }

  try {
    requireEnv("MUX_WEBHOOK_SECRET");
  } catch {
    return { error: MUX_ERROR_MESSAGES.webhookRequired, status: 503 };
  }

  const mux = getMux();
  let expectedUploadId = courseModule.muxUploadId;

  if (courseModule.muxUploadId) {
    try {
      const pendingUpload = await mux.video.uploads.retrieve(
        courseModule.muxUploadId
      );

      if (pendingUpload.status === "waiting" && pendingUpload.url) {
        return { uploadUrl: pendingUpload.url };
      }

      if (pendingUpload.status === "asset_created") {
        return { error: MUX_ERROR_MESSAGES.alreadyProcessing, status: 409 };
      }

      await prisma.module.update({
        where: { id: courseModule.id },
        data: { muxUploadId: null },
      });
      expectedUploadId = null;
    } catch (error) {
      if (isMuxNotFoundError(error)) {
        await prisma.module.update({
          where: { id: courseModule.id },
          data: { muxUploadId: null },
        });
        expectedUploadId = null;
      } else {
        console.error("[mux] Failed to inspect pending upload", {
          uploadId: courseModule.muxUploadId,
          error,
        });
        return {
          error: MUX_ERROR_MESSAGES.pendingUploadUnavailable,
          status: 503,
        };
      }
    }
  }

  let uploadId: string | null = null;

  try {
    const playbackPolicy = getNewAssetPlaybackPolicy();
    const upload = await mux.video.uploads.create({
      cors_origin: new URL(getAppUrl()).origin,
      timeout: MUX_DIRECT_UPLOAD_TIMEOUT_SECONDS,
      new_asset_settings: {
        playback_policies: [MUX_PLAYBACK_POLICY[playbackPolicy]],
        passthrough: courseModule.id,
        meta: {
          creator_id: adminId,
          external_id: courseModule.id,
          title: courseModule.title,
        },
      },
    });

    if (!upload.url) {
      throw new Error("Mux did not return an upload URL");
    }

    uploadId = upload.id;

    const attached = await prisma.module.updateMany({
      where: {
        id: courseModule.id,
        muxUploadId: expectedUploadId,
      },
      data: {
        muxUploadId: upload.id,
        videoError: null,
      },
    });

    if (attached.count === 0) {
      await mux.video.uploads.cancel(upload.id).catch(() => undefined);
      uploadId = null;

      return { error: MUX_ERROR_MESSAGES.concurrentUpload, status: 409 };
    }

    return { uploadUrl: upload.url };
  } catch (error) {
    if (uploadId) {
      await mux.video.uploads.cancel(uploadId).catch(() => undefined);
    }

    console.error("[mux] Failed to create direct upload", error);
    return { error: MUX_ERROR_MESSAGES.createUploadFailed, status: 500 };
  }
}
