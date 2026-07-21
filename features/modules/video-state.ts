export type VideoState = "empty" | "processing" | "ready" | "error";

type VideoStateInput = {
  muxUploadId: string | null;
  videoPlaybackId: string | null;
  videoError: string | null;
};

export function getVideoState(video: VideoStateInput): VideoState {
  if (video.muxUploadId) return "processing";
  if (video.videoError) return "error";
  if (video.videoPlaybackId) return "ready";
  return "empty";
}

export function getVideoStatusLabel(video: VideoStateInput): string {
  const state = getVideoState(video);

  if (state === "processing") {
    return video.videoPlaybackId
      ? "Nuovo video in elaborazione"
      : "Video in elaborazione";
  }

  if (state === "error") {
    return video.videoPlaybackId
      ? "Video corrente pronto · sostituzione non riuscita"
      : "Elaborazione video non riuscita";
  }

  return state === "ready" ? "Video pronto" : "Nessun video caricato";
}
