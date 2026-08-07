import { resolveAppUrl } from "@/functions/environment/resolve-app-url";
import { describe, expect, it } from "vitest";

describe("resolveAppUrl", () => {
  it("keeps an explicitly configured public origin", () => {
    expect(
      resolveAppUrl({
        configuredUrl: "https://yoga.example.com/",
        vercelProductionUrl: "fallback.vercel.app",
      })
    ).toBe("https://yoga.example.com");
  });

  it("replaces a local production URL with the Vercel production domain", () => {
    expect(
      resolveAppUrl({
        configuredUrl: "http://localhost:3001",
        vercelEnvironment: "production",
        vercelProductionUrl: "yoga.example.com",
        vercelUrl: "deployment.vercel.app",
      })
    ).toBe("https://yoga.example.com");
  });

  it("uses the current deployment domain in Vercel previews", () => {
    expect(
      resolveAppUrl({
        configuredUrl: "http://127.0.0.1:3001",
        vercelEnvironment: "preview",
        vercelProductionUrl: "yoga.example.com",
        vercelUrl: "feature-branch.vercel.app",
      })
    ).toBe("https://feature-branch.vercel.app");
  });

  it("keeps localhost outside Vercel", () => {
    expect(
      resolveAppUrl({ configuredUrl: "http://localhost:3001" })
    ).toBe("http://localhost:3001");
  });

  it("rejects values that are not clean HTTP origins", () => {
    expect(() =>
      resolveAppUrl({ configuredUrl: "https://example.com/path" })
    ).toThrow("Application URL must be an HTTP(S) origin");
  });
});
