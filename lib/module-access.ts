const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

export function isModuleUnlocked({
  isFirstModule,
  previousCompletedAt,
}: {
  isFirstModule: boolean;
  previousCompletedAt?: Date | null;
}): boolean {
  if (isFirstModule) return true;
  if (!previousCompletedAt) return false;
  return Date.now() >= previousCompletedAt.getTime() + TEN_DAYS_MS;
}

export function getUnlockDate(previousCompletedAt: Date): Date {
  return new Date(previousCompletedAt.getTime() + TEN_DAYS_MS);
}
