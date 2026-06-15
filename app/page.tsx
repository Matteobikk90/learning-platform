import { Parallax } from "@/components/parallax";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  const [courses, purchases] = await Promise.all([
    prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        coverImageUrl: true,
      },
    }),
    user
      ? prisma.purchase.findMany({
          where: { userId: user.id },
          select: { courseId: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <Parallax
      courses={courses}
      purchasedIds={purchases.map((purchase) => purchase.courseId)}
    />
  );
}
