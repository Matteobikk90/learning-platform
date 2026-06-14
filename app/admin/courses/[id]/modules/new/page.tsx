import { ModuleForm } from "@/components/module-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link
        href={`/admin/courses/${course.id}/modules`}
        className="back-link">
        ← Moduli
      </Link>

      <div className="mb-10">
        <span className="label-upper">{course.title}</span>
        <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
          Nuovo modulo
        </h1>
      </div>

      <div className="card p-8">
        <ModuleForm courseId={course.id} />
      </div>
    </main>
  );
}
