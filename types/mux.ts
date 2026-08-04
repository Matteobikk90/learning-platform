import type Mux from "@mux/mux-node";

export type AppMuxPlaybackPolicy = "PUBLIC" | "SIGNED";

export type MuxApiError = {
  status?: number;
};

export type MuxPlaybackTokens = {
  playback: string;
  thumbnail: string;
  storyboard: string;
};

export type MuxSigningCredentials = {
  keyId: string;
  keySecret: string;
};

export type MuxWebhookEvent = Awaited<
  ReturnType<Mux["webhooks"]["unwrap"]>
>;

export type MuxProcessingTransition = {
  moduleId: string;
  courseId: string;
  assetIdsToDelete: string[];
};

export type ReadyMuxAsset = {
  uploadId: string;
  assetId: string;
  playbackId: string;
  playbackPolicy: "public" | "signed";
  durationSeconds?: number;
};

export type CreateMuxUploadResult =
  | { uploadUrl: string }
  | { error: string; status: number };
