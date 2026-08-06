import { CHECKOUT_SESSION_ID_PATTERN } from "@/constants/checkout";

export function normalizeCheckoutSessionId(
  value: string | string[] | undefined
): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return CHECKOUT_SESSION_ID_PATTERN.test(trimmed) ? trimmed : null;
}
