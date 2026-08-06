import { describe, expect, it } from "vitest";

import { normalizeAdminPage } from "@/functions/admin/normalize-admin-page";

describe("normalizeAdminPage", () => {
  it.each([undefined, "", "0", "-1", "1.5", "page", ["2", "3"]])(
    "uses the first page for invalid input %j",
    (value) => {
      expect(normalizeAdminPage(value)).toBe(1);
    }
  );

  it("accepts a positive integer", () => {
    expect(normalizeAdminPage("12")).toBe(12);
  });

  it("rejects values outside the safe integer range", () => {
    expect(normalizeAdminPage("999999999999999999999")).toBe(1);
  });
});
