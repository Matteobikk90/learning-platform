import { beforeEach, describe, expect, it, vi } from "vitest";

const spawnSyncMock = vi.hoisted(() => vi.fn());

vi.mock("node:child_process", () => ({ spawnSync: spawnSyncMock }));

import { runProductionMigrations } from "@/functions/scripts/run-production-migrations";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runProductionMigrations", () => {
  it.each([undefined, "development", "preview"])(
    "skips migrations when VERCEL_ENV is %s",
    (vercelEnvironment) => {
      const runMigration = vi.fn();

      expect(
        runProductionMigrations(
          { VERCEL_ENV: vercelEnvironment },
          runMigration
        )
      ).toBe("skipped");
      expect(runMigration).not.toHaveBeenCalled();
    }
  );

  it("runs migrations exactly once in Vercel production", () => {
    const runMigration = vi.fn(() => ({ status: 0 }));

    expect(
      runProductionMigrations({ VERCEL_ENV: "production" }, runMigration)
    ).toBe("applied");
    expect(runMigration).toHaveBeenCalledOnce();
  });

  it("runs Prisma directly without a shell", () => {
    spawnSyncMock.mockReturnValue({ status: 0 });

    expect(runProductionMigrations({ VERCEL_ENV: "production" })).toBe(
      "applied"
    );
    expect(spawnSyncMock).toHaveBeenCalledWith(
      "prisma",
      ["migrate", "deploy"],
      { stdio: "inherit" }
    );
  });

  it("fails when Prisma exits unsuccessfully", () => {
    const runMigration = vi.fn(() => ({ status: 1 }));

    expect(() =>
      runProductionMigrations({ VERCEL_ENV: "production" }, runMigration)
    ).toThrow("prisma migrate deploy exited with status 1");
  });

  it("forwards command startup failures", () => {
    const commandError = new Error("command unavailable");
    const runMigration = vi.fn(() => ({ error: commandError, status: null }));

    expect(() =>
      runProductionMigrations({ VERCEL_ENV: "production" }, runMigration)
    ).toThrow(commandError);
  });
});
