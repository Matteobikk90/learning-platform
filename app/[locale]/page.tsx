import { Parallax } from "@/components/parallax";
import { Footer } from "@/components/footer";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/session";

export default async function Home() {
  const [session, courses] = await Promise.all([
    getAppSession(),
    prisma.course.findMany({
      where: { isPublished: true },
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
        where: {
          ...ACTIVE_PURCHASE_FILTER,
          userId: session.user.id,
          course: { isPublished: true },
        },
        select: { courseId: true },
      })
    : [];

  return (
    <Parallax
      courses={courses}
      footer={<Footer className="parallax-footer" />}
      purchasedIds={purchases.map((purchase) => purchase.courseId)}
    />
  );
}
