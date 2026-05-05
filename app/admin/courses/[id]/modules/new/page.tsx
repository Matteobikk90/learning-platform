import { ModuleForm } from "@/components/module-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewModulePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-10">
      <div>
        <Link
          href={`/admin/courses/${course.id}/modules`}
          className="text-sm text-gray-600">
          ← Back to modules
        </Link>

        <h1 className="mt-4 text-3xl font-bold">New module</h1>
        <p className="mt-2 text-gray-600">{course.title}</p>
      </div>

      <ModuleForm courseId={course.id} />
    </main>
  );
}
