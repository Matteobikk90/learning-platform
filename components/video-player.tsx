"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useRef } from "react";

import { saveModuleProgress } from "@/features/modules/progress-actions";

export function VideoPlayer({
  playbackId,
  title,
  moduleId,
}: {
  playbackId: string;
  title: string;
  moduleId?: string;
}) {
  const lastSavedTime = useRef(0);

  async function handleTimeUpdate(event: Event) {
    if (!moduleId) return;

    const player = event.currentTarget as HTMLVideoElement;

    const currentTime = Math.floor(player.currentTime);
    console.log("CURRENT TIME", currentTime, "MODULE", moduleId);
    // save every 10 seconds
    if (currentTime - lastSavedTime.current < 10) {
      return;
    }

    lastSavedTime.current = currentTime;

    try {
      await saveModuleProgress(moduleId, currentTime);
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  }

  return (
    <div
      className="mt-4 overflow-hidden rounded-lg"
      style={{ display: "flex" }}>
      <MuxPlayer
        playbackId={playbackId}
        metadata={{
          video_title: title,
        }}
        onTimeUpdate={handleTimeUpdate}
        className="aspect-video w-full"
        accentColor="#0A7A72"
        primaryColor="#F7FAFA"
        secondaryColor="#0D2240"
      />
    </div>
  );
}
