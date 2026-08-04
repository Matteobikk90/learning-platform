import { SUPPORTED_LOCALES } from "@/constants/i18n";
import type { Locale } from "@/types/i18n";

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}
