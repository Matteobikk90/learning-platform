import { COURSE_PRESENTATIONS } from "@/constants/course-presentations";

export function getCoursePresentation(title: string) {
  const normalizedTitle = title.trim().toLowerCase();

  return COURSE_PRESENTATIONS.find(({ courseTitles }) =>
    courseTitles.some((courseTitle) => courseTitle.toLowerCase() === normalizedTitle)
  );
}
