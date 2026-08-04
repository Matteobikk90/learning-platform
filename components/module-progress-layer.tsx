"use client";

import { useRef } from "react";

import { VideoPlayer } from "@/components/video-player";
import { saveModuleProgress } from "@/features/modules/progress-actions";
import { MAX_WATCHED_DELTA_SECONDS } from "@/features/modules/progress-constants";

import type { MuxPlaybackTokens } from "@/lib/mux";

type ModuleProgressPlayerProps = {
  playbackId: string;
  playbackTokens?: MuxPlaybackTokens;
  title: string;
  moduleId: string;
  initialTime?: number;
  isCompleted?: boolean;
};

export function ModuleProgressPlayer({
  playbackId,
  playbackTokens,
  title,
  moduleId,
  initialTime = 0,
  isCompleted = false,
}: ModuleProgressPlayerProps) {
  const resumeTime = isCompleted ? 0 : initialTime;
  const lastSavedTime = useRef(resumeTime);
  const lastObservedTime = useRef(resumeTime);
  const pendingWatchedSeconds = useRef(0);
  const saveQueue = useRef(Promise.resolve());

  function enqueueSave(currentTime: number, force = false) {
    // Cap each save at what the server accepts: seconds re-queued by a failed
    // save could otherwise push the delta past the limit and get every
    // following save rejected. The remainder stays pending for the next save.
    const watchedDelta = Math.min(
      MAX_WATCHED_DELTA_SECONDS,
      Math.floor(pendingWatchedSeconds.current)
    );
    const moved = Math.abs(currentTime - lastSavedTime.current);

    if (!force && watchedDelta < 5 && moved < 10) return;
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
  }

  return (
    <VideoPlayer
      playbackId={playbackId}
      playbackTokens={playbackTokens}
      title={title}
      initialTime={resumeTime}
      onTimeUpdate={(currentTime) => {
        const elapsed = currentTime - lastObservedTime.current;
        lastObservedTime.current = currentTime;

        if (elapsed > 0 && elapsed <= 3) {
          pendingWatchedSeconds.current += elapsed;
        }

        enqueueSave(currentTime);
      }}
      onSeeked={(currentTime) => {
        lastObservedTime.current = currentTime;
        enqueueSave(currentTime, true);
      }}
      onPause={(currentTime) => enqueueSave(currentTime, true)}
      onEnded={(duration) => {
        enqueueSave(duration, true);
      }}
    />
  );
}
