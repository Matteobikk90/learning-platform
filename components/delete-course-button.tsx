"use client";

import { deleteCourse } from "@/features/courses/delete-actions";
import { useFormAction } from "@/hooks/use-form-action";
import type { DeleteCourseButtonProps } from "@/types/course";
import { useTranslations } from "next-intl";

export function DeleteCourseButton({
  canDelete,
  courseId,
}: DeleteCourseButtonProps) {
  const t = useTranslations("Forms");
  const [state, formAction, isPending] = useFormAction(deleteCourse);
  const disabled = !canDelete || isPending;

  return (
    <div className="flex flex-col items-start gap-2">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm(t("deleteCourseConfirm"))) {
            event.preventDefault();
          }
        }}>
        <input type="hidden" name="courseId" value={courseId} />
        <button
          type="submit"
          disabled={disabled}
          aria-disabled={disabled}
          title={canDelete ? t("deleteCourse") : t("deleteCourseProtected")}
          className="btn-danger inline-flex items-center gap-2 px-3 disabled:cursor-not-allowed disabled:opacity-40">
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
          <span className="hidden sm:inline">
            {t(isPending ? "deleting" : "delete")}
          </span>
        </button>
      </form>

      {state.error && (
        <p className="max-w-52 text-xs leading-relaxed text-danger" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
