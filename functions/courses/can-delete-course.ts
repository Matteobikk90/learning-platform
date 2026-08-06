import type { CourseDeletionState } from "@/types/course";

export function canDeleteCourse({
  isPublished,
  publishedAt,
  purchaseCount,
}: CourseDeletionState): boolean {
  return !isPublished && publishedAt === null && purchaseCount === 0;
}
