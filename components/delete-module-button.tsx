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
        className="inline-block shrink-0 rounded-md border border-red-300 px-5.5 py-2.25 font-mono text-[0.75rem] font-bold tracking-[0.12em] uppercase text-red-600 transition-colors duration-150 hover:border-red-400 hover:bg-red-50">
        Elimina modulo
      </button>
    </form>
  );
}
