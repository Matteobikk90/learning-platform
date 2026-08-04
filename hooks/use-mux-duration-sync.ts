"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getVideoStatus } from "@/functions/mux/get-video-status";

export function useMuxDurationSync(moduleIds: readonly string[]) {
  const router = useRouter();
  const moduleIdsKey = moduleIds.join(",");

  useEffect(() => {
    if (!moduleIdsKey) return;

    let cancelled = false;
    const ids = moduleIdsKey.split(",");

    void Promise.all(
      ids.map((moduleId) => getVideoStatus(moduleId).catch(() => null))
    ).then((results) => {
      if (
        !cancelled &&
        results.some((result) => result && result.durationSeconds > 0)
      ) {
        router.refresh();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [moduleIdsKey, router]);
}
