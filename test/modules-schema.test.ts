import { describe, expect, it } from "vitest";

import {
  createModuleSchema,
  updateModuleSchema,
} from "@/features/modules/schema";

describe("createModuleSchema", () => {
  const validInput = { courseId: "course_1", title: "Modulo 1", order: "1" };

  it("coerces the order to an integer", () => {
    const parsed = createModuleSchema.parse(validInput);

    expect(parsed.order).toBe(1);
  });

  it("rejects a non-positive or fractional order", () => {
    expect(
      createModuleSchema.safeParse({ ...validInput, order: "0" }).success
    ).toBe(false);
    expect(
      createModuleSchema.safeParse({ ...validInput, order: "1.5" }).success
    ).toBe(false);
  });

  it("rejects a missing course reference", () => {
    expect(
      createModuleSchema.safeParse({ ...validInput, courseId: "" }).success
    ).toBe(false);
  });
});

describe("updateModuleSchema", () => {
  const validInput = {
    moduleId: "module_1",
    title: "Modulo 1",
    order: "2",
  };

  it("accepts a valid update", () => {
    const parsed = updateModuleSchema.parse(validInput);

    expect(parsed.order).toBe(2);
  });

  it("rejects oversized module identifiers", () => {
    expect(
      updateModuleSchema.safeParse({ ...validInput, moduleId: "x".repeat(129) })
        .success
    ).toBe(false);
  });
});
