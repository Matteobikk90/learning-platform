import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  rateLimitBucket: { deleteMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("next/server", () => ({
  after: (callback: () => unknown) => void callback(),
}));

import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";

process.env.AUTH_SECRET = "test-secret";

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.rateLimitBucket.deleteMany.mockResolvedValue({ count: 0 });
});

describe("consumeRateLimit", () => {
  const params = {
    scope: "test",
    value: "User@Example.com",
    limit: 3,
    windowSeconds: 900,
  };

  it("allows requests within the limit", async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      { count: 3, resetAt: new Date(Date.now() + 600_000) },
    ]);

    const result = await consumeRateLimit(params);

    expect(result.allowed).toBe(true);
  });

  it("blocks requests over the limit and reports a positive retry delay", async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      { count: 4, resetAt: new Date(Date.now() + 600_000) },
    ]);

    const result = await consumeRateLimit(params);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(600);
  });

  it("never reports a retry delay below one second", async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      { count: 4, resetAt: new Date(Date.now() - 5_000) },
    ]);

    const result = await consumeRateLimit(params);

    expect(result.retryAfterSeconds).toBe(1);
  });

  it("fails closed when the bucket row is missing", async () => {
    prismaMock.$queryRaw.mockResolvedValue([]);

    await expect(consumeRateLimit(params)).rejects.toThrow();
  });

  it("hashes the bucket key instead of storing the raw identifier", async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      { count: 1, resetAt: new Date(Date.now() + 600_000) },
    ]);

    await consumeRateLimit(params);

    const values = prismaMock.$queryRaw.mock.calls[0]?.slice(1) ?? [];
    const serialized = values.map(String).join(" ");

    expect(serialized).not.toContain("User@Example.com");
    expect(serialized).not.toContain("user@example.com");
  });

  it("schedules pruning of expired buckets", async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      { count: 1, resetAt: new Date(Date.now() + 600_000) },
    ]);

    await consumeRateLimit(params);

    expect(prismaMock.rateLimitBucket.deleteMany).toHaveBeenCalledOnce();
  });
});

describe("getRequestIp", () => {
  function requestWithHeaders(headers: Record<string, string>) {
    return new Request("http://localhost/api/auth/signin/email", {
      method: "POST",
      headers,
    });
  }

  it("uses the first x-forwarded-for entry", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
    });

    expect(getRequestIp(request)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const request = requestWithHeaders({ "x-real-ip": "203.0.113.9" });

    expect(getRequestIp(request)).toBe("203.0.113.9");
  });

  it("falls back to a shared bucket when no header is present", () => {
    expect(getRequestIp(requestWithHeaders({}))).toBe("unknown");
  });
});
