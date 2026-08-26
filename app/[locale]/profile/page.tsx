import { CourseCoverMedia } from "@/components/course-cover-media";
import { ProfileForm } from "@/components/profile-form";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { Link } from "@/i18n/navigation";
import { getCourseProgress } from "@/lib/course-progress";
import { prisma } from "@/lib/prisma";
import { requireLearner } from "@/lib/session";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const session = await requireLearner();
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

      {courses.length === 0 ? (
        <div className="card">
          <div className="list-empty">
            <p className="font-display text-xl mb-1">{t("noCourses")}</p>
            <p className="text-sm">{t("noCoursesDescription")}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => {
            const progress = getCourseProgress(course.modules);

            return (
              <article
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-stroke bg-surface transition-colors hover:border-white/20">
                <CourseCoverMedia
                  coverImageUrl={course.coverImageUrl}
                  sizes="(max-width: 767px) calc(100vw - 3rem), 480px"
                  className="w-full rounded-none border-0 border-b border-stroke"
                />

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="list-row-title">{course.title}</h3>
                  {course.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                      {course.description}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-muted">
                    {t("progress", {
                      completed: progress.completedModules,
                      total: progress.totalModules,
                      percentage: progress.percentage,
                    })}
                  </p>
                  <div
                    className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stroke"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress.percentage}>
                    <div
                      className="h-full rounded-full bg-petrol"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  <div className="mt-auto pt-6">
                    <Link
                      href={`/profile/courses/${course.id}`}
                      className="btn-primary w-full text-center sm:w-auto">
                      {t("goToCourse")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
