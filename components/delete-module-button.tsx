"use client";

import { deleteModule } from "@/features/modules/delete-actions";

export function DeleteModuleButton({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}) {
  return (
    <form
      action={deleteModule}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this module? This action cannot be undone."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}>
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="courseId" value={courseId} />

      <button
        type="submit"
        className="rounded-md border border-red-500 px-4 py-2 text-sm text-red-600">
        Delete module
      </button>
    </form>
  );
}
