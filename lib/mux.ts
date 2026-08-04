import "server-only";

import Mux from "@mux/mux-node";

import {
  MUX_MIN_TOKEN_DURATION_SECONDS,
  MUX_TOKEN_DURATION_BUFFER_SECONDS,
} from "@/constants/mux";
import { getMuxSigningCredentials } from "@/functions/mux/get-signing-credentials";
import { requireEnv } from "@/lib/env";
import type {
  AppMuxPlaybackPolicy,
  MuxPlaybackTokens,
} from "@/types/mux";

let muxClient: Mux | undefined;

export function getMux(): Mux {
  muxClient ??= new Mux({
    tokenId: requireEnv("MUX_TOKEN_ID"),
    tokenSecret: requireEnv("MUX_TOKEN_SECRET"),
  });

  return muxClient;
}

export function getNewAssetPlaybackPolicy(): AppMuxPlaybackPolicy {
  if (getMuxSigningCredentials()) return "SIGNED";

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Configura le credenziali di firma Mux prima di caricare video in produzione"
    );
  }

  return "PUBLIC";
}

export async function createPlaybackTokens(
  playbackId: string,
  policy: AppMuxPlaybackPolicy,
  durationSeconds: number
): Promise<MuxPlaybackTokens | undefined> {
  if (policy !== "SIGNED") return undefined;

  const credentials = getMuxSigningCredentials();
  if (!credentials) {
    throw new Error("Credenziali di firma Mux non configurate");
  }

  const tokens = await getMux().jwt.signPlaybackId(playbackId, {
    ...credentials,
    type: ["video", "thumbnail", "storyboard"],
    expiration: `${Math.max(
      MUX_MIN_TOKEN_DURATION_SECONDS,
      durationSeconds + MUX_TOKEN_DURATION_BUFFER_SECONDS
    )}s`,
  });

  const playback = tokens["playback-token"];
  const thumbnail = tokens["thumbnail-token"];
  const storyboard = tokens["storyboard-token"];

  if (!playback || !thumbnail || !storyboard) {
    throw new Error("Mux non ha generato tutti i token di riproduzione");
  }

  return { playback, thumbnail, storyboard };
}

export async function deleteMuxAsset(assetId: string | null | undefined) {
  if (!assetId) return;

  try {
    await getMux().video.assets.delete(assetId);
  } catch (error) {
    console.error("[mux] Failed to delete asset", { assetId, error });
  }
}

export async function deletePendingMuxUpload(
  uploadId: string | null | undefined
) {
  if (!uploadId) return;

  try {
    const mux = getMux();
    const upload = await mux.video.uploads.retrieve(uploadId);

    if (upload.status === "waiting") {
      await mux.video.uploads.cancel(uploadId);
      return;
    }

    if (upload.asset_id) {
      await deleteMuxAsset(upload.asset_id);
    }
  } catch (error) {
    console.error("[mux] Failed to clean up direct upload", {
      uploadId,
      error,
    });
  }
}
