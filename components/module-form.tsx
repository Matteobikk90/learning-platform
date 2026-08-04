"use client";

import { SubmitButton } from "@/components/submit-button";
import { createModule } from "@/features/modules/actions";
import { useFormAction } from "@/hooks/use-form-action";
import type { ModuleFormProps } from "@/types/module";

export function ModuleForm({ courseId }: ModuleFormProps) {
  const [state, formAction] = useFormAction(createModule);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="courseId" value={courseId} />

      <div>
        <label htmlFor="module-title" className="form-label">Titolo</label>
        <input
          id="module-title"
          name="title"
          required
          maxLength={160}
          defaultValue={state.values?.title ?? ""}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="module-order" className="form-label">Ordine</label>
        <input
          id="module-order"
          name="order"
          type="number"
          min="1"
          required
          placeholder="1"
          defaultValue={state.values?.order ?? ""}
          className="form-input"
        />
      </div>

      {state.error && (
        <p className="text-[0.8rem] text-danger" role="alert">{state.error}</p>
      )}

      <SubmitButton pendingLabel="Creazione…">
        Crea modulo
      </SubmitButton>
    </form>
  );
}
