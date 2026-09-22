import "server-only";
import { cache } from "react";

import { PUBLIC_CATALOG_COURSE_FILTER } from "@/constants/courses";
import { prisma } from "@/lib/prisma";

export const getPublishedCourse = cache(async (courseId: string) => {
  return prisma.course.findFirst({
    where: { ...PUBLIC_CATALOG_COURSE_FILTER, id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      coverImageUrl: true,
    },
  });
});
