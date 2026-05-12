"use client";

import { useRef } from "react";

import { VideoPlayer } from "@/components/video-player";
import { saveModuleProgress } from "@/features/modules/progress-actions";

type ModuleProgressPlayerProps = {
  playbackId: string;
  title: string;
  moduleId: string;
  initialTime?: number;
};

export function ModuleProgressPlayer({
  playbackId,
  title,
  moduleId,
  initialTime = 0,
}: ModuleProgressPlayerProps) {
  const lastSavedTime = useRef(initialTime);

  async function saveProgress(currentTime: number) {
    try {
      await saveModuleProgress(moduleId, currentTime);
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  }

  return (
    <VideoPlayer
      playbackId={playbackId}
      title={title}
      initialTime={initialTime}
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
        saveProgress(duration);
      }}
    />
  );
}
