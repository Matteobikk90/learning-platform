import { describe, expect, it } from "vitest";

import { profileFormSchema } from "@/features/profile/schema";

describe("profileFormSchema", () => {
  it("trims a valid name", () => {
    expect(profileFormSchema.parse({ name: "  Mario Rossi  " })).toEqual({
      name: "Mario Rossi",
    });
  });

  it.each(["", "   ", null])("stores an empty name as null", (name) => {
    expect(profileFormSchema.parse({ name })).toEqual({ name: null });
  });

  it("rejects names longer than 120 characters", () => {
    const result = profileFormSchema.safeParse({ name: "a".repeat(121) });

    expect(result.success).toBe(false);
  });
});
