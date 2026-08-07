import { describe, expect, it } from "vitest";

import { ADMIN_USER_SEARCH_MAX_LENGTH } from "@/constants/admin";
import { getAdminPageHref } from "@/functions/admin/get-admin-page-href";
import { getAdminUserWhere } from "@/functions/admin/get-admin-user-where";
import { normalizeAdminSearch } from "@/functions/admin/normalize-admin-search";

describe("normalizeAdminSearch", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeAdminSearch("  Mario   Rossi  ")).toBe("Mario Rossi");
  });

  it("rejects repeated query parameters", () => {
    expect(normalizeAdminSearch(["Mario", "Rossi"])).toBe("");
  });

  it("limits manually crafted long queries", () => {
    expect(normalizeAdminSearch("a".repeat(500))).toHaveLength(
      ADMIN_USER_SEARCH_MAX_LENGTH
    );
  });
});

describe("getAdminPageHref", () => {
  it("creates a page-only URL", () => {
    expect(
      getAdminPageHref({ basePath: "/admin/purchases", page: 2 })
    ).toBe("/admin/purchases?page=2");
  });

  it("preserves and encodes the user search", () => {
    expect(
      getAdminPageHref({
        basePath: "/admin/users",
        page: 3,
        query: "mario+rossi@example.com",
      })
    ).toBe("/admin/users?page=3&q=mario%2Brossi%40example.com");
  });
});

describe("getAdminUserWhere", () => {
  it("does not add filters without a search", () => {
    expect(getAdminUserWhere("")).toEqual({});
  });

  it("searches name and email case-insensitively", () => {
    expect(getAdminUserWhere("Mario")).toEqual({
      OR: [
        { email: { contains: "Mario", mode: "insensitive" } },
        { name: { contains: "Mario", mode: "insensitive" } },
      ],
    });
  });
});
