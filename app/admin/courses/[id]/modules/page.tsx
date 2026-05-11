import { formatDuration } from "@/lib/format-duration";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

type ModulesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ModulesPage({ params }: ModulesPageProps) {
  await requireAdmin();

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    include: {
      modules: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Course modules</p>
          <h1 className="text-3xl font-bold">{course.title}</h1>
        </div>

        <Link
          href={`/admin/courses/${course.id}/modules/new`}
          className="rounded-md bg-black px-4 py-2 text-white">
          New module
        </Link>
      </div>

      <div className="rounded-lg border">
        {course.modules.length === 0 ? (
          <p className="p-6 text-gray-600">No modules yet.</p>
        ) : (
          <div className="divide-y">
            {course.modules.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between p-6">
                <div>
                  <h2 className="font-semibold">
                    {module.order}. {module.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    {module.videoPlaybackId
                      ? "Video ready"
                      : module.muxUploadId
                      ? "Video processing"
                      : "No video uploaded"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    {formatDuration(module.durationSeconds)}
                  </div>

                  <Link
                    href={`/admin/courses/${course.id}/modules/${module.id}`}
                    className="rounded-md border px-3 py-2 text-sm">
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
