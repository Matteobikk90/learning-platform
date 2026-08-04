import { DEFAULT_LOCALE } from "@/constants/i18n";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import type { Locale } from "@/types/i18n";

export function getLocaleFromUrl(value?: string | null): Locale {
  if (!value) return DEFAULT_LOCALE;

  try {
    const url = new URL(value, "http://localhost");
    const pathnameLocale = url.pathname.split("/")[1];

    if (pathnameLocale && isSupportedLocale(pathnameLocale)) {
      return pathnameLocale;
    }

    const callbackUrl = url.searchParams.get("callbackUrl");
    return callbackUrl ? getLocaleFromUrl(callbackUrl) : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
