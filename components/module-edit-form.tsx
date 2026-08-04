"use client";

import { SubmitButton } from "@/components/submit-button";
import { MAX_MODULE_DURATION_SECONDS } from "@/constants/modules";
import { updateModule } from "@/features/modules/actions";
import { useFormAction } from "@/hooks/use-form-action";
import type { ModuleEditFormProps } from "@/types/module";

export function ModuleEditForm({
  moduleId,
  title,
  order,
  durationSeconds,
}: ModuleEditFormProps) {
  const [state, formAction] = useFormAction(updateModule);

  return (
    <form action={formAction} className="mt-4 space-y-5">
      <input type="hidden" name="moduleId" value={moduleId} />
      <div>
        <label htmlFor="module-title" className="form-label">Titolo</label>
        <input
          id="module-title"
          name="title"
          required
          maxLength={160}
          defaultValue={state.values?.title ?? title}
          className="form-input"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="module-order" className="form-label">Ordine</label>
          <input
            id="module-order"
            name="order"
            type="number"
            min="1"
            required
            defaultValue={state.values?.order ?? order}
            className="form-input"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="module-duration" className="form-label">Durata (secondi)</label>
          <input
            id="module-duration"
            name="durationSeconds"
            type="number"
            min="0"
            max={MAX_MODULE_DURATION_SECONDS}
            required
            defaultValue={state.values?.durationSeconds ?? durationSeconds}
            className="form-input"
          />
          <p className="mt-2 text-xs text-subtle">
            Viene aggiornata automaticamente quando Mux prepara il video.
          </p>
        </div>
      </div>
      {state.error && (
        <p className="text-[0.8rem] text-danger" role="alert">{state.error}</p>
      )}
      <SubmitButton>Salva</SubmitButton>
    </form>
  );
}
