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
          "Sei sicuro di voler eliminare questo modulo? L'operazione non può essere annullata."
        );
        if (!confirmed) event.preventDefault();
      }}>
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        className="btn-danger">
        Elimina modulo
      </button>
    </form>
  );
}
