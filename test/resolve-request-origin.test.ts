import { resolveRequestOrigin } from "@/functions/environment/resolve-request-origin";
import { describe, expect, it } from "vitest";

describe("resolveRequestOrigin", () => {
  it("returns the browser origin when it matches the forwarded host", () => {
    const headers = new Headers({
      origin: "https://yoga.example.com",
      "x-forwarded-host": "yoga.example.com",
    });

    expect(resolveRequestOrigin(headers)).toBe("https://yoga.example.com");
  });

  it("supports forwarded host lists", () => {
    const headers = new Headers({
      origin: "https://preview.vercel.app",
      "x-forwarded-host": "preview.vercel.app, internal.proxy",
    });

    expect(resolveRequestOrigin(headers)).toBe("https://preview.vercel.app");
  });

  it("rejects origins that do not match the request host", () => {
    const headers = new Headers({
      host: "yoga.example.com",
      origin: "https://attacker.example.com",
    });

    expect(resolveRequestOrigin(headers)).toBeUndefined();
  });
});
