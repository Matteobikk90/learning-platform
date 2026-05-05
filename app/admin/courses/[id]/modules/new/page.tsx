import Link from "next/link";
import { notFound } from "next/navigation";

import { createModule } from "@/features/modules/actions";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

type NewModulePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewModulePage({ params }: NewModulePageProps) {
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

      <form action={createModule} className="mt-8 space-y-6">
        <input type="hidden" name="courseId" value={course.id} />

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            required
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Order</label>
          <input
            name="order"
            type="number"
            min="1"
            required
            placeholder="1"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Video playback ID</label>
          <input
            name="videoPlaybackId"
            required
            placeholder="temporary-playback-id"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Temporary field. Later this will come from Mux upload.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Duration seconds</label>
          <input
            name="durationSeconds"
            type="number"
            min="1"
            required
            placeholder="1200"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white">
          Create module
        </button>
      </form>
    </main>
  );
}
