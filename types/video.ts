import type { MuxPlaybackTokens } from "@/types/mux";

export type VideoState = "empty" | "processing" | "ready" | "error";

export type VideoStatusMessageKey =
  | "statusProcessingReplacement"
  | "statusProcessing"
  | "statusReplacementFailed"
  | "statusFailed"
  | "statusReady"
  | "statusEmpty";

export type VideoStateInput = {
  muxUploadId: string | null;
  videoPlaybackId: string | null;
  videoError: string | null;
};

export type VideoStatusResponse = {
  status: VideoState;
  error: string | null;
  durationSeconds: number;
};

export type VideoUploadEndpointResponse = {
  uploadUrl?: string;
  error?: string;
};

export type VideoUploadProps = {
  moduleId: string;
  initialStatus: VideoState;
  initialDurationSeconds: number;
  initialError?: string | null;
};

export type UseVideoUploadOptions = Omit<
  VideoUploadProps,
  "initialDurationSeconds"
>;

export type MuxDurationSyncProps = {
  moduleIds: string[];
};

export type VideoPlayerProps = {
  playbackId: string;
  playbackTokens?: MuxPlaybackTokens;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: (duration: number) => void;
  onSeeked?: (currentTime: number) => void;
  onPause?: (currentTime: number) => void;
};

export type ModuleProgressPlayerProps = {
  playbackId: string;
  playbackTokens?: MuxPlaybackTokens;
  title: string;
  moduleId: string;
  initialTime?: number;
  isCompleted?: boolean;
};

export type UseModuleProgressOptions = Pick<
  ModuleProgressPlayerProps,
  "moduleId" | "initialTime" | "isCompleted"
>;
