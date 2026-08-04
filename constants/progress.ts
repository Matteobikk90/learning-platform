export const MAX_WATCHED_DELTA_SECONDS = 30;

export const PROGRESS_SAVE_THRESHOLDS = {
  maxObservedGapSeconds: 3,
  minimumMovedSeconds: 10,
  minimumWatchedSeconds: 5,
} as const;
