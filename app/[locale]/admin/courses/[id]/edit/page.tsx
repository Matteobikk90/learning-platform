import { updateCourse } from "@/features/courses/actions";
import { CourseForm } from "@/components/course-form";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { CourseRouteProps } from "@/types/routes";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function EditCoursePage({ params }: CourseRouteProps) {
  await requireAdmin();
  const t = await getTranslations("Admin");
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, title: true, description: true, price: true, coverImageUrl: true },
  });

  if (!course) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/admin/courses" className="back-link">
        ← {t("courses")}
      </Link>

      <div className="mb-10">
        <span className="label-upper">Admin</span>
        <h1 className="page-title">{t("editCourse")}</h1>
      </div>

      <div className="card p-8">
        <CourseForm
          action={updateCourse}
          defaults={course}
          submitLabel={t("saveChanges")}
        />
      </div>
    </main>
  );
}
