import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  module: {
    updateMany: vi.fn(),
  },
}));

const muxMock = vi.hoisted(() => ({
  video: {
    assets: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/mux", () => ({ getMux: () => muxMock }));

import { MAX_MODULE_DURATION_SECONDS } from "@/constants/modules";
import {
  normalizeMuxDuration,
  syncModuleMuxDuration,
} from "@/functions/mux/duration";

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.module.updateMany.mockResolvedValue({ count: 1 });
});

describe("Mux duration", () => {
  it("rounds valid durations and bounds unrealistic values", () => {
    expect(normalizeMuxDuration(91.2)).toBe(92);
    expect(normalizeMuxDuration(Number.NaN)).toBeUndefined();
    expect(normalizeMuxDuration(MAX_MODULE_DURATION_SECONDS + 1)).toBe(
      MAX_MODULE_DURATION_SECONDS
    );
  });

  it("repairs a ready module whose duration is still zero", async () => {
    muxMock.video.assets.retrieve.mockResolvedValue({ duration: 91.2 });

    await expect(
      syncModuleMuxDuration("module_1", "asset_1", 0)
    ).resolves.toBe(92);
    expect(prismaMock.module.updateMany).toHaveBeenCalledWith({
      where: {
        id: "module_1",
        muxAssetId: "asset_1",
        durationSeconds: { lte: 0 },
      },
      data: { durationSeconds: 92 },
    });
  });

  it("does not contact Mux when the duration is already stored", async () => {
    await expect(
      syncModuleMuxDuration("module_1", "asset_1", 120)
    ).resolves.toBe(120);
    expect(muxMock.video.assets.retrieve).not.toHaveBeenCalled();
    expect(prismaMock.module.updateMany).not.toHaveBeenCalled();
  });
});
