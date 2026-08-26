import { describe, expect, it } from "vitest";

import { COURSE_PUBLICATION_ACTIONS } from "@/constants/courses";
import { coursePublicationSchema } from "@/features/courses/schema";
import { canPublishCourse } from "@/functions/courses/can-publish-course";

describe("canPublishCourse", () => {
  it("requires at least one module", () => {
    expect(canPublishCourse([])).toBe(false);
  });

  it("requires every module to have a ready playback ID", () => {
    expect(
      canPublishCourse([
        { videoPlaybackId: "playback_1", videoPlaybackPolicy: "SIGNED" },
        { videoPlaybackId: null, videoPlaybackPolicy: "SIGNED" },
      ])
    ).toBe(false);
  });

  it("rejects ready modules with public playback", () => {
    expect(
      canPublishCourse([
        { videoPlaybackId: "playback_1", videoPlaybackPolicy: "PUBLIC" },
      ])
    ).toBe(false);
  });

  it("accepts a course when every module is ready and signed", () => {
    expect(
      canPublishCourse([
        { videoPlaybackId: "playback_1", videoPlaybackPolicy: "SIGNED" },
        { videoPlaybackId: "playback_2", videoPlaybackPolicy: "SIGNED" },
      ])
    ).toBe(true);
  });
});

describe("coursePublicationSchema", () => {
  it.each(Object.values(COURSE_PUBLICATION_ACTIONS))(
    "accepts the %s action",
    (publicationAction) => {
      expect(
        coursePublicationSchema.safeParse({
          courseId: "course_1",
          publicationAction,
        }).success
      ).toBe(true);
    }
  );

  it("rejects invalid IDs and actions", () => {
    expect(
      coursePublicationSchema.safeParse({
        courseId: "",
        publicationAction: "archive",
      }).success
    ).toBe(false);
  });
});
