"use client";

import { VideoPlayer } from "@/components/video-player";
import { useModuleProgress } from "@/hooks/use-module-progress";
import type { ModuleProgressPlayerProps } from "@/types/video";

export function ModuleProgressPlayer({
  playbackId,
  playbackTokens,
  title,
  moduleId,
  initialTime = 0,
  isCompleted = false,
}: ModuleProgressPlayerProps) {
  const progress = useModuleProgress({ moduleId, initialTime, isCompleted });

  return (
    <VideoPlayer
      playbackId={playbackId}
      playbackTokens={playbackTokens}
      title={title}
      initialTime={progress.resumeTime}
      onTimeUpdate={progress.onTimeUpdate}
      onSeeked={progress.onSeeked}
      onPause={progress.onPause}
      onEnded={progress.onEnded}
    />
  );
}
