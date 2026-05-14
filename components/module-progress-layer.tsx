"use client";

import { useRef } from "react";

import { VideoPlayer } from "@/components/video-player";
import { saveModuleProgress } from "@/features/modules/progress-actions";

type ModuleProgressPlayerProps = {
  playbackId: string;
  title: string;
  moduleId: string;
  durationSeconds: number;
  initialTime?: number;
};

export function ModuleProgressPlayer({
  playbackId,
  title,
  moduleId,
  durationSeconds,
  initialTime = 0,
}: ModuleProgressPlayerProps) {
  const completionThreshold = Math.floor(durationSeconds * 0.9);
  const resumeTime = initialTime >= completionThreshold ? 0 : initialTime;
  const lastSavedTime = useRef(resumeTime);

  async function saveProgress(currentTime: number, forceComplete = false) {
    try {
      await saveModuleProgress(moduleId, currentTime, forceComplete);
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  }

  return (
    <VideoPlayer
      playbackId={playbackId}
      title={title}
      initialTime={resumeTime}
      onTimeUpdate={(currentTime) => {
        const diff = Math.abs(currentTime - lastSavedTime.current);
        if (diff < 10) return;
        lastSavedTime.current = currentTime;
        saveProgress(currentTime);
      }}
      onSeeked={(currentTime) => {
        lastSavedTime.current = currentTime;
        saveProgress(currentTime);
      }}
      onEnded={(duration) => {
        saveProgress(duration, true);
      }}
    />
  );
}
