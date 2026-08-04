export const SUPPORTED_LOCALES = ["it", "en"] as const;

export const DEFAULT_LOCALE = "it";

export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const GLOBAL_ERROR_MESSAGES = {
  it: {
    title: "Qualcosa non ha funzionato",
    description: "Riprova tra qualche istante.",
    retry: "Riprova",
  },
  en: {
    title: "Something went wrong",
    description: "Please try again in a moment.",
    retry: "Try again",
  },
} as const;
