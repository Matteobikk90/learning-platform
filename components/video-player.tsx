"use client";

import MuxPlayer from "@mux/mux-player-react";

import type { VideoPlayerProps } from "@/types/video";

export function VideoPlayer({
  playbackId,
  playbackTokens,
  title,
  initialTime = 0,
  onTimeUpdate,
  onEnded,
  onSeeked,
  onPause,
}: VideoPlayerProps) {
  return (
    <div className="mt-4 flex overflow-hidden rounded-lg">
      <MuxPlayer
        playbackId={playbackId}
        tokens={playbackTokens}
        disableTracking
        startTime={initialTime}
        metadata={{
          video_title: title,
        }}
        onTimeUpdate={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onTimeUpdate?.(player.currentTime);
        }}
        onEnded={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onEnded?.(player.duration);
        }}
        onSeeked={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onSeeked?.(player.currentTime);
        }}
        onPause={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onPause?.(player.currentTime);
        }}
        className="aspect-video w-full"
        accentColor="#ffffff"
        primaryColor="#ffffff"
        secondaryColor="#0a0a0a"
      />
    </div>
  );
}
