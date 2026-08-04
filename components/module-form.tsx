"use client";

import { createModule } from "@/features/modules/actions";
import { SubmitButton } from "@/components/submit-button";

type ModuleFormProps = {
  courseId: string;
};

export function ModuleForm({ courseId }: ModuleFormProps) {
  return (
    <form action={createModule} className="space-y-6">
      <input type="hidden" name="courseId" value={courseId} />

      <div>
        <label htmlFor="module-title" className="form-label">Titolo</label>
        <input id="module-title" name="title" required maxLength={160} className="form-input" />
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
          className="form-input"
        />
      </div>

      <SubmitButton pendingLabel="Creazione…">
        Crea modulo
      </SubmitButton>
    </form>
  );
}
