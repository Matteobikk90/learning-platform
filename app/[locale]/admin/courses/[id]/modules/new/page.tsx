import { ModuleForm } from "@/components/module-form";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { CourseRouteProps } from "@/types/routes";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function NewModulePage({ params }: CourseRouteProps) {
  await requireAdmin();
  const t = await getTranslations("Admin");

  const { id } = await params;

  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link
        href={`/admin/courses/${course.id}/modules`}
        className="back-link">
        ← {t("modules")}
      </Link>

      <div className="mb-10">
        <span className="label-upper">{course.title}</span>
        <h1 className="page-title">{t("newModule")}</h1>
      </div>

      <div className="card p-8">
        <ModuleForm courseId={course.id} />
      </div>
    </main>
  );
}
