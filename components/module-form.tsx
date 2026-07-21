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
        <label className="form-label">Titolo</label>
        <input name="title" required className="form-input" />
      </div>

      <div>
        <label className="form-label">Ordine</label>
        <input
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
