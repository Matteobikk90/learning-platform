"use client";

import MuxPlayer from "@mux/mux-player-react";

import { cn } from "@/lib/cn";
import type { MarketingVideoProps } from "@/types/video";

export function MarketingVideo({
  playbackId,
  title,
  className,
}: MarketingVideoProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      preload="none"
      playsInline
      disableTracking
      title={title}
      metadata={{ video_title: title }}
      accentColor="#ffffff"
      primaryColor="#ffffff"
      secondaryColor="#0a0a0a"
      className={cn("block w-full", className)}
    />
  );
}
