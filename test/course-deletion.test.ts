import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { canDeleteCourse } from "@/functions/courses/can-delete-course";
import { isCourseDeleteRestrictedError } from "@/functions/courses/is-course-delete-restricted-error";

describe("canDeleteCourse", () => {
  it("allows deleting a draft that was never published or purchased", () => {
    expect(
      canDeleteCourse({
        isPublished: false,
        publishedAt: null,
        purchaseCount: 0,
      })
    ).toBe(true);
  });

  it.each([
    {
      isPublished: true,
      publishedAt: null,
      purchaseCount: 0,
    },
    {
      isPublished: false,
      publishedAt: new Date("2026-08-06T12:00:00.000Z"),
      purchaseCount: 0,
    },
    {
      isPublished: false,
      publishedAt: null,
      purchaseCount: 1,
    },
  ])("protects published or purchased courses", (course) => {
    expect(canDeleteCourse(course)).toBe(false);
  });
});

describe("isCourseDeleteRestrictedError", () => {
  it("recognizes a foreign-key restriction", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Foreign key constraint failed",
      { code: "P2003", clientVersion: "7.8.0" }
    );

    expect(isCourseDeleteRestrictedError(error)).toBe(true);
  });

  it("does not mask unrelated database or runtime errors", () => {
    const uniqueError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "7.8.0" }
    );

    expect(isCourseDeleteRestrictedError(uniqueError)).toBe(false);
    expect(isCourseDeleteRestrictedError(new Error("network error"))).toBe(
      false
    );
  });
});
