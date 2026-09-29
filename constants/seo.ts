import type { Locale } from "@/types/i18n";

export const SITE_NAME = "Umberto Iglina";

export const OPEN_GRAPH_LOCALES = {
  it: "it_IT",
  en: "en_US",
} as const satisfies Record<Locale, string>;

// Path segments under each locale that never belong in search results.
export const PRIVATE_ROUTE_SEGMENTS = [
  "admin",
  "checkout",
  "login",
  "profile",
  "verify-request",
] as const;

// Locale-relative marketing pages that exist regardless of database content.
export const PUBLIC_MARKETING_PATHS = ["/yoga-su-misura"] as const;
