"use client";

import { SubmitButton } from "@/components/submit-button";
import { COURSE_PUBLICATION_ACTIONS } from "@/constants/courses";
import { updateCoursePublication } from "@/features/courses/publication-actions";
import { useFormAction } from "@/hooks/use-form-action";
import { cn } from "@/lib/cn";
import type { CoursePublicationControlProps } from "@/types/course";
import { useTranslations } from "next-intl";

export function CoursePublicationControl({
  canPublish,
  courseId,
  isPublished,
}: CoursePublicationControlProps) {
  const t = useTranslations("Admin");
  const [state, formAction] = useFormAction(updateCoursePublication);
  const action = isPublished
    ? COURSE_PUBLICATION_ACTIONS.unpublish
    : COURSE_PUBLICATION_ACTIONS.publish;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-[0.14em]",
            isPublished
              ? "bg-petrol/15 text-petrol"
              : "border border-stroke text-subtle"
          )}>
          {t(isPublished ? "published" : "draft")}
        </span>

        <form action={formAction}>
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="publicationAction" value={action} />
          {!isPublished && !canPublish ? (
            <button
              type="button"
              disabled
              title={t("publishRequirements")}
              className="btn-secondary cursor-not-allowed opacity-45">
              {t("publish")}
            </button>
          ) : (
            <SubmitButton
              className={isPublished ? "btn-secondary" : "btn-primary"}
              pendingLabel={t(isPublished ? "unpublishing" : "publishing")}>
              {t(isPublished ? "unpublish" : "publish")}
            </SubmitButton>
          )}
        </form>
      </div>

      {!isPublished && !canPublish && !state.error && (
        <p className="max-w-56 text-right text-xs leading-relaxed text-subtle">
          {t("publishRequirements")}
        </p>
      )}
      {state.error && (
        <p className="max-w-56 text-right text-xs text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          className="max-w-56 text-right text-xs text-petrol"
          aria-live="polite">
          {state.success}
        </p>
      )}
    </div>
  );
}
