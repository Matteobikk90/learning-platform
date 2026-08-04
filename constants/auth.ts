export const MAGIC_LINK_MAX_AGE_MINUTES = 15;
export const MAGIC_LINK_MAX_AGE_SECONDS = MAGIC_LINK_MAX_AGE_MINUTES * 60;

export const MAGIC_LINK_RATE_LIMIT = {
  email: 3,
  ip: 10,
  windowSeconds: 15 * 60,
} as const;
