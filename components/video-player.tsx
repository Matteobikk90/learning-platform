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
        startTime={initialTime}
        metadata={{
          video_title: title,
        }}
        onTimeUpdate={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onTimeUpdate?.(Math.floor(player.currentTime));
        }}
        onEnded={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onEnded?.(Math.floor(player.duration));
        }}
        onSeeked={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onSeeked?.(Math.floor(player.currentTime));
        }}
        onPause={(event) => {
          const player = event.currentTarget as HTMLVideoElement;
          onPause?.(Math.floor(player.currentTime));
        }}
        className="aspect-video w-full"
        accentColor="#ffffff"
        primaryColor="#ffffff"
        secondaryColor="#0a0a0a"
      />
    </div>
  );
}
