import { describe, expect, it } from "vitest";

import {
  getObservedWatchedDelta,
  getWatchedDeltaToSave,
} from "@/functions/progress/get-watched-playback-delta";
import { getCourseProgress } from "@/lib/course-progress";

describe("module progress", () => {
  it("preserves the final fraction of a short video", () => {
    const regularDelta = getWatchedDeltaToSave(4.2);
    const finalDelta = getWatchedDeltaToSave(4.2 - regularDelta, true);

    expect(regularDelta + finalDelta).toBe(5);
  });

  it("does not count skipped playback as watched time", () => {
    expect(getObservedWatchedDelta(2, 3.2)).toBeCloseTo(1.2);
    expect(getObservedWatchedDelta(3.2, 20)).toBe(0);
    expect(getObservedWatchedDelta(20, 4)).toBe(0);
  });

  it("caps a single watched-time update", () => {
    expect(getWatchedDeltaToSave(45)).toBe(30);
  });

  it("derives course completion from completed modules", () => {
    expect(
      getCourseProgress([
        { id: "module-1", progress: [{ completedAt: new Date() }] },
      ])
    ).toEqual({
      totalModules: 1,
      completedModules: 1,
      percentage: 100,
    });
  });
});
