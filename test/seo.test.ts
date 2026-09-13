import { getDisallowedPaths } from "@/functions/seo/get-disallowed-paths";
import {
  getHomeAlternates,
  getLocalizedAlternates,
} from "@/functions/seo/get-localized-alternates";
import { getPublicSitemap } from "@/functions/seo/get-public-sitemap";
import { describe, expect, it } from "vitest";

const locales = ["it", "en"] as const;

describe("getDisallowedPaths", () => {
  it("blocks the API and every private area in each locale", () => {
    const paths = getDisallowedPaths(locales);

    expect(paths).toContain("/api/");
    expect(paths).toContain("/it/admin");
    expect(paths).toContain("/en/profile");
    expect(paths).toContain("/it/checkout");
    expect(paths).toContain("/en/login");
    expect(paths).toContain("/it/verify-request");
  });

  it("keeps the public home and legal pages crawlable", () => {
    const paths = getDisallowedPaths(locales);

    expect(paths).not.toContain("/it");
    expect(paths.some((path) => path.includes("/legal"))).toBe(false);
  });
});

describe("getLocalizedAlternates", () => {
  it("maps every locale to its root path with a language-neutral default", () => {
    expect(getLocalizedAlternates(locales)).toEqual({
      it: "/it",
      en: "/en",
      "x-default": "/",
    });
  });

  it("prefixes an absolute base URL when provided", () => {
    expect(getLocalizedAlternates(locales, "https://yoga.example.com")).toEqual({
      it: "https://yoga.example.com/it",
      en: "https://yoga.example.com/en",
      "x-default": "https://yoga.example.com",
    });
  });
});

describe("getHomeAlternates", () => {
  it("uses the current locale as canonical", () => {
    expect(getHomeAlternates("en", locales)).toEqual({
      canonical: "/en",
      languages: { it: "/it", en: "/en", "x-default": "/" },
    });
  });
});

describe("getPublicSitemap", () => {
  it("lists one absolute home URL per locale with hreflang alternates", () => {
    const sitemap = getPublicSitemap("https://yoga.example.com", locales);

    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://yoga.example.com/it",
      "https://yoga.example.com/en",
    ]);
    expect(sitemap[0]?.alternates).toEqual({
      languages: {
        it: "https://yoga.example.com/it",
        en: "https://yoga.example.com/en",
        "x-default": "https://yoga.example.com",
      },
    });
  });
});
