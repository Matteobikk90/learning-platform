import { formatCoursePrice } from "@/functions/courses/format-course-price";
import { describe, expect, it } from "vitest";

describe("formatCoursePrice", () => {
  it("preserves cents in the Italian catalog and checkout", () => {
    expect(formatCoursePrice(4556, "it").replace(/\s/g, "")).toBe("45,56€");
  });

  it("preserves cents in the English catalog and checkout", () => {
    expect(formatCoursePrice(4556, "en").replace(/\s/g, "")).toBe("€45.56");
  });
});
