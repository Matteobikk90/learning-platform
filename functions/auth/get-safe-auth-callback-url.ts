import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import type { Locale } from "@/types/i18n";

export function getSafeAuthCallbackUrl(
  locale: Locale,
  candidate?: string | string[]
) {
  const fallback = getLocalizedPath(locale, "/profile");
  const value = Array.isArray(candidate) ? candidate[0] : candidate;

  if (!value) return fallback;

  try {
    const baseUrl = new URL("https://app.local");
    const callbackUrl = new URL(value, baseUrl);
    const localeRoot = `/${locale}`;

    if (
      callbackUrl.origin !== baseUrl.origin ||
      (callbackUrl.pathname !== localeRoot &&
        !callbackUrl.pathname.startsWith(`${localeRoot}/`))
    ) {
      return fallback;
    }

    return `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`;
  } catch {
    return fallback;
  }
}
