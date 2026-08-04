import type { SUPPORTED_LOCALES } from "@/constants/i18n";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleRouteProps = {
  params: Promise<{ locale: string }>;
};

export type LanguageToggleProps = {
  className?: string;
};
