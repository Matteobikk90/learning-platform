import type {
  VideoState,
  VideoStateInput,
  VideoStatusMessageKey,
} from "@/types/video";

export function getVideoState(video: VideoStateInput): VideoState {
  if (video.muxUploadId) return "processing";
  if (video.videoError) return "error";
  if (video.videoPlaybackId) return "ready";
  return "empty";
}

export function getVideoStatusMessageKey(
  video: VideoStateInput
): VideoStatusMessageKey {
  const state = getVideoState(video);

  if (state === "processing") {
    return video.videoPlaybackId
      ? "statusProcessingReplacement"
      : "statusProcessing";
  }

  if (state === "error") {
    return video.videoPlaybackId
      ? "statusReplacementFailed"
      : "statusFailed";
  }

  return state === "ready" ? "statusReady" : "statusEmpty";
}
