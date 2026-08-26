"use client";

import { useCallback, useRef } from "react";

import { PROGRESS_SAVE_THRESHOLDS } from "@/constants/progress";
import { saveModuleProgress } from "@/features/modules/progress-actions";
import {
  getObservedWatchedDelta,
  getWatchedDeltaToSave,
} from "@/functions/progress/get-watched-playback-delta";
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
    (currentTime: number, force = false, roundWatchedUp = false) => {
      const watchedDelta = getWatchedDeltaToSave(
        pendingWatchedSeconds.current,
        roundWatchedUp
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

      pendingWatchedSeconds.current = Math.max(
        0,
        pendingWatchedSeconds.current - watchedDelta
      );
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
      const watchedDelta = getObservedWatchedDelta(
        lastObservedTime.current,
        currentTime
      );
      lastObservedTime.current = currentTime;
      pendingWatchedSeconds.current += watchedDelta;

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
    (duration: number) => {
      pendingWatchedSeconds.current += getObservedWatchedDelta(
        lastObservedTime.current,
        duration
      );
      lastObservedTime.current = duration;
      enqueueSave(duration, true, true);
    },
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
