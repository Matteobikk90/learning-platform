import type { CoursePresentationConfig } from "@/types/course-presentation";

export const YOGA_PRESENTATION = {
  courseTitles: ["Yoga su misura", "Tailored Yoga"],
  namespace: "Yoga",
  video: {
    src: "/videos/yoga-su-misura.mp4",
    poster: "/images/home/yoga-su-misura-poster.jpg",
  },
} as const satisfies CoursePresentationConfig;

export const COURSE_PRESENTATIONS: readonly CoursePresentationConfig[] = [
  YOGA_PRESENTATION,
];
