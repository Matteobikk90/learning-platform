"use client";

import { createModule } from "@/features/modules/actions";

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

      <div>
        <label className="form-label">Durata (secondi)</label>
        <input
          name="durationSeconds"
          type="number"
          min="1"
          required
          placeholder="1200"
          className="form-input"
        />
      </div>

      <button type="submit" className="btn-primary">
        Crea modulo
      </button>
    </form>
  );
}
