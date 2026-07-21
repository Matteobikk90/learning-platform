import Mux from "@mux/mux-node";

import { requireEnv } from "@/lib/env";

let muxClient: Mux | undefined;

export function getMux(): Mux {
  muxClient ??= new Mux({
    tokenId: requireEnv("MUX_TOKEN_ID"),
    tokenSecret: requireEnv("MUX_TOKEN_SECRET"),
  });

  return muxClient;
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
