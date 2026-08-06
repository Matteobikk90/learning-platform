import type { CoursePublicationModule } from "@/types/course";

export function canPublishCourse(
  modules: readonly CoursePublicationModule[]
): boolean {
  return (
    modules.length > 0 &&
    modules.every((courseModule) => Boolean(courseModule.videoPlaybackId))
  );
}
