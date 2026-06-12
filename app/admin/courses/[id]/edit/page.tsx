import { updateCourse } from "@/app/admin/courses/[id]/edit/update-course";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
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
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="mb-8 text-3xl font-bold">Edit course</h1>

      <form action={updateCourse} className="space-y-6">
        <input type="hidden" name="id" value={course.id} />

        <div>
          <label className="mb-2 block text-sm font-medium">Title</label>
          <input
            name="title"
            defaultValue={course.title}
            className="w-full rounded border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={course.description ?? ""}
            className="min-h-30 w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Price (cents)
          </label>
          <input
            type="number"
            name="price"
            defaultValue={course.price}
            className="w-full rounded border p-3"
            required
          />
        </div>

        <button type="submit" className="rounded bg-black px-5 py-3 text-white">
          Save changes
        </button>
      </form>
    </main>
  );
}
