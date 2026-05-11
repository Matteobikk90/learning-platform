"use client";

import MuxPlayer from "@mux/mux-player-react";

type VideoPlayerProps = {
  playbackId: string;
  title: string;
};

export function VideoPlayer({ playbackId, title }: VideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{
        video_title: title,
      }}
      className="mt-4 aspect-video w-full overflow-hidden rounded-lg"
    />
  );
}
