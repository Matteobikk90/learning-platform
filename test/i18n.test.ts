import { describe, expect, it } from "vitest";

import { getLanguageSwitchHref } from "@/functions/i18n/get-language-switch-href";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { getLocaleFromUrl } from "@/functions/i18n/get-locale-from-url";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";

describe("i18n route helpers", () => {
  it("prefixes internal routes without duplicating the root slash", () => {
    expect(getLocalizedPath("it", "/")).toBe("/it");
    expect(getLocalizedPath("en", "/profile")).toBe("/en/profile");
    expect(getLocalizedPath("en", "admin")).toBe("/en/admin");
  });

  it("preserves query parameters and the active section when switching locale", () => {
    expect(getLanguageSwitchHref("/", "?preview=true", "#corsi")).toBe(
      "/?preview=true#corsi"
    );
  });

  it("recognizes only configured locales", () => {
    expect(isSupportedLocale("it")).toBe(true);
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
  });

  it("reads the locale from a direct or nested callback URL", () => {
    expect(getLocaleFromUrl("https://example.com/en/profile")).toBe("en");
    expect(
      getLocaleFromUrl(
        "https://example.com/api/auth/callback/email?callbackUrl=https%3A%2F%2Fexample.com%2Fen%2Fprofile"
      )
    ).toBe("en");
  });

  it("falls back to Italian for invalid or unsupported URLs", () => {
    expect(getLocaleFromUrl()).toBe("it");
    expect(getLocaleFromUrl("https://example.com/fr/profile")).toBe("it");
  });
});
