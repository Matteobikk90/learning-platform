export const MUX_ERROR_MESSAGES = {
  alreadyProcessing: "Il video è già in elaborazione",
  concurrentUpload: "Un altro caricamento è già stato avviato",
  createUploadFailed: "Impossibile avviare il caricamento del video",
  missingModule: "Module not found",
  missingPlaybackId: "Mux non ha generato un identificativo di riproduzione.",
  missingUpload: "Mux non trova più il caricamento associato al modulo.",
  pendingUploadUnavailable: "Impossibile recuperare il caricamento precedente",
  processingFailed: "Mux non è riuscito a elaborare il video.",
  uploadIncomplete: "Il caricamento Mux non è stato completato.",
  unavailableStatus: "Impossibile controllare lo stato del video.",
  webhookRequired: "Configura il segreto webhook Mux prima di caricare video",
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
