export function getScrollProgress(offset: number, distance: number): number {
  if (!Number.isFinite(offset) || !Number.isFinite(distance) || distance <= 0) {
    return 0;
  }

  return Math.min(Math.max(offset / distance, 0), 1);
}
