import { ProfileForm } from "@/components/profile-form";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { Link } from "@/i18n/navigation";
import { getCourseProgress } from "@/lib/course-progress";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const session = await requireAuth();
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Profile"),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      purchases: {
        where: ACTIVE_PURCHASE_FILTER,
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

  const courses = Array.from(
    new Map(user.purchases.map(({ course }) => [course.id, course])).values()
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">{t("eyebrow")}</span>
        <h1 className="page-title">{t("title")}</h1>
        <p className="text-sm text-muted">{t("description")}</p>
      </div>

      <div className="mb-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card p-7 sm:p-8" aria-labelledby="account-title">
          <h2 id="account-title" className="mb-6 font-display text-2xl">
            {t("accountDetails")}
          </h2>
          <ProfileForm email={user.email} name={user.name ?? ""} />
        </section>

        <section className="card p-7 sm:p-8" aria-labelledby="billing-title">
          <span className="label-upper">{t("billingEyebrow")}</span>
          <h2 id="billing-title" className="mb-4 font-display text-2xl">
            {t("billingTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            {t("billingDescription")}
          </p>
          <div className="mt-7 border-t border-stroke pt-5">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-subtle">
              {t("billingProvider")}
            </p>
            <Link
              href="/profile/purchases"
              className="mt-4 inline-flex text-xs text-white underline underline-offset-4">
              {t("viewPurchases")}
            </Link>
          </div>
        </section>
      </div>

      <div className="mb-7">
        <h2 className="font-display text-3xl">{t("myCourses")}</h2>
        <p className="mt-2 text-sm text-muted">{t("continue")}</p>
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
