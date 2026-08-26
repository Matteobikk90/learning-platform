import "server-only";

import { PUBLIC_CATALOG_COURSE_FILTER } from "@/constants/courses";
import { prisma } from "@/lib/prisma";

export function getPublishedCourse(courseId: string) {
  return prisma.course.findFirst({
    where: { ...PUBLIC_CATALOG_COURSE_FILTER, id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
    },
  });
}
