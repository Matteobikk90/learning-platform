import type { Locale } from "@/types/i18n";

export type NavigationIconName =
  | "user"
  | "login"
  | "logout";

export type NavigationIconProps = {
  name: NavigationIconName;
  className?: string;
};

export type FlagIconProps = {
  locale: Locale;
  className?: string;
};
