import { CourseCoverMedia } from "@/components/course-cover-media";
import { CoursePublicationControl } from "@/components/course-publication-control";
import { DeleteCourseButton } from "@/components/delete-course-button";
import { canDeleteCourse } from "@/functions/courses/can-delete-course";
import { canPublishCourse } from "@/functions/courses/can-publish-course";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { getTranslations } from "next-intl/server";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const t = await getTranslations("Admin");

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      coverImageUrl: true,
      isPublished: true,
      publishedAt: true,
      _count: { select: { purchases: true } },
      modules: {
        select: { videoPlaybackId: true, videoPlaybackPolicy: true },
      },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <span className="label-upper">Admin</span>
          <h1 className="page-title">{t("courses")}</h1>
          <p className="text-sm text-muted">{t("coursesListDescription")}</p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary">
          {t("newCourse")}
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <p className="list-empty">{t("noCourses")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => {
            const canDelete = canDeleteCourse({
              isPublished: course.isPublished,
              publishedAt: course.publishedAt,
              purchaseCount: course._count.purchases,
            });

            return (
              <article
                key={course.id}
                className="group rounded-xl border border-stroke bg-surface p-4 transition-colors hover:border-white/20 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-start">
                  <CourseCoverMedia
                    coverImageUrl={course.coverImageUrl}
                    sizes="176px"
                    className="w-full sm:w-44"
                  />
                  <div className="min-w-0 sm:py-1">
                    <h2 className="list-row-title mb-1">{course.title}</h2>
                    {course.description && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                        {course.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-muted">
                      €{(course.price / 100).toFixed(2)}
                    </p>
                    {!canDelete && (
                      <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-subtle">
                        {t("courseProtected")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-stroke pt-4 sm:justify-end">
                  <CoursePublicationControl
                    courseId={course.id}
                    isPublished={course.isPublished}
                    canPublish={canPublishCourse(course.modules)}
                  />
                  <DeleteCourseButton
                    courseId={course.id}
                    canDelete={canDelete}
                  />
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    title={t("editCourse")}
                    className="btn-secondary inline-flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="hidden sm:inline">{t("edit")}</span>
                  </Link>
                  <Link
                    href={`/admin/courses/${course.id}/modules`}
                    className="btn-primary">
                    {t("modules")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
