import { Parallax } from "@/components/parallax";
import { Footer } from "@/components/footer";
import { PUBLIC_CATALOG_COURSE_FILTER } from "@/constants/courses";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/session";

export default async function Home() {
  const [session, courses] = await Promise.all([
    getAppSession(),
    prisma.course.findMany({
      where: PUBLIC_CATALOG_COURSE_FILTER,
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
  const isAdmin = session?.user.role === "ADMIN";

  const purchases = session?.user.id && !isAdmin
    ? await prisma.purchase.findMany({
        where: {
          ...ACTIVE_PURCHASE_FILTER,
          userId: session.user.id,
          course: PUBLIC_CATALOG_COURSE_FILTER,
        },
        select: { courseId: true },
      })
    : [];

  return (
    <Parallax
      courses={courses}
      footer={<Footer className="parallax-footer" />}
      isAdmin={isAdmin}
      purchasedIds={purchases.map((purchase) => purchase.courseId)}
    />
  );
}
