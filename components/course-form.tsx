"use client";

import { CourseImageUpload } from "@/components/course-image-upload";
import { SubmitButton } from "@/components/submit-button";
import { useFormAction } from "@/hooks/use-form-action";
import type { CourseFormProps } from "@/types/course";

export function CourseForm({
  action,
  defaults,
  submitLabel,
  pendingLabel,
}: CourseFormProps) {
  const [state, formAction] = useFormAction(action);

  return (
    <form action={formAction} className="space-y-6">
      {defaults && <input type="hidden" name="id" value={defaults.id} />}

      <div>
        <label htmlFor="course-title" className="form-label">Titolo</label>
        <input
          id="course-title"
          name="title"
          required
          maxLength={120}
          defaultValue={state.values?.title ?? defaults?.title ?? ""}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="course-description" className="form-label">Descrizione</label>
        <textarea
          id="course-description"
          name="description"
          rows={4}
          defaultValue={state.values?.description ?? defaults?.description ?? ""}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="course-price" className="form-label">Prezzo (€)</label>
        <input
          id="course-price"
          name="price"
          type="number"
          min="0.50"
          step="0.01"
          required
          placeholder={defaults ? undefined : "49.99"}
          defaultValue={
            state.values?.price ??
            (defaults ? (defaults.price / 100).toFixed(2) : "")
          }
          className="form-input"
        />
      </div>

      <div>
        <span className="form-label">Immagine di copertina</span>
        <CourseImageUpload defaultUrl={defaults?.coverImageUrl} />
      </div>

      {state.error && (
        <p className="text-[0.8rem] text-danger" role="alert">{state.error}</p>
      )}

      <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
    </form>
  );
}
