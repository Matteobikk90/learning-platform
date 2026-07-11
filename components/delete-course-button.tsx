"use client";

import { deleteCourse } from "@/features/courses/delete-actions";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  return (
    <form
      action={deleteCourse}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Eliminare il corso e tutti i suoi moduli? L'operazione non può essere annullata."
          )
        )
          e.preventDefault();
      }}>
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        title="Elimina corso"
        className="inline-flex items-center gap-2 shrink-0 rounded-md border border-red-300 px-3 py-2.25 font-mono text-[0.75rem] font-bold tracking-[0.12em] uppercase text-red-600 transition-colors duration-150 hover:border-red-400 hover:bg-red-50 cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        <span className="hidden sm:inline">Elimina</span>
      </button>
    </form>
  );
}
