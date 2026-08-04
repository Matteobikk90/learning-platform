"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_LOCALE } from "@/constants/i18n";
import { getLocaleFromUrl } from "@/functions/i18n/get-locale-from-url";
import type { Locale } from "@/types/i18n";

const subscribe = () => () => undefined;

export function useCurrentLocale(): Locale {
  return useSyncExternalStore<Locale>(
    subscribe,
    () => getLocaleFromUrl(window.location.href),
    () => DEFAULT_LOCALE
  );
}
