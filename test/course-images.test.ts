import { beforeAll, describe, expect, it } from "vitest";

import { getCourseImagePath } from "@/lib/course-images";

const STORAGE_ORIGIN = "https://project.supabase.co";

beforeAll(() => {
  process.env.SUPABASE_URL = STORAGE_ORIGIN;
});

describe("getCourseImagePath", () => {
  it("extracts the object path from a platform image URL", () => {
    expect(
      getCourseImagePath(
        `${STORAGE_ORIGIN}/storage/v1/object/public/course-images/cover.webp`
      )
    ).toBe("cover.webp");
  });

  it("decodes encoded object names", () => {
    expect(
      getCourseImagePath(
        `${STORAGE_ORIGIN}/storage/v1/object/public/course-images/my%20cover.webp`
      )
    ).toBe("my cover.webp");
  });

  it("rejects URLs from other origins", () => {
    expect(
      getCourseImagePath(
        "https://evil.example.com/storage/v1/object/public/course-images/x.webp"
      )
    ).toBeNull();
  });

  it("rejects same-origin URLs outside the public bucket path", () => {
    expect(
      getCourseImagePath(`${STORAGE_ORIGIN}/storage/v1/object/sign/secret.webp`)
    ).toBeNull();
  });

  it("rejects empty and malformed values", () => {
    expect(getCourseImagePath(null)).toBeNull();
    expect(getCourseImagePath(undefined)).toBeNull();
    expect(getCourseImagePath("not a url")).toBeNull();
  });
});
