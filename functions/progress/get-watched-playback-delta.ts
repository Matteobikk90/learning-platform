import {
  MAX_WATCHED_DELTA_SECONDS,
  PROGRESS_SAVE_THRESHOLDS,
} from "@/constants/progress";

export function getObservedWatchedDelta(
  previousTime: number,
  currentTime: number
) {
  const elapsed = currentTime - previousTime;

  return elapsed > 0 &&
    elapsed <= PROGRESS_SAVE_THRESHOLDS.maxObservedGapSeconds
    ? elapsed
    : 0;
}

export function getWatchedDeltaToSave(
  pendingWatchedSeconds: number,
  roundUp = false
) {
  const roundedSeconds = roundUp
    ? Math.ceil(pendingWatchedSeconds)
    : Math.floor(pendingWatchedSeconds);

  return Math.min(
    MAX_WATCHED_DELTA_SECONDS,
    Math.max(0, roundedSeconds)
  );
}
