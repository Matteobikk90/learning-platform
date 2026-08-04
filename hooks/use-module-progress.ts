"use client";

import { useCallback, useRef } from "react";

import {
  MAX_WATCHED_DELTA_SECONDS,
  PROGRESS_SAVE_THRESHOLDS,
} from "@/constants/progress";
import { saveModuleProgress } from "@/features/modules/progress-actions";
import type { UseModuleProgressOptions } from "@/types/video";

export function useModuleProgress({
  moduleId,
  initialTime = 0,
  isCompleted = false,
}: UseModuleProgressOptions) {
  const resumeTime = isCompleted ? 0 : initialTime;
  const lastSavedTime = useRef(resumeTime);
  const lastObservedTime = useRef(resumeTime);
  const pendingWatchedSeconds = useRef(0);
  const saveQueue = useRef(Promise.resolve());

  const enqueueSave = useCallback(
    (currentTime: number, force = false) => {
      const watchedDelta = Math.min(
        MAX_WATCHED_DELTA_SECONDS,
        Math.floor(pendingWatchedSeconds.current)
      );
      const moved = Math.abs(currentTime - lastSavedTime.current);

      if (
        !force &&
        watchedDelta < PROGRESS_SAVE_THRESHOLDS.minimumWatchedSeconds &&
        moved < PROGRESS_SAVE_THRESHOLDS.minimumMovedSeconds
      ) {
        return;
      }

      if (watchedDelta === 0 && moved === 0) return;

      pendingWatchedSeconds.current -= watchedDelta;
      lastSavedTime.current = currentTime;
      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(() => saveModuleProgress(moduleId, currentTime, watchedDelta))
        .catch((error) => {
          pendingWatchedSeconds.current += watchedDelta;
          console.error("Failed to save progress", error);
        });
    },
    [moduleId]
  );

  const onTimeUpdate = useCallback(
    (currentTime: number) => {
      const elapsed = currentTime - lastObservedTime.current;
      lastObservedTime.current = currentTime;

      if (
        elapsed > 0 &&
        elapsed <= PROGRESS_SAVE_THRESHOLDS.maxObservedGapSeconds
      ) {
        pendingWatchedSeconds.current += elapsed;
      }

      enqueueSave(currentTime);
    },
    [enqueueSave]
  );

  const onSeeked = useCallback(
    (currentTime: number) => {
      lastObservedTime.current = currentTime;
      enqueueSave(currentTime, true);
    },
    [enqueueSave]
  );

  const onPause = useCallback(
    (currentTime: number) => enqueueSave(currentTime, true),
    [enqueueSave]
  );

  const onEnded = useCallback(
    (duration: number) => enqueueSave(duration, true),
    [enqueueSave]
  );

  return {
    onEnded,
    onPause,
    onSeeked,
    onTimeUpdate,
    resumeTime,
  };
}
