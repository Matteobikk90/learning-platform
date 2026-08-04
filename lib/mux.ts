import "server-only";

import Mux from "@mux/mux-node";

import { getOptionalEnv, requireEnv } from "@/lib/env";

let muxClient: Mux | undefined;

export function getMux(): Mux {
  muxClient ??= new Mux({
    tokenId: requireEnv("MUX_TOKEN_ID"),
    tokenSecret: requireEnv("MUX_TOKEN_SECRET"),
  });

  return muxClient;
}

export type AppMuxPlaybackPolicy = "PUBLIC" | "SIGNED";

function getSigningCredentials() {
  const keyId = getOptionalEnv("MUX_SIGNING_KEY_ID");
  const rawKey = getOptionalEnv("MUX_SIGNING_PRIVATE_KEY");

  if (Boolean(keyId) !== Boolean(rawKey)) {
    throw new Error(
      "MUX_SIGNING_KEY_ID e MUX_SIGNING_PRIVATE_KEY devono essere configurati insieme"
    );
  }

  return rawKey
    ? { keyId: keyId!, keySecret: rawKey.replaceAll("\\n", "\n") }
    : null;
}

export function getNewAssetPlaybackPolicy(): AppMuxPlaybackPolicy {
  if (getSigningCredentials()) return "SIGNED";

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Configura le credenziali di firma Mux prima di caricare video in produzione"
    );
  }

  return "PUBLIC";
}

export type MuxPlaybackTokens = {
  playback: string;
  thumbnail: string;
  storyboard: string;
};

export async function createPlaybackTokens(
  playbackId: string,
  policy: AppMuxPlaybackPolicy,
  durationSeconds: number
): Promise<MuxPlaybackTokens | undefined> {
  if (policy !== "SIGNED") return undefined;

  const credentials = getSigningCredentials();
  if (!credentials) {
    throw new Error("Credenziali di firma Mux non configurate");
  }

  // The player requests the poster and timeline previews alongside the video,
  // and each needs its own signed token.
  const tokens = await getMux().jwt.signPlaybackId(playbackId, {
    ...credentials,
    type: ["video", "thumbnail", "storyboard"],
    expiration: `${Math.max(60 * 60, durationSeconds + 15 * 60)}s`,
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
