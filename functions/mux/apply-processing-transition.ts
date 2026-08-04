import "server-only";

import { after } from "next/server";

import { revalidateModulePages } from "@/functions/modules/revalidate-module-pages";
import { deleteMuxAsset } from "@/lib/mux";
import type { MuxProcessingTransition } from "@/types/mux";

export function applyMuxProcessingTransition(
  transition: MuxProcessingTransition | null
) {
  if (!transition) return false;

  revalidateModulePages(transition.courseId, transition.moduleId);

  if (transition.assetIdsToDelete.length > 0) {
    after(() => Promise.all(transition.assetIdsToDelete.map(deleteMuxAsset)));
  }

  return true;
}
