"use client";

import MuxPlayer from "@mux/mux-player-react";

type VideoPlayerProps = {
  playbackId: string;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: (duration: number) => void;
  onSeeked?: (currentTime: number) => void;
};

export function VideoPlayer({
  playbackId,
  title,
  initialTime = 0,
  onTimeUpdate,
  onEnded,
  onSeeked,
}: VideoPlayerProps) {
  return (
    <div className="mt-4 flex overflow-hidden rounded-lg">
      <MuxPlayer
        playbackId={playbackId}
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
        className="aspect-video w-full"
        accentColor="#ffffff"
        primaryColor="#ffffff"
        secondaryColor="#0a0a0a"
      />
    </div>
  );
}
