import "server-only";

import { MAX_MODULE_DURATION_SECONDS } from "@/constants/modules";
import { getMux } from "@/lib/mux";
import { prisma } from "@/lib/prisma";

export function normalizeMuxDuration(durationSeconds?: number) {
  if (
    typeof durationSeconds !== "number" ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return undefined;
  }

  return Math.min(Math.ceil(durationSeconds), MAX_MODULE_DURATION_SECONDS);
}

export async function resolveMuxDuration(
  assetId: string,
  durationSeconds?: number
) {
  const providedDuration = normalizeMuxDuration(durationSeconds);
  if (providedDuration) return providedDuration;

  try {
    const asset = await getMux().video.assets.retrieve(assetId);
    return normalizeMuxDuration(asset.duration);
  } catch (error) {
    console.error("[mux] Failed to retrieve asset duration", {
      assetId,
      error,
    });
    return undefined;
  }
}

export async function syncModuleMuxDuration(
  moduleId: string,
  assetId: string,
  currentDurationSeconds: number
) {
  const currentDuration = normalizeMuxDuration(currentDurationSeconds);
  if (currentDuration) return currentDuration;

  const durationSeconds = await resolveMuxDuration(assetId);
  if (!durationSeconds) return currentDurationSeconds;

  await prisma.module.updateMany({
    where: {
      id: moduleId,
      muxAssetId: assetId,
      durationSeconds: { lte: 0 },
    },
    data: { durationSeconds },
  });

  return durationSeconds;
}
