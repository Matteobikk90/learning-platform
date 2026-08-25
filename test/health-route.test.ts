import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryRawMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRawMock } }));

import { GET } from "@/app/api/health/route";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/health", () => {
  it("reports an available application when the database responds", async () => {
    queryRawMock.mockResolvedValue([{ result: 1 }]);

    const response = await GET();

    expect(queryRawMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("fails closed without exposing the database error", async () => {
    const databaseError = new Error("postgresql://secret@database/internal");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    queryRawMock.mockRejectedValue(databaseError);

    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(body).toBe('{"status":"unavailable"}');
    expect(body).not.toContain(databaseError.message);
    expect(consoleError).toHaveBeenCalledWith(
      "[health] Database check failed",
      { name: "Error" }
    );
  });
});
