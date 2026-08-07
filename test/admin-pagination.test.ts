import { describe, expect, it } from "vitest";

import { getAdminPagination } from "@/functions/admin/get-admin-pagination";
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

describe("getAdminPagination", () => {
  it("calculates the current page and offset", () => {
    expect(
      getAdminPagination({ itemCount: 45, pageSize: 20, requestedPage: 2 })
    ).toEqual({ currentPage: 2, skip: 20, totalPages: 3 });
  });

  it("clamps requests beyond the final page", () => {
    expect(
      getAdminPagination({ itemCount: 21, pageSize: 20, requestedPage: 99 })
    ).toEqual({ currentPage: 2, skip: 20, totalPages: 2 });
  });

  it("keeps an empty result on page one", () => {
    expect(
      getAdminPagination({ itemCount: 0, pageSize: 20, requestedPage: 3 })
    ).toEqual({ currentPage: 1, skip: 0, totalPages: 1 });
  });

  it("falls back safely when the requested page is invalid", () => {
    expect(
      getAdminPagination({ itemCount: 30, pageSize: 20, requestedPage: NaN })
    ).toEqual({ currentPage: 1, skip: 0, totalPages: 2 });
  });

  it("rejects invalid page sizes", () => {
    expect(() =>
      getAdminPagination({ itemCount: 10, pageSize: 0, requestedPage: 1 })
    ).toThrow(RangeError);
  });
});
