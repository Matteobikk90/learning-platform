"use client";

import { createModule } from "@/features/modules/actions";

type ModuleFormProps = {
  courseId: string;
};

export function ModuleForm({ courseId }: ModuleFormProps) {
  return (
    <form action={createModule} className="mt-8 space-y-6">
      <input type="hidden" name="courseId" value={courseId} />

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
  );
}
