"use client";

import { deleteCourse } from "@/features/courses/delete-actions";
import { useTranslations } from "next-intl";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const t = useTranslations("Forms");

  return (
    <form
      action={deleteCourse}
      onSubmit={(e) => {
        if (
          !window.confirm(t("deleteCourseConfirm"))
        )
          e.preventDefault();
      }}>
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        title={t("deleteCourse")}
        className="btn-danger inline-flex items-center gap-2 px-3">
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
        <span className="hidden sm:inline">{t("delete")}</span>
      </button>
    </form>
  );
}
