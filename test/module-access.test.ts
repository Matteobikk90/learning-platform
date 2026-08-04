import { describe, expect, it } from "vitest";

import { getUnlockDate, isModuleUnlocked } from "@/lib/module-access";

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

describe("isModuleUnlocked", () => {
  it("unlocks the first module unconditionally", () => {
    expect(
      isModuleUnlocked({ isFirstModule: true, previousCompletedAt: null })
    ).toBe(true);
  });

  it("keeps a module locked while the previous one is incomplete", () => {
    expect(
      isModuleUnlocked({ isFirstModule: false, previousCompletedAt: null })
    ).toBe(false);
    expect(
      isModuleUnlocked({ isFirstModule: false, previousCompletedAt: undefined })
    ).toBe(false);
  });

  it("keeps a module locked before ten days have passed", () => {
    const completedAt = new Date(Date.now() - TEN_DAYS_MS + 60_000);

    expect(
      isModuleUnlocked({ isFirstModule: false, previousCompletedAt: completedAt })
    ).toBe(false);
  });

  it("unlocks a module once ten days have passed", () => {
    const completedAt = new Date(Date.now() - TEN_DAYS_MS - 1_000);

    expect(
      isModuleUnlocked({ isFirstModule: false, previousCompletedAt: completedAt })
    ).toBe(true);
  });
});

describe("getUnlockDate", () => {
  it("returns completion date plus ten days", () => {
    const completedAt = new Date("2026-01-01T00:00:00.000Z");

    expect(getUnlockDate(completedAt).toISOString()).toBe(
      "2026-01-11T00:00:00.000Z"
    );
  });
});
