import { describe, expect, it } from "vitest";

import { YOGA_PRESENTATION } from "@/constants/course-presentations";
import { getCoursePresentation } from "@/functions/courses/get-course-presentation";

describe("curated course presentations", () => {
  it.each(["Yoga su misura", "YOGA SU MISURA", " Yoga su misura ", "Tailored Yoga"])(
    "connects the approved Yoga presentation to %s without depending on database IDs",
    (title) => {
      expect(getCoursePresentation(title)).toBe(YOGA_PRESENTATION);
    }
  );

  it.each(["NeuroBreathMethod", "Yoga", "Yoga su misura avanzato", ""])(
    "does not reuse the Yoga video for an unrelated course: %s",
    (title) => {
      expect(getCoursePresentation(title)).toBeUndefined();
    }
  );
});
