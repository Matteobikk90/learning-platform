import { Parallax } from "@/components/parallax";
import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/session";

export default async function Home() {
  const [session, courses] = await Promise.all([
    getAppSession(),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        coverImageUrl: true,
      },
    }),
  ]);

  const purchases = session?.user.id
    ? await prisma.purchase.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      })
    : [];

  return (
    <Parallax
      courses={courses}
      purchasedIds={purchases.map((purchase) => purchase.courseId)}
    />
  );
}
