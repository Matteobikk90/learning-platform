export const MUX_ERROR_MESSAGES = {
  alreadyProcessing: "alreadyProcessing",
  concurrentUpload: "concurrentUpload",
  createUploadFailed: "createUploadFailed",
  missingModule: "missingModule",
  missingPlaybackId: "missingPlaybackId",
  missingUpload: "missingUpload",
  pendingUploadUnavailable: "pendingUploadUnavailable",
  processingFailed: "processingFailed",
  uploadIncomplete: "uploadIncomplete",
  unavailableStatus: "unavailableStatus",
  webhookRequired: "webhookRequired",
} as const;

export const MUX_STATUS_POLLING = {
  fastAttempts: 20,
  fastIntervalMs: 3_000,
  maxErrors: 6,
  slowIntervalMs: 10_000,
} as const;

export const MUX_DIRECT_UPLOAD_TIMEOUT_SECONDS = 60 * 60;
export const MUX_MAX_VIDEO_ERROR_LENGTH = 500;
export const MUX_MIN_TOKEN_DURATION_SECONDS = 60 * 60;
export const MUX_TOKEN_DURATION_BUFFER_SECONDS = 15 * 60;

export const MUX_PLAYBACK_POLICY = {
  PUBLIC: "public",
  SIGNED: "signed",
} as const;
