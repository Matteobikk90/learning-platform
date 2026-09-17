import { describe, expect, it } from "vitest";

import { getScrollProgress } from "@/functions/home/get-scroll-progress";

describe("getScrollProgress", () => {
  it.each([
    ["before the start", -100, 400, 0],
    ["at the start", 0, 400, 0],
    ["halfway through", 200, 400, 0.5],
    ["at the end", 400, 400, 1],
    ["beyond the end", 500, 400, 1],
    ["with no scrollable distance", 100, 0, 0],
    ["with a negative distance", 100, -400, 0],
  ])("returns the expected progress %s", (_label, offset, distance, expected) => {
    expect(getScrollProgress(offset, distance)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "returns zero when either input is %s",
    (invalid) => {
      expect(getScrollProgress(invalid, 400)).toBe(0);
      expect(getScrollProgress(200, invalid)).toBe(0);
    }
  );
});
