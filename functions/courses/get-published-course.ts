import "server-only";

import { prisma } from "@/lib/prisma";

export function getPublishedCourse(courseId: string) {
  return prisma.course.findFirst({
    where: { id: courseId, isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
    },
  });
}
