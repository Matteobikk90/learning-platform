import { createCourse } from "@/features/courses/actions";
import { requireAdmin } from "@/lib/session";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-2xl p-10">
      <h1 className="text-3xl font-bold">New course</h1>

      <form action={createCourse} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            required
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={4}
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Price (€)</label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="49.99"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white">
          Create course
        </button>
      </form>
    </main>
  );
}
