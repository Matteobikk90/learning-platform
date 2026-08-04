import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { Link } from "@/i18n/navigation";
import { getCourseProgress } from "@/lib/course-progress";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function CoursesPage() {
  const session = await requireAuth();
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Profile"),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      purchases: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: "asc" },
                include: {
                  progress: {
                    where: { userId: session.user.id },
                    select: { completedAt: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect(getLocalizedPath(locale, "/login"));

  const courses = user.purchases.map((p) => p.course);

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">{t("eyebrow")}</span>
        <h1 className="page-title">{t("myCourses")}</h1>
        <p className="text-sm text-muted">{t("continue")}</p>
      </div>

      <div className="card">
        {courses.length === 0 ? (
          <div className="list-empty">
            <p className="font-display text-xl mb-1">{t("noCourses")}</p>
            <p className="text-sm">{t("noCoursesDescription")}</p>
          </div>
        ) : (
          courses.map((course) => {
            const progress = getCourseProgress(course.modules);

            return (
              <div key={course.id} className="list-row">
                <div>
                  <h3 className="list-row-title mb-0.5">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-muted mt-1">
                      {course.description}
                    </p>
                  )}
                  <p className="text-sm text-muted mt-2">
                    {t("progress", {
                      completed: progress.completedModules,
                      total: progress.totalModules,
                      percentage: progress.percentage,
                    })}
                  </p>
                  <div className="mt-3 h-1 w-48 rounded-full overflow-hidden bg-stroke">
                    <div
                      className="h-full rounded-full bg-petrol"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={`/profile/courses/${course.id}`}
                  className="btn-primary">
                  {t("goToCourse")}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
